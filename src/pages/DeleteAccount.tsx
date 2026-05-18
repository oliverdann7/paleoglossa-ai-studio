import { useNavigate } from 'react-router-dom';
import { Trash2, LogIn, Shield, Database, Clock, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/hooks/useAuth.js';

export const DeleteAccount = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-parch">
      {/* Header */}
      <div className="bg-white border-b border-bdr">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-4xl font-serif font-light text-ink">
              {t('deleteAccount.title', 'Account Deletion')}
            </h1>
          </div>
          <p className="text-[16px] text-ink2 max-w-2xl">
            {t(
              'deleteAccount.subtitle',
              'This page explains how Paleoglossa handles account deletion and what happens to your data.'
            )}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12 pb-24">
        {/* How to delete */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-ink mb-6 flex items-center gap-3">
            <LogIn className="w-6 h-6 text-blue" />
            {t('deleteAccount.howToDelete', 'How to Delete Your Account')}
          </h2>

          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0 text-sm font-bold text-blue">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-ink mb-2">
                    {t('deleteAccount.step1', 'Sign in to your account')}
                  </h3>
                  <p className="text-[14px] text-muted">
                    {t(
                      'deleteAccount.step1Desc',
                      'Go to Paleoglossa and sign in with your email or social account.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0 text-sm font-bold text-blue">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-ink mb-2">
                    {t('deleteAccount.step2', 'Navigate to Settings')}
                  </h3>
                  <p className="text-[14px] text-muted">
                    {t(
                      'deleteAccount.step2Desc',
                      'Tap the More menu (mobile) or Settings (desktop) in the left sidebar.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0 text-sm font-bold text-blue">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-ink mb-2">
                    {t('deleteAccount.step3', 'Find the Danger Zone section')}
                  </h3>
                  <p className="text-[14px] text-muted">
                    {t(
                      'deleteAccount.step3Desc',
                      'Scroll down to the red Danger Zone section at the bottom of Settings.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0 text-sm font-bold text-blue">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-ink mb-2">
                    {t('deleteAccount.step4', 'Click Delete Account')}
                  </h3>
                  <p className="text-[14px] text-muted">
                    {t(
                      'deleteAccount.step4Desc',
                      'Click the red Delete Account button and follow the confirmation steps.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0 text-sm font-bold text-blue">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-ink mb-2">
                    {t('deleteAccount.step5', 'Confirm your identity')}
                  </h3>
                  <p className="text-[14px] text-muted">
                    {t(
                      'deleteAccount.step5Desc',
                      "You'll be asked to re-enter your password (for email accounts) or re-authenticate (for social accounts)."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-blue/5 border border-blue/20 rounded-xl p-6">
                <p className="text-[14px] text-blue font-medium">
                  {t(
                    'deleteAccount.signedIn',
                    "You're signed in. You can delete your account now."
                  )}
                </p>
                <button
                  onClick={() => navigate('/app/settings')}
                  className="mt-4 px-6 py-2 bg-blue text-white rounded-lg font-bold text-[13px] hover:bg-blue/90 transition-all"
                >
                  {t('deleteAccount.goToSettings', 'Go to Settings')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* What gets deleted */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-ink mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-red-600" />
            {t('deleteAccount.dataDeleted', 'What Gets Deleted')}
          </h2>

          <div className="card p-8 space-y-6">
            <div>
              <h3 className="font-bold text-[15px] text-ink mb-3 flex items-center gap-2">
                <span className="text-red-600">✓</span>{' '}
                {t('deleteAccount.profileData', 'Profile Data')}
              </h3>
              <ul className="text-[14px] text-muted space-y-1 ml-7">
                <li>• Display name and nickname</li>
                <li>• Biography and public profile</li>
                <li>• Profile picture / avatar</li>
                <li>• Community membership</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[15px] text-ink mb-3 flex items-center gap-2">
                <span className="text-red-600">✓</span>{' '}
                {t('deleteAccount.learningData', 'Learning Data')}
              </h3>
              <ul className="text-[14px] text-muted space-y-1 ml-7">
                <li>• Vocabulary and word progress (known, learning, new states)</li>
                <li>• SRS review queue and spaced repetition history</li>
                <li>• Reading progress and highlights</li>
                <li>• Streaks and achievement history</li>
                <li>• Daily goals and statistics</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[15px] text-ink mb-3 flex items-center gap-2">
                <span className="text-red-600">✓</span>{' '}
                {t('deleteAccount.personalContent', 'Personal Content')}
              </h3>
              <ul className="text-[14px] text-muted space-y-1 ml-7">
                <li>• All imported texts</li>
                <li>• Notes and annotations</li>
                <li>• Notebooks and research collections</li>
                <li>• Custom highlights and bookmarks</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[15px] text-ink mb-3 flex items-center gap-2">
                <span className="text-red-600">✓</span>{' '}
                {t('deleteAccount.firebaseAuth', 'Authentication')}
              </h3>
              <ul className="text-[14px] text-muted space-y-1 ml-7">
                <li>• Email and password credentials</li>
                <li>• Social account links (Google, etc.)</li>
                <li>• Authentication tokens and sessions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What is NOT deleted */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-ink mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            {t('deleteAccount.dataRetained', 'What We Retain')}
          </h2>

          <div className="card p-8 space-y-4 border-l-4 border-green-200">
            <p className="text-[14px] text-muted">
              {t(
                'deleteAccount.retainedNote',
                'Some data may be retained for legal, security, or technical reasons:'
              )}
            </p>

            <ul className="text-[14px] text-muted space-y-2 ml-4">
              <li>
                • <strong>Access logs</strong> — For up to 90 days for security audits
              </li>
              <li>
                • <strong>Backup copies</strong> — Deleted from active systems but may exist in
                backups for up to 180 days
              </li>
              <li>
                • <strong>Payment records</strong> — Deleted unless required by law (e.g., for
                billing/taxes)
              </li>
              <li>
                • <strong>Report history</strong> — If you reported a user or content, records may
                be retained for moderation
              </li>
            </ul>

            <p className="text-[13px] text-muted italic pt-2">
              {t(
                'deleteAccount.retainedBasis',
                'Retention happens only as required by applicable laws or for the security and integrity of our platform.'
              )}
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-ink mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue" />
            {t('deleteAccount.timeline', 'Deletion Timeline')}
          </h2>

          <div className="space-y-4">
            <div className="card p-6 border-l-4 border-blue">
              <h3 className="font-bold text-[15px] text-ink mb-1">
                {t('deleteAccount.immediate', 'Immediate (0-30 minutes)')}
              </h3>
              <p className="text-[14px] text-muted">
                {t(
                  'deleteAccount.immediateDesc',
                  "Your account is disabled, your profile is hidden from the community, and you're signed out of all sessions."
                )}
              </p>
            </div>

            <div className="card p-6 border-l-4 border-amber-400">
              <h3 className="font-bold text-[15px] text-ink mb-1">
                {t('deleteAccount.oneDay', '1-2 Days')}
              </h3>
              <p className="text-[14px] text-muted">
                {t(
                  'deleteAccount.oneDayDesc',
                  'All your personal data is deleted from our primary database, including vocabulary progress, notes, and imported texts.'
                )}
              </p>
            </div>

            <div className="card p-6 border-l-4 border-green-400">
              <h3 className="font-bold text-[15px] text-ink mb-1">
                {t('deleteAccount.ninetyDays', 'Up to 90 Days')}
              </h3>
              <p className="text-[14px] text-muted">
                {t(
                  'deleteAccount.ninetyDaysDesc',
                  'Backups containing your data are deleted, and access logs are purged. Only metadata from shared content may remain.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-ink mb-6 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue" />
            {t('deleteAccount.support', 'Questions?')}
          </h2>

          <div className="card p-8 space-y-4">
            <p className="text-[14px] text-muted">
              {t(
                'deleteAccount.supportText',
                'If you have questions about account deletion or data privacy, please contact us:'
              )}
            </p>

            <div className="space-y-2 text-[14px]">
              <p>
                <strong className="text-ink">Email:</strong>{' '}
                <a href="mailto:support@paleoglossa.com" className="text-blue hover:underline">
                  support@paleoglossa.com
                </a>
              </p>
              <p>
                <strong className="text-ink">
                  {t('deleteAccount.privacy', 'Privacy Policy')}:
                </strong>{' '}
                <a href="/privacy" className="text-blue hover:underline">
                  {t('deleteAccount.viewPrivacy', 'View full privacy policy')}
                </a>
              </p>
              <p>
                <strong className="text-ink">{t('deleteAccount.tos', 'Terms of Service')}:</strong>{' '}
                <a href="/terms" className="text-blue hover:underline">
                  {t('deleteAccount.viewTerms', 'View terms')}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
