import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Play, AlertCircle } from "lucide-react";
import { CorpusDB } from "../data/corpus.js";
import { cn } from "../lib/utils.js";
import { useTranslation } from "react-i18next";
import { getLanguageById, getLanguageDirection, isRtlLanguage } from "../lib/constants/languages.js";
import { LanguageGuard } from "../components/LanguageGuard.js";

export const Language = () => {
  const { langId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const languageInfo = getLanguageById(langId || "");

  const allTexts = useMemo(() => {
    return CorpusDB.getTexts().filter((t) => t.language === langId);
  }, [langId]);

  if (!languageInfo) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate("/app/library")}
          className="text-blue flex items-center mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToLibrary", "Back to Library")}
        </button>
        <h1 className="text-2xl font-serif">{t("language.notFound", "Language not found")}</h1>
      </div>
    );
  }

  const dir = getLanguageDirection(langId || "");
  const rtl = isRtlLanguage(langId || "");

  const beginnerTexts = allTexts.filter(
    (t) => t.level === "A1" || t.level === "A2",
  );
  const intermediateTexts = allTexts.filter(
    (t) => t.level === "B1" || t.level === "B2",
  );
  const advancedTexts = allTexts.filter(
    (t) => t.level === "C1" || t.level === "C2",
  );

  const TextCard = ({ t: text }: { t: any }) => {
    const isExcerpt = text.isSample || text.sourceStatus === 'excerpt';
    const isPartial = text.sourceStatus === 'partial' && !text.isSample;
    const isComplete = text.sourceStatus === 'complete' || text.isComplete;

    return (
      <div
        className={cn(
          "bg-sand p-6 rounded-2xl border flex flex-col hover:border-blue transition-colors",
          isExcerpt ? "border-amber/30" : "border-bdr/50",
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-3">
            <h3
              className={cn(
                "text-[20px] font-serif mb-1",
                rtl ? "font-hebrew text-right" : "",
              )}
              dir={dir}
            >
              {text.title}
            </h3>
            {text.author && <p className="text-muted text-[14px]">{text.author}</p>}
          </div>
          <span className={cn(
            "text-[11px] uppercase tracking-wider font-bold px-2 py-1 rounded shrink-0",
            text.level?.startsWith("A") ? "bg-green-100 text-green-800"
              : text.level?.startsWith("B") ? "bg-blue/10 text-blue"
              : "bg-purple-100 text-purple-800"
          )}>
            {text.level || "?"}
          </span>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {isComplete && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('library.badgeComplete', 'Complete')}
            </span>
          )}
          {isPartial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue/5 text-blue border border-blue/20">
              {t('language.statusPartial', 'Partial')}
            </span>
          )}
          {isExcerpt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber/5 text-amber border border-amber/20">
              <AlertCircle className="w-2.5 h-2.5" />
              {t('reader.badgeSample', 'Sample Excerpt')}
            </span>
          )}
          {text.hasMorphology && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue/5 text-blue border border-blue/15">
              {t('library.toolMorphology', 'Morphology')}
            </span>
          )}
          {text.hasTranslation && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue/5 text-blue border border-blue/15">
              {t('library.toolTranslation', 'Translation')}
            </span>
          )}
        </div>

        {/* Honest excerpt notice */}
        {isExcerpt && (
          <p className="text-[11px] italic text-amber/80 mb-4">
            {t('language.sampleExcerptNotice', 'Sample excerpt — full text not yet imported.')}
          </p>
        )}
        {isPartial && (
          <p className="text-[11px] italic text-blue/70 mb-4">
            {t('language.partialNotice', 'Partial corpus — more sections coming.')}
          </p>
        )}

        {/* Sentence count if known */}
        {text.sentenceCount != null && (
          <p className="text-[11px] text-muted mb-4">
            {t('language.sentenceCount', '{{count}} sentence available', { count: text.sentenceCount })}
          </p>
        )}

        <div className="mt-auto pt-4 flex gap-3">
          <button
            onClick={() => navigate(`/app/reader/${text.id}`)}
            className="flex-1 flex items-center justify-center bg-blue text-sand py-2.5 rounded-lg font-medium hover:bg-blue/90 transition-colors"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            {isExcerpt ? t('language.readSample', 'Read Sample') : t('language.read', 'Read')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <LanguageGuard languageId={langId || ''}>
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/app/library")}
          className="text-muted hover:text-ink flex items-center mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToLibrary", "Back to Library")}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {languageInfo.icon && (
                  <span className="w-14 h-14 bg-parch2 text-ink rounded-full flex items-center justify-center text-3xl font-serif">
                    {languageInfo.icon}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">
                  {languageInfo.name}
                </h1>
              </div>
              <p className="text-lg text-ink2 leading-relaxed mb-6">
                {languageInfo.description}
              </p>
              
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-sans">
                {languageInfo.era && (
                  <div>
                    <span className="text-muted uppercase tracking-wider text-[10px] block mb-1">{t("language.era", "Era")}</span>
                    <span className="text-ink font-medium">{languageInfo.era}</span>
                  </div>
                )}
                {languageInfo.region && (
                  <div>
                    <span className="text-muted uppercase tracking-wider text-[10px] block mb-1">{t("language.region", "Region")}</span>
                    <span className="text-ink font-medium">{languageInfo.region}</span>
                  </div>
                )}
                {languageInfo.writingSystem && (
                  <div>
                    <span className="text-muted uppercase tracking-wider text-[10px] block mb-1">{t("language.writingSystem", "Writing System")}</span>
                    <span className="text-ink font-medium">{languageInfo.writingSystem}</span>
                  </div>
                )}
              </div>
            </div>
            
            {languageInfo.sampleText && (
              <div className="w-full md:w-1/3 bg-sand p-6 rounded-2xl border border-bdr flex flex-col items-center justify-center min-h-[160px]">
                <span className="text-muted uppercase tracking-wider text-[10px] block mb-4 w-full text-center">{t("language.sample", "Sample")}</span>
                <span 
                  dir={dir}
                  className={cn("text-2xl text-ink font-serif text-center leading-loose", rtl ? "font-hebrew text-right" : "")}
                >
                  {languageInfo.sampleText}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {beginnerTexts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {t("level.beginner", "Beginner")}
              </span>
              <h2 className="text-2xl font-serif text-ink">
                {t("language.foundationalTexts", "Foundational Texts")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beginnerTexts.map((t) => (
                <TextCard key={t.id} t={t} />
              ))}
            </div>
          </motion.section>
        )}

        {intermediateTexts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {t("level.intermediate", "Intermediate")}
              </span>
              <h2 className="text-2xl font-serif text-ink">
                {t("language.buildingProficiency", "Building Proficiency")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intermediateTexts.map((t) => (
                <TextCard key={t.id} t={t} />
              ))}
            </div>
          </motion.section>
        )}

        {advancedTexts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-bdr pb-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {t("level.advanced", "Advanced")}
              </span>
              <h2 className="text-2xl font-serif text-ink">
                {t("language.masteryLiterature", "Mastery & Literature")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedTexts.map((t) => (
                <TextCard key={t.id} t={t} />
              ))}
            </div>
          </motion.section>
        )}

        {allTexts.length === 0 && (
          <div className="text-center py-16 bg-parch/50 rounded-2xl border border-bdr">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-serif text-ink2">
              {t("language.noTexts", "No texts available yet")}
            </h3>
            <p className="text-muted mt-2">
              {t("language.checkBack", "Check back soon or import your own texts.")}
            </p>
          </div>
        )}
      </div>
    </div>
    </LanguageGuard>
  );
};
