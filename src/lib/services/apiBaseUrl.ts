/**
 * Resolves the full API URL for a given path.
 *
 * In web/PWA deployments (Vercel) the base is empty, so relative /api/…
 * routes work as-is because the app is served from the same origin.
 *
 * In Capacitor native builds (iOS/Android) the WebView origin is not the
 * production backend, so VITE_API_BASE_URL must be set to the production
 * API origin (e.g. https://paleoglossa.com).
 *
 * The function normalises slashes so both '/api/test' and 'api/test' work.
 */
export function getApiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  return normalizedBase + normalizedPath;
}
