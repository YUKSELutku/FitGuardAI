from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select

from app.config import settings


class SessionRow(SQLModel, table=True):
    __tablename__ = "sessions"

    id: str = Field(primary_key=True)
    exercise_id: str
    condition: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    rep_count: int = 0
    avg_form_score: float = 0.0
    alert_count: int = 0
    asymmetry_avg: float = 0.0
    summary_text: str = ""


class AngleLog(SQLModel, table=True):
    __tablename__ = "angle_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    ts_ms: int
    joint: str
    angle: float
    in_safe_zone: bool


class RepLog(SQLModel, table=True):
    __tablename__ = "rep_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    rep_number: int
    duration_ms: int
    peak_angle: float
    min_angle: float
    tempo_score: float


_engine = create_engine(f"sqlite:///{settings.db_path}")


def init_db() -> None:
    SQLModel.metadata.create_all(_engine)


def get_session_db() -> Session:
    return Session(_engine)


__all__ = [
    "SessionRow",
    "AngleLog",
    "RepLog",
    "init_db",
    "get_session_db",
    "select",
]
