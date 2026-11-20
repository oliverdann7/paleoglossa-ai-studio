# Vocabulary identity

A vocabulary item is identified by **(language, normalized lemma)**. One module,
`src/lib/vocabulary/identity.ts`, derives everything from that pair:

| Function | Used for |
|---|---|
| `vocabKey(lemma, languageId)` | Key of the in-memory `KnowledgeMap` and of the guest `localStorage` store |
| `vocabDocId(lemma, languageId)` | Firestore ID in `users/{uid}/vocabulary/{id}` (also what review scheduling addresses) |
| `normalizeLemma(lemma, languageId)` | The stored `normalizedTerm`, and lemma matching in the recommender |

`KnowledgeMap` keys are not displayable. Show `info.lemma` (helper: `displayLemma(key, info)`).
`normalizeLemmaKey` in `lib/utils/lemmaUtils` is the language-blind skeleton; it is for
search/dictionary matching only and must not be used to read or write vocabulary.

## What was wrong (measured on `public/corpus-data`, 2026-11)

| Defect | Evidence |
|---|---|
| Memory was keyed by lemma only, Firestore by language + lemma | 8,203 keys shared by `grc` and `grc-koine`, 279 by `hbo` and `arc`. On load the two documents were merged into one entry carrying one `languageId`, so state leaked across languages and the other language's statistics lost the word. |
| Document IDs were truncated to 120 characters (~13 Greek letters) | 359 colliding groups of single-word terms in Greek alone (`ταπεινοφροσύνη` / `ταπεινοφροσύνης`); 3,493 of 16,783 Koine sentences share a truncated ID with another, and "save sentence" stores the sentence as a term. The later write silently replaced the earlier one. |
| Un-lemmatized tokens had an empty lemma in the reader | 20% of `grc`, 31% of `lat`, 79% of `arc`, 75% of `cop` tokens in served texts have `lemma: ""`. All of them shared one vocabulary entry: marking one marked them all. |
| Diacritics stripped for every language | Transliterated languages lost phonemic consonants: Egyptian `ḥr`, `ẖr`, `ḫr` all became `hr`; Akkadian `ṣēru` and `šēru` both `seru`. |
| The one-shot `migrateToLemmaKeys` stopped at 490 operations and then marked itself done | Larger vocabularies were left partly migrated for good. |
| Removing a word on the Vocabulary page wrote to language `unknown` | The removal never reached the word's real document for signed-in users. |

## Normalization rules

| Language | Rule | Why |
|---|---|---|
| `grc`, `grc-koine` | Accent-insensitive, **except** a curated list of lemma homographs (`εἷς`, `εἶμι`, `ἦ`, `οὗ`, `τίς`, …) which keep their diacritics | The corpus is not consistently accented: Koine has `καί` ×8,181 and `και` ×14,247, `εἰς` ×1,576 and `εις` ×1,912. Keying on full diacritics would split one word in two and break highlighting. The commoner homograph keeps the unaccented key, so unaccented lemmas and all existing data resolve to it. |
| `lat` | Case, macrons, `j→i`, `v→u`, `æ→ae`, `œ→oe` | 148 lemma groups in the corpus differ only by these (`iam`/`jam`, `vidi`/`uidi`). |
| `hbo`, `arc` | Vowel points kept; cantillation, meteg, rafe and edge punctuation dropped | Niqqud distinguishes lexemes (`דָּבָר` / `דֶּבֶר`); te'amim never do. |
| `syr` | Unchanged | Corpus lemmas are unvocalised and consistent; no collisions found. |
| `akk`, `hit`, `uga`, `egy`, `san` | All diacritics kept | They are phonemic in transliteration. |
| others | Unchanged (accent-insensitive, lower-case) | |

Surrounding punctuation is trimmed for every language. An empty lemma is not an
identity: writes for it are refused and old entries for it are ignored.

## Document IDs

IDs whose encoding fits in 120 characters are **byte-identical to the previous scheme**, so
almost every existing document is already in place. Longer keys get a 96-character prefix,
a `-`, and a hash of the whole key.

## Migration: `VocabularyService.repairVocabularyIdentity`

Not a flagged one-shot. `getVocabulary` already reads every document; it remembers them
when at least one sits at the wrong ID, and the repair moves those, merging documents that
now coincide (most advanced state wins, a scheduled review breaks ties, encounter counts
add up, contexts/notes/gloss are kept).

- **No extra reads**, and no writes at all when nothing is misplaced. It also removes the
  per-load read of `users/{uid}/meta/migrationVersion`.
- **Idempotent**: a repaired layout produces an empty plan.
- **Atomic per identity**: each merged document is written in the same batch that deletes
  its sources. A failed commit leaves storage as it was and is retried on the next load.
- **Tolerates old clients**: a cached PWA or an older native build keeps writing old IDs.
  Reads merge duplicates by identity, so the UI is right immediately, and the next load on
  a current client repairs storage.
- The in-memory map never depends on the repair having run.

### Risks and limits

- A document that two long terms overwrote in the past holds only the last one. The repair
  places that survivor correctly; the overwritten term cannot be recovered.
- A Greek user who marked `εἰς` known had `εἷς` covered by the same entry. After the split
  the entry stays with whichever lemma was stored (almost always `εἰς`); the other reads as new.
- Latin documents containing `j` or `v`, and transliterated-language documents with
  diacritics, are rewritten once (one set + one delete each).
- If one group's target is another group's source and the two land in different batches
  (only above ~450 operations) and the run fails between them, an encounter count can be
  double-counted on retry. States and schedules are unaffected.
- `reviewLogs.vocabItemId` in historical logs keeps the old ID of moved documents.
- `grc` and `grc-koine` remain separate vocabularies, as they always were in Firestore.
  Sharing them is a product decision, not made here.
- Un-lemmatized tokens are tracked by surface form, so each inflected form is its own item.
  The real fix is lemmatizing the corpus (see the plan document).
