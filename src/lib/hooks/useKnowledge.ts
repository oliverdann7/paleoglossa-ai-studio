import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates';
import { ImportService } from '../services/importService';
import { STORAGE_KEYS } from '../constants/storage';
import { useVocabulary } from './useVocabulary';
import { useStats } from './useStats';
import { useReadingProgress } from './useReadingProgress';
import { useAuth } from './useAuth';

export const useKnowledge = () => {
  const vocab = useVocabulary();
  const statsHook = useStats();
  const progress = useReadingProgress();
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [userImports, setUserImports] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    ImportService.getImports(userId).then(imports => {
      if (active) setUserImports(imports);
    });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!vocab.isLoading && !statsHook.isLoading) {
      const knownCount = Object.values(vocab.knowledge).filter(v => v.state === WordState.KNOWN).length;
      if (statsHook.stats.totalKnown !== knownCount) {
        statsHook.updateStatsState(s => ({ ...s, totalKnown: knownCount }));
      }
    }
  }, [vocab.isLoading, statsHook.isLoading, vocab.knowledge]);

  const refreshImports = useCallback(async () => {
    const dbImports = await ImportService.getImports(userId);
    setUserImports(dbImports);
  }, [userId]);

  const exportData = useCallback(async () => {
    const imports = await ImportService.getImports(userId);
    return {
      knowledge: vocab.knowledge,
      stats: statsHook.stats,
      imports,
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
    };
  }, [vocab.knowledge, statsHook.stats, userId]);

  const setWordStateWithStats = useCallback((lemma: string, state: WordState, languageId: string = "unknown", context?: string) => {
    vocab.setWordState(lemma, state, languageId, context);
    if (state === WordState.KNOWN) {
      statsHook.updateStatsState(s => ({ ...s, totalKnown: s.totalKnown + 1 }));
    }
  }, [vocab, statsHook]);

  return {
    knowledge: vocab.knowledge,
    getWordInfo: vocab.getWordInfo,
    setWordState: setWordStateWithStats,
    updateWordSRS: vocab.updateWordSRS,
    setWordNote: vocab.setWordNote,
    setWordContext: vocab.setWordContext,
    incrementEncounter: vocab.incrementEncounter,
    updateGloss: vocab.updateGloss,
    markPageAsSeen: vocab.markPageAsSeen,
    stats: statsHook.stats,
    addReadWords: statsHook.addReadWords,
    incrementReadingTime: statsHook.incrementReadingTime,
    recordReviewSession: statsHook.recordReviewSession,
    userImports,
    refreshImports,
    exportData,
    fetchTextProgress: progress.fetchTextProgress,
    saveTextProgress: progress.saveTextProgress,
    getAllProgress: progress.getAllProgress,
    isLoading: vocab.isLoading || statsHook.isLoading,
    error: vocab.error || statsHook.error
  };
};
