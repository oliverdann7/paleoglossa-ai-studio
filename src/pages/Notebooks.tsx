import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

export const Notebooks = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('notebooks.title', 'Research Notebooks')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('notebooks.description', 'Organize your research with text-anchored notes, taggable notebooks, and export.')}
        </p>
      </header>
      <div className="card p-12 text-center text-muted border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center gap-4">
        <BookOpen className="w-12 h-12 text-muted" />
        <p className="text-ink3 max-w-md">{t('notebooks.comingSoon', 'Persistent notebooks with verse-anchored notes, tagging, and Markdown/PDF export — coming soon.')}</p>
      </div>
    </div>
  );
};
