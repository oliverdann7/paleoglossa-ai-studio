import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isCapacitor } from '../lib/platform.js';

/**
 * Native-only glue between the OS and the SPA router. Renders nothing.
 *
 * - `appUrlOpen`: routes incoming deep links (the `paleoglossa://` scheme
 *   declared in both native manifests, and https://paleoglossa.com universal
 *   links once associated domains are configured) to the matching SPA route.
 *   Without this listener the URLs were dropped on the floor.
 *
 * - `backButton` (Android): the hardware back gesture navigates the SPA
 *   history instead of Capacitor's default, which backgrounds/exits the app
 *   as soon as WebView history is exhausted. At an app root the app is
 *   minimized, matching platform conventions.
 */

// Paths where back should minimize the app rather than navigate.
const ROOT_PATHS = new Set(['/', '/app', '/auth/login']);

export function NativeAppBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isCapacitor()) return;

    const handles: Array<{ remove: () => Promise<void> }> = [];
    let cancelled = false;

    import('@capacitor/app')
      .then(async ({ App }) => {
        const urlHandle = await App.addListener('appUrlOpen', ({ url }) => {
          try {
            const u = new URL(url);
            let path: string;
            if (u.protocol === 'paleoglossa:') {
              // paleoglossa://app/reader/x → host "app" + pathname "/reader/x"
              path = '/' + u.host + u.pathname + u.search;
            } else if (u.protocol === 'https:' || u.protocol === 'http:') {
              path = u.pathname + u.search;
            } else {
              return;
            }
            if (path && path !== '/') navigate(path);
          } catch {
            // Malformed URL — ignore.
          }
        });
        const backHandle = await App.addListener('backButton', ({ canGoBack }) => {
          if (!ROOT_PATHS.has(pathRef.current) && canGoBack) {
            navigate(-1);
          } else {
            void App.minimizeApp();
          }
        });
        if (cancelled) {
          void urlHandle.remove();
          void backHandle.remove();
        } else {
          handles.push(urlHandle, backHandle);
        }
      })
      .catch(() => {
        // @capacitor/app unavailable — nothing to bridge.
      });

    return () => {
      cancelled = true;
      handles.forEach((h) => h.remove().catch(() => {}));
    };
  }, [navigate]);

  return null;
}
