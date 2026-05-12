import { z } from 'zod';
import { ImportedSentence } from '../../types/firestore';

export interface AIClientOptions {
  userId?: string;
}

export class AIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIError';
  }
}

// Validation schemas
const SentenceAnalysisSchema = z.object({
  sentences: z.array(z.object({
    tokens: z.array(z.object({
      text: z.string(),
      lemma: z.string().optional().nullable(),
      normalized: z.string().optional().nullable(),
      type: z.string(),
      transliteration: z.string().optional().nullable(),
      gloss: z.string().optional().nullable(),
      pos: z.string().optional().nullable(),
      confidence: z.number().optional().nullable()
    })),
    translation: z.string().optional().nullable()
  }))
});

const ExplainResponseSchema = z.object({
  explanation: z.string()
});

const TextResponseSchema = z.object({
  text: z.string()
});

const MetadataResponseSchema = z.object({
  difficulty: z.string(),
  tags: z.array(z.string()),
  summary: z.string()
});

export class AIClient {
  private static async request<T>(endpoint: string, payload: any, schema: z.ZodType<T>, userId?: string): Promise<T> {
    try {
      const url = `/api/ai/${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'X-User-Id': userId } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData: any = {};
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const text = await response.text().catch(() => '');
          console.error(`Server returned non-JSON response from ${url}: ${text.slice(0, 200)}`);
          throw new AIError(`Server returned an invalid response from ${url}`, 'INVALID_SERVER_RESPONSE');
        }
        if (response.status === 429) throw new AIError('Rate limit exceeded. Please try again later.', 'QUOTA_EXCEEDED');
        throw new AIError(errorData.error || `Server error: ${response.status}`, errorData.code || 'SERVER_ERROR');
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        console.error(`Invalid JSON from ${url}: ${text.slice(0, 200)}`);
        throw new AIError(`Server returned an invalid response from ${url}`, 'INVALID_SERVER_RESPONSE');
      }
      
      // Validate structure to never trust AI output blindly
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error(`AI Output Validation Failed for ${url}: `, result.error);
        throw new AIError('Received malformed response from AI', 'MALFORMED_RESPONSE');
      }

      return result.data;
    } catch (err: any) {
      if (err instanceof AIError) throw err;
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        throw new AIError('Network error or timeout connecting to AI service', 'NETWORK_ERROR');
      }
      throw new AIError(err.message || 'Unknown AI Error', 'UNKNOWN');
    }
  }

  static async analyzeText(languageId: string, rawText: string, userId?: string): Promise<ImportedSentence[]> {
    const data = await this.request('analyze', { languageId, rawText }, SentenceAnalysisSchema, userId);
    return data.sentences as ImportedSentence[];
  }

  static async extractFromImage(languageId: string, imageBase64: string, mimeType: string, userId?: string): Promise<string> {
    const data = await this.request('ocr', { languageId, imageBase64, mimeType }, TextResponseSchema, userId);
    return data.text;
  }

  static async translateSentence(languageId: string, sentence: string, userId?: string): Promise<string> {
    const data = await this.request('translate', { languageId, tokens: [sentence] }, TextResponseSchema, userId);
    return data.text;
  }

  static async explainWord(languageId: string, word: string, lemma: string, userId?: string): Promise<string> {
    const data = await this.request('explain', { languageId, word, lemma, type: 'word' }, ExplainResponseSchema, userId);
    return data.explanation;
  }

  static async explainPhrase(languageId: string, phrase: string, userId?: string): Promise<string> {
    const data = await this.request('explain', { languageId, phrase, type: 'phrase' }, ExplainResponseSchema, userId);
    return data.explanation;
  }
  
  static async getParadigm(languageId: string, word: string, lemma: string, userId?: string): Promise<string> {
    const data = await this.request('explain', { languageId, word, lemma, type: 'paradigm' }, ExplainResponseSchema, userId);
    return data.explanation;
  }

  static async scrapeUrl(url: string, userId?: string): Promise<string> {
    const data = await this.request('scrape', { url }, TextResponseSchema, userId);
    return data.text;
  }

  static async generateLessonMetadata(languageId: string, rawText: string, userId?: string) {
    return this.request('metadata', { languageId, rawText }, MetadataResponseSchema, userId);
  }

  static async generateAudioPronunciationGuide(languageId: string, text: string, userId?: string) {
    return this.request('pronunciation', { languageId, text }, TextResponseSchema, userId);
  }

  static async startTutorSession(languageId: string, textId?: string, userId?: string): Promise<string> {
    const data = await this.request('tutor/start', { languageId, textId }, TextResponseSchema, userId);
    return data.text;
  }

  static async sendTutorMessage(sessionId: string, message: string, context?: {
    textId?: string; sentenceIndex?: number; lemma?: string;
  }, userId?: string): Promise<string> {
    const data = await this.request('tutor/message', { sessionId, message, context }, TextResponseSchema, userId);
    return data.text;
  }

  static async generateMorphologyQuiz(languageId: string, lemma: string, form: string, userId?: string): Promise<string> {
    const data = await this.request('quiz', { languageId, lemma, form, type: 'morphology' }, TextResponseSchema, userId);
    return data.text;
  }

  static async analyzeSyntax(languageId: string, sentence: string, userId?: string): Promise<string> {
    const data = await this.request('syntax', { languageId, sentence }, TextResponseSchema, userId);
    return data.text;
  }
}
