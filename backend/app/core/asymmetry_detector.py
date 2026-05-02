from __future__ import annotations

from typing import Mapping, Optional

from app.exercises.base import ExerciseConfig


def compute_asymmetry(
    exercise: ExerciseConfig, angles: Mapping[str, float]
) -> Optional[float]:
    """Return |left - right| for the first left/right joint pair found.

    Returns None if no matched pair exists in `angles`.
    """
    left_joints = [j for j in exercise.tracked_joints if j.side == "left"]
    right_joints = [j for j in exercise.tracked_joints if j.side == "right"]
    for lj in left_joints:
        paired_name = lj.name.replace("left", "right", 1)
        for rj in right_joints:
            if rj.name == paired_name and lj.name in angles and rj.name in angles:
                return abs(angles[lj.name] - angles[rj.name])
    return None
