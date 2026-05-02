from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional

from app.exercises.base import RepDetectionConfig
from app.models.schemas import RepEvent, RepPhase


@dataclass
class RepCounter:
    """Peak/valley based rep counter.

    Signal-agnostic: a rep is counted whenever a local maximum is followed
    by a local minimum (or vice versa) with enough amplitude between them.
    This works regardless of absolute angle thresholds or the user's ROM.

    Local extremes are detected with a `hysteresis_deg` buffer so small
    jitter doesn't trigger false reversals. Reps must exceed `min_range_deg`
    peak-to-valley to be accepted.
    """

    config: RepDetectionConfig
    min_range_deg: float = 20.0
    hysteresis_deg: float = 4.0
    count: int = 0
    phase: RepPhase = "idle"
    _prev: Optional[float] = None
    _direction: int = 0  # 1 = rising, -1 = falling, 0 = unknown
    _extreme_hi: Optional[float] = None
    _extreme_lo: Optional[float] = None
    _last_peak: Optional[float] = None
    _last_valley: Optional[float] = None
    _rep_start_ms: int = 0

    @staticmethod
    def _now_ms() -> int:
        return int(time.time() * 1000)

    def update(self, angle: float) -> Optional[RepEvent]:
        if self._prev is None:
            self._prev = angle
            self._extreme_hi = angle
            self._extreme_lo = angle
            return None

        produced: Optional[RepEvent] = None

        if self._direction >= 0:
            # Currently rising (or unknown): track running maximum.
            if angle >= (self._extreme_hi or angle):
                self._extreme_hi = angle
            elif self._extreme_hi is not None and angle < self._extreme_hi - self.hysteresis_deg:
                # Direction reversed → we just found a local maximum (peak).
                self._last_peak = self._extreme_hi
                self.phase = "top"
                self._direction = -1
                self._extreme_lo = angle
                # Count a rep if a valley preceded this peak with enough swing.
                if self._last_valley is not None:
                    rng = self._last_peak - self._last_valley
                    if rng >= self.min_range_deg:
                        produced = self._emit_rep(self._last_valley, self._last_peak)
                        # Consume both extremes so the next rep needs a fresh full cycle.
                        self._last_peak = None
                        self._last_valley = None
        else:
            # Currently falling: track running minimum.
            if angle <= (self._extreme_lo or angle):
                self._extreme_lo = angle
            elif self._extreme_lo is not None and angle > self._extreme_lo + self.hysteresis_deg:
                # Direction reversed → we just found a local minimum (valley).
                self._last_valley = self._extreme_lo
                self.phase = "bottom"
                self._direction = 1
                self._extreme_hi = angle
                if self._last_peak is not None:
                    rng = self._last_peak - self._last_valley
                    if rng >= self.min_range_deg:
                        produced = self._emit_rep(self._last_valley, self._last_peak)
                        self._last_peak = None
                        self._last_valley = None

        self._prev = angle
        return produced

    def _emit_rep(self, valley: float, peak: float) -> RepEvent:
        self.count += 1
        now = self._now_ms()
        duration = max(1, now - (self._rep_start_ms or now))
        self._rep_start_ms = now
        return RepEvent(
            rep_number=self.count,
            duration_ms=duration,
            peak_angle=peak,
            min_angle=valley,
            tempo_score=self._score_tempo(duration),
        )

    def _score_tempo(self, duration_ms: int) -> float:
        ideal = 3000.0
        diff = abs(duration_ms - ideal)
        return max(0.0, 100.0 - (diff / 30.0))

    def reset(self) -> None:
        self.count = 0
        self.phase = "idle"
        self._prev = None
        self._direction = 0
        self._extreme_hi = None
        self._extreme_lo = None
        self._last_peak = None
        self._last_valley = None
        self._rep_start_ms = 0
