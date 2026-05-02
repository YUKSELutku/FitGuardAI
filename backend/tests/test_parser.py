from app.ai.parser import parse_safe_ranges


def test_parse_json_in_code_block():
    defaults = {"left_elbow": (30.0, 160.0)}
    raw = """```json
{"modified_ranges": {"left_elbow": [40, 150]}, "reasoning": "r", "warnings": ["w"], "alternative_exercises": ["alt"]}
```"""
    p = parse_safe_ranges(raw, defaults)
    assert p.modified_ranges["left_elbow"] == (40.0, 150.0)
    assert p.warnings == ["w"]
    assert p.alternatives == ["alt"]


def test_parse_invalid_falls_back():
    defaults = {"left_elbow": (30.0, 160.0)}
    p = parse_safe_ranges("garbage no json", defaults)
    assert p.modified_ranges == defaults


def test_does_not_widen_beyond_default():
    defaults = {"left_elbow": (30.0, 160.0)}
    raw = '{"modified_ranges": {"left_elbow": [0, 180]}}'
    p = parse_safe_ranges(raw, defaults)
    assert p.modified_ranges["left_elbow"] == (30.0, 160.0)
