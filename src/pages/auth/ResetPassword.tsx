import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';

type PageState = 'verifying' | 'ready' | 'invalid' | 'success';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>('verifying');
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('oobCode');
    if (!code) {
      setPageState('invalid');
      return;
    }
    // Verify the code is still valid before showing the form
    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setPageState('ready');
      })
      .catch(() => {
        setPageState('invalid');
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setPageState('success');
    } catch (err: any) {
      const code = err.code as string;
      if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
        setPageState('invalid');
      } else if (code === 'auth/weak-password') {
        setError(t("auth.weakPassword", "Password should be at least 6 characters."));
      } else if (code === 'auth/network-request-failed') {
        setError(t("auth.networkError", "Network error. Please check your connection and try again."));
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
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

          {pageState === 'verifying' && (
            <div className="text-center text-ink3 py-8">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm">{t("auth.verifyingLink", "Verifying your reset link...")}</p>
            </div>
          )}

          {pageState === 'invalid' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-rubyxl flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-ruby" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2 text-ink">
                  {t("auth.linkExpiredTitle", "Link expired")}
                </h3>
                <p className="text-ink3 text-sm">
                  {t("auth.resetLinkExpired", "This reset link has expired or already been used. Please request a new one.")}
                </p>
              </div>
              <button
                onClick={() => navigate('/auth/forgot-password')}
                className="btn-primary w-full py-3"
              >
                {t("auth.requestNewLink", "Request a new link")}
              </button>
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-sm font-bold text-ink3 hover:text-ink transition-colors"
                >
                  {t("auth.backToSignIn", "Back to Sign In")}
                </button>
              </div>
            </motion.div>
          )}

          {pageState === 'ready' && (
            <>
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 rounded-lg border border-bdr bg-parch2 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all text-ink"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-ink3 mt-1.5">
                    {t("auth.passwordMinLength", "Minimum 6 characters")}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 6}
                  className="btn-primary w-full py-3 disabled:opacity-70"
                >
                  {loading ? t("auth.updating", "Updating...") : t("auth.updatePassword", "Update Password")}
                </button>
              </form>
            </>
          )}

          {pageState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-jadexl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-jade" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2 text-ink">
                {t("auth.passwordUpdated", "Password updated")}
              </h3>
              <p className="text-ink3 text-sm mb-8">
                {t("auth.passwordUpdatedDesc", "Your password has been changed successfully. You can now sign in with your new password.")}
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="btn-primary w-full py-3"
              >
                {t("auth.signIn", "Sign In")}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
