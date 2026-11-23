/**
 * Latin form → lemma analysis from the data files of Whitaker's WORDS
 * (DICTLINE.GEN + INFLECTS.LAT; "permission is hereby freely given for any and
 * all use of program and data").
 *
 * WORDS stores every dictionary entry as up to four stems plus a part-of-speech
 * signature, and every inflection as an ending attached to one of those stems.
 * A form is analysed by trying each stem/ending split and keeping the entries
 * whose signature the ending is compatible with. This module is a small,
 * dependency-free reimplementation of that core lookup; it leaves out WORDS'
 * "tricks" (syncope, medieval spellings) and its prefix/suffix guessing, because
 * a lemma that is guessed is worse than a lemma that is missing.
 *
 * Pure functions over file contents — the caller does the I/O.
 */

export type WordsPos = 'N' | 'ADJ' | 'V' | 'ADV' | 'PREP' | 'CONJ' | 'INTERJ' | 'PRON' | 'NUM';

export interface WordsEntry {
  /** Up to four stems, positional; '' when the slot is empty or `zzz`. */
  stems: [string, string, string, string];
  pos: WordsPos;
  decl: number;
  variant: number;
  /** N: gender. ADJ/ADV: comparison. V/PRON/NUM: kind. */
  feature: string;
  /** WORDS frequency class: A (very frequent) … F (very rare), I/M/N marginal, X unknown. */
  freq: string;
  /** Plurale tantum (arma, divitiae): WORDS marks the first sense `(pl.)`. */
  pluralOnly: boolean;
  /** Dictionary headword (nominative singular / first person singular). */
  lemma: string;
}

interface Inflection {
  pos: 'N' | 'ADJ' | 'V' | 'VPAR' | 'SUPINE' | 'PRON' | 'NUM';
  decl: number;
  variant: number;
  /** Everything between the declension pair and the stem key, e.g. ['NOM','S','M']. */
  features: string[];
  key: number;
  ending: string;
  /** WORDS age: X = all periods, A/B = archaic/early, … */
  age: string;
  freq: string;
}

export interface Analysis {
  lemma: string;
  pos: WordsPos;
  entryFreq: string;
  inflFreq: string;
  /** True when the analysis only exists after stripping -que / -ne / -ve. */
  enclitic: boolean;
}

/** Matching key: lower-case, u/v and i/j folded (WORDS treats each pair as one letter). */
export function wordsKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/v/g, 'u')
    .replace(/j/g, 'i')
    .replace(/[^a-z]/g, '');
}

const DICT_POS = new Set<string>(['N', 'ADJ', 'V', 'ADV', 'PREP', 'CONJ', 'INTERJ', 'PRON', 'NUM']);
const INFL_POS = new Set<string>(['N', 'ADJ', 'V', 'VPAR', 'SUPINE', 'PRON', 'NUM']);

function stemAt(line: string, slot: number): string {
  const raw = line.slice(slot * 19, slot * 19 + 19).trim();
  return raw === 'zzz' ? '' : raw;
}

function parseInflections(text: string): Inflection[] {
  const out: Inflection[] = [];
  for (const rawLine of text.split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/--.*$/, '').trim();
    if (!line) continue;
    const t = line.split(/\s+/);
    if (!INFL_POS.has(t[0]) || t.length < 6) continue;
    const body = t.slice(1, -2); // drop pos, age, freq
    const hasEnding = /^[a-z]+$/.test(body[body.length - 1]);
    const ending = hasEnding ? body[body.length - 1] : '';
    const keyIdx = body.length - (hasEnding ? 3 : 2);
    const key = Number(body[keyIdx]);
    const decl = Number(body[0]);
    const variant = Number(body[1]);
    if (!Number.isInteger(key) || !Number.isInteger(decl) || !Number.isInteger(variant)) continue;
    out.push({
      pos: t[0] as Inflection['pos'],
      decl,
      variant,
      features: body.slice(2, keyIdx),
      key,
      ending,
      age: t[t.length - 2],
      freq: t[t.length - 1],
    });
  }
  return out;
}

function declMatches(infl: Inflection, entry: { decl: number; variant: number }): boolean {
  if (infl.decl === 0) return true;
  return infl.decl === entry.decl && (infl.variant === 0 || infl.variant === entry.variant);
}

function genderMatches(inflGender: string, entryGender: string): boolean {
  if (inflGender === 'X' || entryGender === 'X' || inflGender === entryGender) return true;
  if (inflGender === 'C') return entryGender === 'M' || entryGender === 'F';
  if (entryGender === 'C') return inflGender === 'M' || inflGender === 'F';
  return false;
}

