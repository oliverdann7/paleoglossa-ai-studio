import { FileText, CreditCard, AlertTriangle, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {t('terms.title', 'Terms of Service')}
        </h1>
        <p className="text-ink2 text-sm">
          {t('terms.lastUpdated', 'Last updated: May 28, 2026')}
        </p>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue" />
            {t('terms.acceptableUse', 'Acceptable Use')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.useDesc',
              'By using Paleoglossa, you agree to use our services for educational and research purposes only. You are responsible for any texts you upload or import, including copyright compliance.'
            )}
          </p>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.accountResp',
              'You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to create an account.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t('terms.aiLimitations', 'AI Output Limitations')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.aiDesc',
              'Our AI-powered tools (glosses, translations, paradigm tables) provide assistance, not absolute accuracy. AI-generated content may contain errors in parsing, morphology, or translation. Always verify critical information with authoritative reference works.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue" />
            {t('terms.payments', 'Subscriptions & Payments')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.paymentDesc',
              'Paid subscriptions are billed through Stripe. By subscribing, you authorize recurring charges at the frequency you selected (monthly or yearly). You can cancel at any time through the Stripe customer portal — your access continues until the end of your current billing period.'
            )}
          </p>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.refundRef',
              'For details on cancellations and refunds, see our'
            )}{' '}
            <a href="/refund" className="text-blue font-bold hover:underline">
              {t('terms.refundPolicy', 'Refund Policy')}
            </a>.
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue" />
            {t('terms.termination', 'Termination')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.terminationDesc',
              'We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your account settings. Upon deletion, your personal data is permanently removed in accordance with our Privacy Policy.'
            )}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold">{t('terms.changes', 'Changes to These Terms')}</h2>
          <p className="text-ink2 text-[15px]">
            {t(
              'terms.changesDesc',
              'We may update these terms from time to time. We will notify you of material changes via email or a notice within the app. Continued use of Paleoglossa after changes constitutes acceptance.'
            )}
          </p>
        </section>

        <p className="text-ink2 text-sm">
          {t('terms.contact', 'Questions? Contact us at')}{' '}
          <a href="mailto:support@paleoglossa.com" className="text-blue font-bold hover:underline">
            support@paleoglossa.com
          </a>
        </p>
      </div>
    </div>
  );
};
