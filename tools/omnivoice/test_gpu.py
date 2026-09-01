#!/usr/bin/env python3
# test_gpu.py — Thử render 2 câu trên GPU: đo thời gian + VRAM, bắt OOM.
import sys, time, json, os
try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass
import numpy as np
import torch
from omnivoice import OmniVoice

INSTRUCT = "female, young adult, moderate pitch, american accent"
SENTS = [
    "It is a great honor to present my dissertation today.",
    "The local authority approved the plan.",
]

device = "cuda:0"
print("Free VRAM truoc khi nap:", torch.cuda.mem_get_info()[0] // (1024**2), "MiB")
t0 = time.time()
try:
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=torch.float16)
except torch.cuda.OutOfMemoryError as e:
    print("OOM_LOAD:", e); sys.exit(2)
except Exception as e:
    print("LOAD_FAIL:", type(e).__name__, e); sys.exit(3)
print(f"Nap model: {time.time()-t0:.1f}s · VRAM da dung: {torch.cuda.memory_allocated()//(1024**2)} MiB · con trong: {torch.cuda.mem_get_info()[0]//(1024**2)} MiB")

for s in SENTS:
    t = time.time()
    try:
        audio = model.generate(text=s, instruct=INSTRUCT)
    except torch.cuda.OutOfMemoryError as e:
        print("OOM_GEN:", e); sys.exit(2)
    sig = np.asarray(audio[0], dtype=np.float32)
    rms = float(np.sqrt(np.mean(sig ** 2))) if len(sig) else 0.0
    print(f"OK {time.time()-t:.1f}s · {len(sig)/24000:.1f}s audio · RMS {rms:.3f} · '{s[:40]}'")
print("GPU_TEST_PASS")
