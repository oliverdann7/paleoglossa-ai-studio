import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

/**
 * Service-worker update toast (roadmap § 11, item 0.9). The SW is registered
 * with `registerType: 'prompt'`, so a new build never reloads the app on its
 * own — this banner lets the user choose when to update.
 */
export function UpdatePrompt() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

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
          onClick={() => setNeedRefresh(false)}
          className="shrink-0 px-3 py-1.5 text-xs font-bold text-muted hover:text-ink transition-colors"
        >
          {t('updatePrompt.later', 'Later')}
        </button>
      </div>
    </div>
  );
}
