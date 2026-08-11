/**
 * Phase-3 morphology backfill from the Ancient Greek Dependency Treebank
 * (Perseus AGDT v2.1, CC BY-SA 3.0 — https://github.com/PerseusDL/treebank_data).
 *
 * Aligns each served Greek text against its AGDT annotation by walking both
 * token streams in order (surfaces compared accentless/case-folded, with a
 * bounded resync window for edition differences), and fills `morphology`
 * (decoded from the 9-slot AGDT postag), `lemma` (when empty), and a
 * token-level `treebankSource: 'AGDT'` provenance marker. Existing non-empty
 * annotations are never overwritten; unmatched tokens are left untouched.
 *
 * Herodotus and Thucydides are only covered by AGDT for Book 1 — the aligner
 * simply stops when the treebank stream is exhausted.
 *
 * Usage: npx tsx scripts/corpus/apply-agdt-morphology.ts [--dry-run]
 */
import { readFileSync, writeFileSync } from 'fs';

const DIR = 'public/corpus-data';
const dryRun = process.argv.includes('--dry-run');

interface TextConfig {
  dir: string;
  files: string[];
  /** Token-level provenance stamp. AGDT = Greek treebank, LDT = Latin treebank. */
  source: 'AGDT' | 'LDT';
  /** Stable-sort words by cite URN first — ONLY for files shipped in annotator-batch order (Homer). */
  sort?: boolean;
  /** The treebank is a mid-work excerpt: segment by book and locate each segment before aligning. */
  anchored?: boolean;
}

const AGDT_DIR = 'scripts/corpus/ingest/.sources/agdt';
const LDT_DIR = 'scripts/corpus/ingest/.sources/ldt';

const TEXTS: Record<string, TextConfig> = {
  'grc-homer-iliad-full': { dir: AGDT_DIR, files: ['tlg0012.tlg001.perseus-grc1.tb.xml'], source: 'AGDT', sort: true },
  'grc-homer-odyssey-full': { dir: AGDT_DIR, files: ['tlg0012.tlg002.perseus-grc1.tb.xml'], source: 'AGDT', sort: true },
  'grc-sophocles-antigone-full': { dir: AGDT_DIR, files: ['tlg0011.tlg002.perseus-grc2.tb.xml'], source: 'AGDT' },
  'grc-herodotus-histories-full': { dir: AGDT_DIR, files: ['tlg0016.tlg001.perseus-grc1.1.tb.xml'], source: 'AGDT' },
  'grc-thucydides-history-full': { dir: AGDT_DIR, files: ['tlg0003.tlg001.perseus-grc1.1.tb.xml'], source: 'AGDT' },
  'lat-cicero-in-catilinam-full': { dir: LDT_DIR, files: ['phi0474.phi013.perseus-lat1.tb.xml'], source: 'LDT' },
  'lat-sallust-catilinae-full': { dir: LDT_DIR, files: ['phi0631.phi001.perseus-lat1.tb.xml'], source: 'LDT' },
  'lat-vergil-aeneid-full': { dir: LDT_DIR, files: ['phi0690.phi003.perseus-lat1.tb.xml'], source: 'LDT', anchored: true },
  'lat-ovid-metamorphoses-full': { dir: LDT_DIR, files: ['phi0959.phi006.perseus-lat1.tb.xml'], source: 'LDT', anchored: true },
  // NOTE: phi1351.phi005 looked like Tacitus Annales but its text is the
  // HISTORIES ("Initium mihi operis Servius Galba iterum…" = Hist. 1.1);
  // LDT v2.1 has no Annales treebank, so lat-tacitus-annals-full stays
  // treebank-less until another licensed source covers it.
};

// ── Postag decoding (AGDT 1.1, 9 positional slots) ──────────────────────────

