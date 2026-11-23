import { describe, it, expect } from 'vitest';
import { CorpusDB } from '../../../data/corpus.js';
import { PATHWAYS, getPathway, pathwayGoals, pathwayPosition } from '../pathways.js';
import { pickNextReading, type ReadingCandidate } from '../nextReading.js';

const corpus: ReadingCandidate[] = CorpusDB.getTexts().map((t) => ({
  id: t.id,
  title: t.title,
  language: t.language,
  author: t.author,
  level: t.level,
  genre: t.genre,
  sentenceCount: t.sentenceCount,
}));
const byId = new Map(corpus.map((t) => [t.id, t]));

describe('pathways', () => {
  it('covers Koine Greek, Classical Latin and Biblical Hebrew', () => {
    expect(PATHWAYS.map((p) => p.languageId).sort()).toEqual(['grc-koine', 'hbo', 'lat']);
  });

  it('only names texts that exist, in the pathway language, and are visible in the Library', () => {
    for (const pathway of PATHWAYS) {
      for (const step of pathway.steps) {
        const text = CorpusDB.getText(step.textId);
        expect(text, `${pathway.languageId}: ${step.textId}`).toBeDefined();
        expect(text!.language, step.textId).toBe(pathway.languageId);
        expect(text!.libraryHidden, step.textId).toBeFalsy();
      }
    }
  });

  it('never repeats a text and never gets easier by more than one level', () => {
    const levels = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const pathway of PATHWAYS) {
      const ids = pathway.steps.map((s) => s.textId);
      expect(new Set(ids).size).toBe(ids.length);
      let highest = 0;
      for (const step of pathway.steps) {
        const level = levels.indexOf(byId.get(step.textId)?.level ?? '');
        if (level < 0) continue;
        expect(level, `${step.textId} drops too far`).toBeGreaterThanOrEqual(highest - 2);
        highest = Math.max(highest, level);
      }
    }
  });

  it('gives each language at least two destinations and ends reachable ones on the path', () => {
    for (const pathway of PATHWAYS) {
      expect(pathwayGoals(pathway).length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('pathwayPosition', () => {
  it('aims a new learner at the first destination', () => {
    const p = pathwayPosition('grc-koine', new Set())!;
    expect(p.goal.textId).toBe('grc-koine-1-john-full');
    expect(p.done).toBe(0);
    expect(p.next?.textId).toBe('grc-koine-vocab');
  });

  it('moves to the next destination once one is reached', () => {
    const finished = new Set(['grc-koine-vocab', 'GrcMini', 'grc-koine-1-john-full']);
    const p = pathwayPosition('grc-koine', finished)!;
    expect(p.goal.textId).toBe('grc-koine-mark-full');
    expect(p.next?.textId).toBe('Jn-full');
    expect(p.done).toBe(3);
    expect(p.steps).toHaveLength(5);
  });

  it('honours a chosen destination and measures from the furthest text finished', () => {
    const p = pathwayPosition(
      'lat',
      new Set(['lat-vocab', 'lat-disticha-catonis-full']),
      'Caesar-BG-1'
    )!;
    expect(p.goal.goal).toBe('Read Caesar');
    expect(p.next?.textId).toBe('lat-vulgate-john-full'); // LatMini was passed over
    expect(p.done).toBe(3);
    expect(p.steps).toHaveLength(5);
  });

  it('has no next step when the destination is reached', () => {
    const all = new Set(getPathway('hbo')!.steps.map((s) => s.textId));
    expect(pathwayPosition('hbo', all)!.next).toBeUndefined();
  });

  it('returns undefined for a language without a pathway', () => {
    expect(pathwayPosition('syr', new Set())).toBeUndefined();
  });
});

describe('pickNextReading', () => {
  const at = (id: string) => byId.get(id)!;

  it('follows the pathway from a text that is on it', () => {
    const next = pickNextReading(at('grc-koine-1-john-full'), corpus)!;
    expect(next.reason).toBe('pathway');
    // Starting partway along never sends the learner back to the word list.
    expect(next.text.id).toBe('Jn-full');
    expect(next.goal).toBe('Read the Gospel of Mark');
    expect(next.why).toBeTruthy();
  });

  it('leads onward from a text beyond the first destination, never back', () => {
    // Psalm 23 sits after Jonah on the Hebrew path; nothing else has been read.
    const next = pickNextReading(at('Heb-Ps23'), corpus)!;
    expect(next.text.id).toBe('hbo-genesis-full');
    expect(next.goal).toBe('Read Genesis');
  });

  it('keeps going along the path after the last destination', () => {
    const path = getPathway('grc-koine')!.steps.map((s) => s.textId);
    const finished = new Set(path.slice(0, -1));
    const next = pickNextReading(at('grc-koine-romans-full'), corpus, { finished })!;
    expect(next.text.id).toBe('grc-koine-hebrews-full');
  });

  it('never suggests the text just finished, a finished text, or another language', () => {
    for (const text of corpus) {
      const next = pickNextReading(text, corpus, { finished: new Set(['Jn-full']) });
      if (!next) continue;
      expect(next.text.id).not.toBe(text.id);
      expect(next.text.id).not.toBe('Jn-full');
      expect(next.text.language).toBe(text.language);
    }
  });

  it('off the path, prefers a text already begun, then the same author at a close level', () => {
    const galatians = at('grc-koine-galatians-full');
    const resumed = pickNextReading(galatians, corpus, {
      started: new Set(['grc-koine-james-full']),
    })!;
    expect(resumed).toMatchObject({ reason: 'resume', text: { id: 'grc-koine-james-full' } });

    const fresh = pickNextReading(galatians, corpus)!;
    expect(fresh.reason).toBe('sameAuthor');
    expect(fresh.text.author).toBe('Paul');
  });

  it('works for a language with no pathway', () => {
    const syriac = corpus.filter((t) => t.language === 'syr');
    if (syriac.length < 2) return;
    const next = pickNextReading(syriac[0], corpus)!;
    expect(next.text.language).toBe('syr');
    expect(next.reason).not.toBe('pathway');
  });

  it('returns null when nothing else is left in the language', () => {
    const only: ReadingCandidate = { id: 'x', title: 'X', language: 'zzz' };
    expect(pickNextReading(only, [only])).toBeNull();
  });
});
