import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  BookMarked,
  Volume2,
  Sparkles,
  Loader2,
  Repeat,
  ShieldCheck,
  ShieldAlert,
  Check,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  MessageCircle,
  X,
} from 'lucide-react';
import { DiscussionPanel } from './DiscussionPanel.js';
import { ScholarAnnotations } from './ScholarAnnotations.js';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  WordState,
  normalizeWordState,
  safeStateColors,
  safeStateLabel,
} from '@/lib/constants/wordStates';
import { AIClient } from '@/lib/services/aiClient';
import {
  lookupWiktionary,
  summarizeWiktionary,
  type WiktionaryLookupResult,
} from '@/lib/services/wiktionaryService';
import {
  lookupLexicon,
  type LexiconLookupResult,
} from '@/lib/services/lexiconService';
import { ParadigmModal } from './ParadigmModal.js';
import { ATTRIBUTIONS, CorpusDB } from '@/data/corpus';
import { MorphologyService } from '@/lib/services/morphologyService';
import { getLanguageDisplayName } from '@/lib/constants/languages';
import {
  findDictionaryEntry,
  getDefinitionWithFallbacks,
  LookupResult,
  GLOSS_SOURCES,
} from '@/lib/data/dictionary';
import { useSettings } from '@/lib/hooks/useSettings';
import { getGrammarReference } from '@/lib/grammar/references';
import { useNotebook } from '@/lib/hooks/useNotebook';
import { normalizeLemmaKey } from '@/lib/utils/lemmaUtils';
import { frequencyTier } from '@/lib/utils/frequencyTier';
import { isUsefulGloss } from '@/lib/utils/lexicalHelper';
import { getSourceTrust, type SourceTrustInfo } from '@/lib/utils/sourceTrust';
import type { ReaderToken } from '@/types/reader';
import type { WordInfo, KnowledgeMap } from '@/lib/services/vocabularyService';
import type { ReadingContext } from '@/lib/review/readingContext';
import { buildReadingContext } from '@/lib/review/readingContext';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

type SelectedWord = ReaderToken & { sentenceText?: string; sentenceIndex?: number };

interface LemmaSentenceEntry {
  sentence: {
    tokens: (Pick<ReaderToken, 'lemma' | 'punctBefore' | 'punctAfter'> & { surface?: string })[];
    translation?: string;
  };
  sectionId: string;
  textId: string;
}

type CacheEntry = { value: string };

interface LexDrawerPanelProps {
  selectedWord: SelectedWord | null;
  setSelectedWord: (w: SelectedWord | null) => void;
  knowledge: KnowledgeMap;
  setWordState: (
    lemma: string,
    state: WordState,
    languageId: string,
    context?: string,
    extra?: Partial<ReadingContext>
  ) => boolean | void;
  setWordNote: (lemma: string, notes: string) => void;
  updateGloss: (lemma: string, gloss: string, languageId: string) => void;
  getWordInfo: (lemma: string) => WordInfo;
  showTranslit: boolean;
  isHebrewFont: boolean;
  isRtl: boolean;
  textLanguageId: string;
  exampleSentences: LemmaSentenceEntry[];
  playTTS: (text: string, lang: string) => void;
  text?: { corpusId?: string; language?: string; id?: string; analysisStatus?: string };
  currentSentenceIndex?: number;
}

const getDictionaryPath = (lemma: string, langId: string) =>
  `/app/dictionary/${encodeURIComponent(langId)}/${encodeURIComponent(lemma)}`;

interface ExternalDictLink {
  label: string;
  url: string;
}
function getExternalDictLinks(lemma: string, langId: string): ExternalDictLink[] {
  if (!lemma) return [];
  const enc = encodeURIComponent(lemma);
  const grcLangs = new Set(['grc', 'grc-koine', 'grc-class', 'cop']);
  const latLangs = new Set(['lat', 'lat-class', 'lat-med']);
  const hebLangs = new Set(['hbo', 'arc', 'Biblical Hebrew']);
  if (grcLangs.has(langId)) {
    return [
      { label: 'Perseus', url: `https://www.perseus.tufts.edu/hopper/morph?l=${enc}&la=greek` },
      { label: 'Logeion', url: `https://logeion.uchicago.edu/${enc}` },
    ];
  }
  if (latLangs.has(langId)) {
    return [
      { label: 'Logeion', url: `https://logeion.uchicago.edu/${enc}` },
      { label: 'Perseus', url: `https://www.perseus.tufts.edu/hopper/morph?l=${enc}&la=la` },
    ];
  }
  if (hebLangs.has(langId)) {
    return [
      {
        label: 'Blue Letter Bible',
        url: `https://www.blueletterbible.org/lexicon/h${enc}/kjv/wlc/0-1/`,
      },
    ];
  }
  return [{ label: 'Wiktionary', url: `https://en.wiktionary.org/wiki/${enc}` }];
}

