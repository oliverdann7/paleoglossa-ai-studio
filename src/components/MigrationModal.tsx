import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  useDemoMigration,
  type DemoDataSummary,
  type MigrationChoice,
} from '../lib/hooks/useDemoMigration.js';
import { CheckCircle2, AlertCircle, Loader2, Database, Trash2 } from 'lucide-react';

function summaryText(t: TFunction, summary: DemoDataSummary) {
  const items: string[] = [];
  if (summary.hasVocabulary) items.push(t('demo.migration.vocabulary', 'vocabulary'));
  if (summary.hasImports) items.push(t('demo.migration.imports', 'imported texts'));
  if (summary.hasStats) items.push(t('demo.migration.stats', 'reading stats'));
  if (summary.hasSettings) items.push(t('demo.migration.settings', 'settings'));
  if (summary.hasReadingProgress) items.push(t('demo.migration.progress', 'reading progress'));
  return items.join(', ');
}

function MigrationPrompt({
  summary,
  onChoice,
}: {
  summary: DemoDataSummary;
  onChoice: (choice: MigrationChoice) => void;
}) {
  const { t } = useTranslation();
  const items = summaryText(t, summary);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start gap-4">
        <Database className="w-10 h-10 text-amber shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-serif font-semibold text-ink leading-tight mb-1">
            {t('demo.migration.title', 'We found demo progress on this device.')}
          </h3>
          <p className="text-[13px] text-ink2">
            {t(
              'demo.migration.subtitle',
              'Move it to your account so it is saved to the cloud and available on any device.'
            )}
          </p>
        </div>
      </div>

      <div className="bg-parch3 rounded-lg p-3 text-[12px] text-ink space-y-1">
        <p className="font-medium">{t('demo.migration.found', 'Found: {{items}}', { items })}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onChoice('migrate')}
          className="w-full py-2.5 px-4 rounded-lg bg-blue text-white font-medium text-[13px] hover:bg-blue/90 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {t('demo.migration.move', 'Move to my account')}
        </button>
        <button
          onClick={() => onChoice('keep-local')}
          className="w-full py-2 px-4 rounded-lg border border-bdr text-ink3 font-medium text-[12px] hover:bg-parch3 transition-colors"
        >
          {t('demo.migration.keepLocal', 'Keep local only')}
        </button>
        <button
          onClick={() => onChoice('discard')}
          className="w-full py-2 px-4 rounded-lg text-ruby font-medium text-[12px] hover:bg-ruby/5 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('demo.migration.discard', 'Discard demo data')}
        </button>
      </div>
    </div>
  );
}

function MigrationSuccess({
  results,
  onClose,
}: {
  results: Record<string, number | boolean> | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-4 text-center">
      <CheckCircle2 className="w-12 h-12 text-green mx-auto" />
      <h3 className="text-[17px] font-serif font-semibold text-ink">
        {t('demo.migration.successTitle', 'Progress saved to your account!')}
      </h3>
      <p className="text-[13px] text-ink2">
        {t(
          'demo.migration.successDesc',
          'Your demo progress has been saved to your account. You can access it from any device.'
        )}
      </p>
      {results && (
        <div className="bg-parch3 rounded-lg p-3 text-[11px] text-ink3 text-left space-y-0.5 mx-auto max-w-[200px]">
          {Object.entries(results).map(([key, val]) => (
            <p key={key} className="capitalize">
              {key.replace(/([A-Z])/g, ' $1')}: {String(val)}
            </p>
          ))}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-2 px-6 py-2 rounded-lg bg-blue text-white font-medium text-[13px] hover:bg-blue/90 transition-colors"
      >
        {t('common.continue', 'Continue')}
      </button>
    </div>
  );
}

function MigrationError({
  error,
  onRetry,
  onDismiss,
}: {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-4 text-center">
      <AlertCircle className="w-12 h-12 text-ruby mx-auto" />
      <h3 className="text-[17px] font-serif font-semibold text-ink">
        {t('demo.migration.errorTitle', 'Migration failed')}
      </h3>
      <p className="text-[13px] text-ink2">
        {t('demo.migration.errorDesc', 'Your local data has been preserved. Please try again.')}
      </p>
      <div className="bg-ruby/5 rounded-lg p-3 text-[12px] text-ruby break-words">{error}</div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-blue text-white font-medium text-[13px] hover:bg-blue/90 transition-colors"
        >
          {t('demo.migration.retry', 'Retry')}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded-lg border border-bdr text-ink3 font-medium text-[12px] hover:bg-parch3 transition-colors"
        >
          {t('common.cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );
}

export function MigrationModal() {
  const { phase, summary, error, results, runMigration, reset } = useDemoMigration();

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(reset, 10000);
      return () => clearTimeout(timer);
    }
  }, [phase, reset]);

  if (phase === 'idle' || phase === 'checking' || !summary) return null;

  const handleChoice = (choice: MigrationChoice) => {
    runMigration(choice);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-parch2 border border-bdr rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95">
        {phase === 'prompt' && <MigrationPrompt summary={summary} onChoice={handleChoice} />}
        {phase === 'migrating' && (
          <div className="p-6 space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-blue animate-spin mx-auto" />
            <p className="text-[14px] text-ink2">Moving your progress…</p>
          </div>
        )}
        {phase === 'success' && <MigrationSuccess results={results} onClose={reset} />}
        {phase === 'error' && (
          <MigrationError
            error={error || 'Unknown error'}
            onRetry={() => runMigration('migrate')}
            onDismiss={() => {
              reset();
            }}
          />
        )}
        {phase === 'discarding' && (
          <div className="p-6 space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-ruby animate-spin mx-auto" />
            <p className="text-[14px] text-ink2">Discarding demo data…</p>
          </div>
        )}
      </div>
    </div>
  );
}
