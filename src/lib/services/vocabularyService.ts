import { db } from '../firebase.js';
import {
  doc,
  collection,
  getDocs,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { WordState, normalizeWordState } from '../constants/wordStates.js';
import { recordMilestone } from '../hooks/useBeginnerProgress.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { SRSData } from '../../types/firestore.js';
import { normalizeTimestamp } from '../utils.js';
import { normalizeLemmaKey } from '../utils/lemmaUtils.js';
import { markPendingWrite, markWriteSuccess, markWriteFailure } from '../sync/syncStatus.js';
import { reportPersistenceError } from '../errors/persistenceReporter.js';
import { classifyFirestoreError } from '../errors/firestoreErrors.js';
import { ReadingContext, READING_CONTEXT_FIELDS } from '../review/readingContext.js';

export type { SRSData };

export interface WordInfo {
  state: WordState;
  srs?: SRSData;
  notes?: string;
  userGloss?: string;
  contexts?: string[];
  addedAt: string;
  languageId?: string;
  encounterCount?: number;
  lastSeenAt?: string;
  surface?: string;
  morphology?: string;
  transliteration?: string;
  textId?: string;
  sentenceIndex?: number;
  sentenceTranslation?: string;
}

export type KnowledgeMap = Record<string, WordInfo>;

const STORAGE_KEY = STORAGE_KEYS.KNOWLEDGE;

const vocabCache = new Map<string, { data: KnowledgeMap; at: number }>();
const VOCAB_CACHE_TTL = 5 * 60_000;

function getTermId(term: string, languageId: string): string {
  const key = `${languageId}:${normalizeLemmaKey(term)}`;
  return btoa(encodeURIComponent(key)).replace(/[+/=]/g, '_').substring(0, 120);
}

// ── Write queue ──────────────────────────────────────────────────────────────

type QueueEntry = { docRef: any; payload: any; isNew: boolean };
type QueueListener = (pendingCount: number) => void;

const vocabWriteQueue = new Map<string, QueueEntry>();
let vocabWriteTimer: ReturnType<typeof setTimeout> | null = null;
// De-duplicate concurrent flush calls — callers share the same promise.
let flushInProgress: Promise<void> | null = null;
const queueListeners = new Set<QueueListener>();

// ── Retry/backoff for transient write failures ───────────────────────────────
// On a transient Firestore failure (offline, unavailable, aborted, rate-limit)
// the failed entries are re-queued and a flush is rescheduled with exponential
// backoff instead of being silently dropped. The local KnowledgeMap stays the
// UI source of truth meanwhile, and the lifecycle flushes (visibilitychange /
// pagehide) provide additional retry opportunities.
let vocabRetryTimer: ReturnType<typeof setTimeout> | null = null;
let vocabRetryAttempt = 0;
const VOCAB_MAX_RETRY_ATTEMPTS = 6;
const VOCAB_RETRY_BASE_MS = 1000;
const VOCAB_RETRY_MAX_MS = 60_000;

function notifyQueueListeners() {
  const count = vocabWriteQueue.size;
  queueListeners.forEach((fn) => fn(count));
}

/**
 * Re-insert entries that failed to commit back into the queue, merging with any
 * newer writes that arrived during the flush (newer writes win). Does not
 * re-count pending writes — these were already counted at enqueue time.
 */
function requeueFailedEntries(failed: [string, QueueEntry][]) {
  for (const [key, entry] of failed) {
    const current = vocabWriteQueue.get(key);
    if (current) {
      vocabWriteQueue.set(key, {
        docRef: current.docRef,
        payload: { ...entry.payload, ...current.payload },
        isNew: entry.isNew || current.isNew,
      });
    } else {
      vocabWriteQueue.set(key, entry);
    }
  }
  notifyQueueListeners();
}

function scheduleVocabRetry() {
  if (vocabRetryTimer) return; // a retry is already pending
  const delay = Math.min(VOCAB_RETRY_BASE_MS * 2 ** vocabRetryAttempt, VOCAB_RETRY_MAX_MS);
  vocabRetryTimer = setTimeout(() => {
    vocabRetryTimer = null;
    flushVocabWrites();
  }, delay);
}

/** Returns the number of term writes currently queued but not yet sent. */
export function getPendingVocabularyWriteCount(): number {
  return vocabWriteQueue.size;
}

/** True when there are writes in the queue that have not been flushed. */
export function hasPendingVocabularyWrites(): boolean {
  return vocabWriteQueue.size > 0;
}

/**
 * Subscribe to changes in the pending-write count.
 * The listener is called immediately with the current count, then on every
 * enqueue or flush.  Returns an unsubscribe function.
 */
export function subscribeToVocabularyQueueStatus(listener: QueueListener): () => void {
  queueListeners.add(listener);
  listener(vocabWriteQueue.size); // immediate snapshot
  return () => queueListeners.delete(listener);
}

/**
 * Commit every queued write to Firestore now, in 500-operation batches.
 * Concurrent calls share the same in-flight promise — safe to call from
 * multiple places simultaneously.
 */
const flushVocabWrites = (): Promise<void> => {
  if (flushInProgress) return flushInProgress;

  const run = async () => {
    if (vocabWriteQueue.size === 0) return;

    if (vocabWriteTimer) {
      clearTimeout(vocabWriteTimer);
      vocabWriteTimer = null;
    }

    const entries = Array.from(vocabWriteQueue.entries());
    vocabWriteQueue.clear();
    notifyQueueListeners();

    const chunkSize = 500;
    const retryable: [string, QueueEntry][] = [];
    let anySuccess = false;

    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const data of chunk.map((c) => c[1])) {
        if (data.isNew) {
          batch.set(data.docRef, data.payload, { merge: true });
        } else {
          batch.update(data.docRef, data.payload);
        }
      }

      try {
        await batch.commit();
        anySuccess = true;
        markWriteSuccess();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const { retryable: isRetryable } = classifyFirestoreError(e);
        console.error('Failed to commit vocabulary batch', e, 'code:', (e as any)?.code);
        markWriteFailure(msg);
        // Re-queue transient failures (offline/unavailable/aborted/rate-limit)
        // for backoff retry; drop terminal ones (e.g. permission-denied) since
        // retrying cannot succeed. The local KnowledgeMap remains intact either way.
        if (isRetryable && vocabRetryAttempt < VOCAB_MAX_RETRY_ATTEMPTS) {
          retryable.push(...chunk);
        } else {
          reportPersistenceError(e, {
            operation: 'vocabulary:flushBatch',
            path: `users/{userId}/vocabulary/batch-${i}`,
            category: 'vocabulary',
            dataPreservedLocally: true,
          });
        }
      }
    }

    if (retryable.length > 0) {
      requeueFailedEntries(retryable);
      vocabRetryAttempt += 1;
      scheduleVocabRetry();
    } else if (anySuccess || entries.length > 0) {
      // A clean round (or a round with no retryable leftovers) resets backoff.
      vocabRetryAttempt = 0;
      if (vocabRetryTimer) {
        clearTimeout(vocabRetryTimer);
        vocabRetryTimer = null;
      }
    }
  };

  flushInProgress = run().finally(() => {
    flushInProgress = null;
  });

  return flushInProgress;
};

