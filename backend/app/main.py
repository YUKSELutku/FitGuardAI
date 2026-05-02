from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ai.medgemma_client import MedGemmaClient
from app.ai.parser import parse_safe_ranges
from app.ai.prompts import SESSION_SUMMARY_PROMPT, build_safe_range_prompt
from app.config import settings
from app.exercises import get_exercise, list_exercises
from app.exercises.base import ExerciseConfig
from app.models.db import init_db
from app.models.schemas import (
    CalibrationResult,
    SafeRangeResponse,
    SessionSummary,
    SetupRequest,
)
from app.services import history as history_svc
from app.services.calibration import apply_calibration
from app.services.session import store as session_store
from app.websocket.handlers import session_ws

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="FitGuard AI", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mock_medgemma": str(settings.mock_medgemma)}


@app.get("/exercises", response_model=list[ExerciseConfig])
def exercises() -> list[ExerciseConfig]:
    return list_exercises()


@app.get("/exercises/{exercise_id}", response_model=ExerciseConfig)
def exercise_detail(exercise_id: str) -> ExerciseConfig:
    cfg = get_exercise(exercise_id)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Unknown exercise: {exercise_id}")
    return cfg


@app.post("/api/setup", response_model=SafeRangeResponse)
def setup_session(req: SetupRequest) -> SafeRangeResponse:
    exercise = get_exercise(req.exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail=f"Unknown exercise: {req.exercise_id}")

    from app.ai.parser import SafeRangePayload

    condition = (req.condition or "").strip()
    if not condition:
        # Fast path: no condition means no reason to query MedGemma.
        payload = SafeRangePayload(
            modified_ranges=dict(exercise.default_safe_ranges),
            reasoning="",
            warnings=[],
            alternatives=[],
        )
    else:
        prompt = build_safe_range_prompt(
            exercise_name=exercise.name,
            exercise_description=exercise.description,
            joints=[j.name for j in exercise.tracked_joints],
            default_ranges=exercise.default_safe_ranges,
            condition=condition,
        )
        llm_output = MedGemmaClient.instance().generate(prompt)
        payload = parse_safe_ranges(llm_output, exercise.default_safe_ranges)

    session = session_store.create(
        exercise=exercise,
        condition=req.condition,
        safe_ranges=payload.modified_ranges,
        reasoning=payload.reasoning,
        warnings=payload.warnings,
        alternatives=payload.alternatives,
    )
    history_svc.persist_session(session)

    return SafeRangeResponse(
        session_id=session.id,
        exercise_id=exercise.id,
        safe_ranges=payload.modified_ranges,
        reasoning=payload.reasoning,
        warnings=payload.warnings,
        alternatives=payload.alternatives,
    )


class CalibrationPayload(BaseModel):
    rep_samples: list[dict[str, tuple[float, float]]]


@app.post("/api/calibration/{session_id}", response_model=CalibrationResult)
def calibration(session_id: str, payload: CalibrationPayload) -> CalibrationResult:
    session = session_store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Unknown session")
    effective = apply_calibration(session, payload.rep_samples)
    return CalibrationResult(
        session_id=session.id,
        personal_rom=session.personal_rom,
        effective_ranges=effective,
    )


@app.post("/api/sessions/{session_id}/end")
def end_session(session_id: str) -> dict[str, Any]:
    session = session_store.end(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Unknown session")
    history_svc.persist_session(session)
    return {"session_id": session_id, "ended": True}


@app.get("/sessions")
def list_sessions_api() -> list[dict[str, Any]]:
    rows = history_svc.list_sessions()
    return [r.model_dump(mode="json") for r in rows]


@app.get("/sessions/{session_id}")
def session_detail(session_id: str) -> dict[str, Any]:
    row = history_svc.get_session(session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")
    reps = history_svc.get_reps(session_id)
    return {
        "session": row.model_dump(mode="json"),
        "reps": [r.model_dump(mode="json") for r in reps],
    }


@app.post("/sessions/{session_id}/summary", response_model=SessionSummary)
def session_summary(session_id: str) -> SessionSummary:
    mem = session_store.get(session_id)
    row = history_svc.get_session(session_id)
    if row is None and mem is None:
        raise HTTPException(status_code=404, detail="Not found")

    if mem is not None:
        exercise_name = mem.exercise.name
        condition = mem.condition or "(none)"
        rep_count = len(mem.rep_history)
        avg_form = sum(mem.form_scores) / len(mem.form_scores) if mem.form_scores else 0.0
        asym = (
            sum(mem.asymmetry_samples) / len(mem.asymmetry_samples)
            if mem.asymmetry_samples
            else 0.0
        )
        alert_count = mem.alert_count
        rep_data = mem.rep_history[-10:]
    else:
        exercise_name = row.exercise_id
        condition = row.condition or "(none)"
        rep_count = row.rep_count
        avg_form = row.avg_form_score
        asym = row.asymmetry_avg
        alert_count = row.alert_count
        rep_data = [r.model_dump(mode="json") for r in history_svc.get_reps(session_id)[-10:]]

    prompt = SESSION_SUMMARY_PROMPT.format(
        exercise_name=exercise_name,
        condition=condition,
        rep_count=rep_count,
        avg_form_score=avg_form,
        alert_count=alert_count,
        asymmetry=asym,
        rep_data=rep_data,
    )
    text = MedGemmaClient.instance().generate(prompt, max_new_tokens=320)
    history_svc.set_summary(session_id, text)

    return SessionSummary(
        session_id=session_id,
        exercise_id=row.exercise_id if row else mem.exercise.id,
        rep_count=rep_count,
        avg_form_score=avg_form,
        alert_count=alert_count,
        asymmetry_avg=asym,
        text_summary=text,
    )


@app.websocket("/ws/session/{session_id}")
async def ws_endpoint(websocket: WebSocket, session_id: str) -> None:
    await session_ws(websocket, session_id, session_store)
