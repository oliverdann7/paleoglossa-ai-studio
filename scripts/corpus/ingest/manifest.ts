/**
 * Ingestion manifest — the durable, reviewable record of WHAT the served corpus
 * should contain, per language, with each text's source and license.
 *
 * The batch runner (`run-manifest.ts`) iterates these entries through the same
 * pipeline the CLI uses. Keeping the target list in code (not scattered shell
 * invocations) makes full-corpus expansion reproducible and reviewable, and
 * lets us record famous-but-blocked sources (PROIEL, ORACC, SEAL) explicitly
 * rather than silently omitting them.
 *
 * Source data files (Macula TSVs, TEI/plaintext dumps) are NOT committed — they
 * are fetched by the maintainer into the sources dir (default
 * `scripts/corpus/ingest/.sources/`, gitignored). An entry whose source file is
 * absent is skipped with a notice, so a full-manifest dry-run works before any
 * download.
 */

export type ManifestSource = 'macula' | 'macula-hebrew' | 'tei' | 'plaintext' | 'work';

export interface ManifestEntry {
  textId: string;
  language: string;
  title: string;
  author?: string;
  source: ManifestSource;
  /** Source-data file name, resolved against the sources dir. */
  file?: string;
  /** Macula book code (macula / macula-hebrew sources). */
  book?: string;
  /** Positional-annotation sidecar file (work source), resolved against sources dir. */
  annotationsFile?: string;
  /** Attribution id in src/data/attributions.ts — enforces the license gate. */
  attribution: string;
  /** 'active' is ingested; 'blocked' is recorded-but-skipped (see reason). */
  status: 'active' | 'blocked';
  blockedReason?: string;
  notes?: string;
}

// ─── Bible book tables (Macula codes → display titles) ───────────────────────

const NT_BOOKS: [code: string, title: string][] = [
  ['MAT', 'Matthew'], ['MRK', 'Mark'], ['LUK', 'Luke'], ['JHN', 'John'],
  ['ACT', 'Acts'], ['ROM', 'Romans'], ['1CO', '1 Corinthians'], ['2CO', '2 Corinthians'],
  ['GAL', 'Galatians'], ['EPH', 'Ephesians'], ['PHP', 'Philippians'], ['COL', 'Colossians'],
  ['1TH', '1 Thessalonians'], ['2TH', '2 Thessalonians'], ['1TI', '1 Timothy'], ['2TI', '2 Timothy'],
  ['TIT', 'Titus'], ['PHM', 'Philemon'], ['HEB', 'Hebrews'], ['JAS', 'James'],
  ['1PE', '1 Peter'], ['2PE', '2 Peter'], ['1JN', '1 John'], ['2JN', '2 John'],
  ['3JN', '3 John'], ['JUD', 'Jude'], ['REV', 'Revelation'],
];

const HB_BOOKS: [code: string, title: string][] = [
  ['GEN', 'Genesis'], ['EXO', 'Exodus'], ['LEV', 'Leviticus'], ['NUM', 'Numbers'], ['DEU', 'Deuteronomy'],
  ['JOS', 'Joshua'], ['JDG', 'Judges'], ['RUT', 'Ruth'], ['1SA', '1 Samuel'], ['2SA', '2 Samuel'],
  ['1KI', '1 Kings'], ['2KI', '2 Kings'], ['1CH', '1 Chronicles'], ['2CH', '2 Chronicles'],
  ['EZR', 'Ezra'], ['NEH', 'Nehemiah'], ['EST', 'Esther'], ['JOB', 'Job'], ['PSA', 'Psalms'],
  ['PRO', 'Proverbs'], ['ECC', 'Ecclesiastes'], ['SNG', 'Song of Songs'], ['ISA', 'Isaiah'],
  ['JER', 'Jeremiah'], ['LAM', 'Lamentations'], ['EZK', 'Ezekiel'], ['DAN', 'Daniel'],
  ['HOS', 'Hosea'], ['JOL', 'Joel'], ['AMO', 'Amos'], ['OBA', 'Obadiah'], ['JON', 'Jonah'],
  ['MIC', 'Micah'], ['NAM', 'Nahum'], ['HAB', 'Habakkuk'], ['ZEP', 'Zephaniah'],
  ['HAG', 'Haggai'], ['ZEC', 'Zechariah'], ['MAL', 'Malachi'],
];

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const ntEntries: ManifestEntry[] = NT_BOOKS.map(([book, title]) => ({
  textId: `grc-koine-${slug(title)}-full`,
  language: 'grc-koine',
  title,
  source: 'macula',
  file: 'macula-greek.tsv',
  book,
  attribution: 'macula-greek',
  status: 'active',
}));

