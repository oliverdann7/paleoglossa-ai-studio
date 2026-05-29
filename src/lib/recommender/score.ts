/**
 * Pure scoring for the "ready to read next" recommender.
 *
 * The single learner signal is the set of lemmas they already comprehend —
 * derived from VocabularyItem documents at status KNOWN or FAMILIAR. Each
 * text in the corpus is reduced to a bag of lemma counts (its TextVocabProfile)
 * so comprehension is just a sum over the bag.
 *
 * No I/O here. Tested in isolation; consumed by the server route and any
 * future client-side surface that wants to score in-process.
 */

export interface TextVocabProfile {
  textId: string;
  /** Map from normalized lemma → token count within this text. */
  lemmaCounts: Record<string, number>;
  /** Sum of all token counts. Used as the denominator for comprehension. */
  totalTokens: number;
  /** Distinct lemma count. Used to estimate the learning cost. */
  uniqueLemmas: number;
  /** Denormalised CEFR-style level (e.g. "A1", "B2") if known. */
  cefrLevel?: string;
  /** Denormalised language id for filtering (e.g. "grc", "hbo"). */
  languageId?: string;
}

export interface LearnerState {
  /** Lemmas the user already comprehends (KNOWN or FAMILIAR). */
  knownLemmas: Set<string>;
  /** Lemmas the user is actively learning. Counted as "partial" for new-word cost only. */
  learningLemmas?: Set<string>;
  /** Active language id, e.g. "grc". Used to filter cross-language texts. */
  languageId?: string;
}

export interface ScoredText {
  textId: string;
  /** Fraction of running tokens the user already comprehends. 0–1. */
  comprehension: number;
  /** Distinct unknown lemmas in the text. */
  newLemmas: number;
  /** Composite score used for ranking. Higher is better. */
  score: number;
}

/** Krashen i+1 target — the band where new vocab is acquired most efficiently. */
const TARGET_COMPREHENSION = 0.93;
/** Half-width of the reward band around the target. */
const BAND_WIDTH = 0.15;
/** Below this comprehension, the text is filtered out as too hard. */
const MIN_COMPREHENSION = 0.6;
/** New-lemma count that saturates the learning bonus. */
const LEARNING_SATURATION = 25;
/** Weight of the learning bonus relative to the band reward. */
const LEARNING_WEIGHT = 0.3;

/**
 * Score a single text against a learner. Pure.
 *
 * comprehension = knownTokens / totalTokens
 * bandReward    = max(0, 1 - |comprehension - 0.93| / 0.15)   [Krashen i+1]
 * learningBonus = min(newLemmas / 25, 1) * 0.3                [favours non-trivial learning]
 * score         = bandReward + learningBonus
 */
export function scoreText(profile: TextVocabProfile, learner: LearnerState): ScoredText {
  const { lemmaCounts, totalTokens } = profile;
  if (totalTokens === 0) {
    return { textId: profile.textId, comprehension: 0, newLemmas: 0, score: 0 };
  }

  let knownTokens = 0;
  let newLemmas = 0;
  for (const [lemma, count] of Object.entries(lemmaCounts)) {
    if (learner.knownLemmas.has(lemma)) {
      knownTokens += count;
    } else {
      newLemmas++;
    }
  }

  const comprehension = knownTokens / totalTokens;
  const bandReward = Math.max(0, 1 - Math.abs(comprehension - TARGET_COMPREHENSION) / BAND_WIDTH);
  const learningBonus = Math.min(newLemmas / LEARNING_SATURATION, 1) * LEARNING_WEIGHT;
  const score = bandReward + learningBonus;

  return {
    textId: profile.textId,
    comprehension,
    newLemmas,
    score,
  };
}

export interface RecommendOptions {
  /** Texts the user has already finished — filtered out. */
  readTextIds?: Set<string>;
  /** Max results returned. */
  limit?: number;
  /** When set, restricts scoring to profiles matching this language id. */
  languageId?: string;
}

/**
 * Score every profile and return the top `limit` picks.
 *
 * Filters: read texts, comprehension below 0.6, and (optionally) mismatched language.
 * Order: by score desc, with comprehension as a tiebreaker (slight preference for
 * texts closer to the target than ones with more new lemmas, all else equal).
 */
export function recommendNext(
  profiles: TextVocabProfile[],
  learner: LearnerState,
  options: RecommendOptions = {}
): ScoredText[] {
  const { readTextIds, limit = 5, languageId } = options;
  const lang = languageId ?? learner.languageId;

  const scored: ScoredText[] = [];
  for (const profile of profiles) {
    if (readTextIds?.has(profile.textId)) continue;
    if (lang && profile.languageId && profile.languageId !== lang) continue;

    const result = scoreText(profile, learner);
    if (result.comprehension < MIN_COMPREHENSION) continue;
    if (result.score === 0) continue;
    scored.push(result);
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: prefer the one closer to the target comprehension.
    const da = Math.abs(a.comprehension - TARGET_COMPREHENSION);
    const db = Math.abs(b.comprehension - TARGET_COMPREHENSION);
    return da - db;
  });

  return scored.slice(0, limit);
}
