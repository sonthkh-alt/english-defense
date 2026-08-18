#!/usr/bin/env python3
# verify_asr.py — Dùng Whisper "nghe" từng clip TỪ ĐƠN, so với chữ gốc.
# Phát hiện clip đọc SAI (âm thanh nghe như nói nhưng không đúng chữ) —
# điều mà đo sóng âm không bắt được.
#     python tools/omnivoice/verify_asr.py            # kiểm tra 'word'
#     python tools/omnivoice/verify_asr.py all        # kiểm tra tất cả
import os, sys, json, re, difflib, warnings
try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass
warnings.filterwarnings("ignore")
import numpy as np, soundfile as sf

SCOPE = sys.argv[1] if len(sys.argv) > 1 else "word"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "assets", "audio")
TEXTS = os.path.join(HERE, "texts.json")


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def resample16k(a, sr):
    if a.ndim > 1: a = a[:, 0]
    if sr == 16000: return a.astype(np.float32)
    x = np.arange(0, len(a), sr / 16000.0)
    x = x[x < len(a) - 1]
    return np.interp(x, np.arange(len(a)), a).astype(np.float32)


def main():
    items = json.load(open(TEXTS, encoding="utf-8"))
    if SCOPE != "all":
        items = [it for it in items if it.get("type") == SCOPE]
    from transformers import pipeline
    print(f"Nạp Whisper-base.en · kiểm tra {len(items)} clip loại '{SCOPE}'…")
    asr = pipeline("automatic-speech-recognition", model="openai/whisper-base.en")

    fails = []
    for i, it in enumerate(items, 1):
        p = os.path.join(OUT, it["key"] + ".wav")
        if not os.path.exists(p):
            continue
        a, sr = sf.read(p)
        heard = norm(asr(resample16k(a, sr))["text"])
        want = norm(it["text"])
        # đạt nếu chữ gốc nằm trong câu nghe được, hoặc rất giống
        ratio = difflib.SequenceMatcher(None, want, heard).ratio()
        wset = set(want.split()); hset = set(heard.split())
        overlap = len(wset & hset) / max(1, len(wset))
        ok = (want in heard) or ratio >= 0.75 or overlap >= 0.6
        if not ok:
            fails.append((it["key"], it["text"], heard))
            print(f"[{i}] SAI  '{it['text']}'  → nghe: '{heard}'")
    print(f"\n=== {len(fails)}/{len(items)} clip đọc SAI ===")
    json.dump([f[0] for f in fails], open(os.path.join(HERE, "asr_fails.json"), "w"))
    print("Đã lưu danh sách key sai → tools/omnivoice/asr_fails.json")


if __name__ == "__main__":
    main()
