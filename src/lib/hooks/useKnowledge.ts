import { useState, useEffect, useCallback } from 'react';
import { WordState } from '../constants/wordStates.js';
import { ImportService } from '../services/importService.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { useVocabulary } from './useVocabulary.js';
import { useStats } from './useStats.js';
import { useReadingProgress } from './useReadingProgress.js';
import { useAuth } from './useAuth.js';
import { useVocabLimit } from './useVocabLimit.js';
import { isTrackedWordState } from '../constants/plans.js';
import { usePublishVocabLimit } from '../contexts/VocabLimitContext.js';

export const useKnowledge = (languageId?: string) => {
  const vocab = useVocabulary();
  const statsHook = useStats(languageId);
  const progress = useReadingProgress(languageId);
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [userImports, setUserImports] = useState<any[]>([]);

  // Vocab limit — computed from the already-loaded knowledge map, no extra Firestore reads.
  const vocabLimit = useVocabLimit(vocab.knowledge);

  // Publish the latest limit info to VocabLimitContext so navbar components
  // (LanguageSwitcher) can display the count without a second Firestore read.
  const publishVocabLimit = usePublishVocabLimit();
  useEffect(() => {
    publishVocabLimit(vocabLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabLimit.count, vocabLimit.isFull, vocabLimit.isEnabled, vocabLimit.freeLangId]);

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
    (
      lemma: string,
      state: WordState,
      langId: string = 'unknown',
      context?: string
    ): boolean => {
      const previousState = vocab.getWordInfo(lemma).state;

      // Guard: block new tracked-word saves when the free-language limit is full.
      // Only blocks when ALL conditions hold:
      //   1. The target language is the user's free language slot
      //   2. A vocab limit is in effect (free plan)
      //   3. The word is currently NOT tracked (NEW or IGNORED)
      //   4. The new state IS tracked (SEEN/LEARNING/FAMILIAR/KNOWN)
      //   5. The limit has been reached
      const isNewTracked =
        !isTrackedWordState(previousState) && isTrackedWordState(state);
      if (
        isNewTracked &&
        vocabLimit.isEnabled &&
        langId === vocabLimit.freeLangId &&
        vocabLimit.isFull
      ) {
        // Return false to signal that the save was blocked; the caller can
        // show a paywall prompt instead of silently doing nothing.
        return false;
      }

      vocab.setWordState(lemma, state, langId, context);
      if (state === WordState.KNOWN && previousState !== WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: s.totalKnown + 1 }));
      } else if (state !== WordState.KNOWN && previousState === WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: Math.max(0, s.totalKnown - 1) }));
      }
      return true;
    },
    [vocab, statsHook, vocabLimit]
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
    vocabLimit,
  };
};
