/**
 * Stage 3b/4 — AI morphology + translation fill (offline batch).
 *
 * For sentences that still lack morphology and/or a stored translation after
 * the treebank and dictionary stages, one Gemini call per sentence returns
 * both at once, using the SAME prompt contract as the live Reader
 * (`buildSentenceAnalysisPrompt` from api/_lib/aiPrompts.ts): per-token
 * lemma/gloss/pos/morphologyDetails plus literal + natural translations.
 *
 * Everything AI-produced is labeled: tokens get `morphSource: 'ai-generated'`,
 * sentences get `translationSource: 'ai-generated'`. Treebank morphology
 * (`treebankSource` set) and existing non-empty fields are NEVER overwritten.
 *
 * Responses are cached per sentence at `.cache/<lang>-ai-analysis.json`
 * (keyed `${languageId}::${sentenceId}`), so re-runs are deterministic and
 * each sentence costs at most one AI call ever. The cache is the unit of
 * human review.
 *
 * Requires GEMINI_API_KEY. Driven by scripts/corpus/ai-enrich-served.ts.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { buildSentenceAnalysisPrompt } from '../../../api/_lib/aiPrompts.js';
import type { Morphology, Sentence } from '../../../src/types/corpus.js';

// ── Cache ────────────────────────────────────────────────────────────────────

export interface AiParsingEntry {
  text: string;
  lemma?: string;
  gloss?: string;
  pos?: string;
  morphologyDetails?: Record<string, string>;
}

export interface AiSentenceAnalysis {
  parsing: AiParsingEntry[];
  /** Natural English rendering (preferred) or literal fallback. */
  translation: string;
}

export type AiAnalysisCache = Record<string, AiSentenceAnalysis>;

export function loadAiCache(path: string): AiAnalysisCache {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as AiAnalysisCache;
  } catch {
    return {};
  }
}

export function saveAiCache(path: string, cache: AiAnalysisCache): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(cache, null, 2), 'utf-8');
}

// ── Gemini resolver ──────────────────────────────────────────────────────────

export type AiSentenceResolver = (
  languageId: string,
  sentenceText: string
) => Promise<AiSentenceAnalysis | null>;

export function createGeminiSentenceResolver(apiKey: string): AiSentenceResolver {
  return async (languageId, sentenceText) => {
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: buildSentenceAnalysisPrompt(sentenceText, languageId, 'scholar'),
    });
    const raw = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    try {
      const parsed = JSON.parse(cleaned) as {
        parsing?: AiParsingEntry[];
        translations?: string[];
      };
      if (!Array.isArray(parsed.parsing) || parsed.parsing.length === 0) return null;
      const translation = (parsed.translations?.[1] || parsed.translations?.[0] || '').trim();
      return { parsing: parsed.parsing, translation };
    } catch {
      return null;
    }
  };
}

// ── Application ──────────────────────────────────────────────────────────────

const MORPH_FIELDS: Array<[string, keyof Morphology]> = [
  ['case', 'case'],
  ['number', 'number'],
  ['gender', 'gender'],
  ['person', 'person'],
  ['tense', 'tense'],
  ['aspect', 'aspect'],
  ['voice', 'voice'],
  ['mood', 'mood'],
  ['stem', 'stem'],
  ['state', 'state'],
  ['conjugation', 'conjugation'],
  ['declension', 'declension'],
];

const PERSON_NORMALIZE: Record<string, string> = {
  '1st': 'first',
  '2nd': 'second',
  '3rd': 'third',
};

function cmp(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯͅ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}]/gu, '');
}

export interface ApplyResult {
  morphFilled: number;
  glossFilled: number;
  translationSet: boolean;
}

/**
 * Apply one cached sentence analysis onto a Sentence, fill-only, aligning
 * parsing entries to tokens by surface with a small skip window.
 */
export function applyAnalysis(sentence: Sentence, analysis: AiSentenceAnalysis): ApplyResult {
  const result: ApplyResult = { morphFilled: 0, glossFilled: 0, translationSet: false };
  let j = 0;
  for (const token of sentence.tokens) {
    // find the parsing entry for this token within a lookahead window
    let hit = -1;
    for (let k = j; k < Math.min(j + 4, analysis.parsing.length); k++) {
      if (cmp(analysis.parsing[k].text ?? '') === cmp(token.surface)) {
        hit = k;
        break;
      }
    }
    if (hit < 0) continue;
    const entry = analysis.parsing[hit];
    j = hit + 1;

    const posMissing = !token.morphology?.partOfSpeech || token.morphology.partOfSpeech === 'unknown';
    if (posMissing && !token.treebankSource && entry.pos) {
      const morph: Morphology = { partOfSpeech: entry.pos.toLowerCase() };
      for (const [aiField, ourField] of MORPH_FIELDS) {
        const v = entry.morphologyDetails?.[aiField]?.trim();
        if (v) {
          (morph as unknown as Record<string, string>)[ourField] =
            ourField === 'person' ? (PERSON_NORMALIZE[v] ?? v) : v.toLowerCase();
        }
      }
      token.morphology = morph;
      token.morphSource = 'ai-generated';
      result.morphFilled++;
    }
    if ((!token.gloss || !token.gloss.trim()) && entry.gloss?.trim()) {
      token.gloss = entry.gloss.trim();
      result.glossFilled++;
    }
    if ((!token.lemma || !token.lemma.trim()) && entry.lemma?.trim()) {
      token.lemma = entry.lemma.trim();
    }
  }
  if ((!sentence.translation || !sentence.translation.trim()) && analysis.translation) {
    sentence.translation = analysis.translation;
    sentence.translationSource = 'ai-generated';
    result.translationSet = true;
  }
  return result;
}

/** Render a sentence's source text for the prompt (surfaces + punctuation). */
export function sentenceText(sentence: Sentence): string {
  return sentence.tokens
    .map((t) => `${t.punctBefore ?? ''}${t.surface}${t.punctAfter ?? ''}`)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
