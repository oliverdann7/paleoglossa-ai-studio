import { Mail, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Support = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">{t('support.title', 'Support')}</h1>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue" />
            {t('support.contactUs', 'Contact Us')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'support.contactDesc',
              'For bug reports, feature requests, or questions, please email us:'
            )}
          </p>
          <a href="mailto:support@paleoglossa.com" className="text-blue font-bold hover:underline">
            support@paleoglossa.com
          </a>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue" />
            {t('support.accountDeletion', 'Account Deletion')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('support.deletionDesc', 'You can delete your account via Settings -> Danger Zone.')}
          </p>
          <a href="/delete-account" className="text-blue font-bold hover:underline">
            {t('support.viewDeletionSteps', 'View deletion steps')}
          </a>
        </section>
      </div>
    </div>
  );
};
