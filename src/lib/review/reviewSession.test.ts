import { describe, it, expect, beforeEach } from 'vitest';
import {
  readSavedSession,
  writeSavedSession,
  clearSavedSession,
  SESSION_KEY,
  SESSION_MAX_AGE_MS,
} from './reviewSession.js';
import type { ReviewCard } from './reviewCardFactory.js';
import { CardType } from './reviewCardFactory.js';

const card = (term: string): ReviewCard =>
  ({
    itemId: term,
    term,
    languageId: 'grc',
    type: CardType.FORM_TO_MEANING,
    status: 'LEARNING',
    srs: { interval: 1, ease: 2.5, step: 1, lastReviewed: null, nextReview: '2026-01-01T00:00:00Z' },
  }) as unknown as ReviewCard;

const baseSession = {
  languageId: 'grc',
  queue: [card('λύω'), card('λόγος'), card('θεός')],
  currentCardIndex: 1,
  sessionResults: [{ lemma: 'λύω', rating: 'GOOD' as const, responseMs: 1200 }],
};

describe('reviewSession persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips a written session', () => {
    writeSavedSession(baseSession, 1000);
    const restored = readSavedSession('grc', 1000);
    expect(restored).not.toBeNull();
    expect(restored?.currentCardIndex).toBe(1);
    expect(restored?.queue).toHaveLength(3);
    expect(restored?.sessionResults[0].lemma).toBe('λύω');
    expect(restored?.v).toBe(1);
  });

  it('returns null when there is no snapshot', () => {
    expect(readSavedSession('grc')).toBeNull();
  });

  it('ignores a snapshot for a different language', () => {
    writeSavedSession(baseSession, 1000);
    expect(readSavedSession('lat', 1000)).toBeNull();
  });

  it('discards a snapshot older than the max age', () => {
    writeSavedSession(baseSession, 1000);
    expect(readSavedSession('grc', 1000 + SESSION_MAX_AGE_MS + 1)).toBeNull();
  });

  it('returns null once the index reaches the end of the queue', () => {
    writeSavedSession({ ...baseSession, currentCardIndex: 3 }, 1000);
    expect(readSavedSession('grc', 1000)).toBeNull();
  });

  it('returns null for an empty queue', () => {
    writeSavedSession({ ...baseSession, queue: [], currentCardIndex: 0 }, 1000);
    expect(readSavedSession('grc', 1000)).toBeNull();
  });

  it('returns null for a malformed payload', () => {
    sessionStorage.setItem(SESSION_KEY, '{not valid json');
    expect(readSavedSession('grc')).toBeNull();
  });

  it('clears a saved session', () => {
    writeSavedSession(baseSession, 1000);
    clearSavedSession();
    expect(readSavedSession('grc', 1000)).toBeNull();
  });
});
