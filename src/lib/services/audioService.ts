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
  static async generateTTS(text: string, languageId: string, userId?: string): Promise<string | null> {
    try {
      const response = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'X-User-Id': userId } : {}),
        },
        body: JSON.stringify({ text, languageId }),
      });
      if (!response.ok) return null;
      const data = await response.json();
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

  static async saveRecording(userId: string, recording: Blob, metadata: {
    textId?: string;
    sentenceIndex?: number;
    wordIndex?: number;
  }): Promise<string | null> {
    const formData = new FormData();
    formData.append('audio', recording);
    if (metadata.textId) formData.append('textId', metadata.textId);
    if (metadata.sentenceIndex !== undefined) formData.append('sentenceIndex', String(metadata.sentenceIndex));
    if (metadata.wordIndex !== undefined) formData.append('wordIndex', String(metadata.wordIndex));

    try {
      const response = await fetch(`/api/audio/recordings?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.audioUrl || null;
    } catch {
      return null;
    }
  }
}
