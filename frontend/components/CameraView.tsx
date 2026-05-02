"use client";

import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import type { ExerciseConfig, FrameResult } from "@/types";
import { SessionWebSocket } from "@/lib/websocket";
import { drawAngleLabel, drawSkeleton } from "@/lib/pose-drawing";
import { useAppStore } from "@/lib/store";

interface Props {
  sessionId: string;
  exercise: ExerciseConfig;
  onFrame: (f: FrameResult) => void;
  active: boolean;
}

const SEND_INTERVAL_MS = 50; // ~20 fps client → server
const CAPTURE_W = 480;
const CAPTURE_H = 360;

export default function CameraView({ sessionId, exercise, onFrame, active }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<SessionWebSocket | null>(null);
  const lastSentRef = useRef(0);
  const lastFrameRef = useRef<FrameResult | null>(null);
  const resetRepsTick = useAppStore((s) => s.resetRepsTick);

  useEffect(() => {
    wsRef.current = new SessionWebSocket(sessionId);
    const unsubscribe = wsRef.current.on((msg) => {
      if (msg?.type === "frame_result") {
        lastFrameRef.current = msg as FrameResult;
        onFrame(msg as FrameResult);
      }
    });
    return () => {
      unsubscribe();
      wsRef.current?.close();
    };
  }, [sessionId, onFrame]);

  useEffect(() => {
    if (resetRepsTick > 0) wsRef.current?.control("reset");
  }, [resetRepsTick]);

  const loop = useCallback(() => {
    if (!active) return;
    const now = Date.now();
    if (now - lastSentRef.current >= SEND_INTERVAL_MS) {
      const shot = webcamRef.current?.getScreenshot({ width: CAPTURE_W, height: CAPTURE_H });
      if (shot) {
        wsRef.current?.sendFrame(shot);
        lastSentRef.current = now;
      }
    }

    const canvas = canvasRef.current;
    const frame = lastFrameRef.current;
    if (canvas && frame?.landmarks) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const highlight = new Set<number>();
        for (const alert of frame.alerts) {
          const joint = exercise.tracked_joints.find((j) => j.name === alert.joint);
          if (joint) highlight.add(joint.vertex);
        }
        drawSkeleton(ctx, frame.landmarks, canvas.width, canvas.height, highlight);
        for (const snap of frame.angles) {
          const joint = exercise.tracked_joints.find((j) => j.name === snap.joint);
          if (!joint) continue;
          drawAngleLabel(ctx, frame.landmarks, joint.vertex, snap.angle, snap.in_safe_zone, canvas.width, canvas.height);
        }
      }
    }
    requestAnimationFrame(loop);
  }, [active, exercise.tracked_joints]);

  useEffect(() => {
    if (active) requestAnimationFrame(loop);
  }, [active, loop]);

  // NOTE: capture frames are NOT mirrored — sent to backend in natural
  // orientation so MediaPipe "right/left" labels match the user's actual
  // anatomy. Mirroring is applied only visually for mirror-like UX.
  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
      <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.7}
          videoConstraints={{ width: CAPTURE_W, height: CAPTURE_H, facingMode: "user" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
}
