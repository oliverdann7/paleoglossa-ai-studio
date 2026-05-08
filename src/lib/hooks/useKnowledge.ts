import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates';

const STORAGE_KEY = 'paleoglossa_knowledge';
const STATS_KEY = 'paleoglossa_stats';

export interface KnowledgeMap {
  [lemma: string]: WordState;
}

export interface ReadingStats {
  totalKnown: number;
  readToday: number;
  readingTime: number; // minutes
  lastActive: string; // ISO date
}

export const useKnowledge = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try { return JSON.parse(saved); } catch { return {}; }
  });

  const [stats, setStats] = useState<ReadingStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    const initialStats = {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: new Date().toISOString()
    };
    if (!saved) return initialStats;
    try {
      const parsed = JSON.parse(saved);
      // Reset daily stats if it's a new day
      const last = new Date(parsed.lastActive);
      const now = new Date();
      if (last.toDateString() !== now.toDateString()) {
        return { ...parsed, readToday: 0, lastActive: now.toISOString() };
      }
      return parsed;
    } catch { return initialStats; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledge));
    
    // Update total known stat based on knowledge map
    const knownCount = Object.values(knowledge).filter(s => s === WordState.KNOWN).length;
    setStats(prev => ({ ...prev, totalKnown: knownCount }));
  }, [knowledge]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const setWordState = useCallback((lemma: string, state: WordState) => {
    setKnowledge(prev => ({
      ...prev,
      [lemma]: state
    }));
  }, []);

  const addReadWords = useCallback((count: number) => {
    setStats(prev => ({
      ...prev,
      readToday: prev.readToday + count,
      lastActive: new Date().toISOString()
    }));
  }, []);

  const incrementReadingTime = useCallback((minutes: number) => {
    setStats(prev => ({
      ...prev,
      readingTime: prev.readingTime + minutes,
      lastActive: new Date().toISOString()
    }));
  }, []);

  return {
    knowledge,
    setWordState,
    stats,
    addReadWords,
    incrementReadingTime,
    setKnowledge
  };
};
