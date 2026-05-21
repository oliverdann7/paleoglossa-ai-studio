import { useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService.js';

const LAST_NOTIFY_KEY = 'paleoglossa_last_notify_date';

interface Options {
  dueCount: number;
  streak: number;
  isAuthenticated: boolean;
}

/**
 * Requests notification permission on first authenticated session and shows
 * a once-per-day review reminder if there are due cards or a streak at risk.
 */
export function useStreakNotifications({ dueCount, streak, isAuthenticated }: Options): void {
  const notifiedTodayRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (notifiedTodayRef.current) return;

    const today = new Date().toDateString();
    const lastNotify = localStorage.getItem(LAST_NOTIFY_KEY);
    if (lastNotify === today) return;

    // Try to request permission once per session (browser shows native prompt max once)
    void notificationService.requestPermission().then((granted) => {
      if (!granted) return;
      notifiedTodayRef.current = true;
      localStorage.setItem(LAST_NOTIFY_KEY, today);

      if (dueCount > 0) {
        notificationService.showReviewReminder(dueCount);
      } else if (streak > 0) {
        notificationService.showStreakWarning(streak);
      }
    });
  }, [isAuthenticated, dueCount, streak]);
}
