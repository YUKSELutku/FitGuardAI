import { create } from "zustand";
import type { Alert, ExerciseConfig, FrameResult, RepEvent } from "@/types";

interface AppState {
  selectedExercise: ExerciseConfig | null;
  condition: string;
  sessionId: string | null;
  safeRanges: Record<string, [number, number]>;
  effectiveRanges: Record<string, [number, number]>;
  warnings: string[];
  alternatives: string[];
  reasoning: string;
  calibrated: boolean;
  repCount: number;
  phase: string;
  currentAngles: Record<string, { angle: number; min: number; max: number; inZone: boolean }>;
  formScore: number;
  alerts: Alert[];
  lastRep: RepEvent | null;
  repHistory: RepEvent[];
  asymmetry: number | null;
  resetRepsTick: number;
  setExercise: (ex: ExerciseConfig) => void;
  setCondition: (c: string) => void;
  setSetup: (sessionId: string, safeRanges: Record<string, [number, number]>, reasoning: string, warnings: string[], alternatives: string[]) => void;
  setCalibrated: (ranges: Record<string, [number, number]>) => void;
  resetCalibration: () => void;
  requestResetReps: () => void;
  applyFrame: (frame: FrameResult) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedExercise: null,
  condition: "",
  sessionId: null,
  safeRanges: {},
  effectiveRanges: {},
  warnings: [],
  alternatives: [],
  reasoning: "",
  calibrated: false,
  repCount: 0,
  phase: "idle",
  currentAngles: {},
  formScore: 100,
  alerts: [],
  lastRep: null,
  repHistory: [],
  asymmetry: null,
  resetRepsTick: 0,

  setExercise: (ex) => set({ selectedExercise: ex }),
  setCondition: (c) => set({ condition: c }),
  setSetup: (sessionId, safeRanges, reasoning, warnings, alternatives) =>
    set({ sessionId, safeRanges, effectiveRanges: safeRanges, reasoning, warnings, alternatives, calibrated: false }),
  setCalibrated: (ranges) =>
    set((s) => ({
      effectiveRanges: ranges,
      calibrated: true,
      repCount: 0,
      repHistory: [],
      lastRep: null,
      resetRepsTick: s.resetRepsTick + 1,
    })),
  resetCalibration: () =>
    set((s) => ({
      calibrated: false,
      effectiveRanges: s.safeRanges,
      repCount: 0,
      repHistory: [],
      lastRep: null,
      resetRepsTick: s.resetRepsTick + 1,
    })),
  requestResetReps: () =>
    set((s) => ({
      repCount: 0,
      repHistory: [],
      lastRep: null,
      resetRepsTick: s.resetRepsTick + 1,
    })),
  applyFrame: (frame) =>
    set((state) => {
      const angles: AppState["currentAngles"] = {};
      for (const a of frame.angles) {
        angles[a.joint] = { angle: a.angle, min: a.safe_min, max: a.safe_max, inZone: a.in_safe_zone };
      }
      return {
        repCount: frame.rep_count,
        phase: frame.phase,
        currentAngles: angles,
        formScore: frame.form_score,
        alerts: frame.alerts,
        lastRep: frame.rep_event ?? state.lastRep,
        repHistory: frame.rep_event ? [...state.repHistory, frame.rep_event] : state.repHistory,
        asymmetry: frame.asymmetry ?? null,
      };
    }),
  reset: () =>
    set({
      selectedExercise: null,
      condition: "",
      sessionId: null,
      safeRanges: {},
      effectiveRanges: {},
      warnings: [],
      alternatives: [],
      reasoning: "",
      calibrated: false,
      repCount: 0,
      phase: "idle",
      currentAngles: {},
      formScore: 100,
      alerts: [],
      lastRep: null,
      repHistory: [],
      asymmetry: null,
    }),
}));
