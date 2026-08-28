#!/usr/bin/env python3
# ============================================================
# fill_ipa_cmudict.py — Bù phiên âm còn thiếu bằng CMU Pronouncing
# Dictionary (offline, 126k từ) thay vì gọi API chậm.
#
# Giữ NGUYÊN phiên âm đã lấy được từ Free Dictionary API (chất lượng
# cao hơn, có dấu chia âm tiết); chỉ điền vào chỗ trống.
# Cụm nhiều từ: ghép phiên âm của từng thành phần.
#
#     pip install cmudict
#     python tools/vocab/fill_ipa_cmudict.py
# ============================================================
import json, os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass

import cmudict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
IPA_FILE = os.path.join(HERE, "ipa.json")
SEED = os.path.join(ROOT, "assets", "js", "seed.js")

# ARPAbet → IPA (giọng Mỹ). Trọng âm xử lý riêng qua chữ số cuối ký hiệu.
ARPA = {
    "AA": "ɑ", "AE": "æ", "AH": "ʌ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ",
    "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "EH": "ɛ", "ER": "ɜr",
    "EY": "eɪ", "F": "f", "G": "ɡ", "HH": "h", "IH": "ɪ", "IY": "i",
    "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ",
    "OW": "oʊ", "OY": "ɔɪ", "P": "p", "R": "r", "S": "s", "SH": "ʃ",
    "T": "t", "TH": "θ", "UH": "ʊ", "UW": "u", "V": "v", "W": "w",
    "Y": "j", "Z": "z", "ZH": "ʒ",
}
VOWELS = {"AA","AE","AH","AO","AW","AY","EH","ER","EY","IH","IY","OW","OY","UH","UW"}

CMU = cmudict.dict()

# Thuật ngữ chuyên ngành không có trong CMUdict — phiên âm nhập tay
# (ghép theo gốc từ đã có: cyclical /ˈsɪklɪkəl/, factual /ˈfæktʃuəl/…)
MANUAL = {
    "externality": "/ˌɛkstɜrˈnælɪti/",
    "endogeneity": "/ˌɛndoʊdʒəˈniːɪti/",
    "purposive sampling": "/ˈpɜrpəsɪv ˈsæmplɪŋ/",
    "generalizability": "/ˌdʒɛnərələzəˈbɪləti/",
    "countercyclical": "/ˌkaʊntərˈsɪklɪkəl/",
    "counterfactual": "/ˌkaʊntərˈfæktʃuəl/",
}


def arpa_to_ipa(phones):
    """Chuỗi ARPAbet → IPA, đặt ˈ trước âm tiết trọng âm chính, ˌ với phụ."""
    out = []
    for ph in phones:
        m = re.match(r"^([A-Z]+)([0-2])?$", ph)
        if not m:
            continue
        base, stress = m.group(1), m.group(2)
        sym = ARPA.get(base)
        if not sym:
            continue
        if base in VOWELS and stress in ("1", "2"):
            # đặt dấu trọng âm ở ĐẦU âm tiết: lùi qua các phụ âm ngay trước
            i = len(out)
            while i > 0 and out[i - 1] not in ("ˈ", "ˌ") and not _is_vowel_sym(out[i - 1]):
                i -= 1
            out.insert(i, "ˈ" if stress == "1" else "ˌ")
        out.append(sym)
    return "".join(out)


_VOWEL_SYMS = {ARPA[v] for v in VOWELS}
def _is_vowel_sym(s):
    return s in _VOWEL_SYMS


def lookup(word):
    p = CMU.get(word.lower())
    return arpa_to_ipa(p[0]) if p else ""


def ipa_for(term):
    if term.lower() in MANUAL:
        return MANUAL[term.lower()]
    direct = lookup(term)
    if direct:
        return "/" + direct + "/"
    parts = re.split(r"[\s\-]+", term)
    if len(parts) < 2:
        return ""
    got = [lookup(p) for p in parts]
    if not all(got):
        return ""
    return "/" + " ".join(got) + "/"


def main():
    terms = re.findall(r'\{\s*t:\s*"([^"]+)"', open(SEED, encoding="utf-8").read())
    data = json.load(open(IPA_FILE, encoding="utf-8")) if os.path.exists(IPA_FILE) else {}

    from_api = sum(1 for t in terms if data.get(t))
    filled, still = 0, []
    for t in terms:
        if data.get(t):
            continue
        p = ipa_for(t)
        if p:
            data[t] = p; filled += 1
        else:
            data[t] = ""; still.append(t)

    json.dump(data, open(IPA_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    have = sum(1 for t in terms if data.get(t))
    print(f"Có sẵn từ API: {from_api} · CMUdict bù thêm: {filled} · TỔNG có phiên âm: {have}/{len(terms)}")
    if still:
        print(f"Vẫn thiếu ({len(still)}): {', '.join(still)}")


if __name__ == "__main__":
    main()
