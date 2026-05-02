from __future__ import annotations

from app.core.pose_processor import PoseLandmark as P

from .base import ExerciseConfig, JointSpec, RepDetectionConfig, TempoGuidelines

SHOULDER_PRESS = ExerciseConfig(
    id="shoulder_press",
    name="Omuz Press",
    description=(
        "Dambıl ile omuz press. Ağırlığı doğrudan başın üstüne it; "
        "bel bölgesini aşırı kavislendirme."
    ),
    camera_angle="front",
    tracked_joints=[
        JointSpec(
            name="left_elbow",
            side="left",
            a=int(P.LEFT_SHOULDER),
            vertex=int(P.LEFT_ELBOW),
            c=int(P.LEFT_WRIST),
        ),
        JointSpec(
            name="right_elbow",
            side="right",
            a=int(P.RIGHT_SHOULDER),
            vertex=int(P.RIGHT_ELBOW),
            c=int(P.RIGHT_WRIST),
        ),
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
        "left_elbow": (70.0, 175.0),
        "right_elbow": (70.0, 175.0),
        "left_shoulder": (40.0, 175.0),
        "right_shoulder": (40.0, 175.0),
    },
    rep_detection=RepDetectionConfig(
        joint_name="right_elbow",
        up_threshold=85.0,
        down_threshold=165.0,
        direction="flex",
    ),
    symmetry_check=True,
    tempo_guidelines=TempoGuidelines(eccentric_sec=2.0, concentric_sec=1.0),
    setup_hints=[
        "Kameraya dönük; oturarak ya da ayakta.",
        "Başla: dirsekler ~90°, dambıllar omuz hizasında.",
        "Düz yukarı it; dirsekleri sertçe kilitleme.",
    ],
)
