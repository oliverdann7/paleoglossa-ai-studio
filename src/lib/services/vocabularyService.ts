import { db } from '../firebase.js';
import {
  doc,
  collection,
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
import {
  isIdentifiableLemma,
  normalizeLemma,
  vocabDocId,
  vocabKey,
  UNKNOWN_LANGUAGE,
} from '../vocabulary/identity.js';
import { markPendingWrite, markWriteSuccess, markWriteFailure } from '../sync/syncStatus.js';
import { reportPersistenceError } from '../errors/persistenceReporter.js';
import { classifyFirestoreError } from '../errors/firestoreErrors.js';
import { ReadingContext, READING_CONTEXT_FIELDS } from '../review/readingContext.js';
import { getDocsPaged } from './firestorePaging.js';

export type { SRSData };

export interface WordInfo {
  state: WordState;
  /** The lemma as the learner saw it (accents intact). The map key is not displayable. */
  lemma?: string;
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
  /** 'phrase' for a multi-word item saved from the reader. */
  kind?: 'phrase';
  memberLemmas?: string[];
}

/**
 * Keyed by `vocabKey(lemma, languageId)` — never by the bare lemma. Read
 * entries with `vocabKey`, and display `info.lemma` (see `displayLemma`).
 */
export type KnowledgeMap = Record<string, WordInfo>;

/** The human-readable lemma for a KnowledgeMap entry. */
export function displayLemma(key: string, info?: { lemma?: string } | null): string {
  if (info?.lemma) return info.lemma;
  const at = key.indexOf(':');
  return at < 0 ? key : key.slice(at + 1);
}

const STORAGE_KEY = STORAGE_KEYS.KNOWLEDGE;

const vocabCache = new Map<string, { data: KnowledgeMap; at: number }>();
const VOCAB_CACHE_TTL = 5 * 60_000;

const getTermId = vocabDocId;

const STATE_RANK: WordState[] = [
  WordState.NEW,
  WordState.SEEN,
  WordState.LEARNING,
  WordState.FAMILIAR,
  WordState.KNOWN,
  WordState.IGNORED,
];
const stateRank = (state: unknown) => STATE_RANK.indexOf(normalizeWordState(state));

/** Stored documents whose ID no longer matches their identity, per user. */
type StoredVocabDoc = { id: string; data: Record<string, any> };
const staleIdentityDocs = new Map<string, StoredVocabDoc[]>();
// Bumped when a repair starts, so a read that began before it cannot hand the
// repair a snapshot of the pre-repair layout.
const repairGeneration = new Map<string, number>();

// ── Guest (localStorage) store ───────────────────────────────────────────────
// Same identity as Firestore: entries are keyed by vocabKey and carry `lemma`.
// Older builds keyed by the bare term, which collided across languages; those
// entries are re-keyed on every read, so the upgrade is implicit and idempotent.

function readLocalKnowledge(): KnowledgeMap {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};
  const raw: Record<string, any> = JSON.parse(saved);
  const map: KnowledgeMap = {};
  for (const [storedKey, value] of Object.entries(raw)) {
    let entry: WordInfo;
    if (value && typeof value === 'object') {
      entry = { ...value, state: normalizeWordState(value.state ?? value.status) };
    } else if (typeof value === 'string' || typeof value === 'number') {
      entry = { state: normalizeWordState(value), addedAt: new Date().toISOString() };
    } else {
      continue;
    }
    // Entries written by this version carry `lemma`; older ones used it as the key.
    entry.lemma = entry.lemma || storedKey;
    if (!isIdentifiableLemma(entry.lemma)) continue;
    const key = vocabKey(entry.lemma, entry.languageId);
    const existing = map[key];
    if (!existing || stateRank(entry.state) > stateRank(existing.state)) map[key] = entry;
  }
  return map;
}

