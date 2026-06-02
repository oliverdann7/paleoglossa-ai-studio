/**
 * Stage 3 — gloss-fill.
 *
 * Fills a gloss for every token that still lacks one after annotation, using
 * the project's EXISTING meaning-resolution stack (no new lookup logic):
 *
 *   1. bundled dictionaries  → getDefinitionWithFallbacks(lemma, languageId)
 *   2. batch Gemini          → same prompt contract as api/_routes/ai.ts type=gloss
 *
 * (lexiconService.lookupLexicon hits an external HTTP API; it's intentionally
 * left out of the default offline run and can be layered in by the caller.)
 *
 * Results are cached to a local JSON file keyed by `${languageId}::${lemma}`
 * so re-runs are deterministic and each unique lemma costs at most one AI call
 * across the whole corpus. The cache is the unit of human review: glosses
 * marked `aiGenerated` can be spot-checked there before a text is promoted to
 * `complete`.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getDefinitionWithFallbacks } from '../../../src/lib/data/dictionary.js';
import { getLanguageName } from '../../../api/_lib/aiPrompts.js';
import type { TextSection } from './types.js';

export interface GlossCacheEntry {
  gloss: string;
  source: 'bundled' | 'ai';
  aiGenerated: boolean;
}

export type GlossCache = Record<string, GlossCacheEntry>;

export function loadGlossCache(path: string): GlossCache {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as GlossCache;
  } catch {
    return {};
  }
}

export function saveGlossCache(path: string, cache: GlossCache): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(cache, null, 2), 'utf-8');
}

function cacheKey(languageId: string, lemma: string): string {
  return `${languageId}::${lemma}`;
}

/** Short dictionary-style gloss prompt — mirrors api/_routes/ai.ts type=gloss. */
function glossPrompt(languageId: string, lemma: string, surface: string): string {
  const langName = getLanguageName(languageId);
  return `You are a ${langName} lexicographer. Give a SHORT English gloss for the ${langName} word "${surface || lemma}" (lemma: "${lemma || surface}").

Rules:
- Return ONLY a short gloss — 2 to 8 words maximum.
- Format: "primary meaning; secondary meaning (if any)"
- No part-of-speech labels, no numbered lists, no explanation, no markdown.
- If you cannot identify the word, reply exactly with "unknown word".`;
}

/** A pluggable AI gloss resolver so tests can run fully offline. */
export type AiGlossResolver = (
  languageId: string,
  lemma: string,
  surface: string
) => Promise<string | null>;

/** Default resolver: one Gemini call per lemma via @google/genai. */
export function createGeminiGlossResolver(apiKey: string): AiGlossResolver {
  return async (languageId, lemma, surface) => {
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: glossPrompt(languageId, lemma, surface),
    });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:text)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    if (!cleaned || /^unknown word$/i.test(cleaned)) return null;
    return cleaned;
  };
}

export interface GlossFillOptions {
  languageId: string;
  cachePath: string;
  /** Omit to skip AI entirely (bundled-dictionary only). */
  aiResolver?: AiGlossResolver;
  /** Called once per resolved lemma for progress reporting. */
  onProgress?: (lemma: string, entry: GlossCacheEntry) => void;
}

export interface GlossFillResult {
  sections: TextSection[];
  filledFromBundled: number;
  filledFromAi: number;
  stillMissing: number;
  cache: GlossCache;
}

/**
 * Fill empty token glosses in-place across the sections. A meaning is resolved
 * by the token's lemma when set, else by its normalized surface form, so
 * text-only sources (plaintext/tei) without a treebank still get glosses from
 * inflection-aware dictionaries. POS is not inferred here, so such texts remain
 * `partial` until a treebank or reviewed pass supplies morphology.
 */
export async function fillGlosses(
  sections: TextSection[],
  opts: GlossFillOptions
): Promise<GlossFillResult> {
  const cache = loadGlossCache(opts.cachePath);
  let filledFromBundled = 0;
  let filledFromAi = 0;
  let stillMissing = 0;

  // The term to resolve a meaning by: the lemma when a treebank/Macula set one,
  // otherwise the normalized surface form. Text-only sources (plaintext/tei)
  // leave lemma empty, so without this fallback they would resolve nothing;
  // surface-form lookup still hits inflection-aware dictionaries (e.g. Whitaker's
  // Latin) and the corpus-derived form index. Returns '' if nothing usable.
  const lookupTerm = (tok: { lemma?: string; normalized?: string; surface?: string }): string => {
    if (tok.lemma && tok.lemma.trim()) return tok.lemma.trim();
    if (tok.normalized && tok.normalized.trim()) return tok.normalized.trim();
    return (tok.surface ?? '').trim();
  };

  // Collect the unique terms that need a gloss first, so AI is called at most
  // once per term regardless of how often it occurs.
  const need = new Map<string, { lemma: string; surface: string }>();
  for (const section of sections) {
    for (const sentence of section.sentences) {
      for (const tok of sentence.tokens) {
        if (tok.gloss && tok.gloss.trim()) continue;
        const term = lookupTerm(tok);
        if (!term) continue;
        const k = cacheKey(opts.languageId, term);
        if (!need.has(k)) need.set(k, { lemma: term, surface: tok.surface });
      }
    }
  }

  for (const [k, { lemma, surface }] of need) {
    if (cache[k]) continue; // already resolved in a prior run
    const bundled = getDefinitionWithFallbacks(lemma, opts.languageId);
    if (bundled?.definition) {
      cache[k] = { gloss: bundled.definition, source: 'bundled', aiGenerated: false };
      opts.onProgress?.(lemma, cache[k]);
      continue;
    }
    if (opts.aiResolver) {
      const ai = await opts.aiResolver(opts.languageId, lemma, surface);
      if (ai) {
        cache[k] = { gloss: ai, source: 'ai', aiGenerated: true };
        opts.onProgress?.(lemma, cache[k]);
      }
    }
  }

  saveGlossCache(opts.cachePath, cache);

  // Apply cached glosses back onto the tokens.
  const out = sections.map((section) => ({
    ...section,
    sentences: section.sentences.map((sentence) => ({
      ...sentence,
      tokens: sentence.tokens.map((tok) => {
        if (tok.gloss && tok.gloss.trim()) return tok;
        const term = lookupTerm(tok);
        if (!term) {
          stillMissing++;
          return tok;
        }
        const entry = cache[cacheKey(opts.languageId, term)];
        if (!entry) {
          stillMissing++;
          return tok;
        }
        if (entry.aiGenerated) filledFromAi++;
        else filledFromBundled++;
        // Carry the resolved term as the lemma when the source left it empty, so
        // the token gains a dictionary headword (helps the Reader + the gate).
        const lemma = tok.lemma && tok.lemma.trim() ? tok.lemma : term;
        return { ...tok, lemma, gloss: entry.gloss };
      }),
    })),
  }));

  return { sections: out, filledFromBundled, filledFromAi, stillMissing, cache };
}
