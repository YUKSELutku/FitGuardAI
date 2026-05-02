export type CameraAngle = "front" | "side" | "45deg";

export interface JointSpec {
  name: string;
  side: "left" | "right" | "center";
  a: number;
  vertex: number;
  c: number;
  description?: string;
}

export interface RepDetectionConfig {
  joint_name: string;
  up_threshold: number;
  down_threshold: number;
  direction: "flex" | "extend";
  min_phase_ms: number;
}

export interface ExerciseConfig {
  id: string;
  name: string;
  description: string;
  camera_angle: CameraAngle;
  tracked_joints: JointSpec[];
  default_safe_ranges: Record<string, [number, number]>;
  rep_detection: RepDetectionConfig;
  symmetry_check: boolean;
  tempo_guidelines: { eccentric_sec: number; concentric_sec: number; pause_sec: number };
  setup_hints: string[];
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface AngleSnapshot {
  joint: string;
  angle: number;
  in_safe_zone: boolean;
  safe_min: number;
  safe_max: number;
}

export type AlertLevel = "info" | "warning" | "danger";
export interface Alert {
  level: AlertLevel;
  joint: string;
  message: string;
  angle: number;
}

export interface RepEvent {
  rep_number: number;
  duration_ms: number;
  peak_angle: number;
  min_angle: number;
  tempo_score: number;
}

export type RepPhase = "idle" | "eccentric" | "bottom" | "concentric" | "top";

export interface FrameResult {
  type: "frame_result";
  ts_ms: number;
  visible: boolean;
  confidence: number;
  landmarks?: Landmark[];
  angles: AngleSnapshot[];
  rep_count: number;
  phase: RepPhase;
  alerts: Alert[];
  form_score: number;
  rep_event?: RepEvent;
  asymmetry?: number;
}

export interface SafeRangeResponse {
  session_id: string;
  exercise_id: string;
  safe_ranges: Record<string, [number, number]>;
  reasoning: string;
  warnings: string[];
  alternatives: string[];
}

export interface SessionSummary {
  session_id: string;
  exercise_id: string;
  rep_count: number;
  avg_form_score: number;
  alert_count: number;
  asymmetry_avg: number;
  text_summary: string;
}
