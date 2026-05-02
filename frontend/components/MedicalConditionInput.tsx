"use client";

import { useState } from "react";
import type { ExerciseConfig } from "@/types";

export default function MedicalConditionInput({
  exercise,
  onCancel,
  onConfirm,
}: {
  exercise: ExerciseConfig;
  onCancel: () => void;
  onConfirm: (condition: string) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (useCondition: boolean) => {
    setLoading(true);
    try {
      await onConfirm(useCondition ? text.trim() : "");
    } finally {
      setLoading(false);
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-1">Hazırlık: {exercise.name}</h2>
        <p className="text-sm text-gray-400 mb-4">
          Bilmemiz gereken bir sakatlık veya rahatsızlık var mı? (İsteğe bağlı)
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Örn. sağ omzum ağrıyor, eski diz sakatlığım var..."
          className="w-full h-24 bg-brand-bg border border-brand-border rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-safe"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded border border-brand-border hover:bg-brand-bg"
          >
            İptal
          </button>
          {hasText ? (
            <button
              onClick={() => submit(true)}
              disabled={loading}
              className="flex-1 py-2 rounded bg-safe text-black font-semibold hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Analiz ediliyor…" : "MedGemma ile başla"}
            </button>
          ) : (
            <button
              onClick={() => submit(false)}
              disabled={loading}
              className="flex-1 py-2 rounded bg-safe text-black font-semibold hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Başlatılıyor…" : "Hemen başla"}
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {hasText
            ? "MedGemma güvenli eklem açı aralıklarını rahatsızlığına göre ayarlayacak."
            : "Rahatsızlık girmezsen MedGemma atlanır; varsayılan güvenli aralıklarla hemen kalibrasyona geçilir."}
        </p>
      </div>
    </div>
  );
}
