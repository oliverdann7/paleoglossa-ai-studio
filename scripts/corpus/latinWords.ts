/**
 * Minimal Latin form analyser over Whitaker's WORDS data files.
 *
 * WORDS (William Whitaker, 1936–2010) ships a stem dictionary (DICTLINE.GEN)
 * and an inflection table (INFLECTS.LAT); its licence grants "any and all use
 * of program and data … for whatever purpose". This module re-implements only
 * the core lookup — strip an ending, find the stem, check that declension or
 * conjugation agree — and returns the dictionary headwords a form can belong
 * to. It deliberately does not attempt WORDS' tricks (syncope, prefixes,
 * suffixes): an unanalysed form is left alone rather than guessed.
 *
 * Offline tooling only; never imported by the app.
 */

export interface LatinEntry {
  headword: string;
  pos: string;
  gloss: string;
  /** WORDS frequency class: A (very frequent) … F (very rare), I/M/N specialised, X unknown. */
  freq: string;
}

interface Rule {
  pos: string; // dictionary part of speech the rule applies to
  decl: number;
  variant: number;
  key: number; // which of the entry's four stems
  ending: string;
  /** Gender of a nominal rule (M/F/N/C/X); used only to build headwords. */
  gender?: string;
}

interface DictEntry extends LatinEntry {
  decl: number;
  variant: number;
  gender: string;
}

/** u/v and i/j are one letter each for matching purposes. */
export function foldLatin(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/j/g, 'i')
    .replace(/v/g, 'u');
}

/** Index of the stem-key field in an INFLECTS line (`… key size [ending] age freq`), per part of speech. */
const RULE_LAYOUT: Record<string, { fields: number; dictPos: string; hasDecl: boolean }> = {
  N: { fields: 6, dictPos: 'N', hasDecl: true },
  ADJ: { fields: 7, dictPos: 'ADJ', hasDecl: true },
  V: { fields: 8, dictPos: 'V', hasDecl: true },
  VPAR: { fields: 9, dictPos: 'V', hasDecl: true },
  SUPINE: { fields: 6, dictPos: 'V', hasDecl: true },
  ADV: { fields: 2, dictPos: 'ADV', hasDecl: false },
};

const CITATION: Record<string, RegExp> = {
  N: /^N\s+\d \d NOM S /,
  ADJ: /^ADJ\s+\d \d NOM S [MXC] POS /,
  V: /^V\s+\d \d PRES\s+ACTIVE\s+IND\s+1 S /,
  DEP: /^V\s+\d \d PRES\s+PASSIVE\s+IND\s+1 S /,
};

export class LatinAnalyser {
  private rules: Rule[] = [];
  private byEnding = new Map<string, Rule[]>();
  /** stems[key - 1]: folded stem → entries */
  private stems: Array<Map<string, DictEntry[]>> = [new Map(), new Map(), new Map(), new Map()];
  private uninflected = new Map<string, DictEntry[]>();
  private maxEnding = 0;

