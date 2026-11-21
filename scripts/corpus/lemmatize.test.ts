import { describe, it, expect } from 'vitest';
import { LatinAnalyser, foldLatin } from './latinWords.js';
import { pickLemma } from './lemmaPick.js';

// A few lines in the real WORDS file formats (fixed-width stems, then part info).
const stems = (...s: string[]) => [0, 1, 2, 3].map((i) => (s[i] ?? '').padEnd(19)).join('');
const DICTLINE = [
  `${stems('verb', 'verb')}N      2 2 N T          X X X A O word; proverb;`,
  `${stems('imperi', 'imperi')}N      2 4 N T          X X X A O command; authority; empire;`,
  `${stems('rex', 'reg')}N      3 1 M P          X X X A O king;`,
  `${stems('reg', 'reg', 'rex', 'rect')}V      3 1 TRANS        X X X A O rule, guide; manage, direct;`,
  `${stems('am', 'am', 'amav', 'amat')}V      1 1 TRANS        X X X A O love, like; fall in love with;`,
  `${stems('omn', 'omn')}ADJ    3 2 POS          X X X A O all, every;`,
  `${stems('omn', 'omn')}N      3 3 N T          X X X C O all things; everything;`,
  `${stems('semper')}ADV    POS              X X X A O always;`,
  `${stems('et')}CONJ                    X X X A O and, and even; also, even;`,
  `${stems('uv', 'uv')}N      1 1 F T          X X X B O grape;`,
].join('\n');

const INFLECTS = `
N     2 2 NOM S N  1 2 um        X A
N     2 2 NOM P N  2 1 a         X A
N     2 4 NOM S C  1 2 us        X A
N     2 4 NOM S N  1 2 um        X A
N     2 4 ABL S X  2 1 o         X A
N     3 1 NOM S X  1 0           X A
N     3 1 GEN S X  2 2 is        X A
N     3 3 NOM S N  1 1 e         X A
N     3 3 NOM P N  2 2 ia        X A
N     1 1 NOM S C  1 1 a         X A
N     1 1 ACC P C  1 2 as        X A
V     1 1 PRES  ACTIVE  IND  1 S  1 1 o             X A
V     1 1 PRES  ACTIVE  IND  3 P  1 3 ant           X A
V     1 1 PERF  ACTIVE  IND  3 S  3 2 it            X A
V     3 1 PRES  ACTIVE  IND  1 S  1 1 o             X A
V     3 1 PRES  ACTIVE  IND  2 S  1 2 is            X A
ADJ   3 2 NOM S X POS   1 2 is       X A
ADJ   3 2 NOM P X POS   2 2 es       X A
ADV    POS 1 0       X A
`;

const analyser = new LatinAnalyser(INFLECTS, DICTLINE);
const headwords = (form: string) =>
  analyser
    .analyse(form)
    .map((e) => e.headword)
    .sort();

describe('LatinAnalyser', () => {
  it('strips an ending and finds the dictionary headword', () => {
    expect(headwords('verba')).toEqual(['verbum']);
    expect(headwords('amant')).toEqual(['amo']);
    expect(headwords('amavit')).toEqual(['amo']); // perfect stem
  });

  it('builds a neuter headword with the neuter nominative', () => {
    expect(headwords('imperio')).toEqual(['imperium']);
  });

  it('reports every word a form can belong to instead of choosing', () => {
    expect(headwords('regis')).toEqual(['rego', 'rex']);
  });

  it('checks that declension and stem agree', () => {
    expect(headwords('verbis')).toEqual([]); // no such rule in this table
    expect(headwords('regant')).toEqual([]); // 1st-conjugation ending on a 3rd-conjugation verb
  });

  it('handles uninflected words and enclitics', () => {
    expect(headwords('semper')).toEqual(['semper']);
    expect(headwords('et')).toEqual(['et']);
    expect(headwords('verbaque')).toEqual(['verbum']);
  });

  it('treats u/v and i/j as the same letters', () => {
    expect(foldLatin('Jūlius')).toBe(foldLatin('iulius'));
    expect(headwords('VVAS')).toEqual(['uva']);
  });

  it('returns nothing for a form it cannot explain', () => {
    expect(headwords('xyzzy')).toEqual([]);
  });
});

describe('pickLemma', () => {
  const counts = (o: Record<string, number>) => new Map(Object.entries(o));

  it('returns a unique lemma', () => {
    expect(pickLemma(counts({ λόγος: 1 }), 'grc')).toBe('λόγος');
  });

  it('treats accented and unaccented spellings as one word and writes the accented one', () => {
    expect(pickLemma(counts({ και: 900, καί: 3 }), 'grc')).toBe('καί');
  });

  it('keeps true homographs apart and refuses to guess between them', () => {
    expect(pickLemma(counts({ εἰς: 60, εἷς: 40 }), 'grc')).toBeNull();
  });

  it('accepts a clearly dominant lemma only with enough evidence', () => {
    expect(pickLemma(counts({ λέγω: 95, λέγος: 5 }), 'grc')).toBe('λέγω');
    expect(pickLemma(counts({ λέγω: 2, λέγος: 1 }), 'grc')).toBeNull();
    expect(pickLemma(counts({ rex: 3, rego: 2 }), 'lat')).toBeNull();
  });

  it('folds Latin spelling variants', () => {
    expect(pickLemma(counts({ vir: 4, uir: 2 }), 'lat')).toBe('vir');
  });

  it('returns null without evidence', () => {
    expect(pickLemma(undefined, 'grc')).toBeNull();
  });
});
