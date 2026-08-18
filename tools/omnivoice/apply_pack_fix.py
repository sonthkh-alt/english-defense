#!/usr/bin/env python3
# apply_pack_fix.py — Dọn gói OmniVoice cho ĐÚNG:
#   1) GỠ toàn bộ clip TỪ ĐƠN (OmniVoice/CPU đọc sai ~50%) → app tự dùng
#      giọng người thật Dictionary API + TTS (chuẩn cho từ đơn).
#   2) ASR-kiểm CÂU (example/question/phrase); gỡ clip nào đọc sai.
#   3) Rebuild manifest từ các wav còn lại.
# Chạy: python tools/omnivoice/apply_pack_fix.py
import os, sys, json, re, difflib, warnings
try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass
warnings.filterwarnings("ignore")
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "assets", "audio")
TEXTS = os.path.join(HERE, "texts.json")
INSTRUCT = "female, young adult, moderate pitch, american accent"


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def resample16k(a, sr):
    if a.ndim > 1: a = a[:, 0]
    if sr == 16000: return a.astype(np.float32)
    x = np.arange(0, len(a), sr / 16000.0); x = x[x < len(a) - 1]
    return np.interp(x, np.arange(len(a)), a).astype(np.float32)


def rebuild_manifest():
    keys = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".wav"))
    json.dump({"engine": "omnivoice", "instruct": INSTRUCT, "format": "wav", "keys": keys},
              open(os.path.join(OUT, "manifest.json"), "w"))
    return len(keys)


def main():
    items = json.load(open(TEXTS, encoding="utf-8"))

    # 1) Gỡ toàn bộ TỪ ĐƠN khỏi gói
    removed_words = 0
    for it in items:
        if it.get("type") == "word":
            p = os.path.join(OUT, it["key"] + ".wav")
            if os.path.exists(p):
                os.remove(p); removed_words += 1
    print(f"1) Đã gỡ {removed_words} clip TỪ ĐƠN → app dùng Dictionary API + TTS.")

    # 2) ASR-kiểm CÂU (giữ lại loại nhiều chữ)
    sents = [it for it in items if it.get("type") in ("example", "question", "phrase")]
    from transformers import pipeline
    print(f"2) Nạp Whisper-base.en · kiểm {len(sents)} câu…")
    asr = pipeline("automatic-speech-recognition", model="openai/whisper-base.en")

    removed_sents = []
    for i, it in enumerate(sents, 1):
        p = os.path.join(OUT, it["key"] + ".wav")
        if not os.path.exists(p): continue
        a, sr = sf.read(p)
        heard = norm(asr(resample16k(a, sr))["text"])
        want = norm(it["text"])
        ratio = difflib.SequenceMatcher(None, want, heard).ratio()
        wset, hset = set(want.split()), set(heard.split())
        overlap = len(wset & hset) / max(1, len(wset))
        ok = (want in heard) or ratio >= 0.6 or overlap >= 0.5
        if not ok:
            os.remove(p); removed_sents.append(it["text"])
            print(f"   [{i}] GỠ câu đọc sai: '{it['text'][:45]}' → nghe '{heard[:45]}'")

    total = rebuild_manifest()
    print(f"\nXong. Gỡ {removed_words} từ + {len(removed_sents)} câu. Manifest còn {total} clip (chủ yếu câu).")
    if removed_sents:
        print("Câu đã gỡ:", " | ".join(s[:40] for s in removed_sents))


if __name__ == "__main__":
    main()
