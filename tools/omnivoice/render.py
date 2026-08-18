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
import numpy as np

# Windows + Python 3.14 mặc định ghi log bằng cp1252 → ép UTF-8 để in tiếng Việt
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# OmniVoice trên CPU đôi khi render TỪ ĐƠN ngắn ra gần như im lặng + 1 tiếng
# "tách" (nghe thành tiếng kịch). Kiểm tra RMS & thử lại để loại bản hỏng.
MIN_RMS = 0.025   # dưới mức này coi là hỏng (im lặng/click)
RETRIES = 5       # số lần thử tối đa mỗi mục


def _rms(sig):
    s = np.asarray(sig, dtype=np.float32)
    return float(np.sqrt(np.mean(s ** 2))) if len(s) else 0.0

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


def write_manifest(_keys=None):
    # Luôn quét TẤT CẢ file .wav trong thư mục → manifest không bao giờ
    # bỏ sót key của đợt render trước (từ vựng + câu chung một manifest).
    keys = sorted(f[:-4] for f in os.listdir(OUT_DIR) if f.endswith(".wav"))
    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"engine": "omnivoice", "instruct": INSTRUCT, "format": "wav", "keys": keys}, f)


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
        # Từ đơn thêm dấu chấm → model phát âm trọn vẹn, tránh cụt/click
        gen_text = text if it.get("type") != "word" else (text.rstrip(".!?") + ".")
        best_rms, best_audio = -1.0, None
        for _ in range(RETRIES):
            try:
                audio = model.generate(text=gen_text, instruct=INSTRUCT)
                sig = np.asarray(audio[0], dtype=np.float32)
            except Exception as e:
                print(f"[{i}/{len(items)}] FAIL {text[:40]} — {e}")
                continue
            r = _rms(sig)
            if r > best_rms:
                best_rms, best_audio = r, sig
            if r >= MIN_RMS:  # đạt chuẩn thì dừng thử
                break
        if best_audio is None:
            fail += 1
            continue
        sf.write(out, best_audio, 24000)
        keys.add(key); made += 1
        if made % 20 == 0:
            write_manifest(keys)
        flag = "" if best_rms >= MIN_RMS else "  ⚠ RMS thấp"
        print(f"[{i}/{len(items)}] OK  {text[:40]}{flag}")

    write_manifest(keys)
    print(f"\nXong: tạo mới {made}, bỏ qua {skip}, lỗi {fail}. Tổng manifest: {len(keys)}.")


if __name__ == "__main__":
    main()
