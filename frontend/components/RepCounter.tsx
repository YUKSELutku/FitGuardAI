"use client";

import { useAppStore } from "@/lib/store";

const PHASE_TR: Record<string, string> = {
  idle: "beklemede",
  top: "en üst",
  bottom: "en alt",
  eccentric: "iniş",
  concentric: "çıkış",
};

export default function RepCounter() {
  const repCount = useAppStore((s) => s.repCount);
  const phase = useAppStore((s) => s.phase);
  const repHistory = useAppStore((s) => s.repHistory);
  const asymmetry = useAppStore((s) => s.asymmetry);
  const formScore = useAppStore((s) => s.formScore);

  const recent = repHistory.slice(-5);
  const maxDur = Math.max(3000, ...recent.map((r) => r.duration_ms));

  return (
    <div className="bg-brand-surface border border-brand-border rounded p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm text-gray-400">Tekrar</div>
          <div className="text-6xl font-bold text-safe tabular-nums">{repCount}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-gray-500">{PHASE_TR[phase] ?? phase}</div>
          <div className="text-sm mt-1">Form: <span className="font-semibold">{formScore.toFixed(0)}</span></div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-3 flex items-end gap-1 h-10">
          {recent.map((r) => (
            <div
              key={r.rep_number}
              className="flex-1 bg-safe rounded-t"
              style={{ height: `${(r.duration_ms / maxDur) * 100}%` }}
              title={`Tekrar ${r.rep_number}: ${(r.duration_ms / 1000).toFixed(1)}s`}
            />
          ))}
        </div>
      )}

      {asymmetry !== null && asymmetry > 10 && (
        <div className="mt-3 text-warn text-sm">⚠ Sağ/sol farkı: {asymmetry.toFixed(0)}°</div>
      )}
    </div>
  );
}
