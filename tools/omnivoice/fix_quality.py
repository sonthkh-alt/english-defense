#!/usr/bin/env python3
# ============================================================
# fix_quality.py — Dò & sửa clip giọng kém (im lặng, click, nhiễu)
# ------------------------------------------------------------
# Không chỉ dựa RMS. Đánh giá theo NHIỀU chỉ số:
#   - rms          : âm lượng tổng thể
#   - active_ratio : tỉ lệ khung 20ms có năng lượng đáng kể (>15% đỉnh)
#   - crest        : peak/rms — cao = click trong im lặng
#   - voiced_sec   : tổng giây thực sự có tiếng nói
# Clip "tốt" phải đạt CẢ 4 ngưỡng. Không đạt → render lại (tối đa
# MAX_TRY lần, giữ bản điểm cao nhất). Nếu OmniVoice vẫn không đọc
# được từ đó → GỠ khỏi gói (xóa .wav) để app tự fallback sang
# Dictionary API / giọng trình duyệt.
#
#     python tools/omnivoice/fix_quality.py
# ============================================================
import os, sys, json
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "assets", "audio")
TEXTS = os.path.join(HERE, "texts.json")
INSTRUCT = "female, young adult, moderate pitch, american accent"

MAX_TRY = 8
# Ngưỡng "đạt chuẩn"
MIN_RMS = 0.035
MIN_ACTIVE = 0.30
MAX_CREST = 12.0
MIN_VOICED = 0.30


def analyze(sig, sr=24000):
    a = np.asarray(sig, dtype=np.float32)
    if a.ndim > 1:
        a = a[:, 0]
    n = len(a)
    if n == 0:
        return dict(rms=0, crest=99, active=0, voiced=0, dur=0)
    rms = float(np.sqrt(np.mean(a ** 2)))
    peak = float(np.max(np.abs(a)))
    crest = peak / (rms + 1e-9)
    w = int(0.02 * sr)
    fe = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, max(1, n - w), w)])
    active = float(np.mean(fe > 0.15 * (fe.max() + 1e-9)))
    voiced = float(np.sum(fe > 0.02) * w / sr)
    return dict(rms=rms, crest=crest, active=active, voiced=voiced, dur=n / sr)


def is_good(m):
    return (m["rms"] >= MIN_RMS and m["active"] >= MIN_ACTIVE
            and m["crest"] <= MAX_CREST and m["voiced"] >= MIN_VOICED)


def score(m):
    # Ưu tiên nhiều tiếng nói liên tục + đủ âm lượng, phạt crest cao
    return m["active"] * min(m["rms"], 0.12) - max(0, m["crest"] - MAX_CREST) * 0.002


def main():
    items = {t["key"]: t for t in json.load(open(TEXTS, encoding="utf-8"))}

    bad = []
    for f in os.listdir(OUT_DIR):
        if not f.endswith(".wav"):
            continue
        key = f[:-4]
        if key not in items:
            continue
        a, sr = sf.read(os.path.join(OUT_DIR, f))
        if not is_good(analyze(a, sr)):
            bad.append(key)

    print(f"Clip chưa đạt chuẩn: {len(bad)}")
    if not bad:
        print("Tất cả đạt chuẩn. Xong.")
        return

    import torch
    from omnivoice import OmniVoice
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    print(f"Thiết bị: {device} · nạp model…")
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype)

    fixed, dropped = 0, []
    for i, key in enumerate(bad, 1):
        it = items[key]
        text = it["text"].strip()
        gen_text = text if it.get("type") != "word" else (text.rstrip(".!?") + ".")
        out = os.path.join(OUT_DIR, key + ".wav")

        # Đưa cả bản GỐC vào so sánh — không làm tệ hơn hiện trạng
        best_sig, best_m = None, None
        if os.path.exists(out):
            oa, osr = sf.read(out)
            best_sig = np.asarray(oa if getattr(oa, "ndim", 1) == 1 else oa[:, 0], dtype=np.float32)
            best_m = analyze(best_sig)

        for attempt in range(1, MAX_TRY + 1):
            try:
                audio = model.generate(text=gen_text, instruct=INSTRUCT)
                sig = np.asarray(audio[0], dtype=np.float32)
            except Exception as e:
                print(f"[{i}/{len(bad)}] '{text[:22]}' thử {attempt} FAIL — {e}")
                continue
            m = analyze(sig)
            if best_m is None or score(m) > score(best_m):
                best_m, best_sig = m, sig
            if is_good(m):
                break

        # Gỡ chỉ khi bản tốt nhất vẫn hỏng nặng (gần như im lặng/click)
        broken = best_m is None or (best_m["active"] < 0.22 or best_m["rms"] < 0.02)
        if broken:
            if os.path.exists(out):
                os.remove(out)
            dropped.append(text)
            b = best_m or {}
            print(f"[{i}/{len(bad)}] GỠ  '{text[:22]}' → dùng giọng dự phòng "
                  f"(tốt nhất active={b.get('active',0):.2f} rms={b.get('rms',0):.3f})")
        else:
            sf.write(out, best_sig, 24000)
            fixed += 1
            tag = "" if is_good(best_m) else "  (chấp nhận được)"
            print(f"[{i}/{len(bad)}] OK  '{text[:22]}'  active={best_m['active']:.2f} rms={best_m['rms']:.3f}{tag}")

    # Rebuild manifest từ toàn bộ wav còn lại
    keys = sorted(f[:-4] for f in os.listdir(OUT_DIR) if f.endswith(".wav"))
    json.dump({"engine": "omnivoice", "instruct": INSTRUCT, "format": "wav", "keys": keys},
              open(os.path.join(OUT_DIR, "manifest.json"), "w"))
    print(f"\nXong: sửa {fixed}, gỡ {len(dropped)}. Manifest còn {len(keys)} clip.")
    if dropped:
        print("Đã gỡ (fallback giọng khác):", ", ".join(dropped))


if __name__ == "__main__":
    main()
