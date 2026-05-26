import { LibraryText } from './libraryService.js';
import { KnowledgeMap } from './vocabularyService.js';

export interface RecommendedText extends LibraryText {
  recommendationScore: number;
  reason: string;
  reasonKey: string;
  newWordsCount: number;
  difficultyLabel: 'easy' | 'justRight' | 'stretch' | 'challenging';
}

interface ReadingProgressEntry {
  textId: string;
  lastPosition?: number;
  completionPercent?: number;
}

interface RecommendationOptions {
  limit?: number;
  activeLanguageId?: string;
  readingProgress?: ReadingProgressEntry[];
  recentGenres?: string[];
}

const SWEET_SPOT_CENTER = 90;
const SWEET_SPOT_MIN = 75;
const SWEET_SPOT_MAX = 98;

function getDifficultyLabel(pku: number): RecommendedText['difficultyLabel'] {
  if (pku >= 95) return 'easy';
  if (pku >= 85) return 'justRight';
  if (pku >= 70) return 'stretch';
  return 'challenging';
}

function estimateNewWords(text: LibraryText): number {
  const pku = text.percentKnownUnique ?? text.percentKnown ?? 0;
  const uniqueEstimate = Math.max(text.totalWords * 0.4, 20);
  return Math.round(uniqueEstimate * ((100 - pku) / 100));
}

function pickReason(
  text: LibraryText,
  pku: number,
  newWords: number,
  isLanguageMatch: boolean,
  isGenreFresh: boolean
): { reason: string; reasonKey: string } {
  if (pku >= 88 && pku <= 94) {
    return {
      reason: `${newWords} new words at your level`,
      reasonKey: 'rec.sweetSpot',
    };
  }
  if (pku >= 95) {
    return {
      reason: 'Reinforce what you know',
      reasonKey: 'rec.reinforce',
    };
  }
  if (isGenreFresh && text.genre) {
    return {
      reason: `Explore ${text.genre.toLowerCase()}`,
      reasonKey: 'rec.newGenre',
    };
  }
  if (isLanguageMatch && newWords > 0) {
    return {
      reason: `${newWords} new words to learn`,
      reasonKey: 'rec.newWords',
    };
  }
  return {
    reason: 'Expand your vocabulary',
    reasonKey: 'rec.expand',
  };
}

export function computeRecommendations(
  texts: LibraryText[],
  knowledge: KnowledgeMap,
  options: RecommendationOptions = {}
): RecommendedText[] {
  const {
    limit = 6,
    activeLanguageId,
    readingProgress = [],
    recentGenres = [],
  } = options;

  const primaryLang =
    activeLanguageId || inferPrimaryLanguage(knowledge);

  const startedIds = new Set(readingProgress.map((p) => p.textId));
  const finishedIds = new Set(
    readingProgress
      .filter((p) => (p.lastPosition ?? 0) >= 95 || (p.completionPercent ?? 0) >= 95)
      .map((p) => p.textId)
  );
  const recentGenreSet = new Set(recentGenres.map((g) => g.toLowerCase()));

  const scored: RecommendedText[] = [];

  for (const text of texts) {
    const pku = text.percentKnownUnique ?? text.percentKnown ?? 0;

    if (pku < SWEET_SPOT_MIN || pku > SWEET_SPOT_MAX) continue;
    if (finishedIds.has(text.id)) continue;

    let score = 0;

    // Coverage sweet spot — Gaussian-like bonus centered on SWEET_SPOT_CENTER
    const coverageDist = Math.abs(pku - SWEET_SPOT_CENTER);
    score += Math.max(0, 40 - coverageDist * 2);

    // Language match
    const isLanguageMatch = text.language === primaryLang;
    if (isLanguageMatch) score += 25;

    // Not started yet — prefer fresh texts
    if (!startedIds.has(text.id)) {
      score += 15;
    } else {
      score += 5;
    }

    // Genre diversity — boost genres the user hasn't read recently
    const textGenre = text.genre?.toLowerCase() || '';
    const isGenreFresh = textGenre.length > 0 && !recentGenreSet.has(textGenre);
    if (isGenreFresh) score += 10;

    // Prefer texts with morphology (richer learning experience)
    if (text.availableTools?.morphology) score += 5;

    // Prefer texts with translation available
    if (text.availableTools?.translation) score += 3;

    // Slight penalty for very short texts (< 50 words)
    if (text.totalWords < 50) score -= 5;

    const newWords = estimateNewWords(text);
    const { reason, reasonKey } = pickReason(text, pku, newWords, isLanguageMatch, isGenreFresh);

    scored.push({
      ...text,
      recommendationScore: score,
      reason,
      reasonKey,
      newWordsCount: newWords,
      difficultyLabel: getDifficultyLabel(pku),
    });
  }

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Deduplicate by language — ensure variety if we have texts from multiple languages
  if (!activeLanguageId) {
    return diversifyByLanguage(scored, limit);
  }

  return scored.slice(0, limit);
}

