import { useState, useRef, useEffect } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useSyncStatus } from '../lib/contexts/SyncStatusContext.js';
import { SyncStatusPanel } from './SyncStatusPanel.js';
import type { LucideIcon } from 'lucide-react';
import { Cloud, CloudOff, Loader2, AlertCircle, WifiOff } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'cloud-synced': Cloud,
  'local-only': CloudOff,
  pending: Loader2,
  failed: AlertCircle,
  offline: WifiOff,
};

function statusLabel(t: TFunction, status: string, isDemoMode: boolean) {
  switch (status) {
    case 'cloud-synced':
      return t('syncStatus.cloudSyncedLabel', 'Cloud sync active');
    case 'local-only':
      return isDemoMode
        ? t('syncStatus.demoModeLabel', 'Demo mode')
        : t('syncStatus.localOnlyLabel', 'Local only');
    case 'pending':
      return t('syncStatus.pendingLabel', 'Saving…');
    case 'failed':
      return t('syncStatus.failedLabel', 'Sync failed');
    case 'offline':
      return t('syncStatus.offlineLabel', 'Offline');
    default:
      return t('syncStatus.unknownLabel', 'Sync…');
  }
}

function statusColors(status: string): string {
  switch (status) {
    case 'cloud-synced':
      return 'bg-green/10 text-green border-green/20';
    case 'local-only':
      return 'bg-parch3 text-ink3 border-bdr';
    case 'pending':
      return 'bg-blue/10 text-blue border-blue/20';
    case 'failed':
      return 'bg-red/10 text-red border-red/20';
    case 'offline':
      return 'bg-amber/10 text-amber border-amber/20';
    default:
      return 'bg-parch3 text-ink3 border-bdr';
  }
}

export function SyncStatusBadge() {
  const { t } = useTranslation();
  const { isDemoMode } = useAuth();
  const { syncState } = useSyncStatus();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const Icon = ICON_MAP[syncState.status] ?? CloudOff;
  const label = statusLabel(t, syncState.status, isDemoMode);
  const colors = statusColors(syncState.status);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-full border transition-colors cursor-pointer ${colors}`}
        aria-label={label}
        title={label}
      >
        <Icon className={`w-3 h-3 ${syncState.status === 'pending' ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-full right-0 mb-2 z-50 bg-parch2 border border-bdr rounded-lg shadow-xl"
        >
          <SyncStatusPanel />
        </div>
      )}
    </div>
  );
}
