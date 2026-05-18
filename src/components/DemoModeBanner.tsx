import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { X } from 'lucide-react';

export function DemoModeBanner() {
  const { t } = useTranslation();
  const { isDemoMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-blue text-white text-[13px] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="flex-1 text-center md:text-left">
          {t(
            'demo.banner',
            "You're exploring as a guest. Your progress is saved only on this device."
          )}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/auth/login"
            className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium text-[12px] transition-colors"
          >
            {t('demo.signIn', 'Sign In')}
          </Link>
          <Link
            to="/auth/signup"
            className="px-3 py-1 rounded-md bg-white text-blue font-medium text-[12px] hover:bg-parch transition-colors"
          >
            {t('demo.createAccount', 'Create Account')}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label={t('demo.dismiss', 'Dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
