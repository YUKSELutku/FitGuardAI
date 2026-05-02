from __future__ import annotations

SAFE_RANGE_PROMPT = """You are a sports medicine assistant. Given an exercise and the user's medical condition, return a JSON object with safe joint angle ranges (in degrees).

Exercise: {exercise_name}
Description: {exercise_description}
Tracked joints: {joints}
Default safe ranges: {default_ranges}
User's condition: {condition}

Return ONLY valid JSON in this format:
{{
  "modified_ranges": {{ "joint_name": [min_angle, max_angle] }},
  "reasoning": "brief medical justification",
  "warnings": ["extra cautions the user should know"],
  "alternative_exercises": ["exercises that may be safer alternatives"]
}}

If no condition is provided, return default ranges unchanged.
Be conservative: prioritize safety over range of motion.
"""


SESSION_SUMMARY_PROMPT = """You are a fitness coach summarizing a strength training session.

Exercise: {exercise_name}
User condition: {condition}
Reps completed: {rep_count}
Average form score: {avg_form_score:.1f} / 100
Safety alerts: {alert_count}
Average left/right asymmetry: {asymmetry:.1f}°
Per-rep data: {rep_data}

Write a concise summary (max 6 sentences) covering:
1. Overall form quality
2. Specific issues observed
3. One actionable suggestion for the next session

Avoid medical diagnoses. Plain text, no markdown.
"""


def build_safe_range_prompt(
    exercise_name: str,
    exercise_description: str,
    joints: list[str],
    default_ranges: dict[str, tuple[float, float]],
    condition: str | None,
) -> str:
    default_str = {k: list(v) for k, v in default_ranges.items()}
    return SAFE_RANGE_PROMPT.format(
        exercise_name=exercise_name,
        exercise_description=exercise_description,
        joints=joints,
        default_ranges=default_str,
        condition=condition or "(none provided)",
    )
