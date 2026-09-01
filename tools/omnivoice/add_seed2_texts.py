#!/usr/bin/env python3
# ============================================================
# add_seed2_texts.py — Bổ sung CÂU của seed2.js vào texts.json
# ------------------------------------------------------------
# Chỉ thêm CÂU (ví dụ + câu chức năng) — KHÔNG thêm từ đơn vì
# app dùng TTS cho từ đơn (OmniVoice đọc sai từ đơn, đã gỡ).
# Key = FNV-1a 32-bit trên UTF-8 (khớp ui.js / generate.mjs).
#     python tools/omnivoice/add_seed2_texts.py
# ============================================================
import json, os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TEXTS = os.path.join(HERE, "texts.json")
SEED2 = os.path.join(ROOT, "assets", "js", "seed2.js")


def fnv1a(text):
    h = 0x811C9DC5
    for b in str(text).strip().encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def main():
    items = json.load(open(TEXTS, encoding="utf-8"))
    have = {it["key"] for it in items}

    entries = [json.loads(m) for m in re.findall(r"^    (\{.*\}),$",
               open(SEED2, encoding="utf-8").read(), re.M)]
    print(f"seed2.js: {len(entries)} mục")

    added_r, added_e = 0, 0
    new_items = []
    # Câu chức năng (R) lên ĐẦU hàng đợi render — giá trị luyện nói cao nhất
    for it in entries:
        if it.get("grp") == "R":
            k = fnv1a(it["t"])
            if k not in have:
                new_items.append({"key": k, "text": it["t"].strip(), "type": "phrase"})
                have.add(k); added_r += 1
    for it in entries:
        e = (it.get("e") or "").strip()
        if not e:
            continue
        k = fnv1a(e)
        if k not in have:
            new_items.append({"key": k, "text": e, "type": "example"})
            have.add(k); added_e += 1

    items.extend(new_items)
    json.dump(items, open(TEXTS, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"✓ Thêm {added_r} câu chức năng + {added_e} câu ví dụ → texts.json (tổng {len(items)})")


if __name__ == "__main__":
    main()
