import { auth } from '../firebase.js';

export type AuthMode = 'guest' | 'authenticated' | 'unknown';

export type StorageMode = 'local' | 'cloud' | 'mixed';

export type SyncStatusValue =
  | 'cloud-synced'
  | 'local-only'
  | 'pending'
  | 'failed'
  | 'offline'
  | 'unknown';

export interface SyncState {
  authMode: AuthMode;
  storageMode: StorageMode;
  firebaseReady: boolean;
  lastSuccessfulWriteAt: string | null;
  lastFailedWriteAt: string | null;
  lastError: string | null;
  pendingWrites: number;
  isOffline: boolean;
  status: SyncStatusValue;
}

type Listener = (state: SyncState) => void;

function computeStatus(state: SyncState): SyncStatusValue {
  if (state.isOffline && state.authMode === 'authenticated') return 'offline';
  if (state.authMode === 'guest') return 'local-only';
  if (state.lastError && state.pendingWrites > 0) return 'failed';
  if (state.pendingWrites > 0) return 'pending';
  if (state.authMode === 'authenticated' && state.firebaseReady) return 'cloud-synced';
  return 'unknown';
}

const DEFAULT_STATE: SyncState = {
  authMode: 'unknown',
  storageMode: 'local',
  firebaseReady: false,
  lastSuccessfulWriteAt: null,
  lastFailedWriteAt: null,
  lastError: null,
  pendingWrites: 0,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  status: 'unknown',
};

class SyncStatusManager {
  private state: SyncState = { ...DEFAULT_STATE };
  private listeners = new Set<Listener>();
  private initResolved = false;

  getState(): SyncState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const newStatus = computeStatus(this.state);
    if (newStatus !== this.state.status) {
      this.state = { ...this.state, status: newStatus };
    }
    this.listeners.forEach((fn) => fn(this.state));
  }

  initialize() {
    if (this.initResolved) return;
    this.initResolved = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.state = { ...this.state, isOffline: false };
        this.emit();
      });
      window.addEventListener('offline', () => {
        this.state = { ...this.state, isOffline: true };
        this.emit();
      });
    }

    if (auth?.currentUser) {
      this.setAuthMode('authenticated');
      this.setStorageMode('cloud');
      this.state = { ...this.state, firebaseReady: true };
    } else if (localStorage.getItem('paleoglossa_demo_mode') === 'true') {
      this.setAuthMode('guest');
      this.setStorageMode('local');
      this.state = { ...this.state, firebaseReady: false };
    } else {
      this.setAuthMode('unknown');
    }
    this.emit();
  }

  setAuthMode(mode: AuthMode) {
    const newStorageMode: StorageMode = mode === 'authenticated' ? 'cloud' : 'local';
    const firebaseReady = mode === 'authenticated';
    this.state = {
      ...this.state,
      authMode: mode,
      storageMode: newStorageMode,
      firebaseReady,
    };
    this.emit();
  }

  setStorageMode(mode: StorageMode) {
    this.state = { ...this.state, storageMode: mode };
    this.emit();
  }

  markPendingWrite() {
    this.state = { ...this.state, pendingWrites: this.state.pendingWrites + 1 };
    this.emit();
  }

  markWriteSuccess() {
    this.state = {
      ...this.state,
      pendingWrites: Math.max(0, this.state.pendingWrites - 1),
      lastSuccessfulWriteAt: new Date().toISOString(),
      lastError: null,
      lastFailedWriteAt: null,
    };
    this.emit();
  }

  markWriteFailure(error: string) {
    this.state = {
      ...this.state,
      pendingWrites: Math.max(0, this.state.pendingWrites - 1),
      lastFailedWriteAt: new Date().toISOString(),
      lastError: error,
    };
    this.emit();
  }

  markQueueFlushed() {
    this.state = { ...this.state, pendingWrites: 0 };
    this.emit();
  }
}

export const syncStatusManager = new SyncStatusManager();

export function getSyncState(): SyncState {
  return syncStatusManager.getState();
}

export function markPendingWrite() {
  syncStatusManager.markPendingWrite();
}

export function markWriteSuccess() {
  syncStatusManager.markWriteSuccess();
}

export function markWriteFailure(error: string) {
  syncStatusManager.markWriteFailure(error);
}

export function markQueueFlushed() {
  syncStatusManager.markQueueFlushed();
}

export function setStorageMode(mode: StorageMode) {
  syncStatusManager.setStorageMode(mode);
}

export function setAuthMode(mode: AuthMode) {
  syncStatusManager.setAuthMode(mode);
}

export function initializeSyncStatus() {
  syncStatusManager.initialize();
}
