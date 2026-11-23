import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── In-memory Firestore ──────────────────────────────────────────────────────
const store = new Map<string, Record<string, any>>();
let commits = 0;
let failNextCommit = false;

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('../../hooks/useBeginnerProgress.js', () => ({ recordMilestone: vi.fn() }));
vi.mock('../../sync/syncStatus.js', () => ({
  markPendingWrite: vi.fn(),
  markWriteSuccess: vi.fn(),
  markWriteFailure: vi.fn(),
}));
vi.mock('../../errors/persistenceReporter.js', () => ({ reportPersistenceError: vi.fn() }));

vi.mock('../firestorePaging.js', () => ({
  getDocsPaged: vi.fn(async (ref: { path: string }) => {
    const docs = [...store.entries()]
      .filter(([path]) => path.startsWith(`${ref.path}/`))
      .map(([path, data]) => ({ id: path.slice(ref.path.length + 1), data: () => data }));
    return { forEach: (fn: (d: any) => void) => docs.forEach(fn) };
  }),
}));

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, path: string, id: string) => ({ path: `${path}/${id}`, id }),
  collection: (_db: unknown, path: string) => ({ path }),
  Timestamp: class Timestamp {},
  serverTimestamp: () => 'SERVER_TS',
  increment: (n: number) => ({ _increment: n }),
  arrayUnion: (...items: unknown[]) => ({ _arrayUnion: items }),
  writeBatch: () => {
    const ops: Array<() => void> = [];
    return {
      set: (ref: { path: string }, data: any, opts?: { merge?: boolean }) =>
        ops.push(() =>
          store.set(ref.path, opts?.merge ? { ...store.get(ref.path), ...data } : { ...data })
        ),
      update: (ref: { path: string }, data: any) =>
        ops.push(() => store.set(ref.path, { ...store.get(ref.path), ...data })),
      delete: (ref: { path: string }) => ops.push(() => store.delete(ref.path)),
      commit: async () => {
        if (failNextCommit) {
          failNextCommit = false;
          throw new Error('unavailable');
        }
        commits++;
        ops.forEach((op) => op()); // atomic: all or nothing
      },
    };
  },
}));

import { VocabularyService, planIdentityRepair } from '../vocabularyService.js';
import { WordState } from '../../constants/wordStates.js';
import { legacyVocabDocId, vocabDocId, vocabKey } from '../../vocabulary/identity.js';
import { STORAGE_KEYS } from '../../constants/storage.js';

let uidCounter = 0;
let uid = '';
const path = (id: string) => `users/${uid}/vocabulary/${id}`;
const seed = (id: string, data: Record<string, any>) => store.set(path(id), data);
const stored = () =>
  [...store.entries()]
    .filter(([p]) => p.startsWith(`users/${uid}/vocabulary/`))
    .map(([p, data]) => ({ id: p.split('/').pop()!, data }));

const vocabDoc = (lemma: string, languageId: string, extra: Record<string, any> = {}) => ({
  term: lemma,
  lemma,
  languageId,
  status: 'KNOWN',
  encounterCount: 1,
  ...extra,
});

async function loadAndRepair() {
  const map = await VocabularyService.getVocabulary(uid);
  const moved = await VocabularyService.repairVocabularyIdentity(uid);
  return { map, moved };
}

beforeEach(() => {
  store.clear();
  localStorage.clear();
  commits = 0;
  failNextCommit = false;
  uid = `user-${++uidCounter}`; // fresh uid sidesteps the module-level read cache
});

