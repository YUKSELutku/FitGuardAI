"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SessionSummary } from "@/types";

export default function SessionReport({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.endSession(sessionId);
      const s = await api.summary(sessionId);
      setSummary(s);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-brand-surface border border-brand-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Seans raporu</h2>
        {loading && <div className="text-gray-400">Özet oluşturuluyor…</div>}
        {error && <div className="text-danger">Başarısız: {error}</div>}
        {summary && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Tekrar" value={summary.rep_count.toString()} />
              <Stat label="Form puanı" value={summary.avg_form_score.toFixed(0)} />
              <Stat label="Uyarı" value={summary.alert_count.toString()} />
              <Stat label="Ort. asimetri" value={`${summary.asymmetry_avg.toFixed(0)}°`} />
            </div>
            <div className="bg-brand-bg border border-brand-border rounded p-3 text-sm whitespace-pre-wrap">
              {summary.text_summary}
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-safe text-black font-semibold hover:bg-emerald-500"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
