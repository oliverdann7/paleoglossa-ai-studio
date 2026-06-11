import { db } from '../firebase.js';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDocsPaged } from './firestorePaging.js';
import { normalizeTimestamp } from '../utils.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { markWriteSuccess, markWriteFailure, markPendingWrite } from '../sync/syncStatus.js';
import { reportPersistenceError } from '../errors/persistenceReporter.js';

const progressCache = new Map<string, { data: TextProgress[]; at: number }>();
const PROGRESS_CACHE_TTL = 30_000;

export interface DailyStat {
  date: string;
  knownWords: number;
  readWords: number;
  minutes: number;
  accuracy?: number;
}

export interface ReadingStats {
  totalKnown: number;
  readToday: number;
  readingTime: number;
  lastActive: string;
  streak: number;
  history: DailyStat[];
  lastAccuracy?: number;
  freezesTotal: number;
  freezesUsed: number;
}

export interface TextProgress {
  textId: string;
  languageId?: string;
  lastPosition: number;
  completed: boolean;
  lastReadAt: string;
  sentenceIndex?: number;
}

const STATS_STORAGE_KEY = STORAGE_KEYS.STATS;

function getStatsDocRef(userId: string, languageId: string) {
  return doc(db, `users/${userId}/languageStats`, languageId);
}

function getLegacyStatsDocRef(userId: string) {
  return doc(db, `users/${userId}`);
}

function getStorageKey(languageId: string): string {
  return `${STATS_STORAGE_KEY}_${languageId}`;
}

export class StatsService {
  static async getStats(userId: string | null, languageId?: string): Promise<ReadingStats> {
    const offsetDate = new Date();
    offsetDate.setUTCHours(offsetDate.getUTCHours() - 4);

    const initialStats: ReadingStats = {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: offsetDate.toISOString(),
      streak: 0,
      history: [],
      freezesTotal: 2,
      freezesUsed: 0,
    };

    if (!userId) {
      const key = languageId ? getStorageKey(languageId) : STATS_STORAGE_KEY;
      const saved = localStorage.getItem(key);
      return saved ? { ...initialStats, ...JSON.parse(saved) } : initialStats;
    }

    const lang = languageId || 'unknown';

    try {
      // Try language-scoped stats first
      const snap = await getDoc(getStatsDocRef(userId, lang));
      if (snap.exists()) {
        return { ...initialStats, ...snap.data() } as ReadingStats;
      }
    } catch {
      // Fall through to legacy
    }

    // Fallback: try legacy user document stats
    if (!languageId) {
      try {
        const legacySnap = await getDoc(getLegacyStatsDocRef(userId));
        if (legacySnap.exists() && legacySnap.data().stats) {
          const legacyStats = { ...initialStats, ...legacySnap.data().stats } as ReadingStats;
          // Migrate to language-scoped
          await this.updateStats(userId, 'unknown', legacyStats);
          return legacyStats;
        }
      } catch {
        // Ignore legacy read failure
      }
    }

    return initialStats;
  }

