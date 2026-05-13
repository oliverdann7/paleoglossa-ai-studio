import { Type, Layout, EyeOff, AlignJustify } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from "react-i18next";

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
}

export function ReaderToolbar({
  chapters, currentChapterIndex, onChangeChapter,
  showTranslit, onToggleTranslit,
  showParallel, onToggleParallel,
  maskKnown, onToggleMaskKnown,
  readingMode, onChangeReadingMode,
  interlinearMode, onToggleInterlinear,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="h-12 border-b border-bdr/40 flex items-center justify-between px-4 md:px-6 bg-parch/30 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2 text-[11px] font-medium text-ink2 overflow-hidden">
        <select
          value={currentChapterIndex}
          onChange={(e) => onChangeChapter(parseInt(e.target.value, 10))}
          className="bg-transparent border-none p-0 pr-4 focus:ring-0 cursor-pointer font-bold text-blue truncate max-w-[120px] md:max-w-none"
        >
          {chapters.map((c, i) => (
            <option key={c.id} value={i}>{c.title}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button
          onClick={onToggleTranslit}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex",
            showTranslit ? "bg-purple-100 text-purple-700" : "text-muted hover:bg-parch3",
          )}
        >
          <Type className="w-3.5 h-3.5" /> {t("reader.toggleTranslit", "Translit")}
        </button>
        <button
          onClick={onToggleParallel}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest",
            showParallel ? "bg-blue/10 text-blue" : "text-muted hover:bg-parch3",
          )}
        >
          <Layout className="w-3.5 h-3.5" /> {t("reader.toggleParallel", "Parallel")}
        </button>
        <button
          onClick={onToggleMaskKnown}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest",
            maskKnown ? "bg-amber/10 text-amber" : "text-muted hover:bg-parch3",
          )}
        >
          <EyeOff className="w-3.5 h-3.5" /> {t("reader.toggleMaskKnown", "Mask Known")}
        </button>
        <button
          onClick={onToggleInterlinear}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex",
            interlinearMode ? "bg-green-100 text-green-700" : "text-muted hover:bg-parch3",
          )}
        >
          <AlignJustify className="w-3.5 h-3.5" /> {t("reader.toggleInterlinear", "Interlinear")}
        </button>
        <div className="w-px h-4 bg-bdr m-1 hidden md:block" />
        <div className="flex bg-parch3 p-0.5 rounded-lg border border-bdr shrink-0">
          <button
            onClick={() => onChangeReadingMode('scroll')}
            className={cn(
              "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
              readingMode === 'scroll' ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink cursor-pointer",
            )}
          >
            {t("reader.sentenceView", "Sentence View")}
          </button>
          <button
            onClick={() => onChangeReadingMode('page')}
            className={cn(
              "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
              readingMode === 'page' ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink cursor-pointer",
            )}
          >
            {t("reader.pageView", "Page View")}
          </button>
        </div>
      </div>
    </div>
  );
}
