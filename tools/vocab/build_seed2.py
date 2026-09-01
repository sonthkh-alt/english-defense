#!/usr/bin/env python3
# ============================================================
# build_seed2.py — Sinh assets/js/seed2.js từ vocab2000-*.txt
#   Định dạng nguồn: term|pos|meaning|example|exampleVi|group
#   • Khử trùng lặp với seed.js và trong chính bộ mới
#   • Điền IPA bằng CMUdict (từ đơn & cụm ngắn; câu thì bỏ qua)
#   pip install cmudict  ·  python tools/vocab/build_seed2.py
# ============================================================
import json, os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
import cmudict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SEED = os.path.join(ROOT, "assets", "js", "seed.js")
OUT = os.path.join(ROOT, "assets", "js", "seed2.js")

GROUPS = {
    "K": ("AWL — Học thuật tổng quát (1–5)", 2, "📖"),
    "L": ("AWL — Học thuật tổng quát (6–10)", 2, "📚"),
    "M": ("Kinh tế & chính sách mở rộng", 3, "📈"),
    "N": ("Hành chính công & chuyển đổi số", 3, "🏛"),
    "P": ("Phương pháp nghiên cứu & thống kê", 4, "🔬"),
    "Q": ("Cụm từ & collocation học thuật", 2, "🧩"),
    "R": ("Câu chức năng thuyết trình & Q&A", 2, "🗣"),
}

# Sửa các khóa cụm từ viết tạm bằng dấu gạch nối
FIX = {
    "confirm-findings": "confirm the findings", "enhance-capacity": "enhance capacity",
    "exceed-target": "exceed the target", "explicit-goal": "explicit goal",
    "incentive-scheme": "incentive scheme", "instruct-officials": "instruct officials",
    "interview-data": "interview data", "refine-model": "refine the model",
    "regional-disparity": "regional disparity", "temporary-measure": "temporary measure",
    "convince-committee": "convince the committee", "infrastructure-gap": "infrastructure gap",
    "overlap-function": "overlapping functions", "pilot-program": "pilot program",
    "ensure-compliance": "ensure compliance", "excluded-group": "excluded group",
    "framework-law": "framework law", "welfare-state": "welfare state",
    "empirical-evidence": "empirical evidence", "hypothesis-testing": "hypothesis testing",
    "qualitative-data": "qualitative data", "aggregate-demand": "aggregate demand",
    "outcome-based": "outcome-based budgeting",
}

# ---- IPA (ARPAbet → IPA, giống fill_ipa_cmudict.py) ----
ARPA = {"AA":"ɑ","AE":"æ","AH":"ʌ","AO":"ɔ","AW":"aʊ","AY":"aɪ","B":"b","CH":"tʃ",
        "D":"d","DH":"ð","EH":"ɛ","ER":"ɜr","EY":"eɪ","F":"f","G":"ɡ","HH":"h",
        "IH":"ɪ","IY":"i","JH":"dʒ","K":"k","L":"l","M":"m","N":"n","NG":"ŋ",
        "OW":"oʊ","OY":"ɔɪ","P":"p","R":"r","S":"s","SH":"ʃ","T":"t","TH":"θ",
        "UH":"ʊ","UW":"u","V":"v","W":"w","Y":"j","Z":"z","ZH":"ʒ"}
VOWELS = {"AA","AE","AH","AO","AW","AY","EH","ER","EY","IH","IY","OW","OY","UH","UW"}
VSYM = {ARPA[v] for v in VOWELS}
CMU = cmudict.dict()

def arpa_to_ipa(phones):
    out = []
    for ph in phones:
        m = re.match(r"^([A-Z]+)([0-2])?$", ph)
        if not m: continue
        base, stress = m.group(1), m.group(2)
        sym = ARPA.get(base)
        if not sym: continue
        if base in VOWELS and stress in ("1", "2"):
            i = len(out)
            while i > 0 and out[i-1] not in ("ˈ","ˌ") and out[i-1] not in VSYM:
                i -= 1
            out.insert(i, "ˈ" if stress == "1" else "ˌ")
        out.append(sym)
    return "".join(out)

