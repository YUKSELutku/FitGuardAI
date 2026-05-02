from __future__ import annotations

from app.core.pose_processor import PoseLandmark as P

from .base import ExerciseConfig, JointSpec, RepDetectionConfig, TempoGuidelines

DEADLIFT = ExerciseConfig(
    id="deadlift",
    name="Deadlift",
    description=(
        "Klasik deadlift. Omurga nötr kalacak şekilde kalçadan menteşe "
        "hareketi yap; yerden güç al."
    ),
    camera_angle="side",
    tracked_joints=[
        JointSpec(
            name="left_hip",
            side="left",
            a=int(P.LEFT_SHOULDER),
            vertex=int(P.LEFT_HIP),
            c=int(P.LEFT_KNEE),
        ),
        JointSpec(
            name="right_hip",
            side="right",
            a=int(P.RIGHT_SHOULDER),
            vertex=int(P.RIGHT_HIP),
            c=int(P.RIGHT_KNEE),
        ),
        JointSpec(
            name="left_knee",
            side="left",
            a=int(P.LEFT_HIP),
            vertex=int(P.LEFT_KNEE),
            c=int(P.LEFT_ANKLE),
        ),
        JointSpec(
            name="back",
            side="center",
            a=int(P.LEFT_SHOULDER),
            vertex=int(P.LEFT_HIP),
            c=int(P.LEFT_ANKLE),
            description="Proxy for back angle (shoulder-hip-ankle).",
        ),
    ],
    default_safe_ranges={
        "left_hip": (60.0, 175.0),
        "right_hip": (60.0, 175.0),
        "left_knee": (110.0, 175.0),
        "back": (60.0, 180.0),
    },
    rep_detection=RepDetectionConfig(
        joint_name="left_hip",
        up_threshold=90.0,
        down_threshold=165.0,
        direction="flex",
    ),
    symmetry_check=True,
    tempo_guidelines=TempoGuidelines(eccentric_sec=2.0, concentric_sec=1.5),
    setup_hints=[
        "Kamera yan tarafında, tüm vücut görünsün.",
        "Bar ayağın ortasında; omuzlar barın biraz önünde.",
        "Nötr omurga — altta sırtı yuvarlatma.",
    ],
)
