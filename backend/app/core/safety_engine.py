from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping

from app.models.schemas import Alert


@dataclass
class SafetyEngine:
    """Checks joint angles against per-joint safe ranges with hysteresis.

    Hysteresis logic: once a joint exits the safe zone (violation begins),
    the danger flag stays on until the angle re-enters by at least
    `hysteresis_deg` (so micro-jitter around the boundary does not spam).
    """

    safe_ranges: dict[str, tuple[float, float]]
    hysteresis_deg: float = 5.0
    warning_margin_deg: float = 5.0
    _violating: dict[str, bool] = field(default_factory=dict)

    def check(self, angles: Mapping[str, float]) -> list[Alert]:
        alerts: list[Alert] = []
        for joint, angle in angles.items():
            if joint not in self.safe_ranges:
                continue
            lo, hi = self.safe_ranges[joint]
            was_violating = self._violating.get(joint, False)

            if angle < lo or angle > hi:
                is_violating = True
            elif was_violating and (angle < lo + self.hysteresis_deg or angle > hi - self.hysteresis_deg):
                is_violating = True  # still within hysteresis buffer
            else:
                is_violating = False

            self._violating[joint] = is_violating

            if is_violating:
                yon = "çok düşük" if angle < lo else "çok yüksek"
                alerts.append(
                    Alert(
                        level="danger",
                        joint=joint,
                        message=f"{joint}: açı {angle:.0f}° {yon} (güvenli {lo:.0f}–{hi:.0f}°)",
                        angle=angle,
                    )
                )
            elif angle < lo + self.warning_margin_deg or angle > hi - self.warning_margin_deg:
                alerts.append(
                    Alert(
                        level="warning",
                        joint=joint,
                        message=f"{joint}: güvenli sınıra yaklaşıyorsun ({angle:.0f}°)",
                        angle=angle,
                    )
                )
        return alerts

    def update_ranges(self, new_ranges: dict[str, tuple[float, float]]) -> None:
        self.safe_ranges = dict(new_ranges)
        self._violating.clear()

    def form_score(self, angles: Mapping[str, float]) -> float:
        """Simple continuous form score: 100 if all within bounds, drops with violations."""
        score = 100.0
        for joint, angle in angles.items():
            if joint not in self.safe_ranges:
                continue
            lo, hi = self.safe_ranges[joint]
            if angle < lo:
                score -= min(30.0, (lo - angle) * 2.0)
            elif angle > hi:
                score -= min(30.0, (angle - hi) * 2.0)
        return max(0.0, score)
