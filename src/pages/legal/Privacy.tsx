import { Shield, Lock, Database, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {t('privacy.title', 'Privacy Policy')}
        </h1>
        <p className="text-ink2 text-sm italic">
          {t('legal.disclaimer', 'Note: This is a draft for information purposes. Please review with legal counsel before publication.')}
        </p>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue" />
            {t('privacy.dataCollection', 'Data Collection')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('privacy.collectionDesc', 'We collect data necessary to provide our language learning services, including:')}
          </p>
          <ul className="text-ink2 text-[14px] list-disc list-inside space-y-1">
            <li>{t('privacy.firebaseAuth', 'Firebase Authentication data')}</li>
            <li>{t('privacy.profileData', 'User profile information')}</li>
            <li>{t('privacy.learningData', 'Vocabulary progress, SRS history, stats')}</li>
            <li>{t('privacy.userContent', 'Imported texts, notes, notebooks')}</li>
            <li>{t('privacy.aiRequests', 'AI requests processed by Gemini')}</li>
            <li>{t('privacy.payments', 'Stripe payment records')}</li>
            <li>{t('privacy.analytics', 'Usage analytics (PostHog)')}</li>
            <li>{t('privacy.errorLogs', 'Error monitoring (Sentry)')}</li>
          </ul>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-blue" />
            {t('privacy.dataUsage', 'How We Use Data')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('privacy.usageDesc', 'Data is used to provide service functionality, analyze learning patterns, and maintain application security. We do not sell your personal data.')}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            {t('privacy.deletion', 'Data Deletion')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('privacy.deletionDesc', 'You can delete your account and all associated data at any time via the Danger Zone in your account settings.')}
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
            {t('privacy.contactDesc', 'If you have questions, please email us at:')}
          </p>
          <a href="mailto:support@paleoglossa.com" className="text-blue font-bold hover:underline">
            support@paleoglossa.com
          </a>
        </section>
      </div>
    </div>
  );
};
