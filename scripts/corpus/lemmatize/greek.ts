/**
 * Ancient Greek form → lemma lookup over treebank form tables.
 *
 * Forms are matched with their accents and breathings: stripping them throws
 * the lexical information away (ἡ / ἤ / ἦ / ᾗ all become `η`). Only differences
 * that are editorial rather than lexical are folded — grave → acute, the second
 * accent an enclitic throws back, iota adscript vs subscript, elision marks,
 * case.
 */
import { addToTable, dominantLemma, readTreebankWords, type FormTable } from './treebank.js';

const COMBINING = /[\u0300-\u036f]/g;
const ELISION = /[’ʼ᾽᾿'‘]/g;

/** Matching key for a surface form. */
export function greekExactKey(surface: string): string {
  let s = surface
    .normalize('NFD')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .replace(/\u0300/g, '\u0301') // grave is a positional variant of acute
    .replace(/\u0345/g, '') // iota subscript …
    .replace(/([ηω][\u0300-\u036f]*)ι(?![\u0300-\u036f])/g, '$1') // … and its adscript spelling (τῆι = τῇ)
    .replace(ELISION, "'")
    // Treebanks mark elision with a combining smooth breathing on the last
    // consonant, or a hyphen (τ-).
    .replace(/([β-δζθκ-νξπρστφ-ψ])[\u0313-]$/u, "$1'")
    // Edge punctuation only — a final accent is a combining mark and must stay.
    .replace(/^[^\p{L}\p{M}']+|[^\p{L}\p{M}']+$/gu, '');
  // ἄνθρωπός τις: drop the accent thrown back by a following enclitic.
  const tonal = s.match(/[\u0301\u0342]/g);
  if (tonal && tonal.length > 1) {
    const last = s.lastIndexOf('\u0301');
    if (last !== -1) s = s.slice(0, last) + s.slice(last + 1);
  }
  return s.normalize('NFC');
}

/** The exact key without any diacritics — for comparing lemmas, not for lookup. */
export function greekLooseKey(surface: string): string {
  return greekExactKey(surface).normalize('NFD').replace(COMBINING, '');
}

const GREEK_LEMMA = /^[Ͱ-Ͽἀ-῿]+$/;
/** Rejects punctuation, placeholders and split-preverb lemmas (`σύν-εἶδον`). */
export const isGreekLemma = (lemma: string): boolean => GREEK_LEMMA.test(lemma.normalize('NFC'));

export interface GreekTables {
  exact: FormTable;
  words: number;
}

export function buildGreekTables(treebankXml: Iterable<string>): GreekTables {
  const tables: GreekTables = { exact: new Map(), words: 0 };
  for (const xml of treebankXml) {
    for (const { form, lemma } of readTreebankWords(xml, isGreekLemma)) {
      const nfc = lemma.normalize('NFC');
      addToTable(tables.exact, greekExactKey(form), nfc);
      tables.words++;
    }
  }
  return tables;
}

export type GreekTier = 'exact';

/** Agreement required of the annotators: commonest lemma ≥ N × the runner-up. */
const EXACT_DOMINANCE = 2;

/**
 * Iota adscript after alpha (ῥαιδίως = ῥᾳδίως, στρατιᾶι = στρατιᾷ) cannot be
 * folded into the key — αι is usually a real diphthong — so each unaccented ι
 * after an α is dropped in turn as a fallback spelling.
 */
function alphaAdscriptVariants(exactKey: string): string[] {
  const nfd = exactKey.normalize('NFD');
  const out: string[] = [];
  const pattern = /α[\u0300-\u036f]*ι(?![\u0300-\u036f])/g;
  for (let m = pattern.exec(nfd); m; m = pattern.exec(nfd)) {
    const iota = m.index + m[0].length - 1;
    out.push((nfd.slice(0, iota) + nfd.slice(iota + 1)).normalize('NFC'));
  }
  return out;
}

/**
 * The lemma annotators gave this spelling, or undefined when they never saw it
 * or disagree about it. There is deliberately no accent-insensitive fallback:
 * measured against an independent treebank it agreed only ~60% of the time
 * (ἡ / ἤ / ἦ / ᾗ are four words), against ~97% for the accented spelling.
 */
export function lookupGreekLemma(tables: GreekTables, surface: string): { lemma: string; tier: GreekTier } | undefined {
  const exactKey = greekExactKey(surface);
  if (!exactKey) return undefined;
  const attested = tables.exact.get(exactKey);
  if (attested) {
    const lemma = dominantLemma(attested, EXACT_DOMINANCE);
    return lemma ? { lemma, tier: 'exact' } : undefined;
  }
  for (const variant of alphaAdscriptVariants(exactKey)) {
    const lemma = dominantLemma(tables.exact.get(variant), EXACT_DOMINANCE);
    if (lemma) return { lemma, tier: 'exact' };
  }
  return undefined;
}
