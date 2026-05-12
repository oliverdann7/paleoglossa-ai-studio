import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SearchPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[28px] font-serif font-light text-ink tracking-tight mb-1">
              {t('search.title', 'Corpus Search')}
            </h2>
            <p className="text-xs font-bold text-blue tracking-wider uppercase">
              Experimental
            </p>
          </div>
        </div>
        <p className="font-body text-[15px] italic text-ink2 mb-8">
          {t('search.description', 'Search across the entire corpus by lemma, inflected form, or morphology.')}
        </p>
      </header>
      <div className="card p-8 text-center text-muted border-dashed border-2 border-bdr/40 bg-parch2/50">
        <div className="space-y-6">
          <Search className="w-16 h-16 text-muted/60 mx-auto" />
          <p className="text-ink3 max-w-xl">
            {t('search.comingSoon', 'Cross-corpus search with morphology filters, KWC display, and lemma-aware matching — coming soon.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/app/import')}
              className="flex-1 px-4 py-2 bg-blue text-white font-semibold rounded-lg hover:bg-blue/90 transition-colors"
            >
              {t('import.newLesson', 'Import New Lesson')}
            </button>
            <button
              onClick={() => navigate('/app/library')}
              className="flex-1 px-4 py-2 border border-bdr/60 text-[14px] font-semibold hover:bg-parch transition-colors"
            >
              {t('library.browse', 'Browse Library')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
