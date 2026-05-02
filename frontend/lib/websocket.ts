import type { FrameResult } from "@/types";

type Listener = (msg: FrameResult | any) => void;

export class SessionWebSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: number | null = null;
  private url: string;
  private closed = false;

  constructor(sessionId: string) {
    const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    this.url = `${base}/ws/session/${sessionId}`;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.listeners.forEach((l) => l(data));
      } catch {}
    };
    this.ws.onclose = () => {
      if (!this.closed) {
        this.reconnectTimer = window.setTimeout(() => this.connect(), 1500);
      }
    };
    this.ws.onerror = () => {
      try {
        this.ws?.close();
      } catch {}
    };
  }

  on(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  sendFrame(image_b64: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "frame", image_b64, ts_ms: Date.now() }));
    }
  }

  control(action: "reset" | "stop" | "pause" | "resume") {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "control", action }));
    }
  }

  close() {
    this.closed = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
