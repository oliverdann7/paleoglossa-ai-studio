/**
 * Lemma backfill for the served Latin and Classical Greek corpus (zero AI).
 *
 * A token without a lemma is tracked in the learner's vocabulary by its surface
 * form, so every inflected form is a separate word to learn and to highlight
 * (docs/vocabulary-identity.md). This pass fills empty lemmas by form lookup:
 *
 *   grc  treebank form tables — Perseus AGDT 2.1 + the Gorman trees
 *        (`lemmatize/greek.ts`)
 *   lat  Perseus LDT form table, then Whitaker's WORDS (`lemmatize/latin.ts`)
 *
 * It also replaces PLACEHOLDER lemmas. An early gloss pass wrote the token's own
 * normalized surface into `lemma` (τὸν → "τον", mihi → "mihi"), which counts as
 * lemma coverage in every audit while doing nothing a lemma is for. A Greek
 * placeholder is unmistakable (no accent or breathing); a Latin one is a lemma
 * identical to its surface, replaced only when the lookup names a different word.
 *
 * A real lemma is never touched, and a form the sources disagree about is left
 * as it was rather than guessed. Every lemma written here is stamped
 * `lemmaSource` ('form-table' | 'whitaker') so it can be told apart from an
 * aligned treebank annotation, audited, or reverted.
 *
 * Sources live in `scripts/corpus/ingest/.sources/` (git-ignored) — see
 * `scripts/corpus/lemmatize/README.md` for how to fetch them.
 *
 * Usage:
 *   npx tsx scripts/corpus/lemmatize-served.ts [--lang lat|grc] [--dry-run]
 *   npx tsx scripts/corpus/lemmatize-served.ts --evaluate
 *
 * `--evaluate` writes nothing: it measures each lookup against the hand-made
 * lemmas of a treebank the lookup was not built from.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { buildGreekTables, greekLooseKey, isGreekLemma, lookupGreekLemma, type GreekTables } from './lemmatize/greek.js';
import { buildLatinTables, isLatinLemma, lookupLatinLemma, type LatinTables } from './lemmatize/latin.js';
import { readTreebankWords } from './lemmatize/treebank.js';
import { buildWhitaker, wordsKey, type Whitaker } from './lemmatize/whitaker.js';

const DIR = 'public/corpus-data';
const SOURCES = 'scripts/corpus/ingest/.sources';
const REPORT = 'reports/lemma-backfill.md';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const evaluate = args.includes('--evaluate');
const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : undefined;
const LANGS = (langArg ? [langArg] : ['grc', 'lat']) as Array<'grc' | 'lat'>;

interface ServedToken {
  surface: string;
  lemma: string;
  treebankSource?: string;
  lemmaSource?: string;
}
interface ServedRecord {
  text: { id: string; language: string; title?: string };
  sections: Array<{ sentences: Array<{ tokens: ServedToken[] }> }>;
}

function xmlFiles(dir: string, skip: (file: string) => boolean = () => false): string[] {
  const path = join(SOURCES, dir);
  if (!existsSync(path)) {
    throw new Error(`Missing ${path} — see scripts/corpus/lemmatize/README.md for how to fetch the sources.`);
  }
  return readdirSync(path)
    .filter((f) => f.endsWith('.xml') && !skip(f))
    .map((f) => readFileSync(join(path, f), 'utf-8'));
}

function loadWhitaker(): Whitaker {
  const dir = join(SOURCES, 'whitaker');
  if (!existsSync(join(dir, 'DICTLINE.GEN'))) {
    throw new Error(`Missing ${dir}/DICTLINE.GEN — see scripts/corpus/lemmatize/README.md.`);
  }
  // The WORDS data files are 7-bit ASCII with CRLF line ends.
  return buildWhitaker(readFileSync(join(dir, 'DICTLINE.GEN'), 'latin1'), readFileSync(join(dir, 'INFLECTS.LAT'), 'latin1'));
}

function servedRecords(lang: string): Array<{ file: string; record: ServedRecord }> {
  const out: Array<{ file: string; record: ServedRecord }> = [];
  for (const file of readdirSync(DIR).sort()) {
    if (!file.endsWith('-full.json')) continue;
    const record = JSON.parse(readFileSync(join(DIR, file), 'utf-8')) as ServedRecord;
    if (record.text.language === lang) out.push({ file, record });
  }
  return out;
}

/** Every token, with whether it is the first word of its sentence. */
function* tokensOf(record: ServedRecord, isWord: RegExp): Generator<{ token: ServedToken; initial: boolean }> {
  for (const section of record.sections) {
    for (const sentence of section.sentences) {
      let seenWord = false;
      for (const token of sentence.tokens) {
        const word = isWord.test(token.surface);
        yield { token, initial: word && !seenWord };
        seenWord ||= word;
      }
    }
  }
}

