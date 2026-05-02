from __future__ import annotations

from .base import ExerciseConfig
from .biceps_curl import BICEPS_CURL
from .deadlift import DEADLIFT
from .lateral_raise import LATERAL_RAISE
from .shoulder_press import SHOULDER_PRESS
from .squat import SQUAT

REGISTRY: dict[str, ExerciseConfig] = {
    BICEPS_CURL.id: BICEPS_CURL,
    SQUAT.id: SQUAT,
    SHOULDER_PRESS.id: SHOULDER_PRESS,
    LATERAL_RAISE.id: LATERAL_RAISE,
    DEADLIFT.id: DEADLIFT,
}


def get_exercise(exercise_id: str) -> ExerciseConfig | None:
    return REGISTRY.get(exercise_id)


def list_exercises() -> list[ExerciseConfig]:
    return list(REGISTRY.values())
