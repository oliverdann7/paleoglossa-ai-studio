/**
 * Native ingestion script for PaleoGlossa.
 *
 * Usage:
 *   tsx scripts/ingest.ts [options]
 *
 * Options:
 *   --input <path>        Input file path (plain text or TSV). Reads from stdin if omitted.
 *   --lang <id>           Language ID (e.g., grc, hbo, lat). Default: grc.
 *   --output <path>       Output JSON file path. Prints to stdout if omitted.
 *   --format <format>     Output format: "corpus" or "import". Default: corpus.
 *   --dry-run             Print parsed result without writing.
 *   --has-annotations     Input is TSV with columns: text lemma gloss morph.
 *   --section-size <n>    Sentences per section. Default: 50.
 *   --text-id <id>        Text ID for the output. Default: "ingested-text".
 *   --title <title>       Text title. Default: "Ingested Text".
 *   --help                Show this message.
 *
 * TSV format (--has-annotations):
 *   Tab-separated: text<tab>lemma<tab>gloss<tab>morph (optional extra columns ignored)
 *
 * Examples:
 *   cat my-text.txt | tsx scripts/ingest.ts --lang grc --dry-run
 *   tsx scripts/ingest.ts --input texts/iliad.txt --lang grc --output iliad.json
 *   tsx scripts/ingest.ts --input annotated.tsv --has-annotations --lang hbo --format import
 */

import fs from 'node:fs';
import path from 'node:path';

// ── Types matching src/types/corpus.ts and src/types/firestore.ts ─────

interface IngestedToken {
  id: string;
  surface: string;
  normalized: string;
  lemma: string;
  gloss: string;
  punctBefore: string;
  punctAfter: string;
}

interface IngestedSentence {
  id: string;
  tokens: IngestedToken[];
  translation?: string;
}

interface IngestedSection {
  id: string;
  textId: string;
  sequence: number;
  label: string;
  sentences: IngestedSentence[];
}

interface IngestedText {
  id: string;
  title: string;
  language: string;
  direction: string;
  hasMorphology: boolean;
  hasTranslation: boolean;
  hasTransliteration: boolean;
  sections: IngestedSection[];
}

// ── Helpers ───────────────────────────────────────────────────────────

const LANGUAGE_DIRECTIONS: Record<string, string> = {
  grc: 'ltr', 'grc-koine': 'ltr', hbo: 'rtl', lat: 'ltr',
  syr: 'rtl', cop: 'ltr', arc: 'rtl', akk: 'ltr', san: 'ltr',
  egy: 'ltr', hit: 'ltr',
};

function normalizeLang(lang: string): string {
  const alias: Record<string, string> = {
    'ancient greek': 'grc', 'koine greek': 'grc-koine',
    'biblical hebrew': 'hbo', 'classical latin': 'lat',
    greek: 'grc', hebrew: 'hbo', latin: 'lat',
    syriac: 'syr', coptic: 'cop', aramaic: 'arc',
    akkadian: 'akk', sanskrit: 'san',
    'egyptian hieroglyphs': 'egy', hittite: 'hit',
  };
  return alias[lang.toLowerCase().trim()] || lang;
}

function idCounter(): () => string {
  let i = 0;
  return () => `t${++i}`;
}

