import { apiFetch } from './apiFetch';

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

export class AudioService {
  static async generateTTS(text: string, languageId: string): Promise<string | null> {
    try {
      const data = await apiFetch<{ audioUrl: string | null }>('/api/audio/tts', {
        method: 'POST',
        body: { text, languageId },
        skipAuth: true,
      });
      return data.audioUrl || null;
    } catch {
      return null;
    }
  }

  static async getPronunciationGuide(text: string, languageId: string): Promise<PronunciationGuide | null> {
    try {
      const response = await fetch('/api/ai/pronunciation', {
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
