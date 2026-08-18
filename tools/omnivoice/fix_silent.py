#!/usr/bin/env python3
# ============================================================
# fix_silent.py — Render lại các clip bị "tiếng kịch" (im lặng + click)
# ------------------------------------------------------------
# OmniVoice trên CPU đôi khi render TỪ ĐƠN ngắn ra gần như im lặng
# (RMS rất thấp) kèm 1 tiếng "tách" → nghe thành tiếng kịch.
# Script này quét toàn bộ assets/audio, tìm file RMS < NGƯỠNG, rồi
# render LẠI (thử nhiều lần, giữ bản có RMS cao nhất). Với từ đơn,
# thêm dấu chấm để model phát âm trọn vẹn hơn.
#
#     python tools/omnivoice/fix_silent.py            # ngưỡng mặc định 0.025
#     python tools/omnivoice/fix_silent.py 0.03       # tùy chỉnh ngưỡng
# ============================================================
import os, sys, json
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import soundfile as sf

THRESH = float(sys.argv[1]) if len(sys.argv) > 1 else 0.025
RETRIES = 5                 # số lần thử tối đa mỗi mục
GOOD_RMS = 0.03             # đạt mức này thì dừng thử

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "assets", "audio")
TEXTS = os.path.join(HERE, "texts.json")
INSTRUCT = "female, young adult, moderate pitch, american accent"


def rms_of(path):
    a, sr = sf.read(path)
    if getattr(a, "ndim", 1) > 1:
        a = a[:, 0]
    return float(np.sqrt(np.mean(a ** 2))) if len(a) else 0.0


def main():
    items = {t["key"]: t for t in json.load(open(TEXTS, encoding="utf-8"))}

    # Tìm các clip bị lỗi (im lặng/click)
    bad = []
    for f in os.listdir(OUT_DIR):
        if not f.endswith(".wav"):
            continue
        key = f[:-4]
        if key not in items:
            continue
        try:
            if rms_of(os.path.join(OUT_DIR, f)) < THRESH:
                bad.append(key)
        except Exception as e:
            print(f"[skip đọc lỗi] {f}: {e}")

    print(f"Ngưỡng RMS={THRESH} · cần render lại: {len(bad)} clip")
    if not bad:
        print("Không có clip nào cần sửa. Xong.")
        return

    import torch
    from omnivoice import OmniVoice
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    print(f"Thiết bị: {device} · nạp model…")
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype)

    fixed, giveup = 0, 0
    for i, key in enumerate(bad, 1):
        it = items[key]
        text = it["text"].strip()
        typ = it.get("type", "")
        # Từ đơn: thêm dấu chấm để model phát âm trọn vẹn, tránh cụt/click
        gen_text = text if typ != "word" else (text.rstrip(".!?") + ".")
        out = os.path.join(OUT_DIR, key + ".wav")

        best_rms, best_audio = -1.0, None
        for attempt in range(1, RETRIES + 1):
            try:
                audio = model.generate(text=gen_text, instruct=INSTRUCT)
                sig = np.asarray(audio[0], dtype=np.float32)
                r = float(np.sqrt(np.mean(sig ** 2))) if len(sig) else 0.0
            except Exception as e:
                print(f"[{i}/{len(bad)}] '{text[:24]}' thử {attempt} FAIL — {e}")
                continue
            if r > best_rms:
                best_rms, best_audio = r, sig
            if r >= GOOD_RMS:
                break

        if best_audio is not None and best_rms >= THRESH:
            sf.write(out, best_audio, 24000)
            fixed += 1
            print(f"[{i}/{len(bad)}] OK  '{text[:24]}'  RMS {best_rms:.4f}")
        else:
            giveup += 1
            print(f"[{i}/{len(bad)}] GIỮ NGUYÊN '{text[:24]}' — RMS tốt nhất {best_rms:.4f} vẫn thấp")

    print(f"\nXong: sửa {fixed}, không cải thiện {giveup}, tổng xử lý {len(bad)}.")


if __name__ == "__main__":
    main()
