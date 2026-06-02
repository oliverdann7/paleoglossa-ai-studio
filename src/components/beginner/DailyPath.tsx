import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, Clock, FlaskConical, RefreshCw, Sparkles } from 'lucide-react';
import { useSettings } from '../../lib/hooks/useSettings.js';
import { useBeginnerProgress } from '../../lib/hooks/useBeginnerProgress.js';
import { useKnowledge } from '../../lib/hooks/useKnowledge.js';
import { countDueToday } from '../../lib/services/forecastService.js';
import { computeDailyPath, totalEstimatedMinutes } from '../../lib/services/dailyPathService.js';
import type { DailyPathItem } from '../../lib/services/dailyPathService.js';
import { getLanguageById } from '../../lib/constants/languages.js';
import { CorpusDB } from '../../data/corpus.js';
import { GUIDED_TIERS } from '../../lib/constants/beginnerPaths.js';
import { getBeginnerCurriculum } from '../../lib/constants/beginnerCurriculum.js';
import { cn } from '../../lib/utils.js';

/** Maps onboarding level strings to tier IDs used in BeginnerHub. */
const LEVEL_TO_TIER: Record<string, string> = {
  'absolute-beginner': 'know-nothing',
  'knows-alphabet': 'know-alphabet',
  intermediate: 'read-slowly',
  advanced: 'academic',
};

function itemIcon(id: DailyPathItem['id']) {
  switch (id) {
    case 'script':
      return FlaskConical;
    case 'reading':
      return BookOpen;
    case 'review':
      return RefreshCw;
  }
}

interface DailyPathProps {
  className?: string;
}

/**
 * Personalized "Today's path" panel shown at the top of the Beginner Hub.
 *
 * Self-contained — calls its own hooks and renders nothing when there is no
 * onboarding profile or no applicable items. This keeps BeginnerHub.tsx
 * clean and avoids prop-drilling.
 */
export function DailyPath({ className }: DailyPathProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const onboarding = settings.onboardingProfile;

  // All hooks must be called unconditionally (Rules of Hooks).
  const languageId = onboarding?.languageId ?? '';
  const dailyCommitment = onboarding?.dailyCommitment ?? 10;
  const level = onboarding?.level ?? 'absolute-beginner';

  const { getProgress, markMilestone, advanceCurriculum } = useBeginnerProgress();
  const progress = getProgress(languageId);

  const curriculum = useMemo(
    () => (languageId ? getBeginnerCurriculum(languageId) : null),
    [languageId]
  );

  // useKnowledge with no language ID loads the full map for all languages.
  // For a single-language daily path this is fine — countDueToday works on
  // the whole map and the user's primary language will dominate.
  const { knowledge } = useKnowledge(languageId || undefined);
  const dueCount = useMemo(() => (languageId ? countDueToday(knowledge) : 0), [knowledge, languageId]);

  const lang = useMemo(() => (languageId ? getLanguageById(languageId) : undefined), [languageId]);

  /** Recommended beginner text ID for the primary language. */
  const textId = useMemo(() => {
    if (!languageId) return null;
    const texts = CorpusDB.getTexts().filter((tx) => tx.language === languageId);
    if (texts.length === 0) return null;
    const rec = lang?.recommendedStartTextId;
    if (rec && texts.some((tx) => tx.id === rec)) return rec;
    const beginner = texts.find((tx) => tx.level === 'A1' || tx.level === 'A0');
    return beginner?.id ?? texts[0]?.id ?? null;
  }, [lang, languageId]);

  const tierId = useMemo(
    () => LEVEL_TO_TIER[level] ?? GUIDED_TIERS[0]?.id ?? 'know-nothing',
    [level]
  );

  const items = useMemo(
    () =>
      languageId
        ? computeDailyPath({
            languageId,
            tierId,
            hasScriptLearning: lang?.hasScriptLearning ?? false,
            progress,
            textId,
            dueCount,
            dailyCommitment,
            curriculum,
            curriculumIndex: progress.curriculumIndex,
          })
        : [],
    [languageId, tierId, lang?.hasScriptLearning, progress, textId, dueCount, dailyCommitment, curriculum]
  );

  // Nothing to show — don't render the card at all.
  if (!onboarding?.languageId || items.length === 0) return null;

  const allComplete = items.every((item) => item.isComplete);
  const totalMinutes = totalEstimatedMinutes(items);

  return (
    <div className={cn('card p-6', className)}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue shrink-0" />
          <p className="text-[11px] font-bold text-ink3 uppercase tracking-widest">
            {t('dailyPath.title', "Today's path")}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <Clock className="w-3 h-3" />
          <span>~{totalMinutes} {t('common.min', 'min')}</span>
        </div>
      </div>

      {/* ── All-done state ─────────────────────────────────────────────── */}
      {allComplete ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-ink">
            {t('dailyPath.allDone', "You're all caught up!")}
          </p>
          <p className="text-xs text-muted mt-1">
            {t('dailyPath.allDoneDesc', 'Great work today. New cards will appear tomorrow.')}
          </p>
        </div>
      ) : (
        /* ── Item list ──────────────────────────────────────────────────── */
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = itemIcon(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-all',
                  item.isComplete
                    ? 'bg-green-50/50 border-green-100'
                    : 'bg-white/50 border-bdr hover:border-blue/30'
                )}
              >
                {/* Step icon / checkmark */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    item.isComplete ? 'bg-green-100 text-green-600' : 'bg-blue/10 text-blue'
                  )}
                >
                  {item.isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      item.isComplete ? 'text-green-700 line-through decoration-green-400' : 'text-ink'
                    )}
                  >
                    {item.id === 'script' && t('dailyPath.scriptDrill', 'Learn the script')}
                    {item.id === 'reading' &&
                      (item.unitTitle ?? t('dailyPath.readingBite', 'Read a passage'))}
                    {item.id === 'review' &&
                      t('dailyPath.reviewCards', '{{count}} cards to review', {
                        count: item.dueCount,
                      })}
                  </div>

                  {!item.isComplete && (
                    <div className="text-[11px] text-muted mt-0.5 leading-snug">
                      {item.id === 'script' &&
                        t(
                          'dailyPath.scriptDesc',
                          'Practice reading characters with the interactive script lab'
                        )}
                      {item.id === 'reading' &&
                        (item.unitLevel
                          ? t('dailyPath.readingUnitDesc', 'Level {{level}} · continue your reading path', {
                              level: item.unitLevel,
                            })
                          : t('dailyPath.readingDesc', 'Open a beginner text and start reading'))}
                      {item.id === 'review' &&
                        t(
                          'dailyPath.reviewDesc',
                          'Catch up on your spaced-repetition review queue'
                        )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-2.5 h-2.5 text-muted" />
                    <span className="text-[10px] text-muted">~{item.estimatedMinutes} {t('common.min', 'min')}</span>
                  </div>
                </div>

                {/* CTA button */}
                {!item.isComplete && (
                  <Link
                    to={item.link}
                    onClick={() => {
                      if (item.id === 'reading' && languageId) {
                        markMilestone(languageId, 'firstTextOpened');
                        if (item.curriculumIndex !== undefined) {
                          advanceCurriculum(languageId, item.curriculumIndex + 1);
                        }
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 text-[11px] font-semibold bg-blue text-white rounded-lg hover:bg-blue/90 active:scale-95 transition-all self-center"
                  >
                    {t('common.start', 'Start')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
