import time

from app.core.rep_counter import RepCounter
from app.exercises.base import RepDetectionConfig


def test_flex_rep_counting():
    cfg = RepDetectionConfig(
        joint_name="x", up_threshold=60, down_threshold=150, direction="flex", min_phase_ms=0
    )
    rc = RepCounter(config=cfg)
    rc.update(170)  # idle, stays
    rc.update(50)   # top
    time.sleep(0.01)
    ev = rc.update(160)  # bottom → rep++
    assert rc.count == 1
    assert ev is not None and ev.rep_number == 1
