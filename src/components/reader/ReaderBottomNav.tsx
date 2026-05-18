import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SourceKind = 'import' | 'sample' | 'partial' | 'complete';

interface Props {
  scrollProgress: number;
  readingMode: 'scroll' | 'page';
  sourceKind: SourceKind;
  currentSentenceIndex: number;
  totalSentences: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onMarkKnown: () => void;
}

export function ReaderBottomNav({
  scrollProgress,
  readingMode,
  sourceKind,
  currentSentenceIndex,
  totalSentences,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onMarkKnown,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="h-12 bg-parch2 border-t border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 z-30 pb-safe">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex h-1 w-32 bg-parch3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        {readingMode === 'page' ? (
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {currentSentenceIndex + 1} / {totalSentences}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted hidden md:inline">
            {Math.round(scrollProgress)}% read
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onMarkKnown}
          className="bg-blue text-white px-4 md:px-5 py-1.5 rounded-full text-[12px] font-bold hover:bg-blue/90 shadow-sm transition-all whitespace-nowrap"
        >
          {readingMode === 'page'
            ? t('reader.markKnown', 'Mark Known & Next')
            : sourceKind === 'sample'
              ? t('reader.markSampleSeen', 'Mark Sample as Seen')
              : sourceKind === 'import'
                ? t('reader.markTextSeen', 'Mark Text as Seen')
                : t('reader.markPageKnown', 'Mark Page as Seen & Next')}
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
