import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { OnboardingProfile } from '../types/firestore.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import { getLanguageById } from '../lib/data/languages.js';
import { fetchOnboardingLemmas, invalidateRecommendations } from '../lib/services/recommendationApi.js';
import { VocabularyService } from '../lib/services/vocabularyService.js';
import { WordState } from '../lib/constants/wordStates.js';

const languages = [
  { id: 'greek', glyph: 'Ω', labelKey: 'grc', descKey: 'onboarding.ancientGreekDesc', font: 'font-greek' },
  { id: 'hebrew', glyph: 'א', labelKey: 'hbo', descKey: 'onboarding.hebrewDesc', font: 'font-hebrew' },
  { id: 'latin', glyph: 'L', labelKey: 'lat', descKey: 'onboarding.latinDesc', font: 'font-serif' },
  { id: 'syriac', glyph: 'ܐ', labelKey: 'syr', descKey: 'onboarding.syriacDesc', font: 'font-syriac' },
];

const LanguageStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-xl w-full">
      <h2 className="text-3xl font-serif mb-8 text-center">{t('onboarding.chooseLanguage', 'Choose your primary language')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <button key={lang.id} onClick={() => onNext({ languageId: lang.labelKey })} className="p-4 border rounded-xl hover:bg-parch3 transition-all flex flex-col items-center">
            <span className={`${lang.font} text-2xl`}>{lang.glyph}</span> {t(`languageNames.${lang.labelKey}`, lang.labelKey)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const LevelStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  const levels = ['absolute-beginner', 'knows-alphabet', 'intermediate', 'advanced'];
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-xl w-full">
      <h2 className="text-3xl font-serif mb-8 text-center">{t('onboarding.chooseLevel', 'Experience level')}</h2>
      <div className="space-y-4">
        {levels.map((level) => (
          <button key={level} onClick={() => onNext({ level: level as any })} className="w-full p-4 border rounded-xl hover:bg-parch3 transition-all text-left">
            {t(`onboarding.level.${level}`, level)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const GoalStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  const goals = ['biblical', 'classical', 'research', 'vocab', 'grammar'];
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-xl w-full">
      <h2 className="text-3xl font-serif mb-8 text-center">{t('onboarding.chooseGoal', 'What is your primary goal?')}</h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <button key={goal} onClick={() => onNext({ goal: goal as any })} className="w-full p-4 border rounded-xl hover:bg-parch3 transition-all text-left">
            {t(`onboarding.goal.${goal}`, goal)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const CommitmentStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  const commitments = [5, 10, 20, 60];
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-xl w-full">
      <h2 className="text-3xl font-serif mb-8 text-center">{t('onboarding.chooseCommitment', 'Daily study time?')}</h2>
      <div className="grid grid-cols-2 gap-4">
        {commitments.map((c) => (
          <button key={c} onClick={() => onNext({ dailyCommitment: c })} className="p-4 border rounded-xl hover:bg-parch3 transition-all">
            {c} {t('onboarding.minutes', 'minutes')}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Cold-start vocab seed. Shows the highest-frequency lemmas in the user's
 * chosen language; tapping a lemma marks it KNOWN. Skippable. This is the
 * single signal that lets the "ready to read" recommender produce non-empty
 * results on day one — without it, comprehension scores all hover near zero.
 */
const KnownWordsStep = ({
  languageId,
  onDone,
}: {
  languageId: string;
  onDone: (knownLemmas: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [lemmas, setLemmas] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const loading = lemmas === null;

  useEffect(() => {
    let cancelled = false;
    fetchOnboardingLemmas(languageId, 60)
      .then((data) => {
        if (!cancelled) setLemmas(data);
      })
      .catch(() => {
        if (!cancelled) setLemmas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [languageId]);

  const toggle = (lemma: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lemma)) next.delete(lemma);
      else next.add(lemma);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl w-full"
    >
      <h2 className="text-3xl font-serif mb-3 text-center">
        {t('onboarding.tapKnownTitle', 'Words you already know')}
      </h2>
      <p className="text-center text-sm opacity-70 mb-6">
        {t(
          'onboarding.tapKnownHint',
          'Tap any words you already recognise. Skip if unsure — we’ll learn from your reading.'
        )}
      </p>
      {loading ? (
        <div className="text-center opacity-60 py-10">…</div>
      ) : lemmas!.length === 0 ? (
        <p className="text-center opacity-60 py-6">
          {t('onboarding.tapKnownEmpty', 'No vocabulary data yet for this language — continue.')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center mb-8 max-h-[40vh] overflow-y-auto">
          {lemmas!.map((lemma) => {
            const isOn = selected.has(lemma);
            return (
              <button
                key={lemma}
                onClick={() => toggle(lemma)}
                className={`px-3 py-1.5 rounded-full border text-base font-greek transition-all ${
                  isOn ? 'bg-ink text-parch border-ink' : 'bg-parch3 hover:bg-parch2 border-parch2'
                }`}
              >
                {lemma}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={() => onDone([])} className="px-5 py-2 rounded-xl border hover:bg-parch3">
          {t('onboarding.skip', 'Skip')}
        </button>
        <button
          onClick={() => onDone(Array.from(selected))}
          className="px-5 py-2 rounded-xl bg-ink text-parch hover:opacity-90"
        >
          {selected.size > 0
            ? t('onboarding.markKnownCount', `Mark ${selected.size} known`, { count: selected.size })
            : t('onboarding.continue', 'Continue')}
        </button>
      </div>
    </motion.div>
  );
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setFreeLanguage } = useSubscription();
  const { updateSettings } = useSettings();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(0);
  const [profile, setProfile] = useState<OnboardingProfile>({
    completed: false,
    languageId: 'grc',
    level: 'absolute-beginner',
    goal: 'biblical',
    dailyCommitment: 15,
  });

  const finish = async (finalProfile: OnboardingProfile) => {
    finalProfile.completed = true;
    setFreeLanguage(finalProfile.languageId);
    await updateSettings({ onboardingProfile: finalProfile });
    trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      languageId: finalProfile.languageId,
      level: finalProfile.level,
      goal: finalProfile.goal,
    });
    const lang = getLanguageById(finalProfile.languageId as any);
    const startTextId = lang?.recommendedStartTextId;
    navigate(startTextId ? `/app/reader/${startTextId}` : '/app');
  };

  const handleNext = async (data: Partial<OnboardingProfile>) => {
    const updatedProfile = { ...profile, ...data };
    setProfile(updatedProfile);
    setStep(step + 1);
    // Last "form" step is CommitmentStep at index 3. After that we show the
    // known-words tap, then finish.
    if (step === 3) {
      // CommitmentStep advances to KnownWordsStep (index 4); no finish yet.
    }
  };

  const handleKnownWordsDone = async (knownLemmas: string[]) => {
    const uid = user?.uid ?? null;
    if (uid && knownLemmas.length > 0) {
      try {
        await Promise.all(
          knownLemmas.map((lemma) =>
            VocabularyService.setWordState(uid, lemma, WordState.KNOWN, profile.languageId)
          )
        );
        // Drop the server's known-lemma cache so the dashboard rail picks up the new state immediately.
        await invalidateRecommendations();
      } catch (err) {
        console.error('[onboarding] failed to seed known words', err);
      }
    }
    await finish(profile);
  };

  return (
    <div className="min-h-screen bg-parch text-ink flex items-center justify-center p-6 md:p-12 font-sans paper-texture">
      <AnimatePresence mode="wait">
        {step === 0 && <LanguageStep key="lang" onNext={handleNext} />}
        {step === 1 && <LevelStep key="level" onNext={handleNext} />}
        {step === 2 && <GoalStep key="goal" onNext={handleNext} />}
        {step === 3 && <CommitmentStep key="commit" onNext={handleNext} />}
        {step === 4 && (
          <KnownWordsStep
            key="known"
            languageId={profile.languageId}
            onDone={handleKnownWordsDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