const enqueueVocabWrite = (
  userId: string,
  termId: string,
  payload: any,
  isNew: boolean = false
) => {
  // Bust the read cache so the next getVocabulary reflects this write.
  vocabCache.delete(userId);

  const docRef = doc(db, `users/${userId}/vocabulary`, termId);
  const queueKey = `${userId}_${termId}`;

  const existing = vocabWriteQueue.get(queueKey);
  if (existing) {
    // Merge payloads so repeated updates to the same word coalesce.
    vocabWriteQueue.set(queueKey, {
      docRef,
      payload: { ...existing.payload, ...payload },
      isNew: existing.isNew || isNew,
    });
    // Do not call markPendingWrite again — this entry was already counted.
  } else {
    vocabWriteQueue.set(queueKey, { docRef, payload, isNew });
    markPendingWrite();
  }

  notifyQueueListeners();

  if (vocabWriteTimer) clearTimeout(vocabWriteTimer);
  vocabWriteTimer = setTimeout(flushVocabWrites, 2000);
};

// ── Browser / native lifecycle flush ────────────────────────────────────────
// Registered once at module load.  visibilitychange fires in Capacitor
// WebViews when the native app goes to background, so this covers both web
// and native without needing @capacitor/app for the basic case.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushVocabWrites();
    }
  });
}

