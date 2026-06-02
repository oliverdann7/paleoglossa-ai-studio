#!/usr/bin/env python3
"""
Seed the gloss cache from Macula Greek (Clear-Bible, CC BY 4.0) so any Greek
text-only ingest (LXX, patristics, classical Greek) gets glosses by SURFACE form
with no AI. Macula gives gloss+lemma for every NT word; biblical and much
classical Greek vocabulary overlaps heavily, so this lifts coverage substantially.

Writes scripts/corpus/ingest/.cache/grc-koine-glosses.json and grc-glosses.json,
keyed `<lang>::<normalized-surface>` to match glossFill's lookup. Existing
(e.g. curated) entries are preserved.

Usage: python3 scripts/corpus/ingest/seed_greek_gloss_cache.py
"""
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

TSV = Path("scripts/corpus/ingest/.sources/macula-greek.tsv")
CACHE = Path("scripts/corpus/ingest/.cache")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower().strip()


def main() -> None:
    lines = TSV.read_text(encoding="utf-8").splitlines()
    header = lines[0].split("\t")
    ci = {n: i for i, n in enumerate(header)}
    c_text, c_gloss = ci["text"], ci["gloss"]
    # most-frequent gloss per normalized surface form
    tally: dict[str, Counter] = {}
    for ln in lines[1:]:
        r = ln.split("\t")
        if len(r) <= max(c_text, c_gloss):
            continue
        surf = (r[c_text] or "").strip()
        gloss = (r[c_gloss] or "").strip()
        if not surf or not gloss:
            continue
        key = norm(surf)
        if not key:
            continue
        tally.setdefault(key, Counter())[gloss] += 1

    CACHE.mkdir(parents=True, exist_ok=True)
    for lang in ("grc-koine", "grc"):
        path = CACHE / f"{lang}-glosses.json"
        cache = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
        added = 0
        for key, counter in tally.items():
            ck = f"{lang}::{key}"
            if ck in cache:
                continue
            gloss = counter.most_common(1)[0][0]
            cache[ck] = {"gloss": gloss, "source": "bundled", "aiGenerated": False}
            added += 1
        path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{lang}: +{added} entries (total {len(cache)})")


if __name__ == "__main__":
    main()
