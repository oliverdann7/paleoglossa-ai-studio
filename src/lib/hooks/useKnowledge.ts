import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates';
import { VocabularyService, KnowledgeMap, WordInfo, SRSData } from '../services/vocabularyService';
import { ProgressService, ReadingStats } from '../services/progressService';
import { ImportService } from '../services/importService';
import { useAuth } from '../contexts/AuthContext';

export const useKnowledge = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [knowledge, setKnowledge] = useState<KnowledgeMap>({});
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [userImports, setUserImports] = useState<any[]>([]);

  // Initialize data
  useEffect(() => {
    let active = true;
    const init = async () => {
      const dbVocab = await VocabularyService.getVocabulary(userId);
      const dbStats = await ProgressService.getStats(userId);
      const dbImports = await ImportService.getImports(userId);
      
      if (active) {
        setKnowledge(dbVocab);
        setUserImports(dbImports);
        
        // Compute streak logic
        const now = new Date();
        now.setUTCHours(now.getUTCHours() - 4);
        
        let needUpdate = false;
        if (dbStats.lastActive) {
          const last = new Date(dbStats.lastActive);
          last.setUTCHours(last.getUTCHours() - 4);
          
          let newStreak = dbStats.streak || 0;
          let freezesTotal = dbStats.freezesTotal ?? 2;
          let freezesUsed = dbStats.freezesUsed ?? 0;
          
          const diffDays = Math.floor(now.valueOf() / 86400000) - Math.floor(last.valueOf() / 86400000);

          // Reset freezes monthly
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

            const history = dbStats.history || [];
            const todayStr = last.toISOString().split('T')[0];
            if (!history.find((h: any) => h.date === todayStr)) {
              history.push({
                date: todayStr,
                knownWords: dbStats.totalKnown, // Need to make sure totalKnown is calculated
                readWords: dbStats.readToday,
                minutes: dbStats.readingTime
              });
            }
            if (history.length > 90) history.shift();

            dbStats.readToday = 0;
            dbStats.readingTime = 0;
            dbStats.streak = newStreak;
            dbStats.freezesTotal = freezesTotal;
            dbStats.freezesUsed = freezesUsed;
            dbStats.lastActive = new Date().toISOString();
            dbStats.history = history;
          }
        }

        // Re-count known words to ensure consistency
        const knownCount = Object.values(dbVocab).filter(v => v.state === WordState.KNOWN).length;
        if (dbStats.totalKnown !== knownCount) {
          dbStats.totalKnown = knownCount;
          needUpdate = true;
        }

        setStats(dbStats);

        if (needUpdate) {
          ProgressService.updateStats(userId, dbStats);
        }
      }
    };
    init();
    return () => { active = false; };
  }, [userId]);

  const updateStatsState = useCallback((updater: (prev: ReadingStats) => ReadingStats) => {
    setStats(prev => {
      if (!prev) return null;
      const next = updater(prev);
      ProgressService.updateStats(userId, next); // Sync immediately
      return next;
    });
  }, [userId]);

  const setWordState = useCallback((lemma: string, state: WordState, language?: string) => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      const info: WordInfo = { ...current, state };
      
      if (state === WordState.LEARNING && !info.srs) {
        info.srs = {
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          interval: 0,
          easing: 2.5,
          step: 0
        };
      }
      return { ...prev, [lemma]: info };
    });
    
    VocabularyService.setWordState(userId, lemma, state, language);
    
    if (state === WordState.KNOWN) {
      updateStatsState(s => ({ ...s, totalKnown: s.totalKnown + 1 }));
    }
  }, [userId, updateStatsState]);

  const updateWordSRS = useCallback((lemma: string, srs: SRSData, state: WordState) => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      return { ...prev, [lemma]: { ...current, srs, state } };
    });
    VocabularyService.updateSRS(userId, lemma, srs, state);
  }, [userId]);

  const fetchTextProgress = useCallback(async (textId: string) => {
    return ProgressService.getTextProgress(userId, textId);
  }, [userId]);

  const saveTextProgress = useCallback(async (progress: any) => {
    return ProgressService.setTextProgress(userId, progress);
  }, [userId]);

  const getAllProgress = useCallback(async () => {
    return ProgressService.getAllProgress(userId);
  }, [userId]);

  const refreshImports = useCallback(async () => {
    const dbImports = await ImportService.getImports(userId);
    setUserImports(dbImports);
  }, [userId]);

  const getWordInfo = useCallback((lemma: string): WordInfo => {
    const val = knowledge[lemma];
    if (!val) return { state: WordState.NEW, addedAt: new Date().toISOString() };
    return val;
  }, [knowledge]);

  const addReadWords = useCallback((count: number) => {
    updateStatsState(prev => ({
      ...prev,
      readToday: (prev.readToday || 0) + count,
      lastActive: new Date().toISOString()
    }));
  }, [updateStatsState]);

  const incrementReadingTime = useCallback((minutes: number) => {
    updateStatsState(prev => ({
      ...prev,
      readingTime: (prev.readingTime || 0) + minutes,
      lastActive: new Date().toISOString()
    }));
  }, [updateStatsState]);

  const setWordNote = useCallback((lemma: string, notes: string) => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString() };
      return { ...prev, [lemma]: { ...current, notes } };
    });
    VocabularyService.setWordNote(userId, lemma, notes);
  }, [userId]);

  const exportData = useCallback(async () => {
    const imports = await ImportService.getImports(userId);
    return {
      knowledge,
      stats,
      imports,
      settings: JSON.parse(localStorage.getItem('paleoglossa_settings') || '{}')
    };
  }, [knowledge, stats, userId]);

  return {
    knowledge,
    getWordInfo,
    setWordState,
    updateWordSRS,
    setWordNote,
    stats: stats || {
      totalKnown: 0,
      readToday: 0,
      readingTime: 0,
      lastActive: new Date().toISOString(),
      streak: 1,
      history: [],
      freezesTotal: 2,
      freezesUsed: 0
    } as ReadingStats,
    addReadWords,
    incrementReadingTime,
    setKnowledge,
    userImports,
    refreshImports,
    exportData,
    fetchTextProgress,
    saveTextProgress,
    getAllProgress
  };
};
