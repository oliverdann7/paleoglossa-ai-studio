import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Brain, BookOpen, Target, Sparkles, CheckCircle2, ChevronRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from './reader/ProgressRing.js';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: string;
  route: string;
  priority: number;
  completed: boolean;
  color: string;
}

interface StudyPlanWidgetProps {
  reviewCount: number;
  wordsReadToday: number;
  dailyGoal: number;
  streak: number;
  continueText: { id: string; title: string; lastPosition: number } | null;
  recommendedText: { id: string; title: string; percentKnown?: number } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudyPlanWidget({
  reviewCount,
  wordsReadToday,
  dailyGoal,
  streak,
  continueText,
  recommendedText,
}: StudyPlanWidgetProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dailyProgress = Math.min(1, wordsReadToday / dailyGoal);
  const goalReached = dailyProgress >= 1;

  const steps = useMemo((): StudyStep[] => {
    const plan: StudyStep[] = [];

    // 1. SRS Reviews (highest priority when due)
    if (reviewCount > 0) {
      plan.push({
        id: 'review',
        icon: <Brain className="w-4 h-4" />,
        title: t('studyPlan.reviewDue', 'Review {{count}} words', { count: reviewCount }),
        subtitle: t('studyPlan.reviewSub', 'Spaced repetition — strengthen fading memories'),
        action: t('studyPlan.startReview', 'Start Review'),
        route: '/app/review',
        priority: reviewCount >= 10 ? 100 : 80,
        completed: false,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
      });
    }

    // 2. Continue Reading
    if (continueText && continueText.lastPosition < 95) {
      plan.push({
        id: 'continue',
        icon: <BookOpen className="w-4 h-4" />,
        title: t('studyPlan.continueReading', 'Continue "{{title}}"', {
          title:
            continueText.title.length > 30
              ? continueText.title.slice(0, 30) + '…'
              : continueText.title,
        }),
        subtitle: t('studyPlan.continueSub', '{{pct}}% complete — keep building context', {
          pct: Math.round(continueText.lastPosition),
        }),
        action: t('studyPlan.resume', 'Resume'),
        route: `/app/reader/${continueText.id}`,
        priority: 70,
        completed: false,
        color: 'text-blue bg-blue/5 border-blue/20',
      });
    }

    // 3. Discover new text (if no active reading or nearly done)
    if (recommendedText && (!continueText || continueText.lastPosition >= 90)) {
      plan.push({
        id: 'discover',
        icon: <Sparkles className="w-4 h-4" />,
        title: t('studyPlan.tryNew', 'Try "{{title}}"', {
          title:
            recommendedText.title.length > 30
              ? recommendedText.title.slice(0, 30) + '…'
              : recommendedText.title,
        }),
        subtitle: t('studyPlan.tryNewSub', '{{pct}}% vocabulary coverage — optimal difficulty', {
          pct: recommendedText.percentKnown ?? 0,
        }),
        action: t('studyPlan.read', 'Read'),
        route: `/app/reader/${recommendedText.id}`,
        priority: 50,
        completed: false,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      });
    }

    // 4. Daily goal nudge (lower priority, just a reminder)
    if (!goalReached && wordsReadToday > 0) {
      const remaining = dailyGoal - wordsReadToday;
      plan.push({
        id: 'goal',
        icon: <Target className="w-4 h-4" />,
        title: t('studyPlan.dailyGoal', 'Read {{count}} more words', { count: remaining }),
        subtitle: t('studyPlan.dailyGoalSub', '{{pct}}% of daily goal complete', {
          pct: Math.round(dailyProgress * 100),
        }),
        action: t('studyPlan.readMore', 'Read More'),
        route: '/app/library',
        priority: 30,
        completed: false,
        color: 'text-amber bg-amber/5 border-amber/20',
      });
    }

    // Sort by priority (highest first) and take top 3
    return plan.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [
    reviewCount,
    continueText,
    recommendedText,
    goalReached,
    wordsReadToday,
    dailyGoal,
    dailyProgress,
    t,
  ]);

  // Don't show if there's nothing actionable
  if (steps.length === 0 && goalReached) {
    return (
      <div className="card p-6 border-emerald-200 bg-emerald-50/30 mb-10">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <div className="font-bold text-ink text-[15px]">
              {t('studyPlan.allDone', "Today's plan complete!")}
            </div>
            <div className="text-[13px] text-ink3">
              {t(
                'studyPlan.allDoneDesc',
                "You've reached your daily goal. Come back tomorrow or keep exploring."
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (steps.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted">
            {t('studyPlan.title', "Today's Study Plan")}
          </h3>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" />
              {streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ProgressRing progress={dailyProgress} size={24} strokeWidth={2.5} />
          <span className="text-[11px] font-bold text-muted">
            {wordsReadToday}/{dailyGoal}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.button
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
            onClick={() => navigate(step.route)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all',
              'hover:shadow-md active:scale-[0.98] group text-left',
              step.color
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-white/80'
              )}
            >
              {step.completed ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-ink leading-tight truncate">
                {step.title}
              </div>
              <div className="text-[11px] text-ink3 mt-0.5 truncate">{step.subtitle}</div>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {step.action}
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        ))}

        {/* Completed goal step */}
        {goalReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-emerald-700 leading-tight line-through opacity-60">
                {t('studyPlan.goalComplete', 'Daily reading goal')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">
                {t('studyPlan.goalCompleteSub', '{{count}} words read today ✓', {
                  count: wordsReadToday,
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