const hbEntries: ManifestEntry[] = HB_BOOKS.map(([book, title]) => ({
  textId: `hbo-${slug(title)}-full`,
  language: 'hbo',
  title,
  source: 'macula-hebrew',
  file: 'macula-hebrew.tsv',
  book,
  attribution: 'macula-hebrew',
  status: 'active',
}));

// ─── Phase-2 staged targets (text-only → AI gloss-fill → human review) ───────
// These validate the adapters under dry-run now; flip files in and ingest once
// the source is downloaded and the gloss cache is reviewed.

const stagedEntries: ManifestEntry[] = [
  {
    textId: 'san-bhagavad-gita-full',
    language: 'san',
    title: 'Bhagavad Gītā',
    source: 'plaintext',
    file: 'gretil/bhagavad-gita.txt',
    attribution: 'gretil',
    status: 'active',
    notes: 'GRETIL CC BY 4.0. Ships partial until AI gloss cache is reviewed.',
  },
  {
    textId: 'syr-peshitta-john-full',
    language: 'syr',
    title: 'Peshitta — Gospel of John',
    source: 'tei',
    file: 'dsc/peshitta-john.xml',
    attribution: 'digital-syriac-corpus',
    status: 'active',
    notes: 'Digital Syriac Corpus CC BY 4.0. Ships partial until reviewed.',
  },
  {
    textId: 'cop-shenoute-selection-full',
    language: 'cop',
    title: 'Shenoute — selected works',
    source: 'tei',
    file: 'scriptorium/shenoute.xml',
    attribution: 'coptic-scriptorium',
    status: 'active',
    notes: 'Coptic SCRIPTORIUM — verify per-corpus license (some BY-SA); ships partial.',
  },
  {
    textId: 'lat-caesar-bg-full',
    language: 'lat',
    title: 'Caesar — De Bello Gallico',
    source: 'plaintext',
    file: 'pd/caesar-bg.txt',
    attribution: 'public-domain-edition',
    status: 'active',
    notes: 'Public-domain edition text; AI gloss-fill + human review before complete.',
  },

  // ─── Recorded-but-blocked (commercial gate fails) ──────────────────────────
  {
    textId: 'grc-iliad-proiel',
    language: 'grc',
    title: 'Homer — Iliad (PROIEL annotations)',
    source: 'work',
    attribution: 'proiel',
    status: 'blocked',
    blockedReason:
      'PROIEL treebank is CC BY-NC-SA — non-commercial. Not ingestible into the paid product. Use a public-domain text + AI annotation instead, or a commercial-mode build.',
  },
  {
    textId: 'akk-oracc-selection',
    language: 'akk',
    title: 'Akkadian royal inscriptions (ORACC)',
    source: 'plaintext',
    attribution: 'oracc',
    status: 'blocked',
    blockedReason:
      'ORACC is CC BY-SA — share-alike; treat as case-by-case before ingesting derived data into a closed product.',
  },
];

/** The full manifest, language-priority ordered. */
export const MANIFEST: ManifestEntry[] = [...ntEntries, ...hbEntries, ...stagedEntries];
