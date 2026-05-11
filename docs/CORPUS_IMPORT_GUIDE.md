# Corpus Import Guide

This project uses the existing PalæoGlossa corpus architecture:

- Text records live in `src/data/corpus.ts` and use the `Text` type from `src/types/corpus.ts`.
- Sections and sentences use `TextSection`, `Sentence`, and `Token` from `src/types/corpus.ts`.
- The app browses texts through `LibraryService` and opens them through the existing reader route, `/app/reader/:textId`.
- Mock/sample texts are generated through `src/data/mockTexts.ts` and should remain tiny.

Do not add a second corpus browser, text model, or reader route. Extend `CorpusDB`, `LibraryService`, and the existing `Text` metadata fields.

## Required Text Metadata

Each curated corpus text should define as many of these fields as possible:

- `id`: stable text id used by `/app/reader/:textId`
- `corpusId`: id of the corpus collection
- `title`: display title
- `author`: author or traditional attribution
- `language`: language id, such as `grc`, `grc-koine`, `hbo`, or `lat`
- `date`: human-readable date, such as `1st c. CE`
- `period`: broader period, such as `Classical`, `Late Antique`, or `Iron Age`
- `genre`: genre, such as `Epic`, `Gospel`, `History`, or `Inscription`
- `corpusType`: one of `biblical`, `classical`, `patristic`, `inscription`, `manuscript`, `islamicate`, or `other`
- `level`: reading difficulty label
- `sourceAttributionId`: attribution key from `ATTRIBUTIONS`
- `hasMorphology`, `hasTranslation`, `hasAudio`, `hasSyntax`: tool availability flags
- `sectionsPreview`: navigable sections shown in the library and loaded by the reader

## Section Hierarchy

Represent hierarchy with section labels rather than a separate tree model unless the reader requires more structure.

Examples:

- Biblical: `Book 1`, `Chapter 1`, `John 1`, `Psalm 23`
- Classical: `Book 1`, `Book 1, Lines 1-10`, `Section 1`
- Manuscript: `Folio 1r`, `Folio 1v`, `Column A`
- Documentary or inscriptional: `Line 1-5`, `Face A`, `Fragment 1`

Every `sectionsPreview[].id` must resolve through `CorpusDB.getSection(sectionId)`.

## Licensing Rules

Only import texts, morphology, translations, audio, syntax trees, and lexical data when the license permits use in this app.

Do not import copyrighted corpora or lexicons unless you have explicit permission and the license is recorded in `ATTRIBUTIONS`.

For every source, add or reuse an `ATTRIBUTIONS` entry with:

- source name and URL
- data type
- license name and license URL if available
- attribution text
- commercial-use/modification/share-alike flags
- notes about restrictions

If a source requires attribution, keep `requiresAttribution: true` and display the source/license in the UI.

## Recommended Import Steps

1. Add or verify a `SourceAttribution` in `ATTRIBUTIONS`.
2. Add or verify a `Corpus` entry with `sourceAttributionId`.
3. Add a tiny `Text` record with metadata and `sectionsPreview`.
4. Add a small `TextSection` sample with tokenized sentences.
5. Register the text and section in `CorpusDB.getTexts()`, `CorpusDB.getText()`, and `CorpusDB.getSection()`.
6. Confirm the text appears in `/app/library` and opens in `/app/reader/:textId`.
7. Keep sample data minimal unless the license and product plan explicitly allow bulk import.

## Sample Data Policy

Use tiny samples for MVP and development fixtures. Large public-domain or permissively licensed corpora should be imported through a documented ingestion pipeline, not pasted directly into source files.
