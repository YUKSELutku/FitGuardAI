from __future__ import annotations

from datetime import datetime
from typing import Optional

from app.models.db import AngleLog, RepLog, SessionRow, get_session_db, select
from app.services.session import Session as MemSession


def persist_session(mem: MemSession) -> None:
    with get_session_db() as db:
        row = db.get(SessionRow, mem.id)
        started = datetime.fromtimestamp(mem.started_at)
        ended = datetime.fromtimestamp(mem.ended_at) if mem.ended_at else None
        avg_form = sum(mem.form_scores) / len(mem.form_scores) if mem.form_scores else 0.0
        asym_avg = (
            sum(mem.asymmetry_samples) / len(mem.asymmetry_samples)
            if mem.asymmetry_samples
            else 0.0
        )
        if row is None:
            row = SessionRow(
                id=mem.id,
                exercise_id=mem.exercise.id,
                condition=mem.condition,
                started_at=started,
                ended_at=ended,
                rep_count=len(mem.rep_history),
                avg_form_score=avg_form,
                alert_count=mem.alert_count,
                asymmetry_avg=asym_avg,
            )
            db.add(row)
        else:
            row.ended_at = ended
            row.rep_count = len(mem.rep_history)
            row.avg_form_score = avg_form
            row.alert_count = mem.alert_count
            row.asymmetry_avg = asym_avg
        db.commit()


def save_rep(session_id: str, rep: dict) -> None:
    with get_session_db() as db:
        db.add(
            RepLog(
                session_id=session_id,
                rep_number=rep["rep_number"],
                duration_ms=rep["duration_ms"],
                peak_angle=rep["peak_angle"],
                min_angle=rep["min_angle"],
                tempo_score=rep.get("tempo_score", 0.0),
            )
        )
        db.commit()


def list_sessions(limit: int = 50) -> list[SessionRow]:
    with get_session_db() as db:
        stmt = select(SessionRow).order_by(SessionRow.started_at.desc()).limit(limit)
        return list(db.exec(stmt).all())


def get_session(session_id: str) -> Optional[SessionRow]:
    with get_session_db() as db:
        return db.get(SessionRow, session_id)


def get_reps(session_id: str) -> list[RepLog]:
    with get_session_db() as db:
        stmt = select(RepLog).where(RepLog.session_id == session_id).order_by(RepLog.rep_number)
        return list(db.exec(stmt).all())


def set_summary(session_id: str, summary: str) -> None:
    with get_session_db() as db:
        row = db.get(SessionRow, session_id)
        if row is not None:
            row.summary_text = summary
            db.commit()
