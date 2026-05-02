"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseConfig } from "@/types";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import MedicalConditionInput from "./MedicalConditionInput";

export default function ExerciseSelector() {
  const [exercises, setExercises] = useState<ExerciseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ExerciseConfig | null>(null);
  const setExercise = useAppStore((s) => s.setExercise);
  const setSetup = useAppStore((s) => s.setSetup);
  const setCondition = useAppStore((s) => s.setCondition);
  const router = useRouter();

  useEffect(() => {
    api.listExercises()
      .then((data) => setExercises(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const onStart = async (condition: string) => {
    if (!pending) return;
    try {
      const resp = await api.setup(pending.id, condition || null);
      setExercise(pending);
      setCondition(condition);
      setSetup(resp.session_id, resp.safe_ranges, resp.reasoning, resp.warnings, resp.alternatives);
      router.push(`/session/${pending.id}`);
    } catch (e) {
      alert(`Kurulum başarısız: ${e}`);
    }
  };

  if (loading) return <div>Egzersizler yükleniyor…</div>;
  if (error)
    return (
      <div className="text-danger">
        Backend'e erişilemiyor: {error}. {api.base} adresinde çalıştığından emin ol.
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setPending(ex)}
            className="text-left p-5 rounded-lg bg-brand-surface border border-brand-border hover:border-safe transition"
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-lg font-semibold">{ex.name}</div>
              <div className="text-xs uppercase text-gray-400">{ex.camera_angle}</div>
            </div>
            <p className="text-sm text-gray-400">{ex.description}</p>
            <div className="mt-3 text-xs text-gray-500">
              {ex.tracked_joints.length} eklem takip ediliyor · {ex.symmetry_check ? "simetri kontrollü" : "tek taraflı"}
            </div>
          </button>
        ))}
      </div>
      {pending && (
        <MedicalConditionInput
          exercise={pending}
          onCancel={() => setPending(null)}
          onConfirm={onStart}
        />
      )}
    </>
  );
}
