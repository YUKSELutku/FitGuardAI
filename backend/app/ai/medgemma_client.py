from __future__ import annotations

import json
import logging
import threading
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


class MedGemmaClient:
    """Singleton wrapper around a MedGemma causal LM.

    Real model is lazy-loaded on first call. If `MOCK_MEDGEMMA=true`, a
    deterministic mock response is returned — useful for dev machines
    without enough VRAM to run medgemma-4b.
    """

    _instance: Optional["MedGemmaClient"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._model = None
        self._tokenizer = None
        self._device = None
        self._loaded = False
        self._load_lock = threading.Lock()

    @classmethod
    def instance(cls) -> "MedGemmaClient":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _ensure_loaded(self) -> None:
        if self._loaded or settings.mock_medgemma:
            return
        with self._load_lock:
            if self._loaded:
                return
            import torch  # local import to avoid startup cost when mocked
            from transformers import AutoModelForCausalLM, AutoTokenizer

            if torch.cuda.is_available():
                device = "cuda"
            elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
                device = "mps"
            else:
                device = "cpu"
            self._device = device

            kwargs: dict = {"torch_dtype": "auto"}
            if settings.use_quantization and device == "cuda":
                try:
                    from transformers import BitsAndBytesConfig

                    kwargs["quantization_config"] = BitsAndBytesConfig(load_in_4bit=True)
                except Exception as e:  # bitsandbytes optional
                    logger.warning("Quantization unavailable: %s", e)

            logger.info("Loading MedGemma model %s on %s", settings.medgemma_model, device)
            self._tokenizer = AutoTokenizer.from_pretrained(settings.medgemma_model)
            self._model = AutoModelForCausalLM.from_pretrained(
                settings.medgemma_model, **kwargs
            )
            if "quantization_config" not in kwargs:
                self._model.to(device)
            self._model.eval()
            self._loaded = True

    def generate(self, prompt: str, max_new_tokens: int = 512) -> str:
        if settings.mock_medgemma:
            return self._mock_response(prompt)

        self._ensure_loaded()
        import torch

        messages = [{"role": "user", "content": prompt}]
        inputs = self._tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(self._device)

        input_len = inputs["input_ids"].shape[-1]
        with torch.no_grad():
            output_ids = self._model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
            )
        generated = output_ids[0, input_len:]
        return self._tokenizer.decode(generated, skip_special_tokens=True)

    # --- mock ----------------------------------------------------------

    def _mock_response(self, prompt: str) -> str:
        """Return a deterministic fake response based on prompt content."""
        if "modified_ranges" in prompt:
            # Parse out default ranges from the prompt to echo back
            condition_present = "(none provided)" not in prompt
            # Default: return unchanged. If condition present, narrow by 10° both sides.
            default_block = _extract_default_ranges(prompt)
            if condition_present:
                narrowed = {
                    k: [min(180, v[0] + 10), max(0, v[1] - 10)]
                    for k, v in default_block.items()
                }
                payload = {
                    "modified_ranges": narrowed,
                    "reasoning": (
                        "Mock response: narrowed ROM by 10° at both ends due to "
                        "stated medical condition. Replace with real MedGemma output."
                    ),
                    "warnings": [
                        "This is a mock — install MedGemma for real medical guidance.",
                        "Stop and consult a clinician if pain increases.",
                    ],
                    "alternative_exercises": ["Isometric hold", "Resistance band variant"],
                }
            else:
                payload = {
                    "modified_ranges": {k: list(v) for k, v in default_block.items()},
                    "reasoning": "Mock response: no condition provided, returning defaults.",
                    "warnings": [],
                    "alternative_exercises": [],
                }
            return json.dumps(payload)
        # Summary prompt
        return (
            "Mock session summary: form was generally consistent. Watch elbow "
            "symmetry on the next set. Consider slowing the eccentric phase to "
            "around two seconds for better control."
        )


def _extract_default_ranges(prompt: str) -> dict[str, tuple[float, float]]:
    import re

    m = re.search(r"Default safe ranges:\s*(\{[^}]*\})", prompt)
    if not m:
        return {}
    try:
        data = json.loads(m.group(1).replace("'", '"'))
    except json.JSONDecodeError:
        return {}
    out: dict[str, tuple[float, float]] = {}
    for k, v in data.items():
        if isinstance(v, list) and len(v) == 2:
            out[k] = (float(v[0]), float(v[1]))
    return out
