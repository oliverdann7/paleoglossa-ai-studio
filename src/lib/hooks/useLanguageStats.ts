import { useMemo } from 'react';
import { WordState, normalizeWordState } from '../constants/wordStates.js';
import { KnowledgeMap } from '../services/vocabularyService.js';

export interface LanguageStats {
  known: number;
  learning: number;
  seen: number;
  total: number;
  masteryPercent: number;
}

/**
 * Derives per-language vocabulary stats from the in-memory KnowledgeMap.
 * No extra Firestore queries — reuses already-loaded data.
 */
export function useLanguageStats(knowledge: KnowledgeMap): Record<string, LanguageStats> {
  return useMemo(() => {
    const result: Record<string, LanguageStats> = {};

    for (const info of Object.values(knowledge)) {
      if (!info || typeof info !== 'object') continue;
      const langId = (info as any).languageId || 'unknown';
      const state = normalizeWordState((info as any).state);

      if (!result[langId]) {
        result[langId] = { known: 0, learning: 0, seen: 0, total: 0, masteryPercent: 0 };
      }
      result[langId].total++;

      if (state === WordState.KNOWN) {
        result[langId].known++;
      } else if (state === WordState.LEARNING || state === WordState.FAMILIAR) {
        result[langId].learning++;
      } else if (state === WordState.SEEN) {
        result[langId].seen++;
      }
    }

    for (const lang of Object.values(result)) {
      lang.masteryPercent = lang.total > 0 ? Math.round((lang.known / lang.total) * 100) : 0;
    }

    return result;
  }, [knowledge]);
}
