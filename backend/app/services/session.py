from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Optional

from app.exercises.base import ExerciseConfig


@dataclass
class Session:
    id: str
    exercise: ExerciseConfig
    condition: Optional[str]
    safe_ranges: dict[str, tuple[float, float]]  # from MedGemma / defaults
    personal_rom: dict[str, tuple[float, float]] = field(default_factory=dict)
    effective_ranges: dict[str, tuple[float, float]] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    alternatives: list[str] = field(default_factory=list)
    reasoning: str = ""
    calibrated: bool = False
    started_at: float = field(default_factory=time.time)
    ended_at: Optional[float] = None
    rep_history: list[dict] = field(default_factory=list)
    alert_count: int = 0
    form_scores: list[float] = field(default_factory=list)
    asymmetry_samples: list[float] = field(default_factory=list)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}

    def create(
        self,
        exercise: ExerciseConfig,
        condition: Optional[str],
        safe_ranges: dict[str, tuple[float, float]],
        reasoning: str = "",
        warnings: Optional[list[str]] = None,
        alternatives: Optional[list[str]] = None,
    ) -> Session:
        sid = uuid.uuid4().hex[:12]
        session = Session(
            id=sid,
            exercise=exercise,
            condition=condition,
            safe_ranges=dict(safe_ranges),
            effective_ranges=dict(safe_ranges),
            reasoning=reasoning,
            warnings=list(warnings or []),
            alternatives=list(alternatives or []),
        )
        self._sessions[sid] = session
        return session

    def get(self, sid: str) -> Optional[Session]:
        return self._sessions.get(sid)

    def all(self) -> list[Session]:
        return list(self._sessions.values())

    def end(self, sid: str) -> Optional[Session]:
        s = self._sessions.get(sid)
        if s is not None:
            s.ended_at = time.time()
        return s


store = SessionStore()
