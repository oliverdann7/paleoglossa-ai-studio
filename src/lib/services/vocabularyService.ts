import { db } from '../firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { WordState } from '../constants/wordStates';

const STORAGE_KEY = 'paleoglossa_knowledge';

export interface SRSData {
  lastReviewed: string | null;
  nextReview: string | null;
  interval: number; // days
  easing: number; // SM-2 ease factor
  step: number; // number of reviews
}

export interface WordInfo {
  state: WordState;
  srs?: SRSData;
  notes?: string;
  addedAt: string;
}

export type KnowledgeMap = Record<string, WordInfo>;

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
        map[data.term] = {
          state: data.status,
          srs: data.nextReview ? {
            lastReviewed: null,
            nextReview: data.nextReview,
            interval: data.interval,
            easing: data.ease,
            step: data.step || 0
          } : undefined,
          notes: data.notes,
          addedAt: data.createdAt,
        };
      });
      return map;
    } catch (e) {
      console.error("Error fetching vocabulary", e);
      return {};
    }
  }

  static async setWordState(userId: string | null, term: string, state: WordState, language: string = "unknown") {
    if (!userId) {
      // Local fallback
      const ls = localStorage.getItem(STORAGE_KEY);
      const map = ls ? JSON.parse(ls) : {};
      map[term] = { state, addedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return;
    }

    const termId = getTermId(term);
    try {
      const docRef = doc(db, `users/${userId}/vocabulary`, termId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, {
          status: state,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(docRef, {
          term,
          status: state,
          language,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          interval: 0,
          ease: 2.5,
          step: 0,
          nextReview: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Failed to set word state", e);
    }
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
