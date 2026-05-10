import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Repeat,
  Repeat1,
  Layout,
  Type,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CorpusDB } from "../data/corpus";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useSettings } from "../lib/hooks/useSettings";
import {
  WordState,
  STATE_COLORS,
} from "../lib/constants/wordStates";
import { ProgressRing } from "../components/reader/ProgressRing";
import { ReaderTutorial } from "../components/reader/ReaderTutorial";
import { LexDrawerPanel } from "../components/reader/LexDrawerPanel";
import { getTransliteration } from "../lib/transliterate";

import { AIClient } from "../lib/services/aiClient";
import { ImportService } from "../lib/services/importService";
import { useAuth } from "../lib/hooks/useAuth";

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
    saveTextProgress
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
    return localStorage.getItem("tutorialCompleted") ? 0 : 1;
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
      setAiTranslations(prev => ({ ...prev, [sentenceId]: "Error translating text." }));
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
          title: "Full Text",
          sentences: text.sentences.map((s: any, i: number) => ({
            id: `import-sent-${i}`,
            translation: s.translation || "No translation.",
            parallel: s.translation || "No parallel text.",
            tokens: s.tokens.map((t: any, j: number) => ({
              id: `import-token-${i}-${j}`,
              text: t.text,
              lemma: t.lemma || t.text,
              normalized: t.normalized || t.text,
              translit: t.transliteration || getTransliteration(t.text, text.languageId || "", t.normalized),
              gloss: t.gloss || "Ancient word",
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
          translation: "No translation available.",
          parallel: "No parallel text.",
          tokens: rawTokens.map((t: string, j: number) => ({
            id: `import-token-${i}-${j}`,
            text: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
            lemma: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase(),
            translit: getTransliteration(
              t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
              text.languageId || text.language || "",
            ),
            gloss: "User imported word",
            punctAfter: t.match(/[.,/#!$%^&*;:{}=\-_`~()]/)
              ? t.slice(-1) + " "
              : " ",
          })),
        };
      });
      return [
        {
          id: "imported-section-1",
          title: "Full Text",
          sentences,
          translation: "No translation available.",
        },
      ];
    }
  }, [text]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`reader_chapter_${text?.id}`);
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
        `reader_chapter_${text.id}`,
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
      (knowledge[selectedWord.lemma] === WordState.KNOWN ||
        (knowledge[selectedWord.lemma] as any)?.state === WordState.KNOWN)
    ) {
      setTutorialStep(3);
    } else if (tutorialStep === 3 && scrollProgress > 80) {
      setTutorialStep(4);
    }
  }, [tutorialStep, selectedWord, knowledge, scrollProgress]);

  const dismissTutorial = () => {
    setTutorialStep(0);
    localStorage.setItem("tutorialCompleted", "true");
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
  
  const getWordStyle = (token: any, isAudioActive: boolean) => {
    const info = knowledge[token.lemma] ?? WordState.NEW;
    const state = typeof info === "object" ? (info as any).state : info;
    const isSelected = selectedWord?.id === token.id;
    const isKnown = state === WordState.KNOWN;
    const colors = STATE_COLORS[state as WordState];

    const intensity = settings.highlightIntensity;
    let bgOpacity =
      intensity === "strong" ? "50" : intensity === "subtle" ? "15" : "33";
    if (state === WordState.NEW) bgOpacity = "00";

    if (maskKnown && isKnown && !isSelected && !isAudioActive) {
      return {
        color: "transparent",
        borderBottom: "2px dotted #8C8273",
        backgroundImage:
          "radial-gradient(circle, #8C8273 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        backgroundPosition: "1px 8px",
        backgroundRepeat: "repeat-x",
      };
    }

    return {
      backgroundColor: isSelected
        ? "#1E3D6E33"
        : colors.bg === "transparent"
          ? "transparent"
          : `${colors.bg}${bgOpacity}`,
      borderBottom: `2px solid ${isSelected ? "#1E3D6E" : isAudioActive ? "#D4AF37" : colors.border}`,
      color: colors.text,
      fontStyle: state === WordState.IGNORED ? "italic" : "normal",
      opacity: state === WordState.IGNORED ? 0.6 : 1,
      transition: "all 0.15s ease",
    };
  };

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

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    return `${mins} min`;
  };

  if (!text || chapters.length === 0 || !chapter) {
    return (
      <div className="flex items-center justify-center h-screen bg-parch">
        <div className="text-ink3 font-medium flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
          Loading text...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-ink font-sans overflow-hidden">
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        {/* Progress Header Strip */}
        <div className="h-14 bg-parch2 border-b border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 transition-colors">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className="text-[16px] md:text-[18px] font-bold text-blue leading-none">
                {stats?.readToday?.toLocaleString() || 0}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold hidden md:inline">
                {t("reader.readToday", "Read Today")}
              </span>
            </div>
            <div className="hidden md:flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className="text-[18px] font-bold text-ink leading-none">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">
                {t("reader.session", "Session")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[11px] font-bold text-ink3 uppercase tracking-tight">
                {t("reader.goal", "Goal")}
              </span>
              <ProgressRing
                progress={Math.min(
                  1,
                  stats.readToday / Math.max(1, settings.dailyGoalWords),
                )}
              />
            </div>
            <div className="w-px h-8 bg-bdr/50" />
            <button
              onClick={onBack}
              className="p-2 text-link hover:bg-parch3 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-ink3" />
            </button>
          </div>
        </div>

        {/* Reader Controls Toolbar */}
        <div className="h-12 border-b border-bdr/40 flex items-center justify-between px-4 md:px-6 bg-parch/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-ink2 overflow-hidden">
            <select
              value={currentChapterIndex}
              onChange={(e) =>
                setCurrentChapterIndex(parseInt(e.target.value, 10))
              }
              className="bg-transparent border-none p-0 pr-4 focus:ring-0 cursor-pointer font-bold text-blue truncate max-w-[120px] md:max-w-none"
            >
              {chapters.map((c, i) => (
                <option key={c.id} value={i}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setShowTranslit(!showTranslit)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest hidden md:flex",
                showTranslit
                  ? "bg-purple-100 text-purple-700"
                  : "text-muted hover:bg-parch3",
              )}
            >
              <Type className="w-3.5 h-3.5" /> {t("reader.translit", "Translit")}
            </button>
            <button
              onClick={() => setShowParallel(!showParallel)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest",
                showParallel
                  ? "bg-blue/10 text-blue"
                  : "text-muted hover:bg-parch3",
              )}
            >
              <Layout className="w-3.5 h-3.5" /> {t("reader.parallel", "Parallel")}
            </button>
            <button
              onClick={() => setMaskKnown(!maskKnown)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest",
                maskKnown
                  ? "bg-amber/10 text-amber"
                  : "text-muted hover:bg-parch3",
              )}
            >
              <EyeOff className="w-3.5 h-3.5" /> {t("reader.maskKnown", "Mask Known")}
            </button>
            <div className="w-px h-4 bg-bdr m-1 hidden md:block" />
            <div className="flex bg-parch3 p-0.5 rounded-lg border border-bdr shrink-0">
              <button
                onClick={() => setReadingMode("scroll")}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
                  readingMode === "scroll"
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink cursor-pointer",
                )}
              >
                {t("reader.sentenceView", "Sentence View")}
              </button>
              <button
                onClick={() => setReadingMode("page")}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
                  readingMode === "page"
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink cursor-pointer",
                )}
              >
                {t("reader.pageView", "Page View")}
              </button>
            </div>
          </div>
        </div>

        {/* Audio Bar */}
        <div className="h-14 bg-parch text-ink border-b border-bdr flex items-center gap-4 px-4 shadow-sm z-30">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue text-white hover:bg-blue-600 transition-transform active:scale-95 shadow-sm shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            )}
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gold transition-all duration-100 ease-linear"
                style={{
                  width: `${(audioPos.sentenceIdx / chapter.sentences.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
                const next =
                  speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
                setAudioSpeed(next);
              }}
              className="text-[11px] font-mono font-bold text-ink w-10 text-center hover:bg-parch3 px-1 py-1 rounded"
            >
              {audioSpeed}x
            </button>
            <button
              onClick={() => setLoopSentence(!loopSentence)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                loopSentence
                  ? "text-gold bg-gold/10"
                  : "text-muted hover:bg-parch3",
              )}
              title="Loop Sentence"
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLoopWord(!loopWord)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                loopWord
                  ? "text-gold bg-gold/10"
                  : "text-muted hover:bg-parch3",
              )}
              title="Loop Word"
            >
              <Repeat1 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Pane */}
        <div
          id="reading-area-scroll"
          className="flex-1 overflow-y-auto px-4 md:px-12 py-8 md:py-16 scroll-smooth bg-transparent relative"
        >
          <div
            className={cn(
              "mx-auto transition-all w-full",
              showParallel
                ? "max-w-screen-xl lg:grid grid-cols-2 gap-8 items-center"
                : "max-w-3xl",
            )}
          >
            {/* Original Column */}
            <div className="col-span-1 border-r-0 lg:border-r border-bdr/40 lg:pr-8">
              <div
                dir={isRtl ? "rtl" : "ltr"}
                className={cn(
                  "font-serif tracking-wide transition-all",
                  isHebrewFont ? "font-hebrew" : "",
                  isRtl ? "text-right" : "text-left",
                  readingMode === "page"
                    ? "text-[24px] leading-[2.5]"
                    : "leading-[2.2]",
                )}
              >
                {displayedSentences?.map((sentence: any, idx: number) => {
                  const sIdx = sentenceSliceStart + idx;
                  const isActivePageMode =
                    readingMode === "page"
                      ? sIdx === currentSentenceIndex
                      : true;

                  return (
                    <span
                      id={`sentence-${sIdx}`}
                      key={sentence.id}
                      className={cn(
                        "inline transition-opacity duration-500",
                        isRtl ? "ml-2 md:ml-3" : "mr-2 md:mr-3",
                        !isActivePageMode && readingMode === "page"
                          ? "opacity-30"
                          : "opacity-100",
                      )}
                    >
                      {sentence.tokens.map((token: any, tIdx: number) => {
                        if (token.type === 'whitespace') {
                          return <span key={token.id} className="whitespace-pre"> </span>;
                        }
                        const isAudioActive =
                          audioPos.sentenceIdx === sIdx &&
                          audioPos.wordIdx === tIdx;
                        return (
                          <span key={token.id} className="inline">
                            {token.punctBefore && (
                              <span className="opacity-40">
                                {token.punctBefore}
                              </span>
                            )}
                            <motion.span
                              layoutId={`word-${token.id}`}
                              onClick={() => {
                                const sentenceText = sentence.tokens.map((t: any) => t.text).join(" ");
                                setSelectedWord({ ...token, sentenceText });
                                incrementEncounter(token.lemma, text?.languageId || "unknown");
                                setWordContext(token.lemma, sentenceText, text?.languageId || "unknown");
                                if (readingMode === "page")
                                  setCurrentSentenceIndex(sIdx);
                              }}
                              className="cursor-pointer transition-all px-1 rounded-sm inline-flex flex-col items-center align-top leading-none"
                              style={{
                                fontSize:
                                  readingMode === "page"
                                    ? `${settings.fontSize * 1.2}px`
                                    : `${settings.fontSize}px`,
                                ...getWordStyle(token, isAudioActive),
                              }}
                            >
                              <bdi className="leading-tight mb-1">
                                {token.text}
                              </bdi>
                              {showTranslit && token.translit && (
                                <span className="text-[0.45em] text-muted opacity-70 font-sans tracking-wide">
                                  {token.translit}
                                </span>
                              )}
                            </motion.span>
                            {token.punctAfter !== undefined &&
                            token.punctAfter !== null ? (
                              <span className="opacity-40 whitespace-pre-wrap">
                                {token.punctAfter}
                              </span>
                            ) : (
                              <span> </span>
                            )}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
                {readingMode === "scroll" && (
                  <>
                    <div className="text-muted text-center opacity-30 text-[24px] mt-12 mb-8">
                      ❦
                    </div>
                    <div className="flex flex-col items-center gap-6 mt-12 pb-24">
                      {currentScrollPage >= totalPages - 1 ? (
                        <div className="text-center">
                          <h4 className="font-serif text-[24px] text-ink mb-2">
                            {t("reader.finishedChapter", "You've reached the end of this chapter.")}
                          </h4>
                          <p className="text-muted text-[14px]">
                            {t("reader.readyNext", "Ready to move on to the next one?")}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <h4 className="font-serif text-[20px] text-ink mb-2">
                            End of Page {currentScrollPage + 1} of {totalPages}
                          </h4>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <button
                          onClick={handleMarkPageKnown}
                          className="px-8 py-3 bg-blue text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                          {currentScrollPage >= totalPages - 1 
                            ? t("reader.markChapterSeen", "Mark Chapter as Seen & Finish")
                            : "Mark Page as Seen & Next"}
                        </button>
                        {currentScrollPage >= totalPages - 1 && currentChapterIndex < chapters.length - 1 && (
                          <button
                            onClick={() => setCurrentChapterIndex(currentChapterIndex + 1)}
                            className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                          >
                            {t("reader.nextChapter", "Next Chapter")}
                          </button>
                        )}
                        {currentScrollPage < totalPages - 1 && (
                          <button
                            onClick={() => {
                              setCurrentScrollPage(prev => prev + 1);
                              document.getElementById("reading-area-scroll")?.scrollTo(0, 0);
                            }}
                            className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                          >
                            Next Page
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Parallel Column */}
            {showParallel && (
              <div className="col-span-1 pt-8 lg:pt-0 pb-16">
                {displayedSentences?.map((sentence: any, idx: number) => {
                  const sIdx = sentenceSliceStart + idx;
                  const isActivePageMode =
                    readingMode === "page"
                      ? sIdx === currentSentenceIndex
                      : true;

                  return (
                    <div
                      key={`par-${sentence.id}`}
                      className={cn(
                        "font-serif text-ink2 mb-3 transition-opacity duration-500",
                        readingMode === "page"
                          ? "text-[20px] leading-[2.2]"
                          : "text-[18px] leading-[2.2]",
                        !isActivePageMode && readingMode === "page"
                          ? "opacity-20"
                          : "opacity-80 hover:opacity-100",
                      )}
                    >
                      {aiTranslations[sentence.id] ? (
                        aiTranslations[sentence.id]
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          {sentence.parallel && !sentence.parallel.includes("No parallel text") && <div>{sentence.parallel}</div>}
                          {sentence.translation && !sentence.translation.includes("No translation") && <div>{sentence.translation}</div>}
                          <button
                            onClick={() => handleAITranslate(sentence.id, sentence.tokens)}
                            disabled={isTranslatingId === sentence.id}
                            className="text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 bg-blue/5 text-blue font-medium rounded-lg hover:bg-blue/10 transition-colors disabled:opacity-50 mt-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isTranslatingId === sentence.id ? t("reader.translating", "Translating...") : t("reader.askAiTranslate", "Ask AI to Translate")}
                          </button>
                          <button
                            onClick={async () => {
                              const phrase = sentence.tokens.map((t: any) => t.text).join(" ");
                              setWordState(phrase, WordState.LEARNING, text?.languageId || "unknown");
                              if (sentence.translation || aiTranslations[sentence.id]) {
                                updateGloss(phrase, aiTranslations[sentence.id] || sentence.translation, text?.languageId || "unknown");
                              }
                              alert("Sentence saved to your vocabulary!");
                            }}
                            className="text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 bg-amber/5 text-amber font-medium rounded-lg hover:bg-amber/10 transition-colors mt-1"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            {t("reader.saveAsPhrase", "Save as Phrase")}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav / Stats */}
        <div className="h-12 bg-parch2 border-t border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 z-30 pb-safe">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex h-1 w-32 bg-parch3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            {readingMode === "page" ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {currentSentenceIndex + 1} / {chapter.sentences.length}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted hidden md:inline">
                {Math.round(scrollProgress)}% read
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (readingMode === "page" && currentSentenceIndex > 0)
                  setCurrentSentenceIndex((p) => p - 1);
                else if (currentChapterIndex > 0)
                  setCurrentChapterIndex(currentChapterIndex - 1);
              }}
              disabled={
                currentChapterIndex === 0 &&
                (readingMode === "scroll" || currentSentenceIndex === 0)
              }
              className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleMarkPageKnown}
              className="bg-blue text-white px-4 md:px-5 py-1.5 rounded-full text-[12px] font-bold hover:bg-blue/90 shadow-sm transition-all whitespace-nowrap"
            >
              {readingMode === "page" ? "Mark Known & Next" : "Mark Page Known"}
            </button>
            <button
              onClick={() => {
                if (
                  readingMode === "page" &&
                  currentSentenceIndex < chapter.sentences.length - 1
                )
                  setCurrentSentenceIndex((p) => p + 1);
                else if (currentChapterIndex < chapters.length - 1)
                  setCurrentChapterIndex(currentChapterIndex + 1);
              }}
              disabled={
                currentChapterIndex === chapters.length - 1 &&
                (readingMode === "scroll" ||
                  currentSentenceIndex === chapter.sentences.length - 1)
              }
              className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
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