/** Is `infl` a possible inflection of `entry` (ignoring which stem it attaches to)? */
function compatible(infl: Inflection, entry: Omit<WordsEntry, 'lemma'>): boolean {
  switch (entry.pos) {
    case 'N':
      return infl.pos === 'N' && declMatches(infl, entry) && genderMatches(infl.features[2], entry.feature);
    case 'ADJ': {
      if (infl.pos !== 'ADJ' || !declMatches(infl, entry)) return false;
      const cmp = infl.features[3];
      return entry.feature === 'X' || cmp === 'X' || cmp === entry.feature;
    }
    case 'V':
      return (infl.pos === 'V' || infl.pos === 'VPAR' || infl.pos === 'SUPINE') && declMatches(infl, entry);
    case 'PRON':
      return infl.pos === 'PRON' && declMatches(infl, entry);
    case 'NUM':
      return infl.pos === 'NUM' && declMatches(infl, entry);
    default:
      return false;
  }
}

const FREQ_ORDER = 'ABCDEFIMN';
/** Lower is more frequent; unknown (X) sits mid-table. */
export function freqRank(freq: string): number {
  const i = FREQ_ORDER.indexOf(freq);
  return i === -1 ? 2 : i;
}

function pickHeadwordInflection(
  inflections: Inflection[],
  entry: Omit<WordsEntry, 'lemma'>,
  wanted: (infl: Inflection) => boolean
): Inflection | undefined {
  let best: Inflection | undefined;
  let bestScore = Infinity;
  for (const infl of inflections) {
    if (!wanted(infl) || !compatible(infl, entry) || !entry.stems[infl.key - 1]) continue;
    // The commonest ending of the classical period; on a tie the entry's own
    // variant beats the wildcard (ipse, not Old Latin ipsus).
    const score = 2 * freqRank(infl.freq) + (infl.age === 'X' ? 0 : 10) + (infl.variant === entry.variant ? 0 : 1);
    if (score < bestScore) ((best = infl), (bestScore = score));
  }
  return best;
}

function headword(inflections: Inflection[], entry: Omit<WordsEntry, 'lemma'>): string {
  const [s1, s2, s3] = entry.stems;
  const first = s1 || s2 || s3;
  const has = (infl: Inflection, ...want: string[]) => want.every((w, i) => infl.features[i] === w);
  let infl: Inflection | undefined;
  switch (entry.pos) {
    case 'N':
      infl = pickHeadwordInflection(
        inflections,
        entry,
        (i) => i.pos === 'N' && has(i, 'NOM', entry.pluralOnly ? 'P' : 'S') && (entry.pluralOnly || i.key === 1)
      );
      break;
    case 'ADJ': {
      // Positive first; adjectives with no positive (ulterior, ultimus) fall back
      // to the comparative, then the superlative.
      const degrees = entry.feature === 'COMP' || entry.feature === 'SUPER' ? [entry.feature] : ['POS', 'COMP', 'SUPER'];
      for (const cmp of degrees) {
        infl = pickHeadwordInflection(
          inflections,
          entry,
          (i) => i.pos === 'ADJ' && has(i, 'NOM', 'S') && 'MCX'.includes(i.features[2]) && i.features[3] === cmp
        );
        if (infl) break;
      }
      break;
    }
    case 'V': {
      // Perfect-definite verbs (odi, memini, coepi) have no present stem.
      if (!s1 && !s2 && s3) return `${s3}i`;
      const voice = entry.feature === 'DEP' ? 'PASSIVE' : 'ACTIVE';
      const person = entry.feature === 'IMPERS' ? '3' : '1';
      infl = pickHeadwordInflection(
        inflections,
        entry,
        (i) => i.pos === 'V' && has(i, 'PRES', voice, 'IND', person, 'S') && i.key <= 2
      );
      break;
    }
    case 'PRON':
      infl = pickHeadwordInflection(
        inflections,
        entry,
        (i) => i.pos === 'PRON' && has(i, 'NOM', 'S') && 'MCX'.includes(i.features[2])
      );
      break;
    case 'NUM':
      // duo and tres have no singular.
      for (const number of ['S', 'P']) {
        infl = pickHeadwordInflection(
          inflections,
          entry,
          (i) => i.pos === 'NUM' && has(i, 'NOM', number) && 'MCX'.includes(i.features[2]) && i.key === 1
        );
        if (infl) break;
      }
      break;
    default:
      return first;
  }
  return infl ? entry.stems[infl.key - 1] + infl.ending : '';
}

export interface Whitaker {
  entryCount: number;
  /** Every dictionary analysis of `form`; empty when WORDS does not know it. */
  analyze(form: string): Analysis[];
}

const ENCLITICS = ['que', 'ne', 'ue'];

