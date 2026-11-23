/**
 * Lemma backfill for the served corpus (zero AI).
 *
 * A token without a real lemma is tracked by its surface form, so every
 * inflected form is a separate vocabulary item (docs/vocabulary-identity.md).
 * Two kinds of token need one:
 *   - empty: `lemma: ""`;
 *   - pseudo: the `lemma` is only a copy of the surface form. Earlier gloss
 *     passes wrote these wholesale — in Xenophon, Plato, the LXX, the
 *     Apostolic Fathers and most Latin texts 80–100% of "lemmas" equal the
 *     surface, against ~35% in the properly lemmatized New Testament.
 *
 * This pass resolves both from form tables and stamps `lemmaSource`. A real
 * lemma (one that differs from its surface, or comes from a treebank) is never
 * touched, and a form is resolved only when the evidence is unambiguous.
 *
 * Sources — all usable in the paid product (see src/data/attributions.ts):
 *   Greek  1. the corpus's own lemmatized grc / grc-koine tokens
 *          2. Perseus Ancient Greek Dependency Treebank v2.1 (CC BY-SA 3.0)
 *   Latin  1. Perseus Latin Dependency Treebank v2.1 (CC BY-SA 3.0)
 *          2. Whitaker's WORDS dictionary + inflections (free for any use)
 *
 * Deliberately NOT used: Celano's lemmatized Greek texts (CC BY-NC), the
 * Gorman trees (CC BY-NC-SA), PROIEL (CC BY-NC-SA).
 *
 * Fetch the sources into scripts/corpus/ingest/.sources/ (git-ignored):
 *   agdt/, ldt/   https://github.com/PerseusDL/treebank_data  v2.1/{Greek,Latin}/texts/*.xml
 *                 (33 Greek and 12 Latin files at bf4334f — all of them; Petronius is not named *.tb.xml)
 *   whitaker/     https://github.com/mk270/whitakers-words     DICTLINE.GEN, INFLECTS.LAT
 *
 * Usage: npx tsx scripts/corpus/lemmatize-served.ts [--dry-run] [--evaluate]
 *   --evaluate  also score each method against tokens that already have a lemma
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { normalizeLemma } from '../../src/lib/vocabulary/identity.js';
import { LatinAnalyser, foldLatin } from './latinWords.js';
import { pickLemma, type Counts } from './lemmaPick.js';

const DIR = 'public/corpus-data';
const SOURCES = 'scripts/corpus/ingest/.sources';
const dryRun = process.argv.includes('--dry-run');
const evaluate = process.argv.includes('--evaluate');

interface ServedToken {
  surface: string;
  lemma: string;
  treebankSource?: string;
  gloss?: string;
  lemmaSource?: string;
  glossSource?: string;
}

type FormIndex = Map<string, Counts>;

const EDGE = /^[^\p{L}']+|[^\p{L}']+$/gu;
const ELISION = /[’ʼ᾽᾿]/g;

/** Greek form with its diacritics: grave→acute, length marks dropped. */
function greekExact(s: string): string {
  return s
    .normalize('NFD')
    .replace(/̀/g, '́')
    .replace(/[̄̆]/g, '')
    .toLowerCase()
    .replace(ELISION, "'")
    .replace(EDGE, '')
    .normalize('NFC');
}

/** Greek form without diacritics, Ionic iota adscript folded (τωι → τω). */
function greekLoose(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(ELISION, "'")
    .replace(EDGE, '')
    .replace(/(ω|η)ι$/, '$1');
}

function latinKey(s: string): string {
  return foldLatin(s).replace(EDGE, '');
}

function add(index: FormIndex, key: string, lemma: string, n = 1) {
  if (!key || !lemma) return;
  let counts = index.get(key);
  if (!counts) index.set(key, (counts = new Map()));
  counts.set(lemma, (counts.get(lemma) ?? 0) + n);
}

// ── Treebanks ────────────────────────────────────────────────────────────────

