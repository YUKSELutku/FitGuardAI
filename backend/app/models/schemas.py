from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

AlertLevel = Literal["info", "warning", "danger"]
RepPhase = Literal["idle", "eccentric", "bottom", "concentric", "top"]


class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class AngleSnapshot(BaseModel):
    joint: str
    angle: float
    in_safe_zone: bool
    safe_min: float
    safe_max: float


class Alert(BaseModel):
    level: AlertLevel
    joint: str
    message: str
    angle: float


class RepEvent(BaseModel):
    rep_number: int
    duration_ms: int
    peak_angle: float
    min_angle: float
    tempo_score: float = 0.0


class FrameMessage(BaseModel):
    """Incoming client frame on the WebSocket."""

    type: Literal["frame"] = "frame"
    image_b64: str  # base64-encoded JPEG/PNG (data URL prefix stripped by client)
    ts_ms: int


class CalibrationMessage(BaseModel):
    type: Literal["calibration"] = "calibration"
    reps: int = 3


class ControlMessage(BaseModel):
    type: Literal["control"] = "control"
    action: Literal["reset", "pause", "resume", "stop"]


class FrameResponse(BaseModel):
    type: Literal["frame_result"] = "frame_result"
    ts_ms: int
    visible: bool
    confidence: float
    landmarks: Optional[list[LandmarkPoint]] = None
    angles: list[AngleSnapshot] = Field(default_factory=list)
    rep_count: int = 0
    phase: RepPhase = "idle"
    alerts: list[Alert] = Field(default_factory=list)
    form_score: float = 100.0
    rep_event: Optional[RepEvent] = None
    asymmetry: Optional[float] = None


class SetupRequest(BaseModel):
    exercise_id: str
    condition: Optional[str] = None


class SafeRangeResponse(BaseModel):
    session_id: str
    exercise_id: str
    safe_ranges: dict[str, tuple[float, float]]
    reasoning: str = ""
    warnings: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)


class CalibrationResult(BaseModel):
    session_id: str
    personal_rom: dict[str, tuple[float, float]]
    effective_ranges: dict[str, tuple[float, float]]


class SessionSummary(BaseModel):
    session_id: str
    exercise_id: str
    rep_count: int
    avg_form_score: float
    alert_count: int
    asymmetry_avg: float
    text_summary: str = ""
