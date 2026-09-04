import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithApple,
  fetchSignInMethods,
  isGoogleSignInAvailable,
  isAppleSignInAvailable,
  describeAuthError,
} from '@/lib/services/authService';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';
import { useAuth } from '@/lib/hooks/useAuth';
import { hasDayOneLesson } from '@/data/dayOneLessons';

export const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setDemoMode } = useAuth();

  // Same zero-friction trial as the landing "Try Demo" — no account needed.
  const onTryDemo = () => {
    setDemoMode(true);
    const demoLanguageId = 'grc';
    if (hasDayOneLesson(demoLanguageId)) {
      navigate('/app/first-lesson', { state: { languageId: demoLanguageId } });
    } else {
      navigate('/app');
    }
  };
  // On native, OAuth runs through native SDK sheets (see authService). Each
  // provider button is hidden when its platform config is absent (Google
  // needs a client id baked into native builds; Apple's native sheet exists
  // only on iOS).
  const showGoogle = isGoogleSignInAvailable();
  const showApple = isAppleSignInAvailable();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const createUserProfile = async (uid: string, emailStr: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        email: emailStr,
        displayName: name,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(cred.user.uid, email, fullName);
      navigate('/onboarding');
    } catch (err: any) {
      const code = err.code as string;
      if (code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethods(email);
          if (methods.includes('google.com')) {
            // Only point at the Google button when it is actually on screen —
            // builds without this platform's client id hide it (see
            // isGoogleSignInAvailable).
            setError(
              showGoogle
                ? t(
                    'auth.emailInUseGoogle',
                    'This email is already linked to a Google account. Please sign in with Google instead.'
                  )
                : t(
                    'auth.emailInUseGoogleWeb',
                    'This email is already linked to a Google account, which this app cannot sign in with. Please sign in at paleoglossa.com.'
                  )
            );
          } else {
            setError(
              t(
                'auth.emailInUse',
                'An account with this email already exists. Try signing in instead.'
              )
            );
          }
        } catch {
          setError(
            t(
              'auth.emailInUse',
              'An account with this email already exists. Try signing in instead.'
            )
          );
        }
      } else if (code === 'auth/weak-password') {
        setError(t('auth.weakPassword', 'Password should be at least 6 characters.'));
      } else if (code === 'auth/invalid-email') {
        setError(t('auth.invalidEmail', 'Please enter a valid email address.'));
      } else if (code === 'auth/network-request-failed') {
        setError(
          t('auth.networkError', 'Network error. Please check your connection and try again.')
        );
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/onboarding');
        return;
      }
      if (result.errorCode === 'auth/popup-blocked') {
        setError(
          'Popup was blocked by your browser. Please allow popups or open this app in a new tab/window to sign in with Google.'
        );
      } else if (result.error) {
        setError(describeAuthError(t, result));
        setErrorDetail(result.detail ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const result = await signInWithApple();
      if (result.success) {
        navigate('/onboarding');
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
        setError(describeAuthError(t, result));
        setErrorDetail(result.detail ?? null);
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
              {t('auth.beginYour', 'Begin your')} <br />
              <span className="text-gold italic">Journey.</span>
            </h2>
            <p className="text-[#F8F3E8]/60 text-lg max-w-md">
              {t(
                'auth.beginDesc',
                'Join scholars and students worldwide in mastering the languages of antiquity.'
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
              {t('auth.createAccount', 'Create Account')}
            </h3>
            <p className="text-ink3 mb-8">
              {t('auth.signUpDesc', 'Sign up to start reading and translating.')}
            </p>

            {showGoogle && (
              <button
                onClick={handleGoogleSignUp}
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
                  : t('auth.signUpGoogle', 'Sign up with Google')}
              </button>
            )}

            {showApple && (
              <button
                onClick={handleAppleSignUp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-ink hover:bg-ink/80 text-white disabled:opacity-70 transition-colors font-medium mb-6"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {loading
                  ? t('auth.pleaseWait', 'Please Wait...')
                  : t('auth.signUpApple', 'Sign up with Apple')}
              </button>
            )}

            {/* Separates the provider buttons from the email form — pointless,
                and visibly odd, when neither provider button is rendered. */}
            {(showGoogle || showApple) && (
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-bdr flex-1" />
                <span className="eyebrow">{t('auth.or', 'Or')}</span>
                <div className="h-px bg-bdr flex-1" />
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-rubyxl border border-ruby/20 flex items-start gap-3 text-ruby"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{error}</p>
                  {errorDetail && (
                    <p className="mt-1 text-xs opacity-70 break-words font-mono">{errorDetail}</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-5">
              <div>
                <label className="nav-label mb-2 block">{t('auth.fullName', 'Full Name')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-bdr bg-parch2 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all text-ink"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

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
                <label className="nav-label mb-2 block">{t('auth.password', 'Password')}</label>
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
                {loading
                  ? t('auth.creatingAcc', 'Creating Account...')
                  : t('auth.createAccBtn', 'Create Account')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink3">
              {t('auth.alreadyHave', 'Already have an account?')}{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="font-bold text-blue hover:text-ink transition-colors"
              >
                {t('auth.signIn', 'Sign In')}
              </button>
            </p>
            <p className="mt-3 text-center text-sm text-ink3">
              {t('auth.justExploring', 'Just exploring?')}{' '}
              <button
                onClick={onTryDemo}
                className="font-bold text-blue hover:text-ink transition-colors"
              >
                {t('auth.tryDemo', 'Try the demo')}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
