import { db } from '../firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
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
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      
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

      if (snap.exists()) {
        await updateDoc(docRef, payload);
      } else {
        await setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
          encounterCount: 1,
          firstSeenAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
          sourceTextIds: [],
          tags: [],
          // Default SRS if not provided
          nextReview: payload.nextReview || new Date().toISOString(),
          interval: payload.interval || 0,
          ease: payload.ease || 2.5,
          step: payload.step || 0
        });
      }
    } catch (e) {
      console.error("Failed to set word state", e);
    }
  }

  static async incrementEncounter(userId: string | null, term: string, languageId: string = "unknown") {
    if (!userId) return; // For local we could implement but skipping for brevity
    
    const termId = getTermId(term, languageId);
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        // We use modular import of increment in real apps, but Here I can just use a number update
        const current = snap.data().encounterCount || 0;
        await updateDoc(docRef, {
          encounterCount: current + 1,
          lastSeenAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create as NEW
        await this.setWordState(userId, term, WordState.NEW, languageId);
      }
    } catch (e) {
      console.error("Failed to increment encounter", e);
    }
  }

  static async updateGloss(userId: string | null, term: string, gloss: string, languageId: string = "unknown") {
    if (!userId) return;
    const termId = getTermId(term, languageId);
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      await updateDoc(docRef, {
        userGloss: gloss,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
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
          await updateDoc(docRef, {
            contexts: [...contexts, context].slice(-5),
            updatedAt: serverTimestamp()
          });
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
      
      // Batch processing would be better, but for simplicity let's do it sequentially or with Promise.all
      // Note: term as key in localStorage doesn't have languageId usually, we might need to guess or use default
      for (const [term, info] of entries) {
        await this.setWordState(userId, term, info.state as WordStatus, info.languageId || "unknown", info.srs);
        count++;
      }
      
      // Clear localStorage after migration
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
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, {
          notes,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(docRef, {
          term,
          normalizedTerm: term.toLowerCase().trim(),
          languageId,
          notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: WordStatus.NEW,
          interval: 0,
          ease: 2.5,
          step: 0,
          nextReview: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
