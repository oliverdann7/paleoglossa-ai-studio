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
import { STORAGE_KEYS } from '../constants/storage.js';
import { SRSData } from '../../types/firestore.js';
import { normalizeTimestamp } from '../utils.js';
import { normalizeLemmaKey } from '../utils/lemmaUtils.js';
import { markWriteSuccess, markWriteFailure } from '../sync/syncStatus.js';

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
}

export type KnowledgeMap = Record<string, WordInfo>;

const STORAGE_KEY = STORAGE_KEYS.KNOWLEDGE;

const vocabCache = new Map<string, { data: KnowledgeMap; at: number }>();
const VOCAB_CACHE_TTL = 5 * 60_000;

function getTermId(term: string, languageId: string): string {
  const key = `${languageId}:${normalizeLemmaKey(term)}`;
  return btoa(encodeURIComponent(key)).replace(/[+/=]/g, '_').substring(0, 120);
}

// Global queue for batching vocabulary writes to reduce Firestore costs
const vocabWriteQueue = new Map<string, { docRef: any; payload: any; isNew: boolean }>();
let vocabWriteTimer: NodeJS.Timeout | null = null;

const flushVocabWrites = async () => {
  if (vocabWriteQueue.size === 0) return;

  const entries = Array.from(vocabWriteQueue.entries());
  vocabWriteQueue.clear();

  // Firestore batches support up to 500 operations
  const chunkSize = 500;
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
      markWriteSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Failed to commit vocabulary batch', e);
      markWriteFailure(msg);
    }
  }
};

const enqueueVocabWrite = (
  userId: string,
  termId: string,
  payload: any,
  isNew: boolean = false
) => {
  const docRef = doc(db, `users/${userId}/vocabulary`, termId);
  const queueKey = `${userId}_${termId}`;

  const existing = vocabWriteQueue.get(queueKey);
  if (existing) {
    // Merge payloads
    vocabWriteQueue.set(queueKey, {
      docRef,
      payload: { ...existing.payload, ...payload },
      isNew: existing.isNew || isNew,
    });
  } else {
    vocabWriteQueue.set(queueKey, { docRef, payload, isNew });
  }

  if (vocabWriteTimer) clearTimeout(vocabWriteTimer);
  vocabWriteTimer = setTimeout(flushVocabWrites, 2000); // 2 second debounce
};

export class VocabularyService {
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

        // Key by lemma when available — ensures different inflected forms of the same
        // lemma resolve to a single knowledge entry.
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
    srs?: SRSData
  ) {
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

    enqueueVocabWrite(userId, termId, payload, true);
  }

  static incrementEncounter(userId: string | null, term: string, languageId: string = 'unknown') {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    // Use merge=true so the write creates the doc if it doesn't exist yet
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
    if (!userId) return;
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
    // arrayUnion is idempotent and avoids a read round-trip; the 5-item limit is enforced locally
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

    try {
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

      // Flush now for migration
      await flushVocabWrites();

      // Invalidate cache so the next getVocabulary call reads the migrated data
      vocabCache.delete(userId);
      localStorage.removeItem(STORAGE_KEY);
      return count;
    } catch (e) {
      console.error('Migration failed', e);
      return 0;
    }
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
