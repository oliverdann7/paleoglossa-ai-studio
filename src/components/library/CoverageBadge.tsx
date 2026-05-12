import { cn } from '@/lib/utils';

interface Props {
  percent: number;
  size?: 'sm' | 'md';
}

export function CoverageBadge({ percent, size = 'sm' }: Props) {
  const { label, cls } = (() => {
    if (percent >= 98) return { label: 'Comfortable', cls: 'bg-ink3/10 text-ink3' };
    if (percent >= 90) return { label: 'Optimal ✦', cls: 'bg-green-100 text-green-700' };
    if (percent >= 70) return { label: 'Developing', cls: 'bg-amber/15 text-amber' };
    return { label: 'Challenging', cls: 'bg-ruby/10 text-ruby' };
  })();

  return (
    <span
      title={`${percent}% of words known — ${label}`}
      className={cn(
        'inline-block font-bold rounded-full uppercase tracking-widest',
        size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-3 py-1',
        cls,
      )}
    >
      {percent}% · {label}
    </span>
  );
}
