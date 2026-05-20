import { isTrackedWordState } from '../constants/plans.js';

/**
 * Minimal shape we need from each vocabulary entry.
 * Using a structural type here avoids importing vocabularyService (and thus
 * firebase) into files that only need the pure counting logic.
 */
interface VocabEntry {
  state?: unknown;
  languageId?: string;
}

/**
 * Counts the number of tracked (non-NEW, non-IGNORED) vocabulary entries
 * for a given language in the provided knowledge map.
 *
 * Pure function — no Firebase, no React, safe to call anywhere including tests.
 */
export function countTrackedWords(
  knowledge: Record<string, VocabEntry | unknown>,
  langId: string
): number {
  let count = 0;
  for (const raw of Object.values(knowledge)) {
    if (raw && typeof raw === 'object') {
      const entry = raw as VocabEntry;
      if (entry.languageId === langId && isTrackedWordState(entry.state)) {
        count++;
      }
    }
  }
  return count;
}
