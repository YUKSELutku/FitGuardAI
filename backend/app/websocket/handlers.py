from __future__ import annotations

import base64
import json
import time
from typing import Any, Optional

import numpy as np
from fastapi import WebSocket, WebSocketDisconnect

from app.core.angle_calculator import angle_from_landmarks
from app.core.asymmetry_detector import compute_asymmetry
from app.core.pose_processor import PoseProcessor, PoseResult
from app.core.rep_counter import RepCounter
from app.core.safety_engine import SafetyEngine
from app.models.schemas import (
    AngleSnapshot,
    FrameResponse,
    LandmarkPoint,
)
from app.services import history as history_svc
from app.services.session import SessionStore

MIN_LANDMARK_CONFIDENCE = 0.3
MIN_FRAME_INTERVAL_MS = 1000 // 25  # cap at ~25 fps server-side


def _decode_image(b64: str) -> Optional[np.ndarray]:
    try:
        import cv2

        if "," in b64:
            b64 = b64.split(",", 1)[1]
        raw = base64.b64decode(b64)
        arr = np.frombuffer(raw, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def _compute_angles(
    exercise, pose: PoseResult
) -> dict[str, float]:
    lms = [
        (lm.x, lm.y, lm.z, lm.visibility) for lm in pose.landmarks
    ]
    result: dict[str, float] = {}
    for joint in exercise.tracked_joints:
        a_v = lms[joint.a][3]
        b_v = lms[joint.vertex][3]
        c_v = lms[joint.c][3]
        if min(a_v, b_v, c_v) < MIN_LANDMARK_CONFIDENCE:
            continue
        angle = angle_from_landmarks(lms, joint.a, joint.vertex, joint.c)
        if angle == angle:  # not NaN
            result[joint.name] = angle
    return result


class FrameProcessor:
    """Per-connection stateful pipeline: pose + angles + safety + rep counter."""

    def __init__(self, session_id: str, store: SessionStore):
        self.session_id = session_id
        self.store = store
        self.session = store.get(session_id)
        if self.session is None:
            raise ValueError(f"Unknown session: {session_id}")
        self.exercise = self.session.exercise
        self.pose = PoseProcessor()
        self.safety = SafetyEngine(safe_ranges=dict(self.session.effective_ranges))
        self.rep = RepCounter(config=self.exercise.rep_detection)
        self._last_processed_ms = 0

    def close(self) -> None:
        self.pose.close()

    def process(self, image_b64: str, ts_ms: int) -> FrameResponse:
        now_ms = int(time.time() * 1000)
        if now_ms - self._last_processed_ms < MIN_FRAME_INTERVAL_MS:
            return FrameResponse(
                ts_ms=ts_ms, visible=False, confidence=0.0,
            )
        self._last_processed_ms = now_ms

        img = _decode_image(image_b64)
        if img is None:
            return FrameResponse(ts_ms=ts_ms, visible=False, confidence=0.0)

        pose_result = self.pose.process_frame(img)
        if pose_result is None:
            return FrameResponse(ts_ms=ts_ms, visible=False, confidence=0.0)

        angles = _compute_angles(self.exercise, pose_result)
        alerts = self.safety.check(angles)
        form_score = self.safety.form_score(angles)

        rep_event = None
        joint_for_rep = self.exercise.rep_detection.joint_name
        if joint_for_rep in angles:
            rep_event = self.rep.update(angles[joint_for_rep])
        if rep_event is not None:
            rep_dict = rep_event.model_dump()
            self.session.rep_history.append(rep_dict)
            try:
                history_svc.save_rep(self.session.id, rep_dict)
            except Exception:
                pass
        self.session.form_scores.append(form_score)
        self.session.alert_count += sum(1 for a in alerts if a.level == "danger")

        asymmetry = compute_asymmetry(self.exercise, angles) if self.exercise.symmetry_check else None
        if asymmetry is not None:
            self.session.asymmetry_samples.append(asymmetry)
        if asymmetry is not None and asymmetry > 10.0:
            from app.models.schemas import Alert
            alerts.append(
                Alert(
                    level="warning",
                    joint="asymmetry",
                    message=f"Sağ/sol farkı {asymmetry:.0f}°",
                    angle=asymmetry,
                )
            )

        angle_snapshots = []
        for j, a in angles.items():
            lo, hi = self.session.effective_ranges.get(j, (0.0, 180.0))
            angle_snapshots.append(
                AngleSnapshot(joint=j, angle=a, in_safe_zone=(lo <= a <= hi), safe_min=lo, safe_max=hi)
            )

        landmarks = [
            LandmarkPoint(x=lm.x, y=lm.y, z=lm.z, visibility=lm.visibility)
            for lm in pose_result.landmarks
        ]

        return FrameResponse(
            ts_ms=ts_ms,
            visible=pose_result.visible,
            confidence=pose_result.confidence,
            landmarks=landmarks,
            angles=angle_snapshots,
            rep_count=self.rep.count,
            phase=self.rep.phase,
            alerts=alerts,
            form_score=form_score,
            rep_event=rep_event,
            asymmetry=asymmetry,
        )


async def session_ws(websocket: WebSocket, session_id: str, store: SessionStore) -> None:
    await websocket.accept()
    try:
        processor = FrameProcessor(session_id, store)
    except ValueError as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        await websocket.close()
        return

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg: dict[str, Any] = json.loads(raw)
            except json.JSONDecodeError:
                continue
            mtype = msg.get("type")

            if mtype == "frame":
                resp = processor.process(msg.get("image_b64", ""), int(msg.get("ts_ms", 0)))
                await websocket.send_text(resp.model_dump_json())
            elif mtype == "control":
                action = msg.get("action")
                if action == "reset":
                    processor.rep.reset()
                    await websocket.send_json({"type": "control_ack", "action": "reset"})
                elif action == "stop":
                    await websocket.send_json({"type": "control_ack", "action": "stop"})
                    break
            else:
                await websocket.send_json({"type": "error", "message": f"unknown message type: {mtype}"})
    except WebSocketDisconnect:
        pass
    finally:
        processor.close()
