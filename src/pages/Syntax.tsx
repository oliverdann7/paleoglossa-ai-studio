import { useTranslation } from 'react-i18next';
import { GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Syntax = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[28px] font-serif font-light text-ink tracking-tight mb-1">
              {t('syntax.title', 'Syntax & Treebank Viewer')}
            </h2>
            <p className="text-xs font-bold text-blue tracking-wider uppercase">
              Experimental
            </p>
          </div>
        </div>
        <p className="font-body text-[15px] italic text-ink2 mb-8">
          {t('syntax.description', 'Visual dependency trees for every sentence in the corpus.')}
        </p>
      </header>
      <div className="card p-8 text-center text-muted border-dashed border-2 border-bdr/40 bg-parch2/50">
        <div className="space-y-6">
          <GitBranch className="w-16 h-16 text-muted/60 mx-auto" />
          <p className="text-ink3 max-w-xl">
            {t('syntax.experimental', 'Dependency tree visualization — this feature creates syntax diagrams from the texts you are currently reading.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/app/library')}
              className="flex-1 px-4 py-2 border border-bdr/60 text-[14px] font-semibold hover:bg-parch transition-colors"
            >
              {t('library.browse', 'Browse Library')}
            </button>
            <button
              onClick={() => navigate('/app/reader')}
              className="flex-1 px-4 py-2 bg-blue text-white font-semibold rounded-lg hover:bg-blue/90 transition-colors"
              disabled={!localStorage.getItem('lastReaderTextId')}
            >
              {t('reader.continueReading', 'Continue Reading')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
