from __future__ import annotations

from typing import Iterable

from app.services.session import Session


def apply_calibration(
    session: Session, rep_samples: Iterable[dict]
) -> dict[str, tuple[float, float]]:
    """Combine per-rep min/max readings into a personal ROM per joint.

    `rep_samples` shape: list of {joint_name: (min_angle, max_angle)}
    The effective range becomes the tighter of (personal_rom, medgemma_safe).
    """
    joint_mins: dict[str, list[float]] = {}
    joint_maxs: dict[str, list[float]] = {}
    for sample in rep_samples:
        for joint, (mn, mx) in sample.items():
            joint_mins.setdefault(joint, []).append(mn)
            joint_maxs.setdefault(joint, []).append(mx)

    personal_rom: dict[str, tuple[float, float]] = {}
    for j, mins in joint_mins.items():
        maxs = joint_maxs.get(j, [])
        if not maxs:
            continue
        personal_rom[j] = (sum(mins) / len(mins), sum(maxs) / len(maxs))

    effective: dict[str, tuple[float, float]] = {}
    for j, (p_lo, p_hi) in personal_rom.items():
        s_lo, s_hi = session.safe_ranges.get(j, (p_lo, p_hi))
        # Tighter intersection
        effective[j] = (max(p_lo, s_lo), min(p_hi, s_hi))
    # Keep any safe ranges not in personal_rom as-is
    for j, rng in session.safe_ranges.items():
        effective.setdefault(j, rng)

    session.personal_rom = personal_rom
    session.effective_ranges = effective
    session.calibrated = True
    return effective
