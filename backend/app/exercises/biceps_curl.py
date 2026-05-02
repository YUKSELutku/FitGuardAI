from __future__ import annotations

from app.core.pose_processor import PoseLandmark as P

from .base import (
    ExerciseConfig,
    JointSpec,
    RepDetectionConfig,
    TempoGuidelines,
)

BICEPS_CURL = ExerciseConfig(
    id="biceps_curl",
    name="Biceps Curl",
    description=(
        "Dambıl ile biceps curl. Dirsekleri gövdeye yakın tut; omuzu "
        "sallamadan önkolu yukarı bük."
    ),
    camera_angle="front",
    tracked_joints=[
        JointSpec(
            name="left_elbow",
            side="left",
            a=int(P.LEFT_SHOULDER),
            vertex=int(P.LEFT_ELBOW),
            c=int(P.LEFT_WRIST),
            description="Left elbow flexion angle (shoulder-elbow-wrist).",
        ),
        JointSpec(
            name="right_elbow",
            side="right",
            a=int(P.RIGHT_SHOULDER),
            vertex=int(P.RIGHT_ELBOW),
            c=int(P.RIGHT_WRIST),
            description="Right elbow flexion angle (shoulder-elbow-wrist).",
        ),
    ],
    default_safe_ranges={
        "left_elbow": (30.0, 160.0),
        "right_elbow": (30.0, 160.0),
    },
    rep_detection=RepDetectionConfig(
        joint_name="right_elbow",
        up_threshold=80.0,
        down_threshold=140.0,
        direction="flex",
    ),
    symmetry_check=True,
    tempo_guidelines=TempoGuidelines(eccentric_sec=2.0, concentric_sec=1.0),
    setup_hints=[
        "Kameraya dönük şekilde dur; tüm gövde görünsün.",
        "Set boyunca dirsekleri yanında tut.",
        "Sallanma — iniş fazını kontrollü yap.",
    ],
)