  constructor(inflects: string, dictline: string) {
    const citation: Record<string, Rule[]> = { N: [], ADJ: [], V: [], DEP: [] };

    for (const raw of inflects.split('\n')) {
      const line = raw.split('--')[0].trimEnd();
      const parts = line.trim().split(/\s+/);
      const layout = RULE_LAYOUT[parts[0]];
      if (!layout) continue;
      const key = Number(parts[layout.fields]);
      const size = Number(parts[layout.fields + 1]);
      if (!Number.isInteger(key) || !Number.isInteger(size)) continue;
      const ending = size > 0 ? foldLatin(parts[layout.fields + 2] ?? '') : '';
      if (ending.length !== size) continue;
      const rule: Rule = {
        pos: layout.dictPos,
        decl: layout.hasDecl ? Number(parts[1]) : 0,
        variant: layout.hasDecl ? Number(parts[2]) : 0,
        key,
        ending,
        gender: parts[0] === 'N' ? parts[5] : undefined,
      };
      this.rules.push(rule);
      const bucket = this.byEnding.get(ending);
      if (bucket) bucket.push(rule);
      else this.byEnding.set(ending, [rule]);
      this.maxEnding = Math.max(this.maxEnding, size);
      for (const [kind, pattern] of Object.entries(CITATION)) {
        if (pattern.test(line) && key === 1) citation[kind].push(rule);
      }
    }

    // A neuter noun takes the neuter nominative (imperi-um, not imperi-us).
    const genderFits = (rule: Rule, gender: string) =>
      !rule.gender ||
      rule.gender === gender ||
      rule.gender === 'X' ||
      (rule.gender === 'C' && gender !== 'N');
    const citationEnding = (
      kind: string,
      decl: number,
      variant: number,
      gender: string
    ): string | null => {
      const pool = citation[kind].filter((r) => r.decl === decl && genderFits(r, gender));
      const rule =
        pool.find((r) => r.variant === variant && r.gender === gender) ??
        pool.find((r) => r.variant === variant) ??
        pool.find((r) => r.variant === 0);
      return rule ? rule.ending : null;
    };

    for (const line of dictline.split('\n')) {
      if (line.length < 80) continue;
      const stemFields = [0, 19, 38, 57].map((at) => line.slice(at, at + 19).trim());
      const rest = line.slice(76).trim().split(/\s+/);
      const pos = rest[0];
      let decl = 0;
      let variant = 0;
      let flagsAt = 1;
      let kind = '';
      let gender = '';
      if (pos === 'N') {
        decl = Number(rest[1]);
        variant = Number(rest[2]);
        gender = rest[3];
        flagsAt = 5;
      } else if (pos === 'ADJ' || pos === 'V') {
        decl = Number(rest[1]);
        variant = Number(rest[2]);
        kind = rest[3];
        flagsAt = 4;
      } else if (pos === 'ADV' || pos === 'PREP') {
        flagsAt = 2;
      } else if (pos !== 'CONJ' && pos !== 'INTERJ') {
        continue; // PRON, NUM, PACK: closed classes, covered by the treebank index
      }
      const freq = rest[flagsAt + 3] ?? 'X';
      const gloss = rest.slice(flagsAt + 5).join(' ');
      const stem1 = stemFields[0];
      if (!stem1 || stem1 === 'zzz') continue;

      let headword = stem1;
      if (pos === 'N' || pos === 'ADJ' || pos === 'V') {
        const citeKind = pos === 'V' && kind === 'DEP' ? 'DEP' : pos;
        const ending = citationEnding(citeKind, decl, variant, gender);
        if (ending === null) {
          if (pos === 'V') headword = stem1 + 'o';
        } else {
          // Citation endings are stored folded; headwords keep WORDS' own v/i spelling.
          headword = stem1 + ending;
        }
      }

      const entry: DictEntry = { headword, pos, gloss, freq, decl, variant, gender };
      if (pos === 'PREP' || pos === 'CONJ' || pos === 'INTERJ') {
        push(this.uninflected, foldLatin(stem1), entry);
        continue;
      }
      stemFields.forEach((stem, i) => {
        if (stem && stem !== 'zzz') push(this.stems[i], foldLatin(stem), entry);
      });
    }
  }

  /** Every dictionary entry the form can be an inflection of. */
  analyse(form: string): LatinEntry[] {
    const word = foldLatin(form);
    if (!word) return [];
    const found = this.lookup(word);
    if (found.length > 0) return found;
    for (const enclitic of ['que', 'ne', 'ue']) {
      if (word.length > enclitic.length + 1 && word.endsWith(enclitic)) {
        const base = this.lookup(word.slice(0, -enclitic.length));
        if (base.length > 0) return base;
      }
    }
    return [];
  }

  private lookup(word: string): LatinEntry[] {
    const out = new Map<string, DictEntry>();
    for (const e of this.uninflected.get(word) ?? []) out.set(`${e.pos}:${e.headword}`, e);
    const longest = Math.min(this.maxEnding, word.length - 1);
    for (let size = 0; size <= longest; size++) {
      const ending = size === 0 ? '' : word.slice(-size);
      const rules = this.byEnding.get(ending);
      if (!rules) continue;
      const stem = size === 0 ? word : word.slice(0, -size);
      for (const rule of rules) {
        for (const entry of this.stems[rule.key - 1]?.get(stem) ?? []) {
          if (entry.pos !== rule.pos) continue;
          if (rule.pos !== 'ADV' && rule.decl !== 0) {
            if (rule.decl !== entry.decl) continue;
            if (rule.variant !== 0 && rule.variant !== entry.variant) continue;
          }
          out.set(`${entry.pos}:${entry.headword}`, entry);
        }
      }
    }
    return [...out.values()];
  }
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}