const POS: Record<string, string> = {
  n: 'noun', v: 'verb', a: 'adj', d: 'adv', l: 'det', g: 'ptcl',
  c: 'conj', r: 'prep', p: 'pron', m: 'num', i: 'intj', e: 'intj',
};
const PERSON: Record<string, string> = { 1: 'first', 2: 'second', 3: 'third' };
const NUMBER: Record<string, string> = { s: 'singular', p: 'plural', d: 'dual' };
const TENSE: Record<string, string> = {
  p: 'present', i: 'imperfect', r: 'perfect', l: 'pluperfect',
  t: 'future perfect', f: 'future', a: 'aorist',
};
const MOOD: Record<string, string> = {
  i: 'indicative', s: 'subjunctive', o: 'optative', n: 'infinitive',
  m: 'imperative', p: 'participle',
};
const VOICE: Record<string, string> = { a: 'active', p: 'passive', m: 'middle', e: 'middle-passive', d: 'deponent' };
const GENDER: Record<string, string> = { m: 'masculine', f: 'feminine', n: 'neuter' };
const CASE: Record<string, string> = {
  n: 'nominative', g: 'genitive', d: 'dative', a: 'accusative', v: 'vocative', l: 'locative',
};
const DEGREE: Record<string, string> = { c: 'comparative', s: 'superlative' };

interface Morphology {
  partOfSpeech: string;
  person?: string;
  number?: string;
  tense?: string;
  mood?: string;
  voice?: string;
  gender?: string;
  case?: string;
  degree?: string;
}

function decodePostag(postag: string): Morphology | undefined {
  const pos = POS[postag[0]];
  if (!pos) return undefined;
  const m: Morphology = { partOfSpeech: pos };
  const set = (field: keyof Morphology, table: Record<string, string>, ch?: string) => {
    if (ch && table[ch]) (m as unknown as Record<string, string>)[field] = table[ch];
  };
  set('person', PERSON, postag[1]);
  set('number', NUMBER, postag[2]);
  set('tense', TENSE, postag[3]);
  set('mood', MOOD, postag[4]);
  set('voice', VOICE, postag[5]);
  set('gender', GENDER, postag[6]);
  set('case', CASE, postag[7]);
  set('degree', DEGREE, postag[8]);
  return m;
}

// ── AGDT parsing ─────────────────────────────────────────────────────────────

interface TbWord {
  form: string;
  lemma: string;
  morph: Morphology;
  /** Numeric citation vector (e.g. "2.35" → [2, 35]) for document-order sorting. */
  cite: number[];
}

/**
 * Some AGDT files (notably the Iliad and Odyssey, annotated in batches over
 * years) are NOT in document order — books appear in annotator-batch order.
 * Every word carries a `cite` URN, so parse it and stable-sort by its numeric
 * parts; words without a cite inherit the previous word's (carry-forward).
 */
function parseCite(tag: string): number[] | undefined {
  const ref = /\bcite="[^"]*:([0-9][0-9.]*)"/.exec(tag)?.[1];
  if (!ref) return undefined;
  return ref.split('.').map(Number);
}

