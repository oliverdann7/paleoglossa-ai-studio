# Reading-first plan: review and current state (2026-11)

Review of the "LingQ-inspired transformation" brief against the code on `main` at
`83fff93`, with the order of work it implies. Findings marked *verified* were checked in
code or measured on `public/corpus-data`; older audits were not taken on trust.

## Verdict on the brief

Sound in direction and correctly ordered (identity before reader work, small PRs, no
auto-merge). Four corrections:

1. **"Preserve meaningful Greek diacritics" cannot be done by keying on diacritics.** The
   served corpus mixes accented and unaccented lemmas for the same word (`καί` / `και`).
   A naive change would have broken highlighting for the commonest words. Done instead as
   a curated homograph list. See `docs/vocabulary-identity.md`.
2. **The largest identity defect is not in the brief.** 20–79% of served tokens have no
   lemma, and in the reader they all shared one vocabulary entry. Fixed in PR 1; the
   underlying gap (corpus lemmatization) is the most valuable content task outstanding.
3. **Much of Stage 4–5 already exists.** The remaining work is consolidation and the gaps
   below, not new panels.
4. **LingQ's interface was not re-observed for this review.** The comparison below rests
   on its public, long-documented behaviour and should be re-checked before design work
   that depends on a detail.

## Current state against the brief (*verified*)

| Brief item | State | Evidence |
|---|---|---|
| Language-scoped vocabulary | **Fixed in PR 1** | `lib/vocabulary/identity.ts` |
| Single-tap glossary, optimistic state | Present | `LexDrawerPanel`, `useVocabulary.setWordState`; saving closes the drawer |
| Expandable morphology / philology | Present | `LexDrawerPanel`, `ParadigmModal`, `SentenceAnalysisPanel` |
| Multi-token phrase selection | **Missing.** "Save phrase" saves the whole sentence as one term | `Reader.tsx` `handleSavePhrase` |
| Read / Study / Scholar views | Present under other names: `DisplayMode` is `scholar \| focus \| morphology \| interlinear \| parallel`, switched from the reader toolbar. *(The first version of this table wrongly listed it as missing; only `ReadingMode` had been checked.)* | `types/reader.ts`, `ReaderToolbar.tsx` |
| Interlinear | Present | `ReaderToolbar`, `ReadingPane` |
| Literal vs idiomatic translation | Server prompts only; no reader control | `api/_lib/aiPrompts.ts` |
| Token / lemma / sense separation | Partial. No sense level: one gloss per lemma | `WordInfo` |
| Keyboard, RTL | Present in `ReadingPane`; not audited for completeness here | |
| Recommendations by vocabulary | Present | `recommendationService`, `api/_lib/recommender.ts` |
| Recommendations by selected goals | **Missing** — no goal model | |
| Progressive pathways | Beginner paths only | `constants/beginnerPaths.ts` |
| Next reading after a section | **Missing** | |
| Import status / recoverable failure | Partial | `importService.ts`, `Import.tsx` retry |
| Contextual review with FSRS | Present (`USE_FSRS = true`; sentence context stored on the word) | `reviewService.ts` |

Also found:

- `normalizeTimestamp(undefined)` returns "now", so every signed-in word loads with an SRS
  record whether or not it was ever scheduled (`vocabularyService.getVocabulary`).
- `CLAUDE.md` still describes `users/{uid}/reviews` as an SM-2 queue; scheduling lives on
  the vocabulary document and runs FSRS.
- Three Playwright specs fail on `main` (`smoke`, `learning-loop`, `auth` email form): they
  assert a state button stays highlighted after saving, but the drawer now closes.

## Workflow comparison

