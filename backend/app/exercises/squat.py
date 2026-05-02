from __future__ import annotations

from app.core.pose_processor import PoseLandmark as P

from .base import ExerciseConfig, JointSpec, RepDetectionConfig, TempoGuidelines

SQUAT = ExerciseConfig(
    id="squat",
    name="Squat",
    description=(
        "Kendi ağırlığı veya ek yükle squat. En az paralele kadar in; "
        "dizlerini içe yıkma, beli yuvarlatma."
    ),
    camera_angle="side",
    tracked_joints=[
        JointSpec(
            name="left_knee",
            side="left",
            a=int(P.LEFT_HIP),
            vertex=int(P.LEFT_KNEE),
            c=int(P.LEFT_ANKLE),
            description="Left knee flexion (hip-knee-ankle).",
        ),
        JointSpec(
            name="right_knee",
            side="right",
            a=int(P.RIGHT_HIP),
            vertex=int(P.RIGHT_KNEE),
            c=int(P.RIGHT_ANKLE),
            description="Right knee flexion (hip-knee-ankle).",
        ),
        JointSpec(
            name="left_hip",
            side="left",
            a=int(P.LEFT_SHOULDER),
            vertex=int(P.LEFT_HIP),
            c=int(P.LEFT_KNEE),
            description="Left hip flexion (shoulder-hip-knee).",
        ),
    ],
    default_safe_ranges={
        "left_knee": (70.0, 175.0),
        "right_knee": (70.0, 175.0),
        "left_hip": (55.0, 175.0),
    },
    rep_detection=RepDetectionConfig(
        joint_name="right_knee",
        up_threshold=95.0,
        down_threshold=160.0,
        direction="flex",
    ),
    symmetry_check=True,
    tempo_guidelines=TempoGuidelines(eccentric_sec=2.0, concentric_sec=1.5),
    setup_hints=[
        "Kamerayı yan tarafına koy; tüm vücut görünsün.",
        "Ayaklar omuz genişliğinde, parmak uçları hafif dışa.",
        "Göğüs yukarıda, sırt nötr pozisyonda.",
    ],
)
