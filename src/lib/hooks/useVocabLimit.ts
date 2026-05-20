import { useMemo } from 'react';
import type { KnowledgeMap } from '../services/vocabularyService.js';
import { useSubscription } from '../contexts/SubscriptionContext.js';
import { FREE_LANGUAGE_WORD_LIMIT, hasVocabLimit } from '../constants/plans.js';
import { countTrackedWords } from '../utils/vocabCount.js';

// Re-export for callers that want the pure function alongside the hook.
export { countTrackedWords } from '../utils/vocabCount.js';

export interface VocabLimitInfo {
  /** The language the limit applies to (first selected language on free plan). */
  freeLangId: string;
  /** Current number of tracked words in the free language. */
  count: number;
  /** Maximum allowed tracked words (FREE_LANGUAGE_WORD_LIMIT on free plan). */
  limit: number;
  /** True when the count has reached or exceeded the limit. */
  isFull: boolean;
  /** True when a vocabulary limit is enforced (free plan only). */
  isEnabled: boolean;
}

/**
 * Returns vocabulary limit info for the current user's free language slot.
 *
 * Pass in the `knowledge` map already loaded by `useKnowledge`/`useVocabulary`
 * to avoid a second Firestore read.
 *
 * Example:
 * ```ts
 * const { knowledge } = useKnowledge(languageId);
 * const vocabLimit = useVocabLimit(knowledge);
 * if (vocabLimit.isFull) showPaywall();
 * ```
 */
export function useVocabLimit(knowledge: KnowledgeMap): VocabLimitInfo {
  const { subscription } = useSubscription();
  const freeLangId = subscription.selectedLanguageIds[0] ?? 'grc';
  const isEnabled = hasVocabLimit(subscription.currentPlan);
  const limit = FREE_LANGUAGE_WORD_LIMIT;

  const count = useMemo(() => {
    if (!isEnabled) return 0;
    return countTrackedWords(knowledge, freeLangId);
  }, [knowledge, freeLangId, isEnabled]);

  return {
    freeLangId,
    count,
    limit,
    isFull: isEnabled && count >= limit,
    isEnabled,
  };
}
