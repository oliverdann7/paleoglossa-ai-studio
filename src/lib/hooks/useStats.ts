import { useState, useEffect, useCallback, useRef } from 'react';
import { StatsService, ReadingStats } from '../services/statsService.js';
import { useAuth } from './useAuth.js';
import { STORAGE_KEYS } from '../constants/storage.js';

export const useStats = (languageId?: string) => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statsUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const langRef = useRef(languageId);

  const DEFAULT_STATS: ReadingStats = {
    totalKnown: 0,
    readToday: 0,
    readingTime: 0,
    lastActive: new Date().toISOString(),
    streak: 0,
    history: [],
    freezesTotal: 2,
    freezesUsed: 0,
  };

  useEffect(() => {
    langRef.current = languageId;
  }, [languageId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dbStats = await StatsService.getStats(userId, languageId);
        if (!active) return;

        if (userId) {
          const localStats = localStorage.getItem(STORAGE_KEYS.STATS);
          if (localStats) {
            await StatsService.migrateLocalStorage(userId);
            const updatedStats = await StatsService.getStats(userId, languageId);
            if (!active) return;
            setStats(updatedStats);
            return;
          }
        }

        const now = new Date();
        now.setUTCHours(now.getUTCHours() - 4);

        let needUpdate = false;
        const currentStats = { ...dbStats };

        if (currentStats.lastActive) {
          const last = new Date(currentStats.lastActive);
          last.setUTCHours(last.getUTCHours() - 4);

          let newStreak = currentStats.streak || 0;
          let freezesTotal = currentStats.freezesTotal ?? 2;
          let freezesUsed = currentStats.freezesUsed ?? 0;

          const diffDays = Math.floor(now.valueOf() / 86400000) - Math.floor(last.valueOf() / 86400000);

          if (now.getUTCMonth() !== last.getUTCMonth() || now.getUTCFullYear() !== last.getUTCFullYear()) {
            freezesTotal = 2;
            freezesUsed = 0;
            needUpdate = true;
          }

          if (diffDays > 0) {
            needUpdate = true;
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              const freezesNeeded = diffDays - 1;
              const freezesAvailable = freezesTotal - freezesUsed;
              if (freezesAvailable >= freezesNeeded) {
                freezesUsed += freezesNeeded;
                newStreak += 1;
              } else {
                newStreak = 1;
              }
            }

            if (currentStats.readToday > 0 || currentStats.readingTime > 0) {
              const history = [...(currentStats.history || [])];
              const lastStr = last.toISOString().split('T')[0];
              if (!history.find(h => h.date === lastStr)) {
                history.push({
                  date: lastStr,
                  knownWords: currentStats.totalKnown,
                  readWords: currentStats.readToday,
                  minutes: currentStats.readingTime,
                });
                if (history.length > 90) history.shift();
                currentStats.history = history;
              }
            }

            currentStats.readToday = 0;
            currentStats.readingTime = 0;
            currentStats.streak = newStreak;
            currentStats.freezesTotal = freezesTotal;
            currentStats.freezesUsed = freezesUsed;
            currentStats.lastActive = new Date().toISOString();
          }
        }

        setStats(currentStats);
        if (needUpdate) {
          StatsService.updateStats(userId, languageId || 'unknown', currentStats);
        }
      } catch (e: any) {
        console.error("useStats init error:", e);
        setError(e.message || "Failed to load stats");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, [userId, languageId]);

  const updateStatsState = useCallback((updater: (prev: ReadingStats) => ReadingStats) => {
    setStats(prev => {
      if (!prev) return null;
      const next = updater(prev);
      if (statsUpdateTimer.current) clearTimeout(statsUpdateTimer.current);
      statsUpdateTimer.current = setTimeout(() => {
        StatsService.updateStats(userId, languageId || 'unknown', next);
      }, 10000);
      return next;
    });
  }, [userId, languageId]);

  const addReadWords = useCallback((count: number) => {
    updateStatsState(prev => ({
      ...prev,
      readToday: (prev.readToday || 0) + count,
      lastActive: new Date().toISOString(),
    }));
  }, [updateStatsState]);

  const incrementReadingTime = useCallback((minutes: number) => {
    updateStatsState(prev => ({
      ...prev,
      readingTime: (prev.readingTime || 0) + minutes,
      lastActive: new Date().toISOString(),
    }));
  }, [updateStatsState]);

  const recordReviewSession = useCallback((accuracy: number) => {
    updateStatsState(prev => ({
      ...prev,
      lastAccuracy: accuracy,
      lastActive: new Date().toISOString(),
    }));
  }, [updateStatsState]);

  return {
    stats: stats || DEFAULT_STATS,
    addReadWords,
    incrementReadingTime,
    recordReviewSession,
    updateStatsState,
    isLoading,
    error,
  };
};