describe('getVocabulary — language-scoped identity', () => {
  it('keeps one spelling in two languages as two entries with their own state', async () => {
    seed(legacyVocabDocId('λόγος', 'grc'), vocabDoc('λόγος', 'grc', { status: 'KNOWN' }));
    seed(
      legacyVocabDocId('λόγος', 'grc-koine'),
      vocabDoc('λόγος', 'grc-koine', { status: 'LEARNING' })
    );
    seed(legacyVocabDocId('מֶלֶךְ', 'hbo'), vocabDoc('מֶלֶךְ', 'hbo', { status: 'KNOWN' }));
    seed(legacyVocabDocId('מֶלֶךְ', 'arc'), vocabDoc('מֶלֶךְ', 'arc', { status: 'SEEN' }));

    const { map, moved } = await loadAndRepair();

    expect(map[vocabKey('λόγος', 'grc')].state).toBe(WordState.KNOWN);
    expect(map[vocabKey('λόγος', 'grc-koine')].state).toBe(WordState.LEARNING);
    expect(map[vocabKey('מֶלֶךְ', 'hbo')].state).toBe(WordState.KNOWN);
    expect(map[vocabKey('מֶלֶךְ', 'arc')].state).toBe(WordState.SEEN);
    expect(Object.keys(map)).toHaveLength(4);
    // Per-language statistics count each language's own entry.
    const koine = Object.values(map).filter((i) => i.languageId === 'grc-koine');
    expect(koine).toHaveLength(1);
    expect(map[vocabKey('λόγος', 'grc')].lemma).toBe('λόγος');
    // Nothing was misplaced, so nothing was written.
    expect(moved).toBe(0);
    expect(commits).toBe(0);
  });

  it('skips documents with no lemma instead of failing the whole load', async () => {
    seed('broken', { status: 'KNOWN', languageId: 'lat' });
    seed(legacyVocabDocId('amo', 'lat'), vocabDoc('amo', 'lat'));
    const { map } = await loadAndRepair();
    expect(Object.keys(map)).toEqual([vocabKey('amo', 'lat')]);
    expect(stored().map((d) => d.id)).toContain('broken');
  });
});

describe('getVocabulary — review schedule', () => {
  it('gives a never-scheduled word no SRS record, and keeps a real schedule intact', async () => {
    seed(vocabDocId('λόγος', 'grc'), vocabDoc('λόγος', 'grc', { status: 'SEEN' }));
    seed(
      vocabDocId('θεός', 'grc'),
      vocabDoc('θεός', 'grc', {
        status: 'LEARNING',
        nextReview: '2026-12-01T00:00:00.000Z',
        lastSeenAt: '2026-11-20T00:00:00.000Z',
        interval: 3,
      })
    );

    const map = await VocabularyService.getVocabulary(uid);

    expect(map[vocabKey('λόγος', 'grc')].srs).toBeUndefined();
    expect(map[vocabKey('λόγος', 'grc')].lastSeenAt).toBeUndefined();
    expect(map[vocabKey('θεός', 'grc')].srs?.nextReview).toBe('2026-12-01T00:00:00.000Z');
    expect(map[vocabKey('θεός', 'grc')].srs?.interval).toBe(3);
    expect(map[vocabKey('θεός', 'grc')].lastSeenAt).toBe('2026-11-20T00:00:00.000Z');
  });
});

