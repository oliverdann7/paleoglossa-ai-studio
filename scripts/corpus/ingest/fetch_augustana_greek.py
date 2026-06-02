#!/usr/bin/env python3
"""
Fetch public-domain Ancient Greek works from Bibliotheca Augustana
(hs-augsburg.de) into the ingestion pipeline's plaintext shape. Augustana's
Greek texts are public-domain compilations; meanings are filled by the pipeline
(Macula-seeded surface glosses + bundled dictionaries — no AI).

Each work has an index page that links to its content pages (books/chapters) in
the same directory. We fetch the index, follow the sibling content links, and
extract the Greek lines. Run, then `run-manifest --only <textId> --emit-local`.
"""
import html
import re
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

OUT = Path("scripts/corpus/ingest/.sources/pd")
UA = {"User-Agent": "Mozilla/5.0 (compatible; paleoglossa-corpus-ingest)"}
GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")

# (output file, work index url, section label)
BASE = "https://www.hs-augsburg.de/~harsch/graeca/Chronologia"
WORKS = [
    ("plato-apology.txt", f"{BASE}/S_ante04/Platon/pla_apo0.html", "Ἀπολογία"),
    ("lucian-charon.txt", f"{BASE}/S_post02/Lukianos/luk_char.html", "Χάρων"),
    ("anabasis.txt", f"{BASE}/S_ante04/Xenophon/xen_ana0.html", "Ἀνάβασις"),
    ("aesop.txt", f"{BASE}/S_ante06/Aesop/aes_m000.html", "Μῦθοι Αἰσώπειοι"),
    ("herodotus.txt", f"{BASE}/S_ante05/Herodot/her_his0.html", "Ἱστορίαι"),
    ("thucydides.txt", f"{BASE}/S_ante05/Thukydides/thu_pel0.html", "Ἱστορίαι"),
]


def fetch(u: str) -> str:
    try:
        return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode(
            "utf-8", "replace"
        )
    except Exception as e:  # noqa
        print(f"  ! {u}: {e}")
        return ""


def greek_sentences(raw: str) -> list[str]:
    raw = re.sub(r"(?is)<head.*?</head>", "", raw)
    raw = re.sub(r"(?is)<script.*?</script>", "", raw)
    raw = re.sub(r"(?is)<(p|br|div|h[1-6])[^>]*>", "\n", raw)
    raw = re.sub(r"(?s)<[^>]+>", "", raw)
    raw = html.unescape(raw)
    lines = [l.strip() for l in raw.splitlines() if l.strip() and GREEK.search(l)]
    blob = re.sub(r"\s+", " ", " ".join(lines))
    return [s.strip() for s in re.split(r"(?<=[.;])\s+", blob) if len(s.strip()) > 2 and GREEK.search(s)]


def content_pages(index_url: str, index_html: str) -> list[str]:
    """Sibling .html pages linked from the index (the book/chapter pages)."""
    hrefs = re.findall(r'href="([^"]+\.html)"', index_html)
    pages, seen = [], set()
    base_name = index_url.rsplit("/", 1)[1]
    for h in hrefs:
        if h.startswith(("http", "..", "/")) or "/" in h:
            continue
        if any(x in h for x in ("intr", "nota", "_f.", "suda", "alpha")):
            continue
        if h == base_name or h in seen:
            continue
        seen.add(h)
        pages.append(urljoin(index_url, h))
    return pages


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for fname, index_url, label in WORKS:
        idx = fetch(index_url)
        if not idx:
            continue
        pages = content_pages(index_url, idx)
        out, total, n = [], 0, 0
        # If the index itself carries the text (single-page work), use it.
        targets = pages if pages else [index_url]
        for p in targets:
            raw = idx if p == index_url else fetch(p)
            sents = greek_sentences(raw)
            if not sents:
                continue
            n += 1
            out.append(f"## {label} {n}" if len(targets) > 1 else f"## {label}")
            out.extend(sents)
            total += len(sents)
        if total:
            (OUT / fname).write_text("\n".join(out) + "\n", encoding="utf-8")
            print(f"{fname}: {total} sentences from {n} page(s)")
        else:
            print(f"{fname}: EMPTY")


if __name__ == "__main__":
    main()
