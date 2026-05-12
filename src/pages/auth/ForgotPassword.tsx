import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
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

          <h3 className="text-3xl font-serif font-bold mb-2 text-center text-ink">
            {t("auth.resetPassword", "Reset Password")}
          </h3>
          <p className="text-ink3 mb-8 text-center">
            {t("auth.resetDesc", "Enter your email address and we'll send you a link to reset your password.")}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rubyxl border border-ruby/20 flex items-start gap-3 text-ruby">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 rounded-xl bg-jadexl border border-jade/20 flex flex-col items-center text-center gap-3 text-jade"
            >
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <h4 className="font-bold text-lg">{t("auth.checkEmail", "Check your email")}</h4>
              <p className="text-sm font-medium opacity-80">
                {t("auth.sentLink", "We've sent a password reset link to")} {email}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="nav-label mb-2 block">{t("auth.email", "Email Address")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-bdr bg-parch2 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all text-ink"
                    placeholder="scholar@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-70"
              >
                {loading ? t("auth.sendingLink", "Sending Link...") : t("auth.sendLink", "Send Reset Link")}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/auth/login')}
              className="inline-flex items-center gap-2 text-sm font-bold text-ink3 hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("auth.backToSignIn", "Back to Sign In")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
