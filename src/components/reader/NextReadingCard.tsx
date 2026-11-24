import { ArrowRight, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NextReading } from '@/lib/reading/nextReading';

interface Props {
  next: NextReading;
  onOpen: (textId: string) => void;
}

/** Shown at the end of a text: one suggestion for what to read next, with the reason. */
export function NextReadingCard({ next, onOpen }: Props) {
  const { t } = useTranslation();
  const { text, reason } = next;

  const reasonLine =
    reason === 'pathway'
      ? next.goal
        ? t('reader.nextReading.onPath', 'Next on your way to: {{goal}}', { goal: next.goal })
        : t('reader.nextReading.pathOnward', 'Next on your reading path')
      : reason === 'resume'
        ? t('reader.nextReading.resume', 'You have already begun this one')
        : reason === 'readable'
          ? t('reader.nextReading.readable', 'Within reach of the words you know')
          : reason === 'sameAuthor'
            ? t('reader.nextReading.sameAuthor', 'More by {{author}}', { author: text.author })
            : reason === 'nextLevel'
              ? t('reader.nextReading.nextLevel', 'A step up from what you just read')
              : t('reader.nextReading.sameLevel', 'At the level you just read');

  return (
    <section
      data-testid="next-reading"
      aria-labelledby="next-reading-title"
      // Interface chrome: keep the UI direction even inside a right-to-left text.
      dir="ltr"
      className="w-full max-w-md rounded-2xl border border-bdr/60 bg-parch2 p-5 text-left shadow-sm"
    >
      <p className="eyebrow mb-2 flex items-center gap-1.5 text-muted">
        <Compass className="h-3.5 w-3.5" aria-hidden />
        {t('reader.nextReading.title', 'Read next')}
      </p>
      <h4 id="next-reading-title" className="font-serif text-[22px] leading-snug text-ink">
        <bdi>{text.title}</bdi>
      </h4>
      {text.author && <p className="mt-0.5 text-[13px] text-muted">{text.author}</p>}
      <p className="mt-3 text-[13px] text-ink2">{reasonLine}</p>
      {next.why && <p className="mt-1 text-[13px] text-muted">{next.why}</p>}
      {next.coverage && (
        <p data-testid="next-reading-coverage" className="mt-1 text-[13px] text-muted">
          {t(
            'reader.nextReading.coverage',
            'You know {{percent}}% of its words · {{count}} new to you',
            { percent: next.coverage.percentKnown, count: next.coverage.newLemmas }
          )}
        </p>
      )}
      <button
        type="button"
        data-testid="next-reading-open"
        onClick={() => onOpen(text.id)}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:shadow-md active:scale-95"
      >
        {t('reader.nextReading.open', 'Start reading')}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}
