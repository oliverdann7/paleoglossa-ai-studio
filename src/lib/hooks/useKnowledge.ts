import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates.js';
import { ImportService } from '../services/importService.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { useVocabulary } from './useVocabulary.js';
import { useStats } from './useStats.js';
import { useReadingProgress } from './useReadingProgress.js';
import { useAuth } from './useAuth.js';

export const useKnowledge = (languageId?: string) => {
  const vocab = useVocabulary();
  const statsHook = useStats(languageId);
  const progress = useReadingProgress(languageId);
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [userImports, setUserImports] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    ImportService.getImports(userId).then((imports) => {
      if (active) setUserImports(imports);
    });
    return () => {
      active = false;
    };
  }, [userId]);

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
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
    };
  }, [vocab.knowledge, statsHook.stats, userId]);

  const setWordStateWithStats = useCallback(
    (lemma: string, state: WordState, langId: string = 'unknown', context?: string) => {
      const previousState = vocab.getWordInfo(lemma).state;
      vocab.setWordState(lemma, state, langId, context);
      if (state === WordState.KNOWN && previousState !== WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: s.totalKnown + 1 }));
      } else if (state !== WordState.KNOWN && previousState === WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: Math.max(0, s.totalKnown - 1) }));
      }
    },
    [vocab, statsHook]
  );

  return {
    knowledge: vocab.knowledge,
    knowledgeVersion: vocab.knowledgeVersion,
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
    error: vocab.error || statsHook.error,
  };
};
