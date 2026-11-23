import { describe, it, expect } from 'vitest';
import { buildWhitaker, chooseLemma, wordsKey } from '../whitaker.js';
import { buildGreekTables, greekExactKey, isGreekLemma, lookupGreekLemma } from '../greek.js';
import { buildLatinTables, closedClassLemma, lookupLatinLemma } from '../latin.js';
import { dominantLemma, readTreebankWords } from '../treebank.js';

// ── Fixtures in the WORDS file formats ───────────────────────────────────────

/** One DICTLINE.GEN record: four 19-column stems, a 24-column part entry, flags, meaning. */
function dict(stems: string[], part: string, freq: string, meaning: string): string {
  const cols = [0, 1, 2, 3].map((i) => (stems[i] ?? '').padEnd(19)).join('');
  return `${cols}${part.padEnd(24)}X X X ${freq} X ${meaning}`;
}

const DICTLINE = [
  dict(['am', 'am', 'amav', 'amat'], 'V      1 1 X', 'A', 'love, like;'),
  dict(['puell', 'puell'], 'N      1 1 F P', 'B', 'girl;'),
  dict(['mur', 'mur'], 'N      2 1 M T', 'A', 'wall;'),
  dict(['arm', 'arm'], 'N      2 2 N T', 'A', 'arms (pl.), weapons;'),
  dict(['arm', 'arm'], 'N      2 1 M T', 'C', 'forequarter, shoulder;'),
  dict(['hosti', 'hosti'], 'N      1 1 F P', 'B', 'victim, sacrifice;'),
  dict(['host', 'host'], 'N      3 3 C P', 'A', 'enemy;'),
  dict(['ips', 'ips'], 'PRON   6 2 X', 'A', 'himself;'),
  dict(['zzz', 'zzz', 'od', 'os'], 'V      3 1 PERFDEF', 'B', 'hate;'),
  dict(['hort', 'hort', 'zzz', 'hortat'], 'V      1 1 DEP', 'B', 'encourage;'),
  dict(['ut'], 'CONJ', 'A', 'so that;'),
  dict(['conjux', 'conjug'], 'N      3 1 C P', 'B', 'spouse;'),
].join('\r\n');

// Real INFLECTS.LAT lines (CRLF, trailing comments and all).
const INFLECTS = [
  'V     1 1 PRES  ACTIVE  IND  1 S  1 1 o             X A',
  'V     1 1 PRES  PASSIVE IND  1 S  1 2 or            X A',
  'V     1 1 PRES  PASSIVE IND  3 S  1 4 atur          X A',
  'V     0 0 PERF  ACTIVE  IND  3 S  3 2 it            X A',
  'V     0 0 PERF  ACTIVE  INF  0 X  3 4 isse          X A',
  'N     1 1 NOM S C  1 1 a         X A',
  'N     1 1 GEN S C  2 2 ae        X A',
  'N     1 1 GEN P C  2 2 um        X C       --  archaic contraction',
  'N     2 1 NOM S X  1 2 us        X A       --  Hark 52',
  'N     2 0 ACC P C  2 2 os        X A',
  'N     2 2 NOM S N  1 2 um        X A',
  'N     2 0 NOM P N  2 1 a         X A',
  'N     2 0 DAT P X  2 2 is        X A',
  'N     3 0 NOM S X  1 0           X A',
  'N     3 3 NOM S C  1 2 is        X A',
  'N     3 3 GEN P X  2 3 ium       X A',
  'N     3 0 ABL S X  2 1 e         X A',
  'PRON  6 0 NOM S M   1 1 e                           X A',
  'PRON  6 2 NOM S M   1 2 us                          B C   --  OLD ipse',
  'PRON  6 0 ACC S F   2 2 am                          X A',
].join('\r\n');

const words = buildWhitaker(DICTLINE, INFLECTS);
const lemmasOf = (form: string) => words.analyze(form).map((a) => a.lemma);

describe('wordsKey', () => {
  it('folds u/v, i/j, case and macrons, as WORDS does', () => {
    expect(wordsKey('Vulnere')).toBe('uulnere');
    expect(wordsKey('jam')).toBe(wordsKey('iam'));
    expect(wordsKey('canō,')).toBe('cano');
  });
});

