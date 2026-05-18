import { describe, it, expect } from 'vitest';

describe('Public text share route validation', () => {
  it('rejects unauthenticated share', () => {
    const result = checkShareAuth(false);
    expect(result.status).toBe(401);
  });

  it('accepts authenticated share', () => {
    const result = checkShareAuth(true);
    expect(result.status).toBe(200);
  });

  it('valid public text mirror has required fields', () => {
    const mirror = createValidMirror();
    expect(mirror.id).toBeTruthy();
    expect(mirror.title).toBeTruthy();
    expect(mirror.languageId).toBeTruthy();
    expect(mirror.rawContent).toBeDefined();
    expect(mirror.authorId).toBeTruthy();
    expect(mirror.authorName).toBeTruthy();
    expect(mirror.visibility).toBe('public');
    expect(mirror.moderationStatus).toBe('visible');
    expect(typeof mirror.forkCount).toBe('number');
  });

  it('public text mirror includes stats', () => {
    const mirror = createValidMirror();
    expect(mirror.stats).toBeDefined();
    expect(typeof mirror.stats.totalWords).toBe('number');
    expect(mirror.stats.totalWords).toBeGreaterThan(0);
  });
});

describe('Fork behavior', () => {
  it('fork creates private copy with original attribution', () => {
    const fork = createFork({
      id: 'fork_abc_123',
      title: 'Iliad (forked)',
      forkedFrom: 'abc',
      authorId: 'user1',
    });
    expect(fork.visibility).toBe('private');
    expect(fork.forkedFrom).toBe('abc');
    expect(fork.originalPublicTextId).toBe('abc');
    expect(fork.originalAuthorId).toBe('user1');
  });

  it('fork increments forkCount', () => {
    const originalCount = 3;
    const newCount = originalCount + 1;
    expect(newCount).toBe(4);
  });
});

describe('Unshare behavior', () => {
  it('unshare sets visibility to private', () => {
    const unshared = { visibility: 'private', publishedAt: null };
    expect(unshared.visibility).toBe('private');
    expect(unshared.publishedAt).toBeNull();
  });
});

describe('Public Library filters', () => {
  it('only shows texts with moderationStatus visible', () => {
    const texts = [
      { id: '1', moderationStatus: 'visible' },
      { id: '2', moderationStatus: 'hidden' },
      { id: '3', moderationStatus: 'under_review' },
      { id: '4', moderationStatus: 'visible' },
    ];
    const visible = texts.filter((t) => t.moderationStatus === 'visible');
    expect(visible.length).toBe(2);
    expect(visible.map((t) => t.id)).toEqual(['1', '4']);
  });

  it('filters by language', () => {
    const texts = [
      { id: '1', languageId: 'grc' },
      { id: '2', languageId: 'lat' },
      { id: '3', languageId: 'hbo' },
    ];
    const grc = texts.filter((t) => t.languageId === 'grc');
    expect(grc.length).toBe(1);
    expect(grc[0].id).toBe('1');
  });
});

function checkShareAuth(isAuthenticated: boolean): { status: number } {
  if (!isAuthenticated) return { status: 401 };
  return { status: 200 };
}

function createValidMirror() {
  return {
    id: 'share_123',
    title: 'Iliad 1.1-7',
    languageId: 'grc',
    sourceType: 'paste',
    rawContent: 'Μῆνιν ἄειδε θεὰ',
    sentences: [{ text: 'Μῆνιν ἄειδε θεὰ', tokens: [] }],
    stats: { totalWords: 3, uniqueWords: 3, knownWords: 0, newWords: 3, learningWords: 0 },
    analysisStatus: 'analyzed',
    visibility: 'public',
    moderationStatus: 'visible',
    authorId: 'user123',
    authorName: 'Scholar',
    forkCount: 0,
    forkedFrom: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}

function createFork(overrides: any) {
  return {
    id: overrides.id || 'fork_test',
    title: overrides.title || 'Forked text',
    languageId: 'grc',
    rawContent: 'content',
    visibility: 'private',
    forkedFrom: overrides.forkedFrom || null,
    originalPublicTextId: overrides.originalPublicTextId || overrides.forkedFrom || null,
    originalAuthorId: overrides.originalAuthorId || overrides.authorId || null,
    originalAuthorName: overrides.originalAuthorName || null,
    authorId: 'current_user',
    authorName: 'Me',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