const LABEL_TO_CATEGORY: Record<string, string> = {
  Case: 'case',
  Number: 'number',
  Gender: 'gender',
  Person: 'person',
  Tense: 'tense',
  Aspect: 'tense',
  Voice: 'voice',
  Mood: 'mood',
  Degree: 'degree',
  State: 'state',
  Stem: 'stem',
  Binyan: 'stem',
  Root: 'root',
  Declension: 'stem',
  Conjugation: 'stem',
  Pattern: 'stem',
  Construct: 'state',
  Emphatic: 'state',
  Status: 'state',
  Determinative: 'other',
  'Sign type': 'other',
  Logogram: 'other',
  'Raw parsing': 'other',
};

function SourceBadge({ trust }: { trust: SourceTrustInfo }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-bdr/40 bg-parch/60 px-2 py-0.5 text-[10px] font-medium leading-none">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: trust.dotColor }}
      />
      <span className={cn(trust.textColor)}>{trust.label}</span>
    </span>
  );
}

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

export const LexDrawerPanel = memo(({
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
  text,
  currentSentenceIndex,
}: LexDrawerPanelProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user } = useAuth();

  // Single source of truth for the language identifier used throughout this panel.
  const langId = text?.language || textLanguageId;

  const [isAiWordLoading, setIsAiWordLoading] = useState(false);
  const [aiWordInsight, setAiWordInsight] = useState<string | null>(null);
  const [isParadigmOpen, setIsParadigmOpen] = useState(false);

  const [aiFallbackGloss, setAiFallbackGloss] = useState<string | null>(null);
  const [wiktionaryResult, setWiktionaryResult] = useState<WiktionaryLookupResult | null>(null);
  const [isWiktionaryLoading, setIsWiktionaryLoading] = useState(false);
  const wiktionaryLemmaRef = useRef<string | null>(null);
  const [lexiconResult, setLexiconResult] = useState<LexiconLookupResult | null>(null);
  const [isLexiconLoading, setIsLexiconLoading] = useState(false);
  const lexiconLemmaRef = useRef<string | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [cacheEntry, setCacheEntry] = useState<CacheEntry | null>(null);

  const [isAiMorphLoading, setIsAiMorphLoading] = useState(false);
  const [aiMorphResult, setAiMorphResult] = useState<Record<string, string> | null>(null);

  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [tagPopoverPos, setTagPopoverPos] = useState<{ x: number; y: number } | null>(null);

  const [researchNoteInput, setResearchNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const { saveNote, isSaving: isSavingNote } = useNotebook({ skipFetch: true });

  const [reviewAdded, setReviewAdded] = useState(false);
  const [glossSaved, setGlossSaved] = useState(false);
  const glossTimerRef = useRef<number>(0);
  const noteSavedTimerRef = useRef<number>(0);

  // Compute once per selected word — avoids 5+ getWordInfo calls in JSX
  const wordInfo = useMemo(
    () => (selectedWord ? getWordInfo(selectedWord.lemma) : null),
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
    const morphData = selectedWord.morphologyRaw || selectedWord.morphology;
    return MorphologyService.formatMorphologyForDisplay(langId, morphData, {
      source: sourceInfo?.name,
      confidence: selectedWord.confidence,
    });
  }, [selectedWord, sourceInfo?.name, langId]);

  /**
   * A description built from the token's own metadata (lemma, transliteration,
   * morphology, language). Always non-empty — used as the last-resort meaning
   * so the panel never shows "No definition available".
   */
  const descriptiveFallback = useMemo(() => {
    if (!selectedWord) return '';
    const langName = getLanguageDisplayName(langId) || langId;
    const lemma = selectedWord.lemma || selectedWord.text || '';
    const surface = selectedWord.text || '';
    const translit = selectedWord.translit || '';
    const morphology: Record<string, unknown> = selectedWord.morphologyRaw ?? {};
    const pos = ((morphology.partOfSpeech as string) || '').toLowerCase();

    const parts: string[] = [];
    if (lemma && surface && lemma !== surface) {
      parts.push(`${langName} word (lemma: ${lemma}`);
      if (translit) parts.push(`, transliterated ${translit}`);
      parts.push(').');
    } else {
      parts.push(`${langName} word${translit ? ` — transliterated ${translit}` : ''}.`);
    }

    if (pos && pos !== 'unknown') {
      parts.push(` Identified as a ${pos}.`);
    }

    const morphDetails: string[] = [];
    for (const key of [
      'tense',
      'voice',
      'mood',
      'case',
      'number',
      'gender',
      'person',
      'state',
      'stem',
    ] as const) {
      const v = morphology[key];
      if (typeof v === 'string' && v && v !== 'unknown') morphDetails.push(`${key}: ${v}`);
    }
    if (morphDetails.length > 0) {
      parts.push(` Morphology — ${morphDetails.join(', ')}.`);
    }

    return parts.join('').trim();
  }, [selectedWord, langId]);

  const handleFetchGloss = async () => {
    if (isAiWordLoading || !selectedWord) return;
    setIsAiWordLoading(true);
    try {
      const glossResult = await AIClient.getWordGloss(langId, selectedWord.text, selectedWord.lemma);
      const success = isUsefulGloss(glossResult);
      if (success) {
        setAiFallbackGloss(glossResult);
        await AIClient.saveGlossToCache(langId, selectedWord.lemma, selectedWord.text, glossResult);
      }
      trackEvent(ANALYTICS_EVENTS.AI_GLOSS_GENERATED, {
        languageId: langId,
        generationType: 'short-gloss',
        success,
      });
    } catch (error) {
      console.error(error);
      // Leave aiFallbackGloss null so the descriptive fallback renders.
      setAiFallbackGloss(null);
    } finally {
      setIsAiWordLoading(false);
    }
  };

  const handleFetchExplanation = async () => {
    if (isAiWordLoading || !selectedWord) return;
    setIsAiWordLoading(true);
    setAiWordInsight('');
    try {
      const explanation = await AIClient.explainWord(langId, selectedWord.text, selectedWord.lemma);
      setAiWordInsight(explanation);
    } catch (error) {
      console.error(error);
      setAiWordInsight(t('reader.failedInsights', 'Failed to fetch insights.'));
    } finally {
      setIsAiWordLoading(false);
    }
  };

  const handleFetchAIMorphology = async () => {
    if (isAiMorphLoading || !selectedWord) return;
    setIsAiMorphLoading(true);
    try {
      const result = await AIClient.getAIMorphology(langId, selectedWord.text, selectedWord.lemma);
      setAiMorphResult(Object.keys(result).length > 0 ? result : null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiMorphLoading(false);
    }
  };

  // Format AI-generated morphology through the same pipeline as corpus morphology
  const aiMorphologyDisplay = useMemo(() => {
    if (!aiMorphResult || !selectedWord) return null;
    return MorphologyService.formatMorphologyForDisplay(langId, aiMorphResult, {
      source: 'AI Generated',
      confidence: undefined,
    });
  }, [aiMorphResult, selectedWord, langId]);

  const definitionLookup = useMemo(() => {
    if (!selectedWord) return null;
    const userGloss = wordInfo?.userGloss;
    if (userGloss) {
      return { definition: userGloss, source: GLOSS_SOURCES.USER_GLOSS } as LookupResult;
    }
    const dictResult = getDefinitionWithFallbacks(selectedWord.lemma, langId);
    if (dictResult) return dictResult;
    if (selectedWord.gloss) {
      return { definition: selectedWord.gloss, source: GLOSS_SOURCES.TOKEN_GLOSS } as LookupResult;
    }
    return null;
  }, [selectedWord, wordInfo?.userGloss, langId]);

  const wordFrequency = useMemo(() => {
    const lemma = selectedWord?.lemma;
    if (!lemma) return null;
    const entry = findDictionaryEntry(lemma, langId);
    return entry?.frequency ?? null;
  }, [selectedWord, langId]);

  // Reset AI / Wiktionary / cache state whenever the selected word changes.
  useEffect(() => {
    setAiFallbackGloss(null); // eslint-disable-line react-hooks/set-state-in-effect
    setWiktionaryResult(null);
    setIsWiktionaryLoading(false);
    wiktionaryLemmaRef.current = null;
    setLexiconResult(null);
    setIsLexiconLoading(false);
    lexiconLemmaRef.current = null;
    setCacheEntry(null);
    setIsCacheLoading(false);
    setAiMorphResult(null);
    setIsAiMorphLoading(false);
  }, [selectedWord?.lemma]);

  // Hit Wiktionary first when no local lexicon entry exists — it's free,
  // CORS-enabled, and covers every language in the corpus.
  useEffect(() => {
    if (!selectedWord || definitionLookup) return;
    if (wiktionaryLemmaRef.current === selectedWord.lemma) return;
    const currentLemma = selectedWord.lemma;
    wiktionaryLemmaRef.current = currentLemma;
    setIsWiktionaryLoading(true);
    (async () => {
      const result = await lookupWiktionary(currentLemma, langId);
      if (wiktionaryLemmaRef.current !== currentLemma) return;
      setWiktionaryResult(result);
      setIsWiktionaryLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord?.lemma, !!definitionLookup, langId]);

  // After Wiktionary finishes with no result, try Logeion (Greek/Latin) or Sefaria (Hebrew).
  useEffect(() => {
    if (!selectedWord || definitionLookup || wiktionaryResult) return;
    if (isWiktionaryLoading) return; // wait for wiktionary to finish
    if (lexiconLemmaRef.current === selectedWord.lemma) return;
    const currentLemma = selectedWord.lemma;
    lexiconLemmaRef.current = currentLemma;
    setIsLexiconLoading(true);
    (async () => {
      const result = await lookupLexicon(currentLemma, langId);
      if (lexiconLemmaRef.current !== currentLemma) return;
      setLexiconResult(result);
      setIsLexiconLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord?.lemma, !!definitionLookup, !!wiktionaryResult, isWiktionaryLoading, langId]);

  // Automatically fetch from server cache or AI if no lexicon definition is available
  useEffect(() => {
    if (!selectedWord || definitionLookup || wiktionaryResult || lexiconResult) return;
    if (isCacheLoading || cacheEntry) return;

    const currentLemma = selectedWord.lemma;
    let isCancelled = false;

    (async () => {
      setIsCacheLoading(true);
      const entry = await AIClient.fetchCachedGloss(langId, currentLemma);
      if (isCancelled) return;
      if (entry) {
        setCacheEntry(entry);
        trackEvent(ANALYTICS_EVENTS.AI_GLOSS_CACHE_HIT, { languageId: langId, cacheType: 'short-gloss' });
      } else {
        trackEvent(ANALYTICS_EVENTS.AI_GLOSS_CACHE_MISS, { languageId: langId, cacheType: 'short-gloss' });
      }
      setIsCacheLoading(false);
    })();

    return () => { isCancelled = true; };
  }, [selectedWord, definitionLookup, wiktionaryResult, lexiconResult, langId, isCacheLoading, cacheEntry]);

  // Reset research note fields when the selected word changes
  useEffect(() => {
    setResearchNoteInput(''); // eslint-disable-line react-hooks/set-state-in-effect
    setNoteSaved(false);
    setReviewAdded(false);
    setGlossSaved(false);
    if (glossTimerRef.current) {
      clearTimeout(glossTimerRef.current);
      glossTimerRef.current = 0;
    }
  }, [selectedWord?.lemma]);

  const handleSaveResearchNote = async () => {
    const trimmed = researchNoteInput.trim();
    if (!trimmed) return;
    await saveNote({
      content: trimmed,
      languageId: langId,
      textId: text?.id,
      token: selectedWord?.text,
      lemma: selectedWord?.lemma,
      source: 'word-analysis',
      tags: selectedWord?.lemma ? [selectedWord.lemma] : [],
    });
    setResearchNoteInput('');
    setNoteSaved(true);
    if (noteSavedTimerRef.current) clearTimeout(noteSavedTimerRef.current);
    noteSavedTimerRef.current = window.setTimeout(() => setNoteSaved(false), 2500);
  };

  if (!selectedWord) return <AnimatePresence />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        data-testid="lex-drawer"
        role="dialog"
        aria-label="Word Analysis"
        className="md:!translate-y-0 fixed md:relative bottom-0 left-0 w-full md:w-[380px] max-h-[70vh] md:max-h-none md:h-full bg-[#FEFAF4] border-t md:border-t-0 md:border-l border-bdr flex flex-col shrink-0 z-50 md:z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_40px_rgba(35,20,10,0.04)] rounded-t-3xl md:rounded-none"
      >
        <div className="md:hidden flex justify-center pt-2 pb-1 bg-[#FEFAF4] rounded-t-3xl">
          <div className="w-10 h-1 rounded-full bg-ink3/30" />
        </div>
        <div className="h-14 border-b border-bdr flex items-center justify-between px-4 bg-[#FEFAF4] shrink-0 rounded-t-3xl md:rounded-none">
          <div className="eyebrow">{t('reader.wordAnalysis', 'Word Analysis')}</div>
          <button
            onClick={() => setSelectedWord(null)}
            aria-label="Close word analysis"
            className="text-muted hover:text-ink p-2 rounded-full hover:bg-parch border border-transparent"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-safe">
          <div className="mb-8 md:mb-10 text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
              <h2
                className={cn(
                  'text-[42px] md:text-[48px] font-serif leading-tight text-ink',
                  isHebrewFont ? 'font-hebrew' : ''
                )}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <bdi>{selectedWord.text}</bdi>
              </h2>
              <button
                onClick={() => playTTS(selectedWord.text, text?.language || '')}
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
                From '<bdi className={isHebrewFont ? 'font-hebrew' : ''}>{selectedWord.lemma}</bdi>'
              </span>
              {wordFrequency !== null &&
                wordFrequency > 0 &&
                (() => {
                  const tier = frequencyTier(wordFrequency);
                  return (
                    <span
                      className={cn(
                        'text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full',
                        tier.color
                      )}
                    >
                      {tier.label} · {wordFrequency.toLocaleString()}×
                    </span>
                  );
                })()}
              {wordInfo?.srs?.nextReview &&
                (() => {
                  const due = new Date(wordInfo.srs.nextReview as string);
                  const now = new Date();
                  const diffDays = Math.round((due.getTime() - now.getTime()) / 86400000);
                  const label =
                    diffDays <= 0
                      ? 'Due for review'
                      : diffDays === 1
                        ? 'Review tomorrow'
                        : `Review in ${diffDays} days`;
                  return (
                    <span
                      className={cn(
                        'text-[11px] font-sans font-medium px-2 py-0.5 rounded-full',
                        diffDays <= 0 ? 'bg-amber/10 text-amber' : 'bg-parch3 text-ink3'
                      )}
                    >
                      {label}
                    </span>
                  );
                })()}
            </div>
          </div>

          {/* Your Knowledge */}
          <div className="mb-6">
            <div className="eyebrow mb-3 flex items-center justify-between text-ink">
              <span>{t('reader.yourKnowledge', 'Your Knowledge')}</span>
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
                const isActive =
                  normalizedWordState === state ||
                  (normalizedWordState === WordState.NEW &&
                    state === WordState.NEW &&
                    !knowledge[normalizeLemmaKey(selectedWord.lemma)]);

                return (
                  <button
                    key={state}
                    data-testid={`state-button-${state}`}
                    onClick={() => {
                      const extra = buildReadingContext(selectedWord, text);
                      const fromState = wordInfo?.state;
                      const saved = setWordState(
                        selectedWord.lemma,
                        state,
                        langId,
                        selectedWord.sentenceText,
                        extra
                      );
                      if (saved !== false) {
                        trackEvent(ANALYTICS_EVENTS.WORD_STATE_CHANGED, {
                          languageId: langId,
                          fromState,
                          toState: state,
                          lemmaLength: selectedWord.lemma?.length || 0,
                          textId: text?.id,
                        });
                        setSelectedWord(null);
                      }
                    }}
                    className={cn(
                      'flex-1 min-w-[70px] py-2 md:py-3 rounded-xl border flex flex-col items-center gap-1 transition-all',
                      isActive
                        ? 'shadow-sm transform scale-105'
                        : 'bg-white border-bdr/50 hover:bg-parch opacity-60 hover:opacity-100'
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
                          safeStateColors(state).border === 'transparent'
                            ? '#EAE5D9'
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
                  onClick={() => {
                    if (reviewAdded) return;
                    const extra = buildReadingContext(selectedWord, text);
                    const fromState = wordInfo?.state;
                    const saved = setWordState(
                      selectedWord.lemma,
                      WordState.LEARNING,
                      langId,
                      selectedWord.sentenceText,
                      extra
                    );
                    if (saved !== false) {
                      trackEvent(ANALYTICS_EVENTS.WORD_STATE_CHANGED, {
                        languageId: langId,
                        fromState,
                        toState: WordState.LEARNING,
                        lemmaLength: selectedWord.lemma?.length || 0,
                        textId: text?.id,
                      });
                      if (!wordInfo?.userGloss && definitionLookup?.definition) {
                        updateGloss(selectedWord.lemma, definitionLookup.definition, langId);
                      }
                      setReviewAdded(true);
                      setTimeout(() => {
                        setReviewAdded(false);
                        setSelectedWord(null);
                      }, 1800);
                    }
                  }}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all active:scale-[0.98]',
                  reviewAdded ? 'bg-green-600 text-white' : 'bg-blue text-white'
                )}
              >
                {reviewAdded ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('reader.addedToReview', 'Added to Review!')}
                  </>
                ) : (
                  <>
                    <BookMarked className="w-5 h-5" />
                    {t('reader.addToReview', 'Add to Review')}
                  </>
                )}
              </button>
            </div>
          </div>

          {(text?.analysisStatus === 'raw' || text?.analysisStatus === 'needs_ai') && (
            <div className="mb-5 p-3 bg-amber/8 border border-amber/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
              <p className="text-[12px] text-ink3 leading-relaxed">
                Raw text only — meanings and morphology are limited. Run AI analysis to complete
                this lesson.
              </p>
            </div>
          )}

          <div className="mb-10 p-5 bg-parch/40 border border-bdr/30 rounded-panel">
            <div className="eyebrow mb-4 flex items-center justify-between text-blue font-bold">
              <span>{t('reader.meaning', 'Meaning')}</span>
              <Link
                to={getDictionaryPath(selectedWord.lemma, langId)}
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
                      <div>{definitionLookup.definition}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <SourceBadge trust={getSourceTrust(definitionLookup.source)} />
                      </div>
                    </>
                  );
                }
                if (wiktionaryResult) {
                  const headline = summarizeWiktionary(wiktionaryResult);
                  const extra = wiktionaryResult.entries[0]?.definitions.slice(1, 3) || [];
                  return (
                    <>
                      <div className="text-ink">{headline}</div>
                      {extra.length > 0 && (
                        <ol className="mt-2 ml-5 list-decimal text-[15px] text-ink2 space-y-1">
                          {extra.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ol>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <SourceBadge trust={getSourceTrust('wiktionary')} />
                        <a
                          href={wiktionaryResult.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-muted hover:text-blue transition-colors flex items-center gap-0.5"
                        >
                          CC BY-SA
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </>
                  );
                }
                if (lexiconResult) {
                  return (
                    <>
                      <div className="text-ink">{lexiconResult.definition}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <SourceBadge trust={getSourceTrust(lexiconResult.source)} />
                        {lexiconResult.sourceUrl && (
                          <a
                            href={lexiconResult.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-muted hover:text-blue transition-colors flex items-center gap-0.5"
                          >
                            {lexiconResult.sourceLabel}
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </>
                  );
                }
                if (isWiktionaryLoading || isLexiconLoading || isCacheLoading) {
                  return (
                    <span className="text-muted italic text-[16px] inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin inline-block" />
                      {t('reader.lookingUp', 'Looking up definition…')}
                    </span>
                  );
                }
                if (aiFallbackGloss || cacheEntry) {
                  const content = cacheEntry ? cacheEntry.value : aiFallbackGloss;
                  const source = cacheEntry ? 'ai_cached' : 'ai_fallback';
                  return (
                    <>
                      <div>{content}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <SourceBadge trust={getSourceTrust(source)} />
                      </div>
                    </>
                  );
                }
                // No definition found — show compact metadata and action buttons.
                return (
                  <div>
                    {descriptiveFallback && (
                      <span className="block text-ink2 text-[14px] leading-snug mb-2">
                        {descriptiveFallback}
                      </span>
                    )}
                    <span className="block text-muted text-[13px] italic mb-2">
                      {t('reader.noDefinitionFound', 'No definition found in local lexicons.')}
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => { setAiFallbackGloss(null); handleFetchGloss(); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue/8 border border-blue/20 text-[12px] font-medium text-blue hover:bg-blue/15 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {t('reader.retryAi', 'Retry AI definition')}
                      </button>
                      <Link
                        to={getDictionaryPath(selectedWord.lemma, langId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-parch border border-bdr/40 text-[12px] font-medium text-ink3 hover:text-blue hover:border-blue/30 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        {t('reader.viewDictionary', 'Dictionary entry')}
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-4 pt-4 border-t border-bdr/20">
              <div className="text-tiny uppercase font-bold text-muted mb-2 tracking-widest flex items-center gap-2">
                <span>{t('reader.yourGloss', 'Your Gloss / Translation')}</span>
                {glossSaved && (
                  <span className="text-green-600 font-normal normal-case tracking-normal text-[10px] inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t('reader.saved', 'Saved')}
                  </span>
                )}
              </div>
                <input
                  type="text"
                  data-testid="gloss-input"
                  className="w-full bg-white border border-bdr/50 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none"
                  placeholder={t('reader.yourGlossPlaceholder', 'Enter your own gloss...')}

                value={wordInfo?.userGloss || ''}
                onChange={(e) => {
                  updateGloss(selectedWord.lemma, e.target.value, langId);
                  setGlossSaved(true);
                  trackEvent(ANALYTICS_EVENTS.WORD_GLOSS_SAVED, {
                    languageId: langId,
                    lemmaLength: selectedWord.lemma?.length || 0,
                    glossLength: e.target.value.length,
                    textId: text?.id,
                  });
                  if (!localStorage.getItem('paleoglossa_first_word')) {
                    localStorage.setItem('paleoglossa_first_word', '1');
                    trackEvent(ANALYTICS_EVENTS.FIRST_WORD_SAVED, { languageId: langId });
                  }
                  if (glossTimerRef.current) clearTimeout(glossTimerRef.current);
                  glossTimerRef.current = window.setTimeout(() => setGlossSaved(false), 2000);
                }}
              />
            </div>
          </div>

          {/* Data Source — compact */}
          {sourceInfo && (() => {
            const entry = findDictionaryEntry(selectedWord.lemma, langId);
            const visibleDicts = entry?.dictionaries
              ? entry.dictionaries.filter(
                  (d) => !settings.activeDictionaries || settings.activeDictionaries.length === 0 || settings.activeDictionaries.includes(d.id)
                )
              : [];
            return (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-ink3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-parch2/50 border border-bdr/30 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-jade" />
                  {sourceInfo.name}
                </span>
                {visibleDicts.slice(0, 2).map((d) => (
                  <span key={d.id} className="px-2 py-0.5 bg-parch3/50 border border-bdr/30 rounded-full">
                    {d.name}
                  </span>
                ))}
                <span className="opacity-60">
                  · {sourceInfo.license}
                </span>
                {sourceInfo.requiresAttribution && (
                  <span className="inline-flex items-center gap-1 text-amber">
                    <ShieldAlert className="w-3 h-3" /> Attribution req.
                  </span>
                )}
              </div>
            );
          })()}

          {/* Morphology */}
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

              {(() => {
                // Use AI morphology if corpus morph is missing but AI result is available
                const displayData = morphologyDisplay.missing ? aiMorphologyDisplay : morphologyDisplay;

                if (morphologyDisplay.missing && !aiMorphologyDisplay) {
                  // No morphology at all — show button to fetch from AI
                  return (
                    <div className="p-4 bg-parch/40 border border-dashed border-bdr rounded-xl">
                      <p className="text-[13px] text-muted mb-3">
                        {t(
                          'reader.morphologyMissing',
                          'Morphological parsing is not available for this token yet.'
                        )}
                      </p>
                      <button
                        onClick={handleFetchAIMorphology}
                        disabled={isAiMorphLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue/8 border border-blue/20 text-[12px] font-medium text-blue hover:bg-blue/15 transition-colors disabled:opacity-50"
                      >
                        {isAiMorphLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {isAiMorphLoading
                          ? t('reader.fetchingMorphology', 'Analyzing…')
                          : t('reader.getAiMorphology', 'Get AI Morphology')}
                      </button>
                    </div>
                  );
                }

                if (!displayData || displayData.missing) return null;

                return (
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {(() => {
                        const posEntry = displayData.expanded.find(
                          (e) => e.label === 'Part of speech'
                        );
                        return posEntry ? (
                          <span className="inline-flex items-center px-3 py-1.5 bg-ink/90 text-parch2 rounded-lg text-[11px] font-bold tracking-wider uppercase">
                            {posEntry.value}
                          </span>
                        ) : null;
                      })()}
                      <span
                        className="inline-block px-3 py-1.5 bg-parch3/60 text-ink border border-bdr/60 rounded-full text-[12px] font-medium"
                        title={displayData.expanded
                          .map(({ value }) => {
                            const ref = getGrammarReference(value);
                            return ref ? `${value}: ${ref.short}` : value;
                          })
                          .join(' · ')}
                      >
                        {displayData.compact}
                      </span>
                      {displayData.source && (
                        <span className="text-[11px] text-muted bg-white border border-bdr/40 rounded-full px-2.5 py-0.5">
                          {displayData.source}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {displayData.expanded
                        .filter(({ label }) => label !== 'Part of speech')
                        .map(({ label, value }) => {
                          const ref = getGrammarReference(value);
                          const category = ref?.category ?? LABEL_TO_CATEGORY[label] ?? 'other';
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
                );
              })()}
              {hoveredTag &&
                tagPopoverPos &&
                (() => {
                  const ref = getGrammarReference(hoveredTag);
                  if (!ref) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="fixed z-50 pointer-events-none"
                      style={{
                        left: tagPopoverPos.x,
                        top: tagPopoverPos.y - 8,
                        transform: 'translateX(-50%) translateY(-100%)',
                      }}
                    >
                      <div className="bg-ink text-parch2 text-[11px] font-sans px-2.5 py-1.5 rounded-lg shadow-xl max-w-[220px] leading-relaxed">
                        <span className="font-bold">{hoveredTag}</span>
                        <span className="opacity-80"> — {ref.short}</span>
                        {ref.long && <div className="mt-1 opacity-70 leading-snug">{ref.long}</div>}
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
                {t('reader.showFullParadigm', 'Show Full Paradigm')}
              </button>
            </div>
          )}

          {(aiWordInsight || isAiWordLoading) && (
            <div className="mb-10 p-5 rounded-2xl bg-blue/5 border border-blue/10">
              <div className="flex items-center gap-2 mb-3 text-blue font-bold text-sm">
                {isAiWordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {t('reader.aiInsights', 'AI Insights')}
              </div>
              <p className="text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap">
                {aiWordInsight}
              </p>
            </div>
          )}

          {!aiWordInsight && !isAiWordLoading && (
            <button
              onClick={handleFetchExplanation}
              className="w-full mb-4 py-3 border border-blue/20 bg-blue/5 rounded-xl font-bold text-blue text-sm flex items-center justify-center gap-2 hover:bg-blue/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t('reader.askAiAboutWord', 'Ask AI About This Word')}
            </button>
          )}

          {/* Discuss with Tutor */}
          <Link
            to={`/app/tutor?${new URLSearchParams({
              ...(text?.id ? { textId: text.id } : {}),
              prompt: `Explain the word "${selectedWord.text || selectedWord.lemma}" (lemma: ${selectedWord.lemma}) in this context${selectedWord.sentenceText ? `: "${selectedWord.sentenceText}"` : ''}. What is its morphology, why is this form used here, and how does it relate to the sentence's meaning?`,
            }).toString()}`}
            className="w-full mb-10 py-3 border border-gold/20 bg-gold/5 rounded-xl font-bold text-gold text-sm flex items-center justify-center gap-2 hover:bg-gold/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('reader.discussWithTutor', 'Discuss with Tutor')}
          </Link>

          {/* Contextual Examples */}
          {(wordInfo?.contexts?.length ?? 0) > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-4 text-ink flex items-center justify-between">
                <span>{t('reader.exampleSentences', 'Example Sentences')}</span>
                <Repeat className="w-3 h-3 opacity-50" />
              </div>
              <div className="space-y-3">
                {(wordInfo?.contexts || []).map((ctx: string, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-bdr/30 rounded-xl text-[13px] leading-relaxed italic text-ink/80 border-l-2 border-l-blue/30"
                  >
                    "{ctx}"
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Notes Section */}
          <div className="mb-6">
            <div className="eyebrow mb-3 text-ink">
              {t('reader.personalNotes', 'Personal Notes')}
            </div>
            <textarea
              className="w-full h-24 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
              placeholder={t('reader.addNote', 'Add a note about this word...')}
              value={wordInfo?.notes || ''}
              onChange={(e) => setWordNote(selectedWord.lemma, e.target.value)}
            />
          </div>

          {/* Save to Research Notebook */}
          <div className="mb-8">
            <div className="eyebrow mb-3 text-ink flex items-center gap-2">
              <BookMarked className="w-3 h-3 opacity-60" />
              {t('reader.saveToNotebook', 'Save to Notebook')}
            </div>
            <textarea
              className="w-full h-20 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
              placeholder={t(
                'reader.researchNotePlaceholder',
                'Research note, grammar observation, translation insight…'
              )}
              value={researchNoteInput}
              onChange={(e) => setResearchNoteInput(e.target.value)}
            />
            <button
              onClick={handleSaveResearchNote}
              disabled={!researchNoteInput.trim() || isSavingNote}
              className={cn(
                'mt-2 w-full py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all',
                noteSaved
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-parch2 border border-bdr text-ink2 hover:border-blue/40 hover:text-blue disabled:opacity-40'
              )}
            >
              {isSavingNote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : noteSaved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <BookMarked className="w-3.5 h-3.5" />
              )}
              {noteSaved ? t('reader.noteSaved', 'Saved!') : t('reader.saveNote', 'Save Note')}
            </button>
          </div>

          {/* Scholar Annotations */}
          {selectedWord?.lemma && (
            <ScholarAnnotations
              lemma={selectedWord.lemma}
              wordText={selectedWord.text || selectedWord.lemma}
              languageId={langId}
              currentUserId={user?.uid ?? null}
            />
          )}

          {/* Community Discussion */}
          {text?.id && (
            <DiscussionPanel
              textId={text.id}
              languageId={langId}
              sentenceIndex={selectedWord.sentenceIndex ?? currentSentenceIndex ?? 0}
              wordText={selectedWord.text}
              lemma={selectedWord.lemma}
              sentenceExcerpt={selectedWord.sentenceText?.slice(0, 120)}
            />
          )}

          {/* External scholarly resources */}
          {selectedWord.lemma &&
            (() => {
              const links = getExternalDictLinks(selectedWord.lemma, langId);
              if (links.length === 0) return null;
              return (
                <div className="mt-4 pt-4 border-t border-bdr/30">
                  <div className="eyebrow mb-3 text-ink3">External Resources</div>
                  <div className="flex flex-wrap gap-2">
                    {links.map((l) => (
                      <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bdr text-[12px] font-medium text-ink3 hover:text-blue hover:border-blue/40 transition-colors"
                      >
                        {l.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* Example sentences */}
          {exampleSentences.length > 0 && (
            <div className="mt-8 pt-8 border-t border-bdr/30">
              <div className="eyebrow mb-4 flex justify-between">
                <span>{t('reader.occurrences', 'Occurrences in Library')}</span>
                <span className="text-blue">
                  {exampleSentences.length} {t('reader.matches', 'matches')}
                </span>
              </div>
              <div className="space-y-4">
                {exampleSentences.map((ex, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-parch/30 rounded-xl border border-bdr/20 text-[14px]"
                    >
                      <p
                        className={cn(
                          'font-serif mb-2 text-ink2',
                          isHebrewFont ? 'font-hebrew' : ''
                        )}
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        {ex.sentence.tokens.map((t, i: number) => (
                          <span key={i}>
                            {t.punctBefore}
                            <span
                              className={cn(
                                t.lemma === selectedWord.lemma ? 'font-bold text-blue' : ''
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
        languageId={langId}
        word={selectedWord.text}
      />
    </AnimatePresence>
  );
});
