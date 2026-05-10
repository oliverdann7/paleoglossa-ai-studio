import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { WordState } from '../constants/wordStates';
import { WordStatus, SRSData } from '../../types/firestore';

export interface WordInfo {
  state: WordStatus | WordState;
  srs?: SRSData;
  notes?: string;
  userGloss?: string;
  contexts?: string[];
  addedAt: string;
  languageId?: string;
}

export type KnowledgeMap = Record<string, WordInfo>;

const STORAGE_KEY = 'paleoglossa_knowledge';

function getTermId(term: string, languageId: string): string {
  // Use languageId + term to avoid collisions
  const key = `${languageId}:${term.toLowerCase().trim()}`;
  const hex = Array.from(new TextEncoder().encode(key))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.length > 120 ? hex.substring(0, 120) : hex;
}

// Global queue for batching vocabulary writes to reduce Firestore costs
const vocabWriteQueue = new Map<string, { docRef: any, payload: any, isNew: boolean }>();
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
    
    for (const data of chunk.map(c => c[1])) {
      if (data.isNew) {
        batch.set(data.docRef, data.payload, { merge: true });
      } else {
        batch.update(data.docRef, data.payload);
      }
    }
    
    try {
      await batch.commit();
    } catch (e) {
      console.error("Failed to commit vocabulary batch", e);
      // Depending on strictness, we might want to put them back in the queue
    }
  }
};

const enqueueVocabWrite = (userId: string, termId: string, payload: any, isNew: boolean = false) => {
  const docRef = doc(db, `users/${userId}/vocabulary`, termId);
  const queueKey = `${userId}_${termId}`;
  
  const existing = vocabWriteQueue.get(queueKey);
  if (existing) {
    // Merge payloads
    vocabWriteQueue.set(queueKey, {
      docRef,
      payload: { ...existing.payload, ...payload },
      isNew: existing.isNew || isNew
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
      return saved ? JSON.parse(saved) : {};
    }

    try {
      const vocabSnap = await getDocs(collection(db, `users/${userId}/vocabulary`));
      const map: KnowledgeMap = {};
      vocabSnap.forEach(doc => {
        const data = doc.data();
        const nextReview = data.nextReview?.toDate ? data.nextReview.toDate().toISOString() : data.nextReview;
        const addedAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        
        map[data.term] = {
          state: data.status,
          srs: nextReview ? {
            lastReviewed: data.lastReviewed || null,
            nextReview: nextReview,
            interval: data.interval || 0,
            ease: data.ease || 2.5,
            step: data.step || 0
          } : undefined,
          notes: data.notes,
          userGloss: data.userGloss,
          contexts: data.contexts || [],
          addedAt: addedAt || new Date().toISOString(),
          languageId: data.languageId
        };
      });
      return map;
    } catch (e) {
      console.error("Error fetching vocabulary", e);
      return {};
    }
  }

  static async setWordState(userId: string | null, term: string, state: WordStatus | WordState, languageId: string = "unknown", srs?: SRSData) {
    if (!userId) {
      // Local fallback
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      map[term] = { 
        state, 
        addedAt: map[term]?.addedAt || new Date().toISOString(),
        srs: srs || map[term]?.srs,
        languageId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term, languageId);
    const payload: any = {
      term,
      normalizedTerm: term.toLowerCase().trim(),
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

  static async incrementEncounter(userId: string | null, term: string, languageId: string = "unknown") {
    // In a batch queue, incrementing can be tricky. We'll fallback to regular updateDoc for now 
    // since it relies on previous state, but we could also use Firestore's increment().
    if (!userId) return;
    
    const termId = getTermId(term, languageId);
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const current = snap.data().encounterCount || 0;
        enqueueVocabWrite(userId, termId, {
          encounterCount: current + 1,
          lastSeenAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, false);
      } else {
        await this.setWordState(userId, term, WordState.NEW, languageId);
      }
    } catch (e) {
      console.error("Failed to increment encounter", e);
    }
  }

  static async updateGloss(userId: string | null, term: string, gloss: string, languageId: string = "unknown") {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    enqueueVocabWrite(userId, termId, {
      userGloss: gloss,
      updatedAt: serverTimestamp()
    }, false);
  }

  static async updateSRS(userId: string | null, term: string, srs: SRSData, state: WordState, languageId: string = "unknown") {
    return this.setWordState(userId, term, state, languageId, srs);
  }

  static async setWordContext(userId: string | null, term: string, context: string, languageId: string = "unknown") {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const contexts = data.contexts || [];
        if (!contexts.includes(context)) {
          enqueueVocabWrite(userId, termId, {
            contexts: [...contexts, context].slice(-5),
            updatedAt: serverTimestamp()
          }, false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  static async migrateLocalStorage(userId: string): Promise<number> {
    const ls = localStorage.getItem(STORAGE_KEY);
    if (!ls) return 0;
    
    try {
      const map = JSON.parse(ls) as KnowledgeMap;
      const entries = Object.entries(map);
      let count = 0;
      
      for (const [term, info] of entries) {
        await this.setWordState(userId, term, info.state as WordStatus, info.languageId || "unknown", info.srs);
        count++;
      }
      
      // Flush now for migration
      await flushVocabWrites();
      
      localStorage.removeItem(STORAGE_KEY);
      return count;
    } catch (e) {
      console.error("Migration failed", e);
      return 0;
    }
  }

  static async setWordNote(userId: string | null, term: string, notes: string, languageId: string = "unknown") {
    if (!userId) {
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      if(map[term]) {
        map[term].notes = notes;
      } else {
        map[term] = { state: WordState.NEW, addedAt: new Date().toISOString(), notes, languageId };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term, languageId);
    enqueueVocabWrite(userId, termId, {
      notes,
      updatedAt: serverTimestamp()
    }, true);
  }
}