  static async updateStats(userId: string | null, languageId: string, newStats: ReadingStats) {
    const lang = languageId || 'unknown';

    if (!userId) {
      const key = getStorageKey(lang);
      localStorage.setItem(key, JSON.stringify(newStats));
      return;
    }

    markPendingWrite();
    try {
      await setDoc(
        getStatsDocRef(userId, lang),
        {
          ...newStats,
          languageId: lang,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      markWriteSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error updating stats:', e);
      markWriteFailure(msg);
      reportPersistenceError(e, {
        operation: 'stats:update',
        path: `users/${userId}/languageStats/${lang}`,
        category: 'stats',
        dataPreservedLocally: true,
      });
    }
  }

  static async migrateLocalStorage(userId: string): Promise<ReadingStats | null> {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (!saved) return null;

    // Do not catch — caller (useDemoMigration) must see failures so it does
    // not call discardDemoData() when local data could not be saved to Firestore.
    const stats = JSON.parse(saved) as ReadingStats;
    await this.updateStats(userId, 'unknown', stats);
    localStorage.removeItem(STATS_STORAGE_KEY);
    return stats;
  }

  static async migrateLocalReadingProgress(userId: string): Promise<number> {
    let count = 0;
    const failures: string[] = [];
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.READING_PROGRESS_PREFIX)) {
        keys.push(key);
      }
    }
    const recentKey = STORAGE_KEYS.RECENT_PROGRESS;
    const recentRaw = localStorage.getItem(recentKey);
    for (const key of keys) {
      const textId = key.replace(STORAGE_KEYS.READING_PROGRESS_PREFIX, '');
      if (!textId) continue;
      try {
        const saved = localStorage.getItem(key);
        if (!saved) continue;
        const progress = JSON.parse(saved) as TextProgress;
        progress.textId = textId;
        await this.setTextProgress(userId, progress);
        localStorage.removeItem(key);
        count++;
      } catch (e) {
        console.error(`Reading progress migration failed for ${textId}:`, e);
        failures.push(textId);
      }
    }
    // Migrate recent progress list
    if (recentRaw) {
      try {
        const recent = JSON.parse(recentRaw) as TextProgress[];
        for (const r of recent) {
          r.lastReadAt = new Date().toISOString();
          await this.setTextProgress(userId, r);
        }
        localStorage.removeItem(recentKey);
      } catch (e) {
        console.error('Recent progress migration failed:', e);
        failures.push('recent');
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `Reading progress migration failed for: ${failures.join(', ')}`
      );
    }
    return count;
  }

  // ── Text Progress ────────────────────────────────────────────────────

  static async getTextProgress(
    userId: string | null,
    textId: string
  ): Promise<TextProgress | null> {
    if (!userId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}${textId}`);
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/readingProgress`, textId));
      return snap.exists() ? (snap.data() as TextProgress) : null;
    } catch (e) {
      console.error('Error fetching text progress:', e);
      return null;
    }
  }

  static async setTextProgress(userId: string | null, progress: TextProgress) {
    if (!userId) {
      localStorage.setItem(
        `${STORAGE_KEYS.READING_PROGRESS_PREFIX}${progress.textId}`,
        JSON.stringify(progress)
      );
      const recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROGRESS) || '[]');
      const filtered = recent.filter((r: any) => r.textId !== progress.textId);
      filtered.unshift({ ...progress, lastReadAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.RECENT_PROGRESS, JSON.stringify(filtered.slice(0, 10)));
      return;
    }

    progressCache.delete(userId);
    markPendingWrite();
    try {
      await setDoc(
        doc(db, `users/${userId}/readingProgress`, progress.textId),
        {
          ...progress,
          lastReadAt: serverTimestamp(),
        },
        { merge: true }
      );
      markWriteSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error saving text progress:', e);
      markWriteFailure(msg);
      reportPersistenceError(e, {
        operation: 'reading:setProgress',
        path: `users/${userId}/readingProgress/${progress.textId}`,
        category: 'reading',
        dataPreservedLocally: true,
      });
    }
  }

  static async getAllProgress(userId: string | null, languageId?: string): Promise<TextProgress[]> {
    if (!userId) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROGRESS) || '[]');
    }

    const cached = progressCache.get(userId);
    if (cached && Date.now() - cached.at < PROGRESS_CACHE_TTL) {
      const all = cached.data;
      return languageId ? all.filter((p) => !p.languageId || p.languageId === languageId) : all;
    }

    try {
      const snap = await getDocsPaged(collection(db, `users/${userId}/readingProgress`));
      const results: TextProgress[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        const progress = {
          ...data,
          lastReadAt: normalizeTimestamp(data.lastReadAt),
        } as TextProgress;
        // Filter by language if specified
        if (languageId && progress.languageId && progress.languageId !== languageId) return;
        results.push(progress);
      });
      results.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
      progressCache.set(userId, { data: results, at: Date.now() });
      return languageId
        ? results.filter((p) => !p.languageId || p.languageId === languageId)
        : results;
    } catch (e) {
      console.error('Error fetching all progress:', e);
      return [];
    }
  }
}
