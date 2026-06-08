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
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#FDFBF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1E3D6E;box-sizing:border-box;">
      <div style="max-width:420px;text-align:center;">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;">Paleoglossa couldn't start</h1>
        <p style="font-size:14px;line-height:1.5;color:#4b5563;margin:0 0 16px;">
          The app failed to load its configuration. This is usually a build or
          connection issue. Please make sure you're online and try reopening the app.
        </p>
        <pre style="font-size:11px;text-align:left;white-space:pre-wrap;word-break:break-word;background:#f3f0e9;border-radius:8px;padding:12px;color:#6b7280;margin:0;">${escapeHtml(message)}</pre>
      </div>
    </div>`;
}

import('./bootstrap.js').catch(showBootError);
