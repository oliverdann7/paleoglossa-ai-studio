import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Volume2, Sparkles, Loader2, Repeat, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, STATE_COLORS, STATE_LABELS } from '@/lib/constants/wordStates';
import { AIClient } from '@/lib/services/aiClient';
import { ParadigmModal } from './ParadigmModal';
import { ATTRIBUTIONS, CorpusDB } from '@/data/corpus';
import { MorphologyService } from '@/lib/services/morphologyService';
import { findDictionaryEntry } from '@/lib/data/dictionary';

interface LexDrawerPanelProps {
  selectedWord: any;
  setSelectedWord: (w: any) => void;
  knowledge: any;
  setWordState: (lemma: string, state: WordState, languageId: string, context?: string) => void;
  setWordNote: (lemma: string, notes: string) => void;
  updateGloss: (lemma: string, gloss: string, languageId: string) => void;
  getWordInfo: (lemma: string) => any;
  showTranslit: boolean;
  isHebrewFont: boolean;
  isRtl: boolean;
  textLanguageId: string;
  exampleSentences: any[];
  playTTS: (text: string, lang: string) => void;
  text?: any;
}

const getDictionaryPath = (lemma: string, langId: string) =>
  `/app/dictionary/${encodeURIComponent(langId)}/${encodeURIComponent(lemma)}`;