function diversifyByLanguage(sorted: RecommendedText[], limit: number): RecommendedText[] {
  const result: RecommendedText[] = [];
  const langCount: Record<string, number> = {};
  const maxPerLang = Math.max(2, Math.ceil(limit / 2));

  for (const text of sorted) {
    const count = langCount[text.language] ?? 0;
    if (count >= maxPerLang) continue;
    result.push(text);
    langCount[text.language] = count + 1;
    if (result.length >= limit) break;
  }

  // Fill remaining slots if we have room
  if (result.length < limit) {
    const addedIds = new Set(result.map((r) => r.id));
    for (const text of sorted) {
      if (addedIds.has(text.id)) continue;
      result.push(text);
      if (result.length >= limit) break;
    }
  }

  return result;
}

function inferPrimaryLanguage(knowledge: KnowledgeMap): string | undefined {
  const langFreq: Record<string, number> = {};
  for (const info of Object.values(knowledge)) {
    const lang = info.languageId;
    if (lang) langFreq[lang] = (langFreq[lang] ?? 0) + 1;
  }
  return Object.entries(langFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function getTopRecommendation(
  texts: LibraryText[],
  knowledge: KnowledgeMap,
  options: RecommendationOptions = {}
): RecommendedText | null {
  const results = computeRecommendations(texts, knowledge, { ...options, limit: 1 });
  return results[0] ?? null;
}

interface CorpusText {
  id: string;
  title: string;
  language: string;
  level?: string;
  genre?: string;
  sectionsPreview?: { id: string; label: string }[];
}

export function pickDashboardRecommendation(
  texts: CorpusText[],
  knowledge: KnowledgeMap,
  activeLanguageId: string,
  startedIds: Set<string>,
  getTokens: (text: CorpusText) => Array<{ lemma?: string; text?: string }>
): { id: string; title: string; percentKnown: number } | null {
  const knownLemmas = new Set<string>();
  for (const [key, info] of Object.entries(knowledge)) {
    if (info.state === 'KNOWN' || info.state === 'FAMILIAR') {
      knownLemmas.add(key.toLowerCase());
    }
  }

  let best: { id: string; title: string; percentKnown: number; score: number } | null = null;

  for (const text of texts) {
    if (text.language !== activeLanguageId) continue;
    if (startedIds.has(text.id)) continue;

    const tokens = getTokens(text);
    if (tokens.length === 0) continue;

    const lemmas = new Set<string>();
    for (const t of tokens) {
      const l = (t.lemma || t.text || '').toLowerCase();
      if (l) lemmas.add(l);
    }
    if (lemmas.size === 0) continue;

    let hits = 0;
    for (const l of lemmas) if (knownLemmas.has(l)) hits++;
    const pku = Math.round((hits / lemmas.size) * 100);

    if (pku < SWEET_SPOT_MIN || pku > SWEET_SPOT_MAX) continue;

    const coverageScore = Math.max(0, 40 - Math.abs(pku - SWEET_SPOT_CENTER) * 2);
    if (!best || coverageScore > best.score) {
      best = { id: text.id, title: text.title, percentKnown: pku, score: coverageScore };
    }
  }

  return best ? { id: best.id, title: best.title, percentKnown: best.percentKnown } : null;
}
