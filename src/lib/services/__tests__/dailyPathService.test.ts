import { describe, it, expect } from 'vitest';
import { computeDailyPath, totalEstimatedMinutes } from '../dailyPathService.js';
import type { DailyPathInput } from '../dailyPathService.js';

const BASE: DailyPathInput = {
  languageId: 'grc',
  tierId: 'know-alphabet',
  hasScriptLearning: true,
  progress: {
    scriptOpened: false,
    firstTextOpened: false,
    firstWordSaved: false,
    firstReviewCompleted: false,
    curriculumIndex: 0,
  },
  textId: 'Jn-1',
  dueCount: 0,
  dailyCommitment: 10,
};

describe('computeDailyPath', () => {
  // ── Basic inclusion ─────────────────────────────────────────────────────

  it('fresh beginner (no-script-opened, no-reviews) → script + reading', () => {
    const items = computeDailyPath(BASE);
    expect(items.map((i) => i.id)).toEqual(['script', 'reading']);
  });

  it('with reviews due → script + reading + review', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 12 });
    expect(items.map((i) => i.id)).toEqual(['script', 'reading', 'review']);
  });

  it('only reviews outstanding → review only (no script, no text)', () => {
    const items = computeDailyPath({
      ...BASE,
      hasScriptLearning: false,
      textId: null,
      dueCount: 5,
    });
    expect(items.map((i) => i.id)).toEqual(['review']);
  });

  it('nothing applicable → empty array', () => {
    const items = computeDailyPath({
      ...BASE,
      hasScriptLearning: false,
      textId: null,
      dueCount: 0,
    });
    expect(items).toHaveLength(0);
  });

  // ── Script drill rules ──────────────────────────────────────────────────

  it('omits script if language has no script learning', () => {
    const items = computeDailyPath({ ...BASE, hasScriptLearning: false });
    expect(items.find((i) => i.id === 'script')).toBeUndefined();
  });

  it('omits script once scriptOpened for non-know-nothing tier', () => {
    const items = computeDailyPath({
      ...BASE,
      tierId: 'know-alphabet',
      progress: { ...BASE.progress, scriptOpened: true },
    });
    expect(items.find((i) => i.id === 'script')).toBeUndefined();
  });

  it('still shows script for know-nothing tier even after scriptOpened', () => {
    const items = computeDailyPath({
      ...BASE,
      tierId: 'know-nothing',
      progress: { ...BASE.progress, scriptOpened: true },
    });
    const scriptItem = items.find((i) => i.id === 'script');
    expect(scriptItem).toBeDefined();
  });

  it('marks script complete when scriptOpened', () => {
    const items = computeDailyPath({
      ...BASE,
      tierId: 'know-nothing',
      progress: { ...BASE.progress, scriptOpened: true },
    });
    expect(items.find((i) => i.id === 'script')?.isComplete).toBe(true);
  });

  it('script is not complete when not yet opened', () => {
    const items = computeDailyPath(BASE);
    expect(items.find((i) => i.id === 'script')?.isComplete).toBe(false);
  });

  it('script link contains languageId', () => {
    const items = computeDailyPath({ ...BASE, languageId: 'hbo' });
    expect(items.find((i) => i.id === 'script')?.link).toContain('hbo');
  });

  // ── Reading bite rules ──────────────────────────────────────────────────

  it('omits reading when textId is null', () => {
    const items = computeDailyPath({ ...BASE, textId: null });
    expect(items.find((i) => i.id === 'reading')).toBeUndefined();
  });

  it('reading link contains textId', () => {
    const items = computeDailyPath({ ...BASE, textId: 'Gen-1' });
    expect(items.find((i) => i.id === 'reading')?.link).toContain('Gen-1');
  });

  it('reading textId is passed through to item', () => {
    const items = computeDailyPath({ ...BASE, textId: 'Aeneid-1' });
    expect(items.find((i) => i.id === 'reading')?.textId).toBe('Aeneid-1');
  });

  it('marks reading complete when firstTextOpened', () => {
    const items = computeDailyPath({
      ...BASE,
      progress: { ...BASE.progress, firstTextOpened: true },
    });
    expect(items.find((i) => i.id === 'reading')?.isComplete).toBe(true);
  });

  it('reading estimated minutes scales up with dailyCommitment', () => {
    const short = computeDailyPath({ ...BASE, hasScriptLearning: false, dailyCommitment: 5 });
    const long = computeDailyPath({ ...BASE, hasScriptLearning: false, dailyCommitment: 60 });
    const shortMins = short.find((i) => i.id === 'reading')?.estimatedMinutes ?? 0;
    const longMins = long.find((i) => i.id === 'reading')?.estimatedMinutes ?? 0;
    expect(longMins).toBeGreaterThanOrEqual(shortMins);
  });

  it('reading estimated minutes is at least 5', () => {
    const items = computeDailyPath({ ...BASE, hasScriptLearning: false, dailyCommitment: 1 });
    expect(items.find((i) => i.id === 'reading')?.estimatedMinutes).toBeGreaterThanOrEqual(5);
  });

  it('reading estimated minutes is at most 20', () => {
    const items = computeDailyPath({ ...BASE, hasScriptLearning: false, dailyCommitment: 999 });
    expect(items.find((i) => i.id === 'reading')?.estimatedMinutes).toBeLessThanOrEqual(20);
  });

  // ── Review rules ────────────────────────────────────────────────────────

  it('omits review when dueCount is 0', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 0 });
    expect(items.find((i) => i.id === 'review')).toBeUndefined();
  });

  it('includes review when dueCount > 0', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 7 });
    expect(items.find((i) => i.id === 'review')).toBeDefined();
  });

  it('review dueCount matches input', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 42 });
    expect(items.find((i) => i.id === 'review')?.dueCount).toBe(42);
  });

  it('review is never marked complete (completion tracked by Review page)', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 3 });
    expect(items.find((i) => i.id === 'review')?.isComplete).toBe(false);
  });

  it('review link is /app/review', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 1 });
    expect(items.find((i) => i.id === 'review')?.link).toBe('/app/review');
  });

  it('review estimated minutes is at least 5', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 1 });
    expect(items.find((i) => i.id === 'review')?.estimatedMinutes).toBeGreaterThanOrEqual(5);
  });

  it('review estimated minutes is at most 30', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 9999 });
    expect(items.find((i) => i.id === 'review')?.estimatedMinutes).toBeLessThanOrEqual(30);
  });

  // ── Item ordering ───────────────────────────────────────────────────────

  it('order is always script → reading → review', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 5 });
    const ids = items.map((i) => i.id);
    const scriptIdx = ids.indexOf('script');
    const readingIdx = ids.indexOf('reading');
    const reviewIdx = ids.indexOf('review');
    if (scriptIdx !== -1 && readingIdx !== -1) expect(scriptIdx).toBeLessThan(readingIdx);
    if (readingIdx !== -1 && reviewIdx !== -1) expect(readingIdx).toBeLessThan(reviewIdx);
    if (scriptIdx !== -1 && reviewIdx !== -1) expect(scriptIdx).toBeLessThan(reviewIdx);
  });

  // ── Varied commitment / user states ────────────────────────────────────

  it('no-onboarding-equivalent: language with no script, no text, no reviews → empty', () => {
    const items = computeDailyPath({
      ...BASE,
      hasScriptLearning: false,
      textId: null,
      dueCount: 0,
    });
    expect(items).toHaveLength(0);
  });

  it('intermediate user who has opened script + text, with reviews due', () => {
    const items = computeDailyPath({
      ...BASE,
      tierId: 'read-slowly',
      progress: {
        scriptOpened: true,
        firstTextOpened: true,
        firstWordSaved: true,
        firstReviewCompleted: false,
        curriculumIndex: 0,
      },
      dueCount: 15,
    });
    // Script dropped (opened + not know-nothing). Reading shown (complete). Review shown.
    expect(items.find((i) => i.id === 'script')).toBeUndefined();
    expect(items.find((i) => i.id === 'reading')?.isComplete).toBe(true);
    expect(items.find((i) => i.id === 'review')).toBeDefined();
  });

  it('all milestones done, zero reviews → only reading (as complete)', () => {
    const items = computeDailyPath({
      ...BASE,
      progress: {
        scriptOpened: true,
        firstTextOpened: true,
        firstWordSaved: true,
        firstReviewCompleted: true,
        curriculumIndex: 0,
      },
      dueCount: 0,
    });
    // Script dropped (opened + not know-nothing)
    // Reading: shown (text available), complete
    // Review: not shown (0 due)
    expect(items.map((i) => i.id)).toEqual(['reading']);
    expect(items[0].isComplete).toBe(true);
  });
});

