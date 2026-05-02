from __future__ import annotations

import math
from typing import Sequence

import numpy as np

Point = Sequence[float]


def calculate_angle(a: Point, b: Point, c: Point) -> float:
    """Angle at vertex B formed by A-B-C, in degrees [0, 180].

    Supports 2D or 3D points. Returns NaN if any vector has zero length.
    """
    a_arr = np.asarray(a, dtype=np.float64)
    b_arr = np.asarray(b, dtype=np.float64)
    c_arr = np.asarray(c, dtype=np.float64)

    ba = a_arr - b_arr
    bc = c_arr - b_arr

    ba_norm = np.linalg.norm(ba)
    bc_norm = np.linalg.norm(bc)
    if ba_norm == 0.0 or bc_norm == 0.0:
        return math.nan

    cos_theta = np.dot(ba, bc) / (ba_norm * bc_norm)
    cos_theta = float(np.clip(cos_theta, -1.0, 1.0))
    return math.degrees(math.acos(cos_theta))


def angle_from_landmarks(landmarks, a_idx: int, b_idx: int, c_idx: int) -> float:
    """Compute angle using indexes into a list of (x, y, z[, visibility]) landmarks."""
    a = landmarks[a_idx][:3]
    b = landmarks[b_idx][:3]
    c = landmarks[c_idx][:3]
    return calculate_angle(a, b, c)
