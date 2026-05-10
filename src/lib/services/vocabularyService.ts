import { db } from '../firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { WordState } from '../constants/wordStates';
import { WordStatus, SRSData } from '../../types/firestore';

export interface WordInfo {
  state: WordStatus | WordState;
  srs?: SRSData;
  notes?: string;
  addedAt: string;
  languageId?: string;
}

export type KnowledgeMap = Record<string, WordInfo>;

const STORAGE_KEY = 'paleoglossa_knowledge';

function getTermId(term: string): string {
  // Hex encode to safely match ^[a-zA-Z0-9_\-]+$ and avoid firestore issues
  const hex = Array.from(new TextEncoder().encode(term))
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
            interval: data.interval,
            easing: data.ease,
            step: data.step || 0
          } : undefined,
          notes: data.notes,
          addedAt: addedAt || new Date().toISOString(),
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

    const termId = getTermId(term);
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

  static async updateSRS(userId: string | null, term: string, srs: SRSData, state: WordState) {
    return this.setWordState(userId, term, state, "unknown", srs);
  }

  static async setWordNote(userId: string | null, term: string, notes: string) {
    if (!userId) {
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      if(map[term]) {
        map[term].notes = notes;
      } else {
        map[term] = { state: WordState.NEW, addedAt: new Date().toISOString(), notes };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term);
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
          language: "unknown",
          notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: WordState.NEW,
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
