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
import { normalizeLemmaKey } from '../utils/lemmaUtils.js';
import type { ReadingContext } from '../review/readingContext.js';
import { useTranslation } from 'react-i18next';
import { useToast } from './useToast.js';
import { checkKnownWordMilestone } from '../services/milestoneService.js';
import { trackEvent, ANALYTICS_EVENTS } from '../analytics.js';

export const useKnowledge = (languageId?: string) => {
  const vocab = useVocabulary();
  const statsHook = useStats(languageId);
  const progress = useReadingProgress(languageId);
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [userImports, setUserImports] = useState<any[]>([]);
  const { t } = useTranslation();
  const { addToast } = useToast();

  // Vocab limit — computed from the already-loaded knowledge map, no extra Firestore reads.
  // Pass the current languageId so the limit is scoped to the active language.
  const vocabLimit = useVocabLimit(vocab.knowledge, languageId ?? '');

  // Publish the latest limit info to VocabLimitContext so navbar components
  // (LanguageSwitcher) can display the count without a second Firestore read.
  const publishVocabLimit = usePublishVocabLimit();
  useEffect(() => {
    publishVocabLimit(vocabLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabLimit.count, vocabLimit.isFull, vocabLimit.isEnabled, vocabLimit.languageId]);

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
      context?: string,
      extra?: Partial<ReadingContext>
    ): boolean => {
      const previousState = vocab.getWordInfo(lemma).state;

      // Guard: block new tracked-word saves when the free-language limit is full.
      // Only blocks when ALL conditions hold:
      //   1. The target language is the user's free language slot
      //   2. A vocab limit is in effect (free plan)
      //   3. The word is currently NOT tracked (NEW or IGNORED)
      //   4. The new state IS tracked (SEEN/LEARNING/FAMILIAR/KNOWN)
      //   5. The limit has been reached
      const isNewTracked = !isTrackedWordState(previousState) && isTrackedWordState(state);
      if (
        isNewTracked &&
        vocabLimit.isEnabled &&
        langId === vocabLimit.languageId &&
        vocabLimit.isFull
      ) {
        // Return false to signal that the save was blocked; the caller can
        // show a paywall prompt instead of silently doing nothing.
        return false;
      }

      vocab.setWordState(lemma, state, langId, context, extra);
      if (state === WordState.KNOWN && previousState !== WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: s.totalKnown + 1 }));
        // Known-word laurels (roadmap § 11, 3.5): celebrate 50/100/500/1000.
        const newKnown = (statsHook.stats.totalKnown ?? 0) + 1;
        const milestone = checkKnownWordMilestone(langId, newKnown);
        if (milestone !== null) {
          addToast(
            t('milestones.knownWords', '🏛️ {{count}} words known — explicit feliciter!', {
              count: milestone,
            }),
            'success'
          );
          trackEvent(ANALYTICS_EVENTS.KNOWN_WORD_MILESTONE, { languageId: langId, milestone });
        }
      } else if (state !== WordState.KNOWN && previousState === WordState.KNOWN) {
        statsHook.updateStatsState((s) => ({ ...s, totalKnown: Math.max(0, s.totalKnown - 1) }));
      }
      return true;
    },
    [vocab, statsHook, vocabLimit, addToast, t]
  );

  // Guarded markPageAsSeen: filters out words that would exceed the free-language
  // vocab limit before delegating to the underlying vocabulary hook.
  const markPageAsSeenGuarded = useCallback(
    (tokens: any[]) => {
      if (!vocabLimit.isEnabled || !vocabLimit.isFull) {
        vocab.markPageAsSeen(tokens);
        return;
      }
      // Limit is full: only allow tokens already tracked (state changes on known words are fine),
      // and skip new-tracked writes for the free language.
      const allowed = tokens.filter((token) => {
        if (!token.lemma) return false;
        const lang = token.languageId || token.language || 'unknown';
        if (lang !== vocabLimit.languageId) return true; // non-current-language tokens pass through
        const normKey = normalizeLemmaKey(token.lemma);
        const existing = vocab.knowledge[normKey];
        return existing && isTrackedWordState(existing.state); // only already-tracked words
      });
      if (allowed.length > 0) vocab.markPageAsSeen(allowed);
    },
    [vocab, vocabLimit]
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
    markPageAsSeen: markPageAsSeenGuarded,
    stats: statsHook.stats,
    addReadWords: statsHook.addReadWords,
    incrementReadingTime: statsHook.incrementReadingTime,
    recordReviewSession: statsHook.recordReviewSession,
    declareSabbatical: statsHook.declareSabbatical,
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
