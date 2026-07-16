# Remaining corpus texts (5) — completion handoff

40 of ~45 partial/sample bundled texts have been completed and are served from
`public/corpus-data/` (see the manifest and PR) — and since 2026-07-16 every
served text is also surfaced in the Library via a bundled `remoteSections`
metadata stub (`src/data/corpus/*-full.ts`). These **5** could not be
completed autonomously: an exhaustive search (~50 attempts across ~18 providers:
First1KGreek, Perseus, Bibliotheca Augustana, el/en/de/sa/fr Wikisource, the
Patristic Text Archive, GCS-retrodigitized, ToposText, CLTK, ORACC, eBL,
Sefaria, ETCBC, CDLI, TLA, syrnt, archive.org, …) found **no clean,
commercial-safe, machine-readable source** for them. They are *not* hard to
ingest — only hard to source. Each becomes one command once a source file exists.

## How to complete any of them

1. Produce a UTF-8 plaintext file in the pipeline's shape — `## <section label>`
   on its own line starts a section; every other non-empty line is one sentence:

   ```
   ## Tablet I
   first line of text …
   second line …
   ## Tablet II
   …
   ```
2. Save it at the path in the table below, under `scripts/corpus/ingest/.sources/`.
3. Ingest (no credentials; writes the static asset + updates the index):

   ```bash
   tsx scripts/corpus/ingest/run-manifest.ts --only <textId> --emit-local
   ```

   Then `npm run build` and commit `public/corpus-data/<textId>.json` (+ `index.json`).
   Greek texts gloss automatically from the Macula-seeded cache; other languages
   ship `partial` (full text + the app's on-click AI) — which the goal permits.

   Alternatively, supply a Gemini key and the pipeline AI-glosses text-only
   sources: add `--gemini-key "$GEMINI_API_KEY"`.

## The five

| textId | bundled excerpt | source file to drop in | recommended source / why it's blocked |
|--------|-----------------|------------------------|----------------------------------------|
| `grc-patristic-basil-hexaemeron-full` | Basil-Hex-1 | `pd/basil-hexaemeron.txt` | Greek text is TLG-locked (subscription, non-redistributable) and absent from every open Greek corpus checked. Use a GCS/Migne PG **text** edition you can license, or TLG export. Koine → glosses well from the Macula cache once present. |
| `grc-patristic-chrysostom-john-homilies-full` | Chrys-Jn-1 | `pd/chrysostom-john.txt` | Same as Basil — TLG-locked. Very large (Migne PG 59). |
| `egy-ptahhotep-full` | Egy-Ptah-1 | `pd/ptahhotep.txt` | Egyptian transliteration only in the TLA (commercial-use-restricted corpus) or in-copyright print editions. A confirmed-PD transliteration (e.g. Dévaud) would work. |
| `hit-mursili-annals-full` | Hit-Annals-1 | `pd/mursili-annals.txt` | No open machine-readable Hittite corpus (CLTK has none; TITUS is research-only; hethiter.net restricted). Needs a licensed/own transliteration. |
| `uga-baal-cycle-full` | Uga-Baal-1 | `pd/baal-cycle.txt` | No open machine-readable Ugaritic corpus; the standard transliteration (KTU/CAT) is in-copyright. Needs a licensed/own transliteration. |

The manifest (`manifest.ts`) already declares all five (Basil/Chrysostom under
the patristics group; the others in `aneEntries`). Update a `file:` path there if
you save under a different name.
