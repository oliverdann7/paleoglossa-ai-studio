import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { syncStatusManager, initializeSyncStatus, type SyncState } from '../sync/syncStatus.js';

interface SyncStatusContextValue {
  syncState: SyncState;
}

const SyncStatusContext = createContext<SyncStatusContextValue | null>(null);

export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>(() => syncStatusManager.getState());

  useEffect(() => {
    initializeSyncStatus();
    const unsub = syncStatusManager.subscribe(setSyncState);
    return unsub;
  }, []);

  useEffect(() => {
    if (user) {
      syncStatusManager.setAuthMode('authenticated');
    } else if (isDemoMode) {
      syncStatusManager.setAuthMode('guest');
    } else {
      syncStatusManager.setAuthMode('unknown');
    }
  }, [user, isDemoMode]);

  return <SyncStatusContext.Provider value={{ syncState }}>{children}</SyncStatusContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSyncStatus(): SyncStatusContextValue {
  const ctx = useContext(SyncStatusContext);
  if (!ctx) throw new Error('useSyncStatus must be used within SyncStatusProvider');
  return ctx;
}
