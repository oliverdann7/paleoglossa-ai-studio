import { useMemo } from 'react';
import type { KnowledgeMap } from '../services/vocabularyService.js';
import { useSubscription } from '../contexts/SubscriptionContext.js';
import { FREE_LANGUAGE_WORD_LIMIT, hasVocabLimitForLanguage } from '../constants/plans.js';
import { countTrackedWords } from '../utils/vocabCount.js';

// Re-export for callers that want the pure function alongside the hook.
export { countTrackedWords } from '../utils/vocabCount.js';

export interface VocabLimitInfo {
  /** The language this limit info is computed for. */
  languageId: string;
  /** Current number of tracked words in this language. */
  count: number;
  /** Maximum allowed tracked words per language on non-unlimited plans. */
  limit: number;
  /** True when the count has reached or exceeded the limit. */
  isFull: boolean;
  /** True when a vocabulary save limit is enforced for this language. */
  isEnabled: boolean;
}

/**
 * Returns vocabulary limit info for a specific language.
 *
 * All plans can access all languages; this only governs how many words
 * can be saved. Free users are capped at FREE_LANGUAGE_WORD_LIMIT words
 * per language. Paid users have unlimited saves for their unlocked
 * language(s) (stored in selectedLanguageIds).
 *
 * Pass in the `knowledge` map already loaded by `useKnowledge`/`useVocabulary`
 * to avoid a second Firestore read.
 *
 * Example:
 * ```ts
 * const { knowledge } = useKnowledge(languageId);
 * const vocabLimit = useVocabLimit(knowledge, languageId);
 * if (vocabLimit.isFull) showPaywall();
 * ```
 */
export function useVocabLimit(knowledge: KnowledgeMap, languageId: string): VocabLimitInfo {
  const { subscription } = useSubscription();
  const isEnabled =
    languageId !== '' &&
    hasVocabLimitForLanguage(
      subscription.currentPlan,
      subscription.selectedLanguageIds,
      languageId
    );
  const limit = FREE_LANGUAGE_WORD_LIMIT;

  const count = useMemo(() => {
    if (!isEnabled) return 0;
    return countTrackedWords(knowledge, languageId);
  }, [knowledge, languageId, isEnabled]);

  return {
    languageId,
    count,
    limit,
    isFull: isEnabled && count >= limit,
    isEnabled,
  };
}
