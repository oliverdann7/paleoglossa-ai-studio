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
 *
 * Coverage goal: every bundled text that is an `excerpt`/sample or a `partial`
 * selection of a larger work has a corresponding `*-full` target here, so the
 * served library can be completed to the WHOLE work through the pipeline rather
 * than by hand-expanding the single-chunk bundle. Bible books come from Macula
 * (CC BY 4.0) and assemble fully `complete` with no AI; literary, LXX, patristic
 * and ancient-Near-Eastern works come from public-domain / CC-BY editions and
 * ship `partial` (text + dictionary/AI glosses) until a commercially-licensed
 * treebank or a reviewed gloss cache fills the remaining morphology. Each entry
 * records WHICH bundled excerpt it supersedes in `notes` (`supersedes <id>`).
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
    file: 'pd/bhagavad-gita.txt',
    attribution: 'public-domain-edition',
    status: 'active',
    notes: 'Public-domain Gita dataset (gita/gita, Unlicense); supersedes San-Gita-1. Ships partial (no bundled Sanskrit gloss source — full text + on-click AI).',
  },
  {
    textId: 'syr-peshitta-john-full',
    language: 'syr',
    title: 'Peshitta — Gospel of John',
    source: 'plaintext',
    file: 'pd/syriac-john.txt',
    attribution: 'public-domain-edition',
    status: 'active',
    notes: 'Supersedes Syr-Jn-1. Peshitta NT text from PatristicTextArchive/syrnt (MIT; text public domain). Ships partial (no bundled Syriac gloss source — full text + on-click AI).',
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

// ─── Septuagint (Greek Old Testament) ───────────────────────────────────────
// PD Rahlfs-Hanhart text; ships partial (dictionary/AI gloss-fill). The CATSS
// LXX morphology is non-commercial, so complete morphology needs a reviewed
// gloss cache or a commercially-licensed parse, not CATSS.

const lxxEntries: ManifestEntry[] = [
  { textId: 'grc-lxx-genesis-full', language: 'grc-koine', title: 'Genesis (Septuagint)', source: 'plaintext', file: 'lxx/genesis.txt', attribution: 'lxx-text', status: 'active', notes: 'Supersedes LXX-Gen-1. PD Rahlfs text → AI/dictionary gloss-fill; ships partial until reviewed.' },
  { textId: 'grc-lxx-exodus-full', language: 'grc-koine', title: 'Exodus (Septuagint)', source: 'plaintext', file: 'lxx/exodus.txt', attribution: 'lxx-text', status: 'active', notes: 'Supersedes LXX-Exod-12. PD Rahlfs text; ships partial until reviewed.' },
  { textId: 'grc-lxx-isaiah-full', language: 'grc-koine', title: 'Isaiah (Septuagint)', source: 'plaintext', file: 'lxx/isaiah.txt', attribution: 'lxx-text', status: 'active', notes: 'Supersedes LXX-Isa-6. PD Rahlfs text; ships partial until reviewed.' },
  { textId: 'grc-lxx-proverbs-full', language: 'grc-koine', title: 'Proverbs (Septuagint)', source: 'plaintext', file: 'lxx/proverbs.txt', attribution: 'lxx-text', status: 'active', notes: 'Supersedes LXX-Prov-1. PD Rahlfs text; ships partial until reviewed.' },
  { textId: 'grc-lxx-jonah-full', language: 'grc-koine', title: 'Jonah (Septuagint)', source: 'plaintext', file: 'lxx/jonah.txt', attribution: 'lxx-text', status: 'active', notes: 'Supersedes LXX-Jonah-1. PD Rahlfs text; ships partial until reviewed.' },
];

// ─── Classical Greek literature ──────────────────────────────────────────────
// PD text (Perseus / Project Gutenberg). Glosses fill from dictionaries + AI;
// POS stays `unknown` (→ partial) until a commercially-usable treebank is
// layered as an annotations sidecar. Perseus AGDT/LDT trees are CC BY-SA
// (commercial OK) but have no adapter yet; PROIEL is non-commercial (blocked).

const greekClassicsEntries: ManifestEntry[] = [
  { textId: 'grc-homer-iliad-full', language: 'grc', title: 'Iliad', author: 'Homer', source: 'plaintext', file: 'pd/iliad.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Iliad-1. PD Greek text; ships partial (gloss-fill) until a commercial treebank fills morphology. PROIEL Iliad exists but is non-commercial (see grc-iliad-proiel).' },
  { textId: 'grc-homer-odyssey-full', language: 'grc', title: 'Odyssey', author: 'Homer', source: 'plaintext', file: 'pd/odyssey.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Odyssey-1. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-xenophon-anabasis-full', language: 'grc', title: 'Anabasis', author: 'Xenophon', source: 'plaintext', file: 'pd/anabasis.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Anab-1. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-plato-apology-full', language: 'grc', title: 'Apology', author: 'Plato', source: 'plaintext', file: 'pd/plato-apology.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Plato-Apology-1 (bundled partial). PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-aesop-fables-full', language: 'grc', title: "Aesop's Fables", author: 'Aesop', source: 'plaintext', file: 'pd/aesop.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Aesop-1. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-herodotus-histories-full', language: 'grc-class', title: 'Histories', author: 'Herodotus', source: 'plaintext', file: 'pd/herodotus.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Hdt-Hist. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-thucydides-history-full', language: 'grc-class', title: 'History of the Peloponnesian War', author: 'Thucydides', source: 'plaintext', file: 'pd/thucydides.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Thuc-Hist. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-sophocles-antigone-full', language: 'grc-class', title: 'Antigone', author: 'Sophocles', source: 'plaintext', file: 'pd/antigone.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Soph-Ant. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-plutarch-alexander-full', language: 'grc-class', title: 'Life of Alexander', author: 'Plutarch', source: 'plaintext', file: 'pd/plutarch-alexander.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Plut-Alex. PD Greek text; ships partial until morphology is filled.' },
  { textId: 'grc-lucian-charon-full', language: 'grc-class', title: 'Charon', author: 'Lucian', source: 'plaintext', file: 'pd/lucian-charon.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Lucian-Char. PD Greek text; ships partial until morphology is filled.' },
];

// ─── Classical & late Latin literature ───────────────────────────────────────

const latinClassicsEntries: ManifestEntry[] = [
  { textId: 'lat-vergil-aeneid-full', language: 'lat', title: 'Aeneid', author: 'Virgil', source: 'plaintext', file: 'pd/aeneid.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Aeneid-1. PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-cicero-in-catilinam-full', language: 'lat', title: 'In Catilinam', author: 'Cicero', source: 'plaintext', file: 'pd/cicero-catilinam.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Cic-Catilina-1 (bundled partial). PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-ovid-metamorphoses-full', language: 'lat', title: 'Metamorphoses', author: 'Ovid', source: 'plaintext', file: 'pd/ovid-metamorphoses.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Ovid-Metamorphoses-1 (bundled partial). PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-livy-ab-urbe-condita-full', language: 'lat', title: 'Ab Urbe Condita', author: 'Livy', source: 'plaintext', file: 'pd/livy.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Livy-AUC. PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-sallust-catilinae-full', language: 'lat', title: 'Bellum Catilinae', author: 'Sallust', source: 'plaintext', file: 'pd/sallust-catilinae.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Sall-Cat. PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-tacitus-annals-full', language: 'lat', title: 'Annales', author: 'Tacitus', source: 'plaintext', file: 'pd/tacitus-annals.txt', attribution: 'perseus-texts', status: 'active', notes: 'Supersedes Tac-Ann. PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-disticha-catonis-full', language: 'lat', title: 'Disticha Catonis', source: 'plaintext', file: 'pd/disticha-catonis.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Lat-Cato. PD Latin text; ships partial until morphology is filled.' },
  { textId: 'lat-vulgate-john-full', language: 'lat', title: 'Vulgate — Gospel of John', source: 'plaintext', file: 'pd/vulgate-john.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Lat-Vg-Jn. PD Clementine Vulgate; ships partial until morphology is filled.' },
];

// ─── Patristic & sub-apostolic Greek ─────────────────────────────────────────
// PD Greek editions; ship partial (dictionary/AI gloss-fill) until reviewed.

const patristicsEntries: ManifestEntry[] = [
  { textId: 'grc-patristic-1-clement-full', language: 'grc-koine', title: '1 Clement', author: 'Clement of Rome', source: 'plaintext', file: 'pd/1-clement.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes 1Clem-1. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-didache-full', language: 'grc-koine', title: 'Didache', source: 'plaintext', file: 'pd/didache.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Did-1. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-ignatius-ephesians-full', language: 'grc-koine', title: 'Letter to the Ephesians', author: 'Ignatius of Antioch', source: 'plaintext', file: 'pd/ignatius-ephesians.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Ign-Eph. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-polycarp-philippians-full', language: 'grc-koine', title: 'Letter to the Philippians', author: 'Polycarp', source: 'plaintext', file: 'pd/polycarp-philippians.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Polyc-Phil. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-justin-apology-full', language: 'grc-koine', title: 'First Apology', author: 'Justin Martyr', source: 'plaintext', file: 'pd/justin-apology.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Justin-Apol. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-hermas-shepherd-full', language: 'grc-koine', title: 'The Shepherd', author: 'Hermas', source: 'plaintext', file: 'pd/hermas-shepherd.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Hermas-Vis-1. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-chrysostom-john-homilies-full', language: 'grc-koine', title: 'Homilies on the Gospel of John', author: 'John Chrysostom', source: 'plaintext', file: 'pd/chrysostom-john.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Chrys-Jn-1. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-basil-hexaemeron-full', language: 'grc-koine', title: 'Hexaemeron', author: 'Basil of Caesarea', source: 'plaintext', file: 'pd/basil-hexaemeron.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Basil-Hex-1. PD Greek; ships partial until reviewed.' },
  { textId: 'grc-patristic-athanasius-incarnation-full', language: 'grc-koine', title: 'On the Incarnation', author: 'Athanasius', source: 'plaintext', file: 'pd/athanasius-incarnation.txt', attribution: 'patristic-texts', status: 'active', notes: 'Supersedes Athan-Inc-1. PD Greek; ships partial until reviewed.' },
];

// ─── Ancient Near Eastern & other-language works ─────────────────────────────

const aneEntries: ManifestEntry[] = [
  { textId: 'cop-john-full', language: 'cop', title: 'Gospel of John (Bohairic Coptic)', source: 'plaintext', file: 'pd/coptic-john.txt', attribution: 'coptic-scriptorium', status: 'active', notes: 'Supersedes Cop-Jn-1. Coptic SCRIPTORIUM Bohairic NT (CC BY); ships partial (no bundled Coptic gloss source — full text + on-click AI).' },
  { textId: 'arc-targum-onkelos-genesis-full', language: 'arc', title: 'Targum Onkelos — Genesis', source: 'plaintext', file: 'pd/targum-onkelos-genesis.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Arc-Gen-1. PD Sperber edition; ships partial. (Biblical Aramaic of Daniel/Ezra is covered by macula-hebrew instead.)' },
  { textId: 'hit-mursili-annals-full', language: 'hit', title: 'Annals of Muršili II', source: 'plaintext', file: 'pd/mursili-annals.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Hit-Annals-1. PD transliteration edition; ships partial. Confirm the specific edition is out of copyright.' },
  { textId: 'uga-baal-cycle-full', language: 'uga', title: 'The Baal Cycle', source: 'plaintext', file: 'pd/baal-cycle.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Uga-Baal-1. PD transliteration edition; ships partial. Confirm the specific edition is out of copyright.' },
  { textId: 'egy-ptahhotep-full', language: 'egy', title: 'The Maxims of Ptahhotep', source: 'plaintext', file: 'pd/ptahhotep.txt', attribution: 'public-domain-edition', status: 'active', notes: 'Supersedes Egy-Ptah-1. PD transliteration edition; ships partial. Confirm the specific edition is out of copyright.' },
  {
    textId: 'akk-gilgamesh-full',
    language: 'akk',
    title: 'Epic of Gilgamesh (Standard Babylonian)',
    source: 'plaintext',
    attribution: 'oracc',
    status: 'blocked',
    blockedReason:
      'Supersedes Akk-Gilg-1. The richly-annotated source (ORACC) is CC BY-SA — share-alike, case-by-case for a closed product. Modern critical editions (e.g. George 2003) are in copyright. Ingest only from a confirmed PD transliteration via public-domain-edition, or a share-alike build.',
  },
];

/**
 * The full manifest, language-priority ordered: Bible (Macula, completes with no
 * AI) first, then Septuagint, classical Greek & Latin, patristics, and the
 * ancient-Near-Eastern / other-language works, then the previously-staged
 * targets and the recorded-but-blocked sources.
 */
export const MANIFEST: ManifestEntry[] = [
  ...ntEntries,
  ...hbEntries,
  ...lxxEntries,
  ...greekClassicsEntries,
  ...latinClassicsEntries,
  ...patristicsEntries,
  ...aneEntries,
  ...stagedEntries,
];
