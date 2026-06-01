/**
 * Resolver façade — "give me the meaning of <lemma> from dictionary source X".
 *
 * Maps a {@link DictionarySourceDef} to one of the existing meaning lookups.
 * No new fetching logic lives here; this is glue so every surface can ask for a
 * meaning from a chosen source through a single, uniform call.
 */

import { getDefinitionWithFallbacks } from '../data/dictionary.js';
import { getDictionarySource } from '../data/dictionarySources.js';
import { lookupLexicon } from './lexiconService.js';
import { lookupWiktionary, summarizeWiktionary } from './wiktionaryService.js';
import { AIClient } from './aiClient.js';

export interface ResolvedMeaning {
  /** The meaning text in English (or the source's native gloss language). */
  definition: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl?: string;
  /** True when the text was produced by AI and should be flagged as such. */
  aiGenerated?: boolean;
}

/**
 * Resolve a meaning for `lemma` from a specific dictionary source.
 *
 * `surface` (the inflected form) helps the AI resolver; `targetLanguage` asks
 * the AI resolver for a gloss already written in the learner's UI language.
 * External-link sources never return inline text (they only open a reference),
 * so this returns null for them.
 */
export async function resolveMeaning(
  lemma: string,
  languageId: string,
  sourceId: string,
  opts?: { surface?: string; targetLanguage?: string }
): Promise<ResolvedMeaning | null> {
  const source = getDictionarySource(sourceId);
  if (!source || !lemma) return null;
  const url = source.url?.(lemma, languageId);

  switch (source.resolver) {
    case 'bundled': {
      const result = getDefinitionWithFallbacks(lemma, languageId);
      if (!result?.definition) return null;
      return {
        definition: result.definition,
        sourceId: source.id,
        sourceLabel: result.sourceLabel || source.name,
        sourceUrl: url,
      };
    }

    case 'external-api': {
      const result = await lookupLexicon(lemma, languageId);
      if (!result?.definition) return null;
      return {
        definition: result.definition,
        sourceId: source.id,
        sourceLabel: result.sourceLabel || source.name,
        sourceUrl: result.sourceUrl || url,
      };
    }

    case 'wiktionary': {
      const result = await lookupWiktionary(lemma, languageId);
      if (!result) return null;
      const text = summarizeWiktionary(result);
      if (!text) return null;
      return {
        definition: text,
        sourceId: source.id,
        sourceLabel: source.name,
        sourceUrl: result.sourceUrl || url,
      };
    }

    case 'ai': {
      const text = await AIClient.getWordGloss(
        languageId,
        opts?.surface || lemma,
        lemma,
        opts?.targetLanguage
      );
      if (!text) return null;
      return {
        definition: text,
        sourceId: source.id,
        sourceLabel: source.name,
        sourceUrl: url,
        aiGenerated: true,
      };
    }

    case 'external-link':
    default:
      return null;
  }
}
