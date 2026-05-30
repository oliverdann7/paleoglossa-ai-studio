import { apiFetch, AuthRequiredError } from './apiFetch.js';

/** Mirror of EnrichedRecommendation from api/_lib/recommender.ts */
export interface ReadyToReadPick {
  textId: string;
  comprehension: number;
  newLemmas: number;
  score: number;
  title: string;
  author?: string;
  language: string;
  level?: string;
  genre?: string;
  sectionId?: string;
  comprehensionLabel: string;
  newLemmasLabel: string;
}

interface RecommendationsResponse {
  recommendations: ReadyToReadPick[];
}

/**
 * Fetch lemma-based "ready to read" picks from the server. Falls back to an
 * empty list when the user is not signed in (cold-start guests get the
 * onboarding CTA instead, see Dashboard).
 */
export async function fetchReadyToRead(opts: {
  languageId?: string;
  limit?: number;
} = {}): Promise<ReadyToReadPick[]> {
  const params = new URLSearchParams();
  if (opts.languageId) params.set('lang', opts.languageId);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  const url = `/api/recommendations${qs ? `?${qs}` : ''}`;
  try {
    const res = await apiFetch<RecommendationsResponse>(url);
    return res?.recommendations ?? [];
  } catch (err) {
    if (err instanceof AuthRequiredError) return [];
    throw err;
  }
}

/**
 * Fetch the top high-frequency lemmas for a language. Used by the onboarding
 * lemma-tap step. Public — no auth required.
 */
export async function fetchOnboardingLemmas(
  languageId: string,
  limit = 50
): Promise<string[]> {
  const params = new URLSearchParams({ lang: languageId, limit: String(limit) });
  const res = await apiFetch<{ lemmas: string[] }>(
    `/api/recommendations/onboarding-lemmas?${params.toString()}`,
    { skipAuth: true }
  );
  return res?.lemmas ?? [];
}

/**
 * Notify the server that the user's vocabulary changed so the next
 * /api/recommendations call sees fresh state. Best-effort — never throws.
 */
export async function invalidateRecommendations(): Promise<void> {
  try {
    await apiFetch('/api/recommendations/invalidate', { method: 'POST' });
  } catch {
    // ignore — server cache is short-TTL anyway
  }
}