const HAS_LETTER: Record<'grc' | 'lat', RegExp> = {
  grc: /[Ͱ-Ͽἀ-῿]/,
  // Latin words only: a digit or bracket marks an apparatus number, not a word.
  lat: /^[^0-9[\](){}<>]*[A-Za-z][^0-9[\](){}<>]*$/,
};

type Lookup = (surface: string, sentenceInitial: boolean) => { lemma: string; tier: string } | undefined;
const LEMMA_SOURCE: Record<string, string> = {
  exact: 'form-table',
  treebank: 'form-table',
  closed: 'form-table',
  words: 'whitaker',
};

const pct = (n: number, d: number): string => (d === 0 ? '–' : `${((100 * n) / d).toFixed(1)}%`);

// ── Backfill ─────────────────────────────────────────────────────────────────

const COMBINING = /[\u0300-\u036f]/;

/** Same dictionary word, ignoring spelling conventions vocabulary identity also ignores. */
const SAME_LEMMA: Record<'grc' | 'lat', (a: string, b: string) => boolean> = {
  grc: (a, b) => greekLooseKey(a) === greekLooseKey(b),
  lat: (a, b) => wordsKey(a) === wordsKey(b),
};

/**
 * Is this lemma a copy of the surface rather than an annotation?
 *  grc: every real Greek lemma carries an accent or a breathing.
 *  lat: nothing in the spelling tells — a lemma equal to its surface is a
 *       candidate, and the lookup decides.
 */
function isPlaceholder(lang: 'grc' | 'lat', token: ServedToken): boolean {
  if (lang === 'grc') return !COMBINING.test(token.lemma.normalize('NFD'));
  return wordsKey(token.lemma) === wordsKey(token.surface);
}

function backfill(lang: 'grc' | 'lat', lookup: Lookup): string[] {
  const lines = [
    `| Text | Words | Real lemma before | Real lemma after | Filled | Placeholders replaced | Still unresolved |`,
    `|---|---|---|---|---|---|---|`,
  ];
  const tiers = new Map<string, number>();
  const total = { words: 0, before: 0, filled: 0, replaced: 0, unresolved: 0 };
  for (const { file, record } of servedRecords(lang)) {
    const n = { words: 0, before: 0, filled: 0, replaced: 0, unresolved: 0 };
    for (const { token, initial } of tokensOf(record, HAS_LETTER[lang])) {
      if (!HAS_LETTER[lang].test(token.surface)) continue;
      n.words++;
      const empty = !token.lemma;
      if (!empty && !isPlaceholder(lang, token)) {
        n.before++;
        continue;
      }
      const hit = lookup(token.surface, initial);
      if (!hit) {
        n.unresolved++;
        continue;
      }
      if (!empty && SAME_LEMMA[lang](hit.lemma, token.lemma)) {
        // The surface IS the dictionary form (et, in, a nominative). In Greek the
        // placeholder still lacks its accents, so the real spelling replaces it.
        n.before++;
        if (lang === 'grc') {
          token.lemma = hit.lemma;
          token.lemmaSource = LEMMA_SOURCE[hit.tier];
        }
        continue;
      }
      token.lemma = hit.lemma;
      token.lemmaSource = LEMMA_SOURCE[hit.tier];
      tiers.set(hit.tier, (tiers.get(hit.tier) ?? 0) + 1);
      if (empty) n.filled++;
      else n.replaced++;
    }
    const after = n.before + n.filled + n.replaced;
    lines.push(
      `| ${record.text.id} | ${n.words} | ${pct(n.before, n.words)} | ${pct(after, n.words)} | ${n.filled} | ${n.replaced} | ${n.unresolved} |`
    );
    for (const k of Object.keys(total) as Array<keyof typeof total>) total[k] += n[k];
    if (!dryRun) writeFileSync(join(DIR, file), JSON.stringify(record));
  }
  const after = total.before + total.filled + total.replaced;
  lines.push(
    `| **${lang} total** | ${total.words} | ${pct(total.before, total.words)} | ${pct(after, total.words)} | ${total.filled} | ${total.replaced} | ${total.unresolved} |`,
    '',
    `Lemmas written, by tier: ${[...tiers].map(([tier, n]) => `${tier} ${n}`).join(', ') || 'none'}.`,
    ''
  );
  return lines;
}

// ── Evaluation ───────────────────────────────────────────────────────────────

