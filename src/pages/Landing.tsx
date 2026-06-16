import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '../lib/i18n.js';
import { PaleoIcon } from '../components/PaleoIcon.js';
import { PLANS, type PlanId } from '../lib/constants/plans.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { hasDayOneLesson } from '../data/dayOneLessons.js';

const PLAN_I18N_KEY: Record<PlanId, string> = {
  free: 'free',
  basic_1: 'basic',
  duo_2: 'duo',
  full_all: 'full',
};

const BOOKS = [
  {
    title: 'ΟΜΗΡΟΥ',
    subtitle: 'ΟΔΥΣΣΕΙΑ',
    latin: 'Homeri Odyssea',
    shelf: 'Liber I',
    accent: '#b8860b',
    bg: 'bg-[#f5ede0]',
  },
  {
    title: 'ΚΑΤΑ',
    subtitle: 'ΙΩΑΝΝΗΝ',
    latin: 'Evangelium Ioannis',
    shelf: 'Koinē Greek',
    accent: '#4a6741',
    bg: 'bg-[#eef0e8]',
  },
  {
    title: 'ΠΛΑΤΩΝΟΣ',
    subtitle: 'ΠΟΛΙΤΕΙΑ',
    latin: 'Platonis Respublica',
    shelf: 'Dialogus',
    accent: '#6b4c8a',
    bg: 'bg-[#ede8f2]',
  },
  {
    title: 'ΑΘΑΝΑΣΙΟΥ',
    subtitle: 'ΚΑΤΑ ΕΛΛΗΝΩΝ',
    latin: 'Contra Gentes',
    shelf: 'IVth Century',
    accent: '#7a3b2e',
    bg: 'bg-[#f2e8e4]',
  },
  {
    title: 'VERGILII',
    subtitle: 'AENEIS',
    latin: 'P. Vergilius Maro',
    shelf: 'Liber I',
    accent: '#2c5063',
    bg: 'bg-[#e4edf2]',
  },
  {
    title: 'AVGVSTINI',
    subtitle: 'CONFESSIONES',
    latin: 'Aurelius Augustinus',
    shelf: 'IVth Century',
    accent: '#5a4a1e',
    bg: 'bg-[#f0ece0]',
  },
];

const OFFSETS: { rotate: number; x: number; y: number; z: number }[] = [
  { rotate: -8, x: -28, y: 12, z: 0 },
  { rotate: -4, x: -14, y: 6, z: 1 },
  { rotate: -1, x: -4, y: 2, z: 2 },
  { rotate: 2, x: 8, y: -2, z: 3 },
  { rotate: 5, x: 18, y: -6, z: 4 },
  { rotate: 8, x: 28, y: -10, z: 5 },
];

