import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { normalizeTimestamp } from '../utils';
import { STORAGE_KEYS } from '../constants/storage';

export interface DailyStat {
  date: string; // YYYY-MM-DD
  knownWords: number;
  readWords: number;
  minutes: number;
  accuracy?: number; // 0 to 100
}

export interface ReadingStats {
  totalKnown: number;
  readToday: number;
  readingTime: number; // minutes
  lastActive: string; // ISO date
  streak: number;
  history: DailyStat[];
  lastAccuracy?: number;
  freezesTotal: number;
  freezesUsed: number;
}

export interface TextProgress {
  textId: string;
  lastPosition: number;
  completed: boolean;
  lastReadAt: string;
  sentenceIndex?: number;
}

const STATS_STORAGE_KEY = STORAGE_KEYS.STATS;

export class StatsService {
  static async getStats(userId: string | null): Promise<ReadingStats> {
    // Default to a 4am reset for "today"
    const offsetDate = new Date();
    offsetDate.setUTCHours(offsetDate.getUTCHours() - 4);
    
    const initialStats: ReadingStats = {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: offsetDate.toISOString(),
      streak: 1,
      history: [],
      freezesTotal: 2,
      freezesUsed: 0
    };

    if (!userId) {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      return saved ? { ...initialStats, ...JSON.parse(saved) } : initialStats;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}`));
      if (snap.exists() && snap.data().stats) {
        return { ...initialStats, ...snap.data().stats } as ReadingStats;
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
    
    return initialStats;
  }

  static async updateStats(userId: string | null, newStats: ReadingStats) {
    if (!userId) {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      return;
    }

    try {
      await updateDoc(doc(db, `users/${userId}`), {
        stats: newStats,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating stats:", e);
    }
  }

  static async migrateLocalStorage(userId: string): Promise<ReadingStats | null> {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (!saved) return null;

    try {
      const stats = JSON.parse(saved) as ReadingStats;
      await this.updateStats(userId, stats);
      localStorage.removeItem(STATS_STORAGE_KEY);
      return stats;
    } catch (e) {
      console.error("Stats migration failed:", e);
      return null;
    }
  }

  // Text Progress specific methods (can stay here or move to progressService, but user asked for statsService)
  static async getTextProgress(userId: string | null, textId: string): Promise<TextProgress | null> {
    if (!userId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}${textId}`);
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/readingProgress`, textId));
      return snap.exists() ? snap.data() as TextProgress : null;
    } catch (e) {
      console.error("Error fetching text progress:", e);
      return null;
    }
  }

  static async setTextProgress(userId: string | null, progress: TextProgress) {
    if (!userId) {
      localStorage.setItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}${progress.textId}`, JSON.stringify(progress));
      const recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROGRESS) || '[]');
      const filtered = recent.filter((r: any) => r.textId !== progress.textId);
      filtered.unshift({ ...progress, lastReadAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.RECENT_PROGRESS, JSON.stringify(filtered.slice(0, 10)));
      return;
    }

    try {
      await setDoc(doc(db, `users/${userId}/readingProgress`, progress.textId), {
        ...progress,
        lastReadAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving text progress:", e);
    }
  }

  static async getAllProgress(userId: string | null): Promise<TextProgress[]> {
    if (!userId) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROGRESS) || '[]');
    }

    try {
      const snap = await getDocs(collection(db, `users/${userId}/readingProgress`));
      const results: TextProgress[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        results.push({ ...data, lastReadAt: normalizeTimestamp(data.lastReadAt) } as TextProgress);
      });
      return results.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
    } catch (e) {
      console.error("Error fetching all progress:", e);
      return [];
    }
  }
}
