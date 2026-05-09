import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';
import { CorpusDB } from '../data/corpus';
import { cn } from '@/lib/utils';

export const Language = () => {
  const { langId } = useParams();
  const navigate = useNavigate();

  const langMap: Record<string, any> = {
    'grc': { name: 'Ancient Greek', description: 'The language of Homer, Plato, and the New Testament.', type: 'ltr' },
    'grc-koine': { name: 'Koine Greek', description: 'The common Greek spoken and written during the Hellenistic period, the Roman Empire, and the early Byzantine Empire.', type: 'ltr' },
    'hbo': { name: 'Biblical Hebrew', description: 'The archaic form of the Hebrew language, in which the Hebrew Bible is written.', type: 'rtl' },
    'lat': { name: 'Classical Latin', description: 'The standard register of the Latin language of the Roman classical period.', type: 'ltr' },
    'syr': { name: 'Syriac', description: 'A dialect of Middle Aramaic that was once spoken across much of the Fertile Crescent and Eastern Arabia.', type: 'rtl' },
    'cop': { name: 'Coptic', description: 'The latest stage of the Egyptian language, a northern Afroasiatic language spoken in Egypt until at least the 17th century.', type: 'ltr' },
    'arc': { name: 'Aramaic', description: 'An ancient language belonging to the Northwest Semitic group of the Afroasiatic language family.', type: 'rtl' },
    'akk': { name: 'Akkadian', description: 'An extinct East Semitic language that was spoken in ancient Mesopotamia.', type: 'ltr' },
    'san': { name: 'Sanskrit', description: 'An ancient Indo-Aryan language that is the classical language of India and of Hinduism.', type: 'ltr' },
    'egy': { name: 'Egyptian Hieroglyphs', description: 'The formal writing system used in Ancient Egypt, featuring a combination of logographic, syllabic and alphabetic elements.', type: 'ltr' }
  };

  const languageInfo = langMap[langId || ''];

  const allTexts = useMemo(() => {
    return CorpusDB.getTexts().filter(t => t.language === langId);
  }, [langId]);

  if (!languageInfo) {
    return (
      <div className="p-8">
        <button onClick={() => navigate('/app/library')} className="text-blue flex items-center mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </button>
        <h1 className="text-2xl font-serif">Language not found</h1>
      </div>
    );
  }

  const beginnerTexts = allTexts.filter(t => t.level === 'A1' || t.level === 'A2');
  const intermediateTexts = allTexts.filter(t => t.level === 'B1' || t.level === 'B2');
  const advancedTexts = allTexts.filter(t => t.level === 'C1' || t.level === 'C2');

  const TextCard = ({ t }: { t: any }) => (
    <div key={t.id} className="bg-sand p-6 rounded-2xl border border-bdr/50 flex flex-col hover:border-blue transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={cn("text-[20px] font-serif mb-1", t.direction === 'rtl' ? 'font-hebrew text-right' : '')} dir={t.direction}>
            {t.title}
          </h3>
          {t.author && <p className="text-muted text-[14px]">{t.author}</p>}
        </div>
        <span className="text-[12px] uppercase tracking-wider font-bold text-muted bg-bdr/20 px-2 py-1 rounded">
          {t.level || 'A1'}
        </span>
      </div>
      
      <div className="mt-auto pt-6 flex gap-3">
        <button 
          onClick={() => navigate(`/app/reader/${t.id}`)}
          className="flex-1 flex items-center justify-center bg-blue text-sand py-2.5 rounded-lg font-medium hover:bg-blue/90 transition-colors"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          Read
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/app/library')} className="text-muted hover:text-ink flex items-center mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-ink">{languageInfo.name}</h1>
          <p className="text-lg text-ink2 max-w-2xl leading-relaxed">{languageInfo.description}</p>
        </motion.div>

        {beginnerTexts.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-12">
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Beginner</span>
              <h2 className="text-2xl font-serif text-ink">Foundational Texts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beginnerTexts.map(t => <TextCard key={t.id} t={t} />)}
            </div>
          </motion.section>
        )}

        {intermediateTexts.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Intermediate</span>
              <h2 className="text-2xl font-serif text-ink">Building Proficiency</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intermediateTexts.map(t => <TextCard key={t.id} t={t} />)}
            </div>
          </motion.section>
        )}

        {advancedTexts.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-12">
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Advanced</span>
              <h2 className="text-2xl font-serif text-ink">Mastery & Literature</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedTexts.map(t => <TextCard key={t.id} t={t} />)}
            </div>
          </motion.section>
        )}
        
        {allTexts.length === 0 && (
          <div className="text-center py-16 bg-parch/50 rounded-2xl border border-bdr">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-serif text-ink2">No texts available yet</h3>
            <p className="text-muted mt-2">Check back soon or import your own texts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
