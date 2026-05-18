import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  icon?: ReactNode;
  heading: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, heading, description, action, className, compact }: Props) {
  return (
    <div
      className={cn(
        'card p-12 text-center flex flex-col items-center gap-4',
        compact ? 'p-8' : 'p-12',
        'border-dashed border-2 border-bdr/40 bg-parch2/50',
        className
      )}
    >
      {icon && <div className="text-gold/60 mb-1">{icon}</div>}
      <h3 className="text-[18px] font-bold text-ink font-sans">{heading}</h3>
      {description && (
        <p className="text-[14px] text-ink3 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
