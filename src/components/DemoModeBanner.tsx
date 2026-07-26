import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { useToast } from '../lib/hooks/useToast.js';
import { STORAGE_KEYS } from '../lib/constants/storage.js';
import { Download } from 'lucide-react';
import { downloadFile } from '../lib/services/downloadService.js';

/** How long a guest explores before we nudge them to make it permanent (1.4). */
const PERSIST_NUDGE_DELAY_MS = 15 * 60 * 1000;

export function DemoModeBanner() {
  const { t } = useTranslation();
  const { isDemoMode } = useAuth();
  const { addToast } = useToast();
  const [exported, setExported] = useState(false);
  const { exportData } = useKnowledge();

  // After ~15 minutes of demo use, gently nudge the guest to create an account
  // so their progress survives. Fires once per device.
  useEffect(() => {
    if (!isDemoMode) return;
    if (localStorage.getItem(STORAGE_KEYS.DEMO_PERSIST_NUDGE_SHOWN) === 'true') return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.DEMO_PERSIST_NUDGE_SHOWN, 'true');
      addToast(
        t(
          'demo.persistNudge',
          'Enjoying the demo? Create a free account to keep your progress across devices.'
        ),
        'info'
      );
    }, PERSIST_NUDGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isDemoMode, addToast, t]);

  const handleExport = useCallback(async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      void downloadFile(`paleoglossa-demo-data-${new Date().toISOString().split('T')[0]}.json`, blob);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch {
      /* export failed silently */
    }
  }, [exportData]);

  if (!isDemoMode) return null;

  return (
    <div className="bg-amber text-white text-[13px] font-sans relative z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="hidden sm:inline text-white/80 text-[15px]">🔒</span>
          <p className="text-white text-[12px] sm:text-[13px] font-medium">
            {t('demo.banner', 'Demo mode: your progress is saved only on this device.')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
          <button
            onClick={handleExport}
            className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium text-[11px] transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            {exported ? t('demo.exported', 'Exported!') : t('demo.export', 'Export data')}
          </button>
          <Link
            to="/auth/login"
            className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium text-[11px] transition-colors"
          >
            {t('demo.signIn', 'Sign In')}
          </Link>
          <Link
            to="/auth/signup"
            className="px-2.5 py-1 rounded-md bg-white text-amber font-medium text-[11px] hover:bg-parch transition-colors"
          >
            {t('demo.createAccount', 'Create Account')}
          </Link>
        </div>
      </div>
    </div>
  );
}
