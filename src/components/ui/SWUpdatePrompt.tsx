import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Service-worker update prompt. With `registerType: 'prompt'` the new worker
 * waits instead of reloading the page mid-session — the user applies the
 * update when they choose to (critical in the Reader, where an auto-reload
 * loses the reading position).
 */
export function SWUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="alertdialog"
      aria-label="App update available"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border border-bdr bg-parch2 text-ink text-sm font-medium animate-slide-up mb-[env(safe-area-inset-bottom,0px)]"
    >
      <span>A new version of PalæoGlossa is ready.</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1.5 rounded-xl bg-blue text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Update
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="px-2 py-1.5 rounded-xl text-ink2 hover:bg-parch3 transition-colors"
        aria-label="Dismiss update prompt"
      >
        Later
      </button>
    </div>
  );
}
