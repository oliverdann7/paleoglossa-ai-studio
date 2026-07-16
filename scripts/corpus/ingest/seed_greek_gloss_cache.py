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

# Curated lemma-keyed glosses for tokens Macula (SBLGNT) ships without a gloss —
# mostly SBLGNT variant readings and the bracketed shorter ending of Mark. Keys
# must match glossFill's lookup exactly (`<lang>::<lemma>`, accents included).
# Standard short lexicon glosses (BDAG/Abbott-Smith style); reviewed by hand.
CURATED_LEMMA_GLOSSES = {
    "ἱνατί": "why?; for what reason?",
    "πνίγω": "to choke; strangle",
    "μέχρι(ς)": "until; as far as",
    "διαστέλλομαι": "to order; give strict orders",
    "γαμέω": "to marry",
    "μοιχάομαι": "to commit adultery",
    "τρύπημα": "hole; eye (of a needle)",
    "ἑκατονταπλασίων": "a hundredfold",
    "ἐπανάγω": "to return; put out (to sea)",
    "παροψίς": "dish; plate",
    "ἀπέναντι": "opposite; in front of",
    "δύνω": "to set (of the sun); sink",
    "ὀργίζομαι": "to be angry; be moved with indignation",
    "ἀγαθοποιέω": "to do good",
    "ἀρέσκω": "to please",
    "ἀποκεφαλίζω": "to behead",
    "προσκολλάομαι": "to be joined to; cleave to",
    "ὁμοιάζω": "to resemble; be like",
    "ἀποκυλίω": "to roll away",
    "συντόμως": "briefly; promptly",
    "ἀνατολή": "rising; east, dawn",
    "δύσις": "setting (of the sun); west",
    "ἐξαποστέλλω": "to send out; send forth",
    "ἄφθαρτος": "imperishable; incorruptible",
    "Ἰωβήλ": "Obed (father of Jesse)",
    "ἀναπτύσσω": "to unroll; open (a scroll)",
    "προσαναλίσκω": "to spend besides; spend wholly",
    "μόγις": "hardly; with difficulty",
    "δεκαοκτώ": "eighteen",
    "ἀποδεκατόω": "to tithe; give a tenth of",
    "ἀπολαμβάνω": "to receive back; receive in full",
    "διαπραγματεύομαι": "to gain by trading; earn by business",
    # Acts–Revelation (SBLGNT variant readings Macula leaves unglossed):
    "νυνί": "now; at this very moment",
    "τάχος": "speed; quickness (ἐν τάχει: soon)",
    "ὀνειδίζω": "to reproach; revile; insult",
    "ταλαιπωρέω": "to be wretched; lament; endure distress",
    "πειθός": "persuasive",
    "χρυσός": "gold",
    "ἄργυρος": "silver",
    "εἴκοσι(ν)": "twenty",
    "παραμένω": "to remain; stay on; continue",
    "μαράνα": "our Lord (Aramaic, in marana tha)",
    "θά": "come! (Aramaic, in marana tha)",
    "συγκεράννυμι": "to mix together; unite; compose",
    "Λευί": "Levi",
    "ἀναπαύω": "to give rest; (mid.) rest",
    "λοιπός": "remaining; the rest",
    "εἴδωλον": "idol; image",
    "ἀργυροῦς": "of silver",
    "χαλκοῦς": "of bronze; brazen",
    "ξύλινος": "wooden; of wood",
    "πελεκίζω": "to behead (with an axe)",
    "χάραγμα": "mark; stamp; engraved image",
    "μέτωπον": "forehead",
    "στάδιος": "stade (about 185 meters)",
    "ῥυπαρεύω": "to defile; be filthy",
    "ἐπισκοπέω": "to oversee; care for; watch over",
    "συσταυρόομαι": "to be crucified together with",
    "μενοῦνγε": "rather; indeed; more than that",
    "σπόρος": "seed (for sowing)",
    "συνεργός": "fellow worker; helper",
    "ὑπερεκπερισσοῦ": "beyond all measure; most exceedingly",
    "ἀποκαταλλάσσω": "to reconcile completely",
    "βαπτισμός": "washing; baptism",
    "ἀπείθεια": "disobedience; unbelief",
    "ἐνοικέω": "to dwell in; inhabit",
    "ἀποβάλλω": "to throw off; cast away",
    "τολμηρότερον": "more boldly; quite boldly",
    "ἁμάρτημα": "sin; sinful deed",
    "σειρά": "chain; cord",
    "Βοσόρ": "Bosor (father of Balaam)",
    "διαπορέω": "to be greatly perplexed",
    "ἀναγνωρίζομαι": "to be made known; make oneself known",
    "κείρω": "to shear; cut (hair)",
    "ὅραμα": "vision; sight",
    "Ἑλληνιστής": "Hellenist; Greek-speaking Jew",
    "κατασκάπτω": "to tear down; demolish",
    "ἐπαρχεία": "province",
    "περιαιρέω": "to take away; remove; (nautical) cast off",
    "φλόξ": "flame",
}


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
        for lemma, gloss in CURATED_LEMMA_GLOSSES.items():
            ck = f"{lang}::{lemma}"
            if ck in cache:
                continue
            cache[ck] = {"gloss": gloss, "source": "bundled", "aiGenerated": False}
            added += 1
        path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{lang}: +{added} entries (total {len(cache)})")


if __name__ == "__main__":
    main()