describe("Whitaker's WORDS analysis", () => {
  it('reads CRLF records and ignores trailing comments', () => {
    // The 2nd-declension -us line carries a `-- Hark 52` comment; losing it lost every such noun.
    expect(lemmasOf('muros')).toEqual(['murus']);
  });

  it('builds dictionary headwords from the stems', () => {
    expect(lemmasOf('amavit')).toEqual(['amo']);
    expect(lemmasOf('puellae')).toEqual(['puella']);
    expect(lemmasOf('odisse')).toEqual(['odi']); // perfect-definite: no present stem
    expect(lemmasOf('hortatur')).toEqual(['hortor']); // deponent
    expect(lemmasOf('ipsam')).toEqual(['ipse']); // not Old Latin ipsus
  });

  it('gives a plurale tantum its plural headword', () => {
    expect(lemmasOf('armis').sort()).toEqual(['arma', 'armus']);
  });

  it('strips an enclitic only when the whole form is unknown', () => {
    const [a] = words.analyze('murosque');
    expect(a.lemma).toBe('murus');
    expect(a.enclitic).toBe(true);
    expect(words.analyze('utque')[0].lemma).toBe('ut');
  });

  it('returns nothing for a form it does not know', () => {
    expect(words.analyze('Turnus')).toEqual([]);
    expect(words.analyze('[12]')).toEqual([]);
  });
});

describe('chooseLemma', () => {
  it('takes the only lemma', () => {
    expect(chooseLemma(words.analyze('amavit'))).toBe('amo');
  });

  it('prefers a common ending on a common word over an archaic ending', () => {
    // hostium: genitive plural of hostis, or the archaic -um genitive of hostia.
    expect(lemmasOf('hostium').sort()).toEqual(['hostia', 'hostis']);
    expect(chooseLemma(words.analyze('hostium'))).toBe('hostis');
  });

  it('lets treebank frequency settle what the dictionary cannot', () => {
    const tie = words.analyze('armis');
    expect(chooseLemma(tie, new Map([[wordsKey('arma'), 40]]))).toBe('arma');
    expect(chooseLemma(tie, new Map([[wordsKey('armus'), 40]]))).toBe('armus');
  });

  it('declines to guess between equally plausible lemmas', () => {
    const tie = [
      { lemma: 'plebs', pos: 'N' as const, entryFreq: 'B', inflFreq: 'A', enclitic: false },
      { lemma: 'plebes', pos: 'N' as const, entryFreq: 'B', inflFreq: 'A', enclitic: false },
    ];
    expect(chooseLemma(tie)).toBeUndefined();
    expect(chooseLemma([])).toBeUndefined();
  });
});

// ── Treebank tables ──────────────────────────────────────────────────────────

const word = (form: string, lemma: string, postag = 'n-s---mn-') =>
  `<word id="1" form="${form}" lemma="${lemma}" postag="${postag}" relation="X" head="0"/>`;

describe('readTreebankWords', () => {
  it('drops punctuation, elliptical nodes and homograph numbering', () => {
    const xml = [
      word('λέγει', 'λέγω1', 'v3spia---'),
      word(',', 'punc1', 'u--------'),
      '<word id="9" insertion_id="0003e" artificial="elliptic" form="[0]" lemma="λέγω" postag="v3spia---"/>',
      word('συνεῖδον', 'σύν-εἶδον', 'v1saia---'),
    ].join('\n');
    expect(readTreebankWords(xml, isGreekLemma)).toEqual([{ form: 'λέγει', lemma: 'λέγω' }]);
  });
});

describe('dominantLemma', () => {
  it('requires the commonest lemma to dominate', () => {
    expect(dominantLemma(new Map([['ὁ', 9], ['ὅς', 2]]), 2)).toBe('ὁ');
    expect(dominantLemma(new Map([['ὁ', 3], ['ὅς', 2]]), 2)).toBeUndefined();
    expect(dominantLemma(undefined, 2)).toBeUndefined();
  });
});

