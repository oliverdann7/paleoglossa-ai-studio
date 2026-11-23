/**
 * Latin form → lemma lookup: treebank form table first, Whitaker's WORDS for
 * everything the treebank never saw.
 *
 *  1. closed   — sum, idem / uterque and the qui-compounds (quidam, aliquis,
 *                …), which WORDS models in ways this module does not parse.
 *  2. treebank — the lemma Perseus LDT annotators gave this exact spelling.
 *  3. words    — WORDS analysis, disambiguated by {@link chooseLemma} with LDT
 *                lemma frequencies as the prior.
 */
import { addToTable, dominantLemma, readTreebankWords, type FormTable } from './treebank.js';
import { chooseLemma, wordsKey, type Whitaker } from './whitaker.js';

const LATIN_LEMMA = /^[A-Za-z]+$/;
export const isLatinLemma = (lemma: string): boolean => LATIN_LEMMA.test(lemma);

export interface LatinTables {
  forms: FormTable;
  /** wordsKey(lemma) → occurrences in the treebank; the prior for WORDS ties. */
  lemmaCounts: Map<string, number>;
  words: number;
}

export function buildLatinTables(treebankXml: Iterable<string>): LatinTables {
  const tables: LatinTables = { forms: new Map(), lemmaCounts: new Map(), words: 0 };
  for (const xml of treebankXml) {
    for (const { form, lemma } of readTreebankWords(xml, isLatinLemma)) {
      addToTable(tables.forms, wordsKey(form), lemma);
      const k = wordsKey(lemma);
      tables.lemmaCounts.set(k, (tables.lemmaCounts.get(k) ?? 0) + 1);
      tables.words++;
    }
  }
  return tables;
}

// ── Closed classes ───────────────────────────────────────────────────────────

const QUI_FORMS = new Set(
  (
    'qui quae quod quis quid cuius cui quem quam quo qua quorum quarum quibus quos quas ' +
    'quoius quoi quis'
  ).split(' ')
);
/** suffix → lemma, for `<qui-form><suffix>`. `-que` is left to the enclitic rule: quoque, quaque are ambiguous. */
const QUI_SUFFIXES: Array<[string, string]> = [
  ['cumque', 'quicumque'],
  ['cunque', 'quicumque'],
  ['libet', 'quilibet'],
  ['quam', 'quisquam'],
  ['piam', 'quispiam'],
  ['dam', 'quidam'],
  ['uis', 'quivis'],
];
const IDEM_FORMS = new Set(
  (
    'idem eadem eiusdem eidem eundem eandem eodem eorundem earundem eisdem iisdem isdem eosdem easdem ' +
    'eaedem iidem'
  ).split(' ')
);
const UTERQUE_FORMS = new Set(
  'uterque utraque utrumque utriusque utrique utroque utramque utrosque utrasque utrorumque utrarumque utrisque'.split(
    ' '
  )
);

/**
 * The present-stem forms of sum: WORDS stores them on an empty stem this
 * module does not index (leaving `esse` to edo and `sum` to sumo). `es` and
 * `est` are omitted where edo is a live reading only in principle — both are
 * overwhelmingly sum.
 */
const SUM_FORMS = new Set(
  (
    'sum es est sumus estis sunt eram eras erat eramus eratis erant ero eris erit erimus eritis erunt ' +
    'sim sis sit simus sitis sint essem esses esset essemus essetis essent esse ' +
    'fore forem fores foret forent esto estote sunto'
  ).split(' ')
);

export function closedClassLemma(surface: string): string | undefined {
  const k = wordsKey(surface);
  if (SUM_FORMS.has(k)) return 'sum';
  if (IDEM_FORMS.has(k)) return 'idem';
  if (UTERQUE_FORMS.has(k)) return 'uterque';
  // quendam / quandam / quorundam: m → n before the d.
  const denasal = k.replace(/n(dam)$/, 'm$1');
  for (const [suffix, lemma] of QUI_SUFFIXES) {
    if (denasal.length > suffix.length && denasal.endsWith(suffix) && QUI_FORMS.has(denasal.slice(0, -suffix.length))) {
      return lemma;
    }
  }
  if (k.startsWith('ali') && QUI_FORMS.has(k.slice(3))) return 'aliquis';
  return undefined;
}

// ── Lookup ───────────────────────────────────────────────────────────────────

export type LatinTier = 'closed' | 'treebank' | 'words';

/** C1 controls and the Latin-1 letters UTF-8 lead bytes decode to. */
const MOJIBAKE = /[\u0080-\u009f\u00c2-\u00c5]/;

/** Treebank annotators must agree at least this strongly on a spelling. */
const TREEBANK_DOMINANCE = 2;

/** Assimilated-prefix spellings WORDS does not list (adfero → affero). */
const ASSIMILATIONS: Array<[RegExp, string]> = [
  [/^ad([cfglnprst])/, 'a$1$1'],
  [/^in([lmr])/, 'i$1$1'],
  [/^in([bp])/, 'im$1'],
  [/^con([lr])/, 'co$1$1'],
  [/^con([bp])/, 'com$1'],
  [/^ob([cfp])/, 'o$1$1'],
  [/^sub([cfgmp])/, 'su$1$1'],
];

/**
 * @param sentenceInitial the token opens its sentence, so a capital says nothing
 *        about whether it is a name.
 */
export function lookupLatinLemma(
  tables: LatinTables,
  words: Whitaker,
  surface: string,
  sentenceInitial = false
): { lemma: string; tier: LatinTier } | undefined {
  // Mis-decoded text (UTF-8 read as Latin-1: "canÅ\u008d" for canō) would be
  // reduced to a different word by the key — leave it for an encoding repair.
  if (MOJIBAKE.test(surface)) return undefined;
  const key = wordsKey(surface);
  if (!key) return undefined;

  const closed = closedClassLemma(surface);
  if (closed) return { lemma: closed, tier: 'closed' };

  const tally = tables.forms.get(key);
  if (tally) {
    const lemma = dominantLemma(tally, TREEBANK_DOMINANCE);
    if (lemma) return { lemma, tier: 'treebank' };
  }

  let analyses = words.analyze(key);
  if (analyses.length === 0) {
    for (const [pattern, replacement] of ASSIMILATIONS) {
      if (!pattern.test(key)) continue;
      analyses = words.analyze(key.replace(pattern, replacement));
      if (analyses.length) break;
    }
  }
  const lemma = chooseLemma(analyses, tables.lemmaCounts);
  // A capitalised word inside a sentence is a name. If WORDS only offers a
  // common word for it (Aeneam → aeneus, "of bronze"), it does not know the
  // name — leave it. Headings in capitals (LIBER PRIMVS) are not names.
  const letters = surface.replace(/[^A-Za-z]/g, '');
  const capitalised = /^[A-Z]/.test(letters) && letters !== letters.toUpperCase();
  if (lemma && capitalised && !sentenceInitial && /^[a-z]/.test(lemma)) return undefined;
  // The Perseus texts print consonantal i, not j.
  return lemma ? { lemma: lemma.replace(/j/g, 'i').replace(/J/g, 'I'), tier: 'words' } : undefined;
}
