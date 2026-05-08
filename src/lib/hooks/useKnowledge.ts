import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates';

const STORAGE_KEY = 'paleoglossa_knowledge';
const STATS_KEY = 'paleoglossa_stats';

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

export interface KnowledgeMap {
  [lemma: string]: WordInfo | WordState;
}

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
}

export const useKnowledge = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try { 
      const parsed = JSON.parse(saved);
      // Migrate old number-only format if necessary
      Object.keys(parsed).forEach(key => {
        if (typeof parsed[key] === 'number') {
          parsed[key] = {
            state: parsed[key] as WordState,
            addedAt: new Date().toISOString()
          };
        }
      });
      return parsed;
    } catch { return {}; }
  });

  const [stats, setStats] = useState<ReadingStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    const now = new Date();
    const initialStats: ReadingStats = {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: now.toISOString(),
      streak: 1,
      history: []
    };

    if (!saved) return initialStats;
    try {
      const parsed = JSON.parse(saved);
      const last = new Date(parsed.lastActive);
      
      // Daily reset logic
      if (last.toDateString() !== now.toDateString()) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak = parsed.streak || 0;
        if (last.toDateString() === yesterday.toDateString()) {
           newStreak += 1;
        } else if (last.getTime() < yesterday.getTime()) {
           newStreak = 1;
        }

        // Add to history
        const history = parsed.history || [];
        const todayStr = last.toISOString().split('T')[0];
        if (!history.find((h: any) => h.date === todayStr)) {
          history.push({
            date: todayStr,
            knownWords: parsed.totalKnown,
            readWords: parsed.readToday,
            minutes: parsed.readingTime
          });
        }

        return { 
          ...parsed, 
          readToday: 0, 
          readingTime: 0, 
          streak: newStreak, 
          lastActive: now.toISOString(),
          history
        };
      }
      return parsed;
    } catch { return initialStats; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledge));
    
    // Update total known stat based on knowledge map
    const knownCount = Object.values(knowledge).filter(info => {
      if (typeof info === 'number') return info === WordState.KNOWN;
      return info.state === WordState.KNOWN;
    }).length;
    
    setStats(prev => ({ ...prev, totalKnown: knownCount }));
  }, [knowledge]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const setWordState = useCallback((lemma: string, state: WordState) => {
    setKnowledge(prev => {
      const current = prev[lemma];
      const info: WordInfo = typeof current === 'object' ? { ...current, state } : { state, addedAt: new Date().toISOString() };
      
      // Auto-init SRS if moving to learning
      if (state === WordState.LEARNING && !info.srs) {
        info.srs = {
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          interval: 0,
          easing: 2.5,
          step: 0
        };
      }

      return {
        ...prev,
        [lemma]: info
      };
    });
  }, []);

  const updateWordSRS = useCallback((lemma: string, srs: SRSData, state: WordState) => {
    setKnowledge(prev => {
      const current = prev[lemma];
      const info: WordInfo = typeof current === 'object' ? { ...current, state, srs } : { state, srs, addedAt: new Date().toISOString() };
      return { ...prev, [lemma]: info };
    });
  }, []);

  const getWordInfo = useCallback((lemma: string): WordInfo => {
    const val = knowledge[lemma];
    if (!val && val !== 0) return { state: WordState.NEW, addedAt: new Date().toISOString() };
    if (typeof val === 'number') return { state: val, addedAt: new Date().toISOString() };
    return val;
  }, [knowledge]);

  const addReadWords = useCallback((count: number) => {
    setStats(prev => ({
      ...prev,
      readToday: (prev.readToday || 0) + count,
      lastActive: new Date().toISOString()
    }));
  }, []);

  const incrementReadingTime = useCallback((minutes: number) => {
    setStats(prev => ({
      ...prev,
      readingTime: (prev.readingTime || 0) + minutes,
      lastActive: new Date().toISOString()
    }));
  }, []);

  return {
    knowledge,
    getWordInfo,
    setWordState,
    updateWordSRS,
    stats,
    addReadWords,
    incrementReadingTime,
    setKnowledge
  };
};
