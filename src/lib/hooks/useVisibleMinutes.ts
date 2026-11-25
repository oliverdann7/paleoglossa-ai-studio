import { useEffect, useRef } from 'react';

const MINUTE_MS = 60_000;

/**
 * Calls `onMinute` once for every minute the hook is mounted and `active`,
 * skipping minutes that end while the tab is hidden.
 *
 * The callback is read through a ref, so passing a new function on every
 * render neither restarts the interval nor loses the partial minute.
 */
export function useVisibleMinutes(onMinute: () => void, active = true): void {
  const onMinuteRef = useRef(onMinute);
  useEffect(() => {
    onMinuteRef.current = onMinute;
  });

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      onMinuteRef.current();
    }, MINUTE_MS);
    return () => clearInterval(timer);
  }, [active]);
}
