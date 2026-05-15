import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CorpusDB } from "../data/corpus";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useSettings } from "../lib/hooks/useSettings";
import { useReaderState } from "../lib/contexts/ReaderContext";
import { WordState } from "../lib/constants/wordStates";
import { ReaderTutorial } from "../components/reader/ReaderTutorial";
import { LexDrawerPanel } from "../components/reader/LexDrawerPanel";
import { ReaderProgressHeader } from "../components/reader/ReaderProgressHeader";
import { ReaderToolbar } from "../components/reader/ReaderToolbar";
import { ReaderAudioBar } from "../components/reader/ReaderAudioBar";
import { ReaderBottomNav } from "../components/reader/ReaderBottomNav";
import { ReadingPane } from "../components/reader/ReadingPane";
import { ReaderSkeleton } from "../components/Skeleton";
import { getTransliteration } from "../lib/transliterate";

import { AIClient } from "../lib/services/aiClient";
import { ImportService } from "../lib/services/importService";
import { useAuth } from "../lib/hooks/useAuth";
import { useSubscription } from "../lib/contexts/SubscriptionContext";
import { useToast } from "../lib/hooks/useToast";
import { STORAGE_KEYS } from "../lib/constants/storage";
import { OfflineService } from "../lib/services/offlineService";

// Module-level constant — avoids object recreation on every render
const TTS_LANG_MAP: Record<string, string> = {
  grc: "el-GR",
  "grc-koine": "el-GR",
  hbo: "he-IL",
  lat: "it-IT",
  syr: "ar-SA",
  arc: "ar-SA",
  cop: "el-GR",
  akk: "ar-SA",
  san: "hi-IN",
};

