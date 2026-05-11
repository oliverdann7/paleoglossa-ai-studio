import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CorpusDB } from "../data/corpus";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useSettings } from "../lib/hooks/useSettings";
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
import { STORAGE_KEYS } from "../lib/constants/storage";

export const Reader = () => {
  const { textId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const onBack = () => navigate("/app/library");

  const [localText, setLocalText] = useState<any>(null);
  
  useEffect(() => {
    if (!textId) return;
    
    const tObj = CorpusDB.getText(textId);
    if (!tObj && textId.startsWith("import-")) {
      ImportService.getImports(user ? user.uid : null).then(imports => {
        const match = imports.find((item: any) => item.id === textId);
        if(match) setLocalText(match);
      });
    } else if (tObj) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalText(tObj);
    }
  }, [textId, user]);
  
  const text = localText;
  
  const {
    knowledge,
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
    markPageAsSeen,
    setWordContext
  } = useKnowledge();
  const { settings } = useSettings();

  const [selectedWord, setSelectedWord] = useState<any>(null);

  const [showTranslit, setShowTranslit] = useState(settings.showTranslit);
  const [showParallel, setShowParallel] = useState(
    settings.showParallelDefault,
  );
  const [readingMode, setReadingMode] = useState<"scroll" | "page">("scroll");
  const [maskKnown, setMaskKnown] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) ? 0 : 1;
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPos, setAudioPos] = useState({ sentenceIdx: 0, wordIdx: 0 });
  const [audioSpeed, setAudioSpeed] = useState(settings.audioSpeedDefault);
  const [loopSentence, setLoopSentence] = useState(false);
  const [loopWord, setLoopWord] = useState(false);

  // Page mode state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isTranslatingId, setIsTranslatingId] = useState<string | null>(null);

  const [aiTranslations, setAiTranslations] = useState<Record<string, string>>({});

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
          setCurrentSentenceIndex(prog.sentenceIndex);
        }
      }
    };
    loadProgress();
  }, [textId, fetchTextProgress, readingMode]);

  // Save progress periodically
  useEffect(() => {
    if (!textId) return;
    const interval = setInterval(() => {
      saveTextProgress({
        textId,
        lastPosition: scrollProgress,
        sentenceIndex: currentSentenceIndex,
        completed: scrollProgress > 95,
        lastReadAt: new Date().toISOString()
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [textId, scrollProgress, currentSentenceIndex, saveTextProgress]);

  // Clear word insight when word changes
  const handleAITranslate = async (sentenceId: string, sentenceTokens: any[]) => {
    if (isTranslatingId === sentenceId || aiTranslations[sentenceId]) return;
    setIsTranslatingId(sentenceId);
    
    try {
      const languageName = text?.language || "ancient language";
      const result = await AIClient.translateSentence(languageName, sentenceTokens.map(t => t.text).join(" "), user?.uid);
      setAiTranslations(prev => ({ ...prev, [sentenceId]: result }));
    } catch (error) {
      console.error(error);
      setAiTranslations(prev => ({ ...prev, [sentenceId]: t("reader.errorTranslating") }));
    } finally {
      setIsTranslatingId(null);
    }
  };

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

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.READER_CHAPTER_PREFIX}${text?.id}`);
    const parsed = saved ? parseInt(saved, 10) || 0 : 0;
    return parsed < chapters.length ? parsed : 0;
  });

  const chapter = chapters[currentChapterIndex] || chapters[0];

  const SENTENCES_PER_PAGE = 30;
  const [currentScrollPage, setCurrentScrollPage] = useState(0);

  const totalPages = Math.ceil((chapter?.sentences?.length || 0) / SENTENCES_PER_PAGE);
  const sentenceSliceStart = readingMode === "page" ? 0 : currentScrollPage * SENTENCES_PER_PAGE;
  const sentenceSliceEnd = readingMode === "page" ? chapter?.sentences?.length : (currentScrollPage + 1) * SENTENCES_PER_PAGE;
  
  const displayedSentences = readingMode === "page" 
    ? chapter?.sentences 
    : chapter?.sentences?.slice(sentenceSliceStart, sentenceSliceEnd);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentScrollPage(0);
  }, [currentChapterIndex]);

  const isHebrewFont = ["hbo", "Biblical Hebrew", "arc", "Aramaic", "syr", "Syriac", "Hebrew"].includes(text?.language || "");
  const isRtl = text?.direction === "rtl" || ["hbo", "Biblical Hebrew", "arc", "Aramaic", "syr", "Syriac", "egy", "Egyptian Hieroglyphs"].includes(text?.language || "");

  const exampleSentences = useMemo(() => {
    if (!selectedWord) return [];
    const currentSentenceId = chapter?.sentences?.[currentSentenceIndex]?.id;
    return CorpusDB.findSentencesWithLemma(
      selectedWord.lemma,
      currentSentenceId,
      3,
    );
  }, [selectedWord, chapter, currentSentenceIndex]);

  // Stats & Time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        if (prev > 0 && prev % 60 === 0) incrementReadingTime(1);
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incrementReadingTime]);

  // TTS language map (same as LexDrawerPanel)
  const ttsLangMap: Record<string, string> = {
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

  // Speak current word via TTS when audio position advances
  useEffect(() => {
    if (!isPlaying || !window.speechSynthesis) return;
    const currentSentence = chapter?.sentences[audioPos.sentenceIdx];
    if (!currentSentence) return;
    const token = currentSentence.tokens[audioPos.wordIdx];
    if (!token || token.type === 'whitespace' || !token.text) return;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(token.text);
    u.lang = ttsLangMap[text?.languageId || ''] || 'el-GR';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
      return;
    }

    const baseSpeed = isHebrewFont ? 180 : 150;
    const delay = baseSpeed / audioSpeed;

    const timer = setTimeout(() => {
      if (loopWord) {
        // Do not advance token
      } else if (audioPos.wordIdx < currentSentence.tokens.length - 1) {
        setAudioPos((p) => ({ ...p, wordIdx: p.wordIdx + 1 }));
      } else {
        if (loopSentence) {
          setAudioPos((p) => ({ ...p, wordIdx: 0 }));
        } else if (audioPos.sentenceIdx < chapter.sentences.length - 1) {
          setAudioPos({ sentenceIdx: audioPos.sentenceIdx + 1, wordIdx: 0 });
          if (readingMode === "page")
            setCurrentSentenceIndex(audioPos.sentenceIdx + 1);
        } else {
          setIsPlaying(false);

          setAudioPos({ sentenceIdx: 0, wordIdx: 0 });
        }
      }
    }, delay);

    return () => clearTimeout(timer);
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

  useEffect(() => {
    if (text?.id) {
      localStorage.setItem(
        `${STORAGE_KEYS.READER_CHAPTER_PREFIX}${text.id}`,
        currentChapterIndex.toString(),
      );
    }
  }, [currentChapterIndex, text?.id]);

  // Tutorial logic
  useEffect(() => {
    if (tutorialStep === 0) return;

    if (tutorialStep === 1 && selectedWord) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTutorialStep(2);
    } else if (
      tutorialStep === 2 &&
      selectedWord &&
      knowledge[selectedWord.lemma] &&
      knowledge[selectedWord.lemma]?.state === WordState.KNOWN
    ) {
      setTutorialStep(3);
    } else if (tutorialStep === 3 && scrollProgress > 80) {
      setTutorialStep(4);
    }
  }, [tutorialStep, selectedWord, knowledge, scrollProgress]);

  const dismissTutorial = () => {
    setTutorialStep(0);
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, "true");
  };

  useEffect(() => {
    if (readingMode === "page") return;
    const handleScroll = (e: any) => {
      const el = e.target;
      const progress =
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(progress || 0);
    };
    const scrollContainer = document.getElementById("reading-area-scroll");
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [chapter, readingMode]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcuts for selected word
      if (selectedWord) {
        if (e.key === "1") {
          setWordState(selectedWord.lemma, WordState.LEARNING, text?.languageId || "unknown");
          return;
        }
        if (e.key === "2") {
          setWordState(selectedWord.lemma, WordState.FAMILIAR, text?.languageId || "unknown");
          return;
        }
        if (e.key === "3") {
          setWordState(selectedWord.lemma, WordState.KNOWN, text?.languageId || "unknown");
          return;
        }
        if (e.key === "4") {
          setWordState(selectedWord.lemma, WordState.IGNORED, text?.languageId || "unknown");
          return;
        }
        if (e.key === "k" || e.key === "K") {
          setWordState(selectedWord.lemma, WordState.KNOWN, text?.languageId || "unknown");
          return;
        }
        if (e.key === "l" || e.key === "L") {
          setWordState(selectedWord.lemma, WordState.LEARNING, text?.languageId || "unknown");
          return;
        }
        if (e.key === "i" || e.key === "I") {
          setWordState(selectedWord.lemma, WordState.IGNORED, text?.languageId || "unknown");
          return;
        }
        if (e.key === "Escape") {
          setSelectedWord(null);
          return;
        }
      }

      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
      }
      if (e.key === "l" || e.key === "L") {
        setLoopSentence((p) => !p);
        return;
      }
      if (["!", "@", "#", "$", "%"].includes(e.key)) {
        const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
        setAudioSpeed(speeds[["!", "@", "#", "$", "%"].indexOf(e.key)]);
        return;
      }

      if (!selectedWord) {
        if (e.key === "ArrowRight") {
          if (
            readingMode === "page" &&
            currentSentenceIndex < chapter.sentences.length - 1
          ) {
            setCurrentSentenceIndex((prev) => prev + 1);
            setAudioPos({ sentenceIdx: currentSentenceIndex + 1, wordIdx: 0 });
          } else if (readingMode === "scroll") {
            if (currentScrollPage < totalPages - 1) {
              setCurrentScrollPage(prev => prev + 1);
              document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
            } else if (currentChapterIndex < chapters.length - 1) {
              setCurrentChapterIndex(prev => prev + 1);
            }
          }
        } else if (e.key === "ArrowLeft") {
          if (readingMode === "page" && currentSentenceIndex > 0) {
            setCurrentSentenceIndex((prev) => prev - 1);
            setAudioPos({ sentenceIdx: currentSentenceIndex - 1, wordIdx: 0 });
          } else if (readingMode === "scroll") {
            if (currentScrollPage > 0) {
              setCurrentScrollPage(prev => prev - 1);
              document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
            } else if (currentChapterIndex > 0) {
              setCurrentChapterIndex(prev => prev - 1);
            }
          }
        }
        return;
      }

      if (e.key === "Escape") setSelectedWord(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedWord, 
    chapter, 
    readingMode, 
    currentSentenceIndex, 
    chapters.length, 
    currentChapterIndex, 
    setWordState, 
    text?.languageId,
    currentScrollPage,
    totalPages
  ]);
  
  const handleMarkPageKnown = () => {
    let tokensToMark: any[];
    if (readingMode === "page") {
      tokensToMark = chapter.sentences[currentSentenceIndex]?.tokens || [];
    } else {
      tokensToMark = displayedSentences?.flatMap((s: any) => s.tokens) || [];
    }

    // Capture standard tokens (for seen state)
    const validTokens = tokensToMark.filter(t => t.lemma && t.lemma.length > 0)
      .map(t => ({ lemma: t.lemma, languageId: text?.languageId || "unknown" }));
    
    markPageAsSeen(validTokens);
    
    // Explicitly add to read count
    addReadWords(tokensToMark.length);

    if (readingMode === "page") {
      if (currentSentenceIndex < chapter.sentences.length - 1) {
        setCurrentSentenceIndex((prev) => prev + 1);
        setAudioPos({ sentenceIdx: currentSentenceIndex + 1, wordIdx: 0 });
        setSelectedWord(null);
      } else if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentSentenceIndex(0);
        setAudioPos({ sentenceIdx: 0, wordIdx: 0 });
        setSelectedWord(null);
      }
    } else {
      if (currentScrollPage < totalPages - 1) {
        setCurrentScrollPage(prev => prev + 1);
        document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
        setSelectedWord(null);
      } else if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setSelectedWord(null);
      }
    }
  };

  if (!text || chapters.length === 0 || !chapter) {
    return <ReaderSkeleton />;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-ink font-sans overflow-hidden">
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        <ReaderProgressHeader
          readToday={stats?.readToday || 0}
          elapsedTime={elapsedTime}
          dailyGoalWords={settings.dailyGoalWords}
          onBack={onBack}
        />

        <ReaderToolbar
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onChangeChapter={setCurrentChapterIndex}
          showTranslit={showTranslit}
          onToggleTranslit={() => setShowTranslit(!showTranslit)}
          showParallel={showParallel}
          onToggleParallel={() => setShowParallel(!showParallel)}
          maskKnown={maskKnown}
          onToggleMaskKnown={() => setMaskKnown(!maskKnown)}
          readingMode={readingMode}
          onChangeReadingMode={setReadingMode}
        />

        <ReaderAudioBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          audioProgress={chapter.sentences.length > 0 ? audioPos.sentenceIdx / chapter.sentences.length : 0}
          audioSpeed={audioSpeed}
          onChangeSpeed={() => {
            const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
            const next = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
            setAudioSpeed(next);
          }}
          loopSentence={loopSentence}
          onToggleLoopSentence={() => setLoopSentence(!loopSentence)}
          loopWord={loopWord}
          onToggleLoopWord={() => setLoopWord(!loopWord)}
        />

        <ReadingPane
          sentences={displayedSentences || []}
          readingMode={readingMode}
          currentSentenceIndex={currentSentenceIndex}
          fontSize={settings.fontSize}
          highlightIntensity={settings.highlightIntensity}
          knowledge={knowledge}
          selectedWordId={selectedWord?.id}
          showTranslit={showTranslit}
          showParallel={showParallel}
          maskKnown={maskKnown}
          isHebrewFont={isHebrewFont}
          isRtl={isRtl}
          audioPos={audioPos}
          aiTranslations={aiTranslations}
          translatingId={isTranslatingId}
          onWordClick={(token, sentenceText, sentenceIndex) => {
            setSelectedWord({ ...token, sentenceText });
            incrementEncounter(token.lemma, text?.languageId || "unknown");
            setWordContext(token.lemma, sentenceText, text?.languageId || "unknown");
            if (readingMode === "page") setCurrentSentenceIndex(sentenceIndex);
          }}
          onAITranslate={handleAITranslate}
          onSavePhrase={(sentence) => {
            const phrase = sentence.tokens.map((t: any) => t.text).join(" ");
            setWordState(phrase, WordState.LEARNING, text?.languageId || "unknown");
            if (sentence.translation || aiTranslations[sentence.id]) {
              updateGloss(phrase, aiTranslations[sentence.id] || sentence.translation || "", text?.languageId || "unknown");
            }
            alert(t("reader.sentenceSaved"));
          }}
          onMarkPageKnown={handleMarkPageKnown}
          onNextPage={() => {
            setCurrentScrollPage(prev => prev + 1);
            document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
          }}
          onNextChapter={() => setCurrentChapterIndex(currentChapterIndex + 1)}
          currentScrollPage={currentScrollPage}
          totalPages={totalPages}
          currentChapterIndex={currentChapterIndex}
          totalChapters={chapters.length}
          sentenceSliceStart={sentenceSliceStart}
        />

        <ReaderBottomNav
          scrollProgress={scrollProgress}
          readingMode={readingMode}
          currentSentenceIndex={currentSentenceIndex}
          totalSentences={chapter.sentences.length}
          canGoPrev={!(currentChapterIndex === 0 && (readingMode === "scroll" || currentSentenceIndex === 0))}
          canGoNext={!(currentChapterIndex === chapters.length - 1 && (readingMode === "scroll" || currentSentenceIndex === chapter.sentences.length - 1))}
          onPrev={() => {
            if (readingMode === "page" && currentSentenceIndex > 0)
              setCurrentSentenceIndex(p => p - 1);
            else if (currentChapterIndex > 0)
              setCurrentChapterIndex(currentChapterIndex - 1);
          }}
          onNext={() => {
            if (readingMode === "page" && currentSentenceIndex < chapter.sentences.length - 1)
              setCurrentSentenceIndex(p => p + 1);
            else if (currentChapterIndex < chapters.length - 1)
              setCurrentChapterIndex(currentChapterIndex + 1);
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
        textLanguageId={text?.languageId || "unknown"}
        exampleSentences={exampleSentences}
        playTTS={(textStr, lang) => {
          if (!window.speechSynthesis) return;
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(textStr);
          const langCodeMap: Record<string, string> = {
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
          u.lang = langCodeMap[lang] || "en-US";
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        }}
        text={text}
      />

      <ReaderTutorial currentStep={tutorialStep} onDismiss={dismissTutorial} />
    </div>
  );
};
