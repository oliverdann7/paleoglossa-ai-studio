import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Control the UI language reported by i18n without booting the full i18n stack.
let mockUiLanguage = 'pt';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: mockUiLanguage } }),
}));

vi.mock('../../services/aiClient', () => ({
  AIClient: {
    fetchCachedGloss: vi.fn(async () => null),
    getWordGloss: vi.fn(async () => 'amor; afeição'),
    saveGlossToCache: vi.fn(async () => undefined),
  },
}));

import { useLocalizedGloss, getLocalizableUiLang } from '../useLocalizedGloss';
import { AIClient } from '../../services/aiClient';

const fetchCachedGloss = vi.mocked(AIClient.fetchCachedGloss);
const getWordGloss = vi.mocked(AIClient.getWordGloss);

describe('getLocalizableUiLang', () => {
  it('returns the bare language code for supported locales', () => {
    expect(getLocalizableUiLang('pt')).toBe('pt');
    expect(getLocalizableUiLang('pt-BR')).toBe('pt');
    expect(getLocalizableUiLang('de')).toBe('de');
  });

  it('returns null for English and unsupported locales', () => {
    expect(getLocalizableUiLang('en')).toBeNull();
    expect(getLocalizableUiLang('en-US')).toBeNull();
    expect(getLocalizableUiLang('ja')).toBeNull();
    expect(getLocalizableUiLang(undefined)).toBeNull();
  });
});

describe('useLocalizedGloss', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUiLanguage = 'pt';
  });

  it('swaps the English gloss for a localized one in the UI language', async () => {
    const { result } = renderHook(() => useLocalizedGloss('ἀγάπη', 'grc', 'love; affection'));

    // English shown immediately as fallback.
    expect(result.current.text).toBe('love; affection');
    expect(result.current.uiLang).toBe('pt');

    await waitFor(() => expect(result.current.localized).toBe(true));
    expect(result.current.text).toBe('amor; afeição');
    expect(getWordGloss).toHaveBeenCalledWith('grc', 'ἀγάπη', 'ἀγάπη', 'pt');
  });

  it('fetches a localized gloss even when no English gloss exists', async () => {
    const { result } = renderHook(() => useLocalizedGloss('ἀγάπη', 'grc', null));

    await waitFor(() => expect(result.current.localized).toBe(true));
    expect(result.current.text).toBe('amor; afeição');
  });

  it('prefers the server cache over a fresh AI call', async () => {
    fetchCachedGloss.mockResolvedValueOnce({ value: 'palavra; verbo' });
    const { result } = renderHook(() => useLocalizedGloss('λόγος', 'grc', 'word'));

    await waitFor(() => expect(result.current.localized).toBe(true));
    expect(result.current.text).toBe('palavra; verbo');
    expect(getWordGloss).not.toHaveBeenCalled();
  });

  it('does nothing when the UI language is English', async () => {
    mockUiLanguage = 'en';
    const { result } = renderHook(() => useLocalizedGloss('ἀγάπη', 'grc', 'love; affection'));

    expect(result.current.text).toBe('love; affection');
    expect(result.current.localized).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(fetchCachedGloss).not.toHaveBeenCalled();
    expect(getWordGloss).not.toHaveBeenCalled();
  });

  it('keeps the English fallback when localization fails', async () => {
    getWordGloss.mockRejectedValueOnce(new Error('quota'));
    const { result } = renderHook(() => useLocalizedGloss('ἀγάπη', 'grc', 'love; affection'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.text).toBe('love; affection');
    expect(result.current.localized).toBe(false);
  });
});
