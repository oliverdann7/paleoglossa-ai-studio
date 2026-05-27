import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CorpusDB } from '../data/corpus.js';
import { corpusService } from '../lib/services/corpusService.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { useReaderState } from '../lib/contexts/ReaderContext.js';
import { WordState } from '../lib/constants/wordStates.js';
import type { ReaderToken, ReaderSentence, ReaderChapter } from '../types/reader.js';
import type { ReadingContext } from '../lib/review/readingContext.js';
import { ReaderTutorial } from '../components/reader/ReaderTutorial.js';
import { LexDrawerPanel } from '../components/reader/LexDrawerPanel.js';
import { SentenceAnalysisPanel } from '../components/reader/SentenceAnalysisPanel.js';
import { ReaderProgressHeader } from '../components/reader/ReaderProgressHeader.js';
import { ReaderToolbar } from '../components/reader/ReaderToolbar.js';
import { ReaderAudioBar } from '../components/reader/ReaderAudioBar.js';
import { ReaderBottomNav } from '../components/reader/ReaderBottomNav.js';
import { ReadingPane } from '../components/reader/ReadingPane.js';
import { SentenceNoteModal } from '../components/reader/SentenceNoteModal.js';
import { WordContextMenu } from '../components/reader/WordContextMenu.js';
import { ReaderSkeleton } from '../components/Skeleton.js';
import { getTransliteration } from '../lib/transliterate.js';
import { useReaderTTS } from '../lib/hooks/useReaderTTS.js';

import { AIClient } from '../lib/services/aiClient.js';
import { ImportService } from '../lib/services/importService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useToast } from '../lib/hooks/useToast.js';
import { STORAGE_KEYS } from '../lib/constants/storage.js';
import { OfflineService } from '../lib/services/offlineService.js';
import { useOnlineStatus } from '../lib/hooks/useOnlineStatus.js';
import { BookmarkService } from '../lib/services/bookmarkService.js';
import { recordMilestone } from '../lib/hooks/useBeginnerProgress.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

