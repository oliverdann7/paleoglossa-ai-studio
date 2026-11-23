import { describe, expect, it } from 'vitest';
import { buildLemmaProfile, countLemmas, coverageFromProfile, coverageOf } from '../coverage.js';
import { pickNextReading, type ReadingCandidate } from '../nextReading.js';

const states =
  (known: string[], seen: string[] = []) =>
  (lemma: string) =>
    known.includes(lemma) ? 'KNOWN' : seen.includes(lemma) ? 'LEARNING' : 'NEW';

describe('countLemmas', () => {
  it('identifies a token by its lemma, or its surface form when it has none', () => {
    const counts = countLemmas(
      [
        { surface: 'Ἀρχὴ', lemma: 'ἀρχή' },
        { surface: 'ἀρχῆς', lemma: 'ἀρχή' },
        { surface: 'λόγον', lemma: '' },
        { text: ',', type: 'punctuation' },
        { surface: '·' },
      ],
      'grc-koine'
    );
    expect([...counts]).toEqual([
      ['αρχη', 2],
      ['λογον', 1],
    ]);
  });

  it('uses the language rules of vocabulary identity', () => {
    expect([...countLemmas([{ lemma: 'Jūlius' }, { lemma: 'iulius' }], 'lat')]).toEqual([
      ['iulius', 2],
    ]);
  });
});

describe('coverageOf', () => {
  it('counts known running words and lemmas never met', () => {
    const counts = new Map([
      ['και', 6],
      ['λογος', 3],
      ['αρχη', 1],
    ]);
    expect(coverageOf(counts, states(['και'], ['λογος']))).toEqual({
      percentKnown: 60,
      newLemmas: 1,
      totalLemmas: 3,
    });
  });

  it('treats familiar words as known, and has nothing to say about an empty text', () => {
    expect(coverageOf([['a', 1]], () => 'FAMILIAR')!.percentKnown).toBe(100);
    expect(coverageOf([], () => 'KNOWN')).toBeNull();
  });
});

describe('lemma profiles', () => {
  const mark = new Map([
    ['και', 8],
    ['λογος', 2],
  ]);
  const john = new Map([
    ['λογος', 5],
    ['φως', 5],
  ]);
  const profile = buildLemmaProfile('grc-koine', [
    ['mark', mark],
    ['john', john],
  ]);

  it('shares one lemma list between the texts of a language', () => {
    expect(profile.lemmas).toEqual(['και', 'λογος', 'φως']);
    expect(profile.texts.mark).toEqual({ tokens: 10, counts: [0, 8, 1, 2] });
    expect(profile.texts.john.tokens).toBe(10);
  });

  it('gives the same coverage as the counts it was built from', () => {
    const stateOf = states(['και', 'φως']);
    const fromProfile = coverageFromProfile(profile, stateOf);
    expect(fromProfile.get('mark')).toEqual(coverageOf(mark, stateOf));
    expect(fromProfile.get('john')).toEqual(coverageOf(john, stateOf));
  });
});

describe('pickNextReading with coverage', () => {
  const text = (id: string, extra: Partial<ReadingCandidate> = {}): ReadingCandidate => ({
    id,
    title: id,
    language: 'zzz',
    level: 'B1',
    ...extra,
  });
  const current = text('current');
  const cover = (percentKnown: number) => ({ percentKnown, newLemmas: 10, totalLemmas: 100 });

  it('prefers the text the learner can read now over an equal one out of reach', () => {
    const next = pickNextReading(current, [current, text('a-hard'), text('b-readable')], {
      coverage: new Map([
        ['a-hard', cover(40)],
        ['b-readable', cover(91)],
      ]),
    })!;
    expect(next.text.id).toBe('b-readable');
    expect(next.reason).toBe('readable');
    expect(next.coverage?.percentKnown).toBe(91);
  });

  it('prefers a text with something left to learn over one fully known', () => {
    const next = pickNextReading(current, [current, text('a-known'), text('b-readable')], {
      coverage: new Map([
        ['a-known', cover(100)],
        ['b-readable', cover(90)],
      ]),
    })!;
    expect(next.text.id).toBe('b-readable');
  });

  it('still resumes a text already begun', () => {
    const next = pickNextReading(current, [current, text('begun'), text('readable')], {
      started: new Set(['begun']),
      coverage: new Map([
        ['begun', cover(50)],
        ['readable', cover(92)],
      ]),
    })!;
    expect(next).toMatchObject({ reason: 'resume', text: { id: 'begun' } });
  });

  it('changes nothing when no coverage is known', () => {
    const pool = [current, text('a'), text('b', { level: 'B2' })];
    expect(pickNextReading(current, pool, { coverage: new Map() })).toEqual(
      pickNextReading(current, pool)
    );
  });
});
