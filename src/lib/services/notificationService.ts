/**
 * Local notification service.
 *
 * Web/PWA: the Web Notifications API (browser notifications while the app is
 * open).
 *
 * Native (Capacitor): `Notification` does not exist inside WKWebView / Android
 * WebView, so system notifications go through @capacitor/local-notifications
 * instead. Permission state is cached module-locally after the async plugin
 * calls so `canNotify()` can stay synchronous for callers.
 */

import { isCapacitor } from '../platform.js';

const PERM_GRANTED = 'granted';

let nativeGranted = false;
let nextNativeId = 1;

async function getLocalNotifications() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

function scheduleNative(title: string, body: string): void {
  void getLocalNotifications()
    .then((LocalNotifications) =>
      LocalNotifications.schedule({
        notifications: [
          {
            id: nextNativeId++,
            title,
            body,
            // Slight delay so the notification survives the app being
            // foregrounded (immediate ones can be suppressed while active).
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      })
    )
    .catch(() => {
      // Notification delivery is best-effort.
    });
}

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (isCapacitor()) {
      try {
        const LocalNotifications = await getLocalNotifications();
        const status = await LocalNotifications.requestPermissions();
        nativeGranted = status.display === PERM_GRANTED;
        return nativeGranted;
      } catch {
        return false;
      }
    }
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === PERM_GRANTED) return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === PERM_GRANTED;
  },

  canNotify(): boolean {
    if (isCapacitor()) return nativeGranted;
    return typeof Notification !== 'undefined' && Notification.permission === PERM_GRANTED;
  },

  showReviewReminder(dueCount: number): void {
    if (!this.canNotify()) return;
    const body =
      dueCount === 1
        ? '1 word is ready to review. Keep your streak going!'
        : `${dueCount} words are ready to review. Keep your streak going!`;
    if (isCapacitor()) {
      scheduleNative('Paleoglossa — Review time', body);
      return;
    }
    new Notification('Paleoglossa — Review time', { body, icon: '/icons/icon-192.png' });
  },

  showStreakWarning(streak: number): void {
    if (!this.canNotify()) return;
    const body = `You have a ${streak}-day streak — review something today to keep it.`;
    if (isCapacitor()) {
      scheduleNative("Don't lose your streak!", body);
      return;
    }
    new Notification("Don't lose your streak!", {
      body,
      icon: '/icons/icon-192.png',
    });
  },
};
