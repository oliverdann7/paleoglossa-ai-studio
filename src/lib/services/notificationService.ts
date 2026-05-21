/**
 * Local notification service using the Web Notifications API.
 * On native Capacitor apps the WebView bridges these to system notifications.
 * On web/PWA they appear as browser notifications when the app is open.
 */

const PERM_GRANTED = 'granted';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === PERM_GRANTED) return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === PERM_GRANTED;
  },

  canNotify(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === PERM_GRANTED;
  },

  showReviewReminder(dueCount: number): void {
    if (!this.canNotify()) return;
    const body =
      dueCount === 1
        ? '1 word is ready to review. Keep your streak going!'
        : `${dueCount} words are ready to review. Keep your streak going!`;
    new Notification('Paleoglossa — Review time', { body, icon: '/icons/icon-192.png' });
  },

  showStreakWarning(streak: number): void {
    if (!this.canNotify()) return;
    new Notification("Don't lose your streak!", {
      body: `You have a ${streak}-day streak — review something today to keep it.`,
      icon: '/icons/icon-192.png',
    });
  },
};