function normalizeToken(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// ── Parsing ───────────────────────────────────────────────────────────

function isPunctuation(ch: string): boolean {
  return /^[.,!?;:(){}""''«»—–\-…··׳״]$/.test(ch);
}

function splitText(text: string): string[][] {
  const paragraphSeparator = /\n\s*\n/;
  const paragraphs = text.split(paragraphSeparator).filter(p => p.trim().length > 0);
  return paragraphs.map(p =>
    p.split(/\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  );
}

function tokenizeLine(line: string, nextId: () => string): IngestedToken[] {
  const tokens: IngestedToken[] = [];
  const parts = line.match(/\S+/g) || [];

  for (const word of parts) {
    const surface = word;
    const punctBefore = '';
    const punctAfter = '';

    if (isPunctuation(surface)) {
      tokens.push({
        id: nextId(),
        surface,
        normalized: surface,
        lemma: surface,
        gloss: '',
        punctBefore: '',
        punctAfter: '',
      });
      continue;
    }

    tokens.push({
      id: nextId(),
      surface,
      normalized: normalizeToken(surface),
      lemma: surface,
      gloss: '',
      punctBefore,
      punctAfter,
    });
  }

  return tokens;
}

function parseTsvLine(
  line: string,
  nextId: () => string,
): IngestedToken[] {
  const cols = line.split('\t');
  if (cols.length < 1) return [];

  const text = cols[0].trim();
  if (!text) return [];

  const lemma = (cols[1] || text).trim();
  const gloss = (cols[2] || '').trim();

  const normalized = normalizeToken(text);

  return [{
    id: nextId(),
    surface: text,
    normalized,
    lemma,
    gloss,
    punctBefore: '',
    punctAfter: '',
  }];
}

// ── Building ──────────────────────────────────────────────────────────

function buildCorpus(
  lines: string[][],
  options: {
    lang: string;
    textId: string;
    title: string;
    sectionSize: number;
    hasAnnotations: boolean;
  },
): IngestedText {
  const nextId = idCounter();
  const lang = normalizeLang(options.lang);
  const direction = LANGUAGE_DIRECTIONS[lang] || 'ltr';

  let sentenceCounter = 0;
  let sectionCounter = 0;
  const sections: IngestedSection[] = [];

  for (const paragraph of lines) {
    const sectionSentences: IngestedSentence[] = [];

    for (const line of paragraph) {
      const tokens = options.hasAnnotations
        ? parseTsvLine(line, nextId)
        : tokenizeLine(line, nextId);

      if (tokens.length === 0) continue;

      sentenceCounter++;
      sectionSentences.push({
        id: `${options.textId}-s${sentenceCounter}`,
        tokens,
      });
    }

    if (sectionSentences.length === 0) continue;

    // Group into sections by size
    for (let i = 0; i < sectionSentences.length; i += options.sectionSize) {
      sectionCounter++;
      const chunk = sectionSentences.slice(i, i + options.sectionSize);
      sections.push({
        id: `${options.textId}-sec${sectionCounter}`,
        textId: options.textId,
        sequence: sectionCounter,
        label: `Section ${sectionCounter}`,
        sentences: chunk,
      });
    }
  }

  return {
    id: options.textId,
    title: options.title,
    language: lang,
    direction,
    hasMorphology: options.hasAnnotations,
    hasTranslation: false,
    hasTransliteration: false,
    sections,
  };
}

// ── CLI ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags: Record<string, string> = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
    flags[key] = val;
  }
}

if (flags.help) {
  console.log(fs.readFileSync(__filename, 'utf-8').split('\n').slice(2, 33).join('\n'));
  process.exit(0);
}

async function main() {
  const lang = flags.lang || 'grc';
  const textId = flags['text-id'] || 'ingested-text';
  const title = flags.title || 'Ingested Text';
  const sectionSize = parseInt(flags['section-size'] || '50', 10);
  const hasAnnotations = flags['has-annotations'] === 'true';
  const format = flags.format || 'corpus';
  const dryRun = flags['dry-run'] === 'true';
  const outputPath = flags.output;

  // Read input
  const raw = flags.input
    ? fs.readFileSync(path.resolve(flags.input), 'utf-8')
    : await new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
        process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });

  if (!raw.trim()) {
    console.error('No input provided. Pipe text or use --input.');
    process.exit(1);
  }

  const lines = splitText(raw);
  const corpus = buildCorpus(lines, { lang, textId, title, sectionSize, hasAnnotations });

  const stats = {
    textId: corpus.id,
    language: corpus.language,
    sections: corpus.sections.length,
    sentences: corpus.sections.reduce((s, sec) => s + sec.sentences.length, 0),
    tokens: corpus.sections.reduce((s, sec) =>
      s + sec.sentences.reduce((st, sen) => st + sen.tokens.length, 0), 0),
  };

  if (dryRun) {
    console.log('── Ingest dry-run ──');
    console.log(JSON.stringify(stats, null, 2));
    console.log('First sentence sample:');
    const first = corpus.sections[0]?.sentences[0];
    if (first) {
      console.log(`  ${first.tokens.map(t => t.surface).join(' ')}`);
      console.log(`  Tokens: ${first.tokens.length}`);
    } else {
      console.log('  (no content parsed)');
    }
    return;
  }

  const output =
    format === 'import'
      ? { ...corpus, sourceType: 'paste', rawContent: raw, stats }
      : corpus;

  const json = JSON.stringify(output, null, 2);

  if (outputPath) {
    const resolved = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, json, 'utf-8');
    console.log(`Written to ${resolved}`);
    console.log(`Stats: ${stats.sentences} sentences, ${stats.tokens} tokens in ${stats.sections} sections`);
  } else {
    console.log(json);
  }
}

main().catch(err => {
  console.error('Ingestion failed:', err.message);
  process.exit(1);
});
