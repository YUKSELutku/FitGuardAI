from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

CameraAngle = Literal["front", "side", "45deg"]


class JointSpec(BaseModel):
    """Defines one angle to track.

    The angle is computed at vertex `vertex` using `a` and `c` as the two
    outer landmarks (MediaPipe pose indexes).
    """

    name: str
    side: Literal["left", "right", "center"] = "center"
    a: int
    vertex: int
    c: int
    description: str = ""


class RepDetectionConfig(BaseModel):
    """State machine thresholds for rep counting.

    A rep is counted when the tracked angle crosses from `up_threshold`
    (contracted) to `down_threshold` (extended) and back — direction
    depends on the exercise, captured by `direction`.
    """

    joint_name: str
    up_threshold: float
    down_threshold: float
    direction: Literal["flex", "extend"] = "flex"
    min_phase_ms: int = 250


class TempoGuidelines(BaseModel):
    eccentric_sec: float = 2.0
    concentric_sec: float = 1.0
    pause_sec: float = 0.0


class ExerciseConfig(BaseModel):
    id: str
    name: str
    description: str
    camera_angle: CameraAngle
    tracked_joints: list[JointSpec]
    default_safe_ranges: dict[str, tuple[float, float]] = Field(default_factory=dict)
    rep_detection: RepDetectionConfig
    symmetry_check: bool = False
    tempo_guidelines: TempoGuidelines = Field(default_factory=TempoGuidelines)
    setup_hints: list[str] = Field(default_factory=list)
