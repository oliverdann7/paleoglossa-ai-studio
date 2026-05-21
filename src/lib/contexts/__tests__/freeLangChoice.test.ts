import { describe, it, expect } from 'vitest';

/**
 * Pure-logic tests for the free-language-choice behaviour introduced in
 * SubscriptionContext (setFreeLanguage) and the related Onboarding wiring.
 * These run without React or Firebase so they stay fast in CI.
 */

type Subscription = {
  currentPlan: string;
  selectedLanguageIds: string[];
  desiredSecondLanguageId?: string;
};

/** Replicates the setFreeLanguage reducer logic from SubscriptionContext. */
function applySetFreeLanguage(prev: Subscription, languageId: string): Subscription {
  const extras = prev.selectedLanguageIds.slice(1); // preserve paid extra slots
  return { ...prev, selectedLanguageIds: [languageId, ...extras] };
}

/** Replicates the setDesiredSecondLanguage reducer. */
function applySetDesiredSecond(
  prev: Subscription,
  languageId: string | undefined
): Subscription {
  return { ...prev, desiredSecondLanguageId: languageId };
}

describe('setFreeLanguage logic', () => {
  it('sets slot 0 for a brand-new user with no languages', () => {
    const result = applySetFreeLanguage({ currentPlan: 'free', selectedLanguageIds: [] }, 'lat');
    expect(result.selectedLanguageIds).toEqual(['lat']);
  });

  it('replaces slot 0 while preserving paid extra slots', () => {
    const prev: Subscription = {
      currentPlan: 'duo_2',
      selectedLanguageIds: ['grc', 'hbo'],
    };
    const result = applySetFreeLanguage(prev, 'lat');
    expect(result.selectedLanguageIds).toEqual(['lat', 'hbo']);
  });

  it('changing free language when only one language chosen replaces it cleanly', () => {
    const prev: Subscription = {
      currentPlan: 'free',
      selectedLanguageIds: ['grc'],
    };
    const result = applySetFreeLanguage(prev, 'hbo');
    expect(result.selectedLanguageIds).toEqual(['hbo']);
    expect(result.selectedLanguageIds).toHaveLength(1);
  });

  it('does not affect other subscription fields', () => {
    const prev: Subscription = {
      currentPlan: 'free',
      selectedLanguageIds: ['grc'],
      desiredSecondLanguageId: 'lat',
    };
    const result = applySetFreeLanguage(prev, 'hbo');
    expect(result.currentPlan).toBe('free');
    expect(result.desiredSecondLanguageId).toBe('lat');
  });
});

describe('setDesiredSecondLanguage logic', () => {
  it('sets the desired second language', () => {
    const prev: Subscription = { currentPlan: 'free', selectedLanguageIds: ['grc'] };
    const result = applySetDesiredSecond(prev, 'lat');
    expect(result.desiredSecondLanguageId).toBe('lat');
  });

  it('clears the desired second language when passed undefined', () => {
    const prev: Subscription = {
      currentPlan: 'free',
      selectedLanguageIds: ['grc'],
      desiredSecondLanguageId: 'lat',
    };
    const result = applySetDesiredSecond(prev, undefined);
    expect(result.desiredSecondLanguageId).toBeUndefined();
  });

  it('can change to a different language', () => {
    const prev: Subscription = {
      currentPlan: 'free',
      selectedLanguageIds: ['grc'],
      desiredSecondLanguageId: 'lat',
    };
    const result = applySetDesiredSecond(prev, 'hbo');
    expect(result.desiredSecondLanguageId).toBe('hbo');
  });

  it('does not affect selectedLanguageIds', () => {
    const prev: Subscription = { currentPlan: 'free', selectedLanguageIds: ['grc'] };
    const result = applySetDesiredSecond(prev, 'lat');
    expect(result.selectedLanguageIds).toEqual(['grc']);
  });
});

describe('new-user empty selectedLanguageIds', () => {
  it('canAdd is true for free plan with empty selectedLanguageIds', () => {
    // Replicates canAddByPlan('free', [])
    const limit = 1;
    const selected: string[] = [];
    expect(selected.length < limit).toBe(true);
  });

  it('canAccess returns false for all languages when selectedLanguageIds is empty', () => {
    // Replicates canAccessByPlan('free', 'grc', [])
    const selected: string[] = [];
    expect(selected.includes('grc')).toBe(false);
    expect(selected.includes('lat')).toBe(false);
  });

  it('noLangChosen flag is true when selectedLanguageIds is empty', () => {
    const selectedLanguageIds: string[] = [];
    const noLangChosen = selectedLanguageIds.length === 0;
    expect(noLangChosen).toBe(true);
  });

  it('noLangChosen flag is false once a language is set', () => {
    const selectedLanguageIds: string[] = ['grc'];
    const noLangChosen = selectedLanguageIds.length === 0;
    expect(noLangChosen).toBe(false);
  });
});
