import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarDays, BookOpen, GraduationCap, Layers, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { useSettings } from '../../lib/hooks/useSettings.js';
import { useBeginnerProgress } from '../../lib/hooks/useBeginnerProgress.js';
import { getLanguageById } from '../../lib/constants/languages.js';
import { CorpusDB } from '../../data/corpus.js';
import { ReviewService } from '../../lib/services/reviewService.js';
import { StatsService } from '../../lib/services/statsService.js';
import { buildDailyPath, isReadToday } from '../../lib/services/dailyPathService.js';
import type { DailyPathItem } from '../../lib/services/dailyPathService.js';
import { cn } from '../../lib/utils.js';

const ICON_BY_TYPE: Record<DailyPathItem['type'], typeof BookOpen> = {
  script: GraduationCap,
  reading: BookOpen,
  review: Layers,
};

function PathItemRow({ item }: { item: DailyPathItem }) {
  const Icon = ICON_BY_TYPE[item.type];

  return (
    <Link
      to={item.link}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-colors group',
        item.done
          ? 'bg-green-50/60 border-green-200 opacity-75'
          : 'bg-white/60 border-bdr hover:border-blue/30 hover:bg-blue/5'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          item.done ? 'bg-green-500' : 'bg-parch3'
        )}
      >
        {item.done ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : (
          <Icon className="w-4 h-4 text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm font-semibold truncate',
            item.done ? 'text-green-700 line-through decoration-green-400/50' : 'text-ink'
          )}
        >
          {item.title}
        </div>
        <div className="text-[11px] text-muted truncate">{item.description}</div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] text-muted">~{item.estimatedMinutes}m</span>
        {!item.done && (
          <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </Link>
  );
}

interface DailyPathProps {
  languageId: string;
  tierId: string;
}

export function DailyPath({ languageId, tierId }: DailyPathProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { getProgress } = useBeginnerProgress();

  // null = not yet fetched; number = fetched (0 means none due)
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);

  const lang = useMemo(() => getLanguageById(languageId), [languageId]);
  const onboarding = settings.onboardingProfile;
  const progress = getProgress(languageId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let due = 0;
      let lat: string | null = null;

      if (user?.uid && languageId) {
        const [dueItems, progressItems] = await Promise.all([
          ReviewService.getDueItems(user.uid, 20, languageId).catch(() => []),
          StatsService.getAllProgress(user.uid, languageId).catch(() => []),
        ]);
        due = dueItems.length;
        lat = progressItems[0]?.lastReadAt ?? null;
      }

      if (!cancelled) {
        setDueCount(due);
        setLastReadAt(lat);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, languageId]);

  const recommendedTextId = lang?.recommendedStartTextId ?? null;

  const recommendedTextTitle = useMemo(() => {
    if (!recommendedTextId) return null;
    return CorpusDB.getTexts().find((t) => t.id === recommendedTextId)?.title ?? null;
  }, [recommendedTextId]);

  const readToday = useMemo(() => isReadToday(lastReadAt), [lastReadAt]);

  const items = useMemo(() => {
    if (!lang || !onboarding || dueCount === null) return [];
    return buildDailyPath({
      languageId,
      languageName: lang.name,
      writingSystem: lang.writingSystem,
      hasScriptLearning: lang.hasScriptLearning ?? false,
      dailyCommitment: onboarding.dailyCommitment,
      tierId,
      scriptOpened: progress.scriptOpened,
      dueReviewCount: dueCount,
      recommendedTextId,
      recommendedTextTitle,
      readToday,
    });
  }, [lang, onboarding, dueCount, languageId, tierId, progress.scriptOpened, recommendedTextId, recommendedTextTitle, readToday]);

  if (!onboarding || !lang || dueCount === null || items.length === 0) return null;

  const totalMinutes = items.reduce((s, i) => s + i.estimatedMinutes, 0);
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-8"
    >
      <div
        className={cn(
          'rounded-2xl border p-5',
          allDone ? 'bg-green-50/40 border-green-200' : 'bg-sand border-bdr'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue shrink-0" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-widest">Today</h2>
            {allDone && (
              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Done!
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted">
            {doneCount > 0 && `${doneCount}/${items.length} · `}~{totalMinutes} min
          </span>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => (
            <PathItemRow key={item.type} item={item} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