describe('Greek lookup', () => {
  const tables = buildGreekTables([
    [
      word('τὸν', 'ὁ', 'l-s---ma-'),
      word('τόν', 'ὁ', 'l-s---ma-'),
      word('τῇσι', 'ὁ', 'l-p---fd-'),
      word('ἡ', 'ὁ', 'l-s---fn-'),
      word('ἤ', 'ἤ', 'c--------'),
      word('ῥᾳδίως', 'ῥᾴδιος', 'd--------'),
      word('ἄνθρωπος', 'ἄνθρωπος'),
      word('τ̓', 'τε', 'd--------'),
      word('αὐτοῦ', 'αὐτός', 'p-s---mg-'),
      word('αὐτοῦ', 'αὐτοῦ', 'd--------'),
    ].join('\n'),
  ]);
  const lemma = (s: string) => lookupGreekLemma(tables, s)?.lemma;

  it('matches grave with acute, and ignores case and edge punctuation', () => {
    expect(greekExactKey('τὸν')).toBe(greekExactKey('τόν'));
    expect(lemma('«Τὸν')).toBe('ὁ');
  });

  it('keeps accents and breathings, which tell words apart', () => {
    expect(lemma('ἡ')).toBe('ὁ');
    expect(lemma('ἢ')).toBe('ἤ');
    expect(lemma('η')).toBeUndefined(); // no accent-insensitive fallback
    // A final accent is part of the key, not edge punctuation.
    expect(greekExactKey('ἡ')).not.toBe(greekExactKey('ἤ'));
    expect(greekExactKey('καί,')).toBe('καί');
  });

  it('reads iota adscript as iota subscript', () => {
    expect(lemma('τῆισι')).toBe('ὁ'); // after η/ω: folded into the key
    expect(lemma('ῥαιδίως')).toBe('ῥᾴδιος'); // after α: fallback spelling
  });

  it('drops the accent thrown back by an enclitic', () => {
    expect(lemma('ἄνθρωπός')).toBe('ἄνθρωπος');
  });

  it('matches the treebank and edition spellings of elision', () => {
    expect(lemma('τ᾽')).toBe('τε');
  });

  it('leaves a spelling the annotators split on', () => {
    expect(lemma('αὐτοῦ')).toBeUndefined();
  });
});

describe('Latin lookup', () => {
  const tables = buildLatinTables([
    [word('vulnere', 'vulnus'), word('amavit', 'amor'), word('amavit', 'amor'), word('quod', 'qui'), word('quod', 'quod')].join('\n'),
  ]);
  const look = (s: string) => lookupLatinLemma(tables, words, s);

  it('resolves closed classes WORDS models as compounds', () => {
    expect(closedClassLemma('quendam')).toBe('quidam');
    expect(closedClassLemma('cuiusquam')).toBe('quisquam');
    expect(closedClassLemma('aliquibus')).toBe('aliquis');
    expect(closedClassLemma('eandem')).toBe('idem');
    expect(closedClassLemma('utrumque')).toBe('uterque');
    expect(closedClassLemma('esse')).toBe('sum');
    expect(closedClassLemma('quondam')).toBeUndefined();
  });

  it('prefers the treebank spelling, then WORDS', () => {
    expect(look('Vulnere')).toEqual({ lemma: 'vulnus', tier: 'treebank' });
    expect(look('amavit')).toEqual({ lemma: 'amor', tier: 'treebank' }); // treebank outranks WORDS
    expect(look('muros')).toEqual({ lemma: 'murus', tier: 'words' });
  });

  it('prints consonantal i, as the Perseus texts do', () => {
    expect(look('conjuge')).toEqual({ lemma: 'coniux', tier: 'words' });
  });

  it('falls through to WORDS when the treebank is split, and gives up when WORDS has nothing', () => {
    expect(look('quod')).toBeUndefined();
    expect(look('Turnus')).toBeUndefined();
  });

  it('does not pass a mid-sentence name off as a common word', () => {
    expect(look('Muros')).toBeUndefined();
    expect(lookupLatinLemma(tables, words, 'Muros', true)).toEqual({ lemma: 'murus', tier: 'words' });
    expect(look('MVROS')).toEqual({ lemma: 'murus', tier: 'words' }); // heading in capitals
  });

  it('refuses mis-decoded text rather than lemmatizing what is left of it', () => {
    // "canō" read as Latin-1 keeps only c-a-n-a once non-letters are stripped.
    expect(look('canÅ\u008d')).toBeUndefined();
  });
});
