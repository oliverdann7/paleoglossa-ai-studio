import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { LibraryText } from '@/lib/services/libraryService';
import { CoverageBadge } from './CoverageBadge.js';

interface Props {
  texts: LibraryText[];
}

export function RecommendationRail({ texts }: Props) {
  const navigate = useNavigate();

  if (texts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">
          Recommended for You
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {texts.map((text) => (
          <button
            key={text.id}
            onClick={() => navigate(`/app/reader/${text.id}`)}
            className="flex-shrink-0 w-52 card p-4 text-left hover:border-blue/30 hover:shadow-md transition-all active:scale-95"
          >
            <div className="text-[13px] font-bold text-ink leading-tight mb-1 line-clamp-2">
              {text.title}
            </div>
            <div className="text-[10px] text-muted mb-2">{text.author}</div>
            <CoverageBadge percent={text.percentKnown ?? 0} size="sm" />
          </button>
        ))}
      </div>
    </div>
  );
}
