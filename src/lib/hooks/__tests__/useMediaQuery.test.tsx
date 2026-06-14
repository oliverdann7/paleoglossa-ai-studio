import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../useMediaQuery';

// jsdom has no matchMedia; install a controllable mock so we can assert the
// hook both reads the initial value and reacts to subsequent changes.
type Listener = (e: { matches: boolean }) => void;

function installMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  let matches = initial;
  const mql = {
    get matches() {
      return matches;
    },
    media: '',
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      mql.media = query;
      return mql;
    }),
  });
  return {
    emit(next: boolean) {
      matches = next;
      listeners.forEach((cb) => cb({ matches: next }));
    },
  };
}

describe('useMediaQuery', () => {
  const original = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: original,
    });
  });

  it('returns the initial match state', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const ctrl = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
    act(() => ctrl.emit(true));
    expect(result.current).toBe(true);
  });

  it('returns false safely when matchMedia is unavailable', () => {
    // @ts-expect-error — intentionally remove matchMedia to exercise the guard.
    delete window.matchMedia;
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });
});
