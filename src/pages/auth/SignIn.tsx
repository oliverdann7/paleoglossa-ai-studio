import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, AlertCircle, UserCircle } from 'lucide-react';
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  fetchSignInMethods,
  isGoogleSignInAvailable,
} from '@/lib/services/authService';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';
import { isCapacitor } from '@/lib/platform';

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  // On native, OAuth runs through native SDK sheets (see authService) instead
  // of the web popup/redirect flows that providers block inside a WebView.
  // Apple works everywhere; Google additionally needs an iOS client id baked
  // into the build — the button is hidden when it's absent.
  const isNative = isCapacitor();
  const showGoogle = isGoogleSignInAvailable();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/app';

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      const code = result.errorCode;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        try {
          const methods = await fetchSignInMethods(email);
          if (methods.includes('google.com')) {
            setError(
              t(
                'auth.googleAccountExists',
                'This email is linked to a Google account. Please sign in with Google above.'
              )
            );
          } else {
            setError(
              t('auth.invalidCredentials', 'Incorrect email or password. Please try again.')
            );
          }
        } catch {
          setError(t('auth.invalidCredentials', 'Incorrect email or password. Please try again.'));
        }
      } else if (code === 'auth/too-many-requests') {
        setError(
          t(
            'auth.tooManyRequests',
            'Too many failed attempts. Please wait a moment and try again, or reset your password.'
          )
        );
      } else if (code === 'auth/user-disabled') {
        setError(t('auth.userDisabled', 'This account has been disabled. Please contact support.'));
      } else if (code === 'auth/network-request-failed') {
        setError(
          t('auth.networkError', 'Network error. Please check your connection and try again.')
        );
      } else {
        setError(result.error ?? 'Sign in failed');
      }
    } catch {
      setError(t('auth.invalidCredentials', 'Incorrect email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithApple();
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      if (result.errorCode === 'auth/popup-blocked') {
        setError(
          t(
            'auth.popupBlocked',
            'Popup was blocked by your browser. Please allow popups or open this app in a new tab/window to sign in with Apple.'
          )
        );
      } else if (result.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (promptAccountSelect = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle(promptAccountSelect);
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      if (result.errorCode === 'auth/popup-blocked') {
        setError(
          t(
            'auth.popupBlocked',
            'Popup was blocked by your browser. Please allow popups or open this app in a new tab/window to sign in with Google.'
          )
        );
      } else if (result.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-parch">
      {/* Left panel — dark branding side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-ink">
        <img
          src="https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=1600"
          alt="Ancient Manuscript"
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="relative z-10 p-16 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <PaleoIcon className="w-10 h-10 flex-shrink-0" />
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-[#F8F3E8]">
              Paleoglossa
            </h1>
          </div>
          <div>
            <h2 className="text-5xl font-serif font-bold text-[#F8F3E8] leading-tight mb-6">
              {t('auth.returnTo', 'Return to')} <br />
              <span className="text-gold italic">Paleoglossa.</span>
            </h2>
            <p className="text-[#F8F3E8]/60 text-lg max-w-md">
              {t(
                'auth.returnDesc',
                'Continue your journey through the ancient world. Your library and progress await.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <PaleoIcon className="w-8 h-8 flex-shrink-0" />
              <h1 className="text-xl font-serif font-semibold tracking-tight text-ink">
                Paleoglossa
              </h1>
            </div>

            <h3 className="text-3xl font-serif font-bold mb-2 text-ink">
              {t('auth.signIn', 'Sign In')}
            </h3>
            <p className="text-ink3 mb-8">
              {t('auth.enterDetails', 'Enter your details to access your account.')}
            </p>

            {/* Both providers run native SDK sheets on Capacitor (see
                authService). Google is hidden only when the build shipped
                without VITE_GOOGLE_IOS_CLIENT_ID. */}
            {showGoogle && (
              <button
                onClick={() => handleGoogleSignIn(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-bdr hover:bg-parch3 disabled:opacity-70 transition-colors font-medium mb-6"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {loading
                  ? t('auth.pleaseWait', 'Please Wait...')
                  : t('auth.continueGoogle', 'Continue with Google')}
              </button>
            )}

            <button
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-ink hover:bg-ink/80 text-white disabled:opacity-70 transition-colors font-medium mb-6"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {loading
                ? t('auth.pleaseWait', 'Please Wait...')
                : t('auth.continueApple', 'Continue with Apple')}
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-bdr flex-1" />
              <span className="eyebrow">{t('auth.or', 'Or')}</span>
              <div className="h-px bg-bdr flex-1" />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rubyxl border border-ruby/20 flex items-start gap-3 text-ruby">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-5">
              <div>
                <label className="nav-label mb-2 block">{t('auth.email', 'Email Address')}</label>
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="nav-label">{t('auth.password', 'Password')}</label>
                  <button
                    type="button"
                    onClick={() => navigate('/auth/reset-password')}
                    className="text-xs font-bold text-gold hover:text-ink transition-colors"
                  >
                    {t('auth.forgot', 'Forgot?')}
                  </button>
                </div>
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
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {loading ? t('auth.signingIn', 'Signing In...') : t('auth.signIn', 'Sign In')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink3">
              {t('auth.noAccount', "Don't have an account?")}{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="font-bold text-blue hover:text-ink transition-colors"
              >
                {t('auth.signUp', 'Sign Up')}
              </button>
            </p>

            {!isNative && (
              <button
                type="button"
                onClick={() => handleGoogleSignIn(true)}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-ink3 hover:text-ink transition-colors disabled:opacity-50"
              >
                <UserCircle className="w-4 h-4" />
                {t('auth.useAnotherAccount', 'Use another account')}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
