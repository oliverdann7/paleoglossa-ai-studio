import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useSyncStatus } from '../lib/contexts/SyncStatusContext.js';
import { Link } from 'react-router-dom';
import type { SyncStatusValue } from '../lib/sync/syncStatus.js';

function statusExplanation(t: TFunction, status: SyncStatusValue, isDemoMode: boolean) {
  switch (status) {
    case 'cloud-synced':
      return t('syncStatus.cloudSynced', 'Your progress is saved to your account in the cloud.');
    case 'local-only':
      return isDemoMode
        ? t('syncStatus.demoMode', 'Demo mode — saved only on this device.')
        : t('syncStatus.localOnly', 'Saved only on this device. Sign in to enable cloud sync.');
    case 'pending':
      return t('syncStatus.pending', 'Saving your progress…');
    case 'failed':
      return t('syncStatus.failed', 'Sync failed. Your data may not be saved to the cloud.');
    case 'offline':
      return t('syncStatus.offline', 'You are offline. Changes will sync when you reconnect.');
    default:
      return t('syncStatus.unknown', 'Sync status unknown.');
  }
}

function statusAction(
  t: TFunction,
  status: SyncStatusValue,
  isDemoMode: boolean,
  hasError: boolean,
  onRetry?: () => void
) {
  if (isDemoMode || status === 'local-only') {
    if (isDemoMode) {
      return (
        <Link
          to="/auth/signup"
          className="inline-block mt-2 px-3 py-1.5 text-xs font-medium rounded bg-blue text-white hover:bg-blue/90 transition-colors"
        >
          {t('syncStatus.createAccount', 'Create account to save progress')}
        </Link>
      );
    }
    return (
      <Link
        to="/auth/login"
        className="inline-block mt-2 px-3 py-1.5 text-xs font-medium rounded bg-blue text-white hover:bg-blue/90 transition-colors"
      >
        {t('syncStatus.signIn', 'Sign in to enable cloud sync')}
      </Link>
    );
  }
  if (status === 'failed' && hasError && onRetry) {
    return (
      <button
        onClick={onRetry}
        className="inline-block mt-2 px-3 py-1.5 text-xs font-medium rounded bg-blue text-white hover:bg-blue/90 transition-colors"
      >
        {t('syncStatus.retry', 'Retry sync')}
      </button>
    );
  }
  return null;
}

interface SyncStatusPanelProps {
  onRetry?: () => void;
}

export function SyncStatusPanel({ onRetry }: SyncStatusPanelProps) {
  const { t } = useTranslation();
  const { isDemoMode } = useAuth();
  const { syncState } = useSyncStatus();

  const explanation = statusExplanation(t, syncState.status, isDemoMode);
  const action = statusAction(t, syncState.status, isDemoMode, !!syncState.lastError, onRetry);
  const showError = syncState.lastError && syncState.status === 'failed';

  return (
    <div className="min-w-[200px] max-w-[260px] p-3 text-[12px] font-sans space-y-2">
      <p className="text-ink font-medium leading-tight">{explanation}</p>

      {syncState.lastSuccessfulWriteAt && (
        <p className="text-muted text-[11px]">
          {t('syncStatus.lastSaved', 'Last saved: {{time}}', {
            time: new Date(syncState.lastSuccessfulWriteAt).toLocaleTimeString(),
          })}
        </p>
      )}

      {syncState.pendingWrites > 0 && (
        <p className="text-blue text-[11px]">
          {t('syncStatus.pendingWrites', '{{count}} pending write', {
            count: syncState.pendingWrites,
          })}
        </p>
      )}

      {showError && (
        <p className="text-red text-[11px] break-words">
          {t('syncStatus.lastError', 'Error: {{error}}', {
            error: syncState.lastError,
          })}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
