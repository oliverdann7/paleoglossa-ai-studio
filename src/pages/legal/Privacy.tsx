import { Shield, Lock, Database, Mail, Eye, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {t('privacy.title', 'Privacy Policy')}
        </h1>
        <p className="text-ink2 text-sm">
          {t('privacy.lastUpdated', 'Last updated: May 28, 2026')}
        </p>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue" />
            {t('privacy.dataCollection', 'Data Collection')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'privacy.collectionDesc',
              'We collect data necessary to provide our language learning services, including:'
            )}
          </p>
          <ul className="text-ink2 text-[14px] list-disc list-inside space-y-1">
            <li>{t('privacy.firebaseAuth', 'Firebase Authentication data (email, display name)')}</li>
            <li>{t('privacy.profileData', 'User profile information')}</li>
            <li>{t('privacy.learningData', 'Vocabulary progress, SRS history, reading stats')}</li>
            <li>{t('privacy.userContent', 'Imported texts, notes, notebooks')}</li>
            <li>{t('privacy.aiRequests', 'Text sent to Google Gemini for AI analysis (not stored by us beyond the response)')}</li>
            <li>{t('privacy.payments', 'Stripe payment records (we do not store card numbers)')}</li>
            <li>{t('privacy.analytics', 'Usage analytics via PostHog (can be opted out)')}</li>
            <li>{t('privacy.errorLogs', 'Error monitoring via Sentry (can be opted out)')}</li>
          </ul>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-blue" />
            {t('privacy.dataUsage', 'How We Use Data')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'privacy.usageDesc',
              'Data is used to provide service functionality, track your learning progress, personalize recommendations, and maintain application security. We do not sell your personal data to third parties.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue" />
            {t('privacy.thirdParties', 'Third-Party Services')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'privacy.thirdPartiesDesc',
              'We use the following third-party services to operate Paleoglossa:'
            )}
          </p>
          <ul className="text-ink2 text-[14px] list-disc list-inside space-y-1">
            <li>{t('privacy.tpFirebase', 'Firebase (Google) — authentication and data storage')}</li>
            <li>{t('privacy.tpGemini', 'Google Gemini — AI-powered word analysis and translation')}</li>
            <li>{t('privacy.tpStripe', 'Stripe — payment processing')}</li>
            <li>{t('privacy.tpPosthog', 'PostHog — product analytics (EU-hosted)')}</li>
            <li>{t('privacy.tpSentry', 'Sentry — error monitoring')}</li>
            <li>{t('privacy.tpResend', 'Resend — transactional email')}</li>
            <li>{t('privacy.tpVercel', 'Vercel — hosting')}</li>
          </ul>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue" />
            {t('privacy.yourRights', 'Your Rights')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'privacy.rightsDesc',
              'You have the right to access, correct, export, or delete your personal data at any time. You can opt out of analytics and error reporting from your account settings.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            {t('privacy.deletion', 'Data Deletion')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'privacy.deletionDesc',
              'You can delete your account and all associated data at any time via the Danger Zone in your account settings. Deletion is permanent and cannot be reversed.'
            )}
          </p>
          <a href="/delete-account" className="text-blue font-bold hover:underline">
            {t('privacy.learnMoreDeletion', 'Learn more about account deletion')}
          </a>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue" />
            {t('privacy.contact', 'Contact Us')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('privacy.contactDesc', 'If you have questions about your data or this policy, please email us at:')}
          </p>
          <a href="mailto:support@paleoglossa.com" className="text-blue font-bold hover:underline">
            support@paleoglossa.com
          </a>
        </section>
      </div>
    </div>
  );
};
