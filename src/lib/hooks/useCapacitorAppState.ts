import { useEffect } from 'react';
import { isCapacitor } from '../platform.js';

/**
 * Registers a Capacitor `appStateChange` listener when running inside a native
 * WebView.  `onBackground` is called whenever the app transitions to the
 * background (isActive → false).
 *
 * Falls back gracefully to a no-op on web — the module-level `visibilitychange`
 * handler in vocabularyService already covers the web case.
 *
 * The @capacitor/app plugin is imported dynamically so that the web bundle
 * does not reference it at all if Capacitor is not present.
 */
export function useCapacitorAppState(onBackground: () => void): void {
  useEffect(() => {
    if (!isCapacitor()) return;

    let handle: { remove: () => Promise<void> } | null = null;

    import('@capacitor/app')
      .then(({ App }) =>
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) onBackground();
        })
      )
      .then((h) => {
        handle = h;
      })
      .catch(() => {
        // @capacitor/app not available — visibilitychange covers background.
      });

    return () => {
      handle?.remove().catch(() => {});
    };
  }, [onBackground]);
}
