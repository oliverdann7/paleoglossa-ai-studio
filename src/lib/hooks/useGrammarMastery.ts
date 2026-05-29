import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from './useAuth.js';
import type { GrammarConceptMastery } from '../../types/firestore.js';
import { calculateSM2, type Rating, type SRSState } from '../srs/sm2.js';

const STORAGE_KEY = 'paleoglossa_grammar_mastery';
const FIRESTORE_COLLECTION = 'grammarMastery';

type MasteryMap = Record<string, GrammarConceptMastery>;
type Listener = () => void;

let masteryMap: MasteryMap = loadFromStorage();
let currentUid: string | null = null;
const listeners = new Set<Listener>();

function loadFromStorage(): MasteryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as MasteryMap;
  } catch {
    return {};
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(masteryMap));
  } catch {
    // quota exceeded — non-fatal
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

function getSnapshot(): MasteryMap {
  return masteryMap;
}

function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function syncFromFirestore(fsDb: Firestore | null, uid: string) {
  if (!fsDb) return;
  try {
    const colRef = collection(fsDb, 'users', uid, FIRESTORE_COLLECTION);
    const snap = await getDocs(colRef);
    const remote: MasteryMap = {};
    snap.forEach((d) => {
      const data = d.data() as GrammarConceptMastery;
      remote[d.id] = data;
    });

    // Merge: take the higher level for each concept
    let changed = false;
    for (const [id, remoteMastery] of Object.entries(remote)) {
      const local = masteryMap[id];
      if (!local || remoteMastery.level > local.level) {
        masteryMap[id] = remoteMastery;
        changed = true;
      }
    }
    // Push any local-only entries to Firestore
    for (const [id, localMastery] of Object.entries(masteryMap)) {
      if (!remote[id]) {
        const docRef = doc(fsDb, 'users', uid, FIRESTORE_COLLECTION, id);
        setDoc(docRef, { ...localMastery, lastStudiedAt: serverTimestamp() }).catch(() => {});
      }
    }
    if (changed) {
      saveToStorage();
      emit();
    }
  } catch {
    // offline — local state is authoritative
  }
}

async function persistConcept(conceptId: string, mastery: GrammarConceptMastery) {
  masteryMap = { ...masteryMap, [conceptId]: mastery };
  saveToStorage();
  emit();

  if (currentUid && db) {
    try {
      const docRef = doc(db, 'users', currentUid, FIRESTORE_COLLECTION, conceptId);
      await setDoc(docRef, { ...mastery, lastStudiedAt: serverTimestamp() });
    } catch {
      // offline — will sync next load
    }
  }
}

export function useGrammarMastery() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    if (uid && uid !== currentUid) {
      currentUid = uid;
      syncFromFirestore(db as Firestore, uid);
    } else if (!uid) {
      currentUid = null;
    }
  }, [uid]);

  const map = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getMastery = useCallback(
    (conceptId: string): GrammarConceptMastery | null => {
      return map[conceptId] ?? null;
    },
    [map]
  );

  const getMasteryLevel = useCallback(
    (conceptId: string): 0 | 1 | 2 | 3 => {
      return map[conceptId]?.level ?? 0;
    },
    [map]
  );

  const markStudied = useCallback(
    async (conceptId: string, languageId: string) => {
      const existing = map[conceptId];
      if (existing && existing.level >= 1) return;
      const mastery: GrammarConceptMastery = {
        conceptId,
        languageId,
        level: 1,
        quizCorrect: existing?.quizCorrect ?? 0,
        quizTotal: existing?.quizTotal ?? 0,
        lastStudiedAt: new Date().toISOString(),
        masteredAt: null,
      };
      await persistConcept(conceptId, mastery);
    },
    [map]
  );

  const recordQuizResult = useCallback(
    async (conceptId: string, languageId: string, correct: boolean) => {
      const existing = map[conceptId];
      const quizCorrect = (existing?.quizCorrect ?? 0) + (correct ? 1 : 0);
      const quizTotal = (existing?.quizTotal ?? 0) + 1;
      const currentLevel = existing?.level ?? 0;

      // Advance to level 2 on first quiz attempt, level 3 when 3+ correct with 75%+ accuracy
      let newLevel: 0 | 1 | 2 | 3 = currentLevel < 2 ? 2 : currentLevel;
      if (quizCorrect >= 3 && quizTotal > 0 && quizCorrect / quizTotal >= 0.75) {
        newLevel = 3;
      }

      // Drive concept-level SM-2 so mastered concepts decay and resurface.
      // A failed quiz also demotes from `mastered` back to `quizzed`.
      const rating: Rating = correct ? 'GOOD' : 'AGAIN';
      const prevSrs = (existing?.srs as SRSState | undefined) ?? null;
      const nextSrs = calculateSM2(rating, prevSrs);
      const lapses = (existing?.lapses ?? 0) + (correct ? 0 : 1);
      if (!correct && newLevel === 3) newLevel = 2;

      const mastery: GrammarConceptMastery = {
        conceptId,
        languageId,
        level: newLevel,
        quizCorrect,
        quizTotal,
        lastStudiedAt: new Date().toISOString(),
        masteredAt: newLevel === 3 ? (existing?.masteredAt ?? new Date().toISOString()) : null,
        srs: nextSrs,
        lapses,
      };
      await persistConcept(conceptId, mastery);
      return newLevel === 3 && currentLevel < 3;
    },
    [map]
  );

  const isUnlocked = useCallback(
    (_conceptId: string, prerequisites: string[]): boolean => {
      if (prerequisites.length === 0) return true;
      return prerequisites.every((p) => (map[p]?.level ?? 0) >= 1);
    },
    [map]
  );

  const getDueConcepts = useCallback(
    (languageId?: string): GrammarConceptMastery[] => {
      const nowIso = new Date().toISOString();
      return Object.values(map).filter((m) => {
        if (languageId && m.languageId !== languageId) return false;
        if (!m.srs) return false;
        return m.srs.nextReview <= nowIso;
      });
    },
    [map]
  );

  const stats = useCallback(
    (languageId?: string) => {
      const entries = Object.values(map).filter(
        (m) => !languageId || m.languageId === languageId
      );
      return {
        total: entries.length,
        studied: entries.filter((m) => m.level >= 1).length,
        quizzed: entries.filter((m) => m.level >= 2).length,
        mastered: entries.filter((m) => m.level >= 3).length,
      };
    },
    [map]
  );

  return {
    getMastery,
    getMasteryLevel,
    markStudied,
    recordQuizResult,
    isUnlocked,
    getDueConcepts,
    stats,
  };
}
