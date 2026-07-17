import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';

/**
 * Guards the two behaviours that let a client sit on a 9-day-old build:
 * a "Later" that suppressed the toast forever, and a registration that only
 * ever checked for a new worker on page load.
 */

const setNeedRefresh = vi.fn();
let needRefresh = true;
let capturedOnRegistered: ((url: string, r: unknown) => void) | undefined;

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (opts?: { onRegisteredSW?: (url: string, r: unknown) => void }) => {
    capturedOnRegistered = opts?.onRegisteredSW;
    return {
      needRefresh: [needRefresh, setNeedRefresh],
      updateServiceWorker: vi.fn(),
    };
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback || _k }),
}));

import { UpdatePrompt } from '../UpdatePrompt.js';

describe('UpdatePrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    needRefresh = true;
    setNeedRefresh.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('re-prompts after "Later" instead of suppressing the toast forever', () => {
    render(<UpdatePrompt />);
    expect(screen.getByRole('alert')).toBeTruthy();

    act(() => {
      screen.getByText('Later').click();
    });
    expect(screen.queryByRole('alert')).toBeNull();

    // Still hidden shortly after — "Later" must genuinely mean later.
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(screen.queryByRole('alert')).toBeNull();

    // ...but it comes back, so the update isn't lost.
    act(() => {
      vi.advanceTimersByTime(4 * 60 * 60 * 1000);
    });
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it("never clears the plugin's needRefresh state", () => {
    render(<UpdatePrompt />);
    act(() => {
      screen.getByText('Later').click();
    });
    // setNeedRefresh(false) would stop the plugin re-signalling for this worker.
    expect(setNeedRefresh).not.toHaveBeenCalled();
  });

  it('periodically asks the registration for a newer worker', () => {
    render(<UpdatePrompt />);
    expect(capturedOnRegistered).toBeTypeOf('function');

    const update = vi.fn().mockResolvedValue(undefined);
    act(() => {
      capturedOnRegistered!('/sw.js', { update });
    });
    expect(update).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('skips the check when the tab is hidden or offline', () => {
    render(<UpdatePrompt />);
    const update = vi.fn().mockResolvedValue(undefined);
    act(() => {
      capturedOnRegistered!('/sw.js', { update });
    });

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).not.toHaveBeenCalled();
    visibility.mockRestore();

    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).not.toHaveBeenCalled();
    onLine.mockRestore();

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('does not tear down the registration check on unmount', () => {
    // The interval intentionally lives for the page's lifetime; unmounting the
    // toast (it returns null when snoozed) must not stop update checks.
    const { unmount } = render(<UpdatePrompt />);
    const update = vi.fn().mockResolvedValue(undefined);
    act(() => {
      capturedOnRegistered!('/sw.js', { update });
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(update).toHaveBeenCalledTimes(1);
  });
});
