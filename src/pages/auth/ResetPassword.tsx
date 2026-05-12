import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, AlertCircle } from 'lucide-react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onSuccess = () => navigate('/app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
        onSuccess();
      } else {
        throw new Error('Invalid or missing action code (oobCode).');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parch p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 sm:p-12"
        >
          <div className="flex justify-center mb-8">
            <PaleoIcon className="w-12 h-12" />
          </div>

          <h3 className="text-3xl font-serif font-bold mb-2 text-center text-ink">
            {t("auth.newPassword", "New Password")}
          </h3>
          <p className="text-ink3 mb-8 text-center">
            {t("auth.newPasswordDesc", "Enter your new password below to regain access to your account.")}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rubyxl border border-ruby/20 flex items-start gap-3 text-ruby">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="nav-label mb-2 block">{t("auth.newPassword", "New Password")}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-bdr bg-parch2 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all text-ink"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-70"
            >
              {loading ? t("auth.updating", "Updating...") : t("auth.updatePassword", "Update Password")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
