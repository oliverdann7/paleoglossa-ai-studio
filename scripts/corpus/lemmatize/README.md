# Lemma backfill for the served corpus

`scripts/corpus/lemmatize-served.ts` gives Latin and Classical Greek tokens in
`public/corpus-data/` a real lemma by looking the surface form up — no AI.

Why it matters: a token without a lemma is tracked in the learner's vocabulary by
its surface form, so `puella`, `puellae` and `puellam` are three words to learn
(`docs/vocabulary-identity.md`). It also replaces *placeholder* lemmas — an early
gloss pass copied the normalized surface into `lemma` (`τὸν` → `τον`), which every
audit counted as coverage.

## Sources

Fetch into `scripts/corpus/ingest/.sources/` (git-ignored):

```bash
cd scripts/corpus/ingest/.sources
git clone --depth 1 https://github.com/PerseusDL/treebank_data
git clone --depth 1 https://github.com/vgorman1/Greek-Dependency-Trees
git clone --depth 1 https://github.com/mk270/whitakers-words
mkdir -p agdt ldt gorman whitaker
cp treebank_data/v2.1/Greek/texts/*.xml agdt/
cp treebank_data/v2.1/Latin/texts/*.xml ldt/
cp "Greek-Dependency-Trees/xml versions/"*.xml gorman/
cp whitakers-words/DICTLINE.GEN whitakers-words/INFLECTS.LAT whitaker/
```

| Directory | Source | License | Attribution id |
|---|---|---|---|
| `agdt/`, `ldt/` | Perseus treebanks 2.1 (`bf4334f`) | CC BY-SA 3.0 | `perseus-treebank` |
| `gorman/` | Gorman Greek Dependency Trees (`d823e96`) | CC BY-SA 4.0 | `gorman-trees` |
| `whitaker/` | Whitaker's WORDS (`fb7fb6f`) | free for any use | `whitaker-words` |

The commits are the ones the 2026-11 run used. `agdt/` and `ldt/` are the same
directories `apply-agdt-morphology.ts` and `regloss-served-latin.ts` read.

## How a lemma is chosen

**Greek** (`greek.ts`) — the lemma human annotators gave that spelling in AGDT or
the Gorman trees. Accents and breathings are part of the match; only editorial
differences are folded (grave/acute, enclitic accent, iota adscript, elision,
case). The commonest lemma must be at least twice as frequent as the runner-up,
otherwise the token is left alone.

**Latin** (`latin.ts`) — in order:

1. closed classes: `sum`, `idem`, `uterque`, the *qui* compounds;
2. the lemma LDT annotators gave that spelling (same 2× rule);
3. Whitaker's WORDS (`whitaker.ts`): every stem + ending analysis of the form,
   then one lemma only if it is the sole candidate, dominates LDT lemma
   frequencies 3×, or is strictly commoner in WORDS' own frequency classes.

A capitalised word inside a sentence is not given a common-word lemma, and
mis-decoded text is skipped.

Every lemma written is stamped `lemmaSource: 'form-table' | 'whitaker'`. A real
lemma is never overwritten; rerunning the script changes nothing.

## Commands

```bash
npx tsx scripts/corpus/lemmatize-served.ts --dry-run     # report only
npx tsx scripts/corpus/lemmatize-served.ts               # write + reports/lemma-backfill.md
npx tsx scripts/corpus/lemmatize-served.ts --lang lat    # one language
npx tsx scripts/corpus/lemmatize-served.ts --evaluate    # accuracy check, writes nothing
```

`--evaluate` scores each lookup against hand annotation it was not built from
(Gorman-built tables against AGDT and the reverse; WORDS alone against LDT). The
last run is in `reports/lemma-backfill-accuracy.md`. Much of the residual
disagreement is convention (`ac`/`atque`, `ἐν`/`εἰς`), not error — read the list
of commonest disagreements before reading the percentage.

## What it does not do

- **Context.** One spelling gets one lemma. `quod`, `αὐτοῦ`, Homeric `ὅ` are
  left alone when the annotators split, and decided by majority when they do not.
- **Names.** Proper nouns absent from the treebanks stay unresolved.
- **Koine.** LXX and patristic texts (`grc-koine`) have the same placeholder
  lemmas and are not touched; they want the Macula table as well.
- **Glosses.** Run `regloss-served-latin.ts` afterwards to gloss the new lemmas
  from the bundled dictionary.
