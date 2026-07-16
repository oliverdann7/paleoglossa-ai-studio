#!/usr/bin/env python3
"""
Fetch public-domain Latin works from The Latin Library and format them into the
ingestion pipeline's plaintext shape (`## ` = section, one sentence per line),
writing to scripts/corpus/ingest/.sources/pd/<file>.txt.

The Latin Library (thelatinlibrary.com) publishes clean, public-domain Latin
texts. We take only the text; meanings are filled by the pipeline's gloss-fill
(bundled dictionaries / Whitaker's via surface form — no AI). Run, then:

  tsx scripts/corpus/ingest/run-manifest.ts --only <textId> --emit-local

Usage: python3 scripts/corpus/ingest/fetch_latin_library.py
"""
import html
import re
import sys
import urllib.request
from pathlib import Path

OUT = Path("scripts/corpus/ingest/.sources/pd")
UA = {"User-Agent": "Mozilla/5.0 (compatible; paleoglossa-corpus-ingest)"}

# (output file, section-label, [page urls], is_verse)
WORKS = [
    ("sallust-catilinae.txt", "Bellum Catilinae",
     ["https://www.thelatinlibrary.com/sall.1.html"], False),
    ("cicero-catilinam.txt", "In Catilinam",
     [f"https://www.thelatinlibrary.com/cicero/cat{i}.shtml" for i in (1, 2, 3, 4)], False),
    ("vulgate-john.txt", "Evangelium secundum Ioannem",
     ["https://www.thelatinlibrary.com/bible/john.shtml"], False),
    ("aeneid.txt", "Aeneis",
     [f"https://www.thelatinlibrary.com/vergil/aen{i}.shtml" for i in range(1, 13)], True),
    ("ovid-metamorphoses.txt", "Metamorphoses",
     [f"https://www.thelatinlibrary.com/ovid/ovid.met{i}.shtml" for i in range(1, 16)], True),
    ("livy.txt", "Ab Urbe Condita",
     [f"https://www.thelatinlibrary.com/livy/liv.{i}.shtml" for i in (1, 2, 3, 4, 5)], False),
    ("tacitus-annals.txt", "Annales",
     [f"https://www.thelatinlibrary.com/tacitus/tac.ann{i}.shtml" for i in range(1, 7)], False),
    # ── Latin Church Fathers ──
    ("augustine-confessiones.txt", "Confessiones — Liber",
     [f"https://www.thelatinlibrary.com/augustine/conf{i}.shtml" for i in range(1, 14)], False),
    ("tertullian-apologeticum.txt", "Apologeticum",
     ["https://www.thelatinlibrary.com/tertullian/tertullian.apol.shtml"], False),
    ("jerome-vita-pauli.txt", "Vita S. Pauli",
     ["https://www.thelatinlibrary.com/jerome/vitapauli.html"], False),
    ("jerome-vita-malchi.txt", "Vita Malchi",
     ["https://www.thelatinlibrary.com/jerome/vitamalchus.html"], False),
]

NAV = re.compile(r"(?i)(the latin library|the classics page|^latin$|thelatinlibrary)")


def fetch(url: str) -> str:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("latin-1")
    except Exception as e:  # noqa
        print(f"  ! {url}: {e}", file=sys.stderr)
        return ""


def page_text(raw: str) -> str:
    raw = re.sub(r"(?is)<head.*?</head>", "", raw)
    raw = re.sub(r"(?is)<script.*?</script>", "", raw)
    raw = re.sub(r"(?is)<(p|br|div|h[1-6]|tr)[^>]*>", "\n", raw)
    raw = re.sub(r"(?s)<[^>]+>", "", raw)
    raw = html.unescape(raw)
    return raw


def to_sentences(text: str, is_verse: bool) -> list[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    lines = [l for l in lines if not NAV.search(l)]
    # Drop pure citation/number-only lines.
    lines = [l for l in lines if not re.fullmatch(r"[\d\.\sIVXLCM]+", l)]
    blob = " ".join(lines)
    blob = re.sub(r"\s+", " ", blob)
    # Sentence split: prose on . ? ! : ; — verse on . ? ! only.
    pattern = r"(?<=[.?!])\s+" if is_verse else r"(?<=[.?!;:])\s+"
    parts = re.split(pattern, blob)
    out = []
    for p in parts:
        p = p.strip()
        if len(p) < 2:
            continue
        # Skip fragments with no Latin letters.
        if not re.search(r"[A-Za-z]", p):
            continue
        out.append(p)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Optional filters: substrings of output filenames (e.g. "augustine jerome").
    only = sys.argv[1:]
    for fname, base_label, urls, is_verse in WORKS:
        if only and not any(o in fname for o in only):
            continue
        out_lines: list[str] = []
        total = 0
        for i, url in enumerate(urls, 1):
            raw = fetch(url)
            if not raw:
                continue
            sents = to_sentences(page_text(raw), is_verse)
            if not sents:
                continue
            label = base_label if len(urls) == 1 else f"{base_label} {i}"
            out_lines.append(f"## {label}")
            out_lines.extend(sents)
            total += len(sents)
        if total:
            (OUT / fname).write_text("\n".join(out_lines) + "\n", encoding="utf-8")
            print(f"{fname}: {total} sentences from {len(urls)} page(s)")
        else:
            print(f"{fname}: EMPTY (skipped)", file=sys.stderr)


if __name__ == "__main__":
    main()
