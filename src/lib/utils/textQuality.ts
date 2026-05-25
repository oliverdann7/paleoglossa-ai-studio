import { AnalysisQuality } from './analysisQuality';

// --- v1 model (backward compatible) ---

export type TextQuality =
  | 'curated'
  | 'analyzed'
  | 'needs_ai'
  | 'partial'
  | 'raw'
  | 'imported'
  | 'sample';

export interface TextQualityStatus {
  quality: TextQuality;
  label: string;
  color: string;
}

// --- v2 model ---

export type TrustLevel = 'high' | 'medium' | 'low' | 'untrusted';

export type RecommendedAction =
  | 'ready_to_read'
  | 'run_ai_analysis'
  | 'review_tokens'
  | 'needs_morphology'
  | 'limited_support';

export const RECOMMENDED_ACTION_LABELS: Record<RecommendedAction, string> = {
  ready_to_read: 'Ready to read',
  run_ai_analysis: 'Run AI analysis',
  review_tokens: 'Review tokens',
  needs_morphology: 'Needs morphology',
  limited_support: 'Limited support',
};

export interface TextQualityInfo {
  quality: TextQuality;
  sourceQuality: 'curated' | 'ai_analyzed' | 'imported' | 'raw' | 'sample';
  analysisStatus?: string;
  analysisQuality?: AnalysisQuality;
  coverage: {
    gloss: number;
    morphology: number;
    overall: number;
  };
  trustLevel: TrustLevel;
  recommendedAction: RecommendedAction;
}

type TextQualityInput = {
  isComplete?: boolean;
  hasMorphology?: boolean;
  sourceStatus?: string;
  isSample?: boolean;
  analysisStatus?: string;
  analysisQuality?: AnalysisQuality;
};

function qualityInputHasAnalysis(text: TextQualityInput): boolean {
  return text.analysisStatus === 'analyzed';
}

// --- v1 helper (unchanged, backward compatible) ---

export function getTextQuality(
  text: TextQualityInput,
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf',
): TextQualityStatus {
  if (text.isSample) return { quality: 'sample', label: 'Sample', color: 'bg-amber-100 text-amber-800' };

  if (text.isComplete && text.sourceStatus === 'complete') {
    return { quality: 'curated', label: 'Curated', color: 'bg-blue-100 text-blue-800' };
  }

  if (text.analysisStatus === 'analyzed') {
    const level = text.analysisQuality?.level || 'full';
    return {
      quality: level === 'full' ? 'analyzed' : 'partial',
      label: level === 'full' ? 'Analyzed' : 'Partial Analysis',
      color: level === 'full' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800',
    };
  }

  if (text.analysisStatus === 'needs_ai') {
    return { quality: 'needs_ai', label: 'Needs AI Analysis', color: 'bg-red-100 text-red-800' };
  }

  if (sourceType) return { quality: 'imported', label: 'Imported', color: 'bg-emerald-100 text-emerald-800' };

  if (text.sourceStatus === 'partial') {
    return { quality: 'partial', label: 'Partial', color: 'bg-amber-100 text-amber-800' };
  }

  return { quality: 'raw', label: 'Raw', color: 'bg-gray-100 text-gray-800' };
}

// --- v2 helpers ---

export function getTextQualityInfo(
  text: TextQualityInput,
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf',
): TextQualityInfo {
  const status = getTextQuality(text, sourceType);
  const aq = text.analysisQuality;
  const aStatus = text.analysisStatus;

  const gloss = aq?.glossCoverage ?? 0;
  const morph = aq?.morphologyCoverage ?? 0;
  const overall = Math.round((gloss + morph) / 2);

  let sourceQuality: TextQualityInfo['sourceQuality'];
  if (text.isSample) {
    sourceQuality = 'sample';
  } else if (text.isComplete && text.sourceStatus === 'complete') {
    sourceQuality = 'curated';
  } else if (text.sourceStatus === 'partial' && !qualityInputHasAnalysis(text)) {
    sourceQuality = 'curated';
  } else if (aStatus === 'analyzed') {
    sourceQuality = 'ai_analyzed';
  } else if (sourceType || text.sourceStatus === 'needs_import') {
    sourceQuality = 'imported';
  } else {
    sourceQuality = 'raw';
  }

  const isCuratedPartial = text.sourceStatus === 'partial' && !qualityInputHasAnalysis(text);

  let trustLevel: TrustLevel;
  switch (status.quality) {
    case 'curated':
      trustLevel = 'high';
      break;
    case 'analyzed':
      trustLevel = 'medium';
      break;
    case 'partial':
      trustLevel = isCuratedPartial ? 'medium' : 'low';
      break;
    case 'sample':
      trustLevel = 'low';
      break;
    case 'needs_ai':
    case 'raw':
      trustLevel = 'untrusted';
      break;
    case 'imported':
      trustLevel = 'low';
      break;
    default:
      trustLevel = 'low';
  }

  let recommendedAction: RecommendedAction;
  switch (status.quality) {
    case 'curated':
      recommendedAction = 'ready_to_read';
      break;
    case 'analyzed':
      recommendedAction = 'ready_to_read';
      break;
    case 'needs_ai':
      recommendedAction = 'run_ai_analysis';
      break;
    case 'partial':
      if (isCuratedPartial) {
        recommendedAction = 'ready_to_read';
      } else if (morph < 80) {
        recommendedAction = 'needs_morphology';
      } else {
        recommendedAction = 'review_tokens';
      }
      break;
    case 'raw':
      recommendedAction = 'run_ai_analysis';
      break;
    case 'imported':
      recommendedAction = 'run_ai_analysis';
      break;
    case 'sample':
      recommendedAction = 'limited_support';
      break;
    default:
      recommendedAction = 'run_ai_analysis';
  }

  return {
    quality: status.quality,
    sourceQuality,
    analysisStatus: aStatus,
    analysisQuality: aq,
    coverage: { gloss, morphology: morph, overall },
    trustLevel,
    recommendedAction,
  };
}

export function getTextQualityBadgeProps(
  text: TextQualityInput,
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf',
): TextQualityStatus {
  return getTextQuality(text, sourceType);
}

export function getRecommendedTextAction(
  text: TextQualityInput,
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf',
): { action: RecommendedAction; label: string } {
  const info = getTextQualityInfo(text, sourceType);
  return { action: info.recommendedAction, label: RECOMMENDED_ACTION_LABELS[info.recommendedAction] };
}