| Workflow | Problem it solves | LingQ's strength | Paleoglossa today | Gap | Paleoglossa's own answer |
|---|---|---|---|---|---|
| Onboarding | Reach a first real sentence fast | Straight into a lesson | Day-One lesson, guest mode, known-word seed | Adequate | — |
| Discovery | "What can I read now?" | New-word % on every lesson | Coverage on cards, i+1 recommender | No goals; coverage was polluted across languages (fixed) | Goal-aware rails: "towards Mark 1", "towards Caesar BG 1" |
| Word lookup | Understand one word without leaving the line | One tap, hint, status | One tap, gloss, morphology, paradigms | Surface-only identity for un-lemmatized text | Lemmatize the corpus; show lemma and parsed form together |
| Phrases | Idioms and formulae | Drag to select | Whole sentence only | Real gap | Token-range selection stored as a phrase item with its member lemmas — Homeric formulae, construct chains |
| Status | See progress in the text itself | 1–4 / known / ignored colours | Six states, highlight | Fine | — |
| Sentence mode | Work one sentence at a time | Sentence view with translation | Page/scroll, sentence analysis panel | No single reading-depth control | **Read / Study / Scholar** as one switch over existing panels |
| Review | Remember what was read | Review in sentence context | FSRS, context sentence on the card | Good | Open the source passage from a card |
| Import | Read your own text | Paste, file, browser extension | Paste, file, URL, OCR, TEI | Confidence and corrections not surfaced | Per-token confidence, user lemma corrections that feed identity |
| Progress | Motivation | Known-word count | Per-language known words, streaks | Counts were wrong across languages (fixed) | — |
| After a section | Keep reading | Next lesson in the course | Nothing | Real gap | "Next reading": the next section, or the best-coverage text for the goal |
| Offline | Read anywhere | Downloaded lessons | IndexedDB payloads, runtime caches | Not audited here | — |

Where Paleoglossa should not follow LingQ: morphology, treebanks, apparatus and manuscripts
are the reason to choose it, and Scholar view should lead with them.

## Order of work

| PR | Scope | Status |
|---|---|---|
| 1 | Vocabulary identity: language scoping, normalization, document IDs, self-healing repair, empty-lemma fix | This PR |
| 2 | Repair the three stale Playwright specs; correct `normalizeTimestamp` SRS default; fix `CLAUDE.md` collections table | Next |
| 3 | Corpus lemmatization backfill for served texts (ingestion pipeline) | Largest learner-visible gain |
| 4 | Phrase selection: token ranges as phrase vocabulary | |
| 5 | ~~Read / Study / Scholar switch~~ — already exists as display modes; dropped | — |
| 6 | "Next reading" after a section; goals; pathways for Koine, Latin, Hebrew | |
| 7 | Import: confidence, corrections, status | |

## Progress (2026-11-21)

| Step | State |
|---|---|
| Vocabulary identity | Merged (#375) |
| Stale Playwright specs, gloss input | Merged (#376) |
| Corpus lemmas for Greek and Latin | Done — `scripts/corpus/lemmatize-served.ts`, see `docs/vocabulary-identity.md` |
| Pathways (Koine, Latin, Hebrew) with a chosen destination | Done — `src/lib/reading/pathways.ts`, dashboard `PathwayCard` |
| Next reading at the end of a text | Done — `src/lib/reading/nextReading.ts`, reader `NextReadingCard` |
| Phrase selection | Done — `src/lib/reading/phrases.ts`, reader `PhraseBar` |
| Read / Study / Scholar switch | Dropped — the reader already has five display modes |

Pathway order is editorial and lives in one file. The chosen destination is stored per
device (`paleoglossa_reading_goals`), not synced. Next-reading uses level, author and
genre off the path; it does not yet use vocabulary coverage, because served texts carry
no bundled tokens to measure against.

Phrases: shift-click (or Shift+Enter) a second word in the sentence of the selected word,
or use "Select phrase from here" in the word menu (right-click or long-press) and then
choose the last word. A phrase is 2–12 words of one sentence, saved as one vocabulary item
with `kind: 'phrase'` and its member lemmas, and reviewed like any other item. Saved
phrases are underlined wherever the same words recur. "Save as Phrase" on a sentence, which
saved the whole sentence, is now labelled "Save sentence". Not done: selecting across
sentences, dragging to select, and an AI-suggested meaning.
