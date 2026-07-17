import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

/** How often a long-lived tab asks whether a newer service worker exists. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
/** How long "Later" hides the toast before it offers again. */
const SNOOZE_MS = 4 * 60 * 60 * 1000;

/**
 * Service-worker update toast (roadmap § 11, item 0.9). The SW is registered
 * with `registerType: 'prompt'`, so a new build never reloads the app on its
 * own — this banner lets the user choose when to update.
 *
 * The registration only checks for a new worker on page load, so a tab left
 * open for days would never notice a deploy. `onRegisteredSW` below adds a
 * periodic check to bound how stale a long-lived session can get.
 */
const registerOptions = {
  onRegisteredSW(_swUrl: string, r: ServiceWorkerRegistration | undefined) {
    if (!r) return;

    // Offline or backgrounded tabs can't usefully fetch a new worker, and this
    // is an offline-capable PWA — skip rather than log failures.
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      if (!navigator.onLine) return;
      void r.update();
    };

    setInterval(check, UPDATE_CHECK_INTERVAL_MS);
    // A tab parked overnight should re-check the moment it's looked at again,
    // rather than waiting out the rest of the interval.
    document.addEventListener('visibilitychange', check);
  },
};

export function UpdatePrompt() {
  const { t } = useTranslation();
  const [snoozedUntil, setSnoozedUntil] = useState(0);
  const snoozeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW(registerOptions);

  useEffect(
    () => () => {
      if (snoozeTimer.current) clearTimeout(snoozeTimer.current);
    },
    []
  );

  if (!needRefresh || Date.now() < snoozedUntil) return null;

  // Deliberately not setNeedRefresh(false): that clears the plugin's "a worker
  // is waiting" state, which it won't set again for the same worker — so the
  // toast would never come back and the user would sit on a stale build. A
  // local snooze keeps needRefresh intact so re-prompting is just a re-render.
  const snooze = () => {
    setSnoozedUntil(Date.now() + SNOOZE_MS);
    snoozeTimer.current = setTimeout(() => setSnoozedUntil(0), SNOOZE_MS);
  };

  return (
    <div className="fixed bottom-4 inset-x-0 z-[200] flex justify-center px-4 pb-safe pointer-events-none">
      <div
        role="alert"
        className="pointer-events-auto flex items-center gap-3 bg-parch2 border border-bdr text-ink rounded-lg shadow-lg px-4 py-3 text-sm font-medium"
      >
        <span>{t('updatePrompt.message', 'A new version of PalæoGlossa is available.')}</span>
        <button
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 px-3 py-1.5 bg-ink text-parch rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
        >
          {t('updatePrompt.update', 'Update')}
        </button>
        <button
          onClick={snooze}
          className="shrink-0 px-3 py-1.5 text-xs font-bold text-muted hover:text-ink transition-colors"
        >
          {t('updatePrompt.later', 'Later')}
        </button>
      </div>
    </div>
  );
}
