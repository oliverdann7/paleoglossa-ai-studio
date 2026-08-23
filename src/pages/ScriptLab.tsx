import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shuffle, Check, X, BookOpen } from 'lucide-react';
import { getLanguageById } from '../lib/constants/languages.js';
import { recordMilestone } from '../lib/hooks/useBeginnerProgress.js';
import { getAlphabetCourse } from '../data/scripts/alphabet-courses.js';
import { AlphabetCourseView } from '../components/scripts/AlphabetCourseView.js';
import type { ScriptSign } from '../types/scripts.js';
import { AKKADIAN_SIGNS } from '../data/scripts/akkadian-signs.js';
import { EGYPTIAN_SIGNS } from '../data/scripts/egyptian-signs.js';
import { HITTITE_SIGNS } from '../data/scripts/hittite-signs.js';
import { UGARITIC_SIGNS } from '../data/scripts/ugaritic-signs.js';
import { GREEK_LETTERS } from '../data/scripts/greek-letters.js';
import { HEBREW_LETTERS } from '../data/scripts/hebrew-letters.js';
import { LATIN_SCRIPT } from '../data/scripts/latin-script.js';
import { SYRIAC_LETTERS } from '../data/scripts/syriac-letters.js';
import { COPTIC_LETTERS } from '../data/scripts/coptic-letters.js';
import { ARAMAIC_LETTERS } from '../data/scripts/aramaic-letters.js';
import { SANSKRIT_LETTERS } from '../data/scripts/sanskrit-letters.js';

const SIGN_MAP: Record<string, ScriptSign[]> = {
  akk: AKKADIAN_SIGNS,
  egy: EGYPTIAN_SIGNS,
  hit: HITTITE_SIGNS,
  uga: UGARITIC_SIGNS,
  grc: GREEK_LETTERS,
  'grc-koine': GREEK_LETTERS,
  hbo: HEBREW_LETTERS,
  lat: LATIN_SCRIPT,
  syr: SYRIAC_LETTERS,
  cop: COPTIC_LETTERS,
  arc: ARAMAIC_LETTERS,
  san: SANSKRIT_LETTERS,
};

type Tab = 'learn' | 'signs' | 'practice' | 'read';

