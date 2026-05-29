import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { OnboardingProfile } from '../types/firestore.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import { getLanguageById, LANGUAGES } from '../lib/data/languages.js';
import { fetchOnboardingLemmas, invalidateRecommendations } from '../lib/services/recommendationApi.js';
import { VocabularyService } from '../lib/services/vocabularyService.js';
import { WordState } from '../lib/constants/wordStates.js';
import { useVocabulary } from '../lib/hooks/useVocabulary.js';

const FONT_BY_SCRIPT: Record<string, string> = {
  Greek: 'font-greek',
  Hebrew: 'font-hebrew',
  Syriac: 'font-syriac',
};

const fontForLanguage = (scripts: string[]): string =>
  scripts.map((s) => FONT_BY_SCRIPT[s]).find(Boolean) ?? 'font-serif';

const LanguageStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl w-full">
      <h2 className="text-3xl font-serif mb-10 text-center">{t('onboarding.chooseLanguage', 'Choose your primary language')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {LANGUAGES.map((lang) => {
          const font = fontForLanguage(lang.scripts);
          const isComingSoon = lang.corpusStatus === 'coming_soon';
          return (
            <button
              key={lang.id}
              onClick={() => !isComingSoon && onNext({ languageId: lang.id })}
              disabled={isComingSoon}
              className="group relative aspect-square border rounded-2xl hover:bg-parch3 hover:border-ink/40 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-current disabled:hover:shadow-none"
            >
              <span className={`${font} text-5xl sm:text-6xl leading-none transition-transform group-hover:scale-110`}>
                {lang.symbol}
              </span>
              <span className="font-serif text-sm sm:text-base opacity-80 text-center px-2">
                {t(`languageNames.${lang.id}`, lang.shortName)}
              </span>
              {isComingSoon && (
                <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide opacity-60">
                  {t('onboarding.comingSoon', 'Soon')}
                </span>
              )}
            </button>
          );
        })}
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
  const { updateSettings, settings } = useSettings();
  const { user } = useAuth();
  const { knowledge, isLoading: vocabLoading } = useVocabulary();
  const [step, setStep] = useState<number>(0);
  const [profile, setProfile] = useState<OnboardingProfile>({
    completed: false,
    languageId: 'grc',
    level: 'absolute-beginner',
    goal: 'biblical',
    dailyCommitment: 15,
  });

  // Existing users with prior vocabulary should never see onboarding. If they
  // already have more than one KNOWN lemma, silently mark onboarding complete
  // and send them to the app. This is meant only for fresh sign-ups.
  useEffect(() => {
    if (vocabLoading) return;
    if (settings.onboardingProfile?.completed) {
      navigate('/app', { replace: true });
      return;
    }
    const knownCount = Object.values(knowledge).filter(
      (info) => info?.state === WordState.KNOWN
    ).length;
    if (knownCount > 1) {
      const existing = settings.onboardingProfile;
      const completedProfile: OnboardingProfile = {
        completed: true,
        languageId: existing?.languageId ?? profile.languageId,
        level: existing?.level ?? profile.level,
        goal: existing?.goal ?? profile.goal,
        dailyCommitment: existing?.dailyCommitment ?? profile.dailyCommitment,
      };
      updateSettings({ onboardingProfile: completedProfile });
      navigate('/app', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabLoading, knowledge, settings.onboardingProfile?.completed]);

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