if (typeof window !== 'undefined') {
  // pagehide fires reliably on mobile browsers and bfcache-navigations.
  window.addEventListener('pagehide', () => {
    flushVocabWrites();
  });

  // beforeunload: synchronous context — we can only kick off the flush, not
  // await it.  Combined with pagehide + visibilitychange this maximises
  // coverage across environments.
  window.addEventListener('beforeunload', () => {
    flushVocabWrites();
  });
}

// ── Public API ───────────────────────────────────────────────────────────────


export class VocabularyService {
  /**
   * Flush all pending vocabulary writes to Firestore immediately.
   * Safe to call multiple times — concurrent calls share the same promise.
   */
  static flushPendingWrites(): Promise<void> {
    return flushVocabWrites();
  }

  static async getVocabulary(userId: string | null): Promise<KnowledgeMap> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};
      const raw: Record<string, any> = JSON.parse(saved);
      const normalized: KnowledgeMap = {};
      for (const term of Object.keys(raw)) {
        const entry = raw[term];
        const normKey = normalizeLemmaKey(term);
        if (entry && typeof entry === 'object') {
          entry.state = normalizeWordState(entry.state ?? entry.status);
          if (!normalized[normKey]) normalized[normKey] = entry;
        } else if (typeof entry === 'string' || typeof entry === 'number') {
          if (!normalized[normKey])
            normalized[normKey] = {
              state: normalizeWordState(entry),
              addedAt: new Date().toISOString(),
            };
        }
      }
      return normalized;
    }

    const cached = vocabCache.get(userId);
    if (cached && Date.now() - cached.at < VOCAB_CACHE_TTL) {
      return cached.data;
    }

    try {
      const vocabSnap = await getDocs(collection(db, `users/${userId}/vocabulary`));
      const map: KnowledgeMap = {};
      vocabSnap.forEach((doc) => {
        const data = doc.data();
        const nextReview = normalizeTimestamp(data.nextReview);
        const addedAt = normalizeTimestamp(data.createdAt);

        // Key by lemma when available — ensures different inflected forms of the
        // same lemma resolve to a single knowledge entry.
        const mapKey = normalizeLemmaKey(data.lemma || data.term);

        const incoming: WordInfo = {
          state: normalizeWordState(data.status),
          srs: nextReview
            ? {
                lastReviewed: data.lastReviewed || null,
                nextReview: nextReview,
                interval: data.interval || 0,
                ease: data.ease || 2.5,
                step: data.step || 0,
              }
            : undefined,
          notes: data.notes,
          userGloss: data.userGloss,
          contexts: data.contexts || [],
          addedAt: addedAt || new Date().toISOString(),
          languageId: data.languageId,
          encounterCount: data.encounterCount ?? 0,
          lastSeenAt: normalizeTimestamp(data.lastSeenAt) || undefined,
          surface: data.surface,
          morphology: data.morphology,
          transliteration: data.transliteration,
          textId: data.textId,
          sentenceIndex: data.sentenceIndex,
          sentenceTranslation: data.sentenceTranslation,
        };

        const existing = map[mapKey];
        if (!existing) {
          map[mapKey] = incoming;
        } else {
          // Merge duplicate entries: take the more advanced state and sum encounter counts.
          const stateOrder = [
            WordState.NEW,
            WordState.SEEN,
            WordState.LEARNING,
            WordState.FAMILIAR,
            WordState.KNOWN,
            WordState.IGNORED,
          ];
          const incomingRank = stateOrder.indexOf(incoming.state);
          const existingRank = stateOrder.indexOf(existing.state);
          map[mapKey] = {
            ...existing,
            state: incomingRank > existingRank ? incoming.state : existing.state,
            encounterCount: (existing.encounterCount ?? 0) + (incoming.encounterCount ?? 0),
          };
        }
      });
      vocabCache.set(userId, { data: map, at: Date.now() });
      return map;
    } catch (e) {
      console.error('Error fetching vocabulary', e);
      return {};
    }
  }

  static async setWordState(
    userId: string | null,
    term: string,
    state: WordState,
    languageId: string = 'unknown',
    srs?: SRSData,
    extra?: Partial<ReadingContext>
  ) {
    if (state !== WordState.NEW && languageId && languageId !== 'unknown') {
      recordMilestone(languageId, 'firstWordSaved');
    }
    if (!userId) {
      // Local fallback
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      map[term] = {
        state,
        addedAt: map[term]?.addedAt || new Date().toISOString(),
        srs: srs || map[term]?.srs,
        languageId,
      };
      if (extra) {
        for (const key of READING_CONTEXT_FIELDS) {
          if (extra[key] !== undefined) (map[term] as any)[key] = extra[key];
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term, languageId);
    const payload: any = {
      term,
      lemma: term,
      normalizedTerm: normalizeLemmaKey(term),
      status: state,
      languageId,
      updatedAt: serverTimestamp(),
    };

    if (srs) {
      payload.nextReview = srs.nextReview;
      payload.interval = srs.interval;
      payload.ease = srs.ease;
      payload.step = srs.step;
      payload.lastReviewed = srs.lastReviewed;
    }

    if (extra) {
      for (const key of READING_CONTEXT_FIELDS) {
        if (extra[key] !== undefined) payload[key] = extra[key];
      }
    }

    enqueueVocabWrite(userId, termId, payload, true);
  }

  static incrementEncounter(userId: string | null, term: string, languageId: string = 'unknown') {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    enqueueVocabWrite(
      userId,
      termId,
      {
        term,
        lemma: term,
        normalizedTerm: normalizeLemmaKey(term),
        languageId,
        encounterCount: increment(1),
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      true
    );
  }

  static async updateGloss(
    userId: string | null,
    term: string,
    gloss: string,
    languageId: string = 'unknown'
  ) {
    if (!userId) {
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      map[term] = {
        ...(map[term] || {}),
        userGloss: gloss,
        languageId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }
    const termId = getTermId(term, languageId);
    enqueueVocabWrite(
      userId,
      termId,
      {
        userGloss: gloss,
        updatedAt: serverTimestamp(),
      },
      false
    );
  }

  static async updateSRS(
    userId: string | null,
    term: string,
    srs: SRSData,
    state: WordState,
    languageId: string = 'unknown'
  ) {
    return this.setWordState(userId, term, state, languageId, srs);
  }

  static setWordContext(
    userId: string | null,
    term: string,
    context: string,
    languageId: string = 'unknown'
  ) {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    // arrayUnion is idempotent; the 5-item limit is enforced locally
    enqueueVocabWrite(
      userId,
      termId,
      {
        contexts: arrayUnion(context),
        updatedAt: serverTimestamp(),
      },
      true
    );
  }

  static async migrateLocalStorage(userId: string): Promise<number> {
    const ls = localStorage.getItem(STORAGE_KEY);
    if (!ls) return 0;

    // Do not catch — caller (useDemoMigration) must see failures so it does
    // not call discardDemoData() when local data could not be saved to Firestore.
    const map = JSON.parse(ls) as KnowledgeMap;
    const entries = Object.entries(map);
    let count = 0;

    for (const [term, info] of entries) {
      const safeState = normalizeWordState(
        typeof info === 'object' && info !== null
          ? ((info as any).state ?? (info as any).status)
          : info
      );
      await this.setWordState(
        userId,
        term,
        safeState,
        (info as any)?.languageId || 'unknown',
        (info as any)?.srs
      );
      count++;
    }

    // Flush immediately so migration writes reach Firestore before returning.
    await flushVocabWrites();

    // Invalidate cache so the next getVocabulary call reads the migrated data.
    vocabCache.delete(userId);
    localStorage.removeItem(STORAGE_KEY);
    return count;
  }

  /**
   * One-time migration: re-key any Firestore vocabulary docs that used an
   * inflected form as the key to use the stored lemma field instead.
   * Merges duplicate entries (different forms, same lemma) by taking the max
   * state and summing encounter counts.
   * Guarded by a Firestore flag — safe to call on every app load.
   */
  static async migrateToLemmaKeys(userId: string): Promise<void> {
    const { doc: firestoreDoc, getDoc, setDoc } = await import('firebase/firestore');

    const metaRef = firestoreDoc(db, `users/${userId}/meta/migrationVersion`);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists() && (metaSnap.data()?.lemmaKeysMigrated ?? 0) >= 1) return;

    try {
      const vocabSnap = await getDocs(collection(db, `users/${userId}/vocabulary`));
      const stateOrder = [
        WordState.NEW,
        WordState.SEEN,
        WordState.LEARNING,
        WordState.FAMILIAR,
        WordState.KNOWN,
        WordState.IGNORED,
      ];
      const byLemmaKey = new Map<
        string,
        { docId: string; data: any; encounterCount: number; stateRank: number }[]
      >();

      vocabSnap.forEach((d) => {
        const data = d.data();
        const lemmaKey = getTermId(data.lemma || data.term, data.languageId || 'unknown');
        const arr = byLemmaKey.get(lemmaKey) ?? [];
        arr.push({
          docId: d.id,
          data,
          encounterCount: data.encounterCount ?? 0,
          stateRank: stateOrder.indexOf(normalizeWordState(data.status)),
        });
        byLemmaKey.set(lemmaKey, arr);
      });

      const batch = writeBatch(db);
      let ops = 0;

      for (const [lemmaKey, entries] of byLemmaKey.entries()) {
        if (entries.length <= 1 && entries[0]?.docId === lemmaKey) continue;

        const best = entries.reduce((a, b) => (a.stateRank >= b.stateRank ? a : b));
        const totalEncounters = entries.reduce((sum, e) => sum + e.encounterCount, 0);

        const mergedData = {
          ...best.data,
          lemma: best.data.lemma || best.data.term,
          encounterCount: totalEncounters,
          updatedAt: serverTimestamp(),
        };

        const targetRef = firestoreDoc(db, `users/${userId}/vocabulary`, lemmaKey);
        batch.set(targetRef, mergedData, { merge: true });
        ops++;

        for (const entry of entries) {
          if (entry.docId !== lemmaKey) {
            batch.delete(firestoreDoc(db, `users/${userId}/vocabulary`, entry.docId));
            ops++;
          }
        }

        if (ops >= 490) break; // stay safely under the 500-op limit
      }

      if (ops > 0) await batch.commit();

      await setDoc(
        metaRef,
        { lemmaKeysMigrated: 1, migratedAt: serverTimestamp() },
        { merge: true }
      );
      vocabCache.delete(userId);
    } catch (e) {
      console.error('migrateToLemmaKeys failed', e);
    }
  }

  static async setWordNote(
    userId: string | null,
    term: string,
    notes: string,
    languageId: string = 'unknown'
  ) {
    if (!userId) {
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      if (map[term]) {
        map[term].notes = notes;
      } else {
        map[term] = { state: WordState.NEW, addedAt: new Date().toISOString(), notes, languageId };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term, languageId);
    enqueueVocabWrite(
      userId,
      termId,
      {
        notes,
        updatedAt: serverTimestamp(),
      },
      true
    );
  }
}
