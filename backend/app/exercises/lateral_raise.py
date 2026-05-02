from __future__ import annotations

from app.core.pose_processor import PoseLandmark as P

from .base import ExerciseConfig, JointSpec, RepDetectionConfig, TempoGuidelines

LATERAL_RAISE = ExerciseConfig(
    id="lateral_raise",
    name="Yan Kaldırış",
    description=(
        "Dambıl ile yan kaldırış. Kollarını omuz hizasına kadar aç; "
        "trapezi kaldırma ve sallanma."
    ),
    camera_angle="front",
    tracked_joints=[
        JointSpec(
            name="left_shoulder",
            side="left",
            a=int(P.LEFT_HIP),
            vertex=int(P.LEFT_SHOULDER),
            c=int(P.LEFT_ELBOW),
        ),
        JointSpec(
            name="right_shoulder",
            side="right",
            a=int(P.RIGHT_HIP),
            vertex=int(P.RIGHT_SHOULDER),
            c=int(P.RIGHT_ELBOW),
        ),
    ],
    default_safe_ranges={
        "left_shoulder": (10.0, 100.0),
        "right_shoulder": (10.0, 100.0),
    },
    rep_detection=RepDetectionConfig(
        joint_name="right_shoulder",
        up_threshold=25.0,
        down_threshold=80.0,
        direction="extend",
    ),
    symmetry_check=True,
    tempo_guidelines=TempoGuidelines(eccentric_sec=2.0, concentric_sec=1.0),
    setup_hints=[
        "Kameraya dönük, kollar yanda.",
        "Dirsekten başlat, elden değil.",
        "Omuz hizasında dur — 90°'nin üzerine çıkma.",
    ],
)
