/**
 * "Ready to Read" rail — surfaces lemma-based, comprehension-banded
 * recommendations from /api/recommendations.
 *
 * Cold-start (empty result for a signed-in user) routes to /app/onboarding so
 * the user can seed their known-lemma set. Signed-out users see nothing —
 * the existing Landing/onboarding flow already handles them.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { fetchReadyToRead, type ReadyToReadPick } from '../../lib/services/recommendationApi.js';

interface Props {
  activeLanguageId?: string;
  limit?: number;
}

export function ReadyToReadRail({ activeLanguageId, limit = 4 }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [picks, setPicks] = useState<ReadyToReadPick[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchReadyToRead({ languageId: activeLanguageId, limit })
      .then((res) => {
        if (!cancelled) setPicks(res);
      })
      .catch(() => {
        if (!cancelled) setPicks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, activeLanguageId, limit]);

  if (!user) return null;
  if (picks === null) return null;

  // Cold start — invite the user to seed their known-lemma set.
  if (picks && picks.length === 0) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {t('dashboard.readyToRead', 'Ready to read')}
        </h2>
        <div className="rounded-2xl border border-parch2 bg-parch2/40 p-6 flex items-center justify-between gap-4">
          <p className="text-sm opacity-80">
            {t(
              'dashboard.readyToReadColdStart',
              'Tell us a few words you already know and we’ll find texts you can read right now.'
            )}
          </p>
          <button
            onClick={() => navigate('/app/onboarding')}
            className="px-4 py-2 rounded-xl bg-ink text-parch hover:opacity-90 whitespace-nowrap"
          >
            {t('dashboard.readyToReadStart', 'Get started')}
            <ArrowRight className="inline w-4 h-4 ml-1" />
          </button>
        </div>
      </section>
    );
  }

  if (!picks || picks.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-serif mb-1 flex items-center gap-2">
        <BookOpen className="w-6 h-6" />
        {t('dashboard.readyToRead', 'Ready to read')}
      </h2>
      <p className="text-sm opacity-60 mb-4">
        {t(
          'dashboard.readyToReadSubtitle',
          'Texts in your comprehension band — challenging enough to learn, easy enough to enjoy.'
        )}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {picks.map((p) => {
          const href = p.sectionId
            ? `/app/reader/${p.textId}?section=${encodeURIComponent(p.sectionId)}`
            : `/app/reader/${p.textId}`;
          return (
            <button
              key={p.textId}
              onClick={() => navigate(href)}
              className="text-left rounded-2xl border border-parch2 bg-parch hover:bg-parch2/60 transition-all p-5 group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-serif text-lg leading-tight">{p.title}</h3>
                {p.level && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-parch3 opacity-75 whitespace-nowrap">
                    {p.level}
                  </span>
                )}
              </div>
              {p.author && <p className="text-xs opacity-60 mb-3">{p.author}</p>}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.comprehensionLabel}</span>
                <span className="opacity-60">{p.newLemmasLabel}</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-parch3 overflow-hidden">
                <div
                  className="h-full bg-ink/70 transition-all"
                  style={{ width: `${Math.round(p.comprehension * 100)}%` }}
                />
              </div>
              <div className="mt-3 text-xs text-ink/60 group-hover:text-ink/90 flex items-center gap-1">
                {t('dashboard.startReading', 'Start reading')}
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