describe('repairVocabularyIdentity', () => {
  it('moves a document stored under a truncated ID and keeps its review schedule', async () => {
    const sentence = 'καὶ εἶπεν αὐτοῖς ὁ Ἰησοῦς Δεῦτε ὀπίσω μου';
    const legacyId = legacyVocabDocId(sentence, 'grc-koine');
    seed(
      legacyId,
      vocabDoc(sentence, 'grc-koine', {
        status: 'LEARNING',
        nextReview: '2026-12-01T00:00:00.000Z',
        interval: 4,
        fsrsStability: 3.2,
        userGloss: 'And Jesus said to them…',
      })
    );

    const { map, moved } = await loadAndRepair();
    expect(moved).toBe(1);

    const docs = stored();
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe(vocabDocId(sentence, 'grc-koine'));
    expect(docs[0].id).not.toBe(legacyId);
    expect(docs[0].data).toMatchObject({
      status: 'LEARNING',
      nextReview: '2026-12-01T00:00:00.000Z',
      interval: 4,
      fsrsStability: 3.2,
      userGloss: 'And Jesus said to them…',
      languageId: 'grc-koine',
    });
    expect(map[vocabKey(sentence, 'grc-koine')].state).toBe(WordState.LEARNING);
  });

  it('is idempotent: a second pass reads the repaired layout and writes nothing', async () => {
    seed(legacyVocabDocId('vir', 'lat'), vocabDoc('vir', 'lat'));
    seed(legacyVocabDocId('ḥr', 'egy'), vocabDoc('ḥr', 'egy'));
    seed(legacyVocabDocId('בְּרֵאשִׁ֖ית', 'hbo'), vocabDoc('בְּרֵאשִׁ֖ית', 'hbo'));

    expect((await loadAndRepair()).moved).toBe(3);
    const afterFirst = JSON.stringify(stored());
    const commitsAfterFirst = commits;

    VocabularyService.incrementEncounter(uid, 'amo', 'lat'); // busts the read cache
    await VocabularyService.flushPendingWrites();
    store.delete(path(vocabDocId('amo', 'lat')));

    const second = await loadAndRepair();
    expect(second.moved).toBe(0);
    expect(commits).toBe(commitsAfterFirst + 1); // only the cache-busting write
    expect(JSON.stringify(stored())).toBe(afterFirst);
  });

  it('merges spelling variants of one Latin lemma: best state wins, encounters add up', async () => {
    seed(
      legacyVocabDocId('iam', 'lat'),
      vocabDoc('iam', 'lat', { status: 'LEARNING', encounterCount: 3, contexts: ['iam satis'] })
    );
    seed(
      legacyVocabDocId('jam', 'lat'),
      vocabDoc('jam', 'lat', {
        status: 'KNOWN',
        encounterCount: 2,
        nextReview: '2027-01-01T00:00:00.000Z',
        contexts: ['jam vero'],
        notes: 'adverb',
      })
    );

    const { map } = await loadAndRepair();
    const docs = stored();
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe(vocabDocId('iam', 'lat'));
    expect(docs[0].data).toMatchObject({
      status: 'KNOWN',
      encounterCount: 5,
      nextReview: '2027-01-01T00:00:00.000Z',
      notes: 'adverb',
    });
    expect(docs[0].data.contexts).toEqual(['iam satis', 'jam vero']);
    // The in-memory map agreed before the repair ran.
    expect(map[vocabKey('iam', 'lat')]).toMatchObject({
      state: WordState.KNOWN,
      encounterCount: 5,
    });
  });

  it('separates Egyptian consonants the old key merged', async () => {
    // Both were written to the document for "hr"; only the last write survived
    // there, so there is one document to place — under its real identity.
    seed(legacyVocabDocId('ḥr', 'egy'), vocabDoc('ḥr', 'egy'));
    await loadAndRepair();
    const docs = stored();
    expect(docs.map((d) => d.id)).toEqual([vocabDocId('ḥr', 'egy')]);
    expect(vocabDocId('ḥr', 'egy')).not.toBe(vocabDocId('ẖr', 'egy'));
  });

  it('never deletes a document that another identity is being moved into', async () => {
    // Document at A's ID holds B's lemma (the truncation collision), while a
    // second document resolves to A.
    const a = 'ταπεινοφροσύνη';
    const b = 'ταπεινοφροσύνης';
    const sharedLegacyId = legacyVocabDocId(a, 'grc-koine');
    seed(sharedLegacyId, vocabDoc(b, 'grc-koine', { status: 'KNOWN' }));
    seed('inflected-form-key', vocabDoc(a, 'grc-koine', { status: 'LEARNING' }));

    const { moved } = await loadAndRepair();
    expect(moved).toBe(2);
    const byId = Object.fromEntries(stored().map((d) => [d.id, d.data]));
    expect(Object.keys(byId).sort()).toEqual(
      [vocabDocId(a, 'grc-koine'), vocabDocId(b, 'grc-koine')].sort()
    );
    expect(byId[vocabDocId(a, 'grc-koine')].status).toBe('LEARNING');
    expect(byId[vocabDocId(b, 'grc-koine')].status).toBe('KNOWN');
  });

  it('leaves storage untouched when the commit fails, and succeeds on the next load', async () => {
    seed(legacyVocabDocId('vir', 'lat'), vocabDoc('vir', 'lat'));
    const before = JSON.stringify(stored());

    await VocabularyService.getVocabulary(uid);
    failNextCommit = true;
    await expect(VocabularyService.repairVocabularyIdentity(uid)).rejects.toThrow();
    expect(JSON.stringify(stored())).toBe(before);

    VocabularyService.incrementEncounter(uid, 'amo', 'lat'); // bust the read cache
    await VocabularyService.flushPendingWrites();
    expect((await loadAndRepair()).moved).toBe(1);
    expect(stored().map((d) => d.id)).toContain(vocabDocId('vir', 'lat'));
  });

  it('writes payloads the security rules accept (valid status, identifying fields)', () => {
    const plan = planIdentityRepair([
      { id: 'old', data: { term: 'vir', languageId: 'lat', status: 'Seen Once' } },
    ]);
    expect(plan[0].data.status).toBe('SEEN');
    expect(plan[0].data).toMatchObject({ term: 'vir', lemma: 'vir', normalizedTerm: 'uir' });
  });
});

