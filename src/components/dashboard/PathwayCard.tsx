/**
 * "Your reading path" — where the learner stands on the curated pathway for
 * the active language, the destination they are aiming for, and the next text.
 * Renders nothing for languages without a pathway.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CorpusDB } from '../../data/corpus.js';
import { pathwayGoals, pathwayPosition } from '../../lib/reading/pathways.js';
import { useReadingGoal } from '../../lib/hooks/useReadingGoal.js';
import { trackEvent, ANALYTICS_EVENTS } from '../../lib/analytics.js';
import { cn } from '../../lib/utils.js';

interface Props {
  activeLanguageId?: string;
  /** Reading progress records for the signed-in or guest learner. */
  readingProgress: Array<{ textId: string; completed?: boolean; lastPosition?: number }>;
}

export function PathwayCard({ activeLanguageId, readingProgress }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goalTextId, setGoal } = useReadingGoal(activeLanguageId);

  const finished = useMemo(
    () =>
      new Set(
        readingProgress
          .filter((p) => p.completed || (p.lastPosition ?? 0) >= 95)
          .map((p) => p.textId)
      ),
    [readingProgress]
  );
  const position = useMemo(
    () => pathwayPosition(activeLanguageId, finished, goalTextId),
    [activeLanguageId, finished, goalTextId]
  );
  if (!position) return null;

  const { pathway, goal, steps, done, next } = position;
  const goals = pathwayGoals(pathway);
  const title = (textId: string) => CorpusDB.getText(textId)?.title ?? textId;

  return (
    <section
      data-testid="pathway-card"
      aria-labelledby="pathway-card-title"
      className="mb-8 rounded-[24px] border border-bdr/60 bg-parch2 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-muted">
            {t('pathway.eyebrow', 'Your reading path · {{language}}', { language: pathway.title })}
          </p>
          <h2 id="pathway-card-title" className="mt-1 font-serif text-[22px] text-ink">
            {goal.goal}
          </h2>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-muted">
          <Flag className="h-3.5 w-3.5" aria-hidden />
          <span>{t('pathway.goalLabel', 'Aiming for')}</span>
          <select
            data-testid="pathway-goal"
            value={goal.textId}
            onChange={(e) => {
              setGoal(e.target.value);
              trackEvent(ANALYTICS_EVENTS.READING_GOAL_SET, {
                languageId: pathway.languageId,
                goalTextId: e.target.value,
              });
            }}
            className="rounded-lg border border-bdr/60 bg-white px-2 py-1 text-[13px] text-ink"
          >
            {goals.map((g) => (
              <option key={g.textId} value={g.textId}>
                {g.goal}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ol className="mt-4 flex flex-wrap gap-x-2 gap-y-2" aria-label={t('pathway.steps', 'Steps')}>
        {steps.map((step, i) => {
          const isDone = i < done;
          const isNext = step === next;
          return (
            <li key={step.textId} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/app/reader/${encodeURIComponent(step.textId)}`)}
                title={step.why}
                aria-current={isNext ? 'step' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors',
                  isNext
                    ? 'border-blue bg-blue text-white'
                    : isDone
                      ? 'border-bdr/50 bg-parch3 text-muted'
                      : 'border-bdr/60 bg-white text-ink2 hover:bg-parch'
                )}
              >
                {isDone && <Check className="h-3 w-3" aria-hidden />}
                <bdi>{title(step.textId)}</bdi>
                {isDone && <span className="sr-only">{t('pathway.done', '(done)')}</span>}
              </button>
              {i < steps.length - 1 && (
                <span className="text-muted/50" aria-hidden>
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {next ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink2">
            <span className="font-semibold">
              {t('pathway.progress', '{{done}} of {{total}}', { done, total: steps.length })}
            </span>
            {' · '}
            {next.why}
          </p>
          <button
            type="button"
            data-testid="pathway-continue"
            onClick={() => navigate(`/app/reader/${encodeURIComponent(next.textId)}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-parch2 transition-all hover:opacity-90 active:scale-95"
          >
            {t('pathway.continue', 'Continue')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-ink2">
          {t('pathway.reached', 'Destination reached. Choose the next one above.')}
        </p>
      )}
    </section>
  );
}
