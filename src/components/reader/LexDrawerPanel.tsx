import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, BookMarked, Volume2, Sparkles, Loader2, Repeat, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, normalizeWordState, safeStateColors, safeStateLabel } from '@/lib/constants/wordStates';
import { AIClient } from '@/lib/services/aiClient';
import { ParadigmModal } from './ParadigmModal';
import { ATTRIBUTIONS, CorpusDB } from '@/data/corpus';
import { MorphologyService } from '@/lib/services/morphologyService';
import { findDictionaryEntry, getDefinitionWithFallbacks, LookupResult, GLOSS_SOURCES } from '@/lib/data/dictionary';
import { useSettings } from '@/lib/hooks/useSettings';
import { getGrammarReference } from '@/lib/grammar/references';
import { useNotebook } from '@/lib/hooks/useNotebook';
import { normalizeLemmaKey } from '@/lib/utils/lemmaUtils';

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

const LABEL_TO_CATEGORY: Record<string, string> = {
  'Case': 'case',
  'Number': 'number',
  'Gender': 'gender',
  'Person': 'person',
  'Tense': 'tense',
  'Voice': 'voice',
  'Mood': 'mood',
  'Degree': 'degree',
  'State': 'state',
  'Stem': 'stem',
  'Binyan': 'stem',
  'Root': 'root',
  'Aspect': 'tense',
  'Conjugation': 'stem',
  'Pattern': 'stem',
  'Construct': 'state',
  'Emphatic': 'state',
  'Status': 'state',
  'Determinative': 'other',
  'Sign type': 'other',
  'Logogram': 'other',
  'Raw parsing': 'other',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  case: '#3B82F6',
  number: '#60A5FA',
  gender: '#60A5FA',
  tense: '#D97706',
  voice: '#B45309',
  mood: '#B45309',
  person: '#F59E0B',
  stem: '#059669',
  root: '#059669',
  state: '#10B981',
  degree: '#9CA3AF',
  other: '#9CA3AF',
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
  const { t } = useTranslation();
  const { settings } = useSettings();

  const [aiWordInsight, setAiWordInsight] = useState<string | null>(null);
  const [isAiWordLoading, setIsAiWordLoading] = useState(false);
  const [isParadigmOpen, setIsParadigmOpen] = useState(false);
  const [aiFallbackGloss, setAiFallbackGloss] = useState<string | null>(null);
  const [isAiFallbackLoading, setIsAiFallbackLoading] = useState(false);
  const aiFallbackLemmaRef = useRef<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [tagPopoverPos, setTagPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const [researchNoteInput, setResearchNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const { saveNote, isSaving: isSavingNote } = useNotebook({ skipFetch: true });

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

  const handleAiWordExplain = async (useAsGloss: boolean = false) => {
    if (isAiWordLoading || !selectedWord) return;
    setIsAiWordLoading(true);
    if (!useAsGloss) {
      setAiWordInsight("");
    }
    
    try {
      const languageName = text?.language || selectedWord.language || "ancient language";
      const explanation = await AIClient.explainWord(languageName, selectedWord.text, selectedWord.lemma);
      if (useAsGloss) {
        setAiFallbackGloss(explanation);
      } else {
        setAiWordInsight(explanation);
      }
    } catch (error) {
      console.error(error);
      if (useAsGloss) {
        setAiFallbackGloss("Failed to fetch explanation.");
      } else {
        setAiWordInsight("Failed to fetch insights.");
      }
    } finally {
      setIsAiWordLoading(false);
    }
  };

  const definitionLookup = useMemo(() => {
    if (!selectedWord) return null;
    const userGloss = wordInfo?.userGloss;
    if (userGloss) {
      return { definition: userGloss, source: GLOSS_SOURCES.USER_GLOSS } as LookupResult;
    }
    const dictResult = getDefinitionWithFallbacks(selectedWord.lemma, textLanguageId);
    if (dictResult) return dictResult;
    if (selectedWord.gloss) {
      return { definition: selectedWord.gloss, source: GLOSS_SOURCES.TOKEN_GLOSS } as LookupResult;
    }
    return null;
  }, [selectedWord, wordInfo?.userGloss, textLanguageId]);

  // Reset AI gloss state whenever the selected word changes.
  useEffect(() => {
    setAiFallbackGloss(null); // eslint-disable-line react-hooks/set-state-in-effect
    setIsAiFallbackLoading(false);
    aiFallbackLemmaRef.current = null;
  }, [selectedWord?.lemma]);

  // Automatically fetch an AI definition when no lexicon definition is available.
  useEffect(() => {
    if (!selectedWord || definitionLookup) return;
    // Guard: only attempt once per lemma to avoid repeated calls.
    if (aiFallbackLemmaRef.current === selectedWord.lemma) return;
    const currentLemma = selectedWord.lemma;
    aiFallbackLemmaRef.current = currentLemma;
    setIsAiFallbackLoading(true);
    (async () => {
      try {
        const languageName = text?.language || selectedWord.language || "ancient language";
        const explanation = await AIClient.explainWord(languageName, selectedWord.text, selectedWord.lemma);
        if (aiFallbackLemmaRef.current === currentLemma && explanation) {
          setAiFallbackGloss(explanation);
        }
      } catch (error) {
        console.error('AI fallback failed:', error);
      } finally {
        if (aiFallbackLemmaRef.current === currentLemma) {
          setIsAiFallbackLoading(false);
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord?.lemma, !!definitionLookup, text?.language]);

  // Reset research note fields when the selected word changes
  useEffect(() => {
    setResearchNoteInput(''); // eslint-disable-line react-hooks/set-state-in-effect
    setNoteSaved(false);
  }, [selectedWord?.lemma]);

  const handleSaveResearchNote = async () => {
    const trimmed = researchNoteInput.trim();
    if (!trimmed) return;
    await saveNote({
      content: trimmed,
      languageId: textLanguageId,
      textId: text?.id,
      token: selectedWord?.text,
      lemma: selectedWord?.lemma,
      source: 'word-analysis',
      tags: selectedWord?.lemma ? [selectedWord.lemma] : [],
    });
    setResearchNoteInput('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
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
          <div className="eyebrow">{t('reader.wordAnalysis', 'Word Analysis')}</div>
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

          <div className="mb-10 p-5 bg-parch/40 border border-bdr/30 rounded-panel">
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
                {(() => {
                  if (definitionLookup) {
                    return (
                      <>
                        {definitionLookup.definition}
                        {definitionLookup.source === GLOSS_SOURCES.USER_GLOSS && (
                          <span className="block text-[11px] text-muted font-normal mt-1">
                            {t('reader.yourGlossLabel', 'Your Gloss')}
                          </span>
                        )}
                      </>
                    );
                  }
                  if (isAiFallbackLoading) {
                    return <span className="text-muted italic text-[16px]">Loading...</span>;
                  }
                  if (aiFallbackGloss) {
                    return (
                      <>
                        {aiFallbackGloss}
                        <span className="block text-[11px] text-muted font-normal mt-1">
                          {t('reader.aiSuggestion', 'AI suggestion')}
                        </span>
                      </>
                    );
                  }
                  return (
                    <div>
                      <span className="text-muted italic text-[16px]">
                        {t('reader.definitionUnavailable', 'No definition available.')}
                      </span>
                      <div className="mt-2 flex flex-col gap-1">
                        <button
                          onClick={() => handleAiWordExplain(true)}
                          className="text-[12px] text-blue hover:text-blue-700 underline-offset-2 hover:underline inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {t('reader.askAiForDef', 'Ask AI for a definition')}
                        </button>
                        <Link
                          to={getDictionaryPath(selectedWord.lemma, textLanguageId)}
                          className="text-[12px] text-blue hover:text-blue-700 underline-offset-2 hover:underline inline-flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          {t('reader.viewDictionary', 'View dictionary entry')}
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            {!sourceInfo && (
              <div className="text-tiny text-muted italic mb-4">
                {t('reader.ancientWord', 'Ancient word')}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-bdr/20">
              <div className="text-tiny uppercase font-bold text-muted mb-2 tracking-widest">
                {t('reader.yourGloss', "Your Gloss / Translation")}
              </div>
              <input
                type="text"
                className="w-full bg-white border border-bdr/50 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
                placeholder={t('reader.yourGlossPlaceholder', 'Enter your own gloss...')}
                value={wordInfo?.userGloss || ""}
                onChange={(e) => updateGloss(selectedWord.lemma, e.target.value, textLanguageId)}
              />
            </div>
          </div>

          {/* Your Knowledge — shown before Data Source per UX requirement */}
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
                const normalizedWordState = normalizeWordState(wordInfo?.state);
                const isActive = normalizedWordState === state || (normalizedWordState === WordState.NEW && state === WordState.NEW && !knowledge[normalizeLemmaKey(selectedWord.lemma)]);

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
                            backgroundColor: safeStateColors(state).bg,
                            borderColor: safeStateColors(state).border,
                          }
                        : {}
                    }
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mb-0.5 border border-black/10"
                      style={{
                        backgroundColor:
                          safeStateColors(state).border === "transparent"
                            ? "#EAE5D9"
                            : safeStateColors(state).border,
                      }}
                    />
                    <span className="text-[8px] font-bold tracking-widest uppercase text-ink">
                      {t(`vocab.${safeStateLabel(state).toLowerCase()}`, safeStateLabel(state))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setWordState(selectedWord.lemma, WordState.LEARNING, textLanguageId, selectedWord.sentenceText)}
                className="w-full py-4 bg-blue text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <BookMarked className="w-5 h-5" />
                {t('reader.addToReview', 'Add to Review')}
              </button>
            </div>
          </div>

          {/* Data Source */}
          {sourceInfo && (() => {
            const activeDicts = settings.activeDictionaries;
            const entry = findDictionaryEntry(selectedWord.lemma, textLanguageId);
            const visibleDicts = entry?.dictionaries
              ? entry.dictionaries.filter(d => !activeDicts || activeDicts.length === 0 || activeDicts.includes(d.id))
              : [];
            return (
              <div className="mb-6 p-4 rounded-2xl bg-parch2/30 border border-bdr/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-jade" />
                  <span className="text-tiny uppercase font-bold text-muted tracking-widest">
                    {t('reader.dataSource', 'Data Source')}
                  </span>
                </div>
                <p className="text-[13px] text-ink2 font-medium">{sourceInfo.name}</p>
                {visibleDicts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {visibleDicts.map(d => (
                      <span key={d.id} className="text-tiny bg-parch3 border border-bdr/40 rounded-full px-2 py-0.5 text-ink2">
                        {d.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-tiny text-muted mt-1">
                  License: {sourceInfo.license}
                  {sourceInfo.requiresAttribution && (
                    <span className="inline-flex items-center gap-1 ml-2 text-amber">
                      <ShieldAlert className="w-3 h-3" /> {t('reader.attributionRequired', 'Attribution required')}
                    </span>
                  )}
                </p>
              </div>
            );
          })()}

          {(aiWordInsight || isAiWordLoading) && (
            <div className="mb-10 p-5 rounded-2xl bg-blue/5 border border-blue/10">
              <div className="flex items-center gap-2 mb-3 text-blue font-bold text-sm">
                {isAiWordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {t('reader.aiInsights', 'AI Insights')}
              </div>
              <p className="text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap">{aiWordInsight}</p>
            </div>
          )}

          {!aiWordInsight && !isAiWordLoading && (
            <button
               onClick={() => handleAiWordExplain()}
              className="w-full mb-10 py-3 border border-blue/20 bg-blue/5 rounded-xl font-bold text-blue text-sm flex items-center justify-center gap-2 hover:bg-blue/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t('reader.askAiAboutWord', 'Ask AI About This Word')}
            </button>
          )}

          {morphologyDisplay && (
            <div className="mb-10">
              <div className="eyebrow mb-4 flex items-center justify-between text-ink">
                <span>{t('reader.morphology', 'Morphology')}</span>
                <div className="flex items-center gap-2">
                  {exampleSentences.length > 0 && (
                    <span className="text-tiny text-muted normal-case tracking-normal font-normal">
                      {exampleSentences.length}× in corpus
                    </span>
                  )}
                  {morphologyDisplay.confidence !== undefined && (
                    <span className="text-tiny text-muted normal-case tracking-normal">
                      {Math.round(morphologyDisplay.confidence * 100)}% conf.
                    </span>
                  )}
                </div>
              </div>

              {morphologyDisplay.missing ? (
                <div className="p-4 bg-parch/40 border border-dashed border-bdr rounded-xl text-[13px] text-muted">
                  {t('reader.morphologyMissing', 'Morphological parsing is not available for this token yet.')}
                </div>
              ) : (
                <>
                  {/* POS badge + compact summary + source */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {(() => {
                      const posEntry = morphologyDisplay.expanded.find(e => e.label === 'Part of speech');
                      return posEntry ? (
                        <span className="inline-flex items-center px-3 py-1.5 bg-ink/90 text-parch2 rounded-lg text-[11px] font-bold tracking-wider uppercase">
                          {posEntry.value}
                        </span>
                      ) : null;
                    })()}
                    <span
                      className="inline-block px-3 py-1.5 bg-parch3/60 text-ink border border-bdr/60 rounded-full text-[12px] font-medium"
                      title={morphologyDisplay.expanded
                        .map(({ value }) => {
                          const ref = getGrammarReference(value);
                          return ref ? `${value}: ${ref.short}` : value;
                        })
                        .join(' · ')}
                    >
                      {morphologyDisplay.compact}
                    </span>
                    {morphologyDisplay.source && (
                      <span className="text-[11px] text-muted bg-white border border-bdr/40 rounded-full px-2.5 py-0.5">
                        {morphologyDisplay.source}
                      </span>
                    )}
                  </div>

                  {/* Feature rows with category color dots */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {morphologyDisplay.expanded
                      .filter(({ label }) => label !== 'Part of speech')
                      .map(({ label, value }) => {
                        const ref = getGrammarReference(value);
                        const category = ref?.category ?? (LABEL_TO_CATEGORY[label] ?? 'other');
                        const dotColor = CATEGORY_DOT_COLORS[category] ?? '#9CA3AF';
                        return (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-3 px-3 py-2 bg-parch text-ink2 border border-bdr/50 rounded-lg text-[12px] relative cursor-default"
                            onMouseEnter={(e) => {
                              if (ref) {
                                setHoveredTag(value);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTagPopoverPos({ x: rect.left + rect.width / 2, y: rect.top });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredTag(null);
                              setTagPopoverPos(null);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: dotColor }}
                              />
                              <span className="opacity-60 lowercase">{label}</span>
                            </div>
                            <span className="font-bold text-right">{value}</span>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
              {hoveredTag && tagPopoverPos && (() => {
                const ref = getGrammarReference(hoveredTag);
                if (!ref) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="fixed z-50 pointer-events-none"
                    style={{ left: tagPopoverPos.x, top: tagPopoverPos.y - 8, transform: 'translateX(-50%) translateY(-100%)' }}
                  >
                    <div className="bg-ink text-parch2 text-[11px] font-sans px-2.5 py-1.5 rounded-lg shadow-xl max-w-[220px] leading-relaxed">
                      <span className="font-bold">{hoveredTag}</span>
                      <span className="opacity-80"> — {ref.short}</span>
                      {ref.long && (
                        <div className="mt-1 opacity-70 leading-snug">{ref.long}</div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-ink rotate-45 mx-auto -mt-1" />
                  </motion.div>
                );
              })()}
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
                <span>{t('reader.exampleSentences', 'Example Sentences')}</span>
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
          <div className="mb-6">
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

          {/* Save to Research Notebook */}
          <div className="mb-8">
            <div className="eyebrow mb-3 text-ink flex items-center gap-2">
              <BookMarked className="w-3 h-3 opacity-60" />
              {t('reader.saveToNotebook', "Save to Notebook")}
            </div>
            <textarea
              className="w-full h-20 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
              placeholder={t('reader.researchNotePlaceholder', "Research note, grammar observation, translation insight…")}
              value={researchNoteInput}
              onChange={(e) => setResearchNoteInput(e.target.value)}
            />
            <button
              onClick={handleSaveResearchNote}
              disabled={!researchNoteInput.trim() || isSavingNote}
              className={cn(
                "mt-2 w-full py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all",
                noteSaved
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-parch2 border border-bdr text-ink2 hover:border-blue/40 hover:text-blue disabled:opacity-40",
              )}
            >
              {isSavingNote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : noteSaved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <BookMarked className="w-3.5 h-3.5" />
              )}
              {noteSaved ? t('reader.noteSaved', "Saved!") : t('reader.saveNote', "Save Note")}
            </button>
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
