/**
 * Detects whether the app is running inside a Capacitor native WebView
 * (iOS or Android) as opposed to a regular browser tab / PWA.
 *
 * Capacitor injects the `Capacitor` global into every WebView it manages.
 */
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return !!(win.Capacitor && win.Capacitor.isNativePlatform());
}

/**
 * Returns the platform name when running in Capacitor ("ios" / "android"),
 * or `null` for regular web deployments.
 */
export function capacitorPlatform(): string | null {
  try {
    const win = window as any;
    if (win.Capacitor && win.Capacitor.getPlatform) {
      return win.Capacitor.getPlatform();
    }
    return null;
  } catch {
    return null;
  }
}
