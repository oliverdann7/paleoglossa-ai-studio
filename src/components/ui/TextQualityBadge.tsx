import { cn } from '@/lib/utils';
import { getTextQuality, getRecommendedTextAction } from '../../lib/utils/textQuality';
import { AnalysisQuality } from '../../lib/utils/analysisQuality';

interface TextQualityBadgeProps {
  text: {
    isComplete?: boolean;
    hasMorphology?: boolean;
    sourceStatus?: string;
    isSample?: boolean;
    analysisStatus?: string;
    analysisQuality?: AnalysisQuality;
  };
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf';
  className?: string;
  showDetails?: boolean;
  showAction?: boolean;
}

export const TextQualityBadge = ({ text, sourceType, className, showDetails, showAction }: TextQualityBadgeProps) => {
  const { label, color } = getTextQuality(text, sourceType);
  const action = showAction ? getRecommendedTextAction(text, sourceType) : null;

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', color)}>
        {label}
      </span>
      {(showDetails || showAction) && (
        <div className="text-[9px] text-muted space-y-0.5 px-1">
          {showDetails && text.analysisQuality && (
            <>
              <div>Gloss: {text.analysisQuality.glossCoverage}%</div>
              <div>Morph: {text.analysisQuality.morphologyCoverage}%</div>
              {typeof text.analysisQuality.averageConfidence === 'number' && (
                <div>Conf: {Math.round(text.analysisQuality.averageConfidence * 100)}%</div>
              )}
            </>
          )}
          {action && (
            <div className="font-medium">{action.label}</div>
          )}
        </div>
      )}
    </div>
  );
};