function compareCite(a: number[], b: number[]): number {
  for (let k = 0; k < Math.max(a.length, b.length); k++) {
    const d = (a[k] ?? 0) - (b[k] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function parseAgdt(dir: string, paths: string[]): TbWord[] {
  const words: TbWord[] = [];
  const attr = (tag: string, name: string) =>
    new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? '';
  for (const p of paths) {
    const xml = readFileSync(`${dir}/${p}`, 'utf-8');
    let lastCite: number[] = [0];
    // Walk sentences and words in file order: LDT word tags carry no cite, but
    // their parent <sentence> has a subdoc ("6.1", "1.1-1.2") we can inherit.
    for (const tag of xml.match(/<sentence [^>]*>|<word [^>]*\/>/g) ?? []) {
      if (tag.startsWith('<sentence')) {
        const subdoc = attr(tag, 'subdoc');
        const m = /([0-9]+(?:\.[0-9]+)*)/.exec(subdoc);
        if (m) lastCite = m[1].split('.').map(Number);
        continue;
      }
      if (tag.includes('artificial=') || tag.includes('insertion_id=')) continue;
      const cite = parseCite(tag) ?? lastCite;
      lastCite = cite;
      const form = attr(tag, 'form');
      const postag = attr(tag, 'postag');
      if (!form || !postag || postag[0] === 'u') continue; // punctuation-words
      const morph = decodePostag(postag);
      if (!morph) continue;
      // LDT lemmas carry homograph-disambiguation digits (omnis1, homo1).
      const lemma = attr(tag, 'lemma').replace(/\d+$/, '');
      words.push({ form, lemma, morph, cite });
    }
  }
  return words;
}

/** Stable sort restoring document order while preserving intra-line word order. */
function sortByCite(words: TbWord[]): TbWord[] {
  return words
    .map((w, idx) => ({ w, idx }))
    .sort((a, b) => compareCite(a.w.cite, b.w.cite) || a.idx - b.idx)
    .map(({ w }) => w);
}

// ── Alignment ────────────────────────────────────────────────────────────────

function cmpKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯͅ]/g, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    // Latin editions split on u/v and i/j orthography (uultus vs vultus).
    .replace(/v/g, 'u')
    .replace(/j/g, 'i')
    .replace(/[^\p{L}]/gu, '');
}

interface ServedToken {
  surface: string;
  lemma: string;
  morphology: { partOfSpeech?: string } & Record<string, unknown>;
  treebankSource?: string;
}
interface ServedRecord {
  text: { id: string; language: string };
  sections: { sentences: { tokens: ServedToken[] }[] }[];
}

const RESYNC_WINDOW = 12;

function align(
  ours: ServedToken[],
  theirs: TbWord[],
  source: 'AGDT' | 'LDT'
): { matched: number; annotated: number } {
  let i = 0;
  let j = 0;
  let matched = 0;
  let annotated = 0;
  while (i < ours.length && j < theirs.length) {
    if (cmpKey(ours[i].surface) === cmpKey(theirs[j].form)) {
      matched++;
      const t = ours[i];
      const w = theirs[j];
      if (!t.morphology?.partOfSpeech || t.morphology.partOfSpeech === 'unknown') {
        t.morphology = { ...w.morph };
        t.treebankSource = source;
        if (!t.lemma || t.lemma.trim() === '') t.lemma = w.lemma;
        annotated++;
      }
      i++;
      j++;
      continue;
    }
    // Resync: find the nearest (i+di, j+dj) pair that matches again.
    let found = false;
    outer: for (let radius = 1; radius <= RESYNC_WINDOW; radius++) {
      for (let di = 0; di <= radius; di++) {
        const dj = radius - di;
        if (i + di < ours.length && j + dj < theirs.length &&
            cmpKey(ours[i + di].surface) === cmpKey(theirs[j + dj].form)) {
          i += di;
          j += dj;
          found = true;
          break outer;
        }
      }
    }
    if (!found) {
      i++;
      j++;
    }
  }
  return { matched, annotated };
}

// ── Anchoring ────────────────────────────────────────────────────────────────
// Several LDT files are mid-work excerpts (the Aeneid treebank covers Book 6),
// so each contiguous treebank segment must first be LOCATED in our token
// stream: slide a 12-form probe over our tokens and take the best-scoring
// offset. Segments are cut where the book number (cite[0]) changes.

const PROBE = 12;
const MIN_PROBE_HITS = 9;
const BAG_WINDOW = 18;

function findAnchor(ourKeys: string[], theirs: TbWord[]): number {
  const probe = theirs.slice(0, Math.min(PROBE, theirs.length)).map((w) => cmpKey(w.form));
  const need = Math.min(MIN_PROBE_HITS, probe.length);
  // Fast pass: exact positional match.
  let best = -1;
  let bestScore = 0;
  for (let o = 0; o + probe.length <= ourKeys.length; o++) {
    let score = 0;
    for (let k = 0; k < probe.length; k++) if (ourKeys[o + k] === probe[k]) score++;
    if (score > bestScore) {
      bestScore = score;
      best = o;
      if (score === probe.length) return best;
    }
  }
  if (bestScore >= need) return best;
  // Insertion-tolerant pass: count probe forms present anywhere in a small window.
  const probeSet = new Set(probe);
  best = -1;
  bestScore = 0;
  for (let o = 0; o + BAG_WINDOW <= ourKeys.length; o++) {
    let score = 0;
    const seen = new Set<string>();
    for (let k = 0; k < BAG_WINDOW; k++) {
      const key = ourKeys[o + k];
      if (probeSet.has(key) && !seen.has(key)) {
        seen.add(key);
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = o;
    }
  }
  return bestScore >= need ? best : -1;
}

/**
 * Cut segments where the treebank's coverage is discontinuous: a change of
 * book (cite[0]) or a jump in line/chapter (cite[1]) larger than the aligner's
 * resync window — excerpt treebanks like Ovid's cover scattered selections
 * (1.1–1.2, then 1.163–…) that must each be anchored separately.
 */
const MAX_LINE_JUMP = 8;

function segmentByBook(words: TbWord[]): TbWord[][] {
  if (words.length === 0 || (words[0].cite.length < 2 && words.every((w) => w.cite.length < 2))) {
    return [words];
  }
  const segments: TbWord[][] = [];
  let current: TbWord[] = [];
  let prev: number[] | undefined;
  for (const w of words) {
    const discontinuous =
      prev !== undefined &&
      (w.cite[0] !== prev[0] ||
        (w.cite.length > 1 && prev.length > 1 && Math.abs((w.cite[1] ?? 0) - (prev[1] ?? 0)) > MAX_LINE_JUMP));
    if (discontinuous && current.length > 0) {
      segments.push(current);
      current = [];
    }
    prev = w.cite;
    current.push(w);
  }
  if (current.length > 0) segments.push(current);
  // Merge fragments too small to anchor reliably into their predecessor.
  const merged: TbWord[][] = [];
  for (const seg of segments) {
    if (merged.length > 0 && seg.length < 40) merged[merged.length - 1].push(...seg);
    else merged.push(seg);
  }
  return merged;
}

// ── Main ─────────────────────────────────────────────────────────────────────

for (const [textId, cfg] of Object.entries(TEXTS)) {
  const path = `${DIR}/${textId}.json`;
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  const flat: ServedToken[] = [];
  for (const sec of record.sections) for (const sn of sec.sentences) flat.push(...sn.tokens);
  let tb = parseAgdt(cfg.dir, cfg.files);
  if (cfg.sort) tb = sortByCite(tb);
  let matched = 0;
  let annotated = 0;
  let unanchored = 0;
  if (cfg.anchored) {
    const ourKeys = flat.map((t) => cmpKey(t.surface));
    for (const segment of segmentByBook(tb)) {
      const anchor = findAnchor(ourKeys, segment);
      if (anchor < 0) {
        unanchored += segment.length;
        continue;
      }
      const r = align(flat.slice(anchor), segment, cfg.source);
      matched += r.matched;
      annotated += r.annotated;
    }
  } else {
    const r = align(flat, tb, cfg.source);
    matched = r.matched;
    annotated = r.annotated;
  }
  const pct = ((matched / Math.min(flat.length, tb.length)) * 100).toFixed(1);
  console.log(
    `${textId}: ${tb.length} treebank words vs ${flat.length} tokens → matched ${matched} (${pct}% of overlap), annotated ${annotated}` +
      (unanchored ? `, ${unanchored} words in unanchored segments` : '')
  );
  if (annotated > 0 && !dryRun) writeFileSync(path, JSON.stringify(record), 'utf-8');
}
console.log(dryRun ? '\n(dry run — nothing written)' : '\nDone. Now run clean-served-corpus.ts to recompute flags + index.');
