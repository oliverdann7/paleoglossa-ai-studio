import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  Loader2,
  Play,
  Image as ImageIcon,
  ChevronDown,
  Globe2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportService, ImportedText } from "../lib/services/importService";
import { AIClient } from "../lib/services/aiClient";
import { useAuth } from "../lib/hooks/useAuth";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { WordState } from "../lib/constants/wordStates";
import { ImportedSentence } from "../types/firestore";

import { LANGUAGES } from "../lib/constants/languages";
import { useActiveLanguage } from "../lib/hooks/useActiveLanguage";
import { useSubscription } from "../lib/contexts/SubscriptionContext";

export const Import = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { activeLanguageId } = useActiveLanguage();
  const { canAccessLanguage } = useSubscription();
  const { refreshImports, knowledge } = useKnowledge(activeLanguageId);
  const onComplete = (text: any) => navigate(`/app/reader/${text.id}`);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "file" | "url" | "ocr">("paste");
  const [text, setText] = useState("");
  const [languageId, setLanguageId] = useState(activeLanguageId && canAccessLanguage(activeLanguageId) ? activeLanguageId : "grc");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [result, setResult] = useState<ImportedText | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langSelectRef = useRef<HTMLDivElement>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langSelectRef.current && !langSelectRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageMimeType(file.type);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const buildTitleFromText = (rawText: string): string => {
    const firstLine = rawText.trim().split(/[\n.!?]/)[0]?.trim() || rawText.trim();
    const candidate = firstLine.length > 0 ? firstLine : rawText.trim();
    return candidate.length > 80 ? candidate.slice(0, 80) + "…" : candidate;
  };

  const calculateStats = (sentences: ImportedSentence[]) => {
    const allTokens = sentences.flatMap(s => s.tokens).filter(t => t.type === 'word');
    const totalWords = allTokens.length;
    const uniqueLemmas = Array.from(new Set(allTokens.map(t => (t.lemma || t.text).toLowerCase())));
    const uniqueWords = uniqueLemmas.length;
    
    let knownWords = 0;
    let learningWords = 0;
    let newWords = 0;
    
    uniqueLemmas.forEach(lemma => {
      const info = knowledge[lemma];
      if (info) {
        const state = typeof info === 'string' ? info : (info as any).state;
        if (state === WordState.KNOWN) knownWords++;
        else if (state !== WordState.NEW && state !== WordState.IGNORED) learningWords++;
        else newWords++;
      } else {
        newWords++;
      }
    });

    return {
      totalWords,
      uniqueWords,
      knownWords,
      newWords,
      learningWords,
      percentKnown: Math.round((knownWords / Math.max(1, uniqueWords)) * 100),
      percentLearning: Math.round((learningWords / Math.max(1, uniqueWords)) * 100)
    };
  };

  const handleExtractText = async () => {
    if (!imageBase64 || !imageMimeType) return;
    setIsProcessing(true);
    setProcessingStep("Performing OCR with AI...");
    try {
      const extractedText = await AIClient.extractFromImage(languageId, imageBase64, imageMimeType, user?.uid);
      setText(extractedText);
      setActiveTab("paste");
      setImageBase64(null);
      setImageMimeType(null);
    } catch (error: any) {
      console.error("OCR Extraction failed:", error);
      alert("Failed to extract text from image: " + error.message);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    setProcessingStep("Scraping content from URL...");
    try {
      const extractedText = await AIClient.scrapeUrl(url, user?.uid);
      setText(extractedText);
      setActiveTab("paste");
      setUrl("");
    } catch (error: any) {
      console.error("Scrape failed:", error);
      alert("Failed to scrape URL: " + error.message);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setProcessingStep("Reading file...");
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setText(content);
        setActiveTab("paste");
        setIsProcessing(false);
        setProcessingStep("");
      };
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error("File upload failed:", error);
      alert("Failed to upload file: " + error.message);
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  function basicTokenize(rawText: string): ImportedSentence[] {
    const sentences = rawText
      .split(/(?<=[.?!])\s+/)
      .filter(Boolean)
      .map(sentenceText => {
        const tokens = sentenceText
          .split(/(\s+)/)
          .filter(t => t && t.trim())
          .map(tokenText => {
            const isWhitespace = /^\s+$/.test(tokenText);
            const isPunctuation = /^[,;:!?()[\]{}«»–—]+$/.test(tokenText);
            const isNumber = /^[0-9]+([.,][0-9]+)?$/.test(tokenText);
            const cleaned = tokenText.replace(/[,;:!?()[\]{}«»–—]/g, '');
            const type = isWhitespace ? 'whitespace' as const : isPunctuation ? 'punctuation' as const : isNumber ? 'number' as const : 'word' as const;
            return {
              text: tokenText,
              lemma: type === 'word' ? cleaned.toLowerCase() : undefined,
              normalized: type === 'word' ? cleaned.toLowerCase() : undefined,
              type,
            };
          });
        return { tokens, translation: undefined };
      });
    return sentences;
  }

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setProcessingStep("Linguistic analysis...");
    setAnalysisError(null);

    let sentences: ImportedSentence[];
    let analysisStatus: 'analyzed' | 'raw' = 'analyzed';
    let stats: ReturnType<typeof calculateStats>;

    if (!canAccessLanguage(languageId)) {
      alert("This language is locked in your current plan. Upgrade to import texts in this language.");
      setIsProcessing(false);
      setProcessingStep("");
      return;
    }

    try {
      sentences = await AIClient.analyzeText(languageId, text, user?.uid);
      setProcessingStep("Mapping to your knowledge...");
      stats = calculateStats(sentences);
    } catch (error: any) {
      console.warn("AI analysis failed, using basic tokenization:", error);
      sentences = basicTokenize(text);
      analysisStatus = 'raw';
      stats = calculateStats(sentences);
      setAnalysisError(error.message || "AI analysis unavailable");
      setProcessingStep("Saving without AI analysis...");
    }

    const sourceTypeMap: Record<string, ImportedText['sourceType']> = {
      paste: 'paste',
      file: 'file',
      url: 'url',
      ocr: 'image',
    };

    const imported: ImportedText = {
      id: `imp-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      title: buildTitleFromText(text),
      rawContent: text,
      sentences,
      languageId,
      sourceType: sourceTypeMap[activeTab] || 'paste',
      status: 'complete',
      analysisStatus,
      visibility: 'private',
      stats,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await ImportService.saveImport(user ? user.uid : null, imported);
    } catch (saveError: any) {
      console.error("Import save failed:", saveError);
      alert("Text analysis succeeded, but saving failed: " + saveError.message);
      setIsProcessing(false);
      setProcessingStep("");
      return;
    }

    refreshImports();
    setResult(imported);
    setIsProcessing(false);
    setProcessingStep("");
  };

  const handleSample = (sample: string, langId: string) => {
    setText(sample);
    setLanguageId(langId);
  };

  const samples = [
    {
      name: "Plato's Apology",
      lang: "grc",
      text: "Ὅτι μὲν ὑμεῖς, ὦ ἄνδρες Ἀθηναῖοι, πεπόνθατε ὑπὸ τῶν ἐμῶν κατηγόρων, οὐκ οἶδα· ἐγὼ δ᾽ οὖν καὶ αὐτὸς ὑπ᾽ αὐτῶν ὀλίγου ἐμαυτοῦ ἐπελαθόμην, οὕτω πιθανῶς ἔλεγον.",
    },
    {
      name: "Cicero Catilinarian",
      lang: "lat",
      text: "Quo usque tandem abutere, Catilina, patientia nostra? quam diu etiam furor iste tuus nos eludet? quem ad finem sese effrenata jactabit audacia?",
    },
    {
      name: "Psalm 1 (Hebrew)",
      lang: "hbo",
      text: "אַשְׁרֵי הָאִישׁ אֲשֶׁר לֹא הָלַךְ בַּעֲצַת רְשָׁעִים וּבְדֶרֶךְ חַטָּאִים לֹא עָמָד וּבְמוֹשַׁב לֵצִים לֹא יָשָׁב׃",
    },
    {
      name: "Bhagavad Gita 1.1",
      lang: "san",
      text: "धृतराष्ट्र उवाच धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः। मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥",
    },
    {
      name: "Egyptian Offering",
      lang: "egy",
      text: "𓊵𓏙𓇓𓏏 𓊩𓁹 𓏃𓋀𓏏𓅂 𓊹𓉻 𓎟𓍋𓃀𓈋𓊖 𓏙𓆑 𓉐𓉲 𓏐𓏊 𓃾𓅿 𓍱𓋲 𓊹𓊵 𓐍𓏏 𓎟 𓄤𓏏 𓃂𓏏",
    },
    {
      name: "Gilgamesh I.1",
      lang: "akk",
      text: "𒊭 𒅘𒁀 𒄿𒈬𒊒 𒅖𒁲 𒈠𒀀𒋾 𒄿𒁲𒈠 𒅗𒆷𒈠 𒄩𒊍 Воло",
    }
  ];

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t("import.title", "Import New Lesson")}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t("import.description", "Your personal library. Paste anything from the ancient world and the system will map it to your knowledge.")}
        </p>
      </header>

      {!result ? (
        <div className="card overflow-hidden">
          {/* Tabs Nav */}
          <div className="flex border-b border-bdr bg-parch2/50">
            <button
              onClick={() => setActiveTab("paste")}
              className={cn(
                "flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all",
                activeTab === "paste"
                  ? "bg-white text-blue border-b-2 border-blue"
                  : "text-muted hover:bg-parch",
              )}
            >
              <FileText className="w-4 h-4" />
              {t("import.pasteText", "Paste Text")}
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={cn(
                "flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all",
                activeTab === "file"
                  ? "bg-white text-blue border-b-2 border-blue"
                  : "text-muted hover:bg-parch",
              )}
            >
              <Upload className="w-4 h-4" />
              {t("import.uploadFile", "Upload File")}
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={cn(
                "flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all",
                activeTab === "url"
                  ? "bg-white text-blue border-b-2 border-blue"
                  : "text-muted hover:bg-parch",
              )}
            >
              <LinkIcon className="w-4 h-4" />
              {t("import.importUrl", "Import URL")}
            </button>
            <button
              onClick={() => setActiveTab("ocr")}
              className={cn(
                "flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all",
                activeTab === "ocr"
                  ? "bg-white text-blue border-b-2 border-blue"
                  : "text-muted hover:bg-parch",
              )}
            >
              <ImageIcon className="w-4 h-4" />
              {t("import.ocr", "Image OCR")}
            </button>
          </div>

          <div className="p-8">
    <div className="mb-8 relative z-50">
      <label className="eyebrow mb-2">{t("import.selectLanguage", "Select Language")}</label>
      <div className="relative" ref={langSelectRef}>
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="w-full flex items-center justify-between p-4 bg-white border border-bdr rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/50 hover:border-blue/30 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-parch2 text-ink flex items-center justify-center text-[18px]">
              {LANGUAGES.find((l) => l.id === languageId)?.icon || <Globe2 className="w-4 h-4" />}
            </span>
            <span className="font-bold text-ink text-[15px]">
              {LANGUAGES.find((l) => l.id === languageId)?.name || "Select Language"}
            </span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-muted transition-transform", isLangOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isLangOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-bdr shadow-xl shadow-parch2/50 rounded-xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
            >
              <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setLanguageId(lang.id);
                      setIsLangOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all text-left w-full",
                      languageId === lang.id ? "bg-blue/10 text-blue font-bold" : "hover:bg-parch text-ink2 font-medium"
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[16px]",
                      languageId === lang.id ? "bg-blue text-white" : "bg-parch2 text-ink"
                    )}>
                      {lang.icon}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-[14px]">{lang.name}</span>
                      <span className="text-[11px] opacity-60 uppercase font-sans font-bold tracking-wider">{lang.symbol}</span>
                    </div>
                    {languageId === lang.id && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

            <AnimatePresence mode="wait">
              {activeTab === "paste" && (
                <motion.div
                  key="paste"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6">
                    <label className="eyebrow mb-2">{t("import.pasteContent", "Paste Content")}</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your text here..."
                      className="w-full h-64 p-5 bg-white border border-bdr rounded-xl text-[18px] font-serif leading-relaxed focus:ring-1 focus:ring-blue"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {samples.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleSample(s.text, s.lang)}
                        className="px-3 py-1.5 rounded-full border border-bdr/50 bg-parch text-[11px] font-bold text-muted hover:border-blue/30 transition-all"
                      >
                        {t("import.try", "Try")}: {s.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "file" && (
                <motion.div
                  key="file"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-96 border-2 border-dashed border-bdr/40 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue/5 hover:border-blue/30 transition-all"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <div className="w-16 h-16 bg-parch2 text-muted rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-[20px] font-serif font-bold text-ink mb-1">
                    {t("import.clickUpload", "Click to Upload")}
                  </h3>
                  <p className="text-[13px] text-muted">
                    {t("import.supports", "Supports .txt files (PDF/DOCX Coming Soon)")}
                  </p>
                </motion.div>
              )}

              {activeTab === "url" && (
                <motion.div
                  key="url"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-8">
                    <label className="eyebrow mb-2">{t("import.articleUrl", "Article URL")}</label>
                    <input
                      type="url"
                      placeholder="https://example.com/ancient-text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full p-4 bg-white border border-bdr rounded-xl text-[16px] focus:ring-1 focus:ring-blue shadow-sm"
                    />
                  </div>
                  <div className="p-8 bg-blue/5 rounded-2xl border border-blue/10 flex items-start gap-4">
                    <div className="bg-blue/10 p-2 rounded-lg text-blue">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-blue mb-1">
                        {t("import.urlScraper", "URL Scraper Beta")}
                      </h4>
                      <p className="text-[13px] text-ink3 leading-relaxed">
                        {t("import.scraperDesc", "We'll automatically extract the main text content, ignoring ads and navigation. Works best with scholarly databases and digital classics libraries.")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "ocr" && (
                <motion.div
                  key="ocr"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    "h-96 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden",
                    imageBase64 ? "border-blue bg-blue/5" : "border-bdr/40 hover:bg-blue/5 hover:border-blue/30"
                  )}
                >
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
                  {imageBase64 ? (
                    <img src={`data:${imageMimeType};base64,${imageBase64}`} alt="Selected text" className="absolute inset-0 w-full h-full object-contain opacity-40" />
                  ) : null}
                  <div className="relative z-10 w-16 h-16 bg-parch2 text-muted rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="relative z-10 text-[20px] font-serif font-bold text-ink mb-1">
                    {imageBase64 ? t("import.imageSelected", "Image Selected. Click to change.") : t("import.clickUploadImage", "Upload Image for OCR")}
                  </h3>
                  <p className="relative z-10 text-[13px] text-muted">
                    {t("import.supportsOcr", "Extract text automatically from ancient manuscripts or textbooks.")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={activeTab === 'ocr' ? handleExtractText : activeTab === 'url' ? handleScrapeUrl : handleProcess}
              disabled={isProcessing || (activeTab === 'ocr' ? !imageBase64 : activeTab === 'url' ? !url.trim() : activeTab === 'file' ? false : !text.trim())}
              className="w-full mt-8 bg-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-lg shadow-blue/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div>
                    <div className="font-bold">{activeTab === 'ocr' ? t("import.extracting", "Extracting Text...") : t("import.processing", "Processing Language...")}</div>
                    <div className="text-[10px] opacity-70 uppercase tracking-widest">{processingStep}</div>
                  </div>
                </>
              ) : (
                activeTab === 'ocr' ? t("import.extractText", "Extract Text from Image") :  t("import.process", "Analyze & Import Text")
              )}
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card overflow-hidden"
        >
          <div className="bg-green-50 p-12 text-center border-b border-green-100">
            <div className="w-20 h-20 bg-white shadow-sm border border-green-200 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-[28px] font-serif font-bold text-ink mb-1">
              {t("import.complete", "Processing Complete")}
            </h3>
            <p className="text-green-700 font-bold text-[14px]">
              {result.title}
            </p>
          </div>

          <div className="p-10">
            {analysisError && (
              <div className="mb-8 p-4 bg-amber/10 border border-amber/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber text-[13px] mb-1">AI analysis unavailable</div>
                  <p className="text-[12px] text-ink3 leading-relaxed">
                    Your text was saved with basic tokenization only — no morphology or glosses.
                    You can still read it in the Reader. AI analysis can be retried later.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-[32px] font-serif font-bold text-ink">
                  {result.stats.totalWords}
                </div>
                <div className="eyebrow text-[9px] text-muted">{t("import.totalWords", "Total Words")}</div>
              </div>
              <div className="text-center">
                <div className="text-[32px] font-serif font-bold text-ink">
                  {result.stats.uniqueWords}
                </div>
                <div className="eyebrow text-[9px] text-muted">
                  {t("import.uniqueWords", "Unique Words")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[32px] font-serif font-bold text-blue">
                  {result.stats.newWords}
                </div>
                <div className="eyebrow text-[9px] text-blue/70">
                  {t("import.newWords", "New to You")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[32px] font-serif font-bold text-green-600">
                  {result.stats.knownWords}
                </div>
                <div className="eyebrow text-[9px] text-green-600/70">
                  {t("import.knownWords", "Known Words")}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onComplete(result)}
                className="w-full bg-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-lg"
              >
                <Play className="w-5 h-5 fill-current" />
                {t("import.openReader", "Open in Reader")}
              </button>
              <div className="flex justify-between items-center px-2 py-4">
                <button className="text-[13px] font-bold text-muted hover:text-ink">
                  {t("import.saveLater", "Save for later")}
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="text-[13px] font-bold text-blue hover:underline"
                >
                  {t("import.importAnother", "Import another")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
