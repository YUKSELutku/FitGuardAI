import type { Landmark } from "@/types";

export const POSE_CONNECTIONS: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
  [0, 11], [0, 12],
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
  highlight: Set<number> = new Set(),
) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#10b981";

  for (const [a, b] of POSE_CONNECTIONS) {
    const la = landmarks[a];
    const lb = landmarks[b];
    if (!la || !lb) continue;
    if (la.visibility < 0.5 || lb.visibility < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(la.x * width, la.y * height);
    ctx.lineTo(lb.x * width, lb.y * height);
    ctx.stroke();
  }

  landmarks.forEach((lm, idx) => {
    if (lm.visibility < 0.5) return;
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, highlight.has(idx) ? 8 : 4, 0, Math.PI * 2);
    ctx.fillStyle = highlight.has(idx) ? "#ef4444" : "#22d3ee";
    ctx.fill();
  });
}

export function drawAngleLabel(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  vertexIdx: number,
  angle: number,
  inZone: boolean,
  width: number,
  height: number,
) {
  const lm = landmarks[vertexIdx];
  if (!lm || lm.visibility < 0.5) return;
  const x = lm.x * width;
  const y = lm.y * height;
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = inZone ? "#10b981" : "#ef4444";
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 3;
  const text = `${angle.toFixed(0)}°`;
  ctx.strokeText(text, x + 10, y - 10);
  ctx.fillText(text, x + 10, y - 10);
}
