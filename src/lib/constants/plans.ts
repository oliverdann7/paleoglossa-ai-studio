export type PlanId = 'free' | 'basic_1' | 'duo_2' | 'full_all';

/**
 * Maximum number of tracked vocabulary words allowed per language on the free plan
 * (or for non-unlocked languages on paid plans).
 * Words in states NEW and IGNORED are excluded from this count.
 */
export const FREE_LANGUAGE_WORD_LIMIT = 25;

/**
 * Returns true for word states that count against the vocabulary limit.
 * NEW and IGNORED words do NOT count — only actively-studied words do.
 */
export function isTrackedWordState(state: unknown): boolean {
  return (
    state === 'SEEN' || state === 'LEARNING' || state === 'FAMILIAR' || state === 'KNOWN'
  );
}

/**
 * Returns true if the given plan has any per-language vocabulary limit
 * (i.e., at least some languages are capped). Full Pack has no limits.
 */
export function hasVocabLimit(planId: PlanId): boolean {
  return planId !== 'full_all';
}

/**
 * Returns true if a specific language has been unlocked for unlimited vocabulary
 * on the given plan (i.e., no word cap applies to that language).
 */
export function isLanguageUnlocked(
  planId: PlanId,
  unlockedLanguageIds: string[],
  languageId: string
): boolean {
  if (planId === 'full_all') return true;
  if (planId === 'free') return false;
  return unlockedLanguageIds.includes(languageId);
}

/**
 * Returns true if a vocabulary word limit is enforced for the given language
 * on the given plan. All languages are accessible; only the save cap is enforced.
 */
export function hasVocabLimitForLanguage(
  planId: PlanId,
  unlockedLanguageIds: string[],
  languageId: string
): boolean {
  return !isLanguageUnlocked(planId, unlockedLanguageIds, languageId);
}

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';

export const TRIAL_DAYS = 14;

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd?: number;
  /**
   * Number of languages the user can unlock for unlimited vocabulary saves.
   * 0 = free plan (all languages capped at FREE_LANGUAGE_WORD_LIMIT words each).
   * 'all' = Full Pack (all languages unlimited).
   * All plans provide access to every language — this only governs the save cap.
   */
  languageLimit: number | 'all';
  importLimit: number | 'all';
  aiAnalysisLimit: number | 'all';
  aiLimited: boolean;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    languageLimit: 0,
    importLimit: 5,
    aiAnalysisLimit: 20,
    aiLimited: true,
    features: [
      'Access to curated texts in all languages',
      'Save up to 25 words per language',
      'Basic spaced repetition',
      'Standard dictionary definitions',
    ],
  },
  {
    id: 'basic_1',
    name: 'Basic',
    monthlyPriceUsd: 6,
    yearlyPriceUsd: 50,
    languageLimit: 1,
    importLimit: 50,
    aiAnalysisLimit: 200,
    aiLimited: true,
    features: [
      'Access to all curated texts in all languages',
      'Unlimited vocabulary saves in 1 language of your choice',
      '25-word cap remains on all other languages',
      'Import your own texts (up to 50)',
      'AI morphology & gloss analysis',
      'Standard support',
    ],
  },
  {
    id: 'duo_2',
    name: 'Duo',
    monthlyPriceUsd: 10,
    yearlyPriceUsd: 90,
    languageLimit: 2,
    importLimit: 200,
    aiAnalysisLimit: 1000,
    aiLimited: true,
    features: [
      'Access to all curated texts in all languages',
      'Unlimited vocabulary saves in 2 languages of your choice',
      'Import your own texts (up to 200)',
      'AI morphology & gloss analysis',
      'Public library sharing',
      'Priority support',
    ],
    recommended: true,
    badge: 'Most Popular',
  },
  {
    id: 'full_all',
    name: 'Full Pack',
    monthlyPriceUsd: 15,
    yearlyPriceUsd: 130,
    languageLimit: 'all',
    importLimit: 'all',
    aiAnalysisLimit: 'all',
    aiLimited: false,
    features: [
      'Access to all curated texts in all 11 languages',
      'Unlimited vocabulary saves in every language',
      'Unlimited text imports',
      'Unlimited AI morphology & gloss analysis',
      'Public library sharing & forking',
      'All experimental features (Tutor, Grammar, Syntax, etc.)',
      'Priority support',
    ],
    badge: 'Best Value',
  },
];

export function getPlanById(planId: PlanId): Plan {
  return PLANS.find((p) => p.id === planId) || PLANS[0];
}

export function getLanguageLimit(planId: PlanId): number | 'all' {
  return getPlanById(planId).languageLimit;
}

/**
 * Returns true if the user can unlock one more language for unlimited vocabulary
 * (i.e., they have a remaining paid language slot).
 */
export function canAddLanguage(planId: PlanId, selectedLanguageIds: string[]): boolean {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return true;
  return selectedLanguageIds.length < limit;
}

/**
 * All plans can access all languages. Language access is no longer gated by plan.
 * Only vocabulary save limits differ between plans.
 * @deprecated Use isLanguageUnlocked to check vocabulary save limits.
 */
export function canAccessLanguage(): boolean {
  return true;
}

export function getRemainingLanguageSlots(planId: PlanId, selectedLanguageIds: string[]): number {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return Infinity;
  return Math.max(0, (limit as number) - selectedLanguageIds.length);
}
