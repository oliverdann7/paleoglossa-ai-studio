import {
  Type,
  Layout,
  EyeOff,
  AlignJustify,
  Focus,
  BookOpen,
  Microscope,
  Columns,
  Brain,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { DisplayMode } from '@/types/reader';

interface Props {
  chapters: { id: string; title: string }[];
  currentChapterIndex: number;
  onChangeChapter: (index: number) => void;
  showTranslit: boolean;
  onToggleTranslit: () => void;
  showParallel: boolean;
  onToggleParallel: () => void;
  maskKnown: boolean;
  onToggleMaskKnown: () => void;
  readingMode: 'scroll' | 'page';
  onChangeReadingMode: (mode: 'scroll' | 'page') => void;
  interlinearMode: boolean;
  onToggleInterlinear: () => void;
  knownPercent?: number | null;
  displayMode?: DisplayMode;
  onChangeDisplayMode?: (mode: DisplayMode) => void;
  readingTimeMinutes?: number | null;
  onReviewText?: () => void;
  showSyntax?: boolean;
  onToggleSyntax?: () => void;
  hasSyntax?: boolean;
}

const DISPLAY_MODES: { id: DisplayMode; label: string; icon: React.ReactNode }[] = [
  { id: 'scholar', label: 'Scholar', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'focus', label: 'Focus', icon: <Focus className="w-3.5 h-3.5" /> },
  { id: 'morphology', label: 'Morphology', icon: <Microscope className="w-3.5 h-3.5" /> },
  { id: 'interlinear', label: 'Interlinear', icon: <AlignJustify className="w-3.5 h-3.5" /> },
  { id: 'parallel', label: 'Parallel', icon: <Columns className="w-3.5 h-3.5" /> },
];

export function ReaderToolbar({
  chapters,
  currentChapterIndex,
  onChangeChapter,
  showTranslit,
  onToggleTranslit,
  showParallel,
  onToggleParallel,
  maskKnown,
  onToggleMaskKnown,
  readingMode,
  onChangeReadingMode,
  interlinearMode,
  onToggleInterlinear,
  knownPercent,
  displayMode = 'scholar',
  onChangeDisplayMode,
  readingTimeMinutes,
  onReviewText,
  showSyntax,
  onToggleSyntax,
  hasSyntax,
}: Props) {
  const { t } = useTranslation();
  const isFocus = displayMode === 'focus';

  return (
    <div
      className={cn(
        'border-b border-bdr/40 flex items-center justify-between px-4 md:px-6 bg-parch/30 backdrop-blur-sm shrink-0 transition-all',
        isFocus ? 'h-10' : 'h-12'
      )}
    >
      {/* Left — chapter selector + known% + reading time */}
      <div className="flex items-center gap-3 text-[11px] font-medium text-ink2 overflow-hidden">
        <select
          value={currentChapterIndex}
          onChange={(e) => onChangeChapter(parseInt(e.target.value, 10))}
          className="bg-transparent border-none p-0 pr-4 focus:ring-0 cursor-pointer font-bold text-blue truncate max-w-[120px] md:max-w-none"
        >
          {chapters.map((c, i) => (
            <option key={c.id} value={i}>
              {c.title}
            </option>
          ))}
        </select>

        {knownPercent != null && !isFocus && (
          <span
            className={cn(
              'hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border',
              knownPercent >= 80
                ? 'bg-green-50 text-green-700 border-green-200'
                : knownPercent >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue border-blue/20'
            )}
            title={t('reader.knownPercentTitle', 'Percentage of words marked Known or Familiar')}
          >
            {knownPercent}% {t('reader.known', 'known')}
          </span>
        )}

        {readingTimeMinutes != null && readingTimeMinutes > 0 && !isFocus && (
          <span className="hidden lg:inline-flex items-center text-[10px] text-muted font-bold uppercase tracking-widest">
            ~{readingTimeMinutes}m
          </span>
        )}
      </div>

      {/* Right — mode switcher + per-mode toggles */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Display mode switcher — compact icon row */}
        {onChangeDisplayMode && (
          <div className="hidden md:flex items-center gap-0.5 bg-parch3 p-0.5 rounded-lg border border-bdr shrink-0">
            {DISPLAY_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeDisplayMode(m.id)}
                title={m.label}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all',
                  displayMode === m.id
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-muted hover:text-ink cursor-pointer'
                )}
              >
                {m.icon}
                <span className="hidden lg:inline">{m.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Per-mode secondary toggles — hidden in Focus mode */}
        {!isFocus && (
          <>
            <div className="w-px h-4 bg-bdr mx-1 hidden md:block" />
            <button
              onClick={onToggleTranslit}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex',
                showTranslit ? 'bg-purple-100 text-purple-700' : 'text-muted hover:bg-parch3'
              )}
            >
              <Type className="w-3.5 h-3.5" /> {t('reader.toggleTranslit', 'Translit')}
            </button>
            {displayMode !== 'parallel' && (
              <button
                onClick={onToggleParallel}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest',
                  showParallel ? 'bg-blue/10 text-blue' : 'text-muted hover:bg-parch3'
                )}
              >
                <Layout className="w-3.5 h-3.5" /> {t('reader.toggleParallel', 'Parallel')}
              </button>
            )}
            {displayMode === 'scholar' && (
              <button
                onClick={onToggleMaskKnown}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest',
                  maskKnown ? 'bg-amber/10 text-amber' : 'text-muted hover:bg-parch3'
                )}
              >
                <EyeOff className="w-3.5 h-3.5" /> {t('reader.toggleMaskKnown', 'Mask Known')}
              </button>
            )}
            {displayMode !== 'interlinear' && (
              <button
                onClick={onToggleInterlinear}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex',
                  interlinearMode ? 'bg-green-100 text-green-700' : 'text-muted hover:bg-parch3'
                )}
              >
                <AlignJustify className="w-3.5 h-3.5" />{' '}
                {t('reader.toggleInterlinear', 'Interlinear')}
              </button>
            )}
            {hasSyntax && onToggleSyntax && (
              <button
                onClick={onToggleSyntax}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex',
                  showSyntax ? 'bg-blue/10 text-blue' : 'text-muted hover:bg-parch3'
                )}
              >
                <GitBranch className="w-3.5 h-3.5" />{' '}
                {t('reader.toggleSyntax', 'Syntax')}
              </button>
            )}
          </>
        )}

        {onReviewText && !isFocus && (
          <>
            <div className="w-px h-4 bg-bdr mx-1 hidden md:block" />
            <button
              onClick={onReviewText}
              title={t('reader.reviewThisText', 'Review vocabulary from this text')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest text-muted hover:bg-parch3 hidden md:flex"
            >
              <Brain className="w-3.5 h-3.5" /> {t('reader.review', 'Review')}
            </button>
          </>
        )}
        <div className="w-px h-4 bg-bdr mx-1 hidden md:block" />
        <div className="flex bg-parch3 p-0.5 rounded-lg border border-bdr shrink-0">
          <button
            onClick={() => onChangeReadingMode('scroll')}
            className={cn(
              'px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap',
              readingMode === 'scroll'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink cursor-pointer'
            )}
          >
            {t('reader.sentenceView', 'Sentence View')}
          </button>
          <button
            onClick={() => onChangeReadingMode('page')}
            className={cn(
              'px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap',
              readingMode === 'page'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink cursor-pointer'
            )}
          >
            {t('reader.pageView', 'Page View')}
          </button>
        </div>
      </div>
    </div>
  );
}
