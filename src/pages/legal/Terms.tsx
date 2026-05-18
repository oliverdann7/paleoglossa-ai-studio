import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-parch p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {t('terms.title', 'Terms of Service')}
        </h1>
        <p className="text-ink2 text-sm italic">
          {t('legal.disclaimer', 'Note: This is a draft for information purposes. Please review with legal counsel before publication.')}
        </p>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue" />
            {t('terms.acceptableUse', 'Acceptable Use')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('terms.useDesc', 'By using Paleoglossa, you agree to use our services for educational and research purposes only. You are responsible for any texts you upload or import, including copyright compliance.')}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {t('terms.aiLimitations', 'AI Output Limitations')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('terms.aiDesc', 'Our AI-powered tools provide assistance, not absolute accuracy. Please verify critical information.')}
          </p>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {t('terms.payments', 'Subscriptions & Payments')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('terms.paymentDesc', 'Subscriptions are managed through secure third-party payment providers (Stripe).')}
          </p>
        </section>
      </div>
    </div>
  );
};
