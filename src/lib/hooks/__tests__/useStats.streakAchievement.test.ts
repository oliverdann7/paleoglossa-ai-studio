/**
 * useStats → `streak_updated` achievement check (Mnemon) when the streak
 * is recomputed on a new day.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const { mockCheckAndUnlock, mockGetStats, mockUpdateStats, auth } = vi.hoisted(() => ({
  mockCheckAndUnlock: vi.fn(),
  mockGetStats: vi.fn(),
  mockUpdateStats: vi.fn(),
  auth: { user: { uid: 'user-1' } as { uid: string } | null },
}));

vi.mock('../useAuth.js', () => ({ useAuth: () => ({ user: auth.user }) }));
vi.mock('../../services/statsService.js', () => ({
  StatsService: {
    getStats: mockGetStats,
    updateStats: mockUpdateStats,
    migrateLocalStorage: vi.fn(),
  },
}));
vi.mock('../../services/achievementService.js', () => ({ checkAndUnlock: mockCheckAndUnlock }));

import { useStats } from '../useStats';

const DAY = 86_400_000;

function statsLastActive(daysAgo: number, streak: number, freezesUsed = 0) {
  return {
    totalKnown: 0,
    readToday: 0,
    readingTime: 0,
    lastActive: new Date(Date.now() - daysAgo * DAY).toISOString(),
    streak,
    history: [],
    freezesTotal: 2,
    freezesUsed,
  };
}

beforeEach(() => {
  auth.user = { uid: 'user-1' };
  localStorage.clear();
  mockCheckAndUnlock.mockReset().mockResolvedValue([]);
  mockGetStats.mockReset();
  mockUpdateStats.mockReset().mockResolvedValue(undefined);
});

describe('useStats → streak_updated', () => {
  it('reports the new streak when a day has passed', async () => {
    mockGetStats.mockResolvedValue(statsLastActive(1, 9));
    const { result } = renderHook(() => useStats('grc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats.streak).toBe(10);
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'streak_updated', { streak: 10 });
  });

  it('reports a streak that restarted after a long gap', async () => {
    mockGetStats.mockResolvedValue(statsLastActive(9, 14, 2));
    const { result } = renderHook(() => useStats('grc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'streak_updated', { streak: 1 });
  });

  it('does not check when the streak did not change today', async () => {
    mockGetStats.mockResolvedValue(statsLastActive(0, 12));
    const { result } = renderHook(() => useStats('grc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });

  it('never checks for a guest', async () => {
    auth.user = null;
    mockGetStats.mockResolvedValue(statsLastActive(1, 9));
    const { result } = renderHook(() => useStats('grc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats.streak).toBe(10);
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });
});