export const LexDrawerPanel = ({
  selectedWord,
  setSelectedWord,
  knowledge,
  setWordState,
  setWordNote,
  updateGloss,
  getWordInfo,
  showTranslit,
  isHebrewFont,
  isRtl,
  textLanguageId,
  exampleSentences,
  playTTS,
  text
}: LexDrawerPanelProps) => {
  const { t } = useTranslation();
  
  const [aiWordInsight, setAiWordInsight] = useState<string | null>(null);
  const [isAiWordLoading, setIsAiWordLoading] = useState(false);
  const [isParadigmOpen, setIsParadigmOpen] = useState(false);

  // Compute once per selected word — avoids 5+ getWordInfo calls in JSX
  const wordInfo = useMemo(
    () => selectedWord ? getWordInfo(selectedWord.lemma) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedWord?.lemma, knowledge]
  );

  const sourceInfo = useMemo(() => {
    if (!text?.corpusId) return null;
    const corpus = CorpusDB.getCorpusOverview(text.corpusId);
    if (!corpus?.sourceAttributionId) return null;
    const attribution = ATTRIBUTIONS[corpus.sourceAttributionId];
    if (!attribution) return null;
    return {
      name: attribution.sourceName,
      license: attribution.licenseName,
      url: attribution.sourceUrl,
      requiresAttribution: attribution.requiresAttribution,
    };
  }, [text]);

  const morphologyDisplay = useMemo(() => {
    if (!selectedWord) return null;
    return MorphologyService.formatMorphologyForDisplay(
      textLanguageId,
      selectedWord.morphology,
      {
        source: sourceInfo?.name || selectedWord.source,
        confidence: selectedWord.confidence,
      },
    );
  }, [selectedWord, sourceInfo?.name, textLanguageId]);

  const handleAiWordExplain = async () => {
    if (isAiWordLoading || !selectedWord) return;
    setIsAiWordLoading(true);
    setAiWordInsight("");
    
    try {
      const languageName = text?.language || selectedWord.language || "ancient language";
      const explanation = await AIClient.explainWord(languageName, selectedWord.text, selectedWord.lemma);
      setAiWordInsight(explanation);
    } catch (error) {
      console.error(error);
      setAiWordInsight("Failed to fetch insights.");
    } finally {
      setIsAiWordLoading(false);
    }
  };

  if (!selectedWord) return <AnimatePresence />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="md:!translate-y-0 fixed md:relative bottom-0 left-0 w-full md:w-[380px] h-[65vh] md:h-full bg-[#FEFAF4] border-t md:border-t-0 md:border-l border-bdr flex flex-col shrink-0 z-50 md:z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_40px_rgba(35,20,10,0.04)] rounded-t-3xl md:rounded-none"
      >
        <div className="h-14 border-b border-bdr flex items-center justify-between px-4 bg-[#FEFAF4] shrink-0 rounded-t-3xl md:rounded-none">
          <div className="eyebrow">Word Analysis</div>
          <button
            onClick={() => setSelectedWord(null)}
            className="text-muted hover:text-ink p-2 rounded-full hover:bg-parch border border-transparent"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-8 md:mb-10 text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
              <h2
                className={cn(
                  "text-[42px] md:text-[48px] font-serif leading-tight text-ink",
                  isHebrewFont ? "font-hebrew" : "",
                )}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <bdi>{selectedWord.text}</bdi>
              </h2>
              <button
                onClick={() =>
                  playTTS(selectedWord.text, text?.language || "")
                }
                className="p-3 text-blue hover:bg-blue/10 rounded-full transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            {showTranslit && selectedWord.translit && (
              <div className="font-body italic text-[16px] text-muted mb-4 opacity-80">
                {selectedWord.translit}
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[18px] font-serif text-blue font-semibold tracking-wide">
                From '
                <bdi className={isHebrewFont ? "font-hebrew" : ""}>
                  {selectedWord.lemma}
                </bdi>
                '
              </span>
            </div>
          </div>

          <div className="mb-10 p-5 bg-parch/40 border border-bdr/30 rounded-[20px]">
            <div className="eyebrow mb-4 flex items-center justify-between text-blue font-bold">
              <span>{t('reader.meaning', "Meaning")}</span>
              <Link
                to={getDictionaryPath(selectedWord.lemma, textLanguageId)}
                className="inline-flex items-center gap-1 hover:text-ink transition-colors"
              >
                <BookOpen className="w-3" />
                <span className="normal-case tracking-normal text-[11px]">Entry</span>
              </Link>
            </div>
             <div className="font-body text-[18px] md:text-[20px] text-ink font-medium mb-4 leading-snug">
               {wordInfo?.userGloss ||
                 (findDictionaryEntry(selectedWord.lemma, textLanguageId)?.shortGloss ||
                  selectedWord.gloss)}
             </div>
            {!sourceInfo && (
              <div className="text-[10px] text-muted italic mb-4">
                Source: PalæoGlossa Ancient Corpus & AI Analysis
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-bdr/20">
              <div className="text-[10px] uppercase font-bold text-muted mb-2 tracking-widest">
                {t('reader.yourGloss', "Your Gloss / Translation")}
              </div>
              <input
                type="text"
                className="w-full bg-white border border-bdr/50 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
                placeholder="Enter your own gloss..."
                value={wordInfo?.userGloss || ""}
                onChange={(e) => updateGloss(selectedWord.lemma, e.target.value, textLanguageId)}
              />
            </div>
          </div>

          {sourceInfo && (
            <div className="mb-6 p-4 rounded-2xl bg-parch2/30 border border-bdr/20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-jade" />
                <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Data Source</span>
              </div>
              <p className="text-[13px] text-ink2 font-medium">{sourceInfo.name}</p>
              <p className="text-[10px] text-muted mt-1">
                License: {sourceInfo.license}
                {sourceInfo.requiresAttribution && (
                  <span className="inline-flex items-center gap-1 ml-2 text-amber">
                    <ShieldAlert className="w-3 h-3" /> Attribution required
                  </span>
                )}
              </p>
            </div>
          )}

          {(aiWordInsight || isAiWordLoading) && (
            <div className="mb-10 p-5 rounded-2xl bg-blue/5 border border-blue/10">
              <div className="flex items-center gap-2 mb-3 text-blue font-bold text-sm">
                {isAiWordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Insights
              </div>
              <p className="text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap">{aiWordInsight}</p>
            </div>
          )}
          
          {/* Your Knowledge */}
          <div className="mb-8">
            <div className="eyebrow mb-3 flex items-center justify-between text-ink">
              <span>{t('reader.yourKnowledge', "Your Knowledge")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                WordState.NEW,
                WordState.SEEN,
                WordState.LEARNING,
                WordState.FAMILIAR,
                WordState.KNOWN,
                WordState.IGNORED,
              ].map((state) => {
                const isActive = wordInfo?.state === state || (wordInfo?.state === WordState.NEW && state === WordState.NEW && !knowledge[selectedWord.lemma]);
                
                return (
                  <button
                    key={state}
                    onClick={() => setWordState(selectedWord.lemma, state, textLanguageId, selectedWord.sentenceText)}
                    className={cn(
                      "flex-1 min-w-[70px] py-2 md:py-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                      isActive
                        ? "shadow-sm transform scale-105"
                        : "bg-white border-bdr/50 hover:bg-parch opacity-60 hover:opacity-100",
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: STATE_COLORS[state].bg,
                            borderColor: STATE_COLORS[state].border,
                          }
                        : {}
                    }
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mb-0.5 border border-black/10"
                      style={{
                        backgroundColor:
                          STATE_COLORS[state].border === "transparent"
                            ? "#EAE5D9"
                            : STATE_COLORS[state].border,
                      }}
                    />
                    <span className="text-[8px] font-bold tracking-widest uppercase text-ink">
                      {t(`vocab.${STATE_LABELS[state].toLowerCase()}`, STATE_LABELS[state])}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => setWordState(selectedWord.lemma, WordState.LEARNING, textLanguageId, selectedWord.sentenceText)}
                className="w-full py-3 bg-blue text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Add to Review
              </button>
            </div>
          </div>

          {!aiWordInsight && !isAiWordLoading && (
            <button 
              onClick={handleAiWordExplain}
              className="w-full mb-10 py-3 border border-blue/20 bg-blue/5 rounded-xl font-bold text-blue text-sm flex items-center justify-center gap-2 hover:bg-blue/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI About This Word
            </button>
          )}

          {morphologyDisplay && (
            <div className="mb-10">
              <div className="eyebrow mb-3 flex items-center justify-between text-ink">
                <span>Morphology</span>
                {morphologyDisplay.confidence !== undefined && (
                  <span className="text-[10px] text-muted normal-case tracking-normal">
                    {Math.round(morphologyDisplay.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {!morphologyDisplay.missing && (
                  <span className="inline-block px-4 py-1.5 bg-parch3/60 text-ink border border-bdr/60 rounded-full text-[13px] font-bold tracking-wide uppercase">
                    {morphologyDisplay.compact}
                  </span>
                )}
                {morphologyDisplay.source && (
                  <span className="text-[11px] text-muted bg-white border border-bdr/40 rounded-full px-3 py-1">
                    Source: {morphologyDisplay.source}
                  </span>
                )}
              </div>

              {morphologyDisplay.missing ? (
                <div className="p-4 bg-parch/40 border border-dashed border-bdr rounded-xl text-[13px] text-muted">
                  Morphological parsing is not available for this token yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {morphologyDisplay.expanded.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-3 px-3 py-2 bg-parch text-ink2 border border-bdr/50 rounded-lg text-[12px]">
                      <span className="opacity-60 lowercase">{label}</span>
                      <span className="font-bold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="w-full mt-6 py-3 border-2 border-gold/30 text-gold text-[13px] font-bold rounded-xl hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
                onClick={() => setIsParadigmOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                {t("reader.showFullParadigm", "Show Full Paradigm")}
              </button>
            </div>
          )}

          {/* Contextual Examples */}
          {(wordInfo?.contexts?.length ?? 0) > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-4 text-ink flex items-center justify-between">
                <span>Example Sentences</span>
                <Repeat className="w-3 h-3 opacity-50" />
              </div>
              <div className="space-y-3">
                {(wordInfo?.contexts || []).map((ctx: string, i: number) => (
                  <div key={i} className="p-3 bg-white border border-bdr/30 rounded-xl text-[13px] leading-relaxed italic text-ink/80 border-l-2 border-l-blue/30">
                    "{ctx}"
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Notes Section */}
          <div className="mb-8">
            <div className="eyebrow mb-3 text-ink">{t('reader.personalNotes', "Personal Notes")}</div>
            <textarea
              className="w-full h-24 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
              placeholder={t('reader.addNote', "Add a note about this word...")}
              value={wordInfo?.notes || ""}
              onChange={(e) =>
                setWordNote(selectedWord.lemma, e.target.value)
              }
            />
          </div>

          {/* Example sentences */}
          {exampleSentences.length > 0 && (
            <div className="mt-8 pt-8 border-t border-bdr/30">
              <div className="eyebrow mb-4 flex justify-between">
                <span>{t('reader.occurrences', "Occurrences in Library")}</span>
                <span className="text-blue">
                  {exampleSentences.length} {t('reader.matches', "matches")}
                </span>
              </div>
              <div className="space-y-4">
                {exampleSentences.map((ex: any, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-parch/30 rounded-xl border border-bdr/20 text-[14px]"
                    >
                      <p
                        className={cn(
                          "font-serif mb-2 text-ink2",
                          isHebrewFont ? "font-hebrew" : "",
                        )}
                        dir={isRtl ? "rtl" : "ltr"}
                      >
                        {ex.sentence.tokens.map((t: any, i: number) => (
                          <span key={i}>
                            {t.punctBefore}
                            <span
                              className={cn(
                                t.lemma === selectedWord.lemma
                                  ? "font-bold text-blue"
                                  : "",
                              )}
                            >
                              {t.surface}
                            </span>
                            {t.punctAfter}
                          </span>
                        ))}
                      </p>
                      <p className="font-body italic text-muted text-[12px]">
                        {ex.sentence.translation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <ParadigmModal
        isOpen={isParadigmOpen}
        onClose={() => setIsParadigmOpen(false)}
        lemma={selectedWord.lemma}
        languageId={textLanguageId}
        word={selectedWord.text}
      />
    </AnimatePresence>
  );
};
