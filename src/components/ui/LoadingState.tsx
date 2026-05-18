import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function LoadingState({ text, className, size = 'md' }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className={cn('animate-spin text-gold', sizes[size])} />
      {text && <p className="text-[14px] text-muted italic">{text}</p>}
    </div>
  );
}