function* treebankWords(dir: string): Generator<{ form: string; lemma: string }> {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.xml'))) {
    const xml = readFileSync(join(dir, file), 'utf8');
    // A word split across verse lines is annotated as `τοκεῦ` (XSEG) + `-` + `σιν`,
    // with the lemma on the last piece. That piece is not a form of the lemma.
    let segmentOpen = false;
    let afterSegmentDash = false;
    for (const m of xml.matchAll(/<word\b[^>]*>/g)) {
      const tag = m[0];
      const form = /\bform="([^"]*)"/.exec(tag)?.[1];
      const lemma = /\blemma="([^"]*)"/.exec(tag)?.[1];
      const postag = /\bpostag="([^"]*)"/.exec(tag)?.[1] ?? '';
      const continuation = afterSegmentDash;
      afterSegmentDash = segmentOpen && form === '-';
      segmentOpen = /\brelation="XSEG"/.test(tag);
      if (continuation) continue;
      if (!form || !lemma || postag.startsWith('u')) continue;
      // Treebank lemmas carry homograph indices (λέγω1, edo#2); a few start with a stray breathing mark.
      const clean = lemma.replace(/[#\d]+$/, '').replace(/^[\u0300-\u036f]+/, '').trim();
      if (!/\p{L}/u.test(clean) || !/\p{L}/u.test(form)) continue;
      yield { form, lemma: clean };
    }
  }
}

// ── Load ─────────────────────────────────────────────────────────────────────

interface Loaded {
  file: string;
  language: string;
  record: unknown;
  tokens: ServedToken[];
  /** False when the file's lemmas are mostly copies of the surface form. */
  trusted: boolean;
}

/** Above this share of lemma == surface, a file's lemmas are not real lemmatization. */
const PSEUDO_FILE_THRESHOLD = 0.6;

const skeleton = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}]/gu, '')
    .replace(/j/g, 'i')
    .replace(/v/g, 'u');

/** A lemma that says nothing the surface form does not. */
const isPseudo = (tok: ServedToken) =>
  !tok.treebankSource && !tok.lemmaSource && skeleton(tok.lemma) === skeleton(tok.surface);

function collectTokens(node: unknown, out: ServedToken[]) {
  if (Array.isArray(node)) {
    for (const item of node) collectTokens(item, out);
  } else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (typeof o.surface === 'string' && typeof o.lemma === 'string') out.push(o as never);
    else for (const value of Object.values(o)) collectTokens(value, out);
  }
}

const texts: Loaded[] = [];
/** Files whose metadata gained a `lemmaQuality` verdict this run. */
const flagged = new Set<string>();
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json')) {
  const record = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  const language: string | undefined = record?.text?.language;
  if (language !== 'grc' && language !== 'grc-koine' && language !== 'lat') continue;
  const tokens: ServedToken[] = [];
  collectTokens(record, tokens);
  // The verdict is recorded on first sight (`text.lemmaQuality`) and reused, so
  // a re-run judges the file by the lemmas it came with, not by ones this pass
  // wrote. 'source' = lemmatized by its edition; 'derived' = surface copies.
  let quality: string | undefined = record.text.lemmaQuality;
  if (quality !== 'source' && quality !== 'derived') {
    const lemmatized = tokens.filter((t) => t.lemma);
    const copies = lemmatized.filter((t) => skeleton(t.lemma) === skeleton(t.surface)).length;
    quality =
      lemmatized.length > 0 && copies / lemmatized.length <= PSEUDO_FILE_THRESHOLD
        ? 'source'
        : 'derived';
    record.text.lemmaQuality = quality;
    flagged.add(file);
  }
  const trusted = quality === 'source';
  texts.push({ file, language, record, tokens, trusted });
}

// ── Indexes ──────────────────────────────────────────────────────────────────

const greekCorpusExact: FormIndex = new Map();
const greekCorpusLoose: FormIndex = new Map();
const greekTreeExact: FormIndex = new Map();
const greekTreeLoose: FormIndex = new Map();
const latinTree: FormIndex = new Map();

for (const t of texts) {
  if (t.language === 'lat') continue;
  for (const tok of t.tokens) {
    if (!tok.lemma || tok.lemmaSource) continue; // never learn from our own fills
    if (!t.trusted && !tok.treebankSource) continue; // nor from surface copies
    add(greekCorpusExact, greekExact(tok.surface), tok.lemma);
    add(greekCorpusLoose, greekLoose(tok.surface), tok.lemma);
  }
}
for (const w of treebankWords(join(SOURCES, 'agdt'))) {
  add(greekTreeExact, greekExact(w.form), w.lemma);
  add(greekTreeLoose, greekLoose(w.form), w.lemma);
}
for (const w of treebankWords(join(SOURCES, 'ldt'))) add(latinTree, latinKey(w.form), w.lemma);

const whitakerDir = join(SOURCES, 'whitaker');
const latin = existsSync(join(whitakerDir, 'DICTLINE.GEN'))
  ? new LatinAnalyser(
      readFileSync(join(whitakerDir, 'INFLECTS.LAT'), 'latin1'),
      readFileSync(join(whitakerDir, 'DICTLINE.GEN'), 'latin1')
    )
  : null;

