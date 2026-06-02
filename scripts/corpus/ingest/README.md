# Corpus ingestion pipeline

Turns a raw work into fully-annotated, Firestore-served corpus data **without
touching the bundled corpus** (`src/data/corpus/`). This is how the library
scales to full texts in every language with a meaning on every word, while the
JS bundle stays small and the single-chunk constraint
(`project_corpus_single_chunk_constraint`) is preserved.

Expanded texts live in Firestore (`corpus/{textId}` + `corpus/{textId}/sections/{sectionId}`)
and are served by `api/_routes/corpus.ts`, listed in the Library via `/api/corpus`,
and read by the Reader's `_firestoreCorpus` path (`src/pages/Reader.tsx`). No
`corpus.ts` wiring is required — that hand-wiring is the project's documented
source of bugs, and we avoid it entirely.

## Stages

```
segment → annotate → glossFill → assemble → pushFirestore
```

| Stage | File | What it does |
|-------|------|--------------|
| segment | `segment.ts` | Raw source strings → canonical tokenised sections (lemma/gloss empty, POS `unknown`). Reuses `tokenizeSentence`. |
| annotate | `annotate.ts` | Merge positional `TokenAnnotation[]` (lemma + POS + morphology) from a treebank onto segmented tokens. |
| sources | `sources/*.ts` | Adapters that turn an external source into canonical sections (or a `WorkInput`). See the source table below. |
| glossFill | `glossFill.ts` | Fill any remaining empty gloss from bundled dictionaries (`getDefinitionWithFallbacks`), then batch Gemini for the residue. Caches per `{language, lemma}`. |
| assemble | `assemble.ts` | Build `Text` + `TextSection[]`, run the **shared** completeness gate (`validateTextAnnotations`). Passes → `complete`; gaps → `partial`. |
| pushFirestore | `pushFirestore.ts` | Write to `corpus/{textId}` (+ sections), matching the shapes `api/_routes/corpus.ts` reads. Carries `sourceAttributionId` + `direction`. `--dry-run` needs no credentials. |

The completeness gate (`src/data/corpus/validation.ts` → `validateTextAnnotations`)
is the same check the bundled corpus uses: a text only becomes `complete` when
**every** token has a real POS, a non-empty gloss, and a non-empty lemma.

## Source adapters

| `--source` | File | Output | Use for |
|------------|------|--------|---------|
| `macula` | `sources/macula.ts` | fully-annotated sections (no AI) | Macula Greek TSV → Koine NT |
| `macula-hebrew` | `sources/macula-hebrew.ts` | fully-annotated sections (no AI), header-driven | Macula Hebrew / OSHB TSV → Hebrew Bible + Biblical Aramaic |
| `tei` | `sources/tei.ts` | `WorkInput` (text-only → glossFill) | Digital Syriac Corpus, Coptic SCRIPTORIUM, PD TEI editions |
| `plaintext` | `sources/plaintext.ts` | `WorkInput` (text-only → glossFill) | GRETIL Sanskrit, PD plain-text editions (`## ` = section, line = sentence) |
| `work` | (inline) | `WorkInput` + optional `TokenAnnotation[]` | hand-prepared works + treebank annotations |

## License gate (enforced)

Paleoglossa is a commercial product, so the registry in `src/data/attributions.ts`
is an **enforced** gate, not just metadata. `--attribution <id>` is checked before
any work is done: a source must permit **commercial use AND modification** or the
run aborts. Share-alike sources pass but warn. Pass `--allow-noncommercial` only
for a non-commercial/research build.

| Source | Attribution id | License | Status |
|--------|----------------|---------|--------|
| Macula Greek | `macula-greek` | CC BY 4.0 | ✅ ingest (fully complete, no AI) |
| Macula Hebrew / OSHB | `macula-hebrew` | CC BY 4.0 | ✅ ingest (fully complete, no AI) |
| GRETIL (Sanskrit) | `gretil` | CC BY 4.0 | ✅ ingest (text-only → AI gloss + review) |
| Digital Syriac Corpus | `digital-syriac-corpus` | CC BY 4.0 | ✅ ingest (text-only → AI gloss + review) |
| Coptic SCRIPTORIUM | `coptic-scriptorium` | CC BY / BY-SA (mixed) | ⚠ verify per-corpus license; ingest with care |
| PD scholarly edition | `public-domain-edition` | Public Domain | ✅ ingest (text-only → AI gloss + review) |
| PROIEL treebanks | `proiel` | CC BY-NC-SA | ⛔ blocked (non-commercial) |
| ORACC (Akkadian) | `oracc` | CC BY-SA | ⛔ blocked by manifest (share-alike, case-by-case) |