export const Reader = () => {
  const { textId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const { canAccessLanguage } = useSubscription();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const onBack = useCallback(() => navigate('/app/library'), [navigate]);

  const [localText, setLocalText] = useState<any>(null);
  const [firestoreChapters, setFirestoreChapters] = useState<ReaderChapter[]>([]);

  useEffect(() => {
    if (!textId) return;

    const tObj = CorpusDB.getText(textId);
    if (!tObj && (textId.startsWith('import-') || textId.startsWith('imp-'))) {
      ImportService.getImports(user ? user.uid : null).then((imports) => {
        const match = imports.find((item: any) => item.id === textId);
        if (match) setLocalText(match);
      });
    } else if (tObj) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalText(tObj);
    } else {
      // Try Firestore-sourced corpus text (added via ingest script, not in static bundle)
      corpusService.getText(textId).then((meta) => {
        if (meta) {
          setLocalText({
            id: meta.id,
            title: meta.title,
            languageId: meta.languageId,
            language: meta.languageId,
            sectionsPreview: meta.sectionsPreview,
            _firestoreCorpus: true,
          });
        }
      });
    }

    // Fallback to offline payload if no text loaded
    if (!tObj) {
      const offline = OfflineService.getOfflinePayload(textId);
      if (offline) {
        setLocalText({
          id: offline.textId,
          title: offline.title,
          language: offline.languageId,
          languageId: offline.languageId,
          sentences: offline.sentences,
          sourceType: offline.source === 'import' ? 'paste' : 'corpus',
          sourceKind: offline.source === 'import' ? 'import' : 'corpus',
          isOffline: true,
        });
      }
    }
  }, [textId, user]);

  // Load sections from API for Firestore-sourced corpus texts
  useEffect(() => {
    if (!localText?._firestoreCorpus || !localText.sectionsPreview?.length) return;
    let cancelled = false;
    const loadSections = async () => {
      const chapters: ReaderChapter[] = [];
      for (const preview of localText.sectionsPreview) {
        const section = await corpusService.getSection(localText.id, preview.id);
        if (cancelled) return;
        if (!section) {
          chapters.push({ id: preview.id, title: preview.label, sentences: [], translation: '' });
          continue;
        }
        const sentences: ReaderSentence[] = (section.sentences ?? []).map((s: any) => ({
          id: s.id,
          translation: s.translation,
          parallel: s.translation,
          tokens: (s.tokens ?? []).map((tok: any) => ({
            id: tok.id,
            text: tok.surface,
            lemma: tok.lemma,
            gloss: tok.gloss,
            morphology:
              typeof tok.morphology === 'string'
                ? tok.morphology
                : tok.morphology?.partOfSpeech || undefined,
            morphologyRaw:
              typeof tok.morphology === 'object' && tok.morphology !== null
                ? Object.fromEntries(
                    Object.entries(tok.morphology).filter(
                      ([, v]) => typeof v === 'string' && v && v !== 'unknown'
                    )
                  )
                : undefined,
            translit:
              tok.transliteration ||
              getTransliteration(tok.surface, localText.languageId || '', tok.normalized),
            punctBefore: tok.punctBefore || '',
            punctAfter: tok.punctAfter !== undefined ? tok.punctAfter : ' ',
          })),
        }));
        chapters.push({
          id: section.id,
          title: section.label,
          sentences,
          translation: sentences
            .map((s) => s.translation)
            .filter(Boolean)
            .join(' '),
        });
      }
      if (!cancelled) {
        setFirestoreChapters(chapters);
      }
    };
    loadSections();
    return () => {
      cancelled = true;
    };
  }, [localText]);

  const text = localText;

  const {
    knowledge,
    knowledgeVersion,
    setWordState,
    markPageAsSeen,
    stats,
    addReadWords,
  // incrementReadingTime,
    setWordNote,
    incrementEncounter,
    updateGloss,
    getWordInfo,
    fetchTextProgress,
    saveTextProgress,
    setWordContext,
    vocabLimit,
  } = useKnowledge(activeLanguageId);

  // Wrapped version that shows a paywall toast when the vocab limit blocks a save.
  // Returns true when the save was accepted/queued, false when blocked by the limit.
  // Pass this to child components (LexDrawerPanel) instead of the raw setWordState.
  const setWordStateWithFeedback = useCallback(
    (
      lemma: string,
      state: WordState,
      languageId: string,
      context?: string,
      extra?: Partial<ReadingContext>
    ): boolean => {
      const saved = setWordState(lemma, state, languageId, context, extra);
      if (!saved) {
        addToast(
          `You've reached the ${vocabLimit.limit}-word save limit for this language. Upgrade for unlimited saves.`,
          'info'
        );
        return false;
      }
      return true;
    },
    [setWordState, addToast, vocabLimit.limit]
  );

  const { settings } = useSettings();

  const isOnline = useOnlineStatus();
  const [selectedWord, setSelectedWord] = useState<
    (ReaderToken & { sentenceText?: string; sentenceIndex?: number }) | null
  >(null);
  const [selectedSentence, setSelectedSentence] = useState<{ text: string; id: string } | null>(
    null
  );
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) ? 0 : 1;
  });
  const [isTranslatingId, setIsTranslatingId] = useState<string | null>(null);
  const [aiTranslations, setAiTranslations] = useState<Record<string, string>>({});
  const [noteModal, setNoteModal] = useState<{ sentence: any; sentenceIndex: number } | null>(null);
  const [notedSentenceIds, setNotedSentenceIds] = useState<Set<string>>(new Set());
  const [bookmarkedSentenceIds, setBookmarkedSentenceIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    token: ReaderToken;
    x: number;
    y: number;
  } | null>(null);

  const {
    state: {
      display: {
        mode: readingMode,
        displayMode,
        showTranslit,
        showParallel,
        maskKnown,
        interlinearMode,
      },
      navigation: { currentChapterIndex, currentSentenceIndex, currentScrollPage, scrollProgress },
      audio: { isPlaying, position: audioPos, speed: audioSpeed, loopSentence, loopWord },
    },
    setMode,
    setDisplayMode,
    setShowTranslit,
    setShowParallel,
    setMaskKnown,
    setInterlinearMode,
    setChapterIndex,
    setSentenceIndex,
    setScrollPage,
    setScrollProgress,
    goToNextSentence,
    goToPrevSentence,
    goToNextChapter,
    togglePlay,
    setPlayState,
    setAudioSpeed,
    toggleLoopSentence,
    toggleLoopWord,
    setAudioPosition,
    setTextId,
  } = useReaderState();

  // Track text changes to sync navigation state and init display from settings
  const prevTextIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!textId) return;
    if (textId !== prevTextIdRef.current) {
      prevTextIdRef.current = textId;
      setTextId(textId);
      setShowTranslit(settings.showTranslit);
      setShowParallel(settings.showParallelDefault);
      setInterlinearMode(settings.interlinearMode ?? false);
      setAudioSpeed(settings.audioSpeedDefault ?? 1.0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId]);

  // Record the firstTextOpened beginner-hub milestone once the language is known.
  useEffect(() => {
    const langId = localText?.languageId || localText?.language;
    if (langId) recordMilestone(langId, 'firstTextOpened');
  }, [localText?.languageId, localText?.language]);

  const onAskTutor = () =>
    navigate(`/app/tutor?textId=${textId || ''}&sentenceIndex=${currentSentenceIndex || 0}`);

  // Refs for progress saving to avoid re-renders
  const scrollProgressRef = useRef(0);
  const currentSentenceIndexRef = useRef(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!textId) return;
    const loadProgress = async () => {
      const prog = await fetchTextProgress(textId);
      if (prog) {
        if (readingMode === 'scroll' && prog.lastPosition) {
          const scrollContainer = document.getElementById('reading-area-scroll');
          if (scrollContainer) {
            scrollContainer.scrollTop =
              (prog.lastPosition / 100) *
              (scrollContainer.scrollHeight - scrollContainer.clientHeight);
          }
        } else if (readingMode === 'page' && prog.sentenceIndex !== undefined) {
          setSentenceIndex(prog.sentenceIndex);
        }
      }
    };
    loadProgress();
    // setSentenceIndex is a stable dispatch from useReducer — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId, fetchTextProgress, readingMode]);

  // Save progress periodically - use refs for stability
  useEffect(() => {
    if (!textId) return;

    // Initialize refs from state
    scrollProgressRef.current = scrollProgress;
    currentSentenceIndexRef.current = currentSentenceIndex;

    // Stable interval that reads from refs
    saveIntervalRef.current = setInterval(() => {
      saveTextProgress({
        textId,
        lastPosition: scrollProgressRef.current,
        sentenceIndex: currentSentenceIndexRef.current,
        completed: scrollProgressRef.current > 95,
        lastReadAt: new Date().toISOString(),
      });
    }, 5000);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
    // scrollProgress and currentSentenceIndex are read via refs inside the interval — adding them
    // as deps would reset the 5 s interval on every scroll tick, defeating the batching purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId, saveTextProgress]);

  // Clear word insight when word changes
  const handleAITranslate = useCallback(
    async (sentenceId: string, sentenceTokens: any[]) => {
      if (isTranslatingId === sentenceId || aiTranslations[sentenceId]) return;
      setIsTranslatingId(sentenceId);

      try {
        const languageName = text?.language || 'ancient language';
        const result = await AIClient.translateSentence(
          languageName,
          sentenceTokens.map((t) => t.text).join(' ')
        );
        setAiTranslations((prev) => ({ ...prev, [sentenceId]: result }));
      } catch (error) {
        console.error(error);
        setAiTranslations((prev) => ({ ...prev, [sentenceId]: t('reader.errorTranslating') }));
      } finally {
        setIsTranslatingId(null);
      }
    },
    [text, t, setIsTranslatingId, setAiTranslations, isTranslatingId, aiTranslations]
  );

  useEffect(() => {
    if (readingMode === 'page') {
      const el = document.getElementById(`sentence-${currentSentenceIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSentenceIndex, readingMode]);

  const chapters: ReaderChapter[] = useMemo(() => {
    const textId = text?.id;

    // Firestore-sourced corpus text — sections loaded asynchronously
    if (text?._firestoreCorpus) {
      return firestoreChapters;
    }

    if (typeof textId === 'string' && CorpusDB.getText(textId)) {
      const realText = CorpusDB.getText(textId);
      if (!realText?.sectionsPreview) return [];

      return realText.sectionsPreview.map((preview: any) => {
        const section = CorpusDB.getSection(preview.id);
        if (!section)
          return {
            id: preview.id,
            title: preview.label,
            sentences: [],
            translation: '',
          };

        const sentences: ReaderSentence[] = section.sentences.map((s: any) => ({
          id: s.id,
          translation: s.translation,
          parallel: s.translation,
          tokens: s.tokens.map((t: any) => ({
            id: t.id,
            text: t.surface,
            lemma: t.lemma,
            gloss: t.gloss,
            morphology:
              typeof t.morphology === 'string'
                ? t.morphology
                : t.morphology?.partOfSpeech || undefined,
            translit:
              t.transliteration ||
              getTransliteration(t.surface, realText?.language || '', t.normalized),
            punctBefore: t.punctBefore || '',
            punctAfter: t.punctAfter !== undefined ? t.punctAfter : ' ',
          })),
        }));

        return {
          id: section.id,
          title: section.label,
          sentences,
          translation: section.sentences
            .map((s: any) => s.translation)
            .filter(Boolean)
            .join(' '),
        };
      });
    }

    const textSentences = text?.sentences as any[] | undefined;
    if (textSentences) {
      return [
        {
          id: 'imported-section-1',
          title: t('reader.fullText'),
          sentences: textSentences.map((s: any, i: number) => ({
            id: `import-sent-${i}`,
            translation: s.translation || t('reader.noTranslation'),
            parallel: s.translation || t('reader.noParallelText'),
            tokens: s.tokens.map((tok: any, j: number) => ({
              id: `import-token-${i}-${j}`,
              text: tok.text,
              lemma: tok.lemma || tok.text,
              normalized: tok.normalized || tok.text,
              translit:
                tok.transliteration ||
                getTransliteration(tok.text, text.languageId || '', tok.normalized),
              gloss: tok.gloss || undefined,
              pos: tok.pos || undefined,
              morphology:
                typeof tok.morphology === 'object' && tok.morphology !== null
                  ? (tok.morphology.partOfSpeech || tok.pos || '')
                  : tok.morphology || tok.pos || '',
              morphologyRaw:
                typeof tok.morphology === 'object' && tok.morphology !== null
                  ? Object.fromEntries(
                      Object.entries(tok.morphology).filter(
                        ([, v]) => typeof v === 'string' && v && v !== 'unknown'
                      )
                    )
                  : undefined,
              confidence: tok.confidence ?? undefined,
              punctBefore: '',
              punctAfter:
                tok.type === 'whitespace'
                  ? ' '
                  : tok.type === 'punctuation'
                    ? ''
                    : s.tokens[j + 1]?.type === 'whitespace'
                      ? ''
                      : '',
            })),
          })),
          translation: textSentences
            .map((s: any) => s.translation)
            .filter(Boolean)
            .join(' '),
        },
      ];
    }

    const textContent = text?.content as string | undefined;
    if (textContent) {
      const sentencesRaw = textContent.split(/(?<=[.?!])\s+/).filter(Boolean);
      const sentences: ReaderSentence[] = sentencesRaw.map((sRaw: string, i: number) => {
        const rawTokens = sRaw.split(/\s+/).filter(Boolean);
        return {
          id: `import-sent-${i}`,
          translation: t('reader.noTranslation'),
          parallel: t('reader.noParallelText'),
          tokens: rawTokens.map((token: string, j: number) => ({
            id: `import-token-${i}-${j}`,
            text: token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''),
            lemma: token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase(),
            translit: getTransliteration(
              token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''),
              text.languageId || text.language || ''
            ),
            gloss: t('reader.userImportedWord'),
            punctAfter: token.match(/[.,/#!$%^&*;:{}=\-_`~()]/) ? token.slice(-1) + ' ' : ' ',
          })),
        };
      });
      return [
        {
          id: 'imported-section-1',
          title: t('reader.fullText'),
          sentences,
          translation: t('reader.noTranslation'),
        },
      ];
    }
    return [];
  }, [text, t, firestoreChapters]);

  // Determine what kind of content is being read so UI can be honest about it
  const sourceKind: 'import' | 'sample' | 'partial' | 'complete' = useMemo(() => {
    if (!text) return 'complete';
    if (
      typeof textId === 'string' &&
      (textId.startsWith('import-') || textId.startsWith('imp-')) &&
      !CorpusDB.getText(textId)
    )
      return 'import';
    if (text.isSample) return 'sample';
    if (text.isComplete || text.sourceStatus === 'complete') return 'complete';
    return 'partial';
  }, [text, textId]);

  const chapter = useMemo(
    () =>
      chapters[currentChapterIndex] ||
      chapters[0] || { id: '', title: '', sentences: [] as ReaderSentence[], translation: '' },
    [chapters, currentChapterIndex]
  );

  const SENTENCES_PER_PAGE = 30;

  const knownPercent = useMemo(() => {
    const allTokens = (chapter?.sentences ?? []).flatMap((s: ReaderSentence) => s.tokens ?? []);
    const contentTokens = allTokens.filter(
      (t: ReaderToken) => t.type !== 'punctuation' && t.type !== 'whitespace'
    );
    if (contentTokens.length === 0) return null;
    const knownCount = contentTokens.filter((t: ReaderToken) => {
      const info = getWordInfo(t.lemma || t.text);
      return info.state === WordState.KNOWN || info.state === WordState.FAMILIAR;
    }).length;
    return Math.round((knownCount / contentTokens.length) * 100);
    // knowledgeVersion triggers re-evaluation when any word state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, knowledgeVersion, getWordInfo]);

  // Estimated reading time: unknown words take ~8s, known words ~1.5s
  const readingTimeMinutes = useMemo(() => {
    const allTokens = (chapter?.sentences ?? []).flatMap((s: ReaderSentence) => s.tokens ?? []);
    const content = allTokens.filter(
      (t: ReaderToken) => t.type !== 'punctuation' && t.type !== 'whitespace'
    );
    if (content.length === 0) return null;
    const unknown = content.filter((t: ReaderToken) => {
      const info = getWordInfo(t.lemma || t.text);
      return info.state === WordState.NEW || info.state === WordState.SEEN;
    }).length;
    const known = content.length - unknown;
    const seconds = unknown * 8 + known * 1.5;
    return Math.max(1, Math.round(seconds / 60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, knowledgeVersion, getWordInfo]);

  const handleReviewText = useCallback(() => {
    const lemmas = Array.from(
      new Set(
        chapters
          .flatMap((ch) => ch.sentences)
          .flatMap((s: ReaderSentence) => s.tokens)
          .filter(
            (t: ReaderToken) =>
              t.type !== 'punctuation' && t.type !== 'whitespace' && (t.lemma || t.text)
          )
          .map((t: ReaderToken) => t.lemma || t.text)
      )
    );
    sessionStorage.setItem('reviewTextFilter', JSON.stringify({ textId: textId || '', lemmas }));
    navigate('/app/review?filter=text');
  }, [chapters, textId, navigate]);

  // Derive effective display flags from the active displayMode
  const effectiveShowParallel = displayMode === 'parallel' ? true : showParallel;
  const effectiveInterlinear = displayMode === 'interlinear' ? true : interlinearMode;

  const totalPages = Math.ceil((chapter?.sentences?.length || 0) / SENTENCES_PER_PAGE);
  const sentenceSliceStart = readingMode === 'page' ? 0 : currentScrollPage * SENTENCES_PER_PAGE;
  const sentenceSliceEnd =
    readingMode === 'page'
      ? chapter?.sentences?.length
      : (currentScrollPage + 1) * SENTENCES_PER_PAGE;

  const displayedSentences =
    readingMode === 'page'
      ? chapter?.sentences
      : chapter?.sentences?.slice(sentenceSliceStart, sentenceSliceEnd);

  useEffect(() => {
    setScrollPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex]);

  const isHebrewFont = [
    'hbo',
    'Biblical Hebrew',
    'arc',
    'Aramaic',
    'syr',
    'Syriac',
    'Hebrew',
  ].includes(text?.language || '');
  const isRtl =
    text?.direction === 'rtl' ||
    [
      'hbo',
      'Biblical Hebrew',
      'arc',
      'Aramaic',
      'syr',
      'Syriac',
      'egy',
      'Egyptian Hieroglyphs',
    ].includes(text?.language || '');
  const currentLanguageId = text?.language || text?.languageId || 'unknown';

  // Track reader opened when text + chapters are first available
  const prevTrackedTextRef = useRef<string | null>(null);
  useEffect(() => {
    if (!textId || !text || chapters.length === 0) return;
    if (prevTrackedTextRef.current === textId) return;
    prevTrackedTextRef.current = textId;
    const allTokens = chapters.flatMap((ch) => ch.sentences).flatMap((s) => s.tokens || []);
    const contentTokens = allTokens.filter((t) => t.type !== 'punctuation' && t.type !== 'whitespace');
    trackEvent(ANALYTICS_EVENTS.READER_OPENED, {
      languageId: currentLanguageId,
      textId,
      sourceKind: sourceKind as string,
      analysisStatus: (text as any)?.analysisStatus || undefined,
      wordCount: contentTokens.length,
      knownPercent,
    });
    if (!localStorage.getItem('paleoglossa_first_text')) {
      localStorage.setItem('paleoglossa_first_text', '1');
      trackEvent(ANALYTICS_EVENTS.FIRST_TEXT_OPENED, { languageId: currentLanguageId, textId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId, text, chapters]);

  const exampleSentences = useMemo(() => {
    if (!selectedWord) return [];
    const currentSentenceId = chapter?.sentences?.[currentSentenceIndex]?.id;
    return CorpusDB.findSentencesWithLemma(selectedWord.lemma, currentSentenceId, 3);
  }, [selectedWord, chapter, currentSentenceIndex]);

  // Update refs when state changes so interval callbacks read fresh values without re-subscribing
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    currentSentenceIndexRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  const { audioProgress, highlightedSentenceIdx, highlightedTokenIdx } = useReaderTTS({
    sentences: chapter?.sentences ?? [],
    currentLanguageId,
    audioSpeed,
    isPlaying,
    loopSentence,
    loopWord,
    audioPos,
    readingMode,
    onSetAudioPosition: setAudioPosition,
    onSetPlayState: setPlayState,
    onSetSentenceIndex: setSentenceIndex,
  });

  // Tutorial logic
  useEffect(() => {
    if (tutorialStep === 0) return;

    if (tutorialStep === 1 && selectedWord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTutorialStep(2);
    } else if (
      tutorialStep === 2 &&
      selectedWord &&
      getWordInfo(selectedWord.lemma) &&
      getWordInfo(selectedWord.lemma)?.state === WordState.KNOWN
    ) {
      setTutorialStep(3);
    } else if (tutorialStep === 3 && scrollProgress > 80) {
      setTutorialStep(4);
    }
  }, [tutorialStep, selectedWord, knowledgeVersion, getWordInfo, scrollProgress]);

  const dismissTutorial = () => {
    setTutorialStep(0);
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  };

  useEffect(() => {
    if (readingMode === 'page') return;

    let rafId: number | null = null;
    let lastUpdate = 0;
    const THROTTLE_MS = 100;

    const handleScroll = (e: any) => {
      const now = Date.now();
      if (now - lastUpdate < THROTTLE_MS) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          lastUpdate = Date.now();
          const el = e.target;
          const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
          setScrollProgress(progress || 0);
        });
      } else {
        lastUpdate = now;
        const el = e.target;
        const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
        setScrollProgress(progress || 0);
      }
    };

    const scrollContainer = document.getElementById('reading-area-scroll');
    if (scrollContainer)
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
    };
    // setScrollProgress is a stable state setter — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, readingMode]);

  const handleMarkPageKnown = useCallback(
    (andAdvance: boolean = true) => {
      let tokensToMark: ReaderToken[];
      if (readingMode === 'page') {
        tokensToMark = chapter.sentences[currentSentenceIndex]?.tokens || [];
      } else {
        tokensToMark = displayedSentences?.flatMap((s: ReaderSentence) => s.tokens) || [];
      }

      const validTokens = tokensToMark.filter((t) => t.lemma && t.lemma.length > 0);

      if (validTokens.length > 0) {
        const tokensWithLang = validTokens.map((t) => ({
          ...t,
          languageId: currentLanguageId,
        }));
        markPageAsSeen(tokensWithLang);
      }

      addReadWords(validTokens.length);
      addToast(t('reader.wordsMarkedKnown', { count: validTokens.length }), 'success');

      if (!andAdvance) return;

      if (readingMode === 'page') {
        if (currentSentenceIndex < chapter.sentences.length - 1) {
          setSentenceIndex(currentSentenceIndex + 1);
          setAudioPosition(currentSentenceIndex + 1, 0);
          setSelectedWord(null);
        } else if (currentChapterIndex < chapters.length - 1) {
          goToNextChapter(chapters.length);
          setAudioPosition(0, 0);
          setSelectedWord(null);
        }
      } else {
        if (currentScrollPage < totalPages - 1) {
          setScrollPage(currentScrollPage + 1);
          document.getElementById('reading-area-scroll')?.scrollTo(0, 0);
          setSelectedWord(null);
        } else if (currentChapterIndex < chapters.length - 1) {
          goToNextChapter(chapters.length);
          setSelectedWord(null);
        }
      }
    },
    [
      readingMode,
      chapter,
      currentSentenceIndex,
      displayedSentences,
      currentLanguageId,
      markPageAsSeen,
      addReadWords,
      addToast,
      t,
      totalPages,
      chapters.length,
      currentChapterIndex,
      currentScrollPage,
      goToNextChapter,
      setSentenceIndex,
      setScrollPage,
      setAudioPosition,
    ]
  );

  const handleSwipe = useCallback(() => {
    if (settings.swipePageMovesToKnown ?? true) {
      handleMarkPageKnown(true);
    } else {
      if (readingMode === 'page') {
        if (currentSentenceIndex < chapter.sentences.length - 1) {
          goToNextSentence(chapter.sentences.length);
        } else if (currentChapterIndex < chapters.length - 1) {
          goToNextChapter(chapters.length);
        }
      } else {
        if (currentScrollPage < totalPages - 1) {
          setScrollPage(currentScrollPage + 1);
          document.getElementById('reading-area-scroll')?.scrollTo(0, 0);
        } else if (currentChapterIndex < chapters.length - 1) {
          goToNextChapter(chapters.length);
        }
      }
    }
  }, [
    settings.swipePageMovesToKnown,
    handleMarkPageKnown,
    readingMode,
    currentSentenceIndex,
    chapter.sentences.length,
    currentChapterIndex,
    chapters.length,
    currentScrollPage,
    totalPages,
    goToNextSentence,
    goToNextChapter,
    setScrollPage,
  ]);

  const handleNextPage = useCallback(() => {
    setScrollPage(Math.min(currentScrollPage + 1, totalPages - 1));
    document.getElementById('reading-area-scroll')?.scrollTo(0, 0);
  }, [currentScrollPage, totalPages, setScrollPage]);

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setChapterIndex(currentChapterIndex + 1);
    }
  }, [currentChapterIndex, chapters.length, setChapterIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcuts for selected word
      if (selectedWord) {
        /** Helper: attempt to set state; show paywall toast and keep panel open if blocked. */
        const trySetState = (state: WordState) => {
          const saved = setWordState(selectedWord.lemma, state, currentLanguageId);
          if (saved) {
            setSelectedWord(null);
          } else {
            addToast(
              `You've reached the ${vocabLimit.limit}-word save limit for this language. Upgrade for unlimited saves.`,
              'info'
            );
          }
        };
        if (e.key === '1') {
          trySetState(WordState.LEARNING);
          return;
        }
        if (e.key === '2') {
          trySetState(WordState.FAMILIAR);
          return;
        }
        if (e.key === '3') {
          trySetState(WordState.KNOWN);
          return;
        }
        if (e.key === '4') {
          trySetState(WordState.IGNORED);
          return;
        }
        if (e.key === 'k' || e.key === 'K') {
          trySetState(WordState.KNOWN);
          return;
        }
        if (e.key === 'l' || e.key === 'L') {
          trySetState(WordState.LEARNING);
          return;
        }
        if (e.key === 'i' || e.key === 'I') {
          trySetState(WordState.IGNORED);
          return;
        }
        if (e.key === 'Escape') {
          setSelectedWord(null);
          return;
        }
      }

      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        toggleLoopSentence();
        return;
      }
      if (['!', '@', '#', '$', '%'].includes(e.key)) {
        const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
        setAudioSpeed(speeds[['!', '@', '#', '$', '%'].indexOf(e.key)]);
        return;
      }

      if (!selectedWord) {
        if (e.key === 'ArrowRight') {
          if (settings.swipePageMovesToKnown ?? true) {
            handleMarkPageKnown(true);
          } else if (readingMode === 'page') {
            if (currentSentenceIndex < chapter.sentences.length - 1) {
              goToNextSentence(chapter.sentences.length);
              setAudioPosition(currentSentenceIndex + 1, 0);
            } else if (currentChapterIndex < chapters.length - 1) {
              goToNextChapter(chapters.length);
              setAudioPosition(0, 0);
            }
          } else {
            if (currentScrollPage < totalPages - 1) {
              setScrollPage(currentScrollPage + 1);
              document.getElementById('reading-area-scroll')?.scrollTo(0, 0);
            } else if (currentChapterIndex < chapters.length - 1) {
              goToNextChapter(chapters.length);
            }
          }
        } else if (e.key === 'ArrowLeft') {
          if (readingMode === 'page') {
            if (currentSentenceIndex > 0) {
              goToPrevSentence();
              setAudioPosition(currentSentenceIndex - 1, 0);
            } else if (currentChapterIndex > 0) {
              const prevChapter = chapters[currentChapterIndex - 1];
              setChapterIndex(currentChapterIndex - 1);
              setSentenceIndex(prevChapter.sentences.length - 1);
              setAudioPosition(prevChapter.sentences.length - 1, 0);
            }
          } else {
            if (currentScrollPage > 0) {
              setScrollPage(currentScrollPage - 1);
              document.getElementById('reading-area-scroll')?.scrollTo(0, 0);
            } else if (currentChapterIndex > 0) {
              const prevChapter = chapters[currentChapterIndex - 1];
              const prevTotalPages = Math.ceil(
                (prevChapter?.sentences?.length || 0) / SENTENCES_PER_PAGE
              );
              setChapterIndex(currentChapterIndex - 1);
              setScrollPage(prevTotalPages - 1);
            }
          }
        }
        return;
      }

      if (e.key === 'Escape') setSelectedWord(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedWord,
    chapter,
    readingMode,
    currentSentenceIndex,
    chapters,
    currentChapterIndex,
    setWordState,
    addToast,
    vocabLimit.limit,
    currentLanguageId,
    currentScrollPage,
    totalPages,
    handleMarkPageKnown,
    settings,
  ]);

  const handleWordClick = useCallback(
    (token: ReaderToken, sentenceText: string, sentenceIndex: number) => {
      setSelectedSentence(null);
      setSelectedWord({ ...token, sentenceText, sentenceIndex });
      incrementEncounter(token.lemma, currentLanguageId);
      setWordContext(token.lemma, sentenceText, currentLanguageId);
      if (readingMode === 'page') setSentenceIndex(sentenceIndex);
      trackEvent(ANALYTICS_EVENTS.WORD_CLICKED, {
        languageId: currentLanguageId,
        lemmaLength: token.lemma?.length || token.text?.length || 0,
        hasGloss: !!token.gloss,
        hasMorphology: !!token.morphology || !!token.morphologyRaw,
        currentState: getWordInfo(token.lemma || token.text).state,
        textId,
      });
    },
    [incrementEncounter, setWordContext, currentLanguageId, readingMode, setSentenceIndex, getWordInfo, textId]
  );

  const handleWordContextMenu = useCallback((token: ReaderToken, x: number, y: number) => {
    setContextMenu({ token, x, y });
  }, []);

  const handleAnalyzeSentence = useCallback((sentence: { text: string; id: string }) => {
    setSelectedWord(null);
    setSelectedSentence(sentence);
  }, []);

  const handleSentenceNote = useCallback((sentence: any, sentenceIndex: number) => {
    setNoteModal({ sentence, sentenceIndex });
  }, []);

  const handleNoteSaved = useCallback((sentenceId: string) => {
    setNotedSentenceIds((prev) => new Set([...prev, sentenceId]));
  }, []);

  const handleSavePhrase = useCallback(
    (sentence: ReaderSentence) => {
      const phrase = sentence.tokens.map((tk: ReaderToken) => tk.text).join(' ');
      const saved = setWordState(phrase, WordState.LEARNING, currentLanguageId);
      if (!saved) {
        addToast(
          `You've reached the ${vocabLimit.limit}-word save limit for this language. Upgrade for unlimited saves.`,
          'info'
        );
        return;
      }
      if (sentence.translation || aiTranslations[sentence.id]) {
        updateGloss(
          phrase,
          aiTranslations[sentence.id] || sentence.translation || '',
          currentLanguageId
        );
      }
      addToast(t('reader.sentenceSaved'), 'success');
    },
    [setWordState, updateGloss, currentLanguageId, aiTranslations, addToast, t, vocabLimit.limit]
  );

  const handleBookmarkSentence = useCallback(
    async (sentence: ReaderSentence, sentenceIndex: number) => {
      if (!user) {
        addToast('Sign in to bookmark sentences.', 'info');
        return;
      }
      // Toggle: remove if already bookmarked
      if (bookmarkedSentenceIds.has(sentence.id)) {
        setBookmarkedSentenceIds((prev) => {
          const next = new Set(prev);
          next.delete(sentence.id);
          return next;
        });
        addToast('Bookmark removed.', 'info');
        return;
      }
      const sentenceText = sentence.tokens.map((tk: ReaderToken) => tk.text).join(' ');
      try {
        await BookmarkService.create({
          textId: textId || 'unknown',
          textTitle: text?.title || undefined,
          sentenceText,
          sentenceIndex,
          languageId: currentLanguageId,
        });
        setBookmarkedSentenceIds((prev) => new Set([...prev, sentence.id]));
        addToast('Sentence bookmarked!', 'success');
      } catch {
        addToast('Could not save bookmark.', 'error');
      }
    },
    [user, textId, text, currentLanguageId, bookmarkedSentenceIds, addToast]
  );

  if (!text || chapters.length === 0 || !chapter) {
    return <ReaderSkeleton />;
  }

  if (!canAccessLanguage(currentLanguageId)) {
    return <Navigate to="/app/subscription" state={{ locked: currentLanguageId }} replace />;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-ink font-sans overflow-hidden">
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-white text-[12px] font-bold text-center py-1 px-4">
          You're offline — reading from cached data. Word state changes will sync when reconnected.
        </div>
      )}

      <div
        className="flex-1 flex flex-col relative z-20 overflow-hidden"
        style={!isOnline ? { paddingTop: 28 } : undefined}
      >
      <ReaderProgressHeader
        readToday={stats.readToday}
        dailyGoalWords={settings.dailyGoalWords}
        onBack={() => navigate('/app/library')}
        text={text}
        sourceType={text?.sourceType === 'import' ? 'paste' : undefined}
      />

        <ReaderToolbar
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onChangeChapter={setChapterIndex}
          showTranslit={showTranslit}
          onToggleTranslit={() => setShowTranslit(!showTranslit)}
          showParallel={effectiveShowParallel}
          onToggleParallel={() => setShowParallel(!showParallel)}
          maskKnown={maskKnown}
          onToggleMaskKnown={() => setMaskKnown(!maskKnown)}
          readingMode={readingMode}
          onChangeReadingMode={setMode}
          interlinearMode={effectiveInterlinear}
          onToggleInterlinear={() => setInterlinearMode(!interlinearMode)}
          knownPercent={knownPercent}
          displayMode={displayMode ?? 'scholar'}
          onChangeDisplayMode={setDisplayMode}
          readingTimeMinutes={readingTimeMinutes}
          onReviewText={handleReviewText}
        />
        <button
          onClick={onAskTutor}
          className="fixed bottom-24 right-6 z-30 w-12 h-12 bg-ink text-parch rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
          title={t('reader.askTutor', 'Ask Tutor')}
        >
          <span className="text-[18px] font-serif font-bold">T</span>
        </button>
        <button
          onClick={() => {
            const id = textId || '';
            if (OfflineService.isOfflineText(id)) {
              OfflineService.removeOfflineText(id);
              addToast(t('reader.removedOffline', 'Removed from offline'), 'success');
            } else {
              OfflineService.setOfflineText(id, text?.title || 'Text', currentLanguageId);
              const chapterSentences = chapter?.sentences || [];
              if (chapterSentences.length > 0) {
                OfflineService.saveOfflinePayload(id, {
                  textId: id,
                  title: text?.title || 'Text',
                  languageId: currentLanguageId,
                  sentences: chapterSentences.map((s: any) => ({
                    tokens:
                      s.tokens?.map((t: any) => ({
                        text: t.text || t.surface || '',
                        lemma: t.lemma || '',
                        gloss: t.gloss,
                        type: t.type || 'word',
                        transliteration: t.transliteration,
                        pos: t.pos,
                        confidence: t.confidence,
                      })) || [],
                    translation: s.translation || null,
                  })),
                  source:
                    textId?.startsWith('import-') || textId?.startsWith('imp-')
                      ? 'import'
                      : 'corpus',
                });
              }
              addToast(t('reader.availableOffline', 'Available offline'), 'success');
            }
          }}
          className="fixed bottom-40 right-6 z-30 w-12 h-12 bg-parch3 text-ink rounded-full shadow-lg flex items-center justify-center hover:bg-blue hover:text-white transition-all active:scale-95 border border-bdr"
          title={
            OfflineService.isOfflineText(textId || '')
              ? t('reader.removeOffline', 'Remove offline')
              : t('reader.saveOffline', 'Save offline')
          }
          disabled={!isOnline && !OfflineService.isOfflineText(textId || '')}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 2v10m0 0l-3-3m3 3l3-3M4 19h16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <ReaderAudioBar
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          audioProgress={audioProgress}
          audioSpeed={audioSpeed}
          onChangeSpeed={() => {
            const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
            const next = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
            setAudioSpeed(next);
          }}
          loopSentence={loopSentence}
          onToggleLoopSentence={toggleLoopSentence}
          loopWord={loopWord}
          onToggleLoopWord={toggleLoopWord}
        />

        <ReadingPane
          sentences={displayedSentences || []}
          readingMode={readingMode}
          currentSentenceIndex={currentSentenceIndex}
          fontSize={settings.fontSize}
          highlightIntensity={settings.highlightIntensity}
          getWordInfo={getWordInfo}
          knowledgeVersion={knowledgeVersion}
          selectedWordId={selectedWord?.id}
          showTranslit={showTranslit}
          showParallel={effectiveShowParallel}
          maskKnown={maskKnown}
          isHebrewFont={isHebrewFont}
          isRtl={isRtl}
          audioPos={audioPos}
          highlightedSentenceIdx={highlightedSentenceIdx}
          highlightedTokenIdx={highlightedTokenIdx}
          aiTranslations={aiTranslations}
          translatingId={isTranslatingId}
          sourceKind={sourceKind}
          textTitle={text?.title || text?.canonicalRef || ''}
          sectionLabel={chapter?.title || ''}
          hasMorphology={!!text?.hasMorphology}
          sentenceCount={chapter?.sentences?.length ?? 0}
          analysisStatus={text?.analysisStatus}
          showGlossTooltip={settings.showGlossTooltip}
          glossTooltipForKnown={settings.glossTooltipForKnown}
          interlinearMode={effectiveInterlinear}
          displayMode={displayMode ?? 'scholar'}
          onWordClick={handleWordClick}
          onSentenceNote={handleSentenceNote}
          notedSentenceIds={notedSentenceIds}
          onBookmarkSentence={handleBookmarkSentence}
          bookmarkedSentenceIds={bookmarkedSentenceIds}
          onWordContextMenu={handleWordContextMenu}
          onAITranslate={handleAITranslate}
          onSavePhrase={handleSavePhrase}
          onAnalyzeSentence={handleAnalyzeSentence}
          onMarkPageKnown={handleMarkPageKnown}
          onSwipe={handleSwipe}
          onNextPage={handleNextPage}
          onNextChapter={handleNextChapter}
          onBackToLibrary={onBack}
          currentScrollPage={currentScrollPage}
          totalPages={totalPages}
          currentChapterIndex={currentChapterIndex}
          totalChapters={chapters.length}
          sentenceSliceStart={sentenceSliceStart}
        />

        <ReaderBottomNav
          scrollProgress={scrollProgress}
          readingMode={readingMode}
          sourceKind={sourceKind}
          currentSentenceIndex={currentSentenceIndex}
          totalSentences={chapter.sentences.length}
          canGoPrev={
            readingMode === 'page'
              ? !(currentChapterIndex === 0 && currentSentenceIndex === 0)
              : !(currentChapterIndex === 0 && currentScrollPage === 0)
          }
          canGoNext={
            readingMode === 'page'
              ? !(
                  currentChapterIndex === chapters.length - 1 &&
                  currentSentenceIndex === chapter.sentences.length - 1
                )
              : !(
                  currentChapterIndex === chapters.length - 1 &&
                  currentScrollPage === totalPages - 1
                )
          }
          onPrev={() => {
            if (readingMode === 'page') {
              if (currentSentenceIndex > 0) {
                goToPrevSentence();
              } else if (currentChapterIndex > 0) {
                const prevChapter = chapters[currentChapterIndex - 1];
                setChapterIndex(currentChapterIndex - 1);
                setSentenceIndex(prevChapter.sentences.length - 1);
              }
            } else {
              if (currentScrollPage > 0) {
                setScrollPage(currentScrollPage - 1);
              } else if (currentChapterIndex > 0) {
                const prevChapter = chapters[currentChapterIndex - 1];
                const prevTotalPages = Math.ceil(
                  (prevChapter?.sentences?.length || 0) / SENTENCES_PER_PAGE
                );
                setChapterIndex(currentChapterIndex - 1);
                setScrollPage(prevTotalPages - 1);
              }
            }
          }}
          onNext={() => {
            if (settings.swipePageMovesToKnown ?? true) {
              handleMarkPageKnown(true);
            } else if (readingMode === 'page') {
              if (currentSentenceIndex < chapter.sentences.length - 1) {
                goToNextSentence(chapter.sentences.length);
              } else if (currentChapterIndex < chapters.length - 1) {
                goToNextChapter(chapters.length);
              }
            } else {
              if (currentScrollPage < totalPages - 1) {
                setScrollPage(currentScrollPage + 1);
              } else if (currentChapterIndex < chapters.length - 1) {
                goToNextChapter(chapters.length);
              }
            }
          }}
          onMarkKnown={handleMarkPageKnown}
        />
      </div>

      {/* 380px Reading Panel - word analysis or sentence analysis */}
      {selectedSentence ? (
        <SentenceAnalysisPanel
          sentence={selectedSentence}
          language={currentLanguageId}
          mode="scholar"
          onClose={() => setSelectedSentence(null)}
          isRtl={isRtl}
          textId={textId}
          sentenceIndex={currentSentenceIndex}
        />
      ) : (
        <LexDrawerPanel
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          knowledge={knowledge}
          setWordState={setWordStateWithFeedback}
          setWordNote={setWordNote}
          updateGloss={updateGloss}
          getWordInfo={getWordInfo}
          showTranslit={showTranslit}
          isHebrewFont={isHebrewFont}
          isRtl={isRtl}
          textLanguageId={currentLanguageId}
          exampleSentences={exampleSentences}
          playTTS={(textStr, lang) => {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(textStr);
            const langMap: Record<string, string> = {
              grc: 'el-GR',
              'grc-koine': 'el-GR',
              hbo: 'he-IL',
              lat: 'it-IT',
              syr: 'ar-SA',
              arc: 'ar-SA',
              cop: 'el-GR',
              akk: 'ar-SA',
              san: 'hi-IN',
            };
            u.lang = langMap[lang] || 'en-US';
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          }}
          text={text}
          currentSentenceIndex={currentSentenceIndex}
        />
      )}

      <ReaderTutorial currentStep={tutorialStep} onDismiss={dismissTutorial} />

      {noteModal && (
        <SentenceNoteModal
          sentence={noteModal.sentence}
          sentenceIndex={noteModal.sentenceIndex}
          textId={textId ?? ''}
          languageId={currentLanguageId}
          onSaved={handleNoteSaved}
          onClose={() => setNoteModal(null)}
        />
      )}

      {contextMenu && (
        <WordContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lemma={contextMenu.token.lemma}
          surface={contextMenu.token.text}
          currentState={getWordInfo(contextMenu.token.lemma).state}
          onSetState={(state) => {
            const saved = setWordState(contextMenu.token.lemma, state, currentLanguageId);
            if (!saved) {
              addToast(
                `You've reached the ${vocabLimit.limit}-word save limit for this language. Upgrade for unlimited saves.`,
                'info'
              );
            }
          }}
          onOpenDictionary={(lemma) => {
            navigate(
              `/app/lemma/${encodeURIComponent(currentLanguageId)}/${encodeURIComponent(lemma)}`
            );
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
