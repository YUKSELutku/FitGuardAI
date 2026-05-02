# FitGuard AI

Real-time, fully-local fitness form coach. Your webcam feeds **MediaPipe** pose
estimation; **MedGemma** (a medical LLM) tailors safe joint angle ranges to any
injuries or conditions you describe. If you move outside those ranges, you get
a red skeleton overlay and a spoken cue.

Nothing is uploaded — model inference, video frames, and session history all
stay on your machine.

## Features

- 5 exercises: biceps curl, squat, shoulder press, lateral raise, deadlift
- Per-user calibration (3 reps → personal ROM, intersected with MedGemma's safe zone)
- Hysteresis-filtered safety alerts (visual + TTS, debounced)
- Rep counter with tempo chart + left/right asymmetry detection
- SQLite history with Recharts visualizations and a MedGemma-written summary

## Requirements

- **Python 3.11+**
- **Node 20+**
- A webcam
- **For real MedGemma inference:** a CUDA GPU with ≥8 GB VRAM (4-bit quantized)
  or ≥16 GB for fp16. On CPU it will technically run but each call takes
  minutes. For development use `MOCK_MEDGEMMA=true` to get deterministic fake
  responses.
- MedGemma access: `google/medgemma-4b-it` is gated on Hugging Face under the
  Health AI Developer Foundations license — accept the license, then
  `huggingface-cli login` before first run.

## Quickstart

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # edit as needed (MOCK_MEDGEMMA=true by default)
python run.py
```

Backend runs on http://localhost:8000.  Verify with:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/exercises
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.  Pick an exercise, describe any conditions,
calibrate 3 reps, and start.

## Configuration

Backend (`backend/.env`):

| Variable | Default | Notes |
| --- | --- | --- |
| `MEDGEMMA_MODEL` | `google/medgemma-4b-it` | Any HF causal LM id |
| `MOCK_MEDGEMMA` | `true` | Set `false` to load the real model |
| `USE_QUANTIZATION` | `true` | 4-bit load on CUDA (needs bitsandbytes) |
| `DB_PATH` | `./fitguard.db` | SQLite file |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | |

Frontend (`frontend/.env.local`):

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` |

## Architecture

```
┌──────────┐   WS frames (JPEG b64)   ┌──────────────────┐
│ Next.js  │ ───────────────────────▶ │ FastAPI          │
│ webcam   │                          │  ├─ MediaPipe    │
│ canvas   │ ◀─────────────────────── │  ├─ angle calc   │
│ TTS      │      landmarks +         │  ├─ safety zone  │
└──────────┘      angles + alerts     │  ├─ rep counter  │
                                      │  └─ MedGemma     │
                                      └────────┬─────────┘
                                               │
                                               ▼
                                         SQLite (history)
```

Frames are throttled to ~10 fps client-side and capped at ~15 fps server-side
to prevent WebSocket backpressure.

## Tests

```bash
cd backend
pip install pytest
pytest
```

Covers angle math, rep counter state machine, and the MedGemma JSON parser
(including the "don't widen defaults" safety policy).

## Legal

- **FitGuard AI is not a medical device.** It cannot diagnose, treat, or
  replace a licensed clinician. Stop if you feel pain.
- **MedGemma** is distributed under the
  [Health AI Developer Foundations](https://developers.google.com/health-ai-developer-foundations/terms)
  terms. Make sure your use case complies before running the real model.
- MediaPipe pose landmarks are 2D projections; side-view exercises (squat,
  deadlift) require a side camera angle.
