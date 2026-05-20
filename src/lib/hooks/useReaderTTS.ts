import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReaderSentence } from '@/types/reader';

const TTS_LANG_MAP: Record<string, string> = {
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

const HEBREW_LANGS = new Set(['hbo', 'arc', 'syr']);

interface UseReaderTTSOptions {
  sentences: ReaderSentence[];
  currentLanguageId: string;
  audioSpeed: number;
  isPlaying: boolean;
  loopSentence: boolean;
  loopWord: boolean;
  audioPos: { sentenceIdx: number; wordIdx: number };
  readingMode: 'scroll' | 'page';
  onSetAudioPosition: (sentenceIdx: number, wordIdx: number) => void;
  onSetPlayState: (playing: boolean) => void;
  onSetSentenceIndex: (idx: number) => void;
}

export interface UseReaderTTSResult {
  /** 0–1 progress: sentence playback progress (sentence mode) or chapter position (word mode) */
  audioProgress: number;
}

export function useReaderTTS({
  sentences,
  currentLanguageId,
  audioSpeed,
  isPlaying,
  loopSentence,
  loopWord,
  audioPos,
  readingMode,
  onSetAudioPosition,
  onSetPlayState,
  onSetSentenceIndex,
}: UseReaderTTSOptions): UseReaderTTSResult {
  // Map<sentenceIdx, HTMLAudioElement | null>  (null = API returned no audio)
  const audioCache = useRef<Map<number, HTMLAudioElement | null>>(new Map());
  const fetchingRef = useRef<Set<number>>(new Set());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const getSentenceText = useCallback(
    (idx: number): string => {
      const sentence = sentences[idx];
      if (!sentence) return '';
      return sentence.tokens
        .filter((t) => t.type !== 'whitespace' && t.type !== 'punctuation' && t.text)
        .map((t) => t.text)
        .join(' ');
    },
    [sentences]
  );

  // Pre-fetch the next sentence while current one is playing
  useEffect(() => {
    if (!isPlaying) return;
    const next = audioPos.sentenceIdx + 1;
    if (next >= sentences.length) return;
    if (audioCache.current.has(next) || fetchingRef.current.has(next)) return;

    const text = getSentenceText(next);
    if (!text) return;

    fetchingRef.current.add(next);
    fetch('/api/audio/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId: currentLanguageId, text }),
    })
      .then((r) => r.json())
      .then((data) => {
        fetchingRef.current.delete(next);
        const el = data.audioUrl ? new Audio(data.audioUrl) : null;
        audioCache.current.set(next, el);
      })
      .catch(() => {
        fetchingRef.current.delete(next);
        audioCache.current.set(next, null);
      });
  }, [audioPos.sentenceIdx, isPlaying, sentences.length, currentLanguageId, getSentenceText]);

  // Main playback effect — deps include wordIdx so word-mode timers fire correctly
  useEffect(() => {
    if (!isPlaying) {
      currentAudio.current?.pause();
      window.speechSynthesis?.cancel();
      return;
    }

    const { sentenceIdx, wordIdx } = audioPos;
    const sentence = sentences[sentenceIdx];
    if (!sentence) {
      onSetPlayState(false);
      return;
    }

    let cancelled = false;
    let wordTimer: ReturnType<typeof setTimeout> | null = null;

    function startWordMode() {
      const token = sentence.tokens[wordIdx];
      if (token && token.type !== 'whitespace' && token.text && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(token.text);
        u.lang = TTS_LANG_MAP[currentLanguageId] || 'el-GR';
        u.rate = Math.min(audioSpeed, 1.1);
        window.speechSynthesis.speak(u);
      }

      const delay = (HEBREW_LANGS.has(currentLanguageId) ? 180 : 150) / audioSpeed;

      wordTimer = setTimeout(() => {
        if (cancelled) return;
        if (loopWord) return;
        if (wordIdx < sentence.tokens.length - 1) {
          onSetAudioPosition(sentenceIdx, wordIdx + 1);
        } else if (loopSentence) {
          onSetAudioPosition(sentenceIdx, 0);
        } else if (sentenceIdx < sentences.length - 1) {
          const next = sentenceIdx + 1;
          onSetAudioPosition(next, 0);
          if (readingMode === 'page') onSetSentenceIndex(next);
        } else {
          onSetPlayState(false);
          onSetAudioPosition(0, 0);
        }
      }, delay);

      // Progress in word mode: coarse chapter position
      setAudioProgress(sentences.length > 0 ? sentenceIdx / sentences.length : 0);
    }

    async function run() {
      // Only attempt API fetch at sentence start (wordIdx === 0)
      if (wordIdx === 0 && !audioCache.current.has(sentenceIdx)) {
        const text = getSentenceText(sentenceIdx);
        if (text && !fetchingRef.current.has(sentenceIdx)) {
          fetchingRef.current.add(sentenceIdx);
          try {
            const res = await fetch('/api/audio/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ languageId: currentLanguageId, text }),
            });
            const data = await res.json();
            fetchingRef.current.delete(sentenceIdx);
            if (!cancelled) {
              const el = data.audioUrl ? new Audio(data.audioUrl) : null;
              audioCache.current.set(sentenceIdx, el);
            }
          } catch {
            fetchingRef.current.delete(sentenceIdx);
            audioCache.current.set(sentenceIdx, null);
          }
        } else {
          // Text empty or fetch in flight — fall through to word mode
          audioCache.current.set(sentenceIdx, null);
        }
      }

      if (cancelled) return;

      const audio = audioCache.current.get(sentenceIdx) ?? null;

      if (audio && wordIdx === 0) {
        // Sentence-level playback
        currentAudio.current?.pause();
        currentAudio.current = audio;
        audio.playbackRate = Math.min(audioSpeed, 2);
        audio.currentTime = 0;
        setAudioProgress(0);

        const onTimeUpdate = () => {
          if (audio.duration) setAudioProgress(audio.currentTime / audio.duration);
        };
        audio.addEventListener('timeupdate', onTimeUpdate);

        audio.onended = () => {
          audio.removeEventListener('timeupdate', onTimeUpdate);
          if (cancelled || !isPlayingRef.current) return;

          if (loopSentence || loopWord) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
            return;
          }

          if (sentenceIdx < sentences.length - 1) {
            const next = sentenceIdx + 1;
            onSetAudioPosition(next, 0);
            if (readingMode === 'page') onSetSentenceIndex(next);
          } else {
            onSetPlayState(false);
            onSetAudioPosition(0, 0);
            setAudioProgress(0);
          }
        };

        audio.play().catch(() => {
          // Browser blocked autoplay — fall back to word mode
          audio.removeEventListener('timeupdate', onTimeUpdate);
          audio.onended = null;
          currentAudio.current = null;
          if (!cancelled) startWordMode();
        });
      } else {
        // No API audio or mid-sentence (wordIdx > 0) — word-by-word fallback
        startWordMode();
      }
    }

    run();

    return () => {
      cancelled = true;
      if (wordTimer) clearTimeout(wordTimer);
      currentAudio.current?.pause();
      window.speechSynthesis?.cancel();
    };
    // Stable callbacks (from useReducer/useCallback) are safe to omit from deps.
    // audioSpeed/loopSentence/loopWord are intentionally omitted: changing speed mid-sentence
    // should not restart the current audio; the next sentence picks up the new values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, audioPos.sentenceIdx, audioPos.wordIdx]);

  // Clear cache when language changes (different voice needed)
  useEffect(() => {
    audioCache.current.clear();
    fetchingRef.current.clear();
    currentAudio.current?.pause();
    currentAudio.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAudioProgress(0);
  }, [currentLanguageId]);

  return { audioProgress };
}
