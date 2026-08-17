#!/usr/bin/env python3
# ============================================================
# render.py — Render gói audio bằng OmniVoice CỤC BỘ (GPU)
# ------------------------------------------------------------
# Dùng khi có GPU (máy có CUDA hoặc Google Colab free GPU) — KHÔNG bị
# giới hạn hạn mức như HF Space công cộng.
#
# Chuẩn bị danh sách văn bản:
#     node tools/omnivoice/generate.mjs dump words     # hoặc: sentences | all
# Rồi chạy:
#     pip install omnivoice soundfile torch
#     python tools/omnivoice/render.py
#
# Kết quả: assets/audio/<key>.wav  +  assets/audio/manifest.json
# (key khớp fnv1a với ui.js & generate.mjs — app tự nhận diện.)
# ============================================================
import os, sys, json

# Windows + Python 3.14 mặc định ghi log bằng cp1252 → ép UTF-8 để in tiếng Việt
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Bộ cần render: words (chỉ từ vựng) | sentences (câu) | all (mặc định)
SET = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
SET_TYPES = {"words": {"word"}, "sentences": {"example", "question", "phrase", "rescue"}}

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "assets", "audio")
TEXTS = os.path.join(HERE, "texts.json")

# Giọng cố định cho cả gói (khớp generate.mjs): Nữ / Thanh niên / Anh-Mỹ
INSTRUCT = "female, young adult, moderate pitch, american accent"


def load_items():
    with open(TEXTS, "r", encoding="utf-8") as f:
        return json.load(f)


def write_manifest(keys):
    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"engine": "omnivoice", "instruct": INSTRUCT, "format": "wav", "keys": sorted(keys)}, f)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    items = load_items()
    if SET in SET_TYPES:
        items = [it for it in items if it.get("type") in SET_TYPES[SET]]
    print(f"Bộ='{SET}' · {len(items)} mục cần render → {OUT_DIR}")

    import torch
    import soundfile as sf
    from omnivoice import OmniVoice

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    print(f"Thiết bị: {device}")
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype)

    keys, made, skip, fail = set(), 0, 0, 0
    for i, it in enumerate(items, 1):
        key, text = it["key"], it["text"]
        out = os.path.join(OUT_DIR, key + ".wav")
        if os.path.exists(out) and os.path.getsize(out) > 100:
            keys.add(key); skip += 1; continue
        try:
            audio = model.generate(text=text, instruct=INSTRUCT)
            sf.write(out, audio[0], 24000)
            keys.add(key); made += 1
            if made % 20 == 0:
                write_manifest(keys)
            print(f"[{i}/{len(items)}] OK  {text[:40]}")
        except Exception as e:
            fail += 1
            print(f"[{i}/{len(items)}] FAIL {text[:40]} — {e}")

    write_manifest(keys)
    print(f"\nXong: tạo mới {made}, bỏ qua {skip}, lỗi {fail}. Tổng manifest: {len(keys)}.")


if __name__ == "__main__":
    main()
