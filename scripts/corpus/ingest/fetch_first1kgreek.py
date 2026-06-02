#!/usr/bin/env python3
"""
Fetch patristic / early-Christian Greek works from the First1KGreek and Perseus
canonical TEI corpora (CC BY-SA; the underlying texts are public domain) into
the pipeline's plaintext shape. Meanings fill from the Macula-seeded surface
cache + bundled dictionaries (no AI); these are Koine, so coverage is good.

Run, then `run-manifest --only <textId> --emit-local`.
"""
import html
import re
import urllib.request
from pathlib import Path

OUT = Path("scripts/corpus/ingest/.sources/pd")
UA = {"User-Agent": "Mozilla/5.0 (compatible; paleoglossa-corpus-ingest)"}
GREEK = re.compile(r"[ἀ-῿Ͱ-Ͽ]")
F1K = "https://raw.githubusercontent.com/OpenGreekAndLatin/First1KGreek/master/data"

# (output file, label, TEI url)
WORKS = [
    ("1-clement.txt", "Κλήμεντος πρὸς Κορινθίους", f"{F1K}/tlg1271/tlg001/tlg1271.tlg001.1st1K-grc1.xml"),
    ("didache.txt", "Διδαχή", f"{F1K}/tlg1311/tlg001/tlg1311.tlg001.1st1K-grc1.xml"),
    ("ignatius-ephesians.txt", "Ἰγνάτιος", f"{F1K}/tlg1443/tlg001/tlg1443.tlg001.1st1K-grc1.xml"),
    ("polycarp-philippians.txt", "Πολύκαρπος πρὸς Φιλιππησίους", f"{F1K}/tlg1622/tlg001/tlg1622.tlg001.1st1K-grc1.xml"),
    ("justin-apology.txt", "Ἀπολογία", f"{F1K}/tlg0645/tlg001/tlg0645.tlg001.1st1K-grc1.xml"),
    ("hermas-shepherd.txt", "Ποιμήν", f"{F1K}/tlg1419/tlg001/tlg1419.tlg001.1st1K-grc1.xml"),
    ("athanasius-incarnation.txt", "Περὶ τῆς ἐνανθρωπήσεως τοῦ Λόγου", f"{F1K}/tlg2035/tlg002/tlg2035.tlg002.1st1K-grc1.xml"),
]


def fetch(u: str) -> str:
    try:
        return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode(
            "utf-8", "replace"
        )
    except Exception as e:  # noqa
        print(f"  ! {u}: {e}")
        return ""


def tei_sentences(xml: str) -> list[str]:
    xml = re.sub(r"(?s)<teiHeader.*?</teiHeader>", "", xml)
    m = re.search(r"(?s)<body[^>]*>(.*?)</body>", xml) or re.search(r"(?s)<text[^>]*>(.*?)</text>", xml)
    body = m.group(1) if m else xml
    # Drop apparatus / notes / references that aren't the running text.
    body = re.sub(r"(?s)<(note|bibl|ref|milestone|head)[^>]*>.*?</\1>", " ", body)
    body = re.sub(r"(?is)<(l|p|lb|ab|said|sp|div|seg)[^>]*>", "\n", body)
    body = re.sub(r"(?s)<[^>]+>", " ", body)
    body = html.unescape(body)
    lines = [l.strip() for l in body.splitlines() if l.strip() and GREEK.search(l)]
    blob = re.sub(r"\s+", " ", " ".join(lines))
    return [s.strip() for s in re.split(r"(?<=[.;·])\s+", blob) if len(s.strip()) > 2 and GREEK.search(s)]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for fname, label, url in WORKS:
        sents = tei_sentences(fetch(url))
        if sents:
            (OUT / fname).write_text(f"## {label}\n" + "\n".join(sents) + "\n", encoding="utf-8")
            print(f"{fname}: {len(sents)} sentences")
        else:
            print(f"{fname}: EMPTY")


if __name__ == "__main__":
    main()