function updateLocalKnowledge(
  term: string,
  languageId: string,
  update: (current: WordInfo | undefined) => WordInfo
) {
  if (!isIdentifiableLemma(term)) return;
  const map = readLocalKnowledge();
  const key = vocabKey(term, languageId);
  map[key] = { ...update(map[key]), lemma: map[key]?.lemma || term, languageId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
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

// ── Identity repair (pure planning) ──────────────────────────────────────────

function storedDocTargetId(data: Record<string, any>): string {
  return vocabDocId(data.lemma || data.term, data.languageId || UNKNOWN_LANGUAGE);
}

export interface IdentityRepairGroup {
  /** The document ID this identity belongs at. */
  targetId: string;
  /** Every existing document that resolves to this identity (may include targetId). */
  sourceIds: string[];
  /** The merged payload to store at targetId. */
  data: Record<string, any>;
}

/**
 * Decide which vocabulary documents must move. Pure, so the merge rules are
 * unit-testable without Firestore. Groups already in place are omitted, which
 * is what makes a second run a no-op.
 */
export function planIdentityRepair(docs: StoredVocabDoc[]): IdentityRepairGroup[] {
  const byTarget = new Map<string, StoredVocabDoc[]>();
  for (const d of docs) {
    const lemma = d.data.lemma || d.data.term;
    if (!isIdentifiableLemma(lemma)) continue; // unidentifiable — leave untouched
    const target = storedDocTargetId(d.data);
    const group = byTarget.get(target);
    if (group) group.push(d);
    else byTarget.set(target, [d]);
  }

  const plan: IdentityRepairGroup[] = [];
  for (const [targetId, group] of byTarget) {
    if (group.length === 1 && group[0].id === targetId) continue;

    // The most advanced state wins; a scheduled review breaks ties so SRS
    // history is never traded for an unscheduled duplicate.
    const best = group.reduce((a, b) => {
      const diff = stateRank(b.data.status) - stateRank(a.data.status);
      if (diff !== 0) return diff > 0 ? b : a;
      return !a.data.nextReview && b.data.nextReview ? b : a;
    });
    const lemma = best.data.lemma || best.data.term;
    const languageId = best.data.languageId || UNKNOWN_LANGUAGE;
    const contexts = [...new Set(group.flatMap((d) => d.data.contexts ?? []))].slice(-5);
    const firstDefined = (field: string) =>
      best.data[field] ?? group.find((d) => d.data[field] != null)?.data[field];

    const data: Record<string, any> = {
      ...best.data,
      term: best.data.term || lemma,
      lemma,
      normalizedTerm: normalizeLemma(lemma, languageId),
      languageId,
      status: normalizeWordState(best.data.status),
      encounterCount: group.reduce((sum, d) => sum + (d.data.encounterCount ?? 0), 0),
    };
    if (contexts.length > 0) data.contexts = contexts;
    for (const field of ['notes', 'userGloss']) {
      const value = firstDefined(field);
      if (value != null) data[field] = value;
    }

    plan.push({ targetId, sourceIds: group.map((d) => d.id), data });
  }
  return plan;
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
    if (!userId) return readLocalKnowledge();

    const cached = vocabCache.get(userId);
    if (cached && Date.now() - cached.at < VOCAB_CACHE_TTL) {
      return cached.data;
    }

    try {
      const generation = repairGeneration.get(userId) ?? 0;
      const vocabSnap = await getDocsPaged(collection(db, `users/${userId}/vocabulary`));
      const map: KnowledgeMap = {};
      const stale: StoredVocabDoc[] = [];
      vocabSnap.forEach((doc) => {
        const data = doc.data();
        const lemma = data.lemma || data.term;
        if (!isIdentifiableLemma(lemma)) return;
        const languageId = data.languageId || UNKNOWN_LANGUAGE;
        stale.push({ id: doc.id, data });
        const nextReview = normalizeTimestamp(data.nextReview);
        const addedAt = normalizeTimestamp(data.createdAt);

        // Key by (language, lemma) — different inflected forms of one lemma
        // resolve to a single entry, and the same spelling in two languages
        // (Hebrew/Aramaic, Attic/Koine) stays two entries.
        const mapKey = vocabKey(lemma, languageId);

        const incoming: WordInfo = {
          state: normalizeWordState(data.status),
          lemma,
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
          languageId,
          encounterCount: data.encounterCount ?? 0,
          lastSeenAt: normalizeTimestamp(data.lastSeenAt) || undefined,
          surface: data.surface,
          morphology: data.morphology,
          transliteration: data.transliteration,
          textId: data.textId,
          sentenceIndex: data.sentenceIndex,
          sentenceTranslation: data.sentenceTranslation,
          kind: data.kind === 'phrase' ? 'phrase' : undefined,
          memberLemmas: Array.isArray(data.memberLemmas) ? data.memberLemmas : undefined,
        };

        const existing = map[mapKey];
        if (!existing) {
          map[mapKey] = incoming;
        } else {
          // Duplicate documents for one identity (written by an older build, or
          // not yet repaired): the more advanced entry wins, encounters add up.
          const winner = stateRank(incoming.state) > stateRank(existing.state) ? incoming : existing;
          const other = winner === incoming ? existing : incoming;
          map[mapKey] = {
            ...winner,
            notes: winner.notes ?? other.notes,
            userGloss: winner.userGloss ?? other.userGloss,
            encounterCount: (existing.encounterCount ?? 0) + (incoming.encounterCount ?? 0),
          };
        }
      });
      // Only keep documents for the repair pass when at least one is misplaced.
      if ((repairGeneration.get(userId) ?? 0) !== generation) {
        // A repair ran while this read was in flight — its snapshot is outdated.
      } else if (stale.some((d) => d.id !== storedDocTargetId(d.data))) {
        staleIdentityDocs.set(userId, stale);
      } else {
        staleIdentityDocs.delete(userId);
      }
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
    if (!isIdentifiableLemma(term)) return;
    if (state !== WordState.NEW && languageId && languageId !== 'unknown') {
      recordMilestone(languageId, 'firstWordSaved');
    }
    if (!userId) {
      updateLocalKnowledge(term, languageId, (current) => {
        const next: WordInfo = {
          ...current,
          state,
          addedAt: current?.addedAt || new Date().toISOString(),
          srs: srs || current?.srs,
        };
        if (extra) {
          for (const key of READING_CONTEXT_FIELDS) {
            if (extra[key] !== undefined) (next as any)[key] = extra[key];
          }
        }
        return next;
      });
      return;
    }

    const termId = getTermId(term, languageId);
    const payload: any = {
      term,
      lemma: term,
      normalizedTerm: normalizeLemma(term, languageId),
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
    if (!isIdentifiableLemma(term)) return;
    if (!userId) return;
    const termId = getTermId(term, languageId);
    enqueueVocabWrite(
      userId,
      termId,
      {
        term,
        lemma: term,
        normalizedTerm: normalizeLemma(term, languageId),
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
    if (!isIdentifiableLemma(term)) return;
    if (!userId) {
      updateLocalKnowledge(term, languageId, (current) => ({
        ...(current ?? { state: WordState.NEW, addedAt: new Date().toISOString() }),
        userGloss: gloss,
      }));
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
    if (!isIdentifiableLemma(term)) return;
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
    const entries = Object.values(readLocalKnowledge());
    let count = 0;

    for (const info of entries) {
      if (!info.lemma) continue;
      await this.setWordState(
        userId,
        info.lemma,
        info.state,
        info.languageId || UNKNOWN_LANGUAGE,
        info.srs
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
   * Move vocabulary documents whose ID no longer matches their identity to the
   * right ID, merging any that now coincide. Covers every identity change to
   * date: inflected-form keys, IDs truncated at 120 characters, and the
   * language-aware normalization in `lib/vocabulary/identity`.
   *
   * Idempotent and self-healing rather than a one-shot flagged migration: it
   * works from the documents `getVocabulary` just read (no extra reads, and
   * nothing at all when every document is in place), so documents written
   * later by an out-of-date client are repaired on the next load. Each merged
   * group is committed atomically with the deletion of its sources, so an
   * interrupted run leaves either the old or the new layout, never a mix.
   *
   * Returns the number of documents moved or merged away.
   */
  static async repairVocabularyIdentity(userId: string): Promise<number> {
    const docs = staleIdentityDocs.get(userId);
    if (!docs) return 0;
    staleIdentityDocs.delete(userId);
    repairGeneration.set(userId, (repairGeneration.get(userId) ?? 0) + 1);

    const plan = planIdentityRepair(docs);
    if (plan.length === 0) return 0;

    // A document ID that another group writes to must not be deleted by the
    // group that vacates it.
    const written = new Set(plan.map((g) => g.targetId));
    const vocabPath = `users/${userId}/vocabulary`;
    const MAX_OPS = 450;
    let batch = writeBatch(db);
    let ops = 0;
    let moved = 0;

    for (const group of plan) {
      const deletions = group.sourceIds.filter((id) => !written.has(id));
      const size = 1 + deletions.length;
      if (ops > 0 && ops + size > MAX_OPS) {
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
      batch.set(doc(db, vocabPath, group.targetId), {
        ...group.data,
        updatedAt: serverTimestamp(),
      });
      for (const id of deletions) batch.delete(doc(db, vocabPath, id));
      ops += size;
      moved += group.sourceIds.filter((id) => id !== group.targetId).length;
    }
    if (ops > 0) await batch.commit();

    vocabCache.delete(userId);
    return moved;
  }

  static async setWordNote(
    userId: string | null,
    term: string,
    notes: string,
    languageId: string = 'unknown'
  ) {
    if (!isIdentifiableLemma(term)) return;
    if (!userId) {
      updateLocalKnowledge(term, languageId, (current) => ({
        ...(current ?? { state: WordState.NEW, addedAt: new Date().toISOString() }),
        notes,
      }));
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
