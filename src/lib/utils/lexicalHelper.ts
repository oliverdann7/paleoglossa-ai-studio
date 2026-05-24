import type { Sentence } from '../../types/corpus.js';

export function isUsefulGloss(g: string | null | undefined): g is string {
  if (!g) return false;
  const cleaned = g.trim().toLowerCase();
  if (!cleaned) return false;
  if (cleaned === 'unknown word' || cleaned === 'unknown' || cleaned.startsWith('unknown word'))
    return false;
  if (cleaned.startsWith('no explanation') || cleaned.startsWith('failed to')) return false;
  if (cleaned.startsWith('ai explanation not available')) return false;
  if (cleaned.startsWith('gemini api key not configured')) return false;
  if (cleaned.startsWith('ai service error')) return false;
  if (cleaned === 'request timed out') return false;
  return true;
}

export interface LexicalHint {
  lemma: string;
  gloss: string;
  partOfSpeech?: string;
  confidence?: number;
}

const PUNCT_RE = /^[\s.,;·:!?()"«»—–׃]+|[\s.,;·:!?()"«»—–׃]+$/g;
const DIACRITICS_RE = /[\u0300-\u036f\u0591-\u05c7]/g;

export function sentLex(
  id: string,
  words: string[],
  translation: string,
  hints?: Record<string, LexicalHint>
): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(PUNCT_RE, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
      const hint = hints?.[clean];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: hint?.lemma || normalized,
        gloss: hint?.gloss || '',
        morphology: { partOfSpeech: hint?.partOfSpeech || 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}