def ipa_for(term):
    words = re.split(r"[\s]+", term.strip())
    if len(words) > 3:
        return ""
    parts = []
    for w in words:
        w2 = re.sub(r"[^A-Za-z'\-]", "", w).lower()
        p = CMU.get(w2)
        if not p and "-" in w2:
            subs = [CMU.get(x) for x in w2.split("-")]
            if all(subs):
                parts.append("".join(arpa_to_ipa(s[0]) for s in subs))
                continue
        if not p:
            return ""
        parts.append(arpa_to_ipa(p[0]))
    return "/" + " ".join(parts) + "/"

def main():
    existing = {t.lower() for t in re.findall(r'\{ t: "([^"]+)"', open(SEED, encoding="utf-8").read())}
    seen, items, skipped = set(), [], []
    files = sorted(f for f in os.listdir(HERE) if re.match(r"vocab2000-[a-z]\.txt$", f))
    for fn in files:
        for ln, line in enumerate(open(os.path.join(HERE, fn), encoding="utf-8"), 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("|")
            if len(parts) != 6:
                print(f"⚠ {fn}:{ln} sai định dạng ({len(parts)} cột)"); continue
            t, p, m, e, ev, g = [x.strip() for x in parts]
            t = FIX.get(t, t)
            if g not in GROUPS:
                print(f"⚠ {fn}:{ln} nhóm lạ: {g}"); continue
            key = t.lower()
            if key in existing or key in seen:
                skipped.append(t); continue
            seen.add(key)
            gname, lvl, icon = GROUPS[g]
            ipa = "" if g == "R" else ipa_for(t)
            items.append({"t": t, "p": p, "m": m, "e": e, "ev": ev,
                          "ipa": ipa, "ic": icon, "lvl": lvl, "grp": g, "grpName": gname})

    # sắp theo nhóm rồi alphabet để file ổn định
    order = list(GROUPS.keys())
    items.sort(key=lambda x: (order.index(x["grp"]), x["t"].lower()))

    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* ============================================================\n")
        f.write("   seed2.js — KHO TỪ MỞ RỘNG (~2.000 mục cùng seed.js)\n")
        f.write("   SINH TỰ ĐỘNG bởi tools/vocab/build_seed2.py — ĐỪNG SỬA TAY.\n")
        f.write("   Nguồn: tools/vocab/vocab2000-*.txt (sửa ở đó rồi chạy lại).\n")
        f.write("   Nội dung: AWL 1–10 · kinh tế & chính sách · hành chính công\n")
        f.write("   & chuyển đổi số · phương pháp nghiên cứu · collocation · câu\n")
        f.write("   chức năng. IPA điền bằng CMUdict.\n")
        f.write("   ============================================================ */\n")
        f.write("(function (global) {\n  \"use strict\";\n  const VOCAB = [\n")
        for it in items:
            f.write("    " + json.dumps(it, ensure_ascii=False) + ",\n")
        f.write("  ];\n  global.SEED2 = { VOCAB };\n})(window);\n")

    n_ipa = sum(1 for x in items if x["ipa"])
    n_word = sum(1 for x in items if x["grp"] != "R")
    print(f"✓ {len(items)} mục mới → seed2.js  (bỏ {len(skipped)} trùng lặp)")
    print(f"  IPA: {n_ipa}/{n_word} mục từ/cụm có phiên âm")
    for g in GROUPS:
        n = sum(1 for x in items if x["grp"] == g)
        print(f"  {g} {GROUPS[g][0]}: {n}")
    print(f"  TỔNG kho từ = {len(existing)} (seed) + {len(items)} (seed2) = {len(existing) + len(items)}")

if __name__ == "__main__":
    main()
