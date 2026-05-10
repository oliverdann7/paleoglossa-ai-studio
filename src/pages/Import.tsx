import { useState, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

interface ImportedText {
  id: string;
  title: string;
  content: string;
  language: string;
  importedAt: string;
  stats: {
    totalWords: number;
    uniqueWords: number;
    newWords: number;
    knownWords: number;
  };
}

export const Import = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onComplete = (text: any) => navigate(`/app/reader/${text.id}`);
  const [activeTab, setActiveTab] = useState<"paste" | "file" | "url" | "ocr">("paste");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("grc");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportedText | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

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

  const handleExtractText = async () => {
    if (!imageBase64 || !imageMimeType) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
            { text: `Extract the text from this image. The source text is ${language}. Preserve the original characters and native script. Return ONLY the extracted text, with no markdown formatting or extra commentary.` }
          ]
        }
      });
      const extractedText = response.text || "";
      setText(extractedText);
      setActiveTab("paste");
      setImageBase64(null);
      setImageMimeType(null);
    } catch (error) {
      console.error("OCR Extraction failed:", error);
      alert("Failed to extract text from image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = () => {
    if (!text.trim()) return;
    setIsProcessing(true);

    // Simulate analysis
    setTimeout(() => {
      const words = text.split(/\s+/).filter(Boolean);
      const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

      const imported: ImportedText = {
        id: `import-${Date.now()}`,
        title: text.slice(0, 40) + (text.length > 40 ? "..." : ""),
        content: text,
        language,
        importedAt: new Date().toISOString(),
        stats: {
          totalWords: words.length,
          uniqueWords,
          newWords: Math.floor(uniqueWords * 0.4),
          knownWords: Math.floor(uniqueWords * 0.2),
        },
      };

      const existingRaw = localStorage.getItem("paleoglossa_imports");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(
        "paleoglossa_imports",
        JSON.stringify([...existing, imported]),
      );

      setResult(imported);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSample = (sample: string, lang: string) => {
    setText(sample);
    setLanguage(lang);
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
            <AnimatePresence mode="wait">
              {activeTab === "paste" && (
                <motion.div
                  key="paste"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6">
                    <label className="eyebrow mb-2">{t("import.selectLanguage", "Select Language")}</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-3 bg-white border border-bdr rounded-xl text-[14px] font-sans focus:ring-1 focus:ring-blue"
                    >
                      <option value="grc">Ancient Greek</option>
                      <option value="grc-koine">Koine Greek</option>
                      <option value="hbo">Biblical Hebrew</option>
                      <option value="lat">Classical Latin</option>
                      <option value="syr">Classical Syriac</option>
                      <option value="cop">Coptic</option>
                      <option value="arc">Aramaic</option>
                      <option value="akk">Akkadian</option>
                      <option value="san">Sanskrit</option>
                      <option value="egy">Egyptian Hieroglyphs</option>
                      <option value="hit">Hittite</option>
                    </select>
                  </div>

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
                  <input type="file" ref={fileInputRef} className="hidden" />
                  <div className="w-16 h-16 bg-parch2 text-muted rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-[20px] font-serif font-bold text-ink mb-1">
                    {t("import.clickUpload", "Click to Upload")}
                  </h3>
                  <p className="text-[13px] text-muted">
                    {t("import.supports", "Supports .txt, .pdf, .docx files up to 20MB")}
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
              onClick={activeTab === 'ocr' ? handleExtractText : handleProcess}
              disabled={isProcessing || (activeTab === 'ocr' ? !imageBase64 : !text.trim())}
              className="w-full mt-8 bg-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-lg shadow-blue/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {activeTab === 'ocr' ? t("import.extracting", "Extracting Text...") : t("import.processing", "Processing Language...")}
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