/** Agreement of `lookup` with the hand-made lemmas of treebank files it was not built from. */
function evaluateAgainstTreebank(
  lang: 'grc' | 'lat',
  goldName: string,
  goldXml: string[],
  lookup: Lookup
): string[] {
  let gold = 0;
  const byTier = new Map<string, { answered: number; agreed: number }>();
  const disagreements = new Map<string, number>();
  const isLemma = lang === 'grc' ? isGreekLemma : isLatinLemma;
  for (const xml of goldXml) {
    for (const { form, lemma } of readTreebankWords(xml, isLemma)) {
      if (!HAS_LETTER[lang].test(form)) continue;
      gold++;
      // A treebank word list has no sentence positions: assume the stricter case.
      const hit = lookup(form, false);
      if (!hit) continue;
      const tier = byTier.get(hit.tier) ?? { answered: 0, agreed: 0 };
      byTier.set(hit.tier, tier);
      tier.answered++;
      if (SAME_LEMMA[lang](hit.lemma, lemma)) tier.agreed++;
      else {
        const k = `${form} → ${hit.lemma} (${goldName}: ${lemma})`;
        disagreements.set(k, (disagreements.get(k) ?? 0) + 1);
      }
    }
  }
  let answered = 0;
  let agreed = 0;
  const lines = [
    `Checked against ${gold} words annotated by hand in ${goldName}.`,
    '',
    `| Tier | Answered | Share of words | Agrees with ${goldName} |`,
    `|---|---|---|---|`,
  ];
  for (const [tier, t] of byTier) {
    lines.push(`| ${tier} | ${t.answered} | ${pct(t.answered, gold)} | ${pct(t.agreed, t.answered)} |`);
    answered += t.answered;
    agreed += t.agreed;
  }
  lines.push(`| **all** | ${answered} | ${pct(answered, gold)} | ${pct(agreed, answered)} |`);
  const top = [...disagreements].sort((a, b) => b[1] - a[1]).slice(0, 25);
  lines.push('', 'Commonest disagreements:', '', ...top.map(([k, n]) => `- ${k} ×${n}`), '');
  return lines;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const report: string[] = [];

if (evaluate) {
  report.push('# Lemma backfill — accuracy check', '');
  if (LANGS.includes('grc')) {
    // Each treebank is checked with tables built from the other one only.
    const agdt = xmlFiles('agdt');
    const gorman = xmlFiles('gorman');
    const fromGorman = buildGreekTables(gorman);
    const fromAgdt = buildGreekTables(agdt);
    report.push(
      '## Classical Greek',
      '',
      '### Tables from the Gorman trees, checked against AGDT (mostly verse)',
      '',
      ...evaluateAgainstTreebank('grc', 'AGDT', agdt, (s) => lookupGreekLemma(fromGorman, s)),
      '### Tables from AGDT, checked against the Gorman trees (prose)',
      '',
      ...evaluateAgainstTreebank('grc', 'Gorman', gorman, (s) => lookupGreekLemma(fromAgdt, s))
    );
  }
  if (LANGS.includes('lat')) {
    // No treebank table and no treebank prior: this isolates WORDS and the closed classes.
    const empty: LatinTables = { forms: new Map(), lemmaCounts: new Map(), words: 0 };
    const words = loadWhitaker();
    report.push(
      '## Latin',
      '',
      "### Whitaker's WORDS alone, checked against Perseus LDT",
      '',
      ...evaluateAgainstTreebank('lat', 'LDT', xmlFiles('ldt'), (s) => lookupLatinLemma(empty, words, s))
    );
  }
  console.log(report.join('\n'));
} else {
  report.push(
    '# Lemma backfill — served Latin and Classical Greek',
    '',
    `Generated by \`scripts/corpus/lemmatize-served.ts\`${dryRun ? ' (dry run)' : ''}. Tokens counted are words: apparatus numbers and stray punctuation are excluded.`,
    ''
  );
  if (LANGS.includes('grc')) {
    const tables: GreekTables = buildGreekTables([...xmlFiles('agdt'), ...xmlFiles('gorman')]);
    console.log(`Greek tables: ${tables.words} treebank words, ${tables.exact.size} spellings`);
    report.push('## Classical Greek (`grc`)', '', ...backfill('grc', (s) => lookupGreekLemma(tables, s)));
  }
  if (LANGS.includes('lat')) {
    const tables = buildLatinTables(xmlFiles('ldt'));
    const words = loadWhitaker();
    console.log(`Latin tables: ${tables.words} treebank words, ${tables.forms.size} forms; WORDS ${words.entryCount} entries`);
    report.push('## Latin (`lat`)', '', ...backfill('lat', (s, initial) => lookupLatinLemma(tables, words, s, initial)));
  }
  console.log(report.join('\n'));
  if (!dryRun && !langArg) writeFileSync(REPORT, report.join('\n'));
}
