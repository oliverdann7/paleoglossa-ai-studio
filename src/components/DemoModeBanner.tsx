import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { Download } from 'lucide-react';

export function DemoModeBanner() {
  const { t } = useTranslation();
  const { isDemoMode } = useAuth();
  const [exported, setExported] = useState(false);
  const { exportData } = useKnowledge();

  const handleExport = useCallback(async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paleoglossa-demo-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
