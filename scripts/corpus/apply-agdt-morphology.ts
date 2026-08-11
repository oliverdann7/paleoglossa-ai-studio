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

const AGDT_DIR = 'scripts/corpus/ingest/.sources/agdt';
const DIR = 'public/corpus-data';
const dryRun = process.argv.includes('--dry-run');

const TEXTS: Record<string, string[]> = {
  'grc-homer-iliad-full': ['tlg0012.tlg001.perseus-grc1.tb.xml'],
  'grc-homer-odyssey-full': ['tlg0012.tlg002.perseus-grc1.tb.xml'],
  'grc-sophocles-antigone-full': ['tlg0011.tlg002.perseus-grc2.tb.xml'],
  'grc-herodotus-histories-full': ['tlg0016.tlg001.perseus-grc1.1.tb.xml'],
  'grc-thucydides-history-full': ['tlg0003.tlg001.perseus-grc1.1.tb.xml'],
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
const VOICE: Record<string, string> = { a: 'active', p: 'passive', m: 'middle', e: 'middle-passive' };
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
    if (ch && table[ch]) (m as Record<string, string>)[field] = table[ch];
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

function parseAgdt(paths: string[]): TbWord[] {
  const words: TbWord[] = [];
  const attr = (tag: string, name: string) =>
    new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? '';
  for (const p of paths) {
    const xml = readFileSync(`${AGDT_DIR}/${p}`, 'utf-8');
    let lastCite: number[] = [0];
    for (const tag of xml.match(/<word [^>]*\/>/g) ?? []) {
      if (tag.includes('artificial=') || tag.includes('insertion_id=')) continue;
      const cite = parseCite(tag) ?? lastCite;
      lastCite = cite;
      const form = attr(tag, 'form');
      const postag = attr(tag, 'postag');
      if (!form || !postag || postag[0] === 'u') continue; // punctuation-words
      const morph = decodePostag(postag);
      if (!morph) continue;
      words.push({ form, lemma: attr(tag, 'lemma'), morph, cite });
    }
  }
  // Stable sort restores document order while preserving intra-line word order.
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

function align(ours: ServedToken[], theirs: TbWord[]): { matched: number; annotated: number } {
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
        t.treebankSource = 'AGDT';
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

// ── Main ─────────────────────────────────────────────────────────────────────

for (const [textId, files] of Object.entries(TEXTS)) {
  const path = `${DIR}/${textId}.json`;
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  const flat: ServedToken[] = [];
  for (const sec of record.sections) for (const sn of sec.sentences) flat.push(...sn.tokens);
  const tb = parseAgdt(files);
  const { matched, annotated } = align(flat, tb);
  const pct = ((matched / Math.min(flat.length, tb.length)) * 100).toFixed(1);
  console.log(
    `${textId}: ${tb.length} treebank words vs ${flat.length} tokens → matched ${matched} (${pct}% of overlap), annotated ${annotated}`
  );
  if (annotated > 0 && !dryRun) writeFileSync(path, JSON.stringify(record), 'utf-8');
}
console.log(dryRun ? '\n(dry run — nothing written)' : '\nDone. Now run clean-served-corpus.ts to recompute flags + index.');