export const ScriptLab = () => {
  const { langId } = useParams<{ langId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);

  const language = getLanguageById(langId || '');
  const signs = langId ? SIGN_MAP[langId] : undefined;
  const course = langId ? getAlphabetCourse(langId) : null;

  useEffect(() => {
    if (langId) recordMilestone(langId, 'scriptOpened');
  }, [langId]);

  const filteredSigns = useMemo(() => {
    if (!signs) return [];
    let result = signs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.transliteration.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.exampleGloss?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((s) => s.type === typeFilter);
    }
    return result;
  }, [signs, searchQuery, typeFilter]);

  const [quizSigns, setQuizSigns] = useState<ScriptSign[]>(() => {
    if (!signs) return [];
    const arr = [...signs];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 20);
  });

  const shuffleQuiz = useCallback(() => {
    if (!signs) return;
    const arr = [...signs];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setQuizSigns(arr.slice(0, 20));
    setQuizIndex(0);
    setQuizRevealed(false);
    setCorrectCount(0);
    setAttemptedCount(0);
  }, [signs]);

  const currentQuizSign = quizSigns[quizIndex % (quizSigns.length || 1)];

  const typeOptions = useMemo(() => {
    if (!signs) return [];
    const types = new Set(signs.map((s) => s.type));
    return ['all', ...Array.from(types)];
  }, [signs]);

  if (!language || !signs) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/app/library')}
          className="text-blue flex items-center mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back', 'Back')}
        </button>
        <h1 className="text-2xl font-serif">{t('scriptLab.notFound', 'Script lab not available for this language')}</h1>
      </div>
    );
  }

  const handleReveal = () => setQuizRevealed(true);
  const handleCorrect = () => {
    setCorrectCount((c) => c + 1);
    setAttemptedCount((c) => c + 1);
    setQuizRevealed(false);
    setQuizIndex((i) => i + 1);
  };
  const handleIncorrect = () => {
    setAttemptedCount((c) => c + 1);
    setQuizRevealed(false);
    setQuizIndex((i) => i + 1);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={language.direction}>
      <button
        onClick={() => navigate(-1)}
        className="text-blue flex items-center mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> {language.name}
      </button>

      <h1 className="text-2xl font-serif font-bold mb-1">{language.name}</h1>
      <p className="text-muted text-sm mb-6">{language.writingSystem}</p>

      <div className="flex gap-1 mb-6 border-b border-bdr">
        {([...(course ? (['learn'] as Tab[]) : []), 'signs', 'practice', 'read'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'practice' && quizSigns.length === 0) {
                shuffleQuiz();
              }
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue text-blue'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab === 'learn' && t('scriptLab.learn', 'Learn')}
            {tab === 'signs' && t('scriptLab.signs', 'Signs')}
            {tab === 'practice' && t('scriptLab.practice', 'Practice')}
            {tab === 'read' && t('scriptLab.read', 'Read')}
          </button>
        ))}
      </div>

      {activeTab === 'learn' && course && (
        <AlphabetCourseView langId={langId!} course={course} signs={signs} />
      )}

      {activeTab === 'signs' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('scriptLab.search', 'Search signs...')}
              className="flex-1 min-w-[200px] px-3 py-1.5 text-sm border border-bdr rounded-lg"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-bdr rounded-lg"
            >
              <option value="all">All types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredSigns.map((sign) => (
              <div
                key={sign.id}
                className="border border-bdr rounded-lg p-3 text-center hover:bg-bg-subtle transition-colors"
              >
                <div className="text-2xl mb-1">{sign.unicode || sign.transliteration}</div>
                <div className="text-xs font-mono text-muted">{sign.transliteration}</div>
                {sign.phonetic && (
                  <div className="text-[10px] text-muted">{sign.phonetic}</div>
                )}
                {sign.gardinerNumber && (
                  <div className="text-[10px] text-muted mt-1">Gardiner {sign.gardinerNumber}</div>
                )}
                {sign.exampleWord && (
                  <div className="text-xs mt-1 text-ink2">
                    {sign.exampleWord}
                    {sign.exampleGloss && (
                      <span className="text-muted ml-1">— {sign.exampleGloss}</span>
                    )}
                  </div>
                )}
                <div className="text-[10px] uppercase text-muted mt-1">{sign.type}</div>
              </div>
            ))}
          </div>
          {filteredSigns.length === 0 && (
            <p className="text-muted text-center py-8">{t('common.noResults', 'No signs found')}</p>
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4 text-sm text-muted">
            {t('scriptLab.progress', '{{correct}}/{{attempted}} correct', {
              correct: correctCount,
              attempted: attemptedCount,
            })}
          </div>
          {quizSigns.length === 0 && (
            <div className="text-center py-12">
              <button
                onClick={shuffleQuiz}
                className="px-6 py-3 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
              >
                <Shuffle className="w-5 h-5 inline mr-2" />
                {t('scriptLab.startPractice', 'Start Practice')}
              </button>
            </div>
          )}
          {quizSigns.length > 0 && currentQuizSign && (
            <div className="border border-bdr rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">
                {currentQuizSign.unicode || currentQuizSign.transliteration}
              </div>
              {!quizRevealed ? (
                <button
                  onClick={handleReveal}
                  className="px-6 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
                >
                  {t('scriptLab.reveal', 'Reveal answer')}
                </button>
              ) : (
                <div>
                  <div className="text-lg font-mono font-bold mb-2">
                    {currentQuizSign.transliteration}
                  </div>
                  {currentQuizSign.phonetic && (
                    <div className="text-sm text-muted mb-4">{currentQuizSign.phonetic}</div>
                  )}
                  {currentQuizSign.exampleWord && (
                    <div className="text-sm text-ink2 mb-4">
                      {currentQuizSign.exampleWord}
                      {currentQuizSign.exampleGloss && (
                        <span className="text-muted ml-1">— {currentQuizSign.exampleGloss}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={handleCorrect}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" /> {t('common.correct', 'Correct')}
                    </button>
                    <button
                      onClick={handleIncorrect}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" /> {t('common.incorrect', 'Incorrect')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setQuizIndex((i) => i + 1);
              setQuizRevealed(false);
            }}
            className="flex items-center gap-2 mx-auto mt-4 px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
          >
            <Shuffle className="w-4 h-4" /> {t('scriptLab.skip', 'Skip')}
          </button>
        </div>
      )}

      {activeTab === 'read' && (
        <div className="max-w-lg mx-auto text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted" />
          <h2 className="text-lg font-serif font-bold mb-2">
            {t('scriptLab.startReading', 'Start Reading')}
          </h2>
          <p className="text-sm text-muted mb-6">
            {t('scriptLab.readDesc', 'Beginner texts are available for this language. Open them in the Reader to practice reading with glosses and translations.')}
          </p>
          <Link
            to={`/app/language/${langId}`}
            className="inline-block px-6 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
          >
            {t('scriptLab.browseTexts', 'Browse texts')}
          </Link>
        </div>
      )}
    </div>
  );
};
