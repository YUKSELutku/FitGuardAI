"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

interface Props {
  onDone: () => void;
}

export default function CalibrationWizard({ onDone }: Props) {
  const sessionId = useAppStore((s) => s.sessionId)!;
  const exercise = useAppStore((s) => s.selectedExercise)!;
  const repCount = useAppStore((s) => s.repCount);
  const currentAngles = useAppStore((s) => s.currentAngles);
  const phase = useAppStore((s) => s.phase);
  const setCalibrated = useAppStore((s) => s.setCalibrated);

  const TARGET_REPS = 3;
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [samplesCount, setSamplesCount] = useState(0);
  const perRepRef = useRef<Record<string, { min: number; max: number }>>({});
  const samplesRef = useRef<Record<string, [number, number]>[]>([]);
  const lastSeenRepRef = useRef(0);

  // accumulate min/max per joint on every frame
  useEffect(() => {
    if (!started || finished) return;
    for (const [j, info] of Object.entries(currentAngles)) {
      const bucket = perRepRef.current[j] ?? { min: 180, max: 0 };
      bucket.min = Math.min(bucket.min, info.angle);
      bucket.max = Math.max(bucket.max, info.angle);
      perRepRef.current[j] = bucket;
    }
  }, [currentAngles, started, finished]);

  const commitRep = () => {
    if (!started || finished) return;
    if (Object.keys(perRepRef.current).length === 0) return;
    const snapshot: Record<string, [number, number]> = {};
    for (const [j, b] of Object.entries(perRepRef.current)) {
      snapshot[j] = [b.min, b.max];
    }
    samplesRef.current.push(snapshot);
    perRepRef.current = {};
    setSamplesCount(samplesRef.current.length);
    if (samplesRef.current.length >= TARGET_REPS) {
      setFinished(true);
      void submit();
    }
  };

  // auto-detect on rep count change
  useEffect(() => {
    if (!started || finished) return;
    if (repCount > lastSeenRepRef.current) {
      lastSeenRepRef.current = repCount;
      commitRep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repCount, started, finished]);

  const submit = async () => {
    setFinalizing(true);
    try {
      const resp = await api.calibrate(sessionId, samplesRef.current);
      setCalibrated(resp.effective_ranges);
      onDone();
    } catch (e) {
      alert(`Kalibrasyon başarısız: ${e}`);
    } finally {
      setFinalizing(false);
    }
  };

  const restart = () => {
    perRepRef.current = {};
    samplesRef.current = [];
    lastSeenRepRef.current = repCount;
    setSamplesCount(0);
    setFinished(false);
    setStarted(true);
  };

  const status = useMemo(() => {
    if (!started) return `Tam rahat bir şekilde ${TARGET_REPS} kontrollü tekrar yap.`;
    if (finished) return "Kalibrasyon tamamlandı.";
    return `Tekrar ${Math.min(samplesCount + 1, TARGET_REPS)} / ${TARGET_REPS}…`;
  }, [started, finished, samplesCount]);

  const rd = exercise.rep_detection;

  return (
    <div className="bg-brand-surface border border-brand-border rounded p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Kalibrasyon</h3>
        {started && !finished && (
          <button
            onClick={restart}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Sıfırla
          </button>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-3">{status}</p>
      {!started && (
        <ul className="text-xs text-gray-500 list-disc list-inside mb-3">
          {exercise.setup_hints.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      <div className="flex gap-2">
        {!started && !finished && (
          <button
            onClick={() => setStarted(true)}
            className="flex-1 py-2 rounded bg-safe text-black font-semibold hover:bg-emerald-500"
          >
            Kalibrasyonu başlat
          </button>
        )}
        {started && !finished && (
          <button
            onClick={commitRep}
            disabled={Object.keys(perRepRef.current).length === 0}
            className="flex-1 py-2 rounded bg-safe text-black font-semibold hover:bg-emerald-500 disabled:opacity-50"
          >
            Tekrarı kaydet ({samplesCount}/{TARGET_REPS})
          </button>
        )}
        {finalizing && <div className="text-xs text-gray-400">Kaydediliyor…</div>}
      </div>

      {started && !finished && (
        <div className="mt-2 text-xs text-gray-500">
          Faz: <span className="text-gray-300">{phase}</span> · sunucu tekrar: {repCount} ·
          otomatik algılanmazsa yukarıdan elle kaydedebilirsin.
        </div>
      )}

      {Object.keys(currentAngles).length > 0 && (
        <div className="mt-3 space-y-1 text-xs">
          <div className="text-gray-500">Canlı açılar (hareket ettikçe değişmeli):</div>
          {Object.entries(currentAngles).map(([j, info]) => (
            <div key={j} className="flex justify-between">
              <span className="text-gray-400">{j}</span>
              <span className={info.inZone ? "text-safe" : "text-warn"}>
                {info.angle.toFixed(0)}°
              </span>
            </div>
          ))}
          <div className="text-gray-500 mt-2">
            İpucu: Otomatik tekrar algılama için{" "}
            <span className="text-gray-300">{rd.joint_name}</span> açısında
            en az ~20° genlikte net bir aşağı/yukarı hareket yap.
          </div>
        </div>
      )}
      {Object.keys(currentAngles).length === 0 && started && (
        <div className="mt-3 text-xs text-warn">
          Açı algılanmıyor. Tüm vücudun (ya da en azından takip edilen kolun/bacağın)
          kadrajda ve iyi aydınlatılmış olduğundan emin ol.
        </div>
      )}
    </div>
  );
}
