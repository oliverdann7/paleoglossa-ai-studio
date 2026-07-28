import { isCapacitor } from '../platform.js';

/**
 * Keeps the native status bar readable across the app themes. Without this
 * the OS default (dark icons) is unreadable on the dark theme. No-op on web.
 */
export function syncStatusBarWithTheme(theme: string): void {
  if (!isCapacitor()) return;
  void import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) =>
      // Style.Dark = light icons for dark backgrounds; Style.Light = dark icons.
      StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light })
    )
    .catch(() => {
      // Plugin unavailable — cosmetic only.
    });
}
