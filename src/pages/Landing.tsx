import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaleoIcon } from "../components/PaleoIcon";

export const Landing = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const onEnter = () => navigate("/auth/login");
  
  const onDemoMode = () => {
    localStorage.setItem('paleoglossa_demo_mode', 'true');
    navigate("/app");
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  return (
    <div className="relative min-h-screen bg-parch text-ink font-sans overflow-hidden paper-texture">
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
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
            <option value="zh">ZH</option>
          </select>
          <button
            onClick={onEnter}
            className="font-serif italic text-ink2 hover:text-ink transition-colors"
          >
            {t("landing.enterLibrary", "Enter the Library")}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24 relative z-10 flex flex-col min-h-screen justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="eyebrow text-gold mb-6 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t("landing.subtitle", "The Future of Philology")}
              </div>
              <h2 className="text-6xl md:text-[80px] font-serif leading-[1] tracking-tighter mb-8 text-ink">
                {t("landing.titleTop", "Read the ancient world")}<span className="italic">.</span>
                <br />
                <span className="italic text-ink2">{t("landing.titleBottom", "Word by word.")}</span>
              </h2>
              <p className="text-[17px] text-ink2 max-w-lg leading-[1.7] mb-12 font-body italic">
                {t("landing.desc", "A scholarly reference tool for reading classical languages. Focus on the text with precision morphology, immersive typography, and spaced repetition.")}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onEnter}
                  className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group"
                >
                  {t("landing.openTexts", "Open texts")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onDemoMode} className="btn-secondary px-8">{t("landing.tryDemo", "Try Demo")}</button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[420px] aspect-[3/4] p-2 bg-parch2 border border-bdr shadow-[0_20px_40px_-20px_rgba(26,20,16,0.15)]"
            >
              <div className="absolute inset-2 border border-bdr/50 p-6 flex flex-col justify-center items-center text-center bg-parch paper-texture">
                <div className="w-12 h-12 rounded-full border border-bdr flex items-center justify-center mb-6 text-gold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-serif text-ink mb-3 leading-tight">
                  ΟΜΗΡΟΥ
                  <br />
                  <span className="text-2xl italic">ΟΔΥΣΣΕΙΑ</span>
                </h3>
                <div className="w-12 h-px bg-bdr my-6"></div>
                <p className="font-body text-sm italic text-ink2">
                  Homeri Odyssea
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-2">
                  Liber I
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <section className="mt-32 pt-20 border-t border-bdr/50 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: BookOpen,
              title: t("landing.feature1Title", "Immersive Reading"),
              desc: t("landing.feature1Desc", "Typography optimized for ancient scripts and deep focus without distractions."),
            },
            {
              icon: GraduationCap,
              title: t("landing.feature2Title", "Morphology Aware"),
              desc: t("landing.feature2Desc", "Instant parsing, lemma analysis, and root tracking for every word."),
            },
            {
              icon: Sparkles,
              title: t("landing.feature3Title", "Intelligent Review"),
              desc: t("landing.feature3Desc", "Spaced repetition system designed for lexical mastery and retaining classical vocabulary."),
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
              <feature.icon
                className="w-6 h-6 text-muted mb-4"
                strokeWidth={1.5}
              />
              <h4 className="text-xl font-serif text-ink mb-3">
                {feature.title}
              </h4>
              <p className="font-body text-[14px] italic text-ink2 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="py-8 border-t border-bdr flex justify-center items-center text-[10px] font-mono uppercase tracking-widest text-muted">
        <span>© 2026 Paleoglossa Philology</span>
      </footer>
    </div>
  );
};
