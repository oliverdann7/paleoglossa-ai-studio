import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { PaleoIcon } from '@/components/PaleoIcon';

type Status = 'loading' | 'success' | 'error';

const isAsyncMode = (mode: string | null) => mode === 'verifyEmail' || mode === 'recoverEmail';

export const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const initialStatus: Status =
    !oobCode || (!isAsyncMode(mode) && mode !== 'resetPassword') ? 'error' : 'loading';

  const initialMessage = !oobCode
    ? t('auth.invalidLink', 'This link is invalid or has expired. Please try again.')
    : !isAsyncMode(mode) && mode !== 'resetPassword'
      ? t('auth.unknownAction', 'This link is not recognized. Please try again from the app.')
      : '';

  const [status, setStatus] = useState<Status>(initialStatus);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!oobCode || status === 'error') return;

    if (mode === 'resetPassword') {
      navigate(`/auth/reset-password?oobCode=${encodeURIComponent(oobCode)}`, { replace: true });
      return;
    }

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
          setMessage(
            t('auth.emailVerified', 'Your email address has been verified. You can now sign in.')
          );
        })
        .catch(() => {
          setStatus('error');
          setMessage(
            t('auth.verifyFailed', 'This verification link is invalid or has already been used.')
          );
        });
      return;
    }

    if (mode === 'recoverEmail') {
      checkActionCode(auth, oobCode)
        .then(() => applyActionCode(auth, oobCode))
        .then(() => {
          setStatus('success');
          setMessage(
            t(
              'auth.emailRecovered',
              'Your sign-in email has been restored. You may want to reset your password.'
            )
          );
        })
        .catch(() => {
          setStatus('error');
          setMessage(
            t('auth.recoverFailed', 'This recovery link is invalid or has already been used.')
          );
        });
      return;
    }
  }, [mode, navigate, oobCode, status, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-parch p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 sm:p-12 text-center"
        >
          <div className="flex justify-center mb-8">
            <PaleoIcon className="w-12 h-12" />
          </div>

          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-jade mx-auto mb-4" />
              <p className="text-ink3 font-medium">
                {t('auth.processing', 'Processing your request...')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-jade mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-ink mb-3">
                {t('auth.success', 'Done!')}
              </h3>
              <p className="text-ink3 mb-8">{message}</p>
              <button onClick={() => navigate('/auth/login')} className="btn-primary w-full py-3">
                {t('auth.signIn', 'Sign In')}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-rubyxl border border-ruby/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-ruby" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-ink mb-3">
                {t('auth.linkInvalid', 'Link Invalid')}
              </h3>
              <p className="text-ink3 mb-8">{message}</p>
              <button
                onClick={() => navigate('/auth/forgot-password')}
                className="btn-primary w-full py-3"
              >
                {t('auth.requestNewLink', 'Request a New Link')}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
