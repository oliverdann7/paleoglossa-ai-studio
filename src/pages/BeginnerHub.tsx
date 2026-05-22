import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { CorpusDB } from '../data/corpus.js';
import {
  getAvailableLanguages,
  getLanguageIcon,
} from '../lib/constants/languages.js';

export const BeginnerHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const languages = useMemo(() => getAvailableLanguages(), []);

  const beginnerTexts = useMemo(() => {
    const all = CorpusDB.getTexts();
    return all.filter((t) => t.level === 'A1' || t.level === 'A2');
  }, []);

  const textsByLanguage = useMemo(() => {
    const map: Record<string, typeof beginnerTexts> = {};
    for (const text of beginnerTexts) {
      const lang = text.language;
      if (!map[lang]) map[lang] = [];
      map[lang].push(text);
    }
    return map;
  }, [beginnerTexts]);

  const scriptLanguages = useMemo(
    () => languages.filter((l) => l.hasScriptLearning),
    [languages]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-ink flex items-center mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />{' '}
          {t('common.back', 'Back')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold">
              {t('beginnerHub.title', 'Beginner Hub')}
            </h1>
          </div>
          <p className="text-lg text-ink2 max-w-2xl">
            {t(
              'beginnerHub.description',
              'Start your ancient-language journey here. Browse beginner-friendly texts and script-learning tools across all available languages.'
            )}
          </p>
        </motion.div>

        {scriptLanguages.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <GraduationCap className="w-5 h-5 text-blue" />
              <h2 className="text-xl font-serif font-semibold">
                {t('beginnerHub.learnScript', 'Learn a Script')}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {scriptLanguages.map((lang) => (
                <Link
                  key={lang.id}
                  to={`/app/language/${lang.id}/script-lab`}
                  className="flex items-center gap-3 p-4 bg-sand rounded-xl border border-bdr hover:border-blue transition-colors"
                >
                  {lang.icon && (
                    <span className="text-xl">{lang.icon}</span>
                  )}
                  <div>
                    <div className="text-sm font-medium">{lang.name}</div>
                    <div className="text-xs text-muted">
                      {lang.writingSystem}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-serif font-semibold">
              {t('beginnerHub.beginnerTexts', 'Beginner Texts')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((lang) => {
              const texts = textsByLanguage[lang.id];
              if (!texts || texts.length === 0) return null;
              const icon = getLanguageIcon(lang.id);
              return (
                <div
                  key={lang.id}
                  className="bg-sand p-5 rounded-2xl border border-bdr"
                >
                  <Link
                    to={`/app/language/${lang.id}`}
                    className="flex items-center gap-2 mb-3 hover:text-blue transition-colors"
                  >
                    {icon && (
                      <span className="text-lg">{icon}</span>
                    )}
                    <h3 className="font-serif font-semibold text-lg">
                      {lang.name}
                    </h3>
                  </Link>
                  <div className="space-y-2">
                    {texts.slice(0, 4).map((text) => (
                      <Link
                        key={text.id}
                        to={`/app/reader/${text.id}`}
                        className="block text-sm text-ink2 hover:text-blue transition-colors truncate"
                      >
                        {text.title}
                      </Link>
                    ))}
                    {texts.length > 4 && (
                      <Link
                        to={`/app/language/${lang.id}`}
                        className="block text-xs text-blue hover:underline mt-1"
                      >
                        {t('beginnerHub.viewAll', 'View all {{count}} texts', {
                          count: texts.length,
                        })}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {beginnerTexts.length === 0 && (
            <div className="text-center py-16 bg-parch/50 rounded-2xl border border-bdr">
              <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-serif text-ink2">
                {t('beginnerHub.noTexts', 'No beginner texts yet')}
              </h3>
              <p className="text-muted mt-2">
                {t(
                  'beginnerHub.checkBack',
                  'Check back soon as more texts are added.'
                )}
              </p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};
