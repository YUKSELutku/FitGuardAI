const lastSpoken = new Map<string, number>();
const COOLDOWN_MS = 5000;

export function speak(text: string, key: string = text, priority: "high" | "low" = "low") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const now = Date.now();
  const last = lastSpoken.get(key) ?? 0;
  if (now - last < COOLDOWN_MS) return;
  lastSpoken.set(key, now);

  if (priority === "high") window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "tr-TR";
  const voices = window.speechSynthesis.getVoices();
  const tr = voices.find((v) => v.lang?.toLowerCase().startsWith("tr"));
  if (tr) utter.voice = tr;
  utter.rate = 1.05;
  utter.pitch = 1.0;
  utter.volume = 0.9;
  window.speechSynthesis.speak(utter);
}

export function clearTTS() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
