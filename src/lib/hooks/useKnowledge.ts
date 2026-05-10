import { useState, useEffect, useCallback, useRef } from 'react';
import { WordState } from '../constants/wordStates';
import { VocabularyService, KnowledgeMap, WordInfo, SRSData } from '../services/vocabularyService';
import { StatsService, ReadingStats } from '../services/statsService';
import { ImportService } from '../services/importService';
import { useAuth } from './useAuth';

export const useKnowledge = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [knowledge, setKnowledge] = useState<KnowledgeMap>({});
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [userImports, setUserImports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for debouncing stats updates
  const statsUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    let active = true;
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dbVocab = await VocabularyService.getVocabulary(userId);
        const dbStats = await StatsService.getStats(userId);
        const dbImports = await ImportService.getImports(userId);
        
        if (!active) return;

        setKnowledge(dbVocab);
        setUserImports(dbImports);
        
        // Handle migration if user just logged in and has local data
        if (userId) {
          const localKnowledge = localStorage.getItem('paleoglossa_knowledge');
          if (localKnowledge) {
            const hasData = Object.keys(JSON.parse(localKnowledge)).length > 0;
            if (hasData) {
              const count = await VocabularyService.migrateLocalStorage(userId);
              if (count > 0) {
                console.log(`Migrated ${count} vocabulary items to Firestore`);
                // Re-fetch to be safe
                const updatedVocab = await VocabularyService.getVocabulary(userId);
                setKnowledge(updatedVocab);
              }
            }
          }
          
          const localStats = localStorage.getItem('paleoglossa_stats');
          if (localStats) {
            await StatsService.migrateLocalStorage(userId);
            // Re-fetch stats
            const updatedStats = await StatsService.getStats(userId);
            setStats(updatedStats);
          }
        }

        // Streak and Daily reset logic
        const now = new Date();
        now.setUTCHours(now.getUTCHours() - 4); // 4am boundary
        
        let needUpdate = false;
        const currentStats = { ...dbStats };

        if (currentStats.lastActive) {
          const last = new Date(currentStats.lastActive);
          last.setUTCHours(last.getUTCHours() - 4);
          
          let newStreak = currentStats.streak || 0;
          let freezesTotal = currentStats.freezesTotal ?? 2;
          let freezesUsed = currentStats.freezesUsed ?? 0;
          
          const diffDays = Math.floor(now.valueOf() / 86400000) - Math.floor(last.valueOf() / 86400000);

          // Reset freezes monthly roughly
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
                newStreak = 1; // Streak broken
              }
            }

            // Save history for yesterday/last active day
            if (currentStats.readToday > 0 || currentStats.readingTime > 0) {
              const history = [...(currentStats.history || [])];
              const lastStr = last.toISOString().split('T')[0];
              if (!history.find(h => h.date === lastStr)) {
                history.push({
                  date: lastStr,
                  knownWords: currentStats.totalKnown,
                  readWords: currentStats.readToday,
                  minutes: currentStats.readingTime
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

        // Sync known count
        const knownCount = Object.values(dbVocab).filter(v => v.state === WordState.KNOWN).length;
        if (currentStats.totalKnown !== knownCount) {
          currentStats.totalKnown = knownCount;
          needUpdate = true;
        }

        setStats(currentStats);

        if (needUpdate) {
          StatsService.updateStats(userId, currentStats);
        }
      } catch (e: any) {
        console.error("useKnowledge init error:", e);
        setError(e.message || "Failed to load data");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, [userId]);

  const updateStatsState = useCallback((updater: (prev: ReadingStats) => ReadingStats) => {
    setStats(prev => {
      if (!prev) return null;
      const next = updater(prev);
      
      // Debounced sync to Firestore for high-frequency updates
      if (statsUpdateTimer.current) clearTimeout(statsUpdateTimer.current);
      statsUpdateTimer.current = setTimeout(() => {
        StatsService.updateStats(userId, next);
      }, 2000);
      
      return next;
    });
  }, [userId]);

  const setWordState = useCallback((lemma: string, state: WordState, languageId: string = "unknown", context?: string) => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      const info: WordInfo = { ...current, state, languageId };
      
      if (context && (!info.contexts || !info.contexts.includes(context))) {
        info.contexts = [...(info.contexts || []), context].slice(-5);
      }

      if (state === WordState.LEARNING && !info.srs) {
        info.srs = {
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          interval: 0,
          ease: 2.5,
          step: 0
        };
      }
      return { ...prev, [lemma]: info };
    });
    
    VocabularyService.setWordState(userId, lemma, state, languageId);
    
    // UI update for known count
    if (state === WordState.KNOWN) {
      updateStatsState(s => ({ ...s, totalKnown: s.totalKnown + 1 }));
    }
  }, [userId, updateStatsState]);

  const updateWordSRS = useCallback((lemma: string, srs: SRSData, state: WordState, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      return { ...prev, [lemma]: { ...current, srs, state, languageId } };
    });
    VocabularyService.updateSRS(userId, lemma, srs, state, languageId);
  }, [userId]);

  const fetchTextProgress = useCallback(async (textId: string) => {
    return StatsService.getTextProgress(userId, textId);
  }, [userId]);

  const saveTextProgress = useCallback(async (progress: any) => {
    return StatsService.setTextProgress(userId, progress);
  }, [userId]);

  const getAllProgress = useCallback(async () => {
    return StatsService.getAllProgress(userId);
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

  const recordReviewSession = useCallback((accuracy: number) => {
    updateStatsState(prev => {
      // Update lastAccuracy
      return {
        ...prev,
        lastAccuracy: accuracy,
        lastActive: new Date().toISOString()
      };
    });
  }, [updateStatsState]);

  const markPageAsSeen = useCallback((tokens: any[]) => {
    setKnowledge(prev => {
      const next = { ...prev };
      tokens.forEach(token => {
        if (!token.lemma) return;
        const current = next[token.lemma] || { addedAt: new Date().toISOString() };
        const state = typeof current === "object" ? (current as any).state : current;
        
        // Only mark as seen if it was new
        if (state === WordState.NEW) {
          next[token.lemma] = { ...current, state: WordState.SEEN, languageId: token.languageId || "unknown" } as any;
        }
      });
      return next;
    });
    
    // In a real app, we might also sync this to Firestore in bulk
    tokens.forEach(token => {
      if (!token.lemma) return;
      const state = knowledge[token.lemma] ? (typeof knowledge[token.lemma] === "object" ? (knowledge[token.lemma] as any).state : knowledge[token.lemma]) : WordState.NEW;
      if (state === WordState.NEW) {
        VocabularyService.setWordState(userId, token.lemma, WordState.SEEN, token.languageId || "unknown");
      }
    });
  }, [userId, knowledge]);

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

  const setWordNote = useCallback((lemma: string, notes: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      return { ...prev, [lemma]: { ...current, notes } };
    });
    VocabularyService.setWordNote(userId, lemma, notes, languageId);
  }, [userId]);

  const incrementEncounter = useCallback((lemma: string, languageId: string = "unknown") => {
    VocabularyService.incrementEncounter(userId, lemma, languageId);
  }, [userId]);

  const updateGloss = useCallback((lemma: string, gloss: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      return { ...prev, [lemma]: { ...current, userGloss: gloss } as any };
    });
    VocabularyService.updateGloss(userId, lemma, gloss, languageId);
  }, [userId]);

  const setWordContext = useCallback((lemma: string, context: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      const contexts = current.contexts || [];
      if (contexts.includes(context)) return prev;
      return { ...prev, [lemma]: { ...current, contexts: [...contexts, context].slice(-5) } };
    });
    VocabularyService.setWordContext(userId, lemma, context, languageId);
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
    setWordContext,
    incrementEncounter,
    updateGloss,
    recordReviewSession,
    markPageAsSeen,
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
    getAllProgress,
    isLoading,
    error
  };
};
