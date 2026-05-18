import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProgressRing } from './ProgressRing.js';

interface Props {
  readToday: number;
  dailyGoalWords: number;
  onBack: () => void;
  onMinuteElapsed?: () => void;
}

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)} min`;
}

export function ReaderProgressHeader({
  readToday,
  dailyGoalWords,
  onBack,
  onMinuteElapsed,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const onMinuteElapsedRef = useRef(onMinuteElapsed);
  useLayoutEffect(() => {
    onMinuteElapsedRef.current = onMinuteElapsed;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next % 60 === 0) onMinuteElapsedRef.current?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-14 bg-parch2 border-b border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 transition-colors">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
          <span className="text-[16px] md:text-[18px] font-bold text-blue leading-none">
            {readToday?.toLocaleString() || 0}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted font-bold hidden md:inline">
            Read Today
          </span>
        </div>
        <div className="hidden md:flex flex-col md:flex-row md:items-baseline md:gap-2">
          <span className="text-[18px] font-bold text-ink leading-none">{formatTime(elapsed)}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Session</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] font-bold text-ink3 uppercase tracking-tight">
            Goal
          </span>
          <ProgressRing progress={Math.min(1, readToday / Math.max(1, dailyGoalWords))} />
        </div>
        <div className="w-px h-8 bg-bdr/50" />
        <button
          onClick={onBack}
          className="p-2 text-link hover:bg-parch3 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink3" />
        </button>
      </div>
    </div>
  );
}
