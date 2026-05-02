from __future__ import annotations

import logging
import os
import time
import urllib.request
from dataclasses import dataclass
from enum import IntEnum
from typing import Optional

import numpy as np

_logger = logging.getLogger(__name__)

mp = None
vision = None
mp_python = None
_mp_import_error: Exception | None = None

try:
    import mediapipe as mp  # type: ignore
    from mediapipe.tasks import python as mp_python  # type: ignore
    from mediapipe.tasks.python import vision  # type: ignore
except Exception as e:  # pragma: no cover
    _mp_import_error = e
    _logger.exception("Failed to import mediapipe tasks API")


POSE_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
)
_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")


def _ensure_model() -> str:
    os.makedirs(_MODELS_DIR, exist_ok=True)
    path = os.path.abspath(os.path.join(_MODELS_DIR, "pose_landmarker_lite.task"))
    if not os.path.exists(path):
        _logger.info("Downloading pose landmarker model from %s", POSE_MODEL_URL)
        urllib.request.urlretrieve(POSE_MODEL_URL, path)
        _logger.info("Saved model to %s", path)
    return path


class PoseLandmark(IntEnum):
    NOSE = 0
    LEFT_EYE_INNER = 1
    LEFT_EYE = 2
    LEFT_EYE_OUTER = 3
    RIGHT_EYE_INNER = 4
    RIGHT_EYE = 5
    RIGHT_EYE_OUTER = 6
    LEFT_EAR = 7
    RIGHT_EAR = 8
    MOUTH_LEFT = 9
    MOUTH_RIGHT = 10
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_PINKY = 17
    RIGHT_PINKY = 18
    LEFT_INDEX = 19
    RIGHT_INDEX = 20
    LEFT_THUMB = 21
    RIGHT_THUMB = 22
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    LEFT_HEEL = 29
    RIGHT_HEEL = 30
    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32


@dataclass
class Landmark:
    x: float
    y: float
    z: float
    visibility: float

    def as_tuple(self) -> tuple[float, float, float]:
        return (self.x, self.y, self.z)


@dataclass
class PoseResult:
    landmarks: list[Landmark]
    confidence: float
    visible: bool

    def xyz(self) -> list[tuple[float, float, float]]:
        return [lm.as_tuple() for lm in self.landmarks]


class PoseProcessor:
    """Pose landmarker using the MediaPipe Tasks API (0.10.x+).

    Uses VIDEO running mode for stateful tracking across frames. The
    pose_landmarker_lite.task model (~3 MB) is downloaded on first run.
    """

    def __init__(
        self,
        min_pose_detection_confidence: float = 0.5,
        min_pose_presence_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        visibility_threshold: float = 0.5,
    ):
        if mp is None or vision is None or mp_python is None:
            raise RuntimeError(f"mediapipe not usable: {_mp_import_error!r}")

        model_path = _ensure_model()
        base_options = mp_python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=min_pose_detection_confidence,
            min_pose_presence_confidence=min_pose_presence_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        self._landmarker = vision.PoseLandmarker.create_from_options(options)
        self._visibility_threshold = visibility_threshold
        self._t0_ns = time.monotonic_ns()
        self._last_ts_ms = -1

    def _next_ts_ms(self) -> int:
        ts = (time.monotonic_ns() - self._t0_ns) // 1_000_000
        if ts <= self._last_ts_ms:
            ts = self._last_ts_ms + 1
        self._last_ts_ms = ts
        return int(ts)

    def process_frame(self, image_bgr: np.ndarray) -> Optional[PoseResult]:
        if image_bgr is None or image_bgr.size == 0:
            return None
        # MediaPipe wants RGB, contiguous
        image_rgb = np.ascontiguousarray(image_bgr[:, :, ::-1])
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        result = self._landmarker.detect_for_video(mp_image, self._next_ts_ms())

        if not result.pose_landmarks:
            return None

        # One pose (num_poses=1) → first element is List[NormalizedLandmark]
        lm_list = result.pose_landmarks[0]
        lms = [
            Landmark(
                x=lm.x,
                y=lm.y,
                z=lm.z,
                visibility=getattr(lm, "visibility", 1.0),
            )
            for lm in lm_list
        ]
        avg_vis = float(np.mean([lm.visibility for lm in lms]))
        return PoseResult(
            landmarks=lms,
            confidence=avg_vis,
            visible=avg_vis >= self._visibility_threshold,
        )

    def close(self) -> None:
        try:
            self._landmarker.close()
        except Exception:
            pass
