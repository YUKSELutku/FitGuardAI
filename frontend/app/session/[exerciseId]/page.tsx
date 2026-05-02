"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CameraView from "@/components/CameraView";
import AngleDisplay from "@/components/AngleDisplay";
import RepCounter from "@/components/RepCounter";
import SafetyAlert from "@/components/SafetyAlert";
import CalibrationWizard from "@/components/CalibrationWizard";
import SessionReport from "@/components/SessionReport";
import { useAppStore } from "@/lib/store";

export default function SessionPage() {
  const params = useParams<{ exerciseId: string }>();
  const router = useRouter();
  const sessionId = useAppStore((s) => s.sessionId);
  const exercise = useAppStore((s) => s.selectedExercise);
  const calibrated = useAppStore((s) => s.calibrated);
  const reasoning = useAppStore((s) => s.reasoning);
  const warnings = useAppStore((s) => s.warnings);
  const applyFrame = useAppStore((s) => s.applyFrame);
  const resetCalibration = useAppStore((s) => s.resetCalibration);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!sessionId || !exercise) {
      router.replace("/");
    }
  }, [sessionId, exercise, router]);

  if (!sessionId || !exercise) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="relative">
          <CameraView sessionId={sessionId} exercise={exercise} onFrame={applyFrame} active />
          <SafetyAlert />
        </div>
        {reasoning && (
          <div className="mt-3 text-xs text-gray-400 bg-brand-surface border border-brand-border rounded p-3">
            <strong className="text-gray-200">MedGemma notu:</strong> {reasoning}
            {warnings.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-warn">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
      <aside className="space-y-3">
        <div>
          <div className="text-xs uppercase text-gray-500">
            {exercise.camera_angle === "front" ? "önden" : exercise.camera_angle === "side" ? "yandan" : "45°"} görünüm
          </div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
        </div>
        {!calibrated && <CalibrationWizard onDone={() => {}} />}
        {calibrated && (
          <>
            <RepCounter />
            <AngleDisplay />
            <div className="flex gap-2">
              <button
                onClick={resetCalibration}
                className="flex-1 py-2 rounded border border-brand-border hover:bg-brand-bg text-sm"
              >
                Yeniden kalibre et
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="flex-1 py-2 rounded bg-danger text-white font-semibold hover:bg-red-600"
              >
                Seansı bitir
              </button>
            </div>
          </>
        )}
      </aside>
      {showReport && (
        <SessionReport
          sessionId={sessionId}
          onClose={() => {
            setShowReport(false);
            router.push("/history");
          }}
        />
      )}
    </div>
  );
}
