import { apiFetch } from './apiFetch.js';
import { aiFetch } from './aiConsent.js';

export interface PronunciationGuide {
  word: string;
  ipa: string;
  syllables: Syllable[];
  audioUrl?: string;
}

export interface Syllable {
  text: string;
  stress: boolean;
  duration: number;
}

/** Words and sentences are a few KB each as data URLs; keep a session's worth. */
const TTS_CLIENT_CACHE_MAX = 150;
const ttsUrls = new Map<string, string>();
const ttsPending = new Map<string, Promise<string | null>>();

export class AudioService {
  /**
   * Synthesised speech for a text, as a playable URL, or null when there is
   * none. Successful results are kept for the session and concurrent requests
   * for the same text share one call, so replaying a card, meeting it again or
   * preloading the next one costs nothing extra.
   */
  static generateTTS(text: string, languageId: string): Promise<string | null> {
    const key = `${languageId}\u0000${text}`;
    const known = ttsUrls.get(key);
    if (known) return Promise.resolve(known);
    const pending = ttsPending.get(key);
    if (pending) return pending;

    const request = apiFetch<{ audioUrl: string | null }>('/api/audio/tts', {
      method: 'POST',
      body: { text, languageId },
      skipAuth: true,
    })
      .then((data) => data.audioUrl || null)
      .catch(() => null)
      .then((url) => {
        ttsPending.delete(key);
        if (url) {
          if (ttsUrls.size >= TTS_CLIENT_CACHE_MAX) {
            ttsUrls.delete(ttsUrls.keys().next().value!);
          }
          ttsUrls.set(key, url);
        }
        return url;
      });
    ttsPending.set(key, request);
    return request;
  }

  /** Forget cached speech (tests). */
  static clearTTSCache(): void {
    ttsUrls.clear();
    ttsPending.clear();
  }

  static async getPronunciationGuide(
    text: string,
    languageId: string
  ): Promise<PronunciationGuide | null> {
    try {
      const response = await aiFetch('/api/ai/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId, text }),
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}
