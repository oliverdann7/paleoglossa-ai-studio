/**
 * Boot guard.
 *
 * The real application is loaded dynamically from `./bootstrap.tsx`. Some of
 * its module-level imports (notably `./lib/firebase.ts`) throw synchronously
 * when build-time config is missing — which, in a native Capacitor build with
 * a misconfigured `.env.native-production`, happens before React ever mounts.
 * A throw at that stage leaves the WebView on a permanent blank/"Loading…"
 * screen with nothing the user can see.
 *
 * By importing the app dynamically we can catch that failure and render a
 * readable message into #root instead, turning a silent hang into something
 * actionable on-device.
 */
// Make Vite's chunk/CSS preloading non-fatal. Inside the iOS Capacitor
// WKWebView the preload <link> error event can fire spuriously (or for real),
// which otherwise rejects the dynamic import with "Unable to preload CSS for …"
// and dead-ends the whole app. Preventing the default lets the import fall
// through to actually fetching the chunk, so a flaky preload never blocks boot
// or lazy-route navigation. (Primary CSS is also un-split — see vite.config.)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
});

function escapeHtml(s: string): string {
  return s.replace(
    /[<>&]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string
  );
}

function showBootError(err: unknown): void {
  const root = document.getElementById('root');
  if (!root) return;
  const message = err instanceof Error ? err.message : String(err);
  // The raw error is for developers: log it always, but only render it in dev
  // builds. In production (where search-engine crawlers with flaky chunk
  // loading also land here) users get a plain message and a retry button.
  console.error('[boot] Failed to start Paleoglossa:', err);
  const detail = import.meta.env.DEV
    ? `<pre style="font-size:11px;text-align:left;white-space:pre-wrap;word-break:break-word;background:#f3f0e9;border-radius:8px;padding:12px;color:#6b7280;margin:0 0 16px;">${escapeHtml(message)}</pre>`
    : '';
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#FDFBF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1E3D6E;box-sizing:border-box;">
      <div style="max-width:420px;text-align:center;">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;">Paleoglossa couldn't start</h1>
        <p style="font-size:14px;line-height:1.5;color:#4b5563;margin:0 0 16px;">
          Something interrupted loading — usually a brief connection issue.
          Please make sure you're online and try again.
        </p>
        ${detail}
        <button onclick="window.location.reload()" style="font-size:14px;font-weight:600;color:#FDFBF7;background:#1E3D6E;border:none;border-radius:8px;padding:10px 24px;cursor:pointer;">Reload</button>
      </div>
    </div>`;
}

/**
 * On native (Capacitor) a service worker is pure liability: it precaches the
 * web bundle and then serves that stale copy from the WebView cache, so a new
 * TestFlight build's JavaScript never actually runs — the app stays frozen on an
 * old bundle no matter how many builds ship. Native assets are already local in
 * the app binary, so there is nothing for a SW to accelerate. Tear down any SW
 * (and its caches) left behind by an earlier build before booting. New native
 * builds never register one (see App.tsx), so this only needs to run once per
 * device to recover from a previously-installed SW.
 */
async function purgeServiceWorkerOnNative(): Promise<void> {
  const win = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  if (!win.Capacitor?.isNativePlatform?.()) return;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* best-effort — never block boot on cache teardown */
  }
}

void purgeServiceWorkerOnNative().finally(() => {
  import('./bootstrap.js').catch(showBootError);
});