Always confirm a source's license permits redistribution before ingesting.

## Run-book (pilot)

Dry-run requires no credentials and writes nothing — use it to verify a build:

```bash
# Greek — Gospel of Mark, fully annotated from Macula (no AI needed)
tsx scripts/corpus/ingest/cli.ts \
  --source macula --tsv ./macula-greek.tsv --book MRK \
  --text-id grc-mark-full --language grc-koine \
  --title "Gospel of Mark (Koine Greek)" --attribution macula-greek --dry-run

# Hebrew — Genesis, fully annotated from Macula Hebrew (no AI needed)
tsx scripts/corpus/ingest/cli.ts \
  --source macula-hebrew --tsv ./macula-hebrew.tsv --book GEN \
  --text-id hbo-genesis-full --language hbo \
  --title "Genesis (Hebrew)" --attribution macula-hebrew --dry-run

# Sanskrit — a plaintext GRETIL work, AI for gloss gaps (ships partial → review)
tsx scripts/corpus/ingest/cli.ts \
  --source plaintext --input ./bhagavad-gita.txt \
  --text-id san-bhagavad-gita-full --language san \
  --title "Bhagavad Gita" --attribution gretil \
  --gemini-key "$GEMINI_API_KEY" --dry-run
```

## Batch run-book (manifest)

`manifest.ts` is the durable list of every target text + its source + license;
`run-manifest.ts` drives them all through the pipeline. Source data files are
fetched by the maintainer into `scripts/corpus/ingest/.sources/` (gitignored);
an entry whose file is absent is skipped with a notice, so a full dry-run works
before any download.

```bash
npm run ingest:manifest:dry              # validate everything, write nothing
npm run ingest:manifest -- --only grc-koine   # real ingest of the Koine NT
npm run ingest:manifest -- --only hbo         # real ingest of the Hebrew Bible
```

Flags: `--only <lang|textId>`, `--allow-noncommercial`, `--sources-dir <path>`,
`--gemini-key <key>`. Real writes need `FIREBASE_SERVICE_ACCOUNT_JSON`.

To actually write, drop `--dry-run` and provide `FIREBASE_SERVICE_ACCOUNT_JSON`:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)" \
tsx scripts/corpus/ingest/cli.ts --source macula --tsv ./macula-greek.tsv \
  --book MRK --text-id grc-mark-full --language grc --title "Gospel of Mark (Koine Greek)"
```

Then:
- `tsx scripts/audit-corpus-quality.ts` to confirm coverage,
- `npm run dev` and open the text in the Reader to verify word meanings render.

## Gloss cache

`glossFill` writes a JSON cache (default `scripts/corpus/ingest/.cache/<lang>-glosses.json`).
Entries marked `"aiGenerated": true` are the unit of human review — spot-check
them before promoting a text to `complete`. The cache makes re-runs deterministic
and ensures each unique lemma costs at most one AI call across the whole corpus.

## `work` source JSON shape (`WorkInput`)

```jsonc
{
  "textId": "lat-caesar-bg-1",
  "language": "lat",
  "meta": { "title": "Caesar, De Bello Gallico I", "author": "Julius Caesar" },
  "sections": [
    {
      "id": "lat-caesar-bg-1-1", "sequence": 1, "label": "Book I, ch. 1",
      "sentences": [
        { "id": "bg-1-1-1", "src": "Gallia est omnis divisa in partes tres", "translation": "All Gaul is divided into three parts" }
      ]
    }
  ]
}
```

Positional annotations (`TokenAnnotation[]`) align to tokens by `sentenceId` + 0-based `index`.