const BookStack = () => {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setActive((prev) => (prev + 1) % BOOKS.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
      className="relative w-full max-w-[340px] h-[440px] flex items-center justify-center"
    >
      {BOOKS.map((book, i) => {
        const offset = OFFSETS[i];
        const isActive = i === active;
        return (
          <motion.div
            key={i}
            onClick={() => setActive(i)}
            animate={{
              rotate: isActive ? 0 : offset.rotate,
              x: isActive ? 0 : offset.x,
              y: isActive ? 0 : offset.y,
              scale: isActive ? 1.04 : 0.92,
              zIndex: isActive ? 20 : offset.z,
            }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: isActive ? 1.05 : 0.96, cursor: 'pointer' }}
            style={{ position: 'absolute', zIndex: isActive ? 20 : offset.z }}
            className={`w-[220px] aspect-[2/3] p-2 border border-[rgba(26,20,16,0.12)] shadow-[0_12px_32px_-12px_rgba(26,20,16,0.18)] ${book.bg}`}
          >
            <div className="absolute inset-2 border border-[rgba(26,20,16,0.08)] p-5 flex flex-col justify-center items-center text-center">
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center mb-4 opacity-80"
                style={{ borderColor: book.accent, color: book.accent }}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h3
                className="text-xl font-serif text-ink leading-tight"
                style={{ color: '#1a1410' }}
              >
                {book.title}
                <br />
                <span className="italic text-lg">{book.subtitle}</span>
              </h3>
              <div
                className="w-8 h-px my-4"
                style={{ backgroundColor: book.accent, opacity: 0.4 }}
              />
              <p className="font-body text-[11px] italic" style={{ color: '#5a4e3a' }}>
                {book.latin}
              </p>
              <p
                className="font-mono text-[8px] uppercase tracking-widest mt-1.5"
                style={{ color: '#8a7a60' }}
              >
                {book.shelf}
              </p>
            </div>
          </motion.div>
        );
      })}

      <div className="absolute -bottom-8 flex gap-2">
        {BOOKS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === active ? '#1a1410' : '#c4b89a',
              transform: i === active ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const Landing = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setDemoMode } = useAuth();

  const onEnter = () => navigate('/auth/signup');

  // Try Demo drops straight into the Day-One Lesson — a zero-friction trial that
  // ends in a comprehension win, not a dashboard tour (roadmap § 11, 1.4).
  const onDemoMode = () => {
    setDemoMode(true);
    const demoLanguageId = 'grc';
    if (hasDayOneLesson(demoLanguageId)) {
      navigate('/app/first-lesson', { state: { languageId: demoLanguageId } });
    } else {
      navigate('/app');
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    await loadLanguage(newLang as any);
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  return (
    <div className="relative min-h-screen bg-parch text-ink font-sans overflow-hidden paper-texture">
      <header className="absolute top-0 left-0 w-full px-8 pb-8 pt-safe-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-2.5">
          <PaleoIcon className="w-8 h-8 flex-shrink-0" />
          <h1 className="text-xl font-serif font-semibold tracking-tight text-blue hidden sm:block">
            Παλαιόγλωσσα
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="bg-transparent border border-bdr rounded px-2 py-1 text-sm font-bold text-ink focus:outline-none focus:border-blue cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
            <option value="pt">PT</option>
            <option value="fr">FR</option>
            <option value="ru">RU</option>
            <option value="tr">TR</option>
            <option value="zh">ZH</option>
          </select>
          <button
            onClick={onEnter}
            className="font-serif italic text-ink2 hover:text-ink transition-colors"
          >
            {t('landing.enterLibrary', 'Enter the Library')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24 relative z-10 flex flex-col min-h-screen justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="eyebrow text-gold mb-6 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t('landing.subtitle', 'The Future of Philology')}
              </div>
              <h2 className="text-6xl md:text-[80px] font-serif leading-[1] tracking-tighter mb-8 text-ink">
                {t('landing.titleTop', 'Read the ancient world')}
                <span className="italic">.</span>
                <br />
                <span className="italic text-ink2">
                  {t('landing.titleBottom', 'Word by word.')}
                </span>
              </h2>
              <p className="text-[17px] text-ink2 max-w-lg leading-[1.7] mb-12 font-body italic">
                {t(
                  'landing.desc',
                  'A scholarly reference tool for reading classical languages. Focus on the text with precision morphology, immersive typography, and spaced repetition.'
                )}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onEnter}
                  className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group"
                >
                  {t('landing.getStarted', 'Get started free')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onDemoMode} className="btn-secondary px-8">
                  {t('landing.tryDemo', 'Try Demo')}
                </button>
              </div>
              <p className="text-sm text-muted mt-3">
                {t('landing.alreadyHaveAccount', 'Already have an account?')}{' '}
                <a href="/auth/login" className="text-blue hover:underline font-medium">
                  {t('landing.signIn', 'Sign in')}
                </a>
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <BookStack />
          </div>
        </div>

        <section className="mt-32 pt-20 border-t border-bdr/50 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: BookOpen,
              title: t('landing.feature1Title', 'Immersive Reading'),
              desc: t(
                'landing.feature1Desc',
                'Typography optimized for ancient scripts and deep focus without distractions.'
              ),
            },
            {
              icon: GraduationCap,
              title: t('landing.feature2Title', 'Morphology Aware'),
              desc: t(
                'landing.feature2Desc',
                'Instant parsing, lemma analysis, and root tracking for every word.'
              ),
            },
            {
              icon: Sparkles,
              title: t('landing.feature3Title', 'Intelligent Review'),
              desc: t(
                'landing.feature3Desc',
                'Spaced repetition system designed for lexical mastery and retaining classical vocabulary.'
              ),
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded border border-transparent hover:border-bdr hover:bg-parch2 transition-colors duration-300"
            >
              <feature.icon className="w-6 h-6 text-muted mb-4" strokeWidth={1.5} />
              <h4 className="text-xl font-serif text-ink mb-3">{feature.title}</h4>
              <p className="font-body text-[14px] italic text-ink2 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
        {/* Pricing */}
        <section className="mt-32 pt-20 border-t border-bdr/50">
          <h3 className="text-3xl font-serif text-center text-ink mb-4">
            {t('landing.pricingTitle', 'Simple, transparent pricing')}
          </h3>
          <p className="text-center text-ink2 text-[15px] mb-12 max-w-lg mx-auto">
            {t(
              'landing.pricingSubtitle',
              'Start free. Upgrade when you need unlimited vocabulary saves and full AI analysis.'
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const planKey = PLAN_I18N_KEY[plan.id];
              const displayName = t(`plans.${planKey}.name`, plan.name);
              const displayBadge = plan.badge ? t(`plans.${planKey}.badge`, plan.badge) : null;
              const featureCount = plan.features.length;
              const displayFeatures = Array.from({ length: Math.min(4, featureCount) }, (_, i) =>
                t(`plans.${planKey}.feat${i + 1}`, plan.features[i])
              );
              return (
                <div
                  key={plan.id}
                  className={`card p-6 flex flex-col relative ${plan.recommended ? 'ring-2 ring-blue' : ''}`}
                >
                  {displayBadge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {displayBadge}
                    </span>
                  )}
                  <h4 className="text-lg font-bold text-ink">{displayName}</h4>
                  <div className="mt-2 mb-4">
                    {plan.monthlyPriceUsd === 0 ? (
                      <span className="text-3xl font-serif font-bold text-ink">
                        {t('landing.priceFree', 'Free')}
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-serif font-bold text-ink">
                          ${plan.monthlyPriceUsd}
                        </span>
                        <span className="text-ink2 text-sm">{t('landing.perMonth', '/mo')}</span>
                      </>
                    )}
                  </div>
                  <ul className="flex-1 space-y-2 mb-6">
                    {displayFeatures.map((f, i) => (
                      <li key={i} className="text-ink2 text-[13px] flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => (plan.id === 'free' ? onEnter() : navigate('/pricing'))}
                    className={plan.recommended ? 'btn-primary w-full' : 'btn-secondary w-full'}
                  >
                    {plan.id === 'free'
                      ? t('landing.startFree', 'Start free')
                      : t('landing.seePlans', 'Choose plan')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-bdr flex flex-col md:flex-row justify-center items-center text-[10px] font-mono uppercase tracking-widest text-muted gap-4">
        <span>© 2026 Paleoglossa Philology</span>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-ink transition-colors">
            Privacy
          </a>
          <a href="/terms" className="hover:text-ink transition-colors">
            Terms
          </a>
          <a href="/refund" className="hover:text-ink transition-colors">
            Refund
          </a>
          <a href="/support" className="hover:text-ink transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
};
