import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Sparkles,
  Check,
  ChevronRight,
  Library,
  Languages,
} from 'lucide-react';
import { cn } from '../lib/utils.js';
import { CorpusDB } from '../data/corpus.js';
import { getAvailableLanguages, getLanguageIcon } from '../lib/constants/languages.js';
import { GUIDED_TIERS } from '../lib/constants/beginnerPaths.js';
import type { GuidedTier } from '../lib/constants/beginnerPaths.js';
import { useBeginnerProgress } from '../lib/hooks/useBeginnerProgress.js';
import type { BeginnerMilestone } from '../lib/hooks/useBeginnerProgress.js';
import { useSettings } from '../lib/hooks/useSettings.js';

const LEVEL_TO_TIER: Record<
  'absolute-beginner' | 'knows-alphabet' | 'intermediate' | 'advanced',
  string
> = {
  'absolute-beginner': 'know-nothing',
  'knows-alphabet': 'know-alphabet',
  intermediate: 'read-slowly',
  advanced: 'academic',
};

export const BeginnerHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getProgress, markMilestone } = useBeginnerProgress();
  const { settings } = useSettings();

  // User-chosen overrides (null = fall back to onboarding-derived defaults).
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  const languages = useMemo(() => getAvailableLanguages(), []);

  const onboarding = settings.onboardingProfile;
  const preselectedTierId =
    onboarding && onboarding.level ? LEVEL_TO_TIER[onboarding.level] : null;
  const preselectedLangId = onboarding?.languageId || null;

  // Effective values: user choice wins; otherwise derived from onboarding.
  // For expandedLang an empty string means "user explicitly collapsed".
  const effectiveTier = selectedTier ?? preselectedTierId;
  const effectiveExpandedLang =
    expandedLang === null ? preselectedLangId : expandedLang || null;
  const showOnboardingHint =
    selectedTier === null &&
    expandedLang === null &&
    (preselectedTierId !== null || preselectedLangId !== null);

  const textsByLanguage = useMemo(() => {
    const all = CorpusDB.getTexts();
    const map: Record<string, typeof all> = {};
    for (const text of all) {
      if (!map[text.language]) map[text.language] = [];
      map[text.language].push(text);
    }
    return map;
  }, []);

  const tier = useMemo(
    () => GUIDED_TIERS.find((t) => t.id === effectiveTier) || GUIDED_TIERS[0],
    [effectiveTier]
  );

  const hasMatchingText = (langId: string): string | null => {
    const texts = textsByLanguage[langId];
    if (!texts) return null;
    const recommended = languages.find((l) => l.id === langId)?.recommendedStartTextId;
    if (recommended && texts.some((t) => t.id === recommended)) return recommended;
    const beginner = texts.find((t) => t.level === 'A1' || t.level === 'A0');
    if (beginner) return beginner.id;
    return texts[0]?.id || null;
  };

  const hasBeginnerTexts = (langId: string): boolean => {
    const texts = textsByLanguage[langId];
    if (!texts) return false;
    return texts.some((t) => t.level === 'A1' || t.level === 'A2' || t.level === 'A0');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-ink flex items-center mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Back')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-7 h-7 text-blue" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink">
              {t('beginnerHub.title', 'Beginner Hub')}
            </h1>
          </div>
          <p className="text-base md:text-lg text-ink2 max-w-3xl leading-relaxed">
            {t(
              'beginnerHub.description',
              'Choose a language and your experience level. We will guide you step by step — from your first sign to your first review session.'
            )}
          </p>
        </motion.div>

        {/* Tier selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-ink2 uppercase tracking-widest">
              {t('beginnerHub.whatIsYourLevel', 'What is your experience level?')}
            </h2>
            {showOnboardingHint && (
              <span className="text-[11px] text-muted">
                {t(
                  'beginnerHub.setFromOnboarding',
                  'Set from your onboarding — change anytime'
                )}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GUIDED_TIERS.map((tierOption) => {
              const isActive = effectiveTier === tierOption.id;
              return (
                <button
                  key={tierOption.id}
                  onClick={() => {
                    setSelectedTier(tierOption.id);
                  }}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all',
                    isActive
                      ? 'bg-blue/5 border-blue text-blue shadow-sm'
                      : 'bg-sand border-bdr hover:border-ink/20 text-ink'
                  )}
                >
                  <div
                    className={cn('text-sm font-bold mb-1', isActive ? 'text-blue' : 'text-ink')}
                  >
                    {tierOption.label}
                  </div>
                  <div className="text-[12px] text-muted leading-tight">
                    {tierOption.description}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Language grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-bold text-ink2 uppercase tracking-widest mb-4">
            {t('beginnerHub.chooseLanguage', 'Choose a language')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {languages.map((lang) => {
              const icon = getLanguageIcon(lang.id);
              const texts = textsByLanguage[lang.id] || [];
              const startTextId = hasMatchingText(lang.id);
              const hasBeginner = hasBeginnerTexts(lang.id);
              const progress = getProgress(lang.id);
              const stepsDone = [
                progress.scriptOpened,
                progress.firstTextOpened,
                progress.firstWordSaved,
                progress.firstReviewCompleted,
              ].filter(Boolean).length;
              const isExpanded = effectiveExpandedLang === lang.id;

              return (
                <div
                  key={lang.id}
                  className={cn(
                    'bg-sand rounded-2xl border transition-all',
                    isExpanded ? 'border-blue shadow-md' : 'border-bdr'
                  )}
                >
                  {/* Language header / card */}
                  <button
                    onClick={() => setExpandedLang(isExpanded ? '' : lang.id)}
                    className="w-full text-left p-5 flex items-start gap-4"
                  >
                    <span className="w-12 h-12 bg-parch2 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {icon || '📜'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-lg text-ink truncate">
                        {lang.name}
                      </h3>
                      <p className="text-[12px] text-muted mb-2">{lang.era}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lang.hasScriptLearning && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                            <GraduationCap className="w-2.5 h-2.5" />
                            Script
                          </span>
                        )}
                        {hasBeginner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                            <BookOpen className="w-2.5 h-2.5" />
                            A1-A2
                          </span>
                        )}
                        {lang.supportsMorphology && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue/5 text-blue border border-blue/20">
                            Morph
                          </span>
                        )}
                        {lang.dictionaryHints && lang.dictionaryHints.dictionaries.length > 0 && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            <Library className="w-2.5 h-2.5" />
                            Dict
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-5 h-5 text-muted shrink-0 mt-1 transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                  </button>

                  {/* Progress bar (collapsed view) */}
                  {stepsDone > 0 && (
                    <div className="px-5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-parch3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue rounded-full transition-all"
                            style={{ width: `${(stepsDone / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted">
                          {stepsDone}/{4}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded guided path */}
                  {isExpanded && (
                    <div className="border-t border-bdr px-5 pb-5 pt-4 space-y-5">
                      {/* Recommended text */}
                      {startTextId && (
                        <Link
                          to={`/app/reader/${startTextId}`}
                          onClick={() => markMilestone(lang.id, 'firstTextOpened')}
                          className="flex items-center gap-3 p-3 bg-blue/5 rounded-xl border border-blue/20 hover:bg-blue/10 transition-colors group"
                        >
                          <BookOpen className="w-5 h-5 text-blue shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-blue uppercase tracking-wider">
                              {t('beginnerHub.recommendedStart', 'Recommended start')}
                            </div>
                            <div className="text-sm text-ink font-medium truncate">
                              {texts.find((t) => t.id === startTextId)?.title || startTextId}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-blue shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      )}

                      {/* Tier steps */}
                      <div>
                        <div className="text-[11px] font-bold text-ink2 uppercase tracking-wider mb-3">
                          {t('beginnerHub.yourPath', 'Your path')} — {tier.label}
                        </div>
                        <div className="space-y-2">
                          {renderSteps(tier, lang.id, startTextId, progress, markMilestone)}
                        </div>
                      </div>

                      {/* Script lab link */}
                      {lang.hasScriptLearning && (
                        <Link
                          to={`/app/language/${lang.id}/script-lab`}
                          onClick={() => markMilestone(lang.id, 'scriptOpened')}
                          className="flex items-center gap-3 p-3 bg-sand border border-bdr rounded-xl hover:border-blue/30 transition-colors"
                        >
                          <GraduationCap className="w-5 h-5 text-purple-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink">
                              {t('beginnerHub.learnScript', 'Learn the {{script}} script', {
                                script: lang.writingSystem,
                              })}
                            </div>
                            <div className="text-[11px] text-muted">
                              {t('beginnerHub.learnScriptDesc', 'Practice signs and reading')}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                        </Link>
                      )}

                      {/* Language page link */}
                      <Link
                        to={`/app/language/${lang.id}`}
                        className="flex items-center gap-3 p-3 bg-sand border border-bdr rounded-xl hover:border-blue/30 transition-colors"
                      >
                        <Languages className="w-5 h-5 text-muted shrink-0" />
                        <div className="text-sm text-ink2">
                          {t('beginnerHub.browseAllTexts', 'Browse all texts for {{language}}', {
                            language: lang.name,
                          })}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted shrink-0 ml-auto" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function renderSteps(
  tier: GuidedTier,
  _langId: string,
  _startTextId: string | null,
  progress: {
    scriptOpened: boolean;
    firstTextOpened: boolean;
    firstWordSaved: boolean;
    firstReviewCompleted: boolean;
  },
  markMilestone: (langId: string, milestone: BeginnerMilestone) => void
) {
  return tier.steps.map((step, idx) => {
    const milestoneKey = step.milestone;
    const done = milestoneKey ? progress[milestoneKey] : false;

    return (
      <div
        key={idx}
        className={cn(
          'flex items-start gap-3 p-3 rounded-xl transition-colors',
          done ? 'bg-green-50/50' : 'bg-white/50'
        )}
      >
        {/* Step number / check */}
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
            done ? 'bg-green-500 text-white' : 'bg-parch3 text-muted'
          )}
        >
          {done ? <Check className="w-4 h-4" /> : idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-semibold', done ? 'text-green-700' : 'text-ink')}>
            {step.label}
          </div>
          <div className="text-[12px] text-muted leading-snug">{step.description}</div>
          {step.action && !done && (
            <Link
              to={step.action.to}
              onClick={() => {
                if (milestoneKey) markMilestone(_langId, milestoneKey);
              }}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue hover:underline"
            >
              {step.action.label}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    );
  });
}
