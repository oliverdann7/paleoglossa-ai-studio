import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Link as LinkIcon, FileText, CheckCircle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const onComplete = (text: any) => navigate(`/app/reader/${text.id}`);
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'url'>('paste');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('grc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportedText | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    if (!text.trim()) return;
    setIsProcessing(true);

    // Simulate analysis
    setTimeout(() => {
      const words = text.split(/\s+/).filter(Boolean);
      const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
      
      const imported: ImportedText = {
        id: `import-${Date.now()}`,
        title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        content: text,
        language,
        importedAt: new Date().toISOString(),
        stats: {
          totalWords: words.length,
          uniqueWords,
          newWords: Math.floor(uniqueWords * 0.4),
          knownWords: Math.floor(uniqueWords * 0.2)
        }
      };

      const existingRaw = localStorage.getItem('paleoglossa_imports');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('paleoglossa_imports', JSON.stringify([...existing, imported]));
      
      setResult(imported);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSample = (sample: string, lang: string) => {
    setText(sample);
    setLanguage(lang);
  };

  const samples = [
    { name: "Plato's Apology", lang: "grc", text: "Ὅτι μὲν ὑμεῖς, ὦ ἄνδρες Ἀθηναῖοι, πεπόνθατε ὑπὸ τῶν ἐμῶν κατηγόρων, οὐκ οἶδα· ἐγὼ δ᾽ οὖν καὶ αὐτὸς ὑπ᾽ αὐτῶν ὀλίγου ἐμαυτοῦ ἐπελαθόμην, οὕτω πιθανῶς ἔλεγον." },
    { name: "Cicero Catilinarian", lang: "lat", text: "Quo usque tandem abutere, Catilina, patientia nostra? quam diu etiam furor iste tuus nos eludet? quem ad finem sese effrenata jactabit audacia?" },
    { name: "Psalm 1 (Hebrew)", lang: "hbo", text: "אַשְׁרֵי הָאִישׁ אֲשֶׁר לֹא הָלַךְ בַּעֲצַת רְשָׁעִים וּבְדֶרֶךְ חַטָּאִים לֹא עָמָד וּבְמוֹשַׁב לֵצִים לֹא יָשָׁב׃" }
  ];

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">Import New Lesson</h2>
        <p className="font-body text-[15px] italic text-ink2">
          Your personal library. Paste anything from the ancient world and the system will map it to your knowledge.
        </p>
      </header>

      {!result ? (
        <div className="card overflow-hidden">
          {/* Tabs Nav */}
          <div className="flex border-b border-bdr bg-parch2/50">
            <button 
              onClick={() => setActiveTab('paste')}
              className={cn("flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all", activeTab === 'paste' ? "bg-white text-blue border-b-2 border-blue" : "text-muted hover:bg-parch")}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
            <button 
              onClick={() => setActiveTab('file')}
              className={cn("flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all", activeTab === 'file' ? "bg-white text-blue border-b-2 border-blue" : "text-muted hover:bg-parch")}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button 
              onClick={() => setActiveTab('url')}
              className={cn("flex-1 px-6 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all", activeTab === 'url' ? "bg-white text-blue border-b-2 border-blue" : "text-muted hover:bg-parch")}
            >
              <LinkIcon className="w-4 h-4" />
              Import URL
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'paste' && (
                <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <label className="eyebrow mb-2">Select Language</label>
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
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="eyebrow mb-2">Paste Content</label>
                    <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your text here..."
                      className="w-full h-64 p-5 bg-white border border-bdr rounded-xl text-[18px] font-serif leading-relaxed focus:ring-1 focus:ring-blue"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {samples.map(s => (
                       <button 
                        key={s.name}
                        onClick={() => handleSample(s.text, s.lang)}
                        className="px-3 py-1.5 rounded-full border border-bdr/50 bg-parch text-[11px] font-bold text-muted hover:border-blue/30 transition-all"
                       >
                         Try: {s.name}
                       </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'file' && (
                <motion.div 
                  key="file" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-96 border-2 border-dashed border-bdr/40 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue/5 hover:border-blue/30 transition-all"
                >
                  <input type="file" ref={fileInputRef} className="hidden" />
                  <div className="w-16 h-16 bg-parch2 text-muted rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-[20px] font-serif font-bold text-ink mb-1">Click to Upload</h3>
                  <p className="text-[13px] text-muted">Supports .txt, .pdf, .docx files up to 20MB</p>
                </motion.div>
              )}

              {activeTab === 'url' && (
                <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   <div className="mb-8">
                    <label className="eyebrow mb-2">Article URL</label>
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
                        <h4 className="text-[14px] font-bold text-blue mb-1">URL Scraper Beta</h4>
                        <p className="text-[13px] text-ink3 leading-relaxed">
                          We'll automatically extract the main text content, ignoring ads and navigation. Works best with scholarly databases and digital classics libraries.
                        </p>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleProcess}
              disabled={isProcessing || !text.trim()}
              className="w-full mt-8 bg-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-lg shadow-blue/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Language...
                </>
              ) : (
                'Analyze & Import Text'
              )}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card overflow-hidden">
          <div className="bg-green-50 p-12 text-center border-b border-green-100">
             <div className="w-20 h-20 bg-white shadow-sm border border-green-200 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h3 className="text-[28px] font-serif font-bold text-ink mb-1">Processing Complete</h3>
             <p className="text-green-700 font-bold text-[14px]">{result.title}</p>
          </div>
          
          <div className="p-10">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
               <div className="text-center">
                  <div className="text-[32px] font-serif font-bold text-ink">{result.stats.totalWords}</div>
                  <div className="eyebrow text-[9px] text-muted">Total Words</div>
               </div>
               <div className="text-center">
                  <div className="text-[32px] font-serif font-bold text-ink">{result.stats.uniqueWords}</div>
                  <div className="eyebrow text-[9px] text-muted">Unique Words</div>
               </div>
               <div className="text-center">
                  <div className="text-[32px] font-serif font-bold text-blue">{result.stats.newWords}</div>
                  <div className="eyebrow text-[9px] text-blue/70">New to You</div>
               </div>
               <div className="text-center">
                  <div className="text-[32px] font-serif font-bold text-green-600">{result.stats.knownWords}</div>
                  <div className="eyebrow text-[9px] text-green-600/70">Known Words</div>
               </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onComplete(result)}
                  className="w-full bg-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Open in Reader
                </button>
                <div className="flex justify-between items-center px-2 py-4">
                   <button className="text-[13px] font-bold text-muted hover:text-ink">Save for later</button>
                   <button onClick={() => setResult(null)} className="text-[13px] font-bold text-blue hover:underline">Import another</button>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
