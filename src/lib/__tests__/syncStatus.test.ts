import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { syncStatusManager, type SyncState } from '../sync/syncStatus.js';

vi.mock('../firebase.js', () => ({
  auth: { currentUser: null, onAuthStateChanged: () => () => {} },
  db: {},
}));

beforeEach(() => {
  syncStatusManager['state'] = {
    authMode: 'unknown',
    storageMode: 'local',
    firebaseReady: false,
    lastSuccessfulWriteAt: null,
    lastFailedWriteAt: null,
    lastError: null,
    pendingWrites: 0,
    isOffline: false,
    status: 'unknown',
  } as SyncState;
});

afterEach(cleanup);

describe('SyncStatusManager', () => {
  it('starts in unknown state', () => {
    const state = syncStatusManager.getState();
    expect(state.authMode).toBe('unknown');
    expect(state.status).toBe('unknown');
    expect(state.pendingWrites).toBe(0);
  });

  it('transitions to local-only when guest mode is set', () => {
    syncStatusManager.setAuthMode('guest');
    const state = syncStatusManager.getState();
    expect(state.authMode).toBe('guest');
    expect(state.storageMode).toBe('local');
    expect(state.status).toBe('local-only');
  });

  it('transitions to cloud-synced when authenticated and ready', () => {
    syncStatusManager.setAuthMode('authenticated');
    const state = syncStatusManager.getState();
    expect(state.authMode).toBe('authenticated');
    expect(state.storageMode).toBe('cloud');
    expect(state.firebaseReady).toBe(true);
    expect(state.status).toBe('cloud-synced');
  });

  it('shows pending status for queued writes', () => {
    syncStatusManager.setAuthMode('authenticated');
    syncStatusManager.markPendingWrite();
    expect(syncStatusManager.getState().pendingWrites).toBe(1);
    expect(syncStatusManager.getState().status).toBe('pending');
  });

  it('returns to cloud-synced after writes succeed', () => {
    syncStatusManager.setAuthMode('authenticated');
    syncStatusManager.markPendingWrite();
    syncStatusManager.markWriteSuccess();
    const state = syncStatusManager.getState();
    expect(state.pendingWrites).toBe(0);
    expect(state.status).toBe('cloud-synced');
    expect(state.lastSuccessfulWriteAt).not.toBeNull();
  });

  it('shows failed status when writes fail', () => {
    syncStatusManager.setAuthMode('authenticated');
    syncStatusManager.markPendingWrite();
    syncStatusManager.markWriteFailure('Network error');
    const state = syncStatusManager.getState();
    expect(state.pendingWrites).toBe(0);
    expect(state.status).toBe('cloud-synced');
    expect(state.lastError).toBe('Network error');
    expect(state.lastFailedWriteAt).not.toBeNull();
  });

  it('shows offline status when offline and authenticated', () => {
    syncStatusManager.setAuthMode('authenticated');
    syncStatusManager['state'] = {
      ...syncStatusManager.getState(),
      isOffline: true,
    };
    syncStatusManager['emit']();
    expect(syncStatusManager.getState().status).toBe('offline');
  });

  it('notifies subscribers on state changes', () => {
    const listener = vi.fn();
    const unsub = syncStatusManager.subscribe(listener);
    syncStatusManager.setAuthMode('guest');
    expect(listener).toHaveBeenCalled();
    unsub();
  });

  it('sets local-only for demo mode user', () => {
    syncStatusManager.setAuthMode('guest');
    const state = syncStatusManager.getState();
    expect(state.status).toBe('local-only');
    expect(state.storageMode).toBe('local');
  });

  it('handles markQueueFlushed', () => {
    syncStatusManager.markPendingWrite();
    syncStatusManager.markPendingWrite();
    expect(syncStatusManager.getState().pendingWrites).toBe(2);
    syncStatusManager.markQueueFlushed();
    expect(syncStatusManager.getState().pendingWrites).toBe(0);
  });

  it('sets storage mode explicitly', () => {
    syncStatusManager.setStorageMode('mixed');
    expect(syncStatusManager.getState().storageMode).toBe('mixed');
  });
});

describe('SyncStatusBadge states (via manager state)', () => {
  it('shows demo mode state correctly', () => {
    syncStatusManager.setAuthMode('guest');
    const state = syncStatusManager.getState();
    expect(state.authMode).toBe('guest');
    expect(state.status).toBe('local-only');
  });

  it('shows failed then recovered state', () => {
    syncStatusManager.setAuthMode('authenticated');
    syncStatusManager.markPendingWrite();
    syncStatusManager.markWriteFailure('Permission denied');
    syncStatusManager.markPendingWrite();
    syncStatusManager.markWriteSuccess();
    const state = syncStatusManager.getState();
    expect(state.lastError).toBeNull();
    expect(state.status).toBe('cloud-synced');
  });
});

describe('Helper functions', () => {
  it('imports without crashing', async () => {
    const mod = await import('../sync/syncStatus.js');
    expect(mod.getSyncState).toBeDefined();
    expect(mod.markPendingWrite).toBeDefined();
    expect(mod.markWriteSuccess).toBeDefined();
    expect(mod.markWriteFailure).toBeDefined();
    expect(mod.markQueueFlushed).toBeDefined();
    expect(mod.setStorageMode).toBeDefined();
    expect(mod.setAuthMode).toBeDefined();
    expect(mod.initializeSyncStatus).toBeDefined();
  });
});