export function buildWhitaker(dictline: string, inflects: string): Whitaker {
  const inflections = parseInflections(inflects);
  const byEnding = new Map<string, Inflection[]>();
  let maxEnding = 0;
  for (const infl of inflections) {
    const k = wordsKey(infl.ending);
    maxEnding = Math.max(maxEnding, k.length);
    const list = byEnding.get(k);
    if (list) list.push(infl);
    else byEnding.set(k, [infl]);
  }

  /** stem key → entries having that stem, with the 1-based slot it sits in. */
  const byStem = new Map<string, Array<{ entry: WordsEntry; slot: number }>>();
  /** Indeclinables: the form is the stem. */
  const byWord = new Map<string, WordsEntry[]>();
  let entryCount = 0;

  for (const line of dictline.split(/\r\n|\r|\n/)) {
    if (line.length < 100) continue;
    const part = line.slice(76, 100).trim().split(/\s+/);
    if (!DICT_POS.has(part[0])) continue;
    const pos = part[0] as WordsPos;
    const stems: WordsEntry['stems'] = [stemAt(line, 0), stemAt(line, 1), stemAt(line, 2), stemAt(line, 3)];
    const declined = pos === 'N' || pos === 'ADJ' || pos === 'V' || pos === 'PRON' || pos === 'NUM';
    const base = {
      stems,
      pos,
      decl: declined ? Number(part[1]) : 0,
      variant: declined ? Number(part[2]) : 0,
      feature: (declined ? part[3] : part[1]) ?? 'X',
      freq: line.slice(100, 110).trim().split(/\s+/)[3] ?? 'X',
      pluralOnly: pos === 'N' && /\(pl\.\)/.test(line.slice(110).split(';')[0]),
    };
    const lemma = headword(inflections, base);
    if (!lemma) continue;
    const entry: WordsEntry = { ...base, lemma };
    entryCount++;
    if (declined) {
      stems.forEach((stem, i) => {
        if (!stem) return;
        const k = wordsKey(stem);
        const list = byStem.get(k);
        if (list) list.push({ entry, slot: i + 1 });
        else byStem.set(k, [{ entry, slot: i + 1 }]);
      });
    } else {
      // ADV carries positive / comparative / superlative in slots 1–3.
      for (const stem of stems) {
        if (!stem) continue;
        const k = wordsKey(stem);
        const list = byWord.get(k);
        if (list) list.push(entry);
        else byWord.set(k, [entry]);
      }
    }
  }

  function analyzeKey(key: string, enclitic: boolean): Analysis[] {
    const found = new Map<string, Analysis>();
    const add = (entry: WordsEntry, inflFreq: string) => {
      const id = `${entry.pos}|${entry.lemma}`;
      const prev = found.get(id);
      if (
        !prev ||
        freqRank(entry.freq) < freqRank(prev.entryFreq) ||
        (entry.freq === prev.entryFreq && freqRank(inflFreq) < freqRank(prev.inflFreq))
      ) {
        found.set(id, { lemma: entry.lemma, pos: entry.pos, entryFreq: entry.freq, inflFreq, enclitic });
      }
    };
    for (const entry of byWord.get(key) ?? []) add(entry, 'A');
    for (let n = 0; n <= Math.min(maxEnding, key.length - 1); n++) {
      const candidates = byEnding.get(key.slice(key.length - n));
      if (!candidates) continue;
      const stems = byStem.get(key.slice(0, key.length - n));
      if (!stems) continue;
      for (const { entry, slot } of stems) {
        for (const infl of candidates) {
          if (infl.key === slot && compatible(infl, entry)) add(entry, infl.freq);
        }
      }
    }
    return [...found.values()];
  }

  return {
    entryCount,
    analyze(form: string): Analysis[] {
      const key = wordsKey(form);
      if (!key) return [];
      const direct = analyzeKey(key, false);
      if (direct.length) return direct;
      for (const enc of ENCLITICS) {
        if (key.length > enc.length + 1 && key.endsWith(enc)) {
          const stripped = analyzeKey(key.slice(0, -enc.length), true);
          if (stripped.length) return stripped;
        }
      }
      return [];
    },
  };
}

/**
 * Choose one lemma from WORDS' analyses, or none when the form is genuinely
 * ambiguous. `prior` is an optional lemma-frequency table (treebank counts,
 * keyed by {@link wordsKey}) used to break ties the dictionary cannot.
 *
 *  1. one distinct lemma                        → take it
 *  2. one lemma dominates the prior (≥ 3×)      → take it
 *  3. no prior evidence either way, and one
 *     lemma is strictly commoner in WORDS' own
 *     frequency classes (word + ending)         → take it
 *  4. otherwise                                 → undefined
 */
export function chooseLemma(analyses: Analysis[], prior?: Map<string, number>): string | undefined {
  const best = new Map<string, { lemma: string; rank: number; count: number }>();
  for (const a of analyses) {
    const k = wordsKey(a.lemma);
    // A rare ending counts against an analysis twice as much as a rare word:
    // hostium is hostis, not the archaic genitive of hostia.
    const rank = freqRank(a.entryFreq) + 2 * freqRank(a.inflFreq);
    const prev = best.get(k);
    if (!prev || rank < prev.rank) best.set(k, { lemma: a.lemma, rank, count: prior?.get(k) ?? 0 });
  }
  const options = [...best.values()];
  if (options.length === 0) return undefined;
  if (options.length === 1) return options[0].lemma;

  const byCount = [...options].sort((a, b) => b.count - a.count);
  if (byCount[0].count > 0 && byCount[0].count >= 3 * byCount[1].count) return byCount[0].lemma;

  const byRank = [...options].sort((a, b) => a.rank - b.rank);
  if (byRank[0].rank < byRank[1].rank && byCount[0].count === byCount[1].count) return byRank[0].lemma;
  return undefined;
}
