import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../firebase.js', () => ({ db: {}, auth: {} }));
vi.mock('../useAuth.js', () => ({ useAuth: () => ({ user: null }) }));

import { useVisibleMinutes } from '../useVisibleMinutes';
import { useStats } from '../useStats';
import { STORAGE_KEYS } from '../../constants/storage';

const MINUTE = 60_000;

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
}

describe('useVisibleMinutes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility('visible');
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    setVisibility('visible');
  });

  it('ticks once per visible minute and skips hidden ones', () => {
    const onMinute = vi.fn();
    renderHook(() => useVisibleMinutes(onMinute));

    act(() => void vi.advanceTimersByTime(MINUTE - 1));
    expect(onMinute).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(onMinute).toHaveBeenCalledTimes(1);

    setVisibility('hidden');
    act(() => void vi.advanceTimersByTime(3 * MINUTE));
    expect(onMinute).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    act(() => void vi.advanceTimersByTime(MINUTE));
    expect(onMinute).toHaveBeenCalledTimes(2);
  });

  it('does not tick while inactive, and stops on unmount', () => {
    const onMinute = vi.fn();
    const { rerender, unmount } = renderHook(({ active }) => useVisibleMinutes(onMinute, active), {
      initialProps: { active: false },
    });
    act(() => void vi.advanceTimersByTime(2 * MINUTE));
    expect(onMinute).not.toHaveBeenCalled();

    rerender({ active: true });
    act(() => void vi.advanceTimersByTime(MINUTE));
    expect(onMinute).toHaveBeenCalledTimes(1);

    unmount();
    act(() => void vi.advanceTimersByTime(5 * MINUTE));
    expect(onMinute).toHaveBeenCalledTimes(1);
  });

  it('keeps the partial minute when the callback changes between renders', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useVisibleMinutes(cb), {
      initialProps: { cb: first },
    });
    act(() => void vi.advanceTimersByTime(MINUTE / 2));
    rerender({ cb: second });
    act(() => void vi.advanceTimersByTime(MINUTE / 2));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('adds a minute of reading time to the active language stats (guest)', async () => {
    // Wired as in the Reader: the tick drives useStats.incrementReadingTime.
    const { result } = renderHook(() => {
      const stats = useStats('grc');
      useVisibleMinutes(() => stats.incrementReadingTime(1));
      return stats;
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stats.readingTime).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(MINUTE);
    });
    expect(result.current.stats.readingTime).toBe(1);

    // Debounced write lands in the guest's per-language localStorage entry.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.STATS}_grc`) ?? '{}');
    expect(saved.readingTime).toBe(1);
    expect(localStorage.getItem(`${STORAGE_KEYS.STATS}_la`)).toBeNull();

    setVisibility('hidden');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2 * MINUTE);
    });
    expect(result.current.stats.readingTime).toBe(1);
  });
});
