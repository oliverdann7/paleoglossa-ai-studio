import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Volume2, Sparkles, Loader2, Repeat, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, STATE_COLORS, STATE_LABELS } from '@/lib/constants/wordStates';
import { AIClient } from '@/lib/services/aiClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription, incrementAiUsage } from '@/lib/hooks/useSubscription';
import { ParadigmModal } from './ParadigmModal';

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

const getDictionaryUrl = (lemma: string, langId: string) => {
  switch (langId) {
    case 'grc': return `https://lsj.gr/wiki/${encodeURIComponent(lemma)}`;
    case 'lat': return `https://www.perseus.tufts.edu/hopper/morph?l=${encodeURIComponent(lemma)}&la=la`;
    case 'san': return `https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2014/web/webtc/indexcaller.php?key=${encodeURIComponent(lemma)}`;
    default: return `https://en.wiktionary.org/wiki/${encodeURIComponent(lemma)}#${langId}`;
  }
};

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
  const { user } = useAuth();
  const { t } = useTranslation();
  const { canUseAi, aiUsageRemaining, isPro } = useSubscription();

  const [aiWordInsight, setAiWordInsight] = useState<string | null>(null);
  const [isAiWordLoading, setIsAiWordLoading] = useState(false);
  const [isParadigmOpen, setIsParadigmOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleAiWordExplain = async () => {
    if (isAiWordLoading || !selectedWord) return;
    if (!canUseAi()) {
      setShowUpgradePrompt(true);
      return;
    }
    setIsAiWordLoading(true);
    setAiWordInsight("");
    incrementAiUsage();

    try {
      const languageName = text?.language || selectedWord.language || "ancient language";
      const explanation = await AIClient.explainWord(languageName, selectedWord.text, selectedWord.lemma, user?.uid);
      setAiWordInsight(explanation);
    } catch (error) {
      console.error(error);
      setAiWordInsight("Failed to fetch insights.");
    } finally {
      setIsAiWordLoading(false);
    }
  };

  const handleShowParadigm = () => {
    if (!canUseAi()) {
      setShowUpgradePrompt(true);
      return;
    }
    incrementAiUsage();
    setIsParadigmOpen(true);
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
              <a 
                href={getDictionaryUrl(selectedWord.lemma, textLanguageId)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                <ExternalLink className="w-3" />
              </a>
            </div>
            <div className="font-body text-[18px] md:text-[20px] text-ink font-medium mb-4 leading-snug">
              {getWordInfo(selectedWord.lemma).userGloss || selectedWord.gloss}
            </div>
            <div className="text-[10px] text-muted italic mb-4">
              Source: PalæoGlossa Ancient Corpus & AI Analysis
            </div>
            
            <div className="mt-4 pt-4 border-t border-bdr/20">
              <div className="text-[10px] uppercase font-bold text-muted mb-2 tracking-widest">
                {t('reader.yourGloss', "Your Gloss / Translation")}
              </div>
              <input
                type="text"
                className="w-full bg-white border border-bdr/50 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
                placeholder="Enter your own gloss..."
                value={getWordInfo(selectedWord.lemma).userGloss || ""}
                onChange={(e) => updateGloss(selectedWord.lemma, e.target.value, textLanguageId)}
              />
            </div>
          </div>

          {(aiWordInsight || isAiWordLoading) && (
            <div className="mb-10 p-5 rounded-2xl bg-blue/5 border border-blue/10">
              <div className="flex items-center gap-2 mb-3 text-blue font-bold text-sm">
                {isAiWordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Insights
              </div>
              <p className="text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap">{aiWordInsight}</p>
            </div>
          )}
          
          {!aiWordInsight && !isAiWordLoading && (
            <button 
              onClick={handleAiWordExplain}
              className="w-full mb-10 py-3 border border-blue/20 bg-blue/5 rounded-xl font-bold text-blue text-sm flex items-center justify-center gap-2 hover:bg-blue/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI About This Word
            </button>
          )}

          {selectedWord.morphology && Object.keys(selectedWord.morphology).length > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-3 flex items-center gap-2 text-ink">
                <span>Morphology</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedWord.morphology).map(([key, value]) => {
                  if (key === 'partOfSpeech' || !value) return null;
                  return (
                    <div key={key} className="px-3 py-1 bg-parch text-ink2 border border-bdr/50 rounded-lg text-[12px]">
                      <span className="opacity-50 lowercase mr-1.5">{key}:</span>
                      <span className="font-bold">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {['grc', 'grc-koine', 'lat', 'san', 'akk', 'hit', 'syr', 'arc', 'hbo', 'cop'].includes(textLanguageId) && (
            <div className="mb-10">
              <button
                className="w-full py-3 border border-gold/30 text-gold text-[13px] font-bold rounded-xl hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
                onClick={handleShowParadigm}
              >
                <Sparkles className="w-4 h-4" />
                {t("reader.showFullParadigm", "Show Full Paradigm")}
              </button>
            </div>
          )}

          {/* Contextual Examples */}
          {getWordInfo(selectedWord.lemma).contexts && (getWordInfo(selectedWord.lemma).contexts?.length ?? 0) > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-4 text-ink flex items-center justify-between">
                <span>Example Sentences</span>
                <Repeat className="w-3 h-3 opacity-50" />
              </div>
              <div className="space-y-3">
                {(getWordInfo(selectedWord.lemma).contexts || []).map((ctx: string, i: number) => (
                  <div key={i} className="p-3 bg-white border border-bdr/30 rounded-xl text-[13px] leading-relaxed italic text-ink/80 border-l-2 border-l-blue/30">
                    "{ctx}"
                  </div>
                ))}
              </div>
            </div>
          )}
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
                const info = getWordInfo(selectedWord.lemma);
                const isActive = info.state === state || (info.state === WordState.NEW && state === WordState.NEW && !knowledge[selectedWord.lemma]);
                
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
                Save Word / Add to Review
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <div className="eyebrow mb-3 text-ink">{t('reader.personalNotes', "Personal Notes")}</div>
            <textarea
              className="w-full h-24 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
              placeholder={t('reader.addNote', "Add a note about this word...")}
              value={getWordInfo(selectedWord.lemma).notes || ""}
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

        {/* Free tier AI usage indicator */}
        {!isPro && (
          <div className="px-6 py-3 border-t border-bdr/30 flex items-center justify-between bg-parch/30">
            <span className="text-[11px] text-muted">
              AI requests today: {5 - aiUsageRemaining()}/5
            </span>
            <a href="/pricing" className="text-[11px] font-bold text-blue hover:underline flex items-center gap-1">
              <Crown className="w-3 h-3" /> Upgrade
            </a>
          </div>
        )}
      </motion.div>

      <ParadigmModal
        isOpen={isParadigmOpen}
        onClose={() => setIsParadigmOpen(false)}
        lemma={selectedWord.lemma}
        languageId={textLanguageId}
        word={selectedWord.text}
      />

      {/* Upgrade prompt */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradePrompt(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-parch2 rounded-[28px] p-10 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-7 h-7 text-amber" />
              </div>
              <h3 className="font-serif text-[24px] text-ink mb-2">Daily Limit Reached</h3>
              <p className="text-[14px] text-ink2 mb-6 leading-relaxed">
                You've used all 5 free AI requests for today. Upgrade to the Fellowship plan for unlimited insights, paradigms, and translations.
              </p>
              <a
                href="/pricing"
                className="block w-full py-3 bg-blue text-white rounded-xl font-bold text-[14px] hover:bg-blue/90 transition-colors mb-3"
              >
                Upgrade to Fellowship
              </a>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="text-[13px] text-muted hover:text-ink transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
