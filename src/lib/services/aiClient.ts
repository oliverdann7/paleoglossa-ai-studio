import { z } from 'zod';
import { ImportedSentence } from '../../types/firestore.js';
import { apiFetch } from './apiFetch.js';

export class AIError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// ── Response schemas ─────────────────────────────────────────────────────

const SentenceAnalysisSchema = z.object({
  sentences: z.array(
    z.object({
      tokens: z.array(
        z.object({
          text: z.string(),
          lemma: z.string().optional().nullable(),
          normalized: z.string().optional().nullable(),
          type: z.string(),
          transliteration: z.string().optional().nullable(),
          gloss: z.string().optional().nullable(),
          pos: z.string().optional().nullable(),
          confidence: z.number().optional().nullable(),
        })
      ),
      translation: z.string().optional().nullable(),
    })
  ),
  aiAnalyzed: z.boolean().optional(),
  analysisStatus: z.string().optional(),
  confidence: z.number().nullable().optional(),
  warnings: z.array(z.string()).nullable().optional(),
});

const ExplainResponseSchema = z.object({
  explanation: z.string(),
});

const TextResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  warnings: z.array(z.string()).nullable().optional(),
});

const MetadataResponseSchema = z.object({
  difficulty: z.string(),
  tags: z.array(z.string()),
  summary: z.string(),
  period: z.string().optional(),
  genre: z.string().optional(),
  warnings: z.array(z.string()).nullable().optional(),
});

const SyntaxResponseSchema = z.object({
  explanation: z.string(),
  confidence: z.number().nullable().optional(),
  warnings: z.array(z.string()).nullable().optional(),
});

const QuizResponseSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).optional(),
  answer: z.string(),
  explanation: z.string(),
  confidence: z.number().nullable().optional(),
});

const TutorStartResponseSchema = z.object({
  sessionId: z.string(),
  greeting: z.string(),
  suggestedQuestions: z.array(z.string()),
});

const TutorMessageResponseSchema = z.object({
  text: z.string(),
  warnings: z.array(z.string()).optional(),
});

export class AIClient {
  // ── Core request with apiFetch (Bearer token for auth, skipAuth for anonymous) ──
  private static async request<T>(
    endpoint: string,
    payload: any,
    schema: z.ZodType<T>
  ): Promise<T> {
    try {
      // AI endpoints work anonymously (demo mode). Server-side quota tracking
      // uses optionalAuth to identify users when a Bearer token is available.
      const data = await apiFetch<T>(`/api/ai/${endpoint}`, {
        method: 'POST',
        body: payload,
        skipAuth: true,
      });

      const result = schema.safeParse(data);
      if (!result.success) {
        console.error(`AI Output Validation Failed for /api/ai/${endpoint}:`, result.error);
        throw new AIError('Received malformed response from AI', 'MALFORMED_RESPONSE');
      }
      return result.data;
    } catch (err: any) {
      if (err instanceof AIError) throw err;
      if (err.name === 'AbortError') {
        throw new AIError('Request timed out', 'NETWORK_ERROR');
      }
      if (err.name === 'ApiError') {
        throw new AIError(err.message, err.code);
      }
      if (err.name === 'AuthRequiredError') {
        throw new AIError('Authentication required for this AI feature', 'AUTH_REQUIRED');
      }
      throw new AIError(err.message || 'Unknown AI Error', 'UNKNOWN');
    }
  }

  // ── Public methods ──────────────────────────────────────────────────────

  static async analyzeText(
    languageId: string,
    rawText: string
  ): Promise<{
    sentences: ImportedSentence[];
    aiAnalyzed?: boolean;
    analysisStatus?: string;
    confidence?: number | null;
    warnings?: string[] | null;
  }> {
    const data = await this.request('analyze', { languageId, rawText }, SentenceAnalysisSchema);
    return {
      sentences: data.sentences as ImportedSentence[],
      aiAnalyzed: data.aiAnalyzed,
      analysisStatus: data.analysisStatus,
      confidence: data.confidence,
      warnings: data.warnings,
    };
  }

  static async extractFromImage(
    languageId: string,
    imageBase64: string,
    mimeType: string
  ): Promise<string> {
    const data = await this.request(
      'ocr',
      { languageId, imageBase64, mimeType },
      TextResponseSchema
    );
    return data.text;
  }

  static async translateSentence(languageId: string, sentence: string): Promise<string> {
    const data = await this.request(
      'translate',
      { languageId, tokens: [sentence] },
      TextResponseSchema
    );
    return data.text;
  }

  static async explainWord(languageId: string, word: string, lemma: string): Promise<string> {
    const data = await this.request(
      'explain',
      { languageId, word, lemma, type: 'word' },
      ExplainResponseSchema
    );
    return data.explanation;
  }

  static async explainPhrase(languageId: string, phrase: string): Promise<string> {
    const data = await this.request(
      'explain',
      { languageId, phrase, type: 'phrase' },
      ExplainResponseSchema
    );
    return data.explanation;
  }

  static async getParadigm(languageId: string, word: string, lemma: string): Promise<string> {
    const data = await this.request(
      'explain',
      { languageId, word, lemma, type: 'paradigm' },
      ExplainResponseSchema
    );
    return data.explanation;
  }

  static async scrapeUrl(url: string): Promise<string> {
    const data = await this.request('scrape', { url }, TextResponseSchema);
    return data.text;
  }

  static async generateLessonMetadata(languageId: string, rawText: string) {
    return this.request('metadata', { languageId, rawText }, MetadataResponseSchema);
  }

  static async generateAudioPronunciationGuide(languageId: string, text: string) {
    return this.request('pronunciation', { languageId, text }, TextResponseSchema);
  }

  static async startTutorSession(
    languageId: string,
    textId?: string
  ): Promise<{
    sessionId: string;
    greeting: string;
    suggestedQuestions: string[];
  }> {
    return this.request('tutor/start', { languageId, textId }, TutorStartResponseSchema);
  }

  static async sendTutorMessage(
    sessionId: string,
    message: string,
    context?: {
      textId?: string;
      sentenceIndex?: number;
      lemma?: string;
      sentenceText?: string;
      selectedToken?: string;
      morphology?: Record<string, string>;
      gloss?: string;
    }
  ): Promise<{ text: string; warnings?: string[] }> {
    return this.request(
      'tutor/message',
      { sessionId, message, context },
      TutorMessageResponseSchema
    );
  }

  static async generateMorphologyQuiz(
    languageId: string,
    lemma: string,
    form: string
  ): Promise<{
    question: string;
    choices?: string[];
    answer: string;
    explanation: string;
    confidence?: number | null;
  }> {
    return this.request(
      'quiz',
      { languageId, lemma, form, type: 'morphology' },
      QuizResponseSchema
    );
  }

  static async analyzeSyntax(languageId: string, sentence: string): Promise<string> {
    const data = await this.request('syntax', { languageId, sentence }, SyntaxResponseSchema);
    return data.explanation;
  }
}
