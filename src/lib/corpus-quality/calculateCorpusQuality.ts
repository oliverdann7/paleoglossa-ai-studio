import { CorpusDB } from '../../data/corpus.js';

export interface CorpusQualityMetrics {
  texts: number;
  sections: number;
  sentences: number;
  tokens: number;
  tokensWithGloss: number;
  tokensWithPos: number;
  tokensWithLemma: number;
  tokensWithMorphBeyondPos: number;
  unknownPosTokens: number;
  missingLemmas: Record<string, number>;
}

export interface LanguageQualityReport {
  language: string;
  metrics: CorpusQualityMetrics;
  glossCoverage: number;
  posCoverage: number;
  lemmaCoverage: number;
  morphCoverage: number;
  status: 'good' | 'needs_work' | 'poor';
  topMissingLemmas: { lemma: string; count: number }[];
}

export interface CorpusQualityReport {
  generatedAt: string;
  totalLanguages: number;
  totalTexts: number;
  totalTokens: number;
  totalSections: number;
  totalSentences: number;
  languages: LanguageQualityReport[];
  topMissingLemmas: { lemma: string; count: number; language: string }[];
  topProblemLanguages: LanguageQualityReport[];
  needsAttention: LanguageQualityReport[];
}

function isMeaningful(val: unknown): boolean {
  return val !== undefined && val !== null && val !== '' && val !== 'unknown';
}

function determineStatus(
  gloss: number,
  pos: number,
  lemma: number,
  morph: number,
): 'good' | 'needs_work' | 'poor' {
  if (gloss >= 80 && pos >= 80 && lemma >= 80 && morph >= 50) return 'good';
  if (gloss >= 40 || pos >= 40 || lemma >= 40) return 'needs_work';
  return 'poor';
}

function computeLanguageMetrics(language: string): CorpusQualityMetrics {
  const allTexts = CorpusDB.getTexts();
  const langTexts = allTexts.filter((t) => t.language === language);

  const metrics: CorpusQualityMetrics = {
    texts: 0,
    sections: 0,
    sentences: 0,
    tokens: 0,
    tokensWithGloss: 0,
    tokensWithPos: 0,
    tokensWithLemma: 0,
    tokensWithMorphBeyondPos: 0,
    unknownPosTokens: 0,
    missingLemmas: {},
  };

  metrics.texts = langTexts.length;

  for (const text of langTexts) {
    for (const preview of text.sectionsPreview ?? []) {
      const section = CorpusDB.getSection(preview.id);
      if (!section) continue;
      metrics.sections++;

      for (const sentence of section.sentences) {
        metrics.sentences++;
        for (const token of sentence.tokens) {
          if (!token.surface && !token.lemma) continue;
          metrics.tokens++;

          if (isMeaningful(token.gloss)) metrics.tokensWithGloss++;
          if (isMeaningful(token.lemma)) metrics.tokensWithLemma++;

          const hasPos = isMeaningful(token.morphology?.partOfSpeech);
          if (hasPos) {
            metrics.tokensWithPos++;
          } else {
            metrics.unknownPosTokens++;
            const lemma = token.lemma || token.surface;
            metrics.missingLemmas[lemma] = (metrics.missingLemmas[lemma] || 0) + 1;
          }

          const morphKeys = Object.keys(token.morphology ?? {});
          if (
            morphKeys.length > 1 ||
            (morphKeys.length === 1 && morphKeys[0] !== 'partOfSpeech')
          ) {
            metrics.tokensWithMorphBeyondPos++;
          }
        }
      }
    }
  }

  return metrics;
}

function pct(val: number, total: number): number {
  return total > 0 ? Math.round((val / total) * 100) : 0;
}

export function calculateCorpusQuality(): CorpusQualityReport {
  const allTexts = CorpusDB.getTexts();
  const languages = Array.from(new Set(allTexts.map((t) => t.language)));

  const reports: LanguageQualityReport[] = languages.map((lang) => {
    const metrics = computeLanguageMetrics(lang);
    const glossCoverage = pct(metrics.tokensWithGloss, metrics.tokens);
    const posCoverage = pct(metrics.tokensWithPos, metrics.tokens);
    const lemmaCoverage = pct(metrics.tokensWithLemma, metrics.tokens);
    const morphCoverage = pct(metrics.tokensWithMorphBeyondPos, metrics.tokens);
    const sortedMissing = Object.entries(metrics.missingLemmas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lemma, count]) => ({ lemma, count }));

    return {
      language: lang,
      metrics,
      glossCoverage,
      posCoverage,
      lemmaCoverage,
      morphCoverage,
      status: determineStatus(glossCoverage, posCoverage, lemmaCoverage, morphCoverage),
      topMissingLemmas: sortedMissing,
    };
  });

  const sortedByGloss = [...reports].sort((a, b) => a.glossCoverage - b.glossCoverage);
  const topProblemLanguages = sortedByGloss.slice(0, 5);
  const needsAttention = reports.filter((r) => r.status !== 'good');

  const globalMissingLemmas: { lemma: string; count: number; language: string }[] = [];
  for (const r of reports) {
    for (const ml of r.topMissingLemmas) {
      globalMissingLemmas.push({ lemma: ml.lemma, count: ml.count, language: r.language });
    }
  }
  globalMissingLemmas.sort((a, b) => b.count - a.count);

  const totalTexts = reports.reduce((s, r) => s + r.metrics.texts, 0);
  const totalTokens = reports.reduce((s, r) => s + r.metrics.tokens, 0);
  const totalSections = reports.reduce((s, r) => s + r.metrics.sections, 0);
  const totalSentences = reports.reduce((s, r) => s + r.metrics.sentences, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalLanguages: languages.length,
    totalTexts,
    totalTokens,
    totalSections,
    totalSentences,
    languages: reports,
    topMissingLemmas: globalMissingLemmas.slice(0, 20),
    topProblemLanguages,
    needsAttention,
  };
}
