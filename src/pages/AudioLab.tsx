import { useState } from "react";
import { Headphones, Volume2, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES, getLanguageById } from "../lib/constants/languages";

interface TTSStatus {
  audioUrl: string | null;
  supported: boolean;
  reason?: string;
  provider?: string;
}

interface GuideResult {
  guide: string | null;
  phoneticApproximation: string | null;
  ipaTranscription: string | null;
  reconstructionSystem: string | null;
  warnings?: string[];
}

export const AudioLab = () => {
  const [selectedLang, setSelectedLang] = useState('grc');
  const [testText, setTestText] = useState('');
  const [ttsResult, setTtsResult] = useState<TTSStatus | null>(null);
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);

  const lang = getLanguageById(selectedLang);
  const languages = LANGUAGES;

  const handleCheckTTS = async () => {
    setIsLoadingTTS(true);
    setTtsResult(null);
    try {
      const res = await fetch('/api/audio/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId: selectedLang, text: testText || lang?.sampleText || '' }),
      });
      setTtsResult(await res.json());
    } catch { setTtsResult({ audioUrl: null, supported: false, reason: 'Network error' }); }
    finally { setIsLoadingTTS(false); }
  };

  const handleGetGuide = async () => {
    setIsLoadingGuide(true);
    setGuideResult(null);
    try {
      const res = await fetch('/api/ai/pronunciation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId: selectedLang, text: testText || lang?.sampleText || '' }),
      });
      setGuideResult(await res.json());
    } catch { setGuideResult({ guide: null, phoneticApproximation: null, ipaTranscription: null, reconstructionSystem: null, warnings: ['Network error'] }); }
    finally { setIsLoadingGuide(false); }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-2">Pronunciation Lab</h2>
      <p className="text-ink2 text-[15px] mb-8">Check TTS availability and generate pronunciation guides.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {languages.map(l => {
          const isSelected = l.id === selectedLang;
          return (
            <button key={l.id} onClick={() => { setSelectedLang(l.id); setTtsResult(null); setGuideResult(null); }}
              className={cn("card p-4 text-left hover:border-blue/30 transition-all", isSelected && "border-blue/40 ring-1 ring-blue/20")}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{l.icon}</span>
                <div>
                  <div className="text-[15px] font-bold text-ink">{l.shortName}</div>
                  <div className="text-[10px] text-muted">{l.name}</div>
                </div>
                {l.supportsTTS ? <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" /> : <XCircle className="w-4 h-4 text-muted ml-auto" />}
              </div>
              <div className="text-[11px] text-ink2 flex gap-3">
                <span>TTS: {l.supportsTTS ? 'Yes' : 'No'}</span>
                <span>Guide: {l.supportsPronunciationGuide !== false ? 'Yes' : 'No'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-[16px] font-bold text-ink">Test Pronunciation</h3>
        <input type="text" value={testText} onChange={e => setTestText(e.target.value)}
          placeholder={lang?.sampleText || 'Enter text…'}
          className="w-full px-4 py-2 border border-bdr rounded-lg text-[15px] font-serif focus:outline-none focus:border-blue"
        />
        <div className="flex gap-3">
          <button onClick={handleCheckTTS} disabled={isLoadingTTS}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 disabled:opacity-50 transition-all">
            {isLoadingTTS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            Check TTS
          </button>
          <button onClick={handleGetGuide} disabled={isLoadingGuide}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink text-parch font-bold rounded-xl text-[13px] hover:opacity-90 disabled:opacity-50 transition-all">
            {isLoadingGuide ? <Loader2 className="w-4 h-4 animate-spin" /> : <Headphones className="w-4 h-4" />}
            Get Guide
          </button>
        </div>

        {ttsResult && (
          <div className={cn("p-4 rounded-xl text-[13px]", ttsResult.supported ? "bg-emerald-50 text-emerald-800" : "bg-amber/5 text-amber")}>
            <strong>{ttsResult.supported ? 'Supported' : 'Not supported'}</strong>
            {ttsResult.reason && <p className="mt-1">{ttsResult.reason}</p>}
            {ttsResult.provider && <p className="mt-1 text-muted">Provider: {ttsResult.provider}</p>}
          </div>
        )}

        {guideResult && (
          <div className="space-y-3">
            {guideResult.guide && (
              <div className="p-4 bg-blue/5 rounded-xl">
                <h4 className="font-bold text-[13px] text-ink mb-1">Guide</h4>
                <p className="text-[14px] text-ink2 leading-relaxed">{guideResult.guide}</p>
              </div>
            )}
            {guideResult.phoneticApproximation && (
              <div className="p-3 bg-parch2 rounded-xl">
                <span className="text-[11px] text-muted font-bold uppercase">Phonetic: </span>
                <span className="text-[14px] text-ink2 italic">{guideResult.phoneticApproximation}</span>
              </div>
            )}
            {guideResult.ipaTranscription && (
              <div className="p-3 bg-parch2 rounded-xl">
                <span className="text-[11px] text-muted font-bold uppercase">IPA: </span>
                <span className="text-[14px] text-ink2">{guideResult.ipaTranscription}</span>
              </div>
            )}
            {guideResult.reconstructionSystem && (
              <div className="text-[11px] text-ink3 italic">
                Reconstruction: {guideResult.reconstructionSystem}
              </div>
            )}
            {guideResult.warnings && guideResult.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-amber">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
