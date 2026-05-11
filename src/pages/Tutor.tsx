import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';

export const Tutor = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('tutor.title', 'AI Philology Tutor')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('tutor.description', 'Ask questions about morphology, syntax, and grammar — grounded in the text you are reading.')}
        </p>
      </header>
      <div className="card p-12 text-center text-muted border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center gap-4">
        <MessageCircle className="w-12 h-12 text-muted" />
        <p className="text-ink3 max-w-md">{t('tutor.comingSoon', 'Conversational AI tutor with context-aware answers, morphology quizzes, and composition feedback — coming soon.')}</p>
      </div>
    </div>
  );
};