console.log(
  `Sources: AGDT forms ${greekTreeExact.size}, LDT forms ${latinTree.size}, WORDS ${latin ? 'loaded' : 'MISSING'}`
);

// ── Resolvers ────────────────────────────────────────────────────────────────

interface Resolution {
  lemma: string;
  source: string;
  gloss?: string;
}

/** Tidy a WORDS meaning line into a short gloss: first two senses, no editorial brackets. */
function wordsGloss(raw: string): string {
  return raw
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .split(/[;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join('; ')
    .replace(/\s+/g, ' ')
    .replace(/[,;\s]+$/, '');
}

const FREQ_RANK = 'ABCDEFXIMN';
const rank = (freq: string) => {
  const at = FREQ_RANK.indexOf(freq);
  return at < 0 ? FREQ_RANK.length : at;
};

/**
 * Forms of sum, is and the relative/interrogative pronouns. WORDS keeps these
 * in separate irregular tables this analyser does not read, so it would
 * otherwise explain `est` as edo and `ea` as eo. The treebank index resolves
 * the attested ones; any others are left alone.
 */
const LATIN_IRREGULAR =
  /^(sum|es|est|sumus|estis|sunt|esse\w*|er(am|as|at|amus|atis|ant|o|is|it|imus|itis|unt)|si(m|s|t|mus|tis|nt)|fu\w+|for\w+|is|ea|id|eius|ei|eum|eam|eo|ii|eae|eorum|earum|eis|iis|eos|eas|qu\w{1,4}|cuius|cui|me|te|se|mi|tu|ego|nos|uos|hic|haec|hoc|hu\w+|ha\w{1,2}|ho\w{1,2}|hi|his|ill\w{1,4}|ips\w{1,4}|ist\w{1,4})$/;

function resolveLatinWords(surface: string): Resolution | null {
  if (!latin) return null;
  const form = surface.replace(EDGE, '');
  if (LATIN_IRREGULAR.test(foldLatin(form))) return null;
  const entries = latin.analyse(form);
  if (entries.length === 0) return null;
  const groups = new Map<string, typeof entries>();
  for (const e of entries) {
    const id = normalizeLemma(e.headword, 'lat');
    const g = groups.get(id);
    if (g) g.push(e);
    else groups.set(id, [e]);
  }
  const ranked = [...groups.values()]
    .map((g) => g.sort((a, b) => rank(a.freq) - rank(b.freq))[0])
    .sort((a, b) => rank(a.freq) - rank(b.freq));
  const best = ranked[0];
  // One dictionary word fits, or one common word against rare ones (omnis A
  // vs omne C). Two comparably common words (rex / rego for `regis`) are a
  // real ambiguity and are not guessed.
  const clear =
    ranked.length === 1 || (rank(best.freq) <= 1 && rank(ranked[1].freq) - rank(best.freq) >= 2);
  if (!clear) return null;
  return { lemma: best.headword, source: 'whitaker-words', gloss: wordsGloss(best.gloss) };
}

type Resolver = (surface: string) => Resolution | null;

const viaIndex =
  (index: FormIndex, key: (s: string) => string, lang: string, source: string): Resolver =>
  (surface) => {
    const lemma = pickLemma(index.get(key(surface)), lang);
    return lemma ? { lemma, source } : null;
  };

const GREEK: Resolver[] = [
  viaIndex(greekCorpusExact, greekExact, 'grc', 'corpus-form-index'),
  viaIndex(greekTreeExact, greekExact, 'grc', 'agdt-form-index'),
  viaIndex(greekCorpusLoose, greekLoose, 'grc', 'corpus-form-index'),
  viaIndex(greekTreeLoose, greekLoose, 'grc', 'agdt-form-index'),
];
const LATIN: Resolver[] = [
  viaIndex(latinTree, latinKey, 'lat', 'ldt-form-index'),
  resolveLatinWords,
];

/**
 * A lone Greek consonant (`π`, `π΄`) is a numeral or an apparatus siglum. Without
 * this it matches the elided `π'` of the treebanks and becomes ἐπί.
 */
const LONE_CONSONANT = /^[βγδζθκλμνξπρσςτφχψ]$/;

function resolve(surface: string, chain: Resolver[]): Resolution | null {
  if (LONE_CONSONANT.test(surface.toLowerCase().replace(/[^\p{L}'’ʼ᾽᾿]/gu, ''))) return null;
  for (const r of chain) {
    const hit = r(surface);
    if (hit) return hit;
  }
  return null;
}

// ── Evaluate against existing lemmas ─────────────────────────────────────────

if (evaluate) {
  const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(1) : '—');
  const report = (name: string, seen: number, answered: number, correct: number) =>
    console.log(
      `  ${name.padEnd(34)} answers ${pct(answered, seen)}% of ${seen} · correct ${pct(correct, answered)}%`
    );

  // Greek treebank index, scored on properly lemmatized served texts it never saw.
  for (const [name, resolver] of [
    ['AGDT index, exact form', GREEK[1]],
    ['AGDT index, accent-blind form', GREEK[3]],
  ] as const) {
    let seen = 0;
    let answered = 0;
    let correct = 0;
    for (const t of texts) {
      if (t.language === 'lat' || !t.trusted) continue;
      for (const tok of t.tokens) {
        if (!tok.lemma || tok.treebankSource || tok.lemmaSource) continue;
        seen++;
        const hit = resolver(tok.surface);
        if (!hit) continue;
        answered++;
        if (normalizeLemma(hit.lemma, 'grc') === normalizeLemma(tok.lemma, 'grc')) correct++;
      }
    }
    report(name, seen, answered, correct);
  }

  // WORDS analyser, scored on the hand-annotated Latin treebank.
  let seen = 0;
  let answered = 0;
  let correct = 0;
  for (const w of treebankWords(join(SOURCES, 'ldt'))) {
    seen++;
    const hit = resolveLatinWords(w.form);
    if (!hit) continue;
    answered++;
    if (normalizeLemma(hit.lemma, 'lat') === normalizeLemma(w.lemma, 'lat')) correct++;
  }
  report('WORDS analyser vs Latin treebank', seen, answered, correct);
}

// ── Fill ─────────────────────────────────────────────────────────────────────

interface Stat {
  empty: number;
  pseudo: number;
  filled: Map<string, number>;
  corrected: Map<string, number>;
  respelled: number;
  glossed: number;
}
const totals = new Map<string, Stat>();
const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

for (const t of texts) {
  const chain = t.language === 'lat' ? LATIN : GREEK;
  const identityLang = t.language === 'lat' ? 'lat' : 'grc';
  let stat = totals.get(t.language);
  if (!stat) {
    stat = {
      empty: 0,
      pseudo: 0,
      filled: new Map(),
      corrected: new Map(),
      respelled: 0,
      glossed: 0,
    };
    totals.set(t.language, stat);
  }
  let changed = 0;
  for (const tok of t.tokens) {
    if (!/\p{L}/u.test(tok.surface)) continue;
    const empty = !tok.lemma;
    const pseudo = !empty && !t.trusted && isPseudo(tok);
    if (!empty && !pseudo) continue;
    if (empty) stat.empty++;
    else stat.pseudo++;

    const hit = resolve(tok.surface, chain);
    if (!hit || hit.lemma === tok.lemma) continue;

    if (empty) bump(stat.filled, hit.source);
    else if (normalizeLemma(hit.lemma, identityLang) === normalizeLemma(tok.lemma, identityLang)) {
      // Same word, better spelling (και → καί): no change of identity.
      stat.respelled++;
    } else bump(stat.corrected, hit.source);

    tok.lemma = hit.lemma;
    tok.lemmaSource = hit.source;
    if (hit.gloss && !tok.gloss) {
      tok.gloss = hit.gloss;
      tok.glossSource = hit.source;
      stat.glossed++;
    }
    changed++;
  }
  if ((changed > 0 || flagged.has(t.file)) && !dryRun) {
    writeFileSync(join(DIR, t.file), JSON.stringify(t.record), 'utf-8');
  }
  if (changed > 0)
    console.log(`${t.file}: ${changed} lemmas${t.trusted ? '' : ' (pseudo-lemma file)'}`);
}

const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);
const detail = (m: Map<string, number>) => [...m].map(([k, n]) => `${k} ${n}`).join(', ') || '—';
for (const [language, stat] of totals) {
  console.log(`${language}:`);
  console.log(`  empty   ${sum(stat.filled)} of ${stat.empty} filled — ${detail(stat.filled)}`);
  console.log(
    `  pseudo  ${sum(stat.corrected)} of ${stat.pseudo} given a real lemma — ${detail(stat.corrected)}`
  );
  console.log(`  respelled with diacritics ${stat.respelled}; glosses added ${stat.glossed}`);
}
if (dryRun) console.log('(dry run — nothing written)');
