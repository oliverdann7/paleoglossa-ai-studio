import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const { mockCheckAndUnlock, mockGetAllProgress } = vi.hoisted(() => ({
  mockCheckAndUnlock: vi.fn(),
  mockGetAllProgress: vi.fn(),
}));

vi.mock('../../services/statsService.js', () => ({
  StatsService: { getAllProgress: mockGetAllProgress },
}));
vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('../../services/achievementService.js', async (importOriginal) => ({
  // Keep the real counting helper; replace only the Firestore-backed call.
  ...(await importOriginal<typeof import('../../services/achievementService.js')>()),
  checkAndUnlock: mockCheckAndUnlock,
}));

import { useReadSessionAchievements } from '../useReadSessionAchievements';

const MINUTE = 60_000;

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
}

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility('visible');
  mockCheckAndUnlock.mockReset().mockResolvedValue([]);
  mockGetAllProgress.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useReadSessionAchievements', () => {
  it('checks once when a signed-in session reaches 60 minutes', async () => {
    renderHook(() => useReadSessionAchievements('user-1', 'john-1', false));

    await vi.advanceTimersByTimeAsync(59 * MINUTE);
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(MINUTE);
    expect(mockGetAllProgress).toHaveBeenCalledWith('user-1');
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'read_session', {
      minutes: 60,
      textsRead: 0,
    });

    await vi.advanceTimersByTimeAsync(30 * MINUTE);
    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
  });

  it('does not count minutes while the tab is hidden', async () => {
    renderHook(() => useReadSessionAchievements('user-1', 'john-1', false));

    await vi.advanceTimersByTimeAsync(30 * MINUTE);
    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(45 * MINUTE);
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(30 * MINUTE);
    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
  });

  it('keeps the session running when another text is opened', async () => {
    const { rerender } = renderHook(
      ({ textId }) => useReadSessionAchievements('user-1', textId, false),
      { initialProps: { textId: 'john-1' } }
    );
    await vi.advanceTimersByTimeAsync(40 * MINUTE);
    rerender({ textId: 'john-2' });
    await vi.advanceTimersByTimeAsync(20 * MINUTE);
    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
  });

  it('checks with the count of finished texts when a text is read to its end', async () => {
    mockGetAllProgress.mockResolvedValue([
      { textId: 'a', completed: true },
      { textId: 'b', completed: true },
      { textId: 'c', lastPosition: 99 },
      { textId: 'd', completed: true },
      { textId: 'e', lastPosition: 20 },
    ]);
    const { rerender } = renderHook(
      ({ finished }) => useReadSessionAchievements('user-1', 'e', finished),
      { initialProps: { finished: false } }
    );
    await vi.advanceTimersByTimeAsync(3 * MINUTE);
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();

    rerender({ finished: true });
    await vi.advanceTimersByTimeAsync(0);
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'read_session', {
      minutes: 3,
      textsRead: 5,
    });

    // Scrolling away from the end and back does not fire again for this text.
    rerender({ finished: false });
    rerender({ finished: true });
    await vi.advanceTimersByTimeAsync(0);
    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
  });

  it('never checks for a guest', async () => {
    renderHook(() => useReadSessionAchievements(null, 'john-1', true));
    await vi.advanceTimersByTimeAsync(90 * MINUTE);
    expect(mockGetAllProgress).not.toHaveBeenCalled();
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });
});
