"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SessionRow {
  id: string;
  exercise_id: string;
  started_at: string;
  rep_count: number;
  avg_form_score: number;
  alert_count: number;
  asymmetry_avg: number;
  summary_text: string;
}

interface RepRow {
  rep_number: number;
  duration_ms: number;
  peak_angle: number;
  min_angle: number;
  tempo_score: number;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ session: SessionRow; reps: RepRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    api.listSessions()
      .then((data) => setRows(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.sessionDetail(selected).then((d) => setDetail(d)).catch((e) => setError(String(e)));
  }, [selected]);

  const regenerate = async () => {
    if (!selected) return;
    setGenLoading(true);
    try {
      const s = await api.summary(selected);
      if (detail) setDetail({ ...detail, session: { ...detail.session, summary_text: s.text_summary } });
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor…</div>;
  if (error) return <div className="text-danger">Hata: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-2">
        <h1 className="text-xl font-bold mb-2">Geçmiş seanslar</h1>
        {rows.length === 0 && <div className="text-gray-500 text-sm">Henüz seans yok.</div>}
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`w-full text-left p-3 rounded border ${selected === r.id ? "border-safe" : "border-brand-border"} bg-brand-surface hover:border-safe`}
          >
            <div className="text-sm font-semibold">{r.exercise_id}</div>
            <div className="text-xs text-gray-400">{new Date(r.started_at).toLocaleString()}</div>
            <div className="text-xs mt-1 text-gray-500">
              {r.rep_count} tekrar · form {r.avg_form_score.toFixed(0)} · {r.alert_count} uyarı
            </div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2">
        {detail ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{detail.session.exercise_id}</h2>
            <div className="grid grid-cols-4 gap-2">
              <Stat label="Tekrar" value={detail.session.rep_count.toString()} />
              <Stat label="Form" value={detail.session.avg_form_score.toFixed(0)} />
              <Stat label="Uyarı" value={detail.session.alert_count.toString()} />
              <Stat label="Asimetri" value={`${detail.session.asymmetry_avg.toFixed(0)}°`} />
            </div>
            {detail.reps.length > 0 && (
              <div className="bg-brand-surface border border-brand-border rounded p-3">
                <div className="text-sm font-semibold mb-2">Tekrar temposu (ms)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={detail.reps}>
                    <CartesianGrid stroke="#232a38" />
                    <XAxis dataKey="rep_number" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ background: "#151a24", border: "1px solid #232a38" }} />
                    <Bar dataKey="duration_ms" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {detail.reps.length > 0 && (
              <div className="bg-brand-surface border border-brand-border rounded p-3">
                <div className="text-sm font-semibold mb-2">Tekrar başına en yüksek/en düşük açı</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={detail.reps}>
                    <CartesianGrid stroke="#232a38" />
                    <XAxis dataKey="rep_number" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ background: "#151a24", border: "1px solid #232a38" }} />
                    <Legend />
                    <Line type="monotone" dataKey="peak_angle" stroke="#10b981" />
                    <Line type="monotone" dataKey="min_angle" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="bg-brand-surface border border-brand-border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">MedGemma özeti</div>
                <button
                  onClick={regenerate}
                  disabled={genLoading}
                  className="text-xs px-2 py-1 rounded border border-brand-border hover:border-safe disabled:opacity-50"
                >
                  {genLoading ? "Oluşturuluyor…" : "Yeniden oluştur"}
                </button>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {detail.session.summary_text || <span className="text-gray-500">Özet için Yeniden oluştur'a tıkla.</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Detayları görmek için bir seans seç.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
