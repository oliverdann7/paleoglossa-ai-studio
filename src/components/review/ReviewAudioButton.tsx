import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { AudioService } from '../../lib/services/audioService.js';

type PlayState = 'idle' | 'loading' | 'playing';

/**
 * The button that is speaking, if any. A card can show two (question and
 * answer); starting one silences the other instead of talking over it.
 */
let haltSpeaking: (() => void) | null = null;

interface ReviewAudioButtonProps {
  /** The target-language text to pronounce (the card's headword/term). */
  text: string;
  languageId: string;
  label: string;
  className?: string;
  /**
   * Play as soon as this text is shown, without a tap. Silent if there is no
   * recorded voice: the browser's own voice is only used when asked for.
   */
  autoPlay?: boolean;
}

/**
 * Tap-to-hear pronunciation for a review card. Fetches server TTS once per
 * (text, language) and replays from cache; cancels cleanly when the card
 * changes or the component unmounts so audio never bleeds across cards.
 */
export function ReviewAudioButton({
  text,
  languageId,
  label,
  className,
  autoPlay = false,
}: ReviewAudioButtonProps) {
  const [state, setState] = useState<PlayState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCacheRef = useRef<string | null>(null);
  // Bumped whenever the spoken target changes; in-flight async work checks it
  // against its captured value and bails if the card has since moved on.
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Reset cache + stop playback whenever the target word or language changes.
  useEffect(() => {
    tokenRef.current += 1;
    urlCacheRef.current = null;
    stop();
    // Reset to idle when the card moves on; guarded so it's a no-op (no
    // cascading render) when already idle. Matches the codebase precedent in
    // useMediaQuery for an unavoidable in-effect sync.
    setState((prev) => (prev === 'idle' ? prev : 'idle')); // eslint-disable-line react-hooks/set-state-in-effect
    return stop;
  }, [text, languageId, stop]);

  const speakFallback = useCallback(
    (token: number) => {
      // Browser SpeechSynthesis as a last resort when the server returns no
      // audio (e.g. transient TTS outage). Best-effort, no progress tracking.
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setState('idle');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        if (tokenRef.current === token) setState('idle');
      };
      utterance.onerror = () => {
        if (tokenRef.current === token) setState('idle');
      };
      window.speechSynthesis.speak(utterance);
    },
    [text]
  );

  const halt = useCallback(() => {
    tokenRef.current += 1;
    stop();
    setState('idle');
  }, [stop]);

  useEffect(
    () => () => {
      if (haltSpeaking === halt) haltSpeaking = null;
    },
    [halt]
  );

  const play = useCallback(
    async (allowBrowserVoice: boolean) => {
      if (haltSpeaking && haltSpeaking !== halt) haltSpeaking();
      haltSpeaking = halt;
      const token = tokenRef.current;
      setState('loading');

      let url = urlCacheRef.current;
      if (!url) {
        url = await AudioService.generateTTS(text, languageId);
        if (tokenRef.current !== token) return; // card changed mid-fetch
        urlCacheRef.current = url;
      }

      if (!url) {
        if (allowBrowserVoice) speakFallback(token);
        else setState('idle');
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (tokenRef.current === token) setState('idle');
      };
      audio.onerror = () => {
        if (tokenRef.current === token) setState('idle');
      };
      setState('playing');
      audio.play().catch(() => {
        if (tokenRef.current !== token) return;
        audioRef.current = null;
        // A browser that blocks unprompted sound rejects here; stay quiet then.
        if (allowBrowserVoice) speakFallback(token);
        else setState('idle');
      });
    },
    [text, languageId, speakFallback, halt]
  );

  const handleClick = useCallback(() => {
    if (state === 'playing' || state === 'loading') {
      stop();
      setState('idle');
      return;
    }
    void play(true);
  }, [state, stop, play]);

  // Declared after the reset effect above, so it runs once that has cleared
  // the previous card's audio.
  useEffect(() => {
    // Starting playback is the point of this effect; its "loading" state is
    // part of that (same unavoidable in-effect sync as the reset above).
    if (autoPlay) void play(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [autoPlay, play]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={
        className ??
        'inline-flex items-center justify-center w-10 h-10 rounded-full text-blue bg-blue/10 hover:bg-blue/20 active:scale-95 transition-all shrink-0'
      }
    >
      {state === 'loading' ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
      ) : (
        <Volume2 className={`w-5 h-5 ${state === 'playing' ? 'animate-pulse' : ''}`} aria-hidden />
      )}
    </button>
  );
}
