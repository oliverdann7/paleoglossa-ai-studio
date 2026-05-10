import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
}
