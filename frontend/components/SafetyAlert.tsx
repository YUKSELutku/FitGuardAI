"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { speak } from "@/lib/tts";

export default function SafetyAlert() {
  const alerts = useAppStore((s) => s.alerts);
  const lastDangerRef = useRef<number>(0);

  useEffect(() => {
    const danger = alerts.find((a) => a.level === "danger");
    if (danger) {
      const now = Date.now();
      if (now - lastDangerRef.current > 4000) {
        speak(danger.message, `danger-${danger.joint}`, "high");
        lastDangerRef.current = now;
      }
    }
  }, [alerts]);

  if (alerts.length === 0) return null;
  const top = alerts.find((a) => a.level === "danger") ?? alerts[0];
  const color =
    top.level === "danger" ? "bg-danger text-white" :
    top.level === "warning" ? "bg-warn text-black" :
    "bg-brand-surface text-gray-200";

  return (
    <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg font-medium ${color} animate-pulse pointer-events-none z-10`}>
      {top.message}
    </div>
  );
}
