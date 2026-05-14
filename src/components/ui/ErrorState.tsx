import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  message: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ message, detail, onRetry, retryLabel, className, compact }: Props) {
  return (
    <div
      className={cn(
        'card p-12 text-center flex flex-col items-center gap-4',
        compact ? 'p-8' : 'p-12',
        'border border-ruby/20 bg-rubyxl/30',
        className,
      )}
    >
      <AlertTriangle className="text-ruby/60 w-8 h-8" />
      <h3 className="text-[16px] font-bold text-ink font-sans">
        {message}
      </h3>
      {detail && (
        <p className="text-[13px] text-ink3 max-w-sm leading-relaxed">
          {detail}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary px-5 py-2 text-[13px] flex items-center gap-2 mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryLabel || 'Try again'}
        </button>
      )}
    </div>
  );
}
