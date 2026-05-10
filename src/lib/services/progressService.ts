import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export interface DailyStat {
  date: string; // YYYY-MM-DD
  knownWords: number;
  readWords: number;
  minutes: number;
}

export interface ReadingStats {
  totalKnown: number;
  readToday: number;
  readingTime: number; // minutes
  lastActive: string; // ISO date
  streak: number;
  history: DailyStat[];
  freezesTotal: number;
  freezesUsed: number;
}

export interface TextProgress {
  textId: string;
  lastPosition: number; // scroll or sentence index
  completed: boolean;
  lastReadAt: string;
  sentenceIndex?: number;
}

export class ProgressService {
  static async getStats(userId: string | null): Promise<ReadingStats> {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 4);
    
    const initialStats: ReadingStats = {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: now.toISOString(),
      streak: 1,
      history: [],
      freezesTotal: 2,
      freezesUsed: 0
    };

    if (!userId) {
      const saved = localStorage.getItem('paleoglossa_stats');
      if (saved) return { ...initialStats, ...JSON.parse(saved) };
      return initialStats;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}`));
      if (snap.exists() && snap.data().stats) {
        return { ...initialStats, ...snap.data().stats } as ReadingStats;
      }
    } catch (e) {
      console.error(e);
    }
    
    return initialStats;
  }

  static async updateStats(userId: string | null, newStats: ReadingStats) {
    if (!userId) {
      localStorage.setItem('paleoglossa_stats', JSON.stringify(newStats));
      return;
    }

    try {
      await updateDoc(doc(db, `users/${userId}`), {
        stats: newStats
      });
    } catch (e) {
      console.error(e);
    }
  }

  static async getTextProgress(userId: string | null, textId: string): Promise<TextProgress | null> {
    if (!userId) {
      const saved = localStorage.getItem(`progress_${textId}`);
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/progress`, textId));
      return snap.exists() ? snap.data() as TextProgress : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async setTextProgress(userId: string | null, progress: TextProgress) {
    if (!userId) {
      localStorage.setItem(`progress_${progress.textId}`, JSON.stringify(progress));
      // Also update a global list for local fallback
      const recent = JSON.parse(localStorage.getItem('recent_progress') || '[]');
      const filtered = recent.filter((r: any) => r.textId !== progress.textId);
      filtered.unshift({ ...progress, lastReadAt: new Date().toISOString() });
      localStorage.setItem('recent_progress', JSON.stringify(filtered.slice(0, 10)));
      return;
    }

    try {
      await setDoc(doc(db, `users/${userId}/progress`, progress.textId), {
        ...progress,
        lastReadAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  }

  static async getAllProgress(userId: string | null): Promise<TextProgress[]> {
    if (!userId) {
      return JSON.parse(localStorage.getItem('recent_progress') || '[]');
    }

    try {
      const snap = await getDocs(collection(db, `users/${userId}/progress`));
      const results: TextProgress[] = [];
      snap.forEach(doc => results.push(doc.data() as TextProgress));
      return results.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
