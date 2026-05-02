"use client";

import { useEffect, useState } from "react";

const KEY = "fitguard.disclaimer.accepted";

export default function Disclaimer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="max-w-lg bg-brand-surface border border-brand-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Başlamadan önce</h2>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside mb-5">
          <li>FitGuard AI bir fitness asistanıdır, <strong>tıbbi cihaz değildir</strong>.</li>
          <li>Önerileri uzman doktor tavsiyesinin yerini tutmaz.</li>
          <li>Ağrı hissettiğinde hemen dur ve bir uzmana danış.</li>
          <li>Tüm video ve veriler bu cihazda kalır; hiçbir şey yüklenmez.</li>
        </ul>
        <button
          onClick={accept}
          className="w-full bg-safe hover:bg-emerald-500 text-black font-semibold py-2 rounded"
        >
          Anladım, devam et
        </button>
      </div>
    </div>
  );
}
