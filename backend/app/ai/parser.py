from __future__ import annotations

import json
import re
from dataclasses import dataclass, field


@dataclass
class SafeRangePayload:
    modified_ranges: dict[str, tuple[float, float]]
    reasoning: str = ""
    warnings: list[str] = field(default_factory=list)
    alternatives: list[str] = field(default_factory=list)


_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)


def _extract_json(text: str) -> str | None:
    m = _JSON_BLOCK_RE.search(text)
    if m:
        return m.group(1)
    # Fallback: find first {...} balanced block
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return None


def _sanitize_range(rng) -> tuple[float, float] | None:
    if not (isinstance(rng, (list, tuple)) and len(rng) == 2):
        return None
    try:
        lo = float(rng[0])
        hi = float(rng[1])
    except (TypeError, ValueError):
        return None
    if not (0.0 <= lo <= 180.0 and 0.0 <= hi <= 180.0):
        return None
    if hi <= lo:
        return None
    return (lo, hi)


def parse_safe_ranges(
    llm_output: str,
    defaults: dict[str, tuple[float, float]],
) -> SafeRangePayload:
    """Parse LLM JSON output, falling back to defaults when invalid."""
    payload = SafeRangePayload(modified_ranges=dict(defaults))

    raw = _extract_json(llm_output)
    if raw is None:
        return payload
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return payload

    modified = data.get("modified_ranges") or {}
    for joint, rng in modified.items():
        clean = _sanitize_range(rng)
        if clean is None:
            continue
        # Only narrow the default, never widen — conservative policy.
        d_lo, d_hi = defaults.get(joint, clean)
        payload.modified_ranges[joint] = (max(clean[0], d_lo), min(clean[1], d_hi))

    payload.reasoning = str(data.get("reasoning", ""))[:500]
    warnings = data.get("warnings") or []
    if isinstance(warnings, list):
        payload.warnings = [str(w)[:200] for w in warnings][:6]
    alts = data.get("alternative_exercises") or []
    if isinstance(alts, list):
        payload.alternatives = [str(a)[:80] for a in alts][:6]

    return payload
