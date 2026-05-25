import { cn } from '@/lib/utils';
import { getTextQuality } from '../../lib/utils/textQuality';

interface TextQualityBadgeProps {
  text: {
    isComplete?: boolean;
    hasMorphology?: boolean;
    sourceStatus?: string;
    isSample?: boolean;
  };
  sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf';
  className?: string;
}

export const TextQualityBadge = ({ text, sourceType, className }: TextQualityBadgeProps) => {
  const { label, color } = getTextQuality(text, sourceType);
  
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', color, className)}>
      {label}
    </span>
  );
};
