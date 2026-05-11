import { Play, Pause, Repeat, Repeat1 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioProgress: number;
  audioSpeed: number;
  onChangeSpeed: () => void;
  loopSentence: boolean;
  onToggleLoopSentence: () => void;
  loopWord: boolean;
  onToggleLoopWord: () => void;
}

export function ReaderAudioBar({
  isPlaying, onTogglePlay, audioProgress, audioSpeed, onChangeSpeed,
  loopSentence, onToggleLoopSentence, loopWord, onToggleLoopWord,
}: Props) {
  return (
    <div className="h-14 bg-parch text-ink border-b border-bdr flex items-center gap-4 px-4 shadow-sm z-30">
      <button
        onClick={onTogglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue text-white hover:bg-blue-600 transition-transform active:scale-95 shadow-sm shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" fill="currentColor" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex-1 flex items-center gap-3">
        <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden cursor-pointer">
          <div
            className="h-full bg-gold transition-all duration-100 ease-linear"
            style={{ width: `${audioProgress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onChangeSpeed}
          className="text-[11px] font-mono font-bold text-ink w-10 text-center hover:bg-parch3 px-1 py-1 rounded"
        >
          {audioSpeed}x
        </button>
        <button
          onClick={onToggleLoopSentence}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            loopSentence ? "text-gold bg-gold/10" : "text-muted hover:bg-parch3",
          )}
          title="Loop Sentence"
        >
          <Repeat className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleLoopWord}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            loopWord ? "text-gold bg-gold/10" : "text-muted hover:bg-parch3",
          )}
          title="Loop Word"
        >
          <Repeat1 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