export const Reader = () => {
  const { textId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccessLanguage } = useSubscription();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const onBack = useCallback(() => navigate("/app/library"), [navigate]);

  const [localText, setLocalText] = useState<any>(null);
  
  useEffect(() => {
    if (!textId) return;
    
    const tObj = CorpusDB.getText(textId);
    if (!tObj && (textId.startsWith("import-") || textId.startsWith("imp-"))) {
      ImportService.getImports(user ? user.uid : null).then(imports => {
        const match = imports.find((item: any) => item.id === textId);
        if(match) setLocalText(match);
      });
    } else if (tObj) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalText(tObj);
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
  
  const text = localText;
  
  const {
    knowledge,
    knowledgeVersion,
    setWordState,
    stats,
    addReadWords,
    incrementReadingTime,
    setWordNote,
    incrementEncounter,
    updateGloss,
    getWordInfo,
    fetchTextProgress,
    saveTextProgress,
    setWordContext
  } = useKnowledge();
  const { settings } = useSettings();

  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) ? 0 : 1;
  });
  const [isTranslatingId, setIsTranslatingId] = useState<string | null>(null);
  const [aiTranslations, setAiTranslations] = useState<Record<string, string>>({});

  const {
    state: {
      display: { mode: readingMode, showTranslit, showParallel, maskKnown, interlinearMode },
      navigation: { currentChapterIndex, currentSentenceIndex, currentScrollPage, scrollProgress },
      audio: { isPlaying, position: audioPos, speed: audioSpeed, loopSentence, loopWord },
    },
    setMode, setShowTranslit, setShowParallel, setMaskKnown, setInterlinearMode,
    setChapterIndex, setSentenceIndex, setScrollPage, setScrollProgress,
    goToNextSentence, goToPrevSentence, goToNextChapter,
    togglePlay, setPlayState, setAudioSpeed, toggleLoopSentence, toggleLoopWord,
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

  const onAskTutor = () => navigate(`/app/tutor?textId=${textId || ''}&sentenceIndex=${currentSentenceIndex || 0}`);

  // Refs for progress saving to avoid re-renders
  const scrollProgressRef = useRef(0);
  const currentSentenceIndexRef = useRef(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!textId) return;
    const loadProgress = async () => {
      const prog = await fetchTextProgress(textId);
      if (prog) {
        if (readingMode === "scroll" && prog.lastPosition) {
          const scrollContainer = document.getElementById("reading-area-scroll");
          if (scrollContainer) {
            scrollContainer.scrollTop = (prog.lastPosition / 100) * (scrollContainer.scrollHeight - scrollContainer.clientHeight);
          }
        } else if (readingMode === "page" && prog.sentenceIndex !== undefined) {
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
        lastReadAt: new Date().toISOString()
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
  const handleAITranslate = useCallback(async (sentenceId: string, sentenceTokens: any[]) => {
    if (isTranslatingId === sentenceId || aiTranslations[sentenceId]) return;
    setIsTranslatingId(sentenceId);
    
    try {
      const languageName = text?.language || "ancient language";
      const result = await AIClient.translateSentence(languageName, sentenceTokens.map(t => t.text).join(" "));
      setAiTranslations(prev => ({ ...prev, [sentenceId]: result }));
    } catch (error) {
      console.error(error);
      setAiTranslations(prev => ({ ...prev, [sentenceId]: t("reader.errorTranslating") }));
    } finally {
      setIsTranslatingId(null);
    }
  }, [text, t, setIsTranslatingId, setAiTranslations, isTranslatingId, aiTranslations]);

  useEffect(() => {
    if (readingMode === "page") {
      const el = document.getElementById(`sentence-${currentSentenceIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSentenceIndex, readingMode]);

  const chapters = useMemo(() => {
    const textId = text?.id;

    if (typeof textId === "string" && CorpusDB.getText(textId)) {
      const realText = CorpusDB.getText(textId);
      return (
        realText?.sectionsPreview?.map((preview) => {
          const section = CorpusDB.getSection(preview.id);
          if (!section)
            return {
              id: preview.id,
              title: preview.label,
              sentences: [],
              translation: "",
            };

          const sentences = section.sentences.map((s: any) => ({
            id: s.id,
            translation: s.translation,
            parallel: s.translation, // Use actual translation as parallel text for demo purposes
            tokens: s.tokens.map((t: any) => ({
              id: t.id,
              text: t.surface,
              lemma: t.lemma,
              gloss: t.gloss,
              morphology: t.morphology,
              translit:
                t.transliteration ||
                getTransliteration(
                  t.surface,
                  realText?.language || "",
                  t.normalized,
                ),
              punctBefore: t.punctBefore || "",
              punctAfter: t.punctAfter !== undefined ? t.punctAfter : " ",
            })),
          }));

          return {
            id: section.id,
            title: section.label,
            sentences,
            translation: section.sentences
              .map((s) => s.translation)
              .filter(Boolean)
              .join(" "),
          };
        }) || []
      );
    } else if (text?.sentences) {
      // Logic for imported text using structured analysis
      return [
        {
          id: "imported-section-1",
          title: t("reader.fullText"),
          sentences: text.sentences.map((s: any, i: number) => ({
            id: `import-sent-${i}`,
            translation: s.translation || t("reader.noTranslation"),
            parallel: s.translation || t("reader.noParallelText"),
            tokens: s.tokens.map((t: any, j: number) => ({
              id: `import-token-${i}-${j}`,
              text: t.text,
              lemma: t.lemma || t.text,
              normalized: t.normalized || t.text,
              translit: t.transliteration || getTransliteration(t.text, text.languageId || "", t.normalized),
              gloss: t.gloss || t("reader.ancientWord"),
              morphology: t.pos || "",
              punctBefore: "",
              punctAfter: t.type === 'whitespace' ? " " : t.type === 'punctuation' ? "" : (s.tokens[j+1]?.type === 'whitespace' ? "" : ""),
            })),
          })),
          translation: text.sentences.map((s: any) => s.translation).filter(Boolean).join(" "),
        },
      ];
    } else if (text?.content) {
      // Fallback for legacy imports
      const sentencesRaw = text.content.split(/(?<=[.?!])\s+/).filter(Boolean);
      const sentences = sentencesRaw.map((sRaw: string, i: number) => {
        const rawTokens = sRaw.split(/\s+/).filter(Boolean);
        return {
          id: `import-sent-${i}`,
          translation: t("reader.noTranslation"),
          parallel: t("reader.noParallelText"),
          tokens: rawTokens.map((token: string, j: number) => ({
            id: `import-token-${i}-${j}`,
            text: token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
            lemma: token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase(),
            translit: getTransliteration(
              token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
              text.languageId || text.language || "",
            ),
            gloss: t("reader.userImportedWord"),
            punctAfter: token.match(/[.,/#!$%^&*;:{}=\-_`~()]/)
              ? token.slice(-1) + " "
              : " ",
          })),
        };
      });
      return [
        {
          id: "imported-section-1",
          title: t("reader.fullText"),
          sentences,
          translation: t("reader.noTranslation"),
        },
      ];
    }
    return [];
  }, [text, t]);

  // Determine what kind of content is being read so UI can be honest about it
  const sourceKind: 'import' | 'sample' | 'partial' | 'complete' = useMemo(() => {
    if (!text) return 'complete';
    if (typeof textId === 'string' && (textId.startsWith('import-') || textId.startsWith('imp-')) && !CorpusDB.getText(textId)) return 'import';
    if (text.isSample) return 'sample';
    if (text.isComplete || text.sourceStatus === 'complete') return 'complete';
    return 'partial';
  }, [text, textId]);

  const chapter = useMemo(
    () => chapters[currentChapterIndex] || chapters[0] || { id: '', title: '', sentences: [] as any[], translation: '' },
    [chapters, currentChapterIndex],
  );

  const SENTENCES_PER_PAGE = 30;

  const totalPages = Math.ceil((chapter?.sentences?.length || 0) / SENTENCES_PER_PAGE);
  const sentenceSliceStart = readingMode === "page" ? 0 : currentScrollPage * SENTENCES_PER_PAGE;
  const sentenceSliceEnd = readingMode === "page" ? chapter?.sentences?.length : (currentScrollPage + 1) * SENTENCES_PER_PAGE;
  
  const displayedSentences = readingMode === "page" 
    ? chapter?.sentences 
    : chapter?.sentences?.slice(sentenceSliceStart, sentenceSliceEnd);

  useEffect(() => {
    setScrollPage(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex]);

  const isHebrewFont = ["hbo", "Biblical Hebrew", "arc", "Aramaic", "syr", "Syriac", "Hebrew"].includes(text?.language || "");
  const isRtl = text?.direction === "rtl" || ["hbo", "Biblical Hebrew", "arc", "Aramaic", "syr", "Syriac", "egy", "Egyptian Hieroglyphs"].includes(text?.language || "");
  const currentLanguageId = text?.language || text?.languageId || "unknown";

  const exampleSentences = useMemo(() => {
    if (!selectedWord) return [];
    const currentSentenceId = chapter?.sentences?.[currentSentenceIndex]?.id;
    return CorpusDB.findSentencesWithLemma(
      selectedWord.lemma,
      currentSentenceId,
      3,
    );
  }, [selectedWord, chapter, currentSentenceIndex]);


  // Update refs when state changes so interval callbacks read fresh values without re-subscribing
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    currentSentenceIndexRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  // Speak current word via TTS when audio position advances
  useEffect(() => {
    if (!isPlaying || !window.speechSynthesis) return;
    const currentSentence = chapter?.sentences[audioPos.sentenceIdx];
    if (!currentSentence) return;
    const token = currentSentence.tokens[audioPos.wordIdx];
    if (!token || token.type === 'whitespace' || !token.text) return;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(token.text);
    u.lang = TTS_LANG_MAP[currentLanguageId] || 'el-GR';
    u.rate = Math.min(audioSpeed, 1.1);
    window.speechSynthesis.speak(u);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPos.sentenceIdx, audioPos.wordIdx]);

  // Cancel TTS when paused
  useEffect(() => {
    if (!isPlaying) window.speechSynthesis?.cancel();
  }, [isPlaying]);

  // Audio Playback Effect
  useEffect(() => {
    if (!isPlaying) return;
    const currentSentence = chapter?.sentences[audioPos.sentenceIdx];
    if (!currentSentence) {
      setPlayState(false);
      return;
    }

    const baseSpeed = isHebrewFont ? 180 : 150;
    const delay = baseSpeed / audioSpeed;

    const timer = setTimeout(() => {
      if (loopWord) {
        // Do not advance token
      } else if (audioPos.wordIdx < currentSentence.tokens.length - 1) {
        setAudioPosition(audioPos.sentenceIdx, audioPos.wordIdx + 1);
      } else {
        if (loopSentence) {
          setAudioPosition(audioPos.sentenceIdx, 0);
        } else if (audioPos.sentenceIdx < chapter.sentences.length - 1) {
          setAudioPosition(audioPos.sentenceIdx + 1, 0);
          if (readingMode === "page")
            setSentenceIndex(audioPos.sentenceIdx + 1);
        } else {
          setPlayState(false);
          setAudioPosition(0, 0);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPlaying,
    audioPos,
    audioSpeed,
    chapter,
    loopWord,
    loopSentence,
    isHebrewFont,
    readingMode,
  ]);

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
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, "true");
  };

  useEffect(() => {
    if (readingMode === "page") return;
    
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
    
    const scrollContainer = document.getElementById("reading-area-scroll");
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  // setScrollProgress is a stable state setter — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, readingMode]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcuts for selected word
      if (selectedWord) {
        if (e.key === "1") {
          setWordState(selectedWord.lemma, WordState.LEARNING, currentLanguageId);
          return;
        }
        if (e.key === "2") {
          setWordState(selectedWord.lemma, WordState.FAMILIAR, currentLanguageId);
          return;
        }
        if (e.key === "3") {
          setWordState(selectedWord.lemma, WordState.KNOWN, currentLanguageId);
          return;
        }
        if (e.key === "4") {
          setWordState(selectedWord.lemma, WordState.IGNORED, currentLanguageId);
          return;
        }
        if (e.key === "k" || e.key === "K") {
          setWordState(selectedWord.lemma, WordState.KNOWN, currentLanguageId);
          return;
        }
        if (e.key === "l" || e.key === "L") {
          setWordState(selectedWord.lemma, WordState.LEARNING, currentLanguageId);
          return;
        }
        if (e.key === "i" || e.key === "I") {
          setWordState(selectedWord.lemma, WordState.IGNORED, currentLanguageId);
          return;
        }
        if (e.key === "Escape") {
          setSelectedWord(null);
          return;
        }
      }

      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.key === "l" || e.key === "L") {
        toggleLoopSentence();
        return;
      }
      if (["!", "@", "#", "$", "%"].includes(e.key)) {
        const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
        setAudioSpeed(speeds[["!", "@", "#", "$", "%"].indexOf(e.key)]);
        return;
      }

      if (!selectedWord) {
        if (e.key === "ArrowRight") {
          if (readingMode === "page") {
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
              document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
            } else if (currentChapterIndex < chapters.length - 1) {
              goToNextChapter(chapters.length);
            }
          }
        } else if (e.key === "ArrowLeft") {
          if (readingMode === "page") {
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
              document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
            } else if (currentChapterIndex > 0) {
              const prevChapter = chapters[currentChapterIndex - 1];
              const prevTotalPages = Math.ceil((prevChapter?.sentences?.length || 0) / SENTENCES_PER_PAGE);
              setChapterIndex(currentChapterIndex - 1);
              setScrollPage(prevTotalPages - 1);
            }
          }
        }
        return;
      }

      if (e.key === "Escape") setSelectedWord(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedWord, 
    chapter, 
    readingMode, 
    currentSentenceIndex, 
    chapters, 
    currentChapterIndex, 
    setWordState, 
    currentLanguageId,
    currentScrollPage,
    totalPages
  ]);
  
  const handleMarkPageKnown = useCallback((andAdvance: boolean = true) => {
    let tokensToMark: any[];
    if (readingMode === "page") {
      tokensToMark = chapter.sentences[currentSentenceIndex]?.tokens || [];
    } else {
      tokensToMark = displayedSentences?.flatMap((s: any) => s.tokens) || [];
    }

    const validTokens = tokensToMark.filter(t => t.lemma && t.lemma.length > 0);
    
    if (validTokens.length > 0) {
      const tokensWithLang = validTokens.map(t => ({
        ...t,
        languageId: currentLanguageId
      }));
      if (typeof (setWordState as any).markPageAsSeen === 'function') {
        (setWordState as any).markPageAsSeen(tokensWithLang);
      } else {
        validTokens.forEach(t => setWordState(t.lemma, WordState.KNOWN, currentLanguageId));
      }
    }
    
    addReadWords(validTokens.length);
    addToast(t("reader.wordsMarkedKnown", { count: validTokens.length }), "success");

    if (!andAdvance) return;

    if (readingMode === "page") {
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
        document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
        setSelectedWord(null);
      } else if (currentChapterIndex < chapters.length - 1) {
        goToNextChapter(chapters.length);
        setSelectedWord(null);
      }
    }
  }, [readingMode, chapter, currentSentenceIndex, displayedSentences, currentLanguageId, setWordState, addReadWords, addToast, t, totalPages, chapters.length, currentChapterIndex, currentScrollPage, goToNextChapter, setSentenceIndex, setScrollPage, setAudioPosition]);

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
          document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
        } else if (currentChapterIndex < chapters.length - 1) {
          goToNextChapter(chapters.length);
        }
      }
    }
  }, [settings.swipePageMovesToKnown, handleMarkPageKnown, readingMode, currentSentenceIndex, chapter.sentences.length, currentChapterIndex, chapters.length, currentScrollPage, totalPages, goToNextSentence, goToNextChapter, setScrollPage]);

  const handleNextPage = useCallback(() => {
    setScrollPage(Math.min(currentScrollPage + 1, totalPages - 1));
    document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
  }, [currentScrollPage, totalPages, setScrollPage]);

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setChapterIndex(currentChapterIndex + 1);
    }
  }, [currentChapterIndex, chapters.length, setChapterIndex]);

  const handleWordClick = useCallback((token: any, sentenceText: string, sentenceIndex: number) => {
    setSelectedWord({ ...token, sentenceText });
    incrementEncounter(token.lemma, currentLanguageId);
    setWordContext(token.lemma, sentenceText, currentLanguageId);
    if (readingMode === "page") setSentenceIndex(sentenceIndex);
  }, [incrementEncounter, setWordContext, currentLanguageId, readingMode, setSentenceIndex]);

  const handleSavePhrase = useCallback((sentence: any) => {
    const phrase = sentence.tokens.map((tk: any) => tk.text).join(" ");
    setWordState(phrase, WordState.LEARNING, currentLanguageId);
    if (sentence.translation || aiTranslations[sentence.id]) {
      updateGloss(phrase, aiTranslations[sentence.id] || sentence.translation || "", currentLanguageId);
    }
    addToast(t("reader.sentenceSaved"), "success");
  }, [setWordState, updateGloss, currentLanguageId, aiTranslations, addToast, t]);

  if (!text || chapters.length === 0 || !chapter) {
    return <ReaderSkeleton />;
  }

  if (!canAccessLanguage(currentLanguageId)) {
    return <Navigate to="/app/subscription" state={{ locked: currentLanguageId }} replace />;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-ink font-sans overflow-hidden">
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        <ReaderProgressHeader
          readToday={stats?.readToday || 0}
          dailyGoalWords={settings.dailyGoalWords}
          onBack={onBack}
          onMinuteElapsed={() => incrementReadingTime(1)}
        />

        <ReaderToolbar
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onChangeChapter={setChapterIndex}
          showTranslit={showTranslit}
          onToggleTranslit={() => setShowTranslit(!showTranslit)}
          showParallel={showParallel}
          onToggleParallel={() => setShowParallel(!showParallel)}
          maskKnown={maskKnown}
          onToggleMaskKnown={() => setMaskKnown(!maskKnown)}
          readingMode={readingMode}
          onChangeReadingMode={setMode}
          interlinearMode={interlinearMode}
          onToggleInterlinear={() => setInterlinearMode(!interlinearMode)}
        />
        <button onClick={onAskTutor}
          className="fixed bottom-24 right-6 z-30 w-12 h-12 bg-ink text-parch rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
          title={t("reader.askTutor", "Ask Tutor")}>
          <span className="text-[18px] font-serif font-bold">T</span>
        </button>
        <button onClick={() => {
          const id = textId || '';
          if (OfflineService.isOfflineText(id)) {
            OfflineService.removeOfflineText(id);
            addToast(t("reader.removedOffline", "Removed from offline"), 'success');
          } else {
            OfflineService.setOfflineText(id, text?.title || 'Text', currentLanguageId);
            const chapterSentences = chapter?.sentences || [];
            if (chapterSentences.length > 0) {
              OfflineService.saveOfflinePayload(id, {
                textId: id,
                title: text?.title || 'Text',
                languageId: currentLanguageId,
                sentences: chapterSentences.map((s: any) => ({
                  tokens: s.tokens?.map((t: any) => ({
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
                source: (textId?.startsWith('import-') || textId?.startsWith('imp-')) ? 'import' : 'corpus',
              });
            }
            addToast(t("reader.availableOffline", "Available offline"), 'success');
          }
        }}
          className="fixed bottom-40 right-6 z-30 w-12 h-12 bg-parch3 text-ink rounded-full shadow-lg flex items-center justify-center hover:bg-blue hover:text-white transition-all active:scale-95 border border-bdr"
          title={OfflineService.isOfflineText(textId || '') ? t("reader.removeOffline", "Remove offline") : t("reader.saveOffline", "Save offline")}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v10m0 0l-3-3m3 3l3-3M4 19h16" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <ReaderAudioBar
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          audioProgress={chapter.sentences.length > 0 ? audioPos.sentenceIdx / chapter.sentences.length : 0}
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
          showParallel={showParallel}
          maskKnown={maskKnown}
          isHebrewFont={isHebrewFont}
          isRtl={isRtl}
          audioPos={audioPos}
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
          interlinearMode={interlinearMode}
          onWordClick={handleWordClick}
          onAITranslate={handleAITranslate}
          onSavePhrase={handleSavePhrase}
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
            readingMode === "page"
              ? !(currentChapterIndex === 0 && currentSentenceIndex === 0)
              : !(currentChapterIndex === 0 && currentScrollPage === 0)
          }
          canGoNext={
            readingMode === "page"
              ? !(currentChapterIndex === chapters.length - 1 && currentSentenceIndex === chapter.sentences.length - 1)
              : !(currentChapterIndex === chapters.length - 1 && currentScrollPage === totalPages - 1)
          }
          onPrev={() => {
            if (readingMode === "page") {
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
                const prevTotalPages = Math.ceil((prevChapter?.sentences?.length || 0) / SENTENCES_PER_PAGE);
                setChapterIndex(currentChapterIndex - 1);
                setScrollPage(prevTotalPages - 1);
              }
            }
          }}
          onNext={() => {
            if (readingMode === "page") {
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

      {/* 380px Reading Panel - Absolute on mobile, relative on desktop */}
      <LexDrawerPanel
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
        knowledge={knowledge}
        setWordState={setWordState}
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
          u.lang = TTS_LANG_MAP[lang] || "en-US";
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        }}
        text={text}
      />

      <ReaderTutorial currentStep={tutorialStep} onDismiss={dismissTutorial} />
    </div>
  );
};
