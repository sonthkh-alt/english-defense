#!/usr/bin/env python3
# fetch_ipa.py — Lấy phiên âm IPA cho toàn bộ từ vựng (Free Dictionary API).
# Cụm nhiều từ không có mục từ riêng → ghép IPA của từng thành phần.
# Kết quả: tools/vocab/ipa.json  { "term": "/ˈæn.ə.laɪz/", ... }
import json, os, re, sys, time, urllib.request, urllib.parse
try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "ipa.json")
UA = {"User-Agent": "Mozilla/5.0 (EnglishDefense learning app)"}

cache = {}
if os.path.exists(OUT):
    cache = json.load(open(OUT, encoding="utf-8"))


def terms_from_seed():
    src = open(os.path.join(ROOT, "assets", "js", "seed.js"), encoding="utf-8").read()
    return re.findall(r'\{\s*t:\s*"([^"]+)"', src)


def lookup(word, tries=3):
    """IPA của MỘT từ; trả '' nếu không có."""
    key = word.lower()
    if key in cache:
        return cache[key]
    url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + urllib.parse.quote(key)
    for a in range(tries):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20))
            ipa = ""
            for e in d:
                if e.get("phonetic"):
                    ipa = e["phonetic"]; break
                for p in e.get("phonetics", []):
                    if p.get("text"):
                        ipa = p["text"]; break
                if ipa: break
            cache[key] = ipa
            return ipa
        except Exception:
            if a < tries - 1:
                time.sleep(1.5)
    cache[key] = ""
    return ""


def strip_slashes(s):
    return s.strip().strip("/").strip()


def ipa_for(term):
    """Từ đơn → tra thẳng. Cụm → ghép IPA từng thành phần (bỏ nếu thiếu)."""
    direct = lookup(term)
    if direct:
        return direct
    parts = re.split(r"[\s\-]+", term)
    if len(parts) < 2:
        return ""
    got = [strip_slashes(lookup(p)) for p in parts]
    if not all(got):
        return ""
    return "/" + " ".join(got) + "/"


def main():
    terms = terms_from_seed()
    print(f"Cần phiên âm cho {len(terms)} từ…")
    done = 0
    for i, t in enumerate(terms, 1):
        if t in cache and cache.get(t):
            continue
        ipa = ipa_for(t)
        cache[t] = ipa
        done += 1
        if ipa:
            print(f"[{i}/{len(terms)}] {t} → {ipa}")
        else:
            print(f"[{i}/{len(terms)}] {t} → (không có)")
        if done % 20 == 0:
            json.dump(cache, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(cache, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    have = sum(1 for t in terms if cache.get(t))
    print(f"\nXong: {have}/{len(terms)} từ có phiên âm → {OUT}")


if __name__ == "__main__":
    main()
