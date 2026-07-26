import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Headphones,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANGUAGES, getLanguageById } from '../lib/constants/languages.js';
import { getApiUrl } from '../lib/services/apiBaseUrl.js';

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

type PronunciationMode = 'restored' | 'erasmian' | 'modern' | 'default';

const PRONUNCIATION_MODES: Record<string, { id: PronunciationMode; label: string; description: string }[]> = {
  grc: [
    { id: 'restored', label: 'Restored Classical', description: '5th–4th c. BCE reconstruction' },
    { id: 'erasmian', label: 'Erasmian', description: 'Academic convention for teaching' },
    { id: 'modern', label: 'Modern Greek', description: 'Contemporary Greek pronunciation' },
  ],
  'grc-koine': [
    { id: 'restored', label: 'Reconstructed Koine', description: '1st c. CE Hellenistic Greek' },
    { id: 'erasmian', label: 'Erasmian', description: 'Academic convention' },
    { id: 'modern', label: 'Modern Greek', description: 'Contemporary pronunciation' },
  ],
  lat: [
    { id: 'restored', label: 'Restored Classical', description: '1st c. BCE–1st c. CE' },
    { id: 'modern', label: 'Ecclesiastical', description: 'Church Latin (Italianate)' },
  ],
  hbo: [
    { id: 'restored', label: 'Tiberian', description: 'Masoretic tradition' },
    { id: 'modern', label: 'Modern Israeli', description: 'Contemporary Hebrew' },
  ],
};

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: number;
  text: string;
  languageId: string;
}

/**
 * Pick a MediaRecorder MIME type the current platform actually supports.
 * iOS WKWebView (and Safari) cannot record WebM/Opus and will throw
 * NotSupportedError if it's forced — they produce MP4/AAC instead. Probe in
 * order of preference and fall back to the browser default (empty string).
 */
function pickRecordingMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/aac',
  ];
  if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
  }
  return '';
}

function WaveformCanvas({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  height = 48,
  color = '#1E3D6E',
}: {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  height?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    async function decode() {
      try {
        const response = await fetch(audioUrl);
        const arrayBuf = await response.arrayBuffer();
        const audioCtx = new AudioContext();
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
        audioCtx.close();
        if (cancelled) return;

        const rawData = audioBuf.getChannelData(0);
        const barCount = Math.min(100, Math.floor(canvas!.clientWidth / 3));
        const blockSize = Math.floor(rawData.length / barCount);
        const bars: number[] = [];

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          const start = i * blockSize;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[start + j] || 0);
          }
          bars.push(sum / blockSize);
        }

        const maxVal = Math.max(...bars, 0.01);
        barsRef.current = bars.map((b) => b / maxVal);
      } catch {
        barsRef.current = [];
      }
    }

    decode();
    return () => { cancelled = true; };
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    const bars = barsRef.current;
    if (bars.length === 0) return;

    const barWidth = Math.max(1, (w / bars.length) * 0.6);
    const gap = w / bars.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    bars.forEach((val, i) => {
      const x = i * gap + (gap - barWidth) / 2;
      const barH = Math.max(2, val * (h - 4));
      const y = (h - barH) / 2;
      const fraction = (i + 0.5) / bars.length;
      ctx.fillStyle = fraction <= progress ? color : `${color}33`;
      ctx.fillRect(x, y, barWidth, barH);
    });
  }, [currentTime, duration, color, isPlaying]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    onSeek(fraction * duration);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full cursor-pointer rounded"
      style={{ height }}
      onClick={handleClick}
    />
  );
}

