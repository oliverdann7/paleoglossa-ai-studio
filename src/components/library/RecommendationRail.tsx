import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, TrendingUp, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { RecommendedText } from '@/lib/services/recommendationService';
import { getLanguageDisplayName } from '@/lib/constants/languages';

interface Props {
  texts: RecommendedText[];
}

const DIFFICULTY_CONFIG: Record<
  RecommendedText['difficultyLabel'],
  { icon: React.ReactNode; labelKey: string; fallback: string; cls: string }
> = {
  easy: {
    icon: <Zap className="w-3 h-3" />,
    labelKey: 'rec.labelEasy',
    fallback: 'Easy read',
    cls: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  justRight: {
    icon: <Target className="w-3 h-3" />,
    labelKey: 'rec.labelJustRight',
    fallback: 'Just right',
    cls: 'text-blue bg-blue/5 border-blue/20',
  },
  stretch: {
    icon: <TrendingUp className="w-3 h-3" />,
    labelKey: 'rec.labelStretch',
    fallback: 'Stretch yourself',
    cls: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  challenging: {
    icon: <BookOpen className="w-3 h-3" />,
    labelKey: 'rec.labelChallenging',
    fallback: 'Challenging',
    cls: 'text-red-600 bg-red-50 border-red-200',
  },
};

export function RecommendationRail({ texts }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (texts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">
          {t('rec.title', 'Recommended for You')}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {texts.map((text) => {
          const config = DIFFICULTY_CONFIG[text.difficultyLabel];
          const pku = text.percentKnownUnique ?? text.percentKnown ?? 0;

          return (
            <button
              key={text.id}
              onClick={() => navigate(`/app/reader/${text.id}`)}
              className="card p-4 text-left hover:border-blue/30 hover:shadow-md transition-all active:scale-[0.98] group flex flex-col"
            >
              {/* Difficulty label */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
                    config.cls
                  )}
                >
                  {config.icon}
                  {t(config.labelKey, config.fallback)}
                </span>
                <span className="text-[10px] font-bold text-blue uppercase tracking-widest">
                  {getLanguageDisplayName(text.language)}
                </span>
              </div>

              {/* Title & author */}
              <div className="text-[14px] font-serif font-bold text-ink leading-snug mb-1 line-clamp-2 group-hover:text-blue transition-colors">
                {text.title}
              </div>
              {text.author && (
                <div className="text-[10px] text-muted mb-3 truncate">{text.author}</div>
              )}

              {/* Stats row */}
              <div className="mt-auto flex items-center gap-3 text-[11px]">
                <span className="font-bold text-ink3">{pku}% {t('rec.known', 'known')}</span>
                {text.newWordsCount > 0 && (
                  <span className="text-blue font-bold">
                    +{text.newWordsCount} {t('rec.newWords', 'new')}
                  </span>
                )}
              </div>

              {/* Reason */}
              <div className="mt-2 text-[11px] text-muted italic truncate">
                {t(text.reasonKey, text.reason)}
              </div>

              {/* Coverage bar */}
              <div className="mt-2 h-1 bg-parch3 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    pku >= 90 ? 'bg-emerald-400' : pku >= 80 ? 'bg-blue' : 'bg-amber-400'
                  )}
                  style={{ width: `${pku}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
