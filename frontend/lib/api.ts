import type { ExerciseConfig, SafeRangeResponse, SessionSummary } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  base: BASE,
  listExercises: () => fetch(`${BASE}/exercises`).then(json<ExerciseConfig[]>),
  getExercise: (id: string) => fetch(`${BASE}/exercises/${id}`).then(json<ExerciseConfig>),
  setup: (exercise_id: string, condition: string | null) =>
    fetch(`${BASE}/api/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise_id, condition }),
    }).then(json<SafeRangeResponse>),
  calibrate: (session_id: string, rep_samples: Record<string, [number, number]>[]) =>
    fetch(`${BASE}/api/calibration/${session_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rep_samples }),
    }).then(json<{ session_id: string; personal_rom: any; effective_ranges: any }>),
  endSession: (session_id: string) =>
    fetch(`${BASE}/api/sessions/${session_id}/end`, { method: "POST" }).then(json),
  listSessions: () => fetch(`${BASE}/sessions`).then(json<any[]>),
  sessionDetail: (id: string) => fetch(`${BASE}/sessions/${id}`).then(json<any>),
  summary: (id: string) =>
    fetch(`${BASE}/sessions/${id}/summary`, { method: "POST" }).then(json<SessionSummary>),
};
