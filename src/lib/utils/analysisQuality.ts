export interface AnalysisQuality {
  level: 'full' | 'partial' | 'raw';
  glossCoverage: number;
  morphologyCoverage: number;
  averageConfidence: number | null;
  warnings?: string[];
}

interface TokenLike {
  type?: string;
  gloss?: string | null;
  pos?: string | null;
  confidence?: number | null;
  morphology?: Record<string, unknown> | string | null;
}

function tokenHasPos(t: TokenLike): boolean {
  if (t.pos && t.pos.trim().length > 0) return true;
  if (t.morphology) {
    if (typeof t.morphology === 'string') return t.morphology.trim().length > 0;
    const m = t.morphology;
    const posVal =
      (m as Record<string, unknown>).partOfSpeech ||
      (m as Record<string, unknown>).pos ||
      (m as Record<string, unknown>).part;
    if (typeof posVal === 'string' && posVal.trim().length > 0 && posVal !== 'unknown') return true;
  }
  return false;
}

interface SentenceLike {
  tokens: TokenLike[];
}

export function computeAnalysisQuality(
  sentences: SentenceLike[],
  analysisStatus: string
): AnalysisQuality {
  const allTokens = sentences.flatMap((s) => s.tokens).filter((t) => t.type === 'word');
  const total = allTokens.length;
  if (total === 0) {
    return {
      level: 'raw',
      glossCoverage: 0,
      morphologyCoverage: 0,
      averageConfidence: null,
      warnings: analysisStatus === 'raw' ? ['No words to analyze.'] : undefined,
    };
  }

  const withGloss = allTokens.filter((t) => t.gloss && t.gloss.trim().length > 0).length;
  const withPos = allTokens.filter((t) => tokenHasPos(t)).length;
  const confidences = allTokens
    .map((t) => t.confidence)
    .filter((c): c is number => c !== null && c !== undefined);
  const avgConf =
    confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : null;

  const glossCoverage = Math.round((withGloss / total) * 100);
  const morphologyCoverage = Math.round((withPos / total) * 100);

  const warnings: string[] = [];
  if (analysisStatus === 'raw') {
    warnings.push('This text was tokenized but not linguistically analyzed.');
  }
  if (glossCoverage < 50) warnings.push(`Low gloss coverage: ${glossCoverage}%`);
  if (morphologyCoverage < 50) warnings.push(`Low morphology coverage: ${morphologyCoverage}%`);

  let level: 'full' | 'partial' | 'raw' = 'raw';
  if (analysisStatus === 'analyzed' && glossCoverage >= 80 && morphologyCoverage >= 80) {
    level = 'full';
  } else if (analysisStatus === 'analyzed') {
    level = 'partial';
  }

  return {
    level,
    glossCoverage,
    morphologyCoverage,
    averageConfidence: avgConf,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
