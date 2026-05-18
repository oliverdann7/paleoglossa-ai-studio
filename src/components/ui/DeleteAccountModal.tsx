import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  reauthenticateUser,
  deleteUserAccount,
  ReauthOptions,
} from '@/lib/services/accountDeletionService.js';
import { useAuth } from '@/lib/hooks/useAuth.js';
import { cn } from '@/lib/utils';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'confirm' | 'reauthenticate' | 'deleting' | 'error';

export const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConfirmValid = confirmText.toUpperCase() === 'DELETE';
  const hasPasswordAuth = user?.providerData?.some(
    (provider) => provider.providerId === 'password'
  );
  const isPasswordValid = !hasPasswordAuth || password.length >= 6;

  const handleProceedToReauth = () => {
    setError(null);
    setStep('reauthenticate');
  };

  const handleReauthenticate = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const options: ReauthOptions = {};
      if (hasPasswordAuth) {
        if (!password) {
          throw new Error('Password is required');
        }
        options.password = password;
      }

      await reauthenticateUser(options);
      setStep('deleting');
      await deleteUserAccount('DELETE');

      // On success, redirect to home (the deleteUserAccount function will sign out)
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed');
      setIsLoading(false);

      // Reset to reauth step for retry
      if (err.message?.includes('Password')) {
        setPassword('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {step === 'confirm' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-ink">
                {t('account.deleteTitle', 'Delete Account')}
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-[14px] text-ink2">
                {t(
                  'account.deleteWarning',
                  'This action cannot be undone. We will permanently delete:'
                )}
              </p>
              <ul className="text-[13px] text-muted space-y-2 ml-4">
                <li>• {t('account.deleteProfile', 'Your profile and avatar')}</li>
                <li>• {t('account.deleteVocabulary', 'All vocabulary progress')}</li>
                <li>• {t('account.deleteReadingProgress', 'All reading progress')}</li>
                <li>• {t('account.deleteNotes', 'All notes and notebooks')}</li>
                <li>• {t('account.deleteImportedTexts', 'All imported texts')}</li>
                <li>• {t('account.deleteCommunityProfile', 'Your public profile (if visible)')}</li>
                <li>• {t('account.deleteAuthAccount', 'Your Paleoglossa account')}</li>
              </ul>

              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[13px] text-red-700 font-medium">
                  {t('account.deleteIrreversible', 'This is permanent and cannot be reversed.')}
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-2">
                  {t('account.typeDelete', 'Type DELETE to confirm')}
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className="w-full p-3 border border-bdr rounded-lg bg-parch2/50 text-center font-mono text-[14px] focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-bdr rounded-lg font-bold text-[14px] hover:bg-parch transition-colors"
              >
                {t('account.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleProceedToReauth}
                disabled={!isConfirmValid}
                className={cn(
                  'flex-1 px-4 py-3 rounded-lg font-bold text-[14px] text-white transition-all',
                  isConfirmValid
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 opacity-50 cursor-not-allowed'
                )}
              >
                {t('account.continueDelete', 'Continue')}
              </button>
            </div>
          </>
        )}

        {step === 'reauthenticate' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-ink">
                {t('account.verify', 'Verify your identity')}
              </h2>
            </div>

            <p className="text-[14px] text-ink2 mb-6">
              {hasPasswordAuth
                ? t(
                    'account.verifyPassword',
                    'For your security, please enter your password to continue.'
                  )
                : t(
                    'account.verifySocial',
                    "You'll be asked to sign in with your social account provider."
                  )}
            </p>

            {hasPasswordAuth && (
              <div className="mb-6">
                <label className="block text-[12px] font-bold uppercase tracking-widest text-muted mb-2">
                  {t('account.password', 'Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border border-bdr rounded-lg bg-parch2/50 text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('confirm');
                  setError(null);
                  setPassword('');
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-bdr rounded-lg font-bold text-[14px] hover:bg-parch transition-colors disabled:opacity-50"
              >
                {t('account.back', 'Back')}
              </button>
              <button
                onClick={handleReauthenticate}
                disabled={!isPasswordValid || isLoading}
                className={cn(
                  'flex-1 px-4 py-3 rounded-lg font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all',
                  isPasswordValid && !isLoading
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {t('account.delete', 'Delete Account')}
              </button>
            </div>
          </>
        )}

        {step === 'deleting' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue mb-4" />
            <p className="text-[14px] text-ink2 text-center">
              {t('account.deleting', 'Deleting your account…')}
            </p>
            <p className="text-[12px] text-muted text-center mt-2">
              {t('account.deletingMessage', 'This may take a few moments. Please wait.')}
            </p>
          </div>
        )}

        {step === 'error' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-ink">
                {t('account.error', 'Error')}
              </h2>
            </div>

            <p className="text-[14px] text-ink2 mb-6">{error}</p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('confirm');
                  setError(null);
                  setPassword('');
                }}
                className="flex-1 px-4 py-3 border border-bdr rounded-lg font-bold text-[14px] hover:bg-parch transition-colors"
              >
                {t('account.back', 'Back')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
