/**
 * Firestore security rules tests.
 *
 * Requires the Firestore emulator to be running on localhost:8080.
 * Run via: npm run test:firestore-rules
 * (which starts the emulator automatically via firebase emulators:exec)
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, afterAll, afterEach, describe, it } from 'vitest';

const RULES = readFileSync(resolve(import.meta.dirname, '../../firestore.rules'), 'utf8');
const PROJECT_ID = 'paleoglossa-test';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: RULES,
      host: 'localhost',
      port: 8080,
    },
  });
}, 30_000);

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function aliceDb() {
  return testEnv.authenticatedContext('alice').firestore();
}

function bobDb() {
  return testEnv.authenticatedContext('bob').firestore();
}

function anonDb() {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedDoc(path: string, data: object) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const parts = path.split('/');
    const ref = doc(ctx.firestore(), parts[0], ...parts.slice(1));
    await setDoc(ref, data);
  });
}

// ── Fixture data ──────────────────────────────────────────────────────────────

const VALID_PROFILE = {
  email: 'alice@example.com',
  displayName: 'Alice',
  createdAt: new Date().toISOString(),
  stats: {},
};

const VALID_VOCAB = {
  term: 'λόγος',
  normalizedTerm: 'λόγος',
  status: 'KNOWN',
  languageId: 'grc',
};

const VALID_IMPORT = {
  title: 'My Text',
  languageId: 'grc',
  sourceType: 'paste',
  visibility: 'private',
};

const VALID_REVIEW_LOG = {
  vocabItemId: 'term1',
  rating: 'GOOD',
  timestamp: new Date().toISOString(),
};

// ── User Profile ──────────────────────────────────────────────────────────────

describe('users/{userId} profile', () => {
  it('owner can create their profile with required fields', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users/alice'), VALID_PROFILE));
  });

  it('owner can read their own profile', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice')));
  });

  it('owner can update non-server-controlled fields', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice'), { displayName: 'Alice B.' })
    );
  });

  it('owner cannot set server-controlled fields on create', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice'), { ...VALID_PROFILE, currentPlan: 'premium' })
    );
  });

  it('owner cannot update subscriptionStatus', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertFails(
      updateDoc(doc(aliceDb(), 'users/alice'), { subscriptionStatus: 'active' })
    );
  });

  it('owner cannot update currentPlan', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertFails(
      updateDoc(doc(aliceDb(), 'users/alice'), { currentPlan: 'premium' })
    );
  });

  it('owner cannot update stripeCustomerId', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertFails(
      updateDoc(doc(aliceDb(), 'users/alice'), { stripeCustomerId: 'cus_fake' })
    );
  });

  it('user B cannot read user A private profile', async () => {
    await seedDoc('users/alice', { ...VALID_PROFILE, isPublic: false });
    await assertFails(getDoc(doc(bobDb(), 'users/alice')));
  });

  it('user B can read a public profile', async () => {
    await seedDoc('users/alice', { ...VALID_PROFILE, isPublic: true });
    await assertSucceeds(getDoc(doc(bobDb(), 'users/alice')));
  });

  it('user B cannot write to user A profile', async () => {
    await assertFails(setDoc(doc(bobDb(), 'users/alice'), VALID_PROFILE));
  });

  it('unauthenticated user cannot read any profile', async () => {
    await seedDoc('users/alice', VALID_PROFILE);
    await assertFails(getDoc(doc(anonDb(), 'users/alice')));
  });

  it('unauthenticated user cannot write any profile', async () => {
    await assertFails(setDoc(doc(anonDb(), 'users/alice'), VALID_PROFILE));
  });
});

// ── Vocabulary ────────────────────────────────────────────────────────────────

describe('users/{userId}/vocabulary/{termId}', () => {
  it('owner can create a valid vocabulary entry', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), 'users/alice/vocabulary/term1'), VALID_VOCAB)
    );
  });

  it('owner can read a vocabulary entry', async () => {
    await seedDoc('users/alice/vocabulary/term1', VALID_VOCAB);
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/vocabulary/term1')));
  });

  it('owner can list their vocabulary collection', async () => {
    await assertSucceeds(getDocs(collection(aliceDb(), 'users/alice/vocabulary')));
  });

  it('owner can update a vocabulary entry', async () => {
    await seedDoc('users/alice/vocabulary/term1', VALID_VOCAB);
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/vocabulary/term1'), { status: 'SEEN' })
    );
  });

  it('owner can delete a vocabulary entry', async () => {
    await seedDoc('users/alice/vocabulary/term1', VALID_VOCAB);
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/vocabulary/term1')));
  });

  it('rejects invalid status value', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice/vocabulary/term1'), {
        ...VALID_VOCAB,
        status: 'INVALID',
      })
    );
  });

  it('user B cannot read user A vocabulary', async () => {
    await seedDoc('users/alice/vocabulary/term1', VALID_VOCAB);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/vocabulary/term1')));
  });

  it('user B cannot write to user A vocabulary', async () => {
    await assertFails(
      setDoc(doc(bobDb(), 'users/alice/vocabulary/term1'), VALID_VOCAB)
    );
  });

  it('unauthenticated cannot read vocabulary', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/vocabulary/term1')));
  });

  it('unauthenticated cannot write vocabulary', async () => {
    await assertFails(
      setDoc(doc(anonDb(), 'users/alice/vocabulary/term1'), VALID_VOCAB)
    );
  });
});

// ── Imports ───────────────────────────────────────────────────────────────────

describe('users/{userId}/imports/{importId}', () => {
  it('owner can create a valid import', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), 'users/alice/imports/import1'), VALID_IMPORT)
    );
  });

  it('owner can read and list their imports', async () => {
    await seedDoc('users/alice/imports/import1', VALID_IMPORT);
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/imports/import1')));
    await assertSucceeds(getDocs(collection(aliceDb(), 'users/alice/imports')));
  });

  it('owner can update an import', async () => {
    await seedDoc('users/alice/imports/import1', VALID_IMPORT);
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/imports/import1'), {
        title: 'Updated Title',
        languageId: 'grc',
        sourceType: 'paste',
        visibility: 'private',
      })
    );
  });

  it('owner can delete an import', async () => {
    await seedDoc('users/alice/imports/import1', VALID_IMPORT);
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/imports/import1')));
  });

  it('rejects missing required fields', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice/imports/import1'), { title: 'Test only' })
    );
  });

  it('rejects invalid sourceType', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice/imports/import1'), {
        ...VALID_IMPORT,
        sourceType: 'unknown',
      })
    );
  });

  it('rejects invalid visibility', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice/imports/import1'), {
        ...VALID_IMPORT,
        visibility: 'secret',
      })
    );
  });

  it('user B cannot read user A imports', async () => {
    await seedDoc('users/alice/imports/import1', VALID_IMPORT);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/imports/import1')));
  });

  it('user B cannot write to user A imports', async () => {
    await assertFails(
      setDoc(doc(bobDb(), 'users/alice/imports/import1'), VALID_IMPORT)
    );
  });

  it('unauthenticated cannot access imports', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/imports/import1')));
    await assertFails(
      setDoc(doc(anonDb(), 'users/alice/imports/import1'), VALID_IMPORT)
    );
  });
});

// ── Reading Progress ──────────────────────────────────────────────────────────

describe('users/{userId}/readingProgress/{textId}', () => {
  const PROGRESS = {
    textId: 'text1',
    lastPosition: 42,
    completed: false,
    lastReadAt: new Date().toISOString(),
  };

  it('owner can create and read reading progress', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), 'users/alice/readingProgress/text1'), PROGRESS)
    );
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/readingProgress/text1')));
  });

  it('owner can update reading progress', async () => {
    await seedDoc('users/alice/readingProgress/text1', PROGRESS);
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/readingProgress/text1'), { lastPosition: 100 })
    );
  });

  it('owner can delete reading progress', async () => {
    await seedDoc('users/alice/readingProgress/text1', PROGRESS);
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/readingProgress/text1')));
  });

  it('user B cannot read user A reading progress', async () => {
    await seedDoc('users/alice/readingProgress/text1', PROGRESS);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/readingProgress/text1')));
  });

  it('user B cannot write to user A reading progress', async () => {
    await assertFails(
      setDoc(doc(bobDb(), 'users/alice/readingProgress/text1'), PROGRESS)
    );
  });

  it('unauthenticated cannot access reading progress', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/readingProgress/text1')));
  });
});

// ── Language Stats ────────────────────────────────────────────────────────────

describe('users/{userId}/languageStats/{languageId}', () => {
  const STATS = { totalKnown: 50, streak: 5 };

  it('owner can CRUD language stats', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users/alice/languageStats/grc'), STATS));
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/languageStats/grc')));
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/languageStats/grc'), { streak: 6 })
    );
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/languageStats/grc')));
  });

  it('user B cannot read user A language stats', async () => {
    await seedDoc('users/alice/languageStats/grc', STATS);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/languageStats/grc')));
  });

  it('user B cannot write to user A language stats', async () => {
    await assertFails(setDoc(doc(bobDb(), 'users/alice/languageStats/grc'), STATS));
  });

  it('unauthenticated cannot access language stats', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/languageStats/grc')));
  });
});

// ── Notes ─────────────────────────────────────────────────────────────────────

describe('users/{userId}/notes/{noteId}', () => {
  const NOTE = { content: 'My note', createdAt: new Date().toISOString() };

  it('owner can CRUD notes', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users/alice/notes/note1'), NOTE));
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/notes/note1')));
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/notes/note1'), { content: 'Updated' })
    );
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/notes/note1')));
  });

  it('user B cannot read user A notes', async () => {
    await seedDoc('users/alice/notes/note1', NOTE);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/notes/note1')));
  });

  it('user B cannot write to user A notes', async () => {
    await assertFails(setDoc(doc(bobDb(), 'users/alice/notes/note1'), NOTE));
  });

  it('unauthenticated cannot access notes', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/notes/note1')));
  });
});

// ── Notebooks ─────────────────────────────────────────────────────────────────

describe('users/{userId}/notebooks/{notebookId}', () => {
  const NOTEBOOK = { title: 'My Notebook', createdAt: new Date().toISOString() };

  it('owner can CRUD notebooks', async () => {
    await assertSucceeds(setDoc(doc(aliceDb(), 'users/alice/notebooks/nb1'), NOTEBOOK));
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/notebooks/nb1')));
    await assertSucceeds(
      updateDoc(doc(aliceDb(), 'users/alice/notebooks/nb1'), { title: 'Updated' })
    );
    await assertSucceeds(deleteDoc(doc(aliceDb(), 'users/alice/notebooks/nb1')));
  });

  it('user B cannot read user A notebooks', async () => {
    await seedDoc('users/alice/notebooks/nb1', NOTEBOOK);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/notebooks/nb1')));
  });

  it('user B cannot write to user A notebooks', async () => {
    await assertFails(setDoc(doc(bobDb(), 'users/alice/notebooks/nb1'), NOTEBOOK));
  });

  it('unauthenticated cannot access notebooks', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/notebooks/nb1')));
  });
});

// ── Review Logs (append-only) ─────────────────────────────────────────────────

describe('users/{userId}/reviewLogs/{logId}', () => {
  it('owner can create a review log with required fields', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), 'users/alice/reviewLogs/log1'), VALID_REVIEW_LOG)
    );
  });

  it('owner can read their review logs', async () => {
    await seedDoc('users/alice/reviewLogs/log1', VALID_REVIEW_LOG);
    await assertSucceeds(getDoc(doc(aliceDb(), 'users/alice/reviewLogs/log1')));
    await assertSucceeds(getDocs(collection(aliceDb(), 'users/alice/reviewLogs')));
  });

  it('rejects review log missing required fields', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'users/alice/reviewLogs/log1'), { rating: 'GOOD' })
    );
  });

  it('client cannot update a review log (append-only)', async () => {
    await seedDoc('users/alice/reviewLogs/log1', VALID_REVIEW_LOG);
    await assertFails(
      updateDoc(doc(aliceDb(), 'users/alice/reviewLogs/log1'), { rating: 'EASY' })
    );
  });

  it('client cannot delete a review log (append-only)', async () => {
    await seedDoc('users/alice/reviewLogs/log1', VALID_REVIEW_LOG);
    await assertFails(deleteDoc(doc(aliceDb(), 'users/alice/reviewLogs/log1')));
  });

  it('user B cannot read user A review logs', async () => {
    await seedDoc('users/alice/reviewLogs/log1', VALID_REVIEW_LOG);
    await assertFails(getDoc(doc(bobDb(), 'users/alice/reviewLogs/log1')));
  });

  it('user B cannot write to user A review logs', async () => {
    await assertFails(
      setDoc(doc(bobDb(), 'users/alice/reviewLogs/log1'), VALID_REVIEW_LOG)
    );
  });

  it('unauthenticated cannot access review logs', async () => {
    await assertFails(getDoc(doc(anonDb(), 'users/alice/reviewLogs/log1')));
  });
});

// ── publicTexts ───────────────────────────────────────────────────────────────

describe('publicTexts/{textId}', () => {
  it('anyone (including unauthenticated) can read a public text', async () => {
    await seedDoc('publicTexts/text1', { title: 'Iliad', visibility: 'public' });
    await assertSucceeds(getDoc(doc(anonDb(), 'publicTexts/text1')));
    await assertSucceeds(getDoc(doc(aliceDb(), 'publicTexts/text1')));
  });

  it('cannot read a non-public text', async () => {
    await seedDoc('publicTexts/text2', { title: 'Draft', visibility: 'private' });
    await assertFails(getDoc(doc(anonDb(), 'publicTexts/text2')));
    await assertFails(getDoc(doc(aliceDb(), 'publicTexts/text2')));
  });

  it('authenticated users cannot write publicTexts', async () => {
    await assertFails(
      setDoc(doc(aliceDb(), 'publicTexts/text3'), {
        title: 'Injected',
        visibility: 'public',
      })
    );
  });

  it('unauthenticated users cannot write publicTexts', async () => {
    await assertFails(
      setDoc(doc(anonDb(), 'publicTexts/text4'), {
        title: 'Injected',
        visibility: 'public',
      })
    );
  });

  it('authenticated users cannot update publicTexts', async () => {
    await seedDoc('publicTexts/text5', { title: 'Real', visibility: 'public' });
    await assertFails(
      updateDoc(doc(aliceDb(), 'publicTexts/text5'), { title: 'Tampered' })
    );
  });
});