function RecorderWidget({
  languageId,
  text,
  ttsAudioUrl,
}: {
  languageId: string;
  text: string;
  ttsAudioUrl: string | null;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCurrentPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setPlayingId(null);
    setPlaybackTime(0);
  }, []);

  const startRecording = async () => {
    try {
      setMicError(null);
      stopCurrentPlayback();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/mp4',
        });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const rec: Recording = {
          id: crypto.randomUUID(),
          blob,
          url,
          duration,
          timestamp: Date.now(),
          text: text || '',
          languageId,
        };
        setRecordings((prev) => [rec, ...prev]);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err: any) {
      // Surface the failure — a silent Record button reads as a broken app,
      // especially on native where the OS permission dialog may never appear.
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setMicError(
        denied
          ? 'Microphone access was denied. Enable the microphone for Paleoglossa in your device settings and try again.'
          : 'Recording could not start — no microphone was found or it is in use by another app.'
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playRecording = (rec: Recording) => {
    stopCurrentPlayback();
    const audio = new Audio(rec.url);
    audioRef.current = audio;
    setPlayingId(rec.id);
    setPlaybackDuration(rec.duration);

    const track = () => {
      if (!audio.paused) {
        setPlaybackTime(audio.currentTime);
        rafRef.current = requestAnimationFrame(track);
      }
    };

    audio.onended = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      setPlayingId(null);
      setPlaybackTime(0);
    };

    audio.play().then(() => {
      rafRef.current = requestAnimationFrame(track);
    }).catch(() => {});
  };

  const deleteRecording = (id: string) => {
    if (playingId === id) stopCurrentPlayback();
    setRecordings((prev) => {
      const rec = prev.find((r) => r.id === id);
      if (rec) URL.revokeObjectURL(rec.url);
      return prev.filter((r) => r.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      recordings.forEach((r) => URL.revokeObjectURL(r.url));
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-bold text-ink flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Your Recording
        </h4>
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold rounded-xl text-[12px] hover:bg-red-600 transition-colors animate-pulse"
          >
            <Square className="w-3.5 h-3.5" fill="currentColor" />
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white font-bold rounded-xl text-[12px] hover:bg-red-500 transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            Record
          </button>
        )}
      </div>

      {micError && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
          <span className="text-[13px] text-red-700">{micError}</span>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[13px] text-red-700 font-medium">Recording...</span>
          <span className="text-[11px] text-red-500 ml-auto">
            {recordingSeconds}s
          </span>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="space-y-2">
          {recordings.map((rec) => {
            const isActive = playingId === rec.id;
            return (
              <div
                key={rec.id}
                className="flex items-center gap-3 p-3 bg-parch2 rounded-xl border border-bdr/30"
              >
                <button
                  onClick={() => isActive ? stopCurrentPlayback() : playRecording(rec)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue text-white hover:bg-blue/90 transition-colors shrink-0"
                >
                  {isActive ? (
                    <Pause className="w-3.5 h-3.5" fill="currentColor" />
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  {isActive ? (
                    <WaveformCanvas
                      audioUrl={rec.url}
                      isPlaying={isActive}
                      currentTime={playbackTime}
                      duration={playbackDuration}
                      onSeek={(t) => {
                        if (audioRef.current) audioRef.current.currentTime = t;
                      }}
                      height={32}
                      color="#1E3D6E"
                    />
                  ) : (
                    <div className="h-8 flex items-center">
                      <span className="text-[12px] text-muted truncate">
                        {rec.text || 'Recording'} · {rec.duration.toFixed(1)}s
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteRecording(rec.id)}
                  className="p-1.5 text-muted hover:text-red-500 rounded transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {ttsAudioUrl && recordings.length > 0 && (
        <div className="p-3 bg-blue/5 rounded-xl border border-blue/20">
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">
            Compare with TTS
          </p>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-blue shrink-0" />
            <audio controls className="flex-1 h-8" src={ttsAudioUrl}>
              Your browser does not support audio.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}

export const AudioLab = () => {
  const [selectedLang, setSelectedLang] = useState('grc');
  const [testText, setTestText] = useState('');
  const [pronunciationMode, setPronunciationMode] = useState<PronunciationMode>('restored');
  const [ttsResult, setTtsResult] = useState<TTSStatus | null>(null);
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [ttsPlaybackTime, setTtsPlaybackTime] = useState(0);
  const [ttsPlaybackDuration, setTtsPlaybackDuration] = useState(0);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRafRef = useRef<number | null>(null);

  const lang = getLanguageById(selectedLang);
  const languages = LANGUAGES;
  const modes = PRONUNCIATION_MODES[selectedLang];

  const stopTtsPlayback = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    if (ttsRafRef.current !== null) cancelAnimationFrame(ttsRafRef.current);
    setIsTtsPlaying(false);
    setTtsPlaybackTime(0);
  }, []);

  const playTts = useCallback(() => {
    if (!ttsResult?.audioUrl) return;
    stopTtsPlayback();
    const audio = new Audio(ttsResult.audioUrl);
    ttsAudioRef.current = audio;
    setIsTtsPlaying(true);

    const track = () => {
      if (!audio.paused) {
        setTtsPlaybackTime(audio.currentTime);
        setTtsPlaybackDuration(audio.duration || 0);
        ttsRafRef.current = requestAnimationFrame(track);
      }
    };

    audio.onended = () => {
      if (ttsRafRef.current !== null) cancelAnimationFrame(ttsRafRef.current);
      setIsTtsPlaying(false);
      setTtsPlaybackTime(0);
    };

    audio.play().then(() => {
      ttsRafRef.current = requestAnimationFrame(track);
    }).catch(() => {});
  }, [ttsResult?.audioUrl, stopTtsPlayback]);

  const handleCheckTTS = async () => {
    setIsLoadingTTS(true);
    setTtsResult(null);
    stopTtsPlayback();
    try {
      const res = await fetch(getApiUrl('/api/audio/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: selectedLang,
          text: testText || lang?.sampleText || '',
          pronunciationMode,
        }),
      });
      setTtsResult(await res.json());
    } catch {
      setTtsResult({ audioUrl: null, supported: false, reason: 'Network error' });
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const handleGetGuide = async () => {
    setIsLoadingGuide(true);
    setGuideResult(null);
    try {
      const res = await fetch(getApiUrl('/api/ai/pronunciation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: selectedLang,
          text: testText || lang?.sampleText || '',
          pronunciationMode,
        }),
      });
      setGuideResult(await res.json());
    } catch {
      setGuideResult({
        guide: null,
        phoneticApproximation: null,
        ipaTranscription: null,
        reconstructionSystem: null,
        warnings: ['Network error'],
      });
    } finally {
      setIsLoadingGuide(false);
    }
  };

  return (
    <div className="p-6 md:p-12 pt-safe-page max-w-5xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-2">Pronunciation Lab</h2>
      <p className="text-ink2 text-[15px] mb-8">
        Listen, record, and compare — master ancient pronunciation.
      </p>

      {/* Language grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {languages.map((l) => {
          const isSelected = l.id === selectedLang;
          return (
            <button
              key={l.id}
              onClick={() => {
                setSelectedLang(l.id);
                setTtsResult(null);
                setGuideResult(null);
                stopTtsPlayback();
                const langModes = PRONUNCIATION_MODES[l.id];
                setPronunciationMode(langModes?.[0]?.id ?? 'default');
              }}
              className={cn(
                'card p-3 text-left hover:border-blue/30 transition-all',
                isSelected && 'border-blue/40 ring-1 ring-blue/20'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{l.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink truncate">{l.shortName}</div>
                </div>
                {l.supportsTTS ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-muted shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-ink2 flex gap-2">
                <span>TTS: {l.supportsTTS ? 'Yes' : 'No'}</span>
                <span>Guide: {l.supportsPronunciationGuide !== false ? 'Yes' : 'No'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* Pronunciation mode selector */}
        {modes && modes.length > 0 && (
          <div className="card p-5">
            <h3 className="text-[13px] font-bold text-ink uppercase tracking-widest mb-3">
              Pronunciation System
            </h3>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setPronunciationMode(m.id);
                    setTtsResult(null);
                    setGuideResult(null);
                    stopTtsPlayback();
                  }}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[12px] font-bold border transition-all',
                    pronunciationMode === m.id
                      ? 'bg-blue text-white border-blue shadow-sm'
                      : 'bg-parch2 text-ink2 border-bdr/40 hover:border-blue/40'
                  )}
                >
                  <div>{m.label}</div>
                  <div className={cn(
                    'text-[10px] font-normal mt-0.5',
                    pronunciationMode === m.id ? 'text-white/70' : 'text-muted'
                  )}>
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text input + actions */}
        <div className="card p-6 space-y-4">
          <h3 className="text-[16px] font-bold text-ink">Test Pronunciation</h3>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder={lang?.sampleText || 'Enter text…'}
            className="w-full px-4 py-2 border border-bdr rounded-lg text-[15px] font-serif focus:outline-none focus:border-blue"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCheckTTS}
              disabled={isLoadingTTS}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 disabled:opacity-50 transition-all"
            >
              {isLoadingTTS ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              Generate Audio
            </button>
            <button
              onClick={handleGetGuide}
              disabled={isLoadingGuide}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink text-parch font-bold rounded-xl text-[13px] hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isLoadingGuide ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Headphones className="w-4 h-4" />
              )}
              Get Guide
            </button>
          </div>

          {/* TTS result with waveform */}
          {ttsResult && (
            <div
              className={cn(
                'p-4 rounded-xl text-[13px]',
                ttsResult.audioUrl
                  ? 'bg-emerald-50'
                  : ttsResult.supported
                    ? 'bg-blue-50'
                    : 'bg-amber/5'
              )}
            >
              {ttsResult.audioUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <strong>Audio Generated</strong>
                    {ttsResult.provider && (
                      <span className="text-[11px] text-emerald-600 ml-auto">{ttsResult.provider}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => isTtsPlaying ? stopTtsPlayback() : playTts()}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                    >
                      {isTtsPlaying ? (
                        <Pause className="w-4 h-4" fill="currentColor" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      )}
                    </button>
                    <div className="flex-1">
                      <WaveformCanvas
                        audioUrl={ttsResult.audioUrl}
                        isPlaying={isTtsPlaying}
                        currentTime={ttsPlaybackTime}
                        duration={ttsPlaybackDuration}
                        onSeek={(t) => {
                          if (ttsAudioRef.current) ttsAudioRef.current.currentTime = t;
                        }}
                        height={40}
                        color="#059669"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={ttsResult.supported ? 'text-blue-800' : 'text-amber'}>
                  <strong>{ttsResult.supported ? 'Not Available' : 'Not supported'}</strong>
                  {ttsResult.reason && <p className="mt-1">{ttsResult.reason}</p>}
                  {ttsResult.provider && (
                    <p className="mt-1 text-muted">Provider: {ttsResult.provider}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Guide result */}
          {guideResult && (
            <div className="space-y-3">
              {guideResult.guide && (
                <div className="p-4 bg-blue/5 rounded-xl">
                  <h4 className="font-bold text-[13px] text-ink mb-1">Guide</h4>
                  <p className="text-[14px] text-ink2 leading-relaxed">{guideResult.guide}</p>
                </div>
              )}
              {guideResult.ipaTranscription && (
                <div className="p-3 bg-parch2 rounded-xl flex items-center gap-3">
                  <span className="text-[11px] text-muted font-bold uppercase shrink-0">IPA</span>
                  <span className="text-[16px] text-ink font-mono">{guideResult.ipaTranscription}</span>
                </div>
              )}
              {guideResult.phoneticApproximation && (
                <div className="p-3 bg-parch2 rounded-xl flex items-center gap-3">
                  <span className="text-[11px] text-muted font-bold uppercase shrink-0">Phonetic</span>
                  <span className="text-[14px] text-ink2 italic">{guideResult.phoneticApproximation}</span>
                </div>
              )}
              {guideResult.reconstructionSystem && (
                <div className="text-[11px] text-ink3 italic">
                  Reconstruction: {guideResult.reconstructionSystem}
                </div>
              )}
              {guideResult.warnings &&
                guideResult.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-amber">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recording section */}
        <div className="card p-6">
          <RecorderWidget
            languageId={selectedLang}
            text={testText || lang?.sampleText || ''}
            ttsAudioUrl={ttsResult?.audioUrl ?? null}
          />
        </div>
      </div>
    </div>
  );
};
