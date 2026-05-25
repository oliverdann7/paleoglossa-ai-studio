import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { OnboardingProfile } from '../types/firestore.js';

const languages = [
  { id: 'greek', glyph: 'Ω', labelKey: 'grc', descKey: 'onboarding.ancientGreekDesc', font: 'font-greek' },
  { id: 'hebrew', glyph: 'א', labelKey: 'hbo', descKey: 'onboarding.hebrewDesc', font: 'font-hebrew' },
  { id: 'latin', glyph: 'L', labelKey: 'lat', descKey: 'onboarding.latinDesc', font: 'font-serif' },
];

const LanguageStep = ({ onNext }: { onNext: (data: Partial<OnboardingProfile>) => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-xl w-full">
      <h2 className="text-3xl font-serif mb-8 text-center">{t('onboarding.chooseLanguage', 'Choose your primary language')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setFreeLanguage } = useSubscription();
  const { updateSettings } = useSettings();
  const [step, setStep] = useState<number>(0);
  const [profile, setProfile] = useState<OnboardingProfile>({
    completed: false,
    languageId: 'grc',
    level: 'absolute-beginner',
    goal: 'biblical',
    dailyCommitment: 15,
  });

  const handleNext = async (data: Partial<OnboardingProfile>) => {
    const updatedProfile = { ...profile, ...data };
    if (step === 3) {
      updatedProfile.completed = true;
      setFreeLanguage(updatedProfile.languageId);
      await updateSettings({ onboardingProfile: updatedProfile });
      navigate('/app');
    } else {
      setProfile(updatedProfile);
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-parch text-ink flex items-center justify-center p-6 md:p-12 font-sans paper-texture">
      <AnimatePresence mode="wait">
        {step === 0 && <LanguageStep key="lang" onNext={handleNext} />}
        {step === 1 && <LevelStep key="level" onNext={handleNext} />}
        {step === 2 && <GoalStep key="goal" onNext={handleNext} />}
        {step === 3 && <CommitmentStep key="commit" onNext={handleNext} />}
      </AnimatePresence>
    </div>
  );
};
