import { CreditCard, RefreshCw, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Refund = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {t('refund.title', 'Refund & Cancellation Policy')}
        </h1>
        <p className="text-ink2 text-sm">
          {t('refund.lastUpdated', 'Last updated: May 28, 2026')}
        </p>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue" />
            {t('refund.cancellation', 'Cancellation')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'refund.cancellationDesc',
              'You can cancel your subscription at any time through the Stripe customer portal, accessible from your subscription settings. When you cancel:'
            )}
          </p>
          <ul className="text-ink2 text-[14px] list-disc list-inside space-y-1">
            <li>{t('refund.accessContinues', 'Your access continues until the end of your current billing period')}</li>
            <li>{t('refund.noFutureCharges', 'No further charges will be made after cancellation')}</li>
            <li>{t('refund.dataRetained', 'Your learning data (vocabulary, progress, notes) is retained and available if you resubscribe')}</li>
            <li>{t('refund.freeAccess', 'After your paid period ends, you revert to the free tier with access to beginner texts')}</li>
          </ul>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue" />
            {t('refund.refunds', 'Refunds')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'refund.refundsDesc',
              'Because you have immediate access to the full library upon subscribing, we generally do not offer partial refunds for unused time. However, we will consider refund requests on a case-by-case basis — please contact us within 7 days of your charge.'
            )}
          </p>
          <p className="text-ink2 text-[15px]">
            {t(
              'refund.duplicateCharges',
              'If you were charged in error or see a duplicate charge, contact us and we will resolve it promptly.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue" />
            {t('refund.contact', 'Contact for Refund Requests')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('refund.contactDesc', 'To request a refund or ask about your subscription, email us at:')}
          </p>
          <a href="mailto:support@paleoglossa.com" className="text-blue font-bold hover:underline">
            support@paleoglossa.com
          </a>
        </section>
      </div>
    </div>
  );
};