describe('writes use the same identity as reads', () => {
  it('stores Hebrew and Aramaic homographs in separate documents', async () => {
    await VocabularyService.setWordState(uid, 'מֶלֶךְ', WordState.KNOWN, 'hbo');
    await VocabularyService.setWordState(uid, 'מֶלֶךְ', WordState.LEARNING, 'arc');
    await VocabularyService.flushPendingWrites();
    const docs = stored();
    expect(docs).toHaveLength(2);
    const { map, moved } = await loadAndRepair();
    expect(moved).toBe(0);
    expect(map[vocabKey('מֶלֶךְ', 'hbo')].state).toBe(WordState.KNOWN);
    expect(map[vocabKey('מֶלֶךְ', 'arc')].state).toBe(WordState.LEARNING);
  });
});

describe('un-lemmatized tokens', () => {
  it('refuses an empty lemma, which would be one entry shared by every such word', async () => {
    await VocabularyService.setWordState(uid, '', WordState.LEARNING, 'grc');
    VocabularyService.incrementEncounter(uid, '  ', 'grc');
    await VocabularyService.flushPendingWrites();
    expect(stored()).toHaveLength(0);

    await VocabularyService.setWordState(null, '', WordState.LEARNING, 'grc');
    expect(await VocabularyService.getVocabulary(null)).toEqual({});
  });

  it('ignores an empty-lemma entry left behind by an older build', async () => {
    seed(legacyVocabDocId('', 'grc'), vocabDoc('', 'grc', { status: 'LEARNING' }));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify({ '': { state: 'LEARNING' } }));
    expect((await loadAndRepair()).map).toEqual({});
    expect(await VocabularyService.getVocabulary(null)).toEqual({});
  });
});

describe('guest vocabulary (localStorage)', () => {
  it('re-keys entries written by older builds without losing them', async () => {
    localStorage.setItem(
      STORAGE_KEYS.KNOWLEDGE,
      JSON.stringify({
        λόγος: { state: 'KNOWN', languageId: 'grc-koine', addedAt: '2026-01-01T00:00:00.000Z' },
        amo: 'LEARNING',
        vir: 3,
      })
    );
    const map = await VocabularyService.getVocabulary(null);
    expect(map[vocabKey('λόγος', 'grc-koine')]).toMatchObject({ state: 'KNOWN', lemma: 'λόγος' });
    expect(map[vocabKey('amo', 'unknown')].state).toBe(WordState.LEARNING);
    expect(map[vocabKey('vir', 'unknown')].state).toBe(WordState.KNOWN);
  });

  it('keeps the same word in two languages apart, and survives repeated reads', async () => {
    await VocabularyService.setWordState(null, 'מֶלֶךְ', WordState.KNOWN, 'hbo');
    await VocabularyService.setWordState(null, 'מֶלֶךְ', WordState.LEARNING, 'arc');
    await VocabularyService.setWordNote(null, 'מֶלֶךְ', 'king', 'arc');
    await VocabularyService.updateGloss(null, 'מֶלֶךְ', 'a king', 'hbo');

    const first = await VocabularyService.getVocabulary(null);
    const second = await VocabularyService.getVocabulary(null);
    expect(second).toEqual(first);
    expect(first[vocabKey('מֶלֶךְ', 'hbo')]).toMatchObject({ state: 'KNOWN', userGloss: 'a king' });
    expect(first[vocabKey('מֶלֶךְ', 'arc')]).toMatchObject({ state: 'LEARNING', notes: 'king' });
  });

  it('carries each language to its own document when the guest signs in', async () => {
    await VocabularyService.setWordState(null, 'λόγος', WordState.KNOWN, 'grc');
    await VocabularyService.setWordState(null, 'λόγος', WordState.LEARNING, 'grc-koine');
    expect(await VocabularyService.migrateLocalStorage(uid)).toBe(2);
    const byId = Object.fromEntries(stored().map((d) => [d.id, d.data]));
    expect(byId[vocabDocId('λόγος', 'grc')]).toMatchObject({ status: 'KNOWN', lemma: 'λόγος' });
    expect(byId[vocabDocId('λόγος', 'grc-koine')]).toMatchObject({ status: 'LEARNING' });
    expect(localStorage.getItem(STORAGE_KEYS.KNOWLEDGE)).toBeNull();
  });
});
