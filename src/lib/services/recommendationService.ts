import { LibraryText } from './libraryService';
import { KnowledgeMap } from './vocabularyService';

export function computeRecommendations(
  texts: LibraryText[],
  knowledge: KnowledgeMap,
  limit = 5,
): LibraryText[] {
  // Determine user's most-active language from recently-seen vocabulary
  const langFreq: Record<string, number> = {};
  for (const info of Object.values(knowledge)) {
    const lang = info.languageId;
    if (lang) langFreq[lang] = (langFreq[lang] ?? 0) + 1;
  }
  const primaryLang = Object.entries(langFreq).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Filter to the comprehensible-input sweet spot
  const candidates = texts.filter(t => {
    const pku = t.percentKnownUnique ?? t.percentKnown ?? 0;
    return pku >= 85 && pku <= 96;
  });

  return candidates
    .sort((a, b) => {
      // 1. Prefer matching language
      const aLang = a.language === primaryLang ? 0 : 1;
      const bLang = b.language === primaryLang ? 0 : 1;
      if (aLang !== bLang) return aLang - bLang;

      // 2. Closest to 93% unique coverage (sweet spot)
      const aScore = Math.abs((a.percentKnownUnique ?? a.percentKnown ?? 0) - 93);
      const bScore = Math.abs((b.percentKnownUnique ?? b.percentKnown ?? 0) - 93);
      return aScore - bScore;
    })
    .slice(0, limit);
}
