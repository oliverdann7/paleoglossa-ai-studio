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
| sources | `sources/macula.ts` | MorphGNT/Macula Greek adapter — builds fully-annotated sections (surface+lemma+gloss+morphology) directly from the Macula TSV. No AI needed. |
| glossFill | `glossFill.ts` | Fill any remaining empty gloss from bundled dictionaries (`getDefinitionWithFallbacks`), then batch Gemini for the residue. Caches per `{language, lemma}`. |
| assemble | `assemble.ts` | Build `Text` + `TextSection[]`, run the **shared** completeness gate (`validateTextAnnotations`). Passes → `complete`; gaps → `partial`. |
| pushFirestore | `pushFirestore.ts` | Write to `corpus/{textId}` (+ sections), matching the shapes `api/_routes/corpus.ts` reads. `--dry-run` needs no credentials. |

The completeness gate (`src/data/corpus/validation.ts` → `validateTextAnnotations`)
is the same check the bundled corpus uses: a text only becomes `complete` when
**every** token has a real POS, a non-empty gloss, and a non-empty lemma.

## Sources & licenses

| Language | Source | License | Notes |
|----------|--------|---------|-------|
| Koine Greek (NT) | [Macula Greek](https://github.com/Clear-Bible/macula-greek) (Nestle1904 TSV) | CC BY 4.0 | Surface + lemma + gloss + full morphology in one TSV → fully complete, no AI. Used by `sources/macula.ts`. |
| Greek/Latin (classical) | [PROIEL](https://proiel.github.io/) treebanks | CC BY-NC-SA | lemma + morphology; glosses filled from bundled dict / AI. Use `scripts/treebank/import-proiel.ts` to produce a positional `TokenAnnotation[]`. |
| Hebrew (Bible) | OSHB / Macula Hebrew | CC BY 4.0 | lemma + morphology; same annotate→glossFill flow. |

Always confirm a source's license permits redistribution before ingesting.

## Run-book (pilot)

Dry-run requires no credentials and writes nothing — use it to verify a build:

```bash
# Greek — Gospel of Mark, fully annotated from Macula (no AI needed)
tsx scripts/corpus/ingest/cli.ts \
  --source macula --tsv ./macula-greek.tsv --book MRK \
  --text-id grc-mark-full --language grc \
  --title "Gospel of Mark (Koine Greek)" --dry-run

# Latin — a work JSON + PROIEL annotations sidecar, AI for gloss gaps
tsx scripts/corpus/ingest/cli.ts \
  --source work --work ./caesar-bg-1.json --annotations ./caesar-bg-1.proiel.json \
  --text-id lat-caesar-bg-1 --language lat \
  --title "Caesar, De Bello Gallico I" \
  --gemini-key "$GEMINI_API_KEY" --dry-run
```

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
