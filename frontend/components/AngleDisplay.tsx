"use client";

import { useAppStore } from "@/lib/store";

export default function AngleDisplay() {
  const angles = useAppStore((s) => s.currentAngles);
  const ranges = useAppStore((s) => s.effectiveRanges);

  return (
    <div className="space-y-3">
      {Object.entries(angles).map(([joint, info]) => {
        const [lo, hi] = ranges[joint] ?? [info.min, info.max];
        const range = hi - lo || 1;
        const pct = Math.min(100, Math.max(0, ((info.angle - lo) / range) * 100));
        const color = info.inZone ? "bg-safe" : "bg-danger";
        return (
          <div key={joint} className="bg-brand-surface border border-brand-border rounded p-3">
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-sm text-gray-300 capitalize">{joint.replace("_", " ")}</div>
              <div className={`text-2xl font-bold ${info.inZone ? "text-safe" : "text-danger"}`}>
                {info.angle.toFixed(0)}°
              </div>
            </div>
            <div className="relative h-2 bg-brand-bg rounded overflow-hidden">
              <div className={`absolute inset-y-0 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{lo.toFixed(0)}°</span>
              <span>{hi.toFixed(0)}°</span>
            </div>
          </div>
        );
      })}
      {Object.keys(angles).length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">Poz bekleniyor…</div>
      )}
    </div>
  );
}
