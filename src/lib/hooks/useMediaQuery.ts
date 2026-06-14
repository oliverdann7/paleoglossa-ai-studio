import { useState, useEffect } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * SSR-safe: returns `false` until mounted in the browser.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Re-sync once on mount in case `query` changed between render and effect;
    // the guard keeps this a no-op (no cascading render) when already correct.
    setMatches((prev) => (prev === mql.matches ? prev : mql.matches)); // eslint-disable-line react-hooks/set-state-in-effect
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * True on viewports below Tailwind's `md` breakpoint (768px) — i.e. the phone
 * layout where the reader's word panel renders as a bottom sheet rather than a
 * side rail. Use this to gate touch-only affordances (swipe-to-dismiss, etc.).
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
