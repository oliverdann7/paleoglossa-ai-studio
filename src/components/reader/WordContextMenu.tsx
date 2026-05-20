import { useEffect, useRef } from 'react';
import { BookOpen, GraduationCap, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState } from '@/lib/constants/wordStates';

export interface WordContextMenuProps {
  x: number;
  y: number;
  lemma: string;
  surface: string;
  currentState: WordState;
  onSetState: (state: WordState) => void;
  onOpenDictionary: (lemma: string) => void;
  onClose: () => void;
}

const STATE_ITEMS: { state: WordState; label: string; icon: React.ReactNode; color: string }[] = [
  {
    state: WordState.LEARNING,
    label: 'Learning',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
  },
  {
    state: WordState.FAMILIAR,
    label: 'Familiar',
    icon: <Eye className="w-3.5 h-3.5" />,
    color: 'text-orange-500',
  },
  {
    state: WordState.KNOWN,
    label: 'Known',
    icon: <Check className="w-3.5 h-3.5" />,
    color: 'text-emerald-600',
  },
  {
    state: WordState.IGNORED,
    label: 'Ignore',
    icon: <EyeOff className="w-3.5 h-3.5" />,
    color: 'text-muted',
  },
];

export function WordContextMenu({
  x,
  y,
  lemma,
  surface,
  currentState,
  onSetState,
  onOpenDictionary,
  onClose,
}: WordContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Clamp to viewport after mount
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = menu.getBoundingClientRect();
    if (rect.right > vw - 8) menu.style.left = `${vw - rect.width - 8}px`;
    if (rect.bottom > vh - 8) menu.style.top = `${vh - rect.height - 8}px`;
  }, []);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Word actions for ${surface}`}
      className="fixed z-[9999] min-w-[160px] rounded-lg shadow-lg border border-bdr bg-parch py-1 text-sm"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-bdr mb-1">
        <span className="font-semibold text-ink text-[13px]" dir="auto">
          {surface}
        </span>
        {lemma !== surface && (
          <span className="ml-1.5 text-[11px] text-muted" dir="auto">
            {lemma}
          </span>
        )}
      </div>

      {/* State items */}
      {STATE_ITEMS.map(({ state, label, icon, color }) => (
        <button
          key={state}
          role="menuitem"
          onClick={() => {
            onSetState(state);
            onClose();
          }}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-parch3 transition-colors text-left',
            color,
            currentState === state && 'bg-parch3 font-semibold'
          )}
        >
          {icon}
          <span>{label}</span>
          {currentState === state && (
            <span className="ml-auto text-[10px] text-muted">current</span>
          )}
        </button>
      ))}

      {/* Divider + Dictionary */}
      <div className="border-t border-bdr mt-1 pt-1">
        <button
          role="menuitem"
          onClick={() => {
            onOpenDictionary(lemma);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-parch3 transition-colors text-left text-ink2"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dictionary entry</span>
        </button>
      </div>
    </div>
  );
}