// ── Curriculum-backed reading ────────────────────────────────────────────────

describe('computeDailyPath — curriculum', () => {
  const CURRICULUM = [
    { id: 'u1', textId: 'GrcMini', title: 'Greek Mini-Stories', level: 'A1' as const, estimatedMinutes: 10 },
    { id: 'u2', textId: 'Jn-1', title: 'Gospel of John, chapter 1', level: 'A1' as const, estimatedMinutes: 10 },
    { id: 'u3', textId: 'Anab-1', title: 'Xenophon, Anabasis', level: 'B1' as const, estimatedMinutes: 15 },
  ];

  it('reading bite points at the unit at curriculumIndex, not the generic textId', () => {
    const items = computeDailyPath({ ...BASE, curriculum: CURRICULUM, curriculumIndex: 0 });
    const reading = items.find((i) => i.id === 'reading');
    expect(reading?.textId).toBe('GrcMini');
    expect(reading?.unitTitle).toBe('Greek Mini-Stories');
    expect(reading?.unitLevel).toBe('A1');
    expect(reading?.curriculumIndex).toBe(0);
  });

  it('advances to the next unit as curriculumIndex increases', () => {
    const items = computeDailyPath({ ...BASE, curriculum: CURRICULUM, curriculumIndex: 1 });
    const reading = items.find((i) => i.id === 'reading');
    expect(reading?.textId).toBe('Jn-1');
    expect(reading?.curriculumIndex).toBe(1);
  });

  it('curriculum reading bite is never marked complete (next unit each day)', () => {
    const items = computeDailyPath({
      ...BASE,
      curriculum: CURRICULUM,
      curriculumIndex: 0,
      progress: { ...BASE.progress, firstTextOpened: true },
    });
    expect(items.find((i) => i.id === 'reading')?.isComplete).toBe(false);
  });

  it('falls back to the generic recommended text once the ladder is finished', () => {
    const items = computeDailyPath({
      ...BASE,
      curriculum: CURRICULUM,
      curriculumIndex: CURRICULUM.length,
      textId: 'Plato-Apology-1',
    });
    const reading = items.find((i) => i.id === 'reading');
    expect(reading?.textId).toBe('Plato-Apology-1');
    expect(reading?.unitTitle).toBeUndefined();
  });

  it('ignores curriculum when none is provided (generic behavior preserved)', () => {
    const items = computeDailyPath({ ...BASE, curriculum: null });
    expect(items.find((i) => i.id === 'reading')?.textId).toBe('Jn-1');
    expect(items.find((i) => i.id === 'reading')?.unitTitle).toBeUndefined();
  });
});

// ── totalEstimatedMinutes ───────────────────────────────────────────────────

describe('totalEstimatedMinutes', () => {
  it('sums minutes across all items', () => {
    const items = computeDailyPath({ ...BASE, dueCount: 6 });
    const total = totalEstimatedMinutes(items);
    const manual = items.reduce((s, i) => s + i.estimatedMinutes, 0);
    expect(total).toBe(manual);
  });

  it('returns 0 for empty array', () => {
    expect(totalEstimatedMinutes([])).toBe(0);
  });
});
