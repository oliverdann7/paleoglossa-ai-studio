import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIClient } from '../services/aiClient.js';

/**
 * Interface languages we can produce localised glosses for. Mirrors the
 * `UI_LANGUAGE_NAMES` map in `api/_routes/ai.ts` (English excluded — it's the
 * native gloss language and needs no translation).
 */
const LOCALIZABLE_UI_LANGS = new Set(['pt', 'es', 'fr', 'de', 'ru', 'tr', 'zh']);

export interface LocalizedGlossState {
  /** Best available text: the English gloss immediately, localised when ready. */
  text: string;
  /** True once `text` is in the UI language (not the English fallback). */
  localized: boolean;
  /** True while the localised gloss is being fetched (English already shown). */
  loading: boolean;
  /** Resolved UI language code, e.g. `pt`, or `en`. */
  uiLang: string;
}

/**
 * Render a word's meaning in the user's interface language.
 *
 * Returns the English gloss instantly, then — when the UI language is not
 * English — asynchronously fetches a localised gloss (cache-first via the
 * server lexical cache, else an AI translation that is cached for next time)
 * and swaps it in. English remains the fallback if localisation fails.
 */
export function useLocalizedGloss(
  lemma: string | undefined,
  languageId: string,
  englishGloss: string | null | undefined
): LocalizedGlossState {
  const { i18n } = useTranslation();
  const uiLang = (i18n.language || 'en').split('-')[0];
  const needsLocalization = LOCALIZABLE_UI_LANGS.has(uiLang);

  const [localizedText, setLocalizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset when the word / language / UI language changes.
    setLocalizedText(null); // eslint-disable-line react-hooks/set-state-in-effect
    setLoading(false);

    if (!lemma || !englishGloss || !needsLocalization) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const cached = await AIClient.fetchCachedGloss(languageId, lemma, uiLang);
        if (cancelled) return;
        if (cached?.value) {
          setLocalizedText(cached.value);
          return;
        }
        const gloss = await AIClient.getWordGloss(languageId, lemma, lemma, uiLang);
        if (cancelled) return;
        if (gloss) {
          setLocalizedText(gloss);
          // Persist for the next lookup of this word in this UI language.
          void AIClient.saveGlossToCache(languageId, lemma, lemma, gloss, uiLang);
        }
      } catch {
        // Keep the English fallback on any failure.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lemma, languageId, englishGloss, needsLocalization, uiLang]);

  return {
    text: localizedText || englishGloss || '',
    localized: !!localizedText,
    loading: loading && !localizedText,
    uiLang,
  };
}
