export type PlanId = 'free' | 'basic_1' | 'duo_2' | 'full_all';

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';

export const TRIAL_DAYS = 14;

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd?: number;
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
    languageLimit: 1,
    importLimit: 5,
    aiAnalysisLimit: 20,
    aiLimited: true,
    features: [
      'Access to curated texts in 1 language',
      'Basic spaced repetition (up to 20 words/day)',
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
      'Access to all curated texts in 1 language',
      'Unlimited spaced repetition',
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
      'Access to all curated texts in 2 languages',
      'Unlimited spaced repetition',
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
      'Unlimited spaced repetition',
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
  return PLANS.find(p => p.id === planId) || PLANS[0];
}

export function getLanguageLimit(planId: PlanId): number | 'all' {
  return getPlanById(planId).languageLimit;
}

export function canAddLanguage(planId: PlanId, selectedLanguageIds: string[]): boolean {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return true;
  return selectedLanguageIds.length < limit;
}

export function canAccessLanguage(planId: PlanId, languageId: string, selectedLanguageIds: string[]): boolean {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return true;
  return selectedLanguageIds.includes(languageId);
}

export function getLockedLanguages(planId: PlanId, selectedLanguageIds: string[]): string[] {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return [];
  return selectedLanguageIds.length >= limit ? [] : selectedLanguageIds;
}

export function getRemainingLanguageSlots(planId: PlanId, selectedLanguageIds: string[]): number {
  const limit = getLanguageLimit(planId);
  if (limit === 'all') return Infinity;
  return Math.max(0, limit - selectedLanguageIds.length);
}
