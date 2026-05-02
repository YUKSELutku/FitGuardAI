import math

from app.core.angle_calculator import calculate_angle


def test_right_angle():
    a = (0, 1)
    b = (0, 0)
    c = (1, 0)
    assert abs(calculate_angle(a, b, c) - 90.0) < 1e-6


def test_straight_line():
    a = (0, 0)
    b = (1, 0)
    c = (2, 0)
    assert abs(calculate_angle(a, b, c) - 180.0) < 1e-6


def test_zero_vector_is_nan():
    assert math.isnan(calculate_angle((0, 0), (0, 0), (1, 0)))


def test_3d_right_angle():
    assert abs(calculate_angle((1, 0, 0), (0, 0, 0), (0, 0, 1)) - 90.0) < 1e-6
