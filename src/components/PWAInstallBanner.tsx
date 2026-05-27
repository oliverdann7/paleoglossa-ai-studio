import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../lib/hooks/usePWAInstall.js';

const DISMISSED_KEY = 'paleoglossa_pwa_dismissed';

export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY));

  if (!canInstall || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    await install();
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 p-4 sm:hidden">
      <div className="mx-auto max-w-sm rounded-xl bg-parch2 border border-border shadow-lg p-4 flex items-center gap-3">
        <Download className="w-5 h-5 text-blue shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-ink text-sm font-medium">Install Paleoglossa</p>
          <p className="text-ink2 text-xs">Read offline from your home screen</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue text-white font-medium hover:bg-blue/90 transition-colors shrink-0"
        >
          Install
        </button>
        <button onClick={dismiss} className="text-ink3 hover:text-ink transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
