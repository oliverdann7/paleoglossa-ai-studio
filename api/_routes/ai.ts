import { Router } from 'express';
import { basicAnalyze } from '../_lib/basicAnalyze.js';
import { parseAndValidateAIResponse } from '../_lib/aiValidation.js';
import {
  LANGUAGE_INSTRUCTIONS,
  getLanguageName,
  BASE_JSON_SCHEMA,
  buildTutorPrompt,
  LANGUAGE_SUGGESTED_QUESTIONS,
  DEFAULT_SUGGESTED_QUESTIONS,
  buildSentenceAnalysisPrompt,
  buildCourseQuizPrompt,
  type SentenceAnalysisResult,
  type CourseQuizResult,
} from '../_lib/aiPrompts.js';
import { requireAuth, optionalAuth } from '../_lib/auth.js';
import { checkAndIncrementUsage } from '../_lib/aiUsage.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

const MAX_TEXT_LENGTH = 100000;
const MAX_TEXT_LENGTH_HUMAN = '100,000';

function computeOverallConfidence(
  sentences: { tokens: { confidence: number | null }[] }[]
): number | null {
  const allConfidences: number[] = [];
  for (const s of sentences) {
    for (const t of s.tokens) {
      if (t.confidence !== null && t.confidence !== undefined) {
        allConfidences.push(t.confidence);
      }
    }
  }
  if (allConfidences.length === 0) return null;
  return allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
const MAX_IMAGE_BASE64_LENGTH = 14 * 1024 * 1024; // ~10MB raw image

function isPrivateIP(hostname: string): boolean {
  return /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|0\.0\.0\.0$|localhost$|.*\.local$)/.test(
    hostname
  );
}

function isValidScrapeUrl(urlString: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only http and https URLs are allowed' };
  }
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    return { valid: false, reason: 'Localhost URLs are not allowed' };
  }
  if (isPrivateIP(parsed.hostname)) {
    return { valid: false, reason: 'Private IP ranges are not allowed' };
  }
  return { valid: true };
}

const LANGUAGE_RECONSTRUCTION_NOTES: Record<string, string> = {
  grc: 'Ancient Greek pronunciation is reconstructed. The exact phonetics of the classical period (5th–4th c. BCE) are scholarly approximations based on meter, spelling errors, and comparative linguistics.',
  'grc-koine':
    'Koine Greek pronunciation shifted from classical. This synthesis uses the reconstructed Erasmian-influenced system common in academic contexts.',
  lat: 'Restored Classical pronunciation (1st c. BCE–1st c. CE) based on consensus of historical linguists. Medieval/Ecclesiastical pronunciation differs.',
  hbo: 'Biblical Hebrew pronunciation follows the Tiberian tradition. Vowel quality and some consonants are reconstructed.',
  syr: 'Syriac pronunciation follows the Western (Serto) tradition. Eastern and Western traditions differ significantly.',
  cop: 'Coptic pronunciation follows the Bohairic tradition used in liturgical contexts. Ancient phonetics are partially reconstructed.',
  arc: 'Aramaic pronunciation is reconstructed from vocalized manuscripts and comparative Semitic data.',
  akk: 'Akkadian pronunciation is reconstructed from cuneiform writing, which does not record vowels fully. Significant uncertainty remains.',
  san: 'Sanskrit pronunciation follows the Paninian tradition preserved in oral recitation. Ancient phonetics are well understood.',
  egy: 'Egyptian pronunciation is highly uncertain. The conventional Egyptological pronunciation used in the field bears unknown resemblance to ancient speech.',
  hit: 'Hittite pronunciation is partially reconstructed from cuneiform spelling. Significant gaps remain.',
};

async function lookupUserPlan(uid: string): Promise<string> {
  try {
    const adminDb_ = getAdminDb();
    if (!adminDb_) return 'free';
    const snap = await adminDb_.doc('users/' + uid).get();
    if (!snap.exists) return 'free';
    const data = snap.data();
    return (data?.currentPlan as string) || 'free';
  } catch {
    return 'free';
  }
}

router.post('/api/ai/analyze', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { languageId, rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({
        error: 'rawText is required and must be a non-empty string',
        code: 'INVALID_INPUT',
        field: 'rawText',
      });
    }
    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({
        error: 'languageId is required',
        code: 'INVALID_INPUT',
        field: 'languageId',
      });
    }
    if (rawText.length > MAX_TEXT_LENGTH) {
      return res.status(413).json({
        error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH_HUMAN} characters. Received ${rawText.length} characters.`,
        code: 'TEXT_TOO_LARGE',
        maxLength: MAX_TEXT_LENGTH,
        received: rawText.length,
      });
    }

    const langName = getLanguageName(languageId);

    const apiKey = process.env.GEMINI_API_KEY;
    let geminiAttempted = false;
    let aiWarnings: string[] = [];

    const uid = req.user?.uid;
    if (apiKey && uid) {
      const planId = await lookupUserPlan(uid);
      const quota = await checkAndIncrementUsage(uid, planId, 'analyze', rawText.length);
      if (!quota.allowed) {
        return res.status(429).json({
          error: 'Daily AI analysis limit reached. Upgrade your plan for more.',
          code: 'QUOTA_EXCEEDED',
          remaining: quota.remaining,
          resetDate: quota.resetDate,
          planLimit: quota.planLimit,
        });
      }
    }

    if (apiKey) {
      geminiAttempted = true;
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const genAI = new GoogleGenAI({ apiKey });

        const langInstruction = LANGUAGE_INSTRUCTIONS[languageId]
          ? LANGUAGE_INSTRUCTIONS[languageId]
          : `Language: ${langName}. Analyze the text and return the JSON schema accurately.`;

        const prompt = `You are a classical language morphology engine. Analyze the following ${langName} text.

${langInstruction}

Return ONLY valid JSON matching this exact schema — no markdown, no explanation:

${BASE_JSON_SCHEMA}

Rules:
- Split text into sentences at natural boundaries (. ! ?)
- For each token: text=original, lemma=base form, normalized=lowercase variant
- type must be exactly one of: word, punctuation, number, whitespace
- Set transliteration, gloss, pos to null if uncertain
- confidence must be 0.0-1.0 (1.0 = certain, 0.5 = unsure, 0.0 = unable to determine)
- translation may be null
- Do not include markdown code blocks or any text outside the JSON

Text to analyze:
${rawText.slice(0, 20000)}`;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });

        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const { data: validated, warnings } = parseAndValidateAIResponse(text);
        aiWarnings = warnings;

        if (validated) {
          return res.status(200).json({
            sentences: validated.sentences,
            aiAnalyzed: true,
            analysisStatus: 'analyzed',
            confidence: computeOverallConfidence(validated.sentences),
            warnings: aiWarnings.length > 0 ? aiWarnings : undefined,
          });
        }

        aiWarnings.push('Gemini returned unparseable response');
        if (warnings.length > 0) aiWarnings.push(...warnings);
        console.warn('[ai/analyze] Gemini unparseable, using fallback');
      } catch (geminiErr: any) {
        aiWarnings.push('Gemini API call failed: ' + geminiErr.message);
        console.error('[ai/analyze] Gemini API call failed:', geminiErr.message);
      }
    }

    const result = basicAnalyze(rawText);
    const fallbackSentences = result.sentences.map((s) => ({
      tokens: s.tokens.map((t) => ({
        text: t.text,
        lemma: t.lemma,
        normalized: t.normalized,
        type: t.type,
        transliteration: t.transliteration,
        gloss: t.gloss,
        pos: t.pos,
        confidence: t.confidence,
      })),
      translation: s.translation,
    }));

    return res.status(200).json({
      sentences: fallbackSentences,
      aiAnalyzed: false,
      analysisStatus: 'raw',
      confidence: null,
      warnings: geminiAttempted
        ? aiWarnings.length > 0
          ? aiWarnings
          : undefined
        : ['Gemini API key not configured. Using basic tokenization.'],
    });
  } catch (err: any) {
    console.error('[ai/analyze] Unexpected error:', err);
    return res.status(500).json({
      error: 'Internal server error during analysis',
      code: 'INTERNAL_ERROR',
    });
  }
});

router.post('/api/ai/ocr', async (req: any, res: any) => {
  try {
    const { languageId, imageBase64, mimeType } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res
        .status(400)
        .json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res
        .status(400)
        .json({ error: 'imageBase64 is required', code: 'INVALID_INPUT', field: 'imageBase64' });
    }
    if (!mimeType || !ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: `Unsupported image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        code: 'INVALID_INPUT',
        field: 'mimeType',
      });
    }
    if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return res.status(413).json({
        error: 'Image too large. Maximum size is approximately 10 MB.',
        code: 'IMAGE_TOO_LARGE',
        maxBase64Length: MAX_IMAGE_BASE64_LENGTH,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'OCR is unavailable: GEMINI_API_KEY is not configured on the server.',
        code: 'OCR_UNAVAILABLE',
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    const prompt = `Extract all visible text from this image of a ${langName} manuscript or document.

Rules:
- Preserve the original script exactly as written (including ancient scripts).
- Preserve line breaks and paragraph structure.
- Do not summarize, translate, or interpret — transcribe ONLY what you see.
- If a character or word is illegible, mark it with [illegible].
- If you are uncertain about a reading, mark it with [?] and note it.
- Return ONLY the transcribed text, nothing else. No markdown, no explanations.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    let response: any;
    try {
      response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
          },
        ],
      });
    } finally {
      clearTimeout(timeout);
    }

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:text)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    const hasUncertainty = cleaned.includes('[illegible]') || cleaned.includes('[?]');
    const warnings: string[] = [];
    if (!cleaned) {
      warnings.push('No text could be extracted from the image.');
    }
    if (hasUncertainty) {
      warnings.push('Some characters were uncertain and marked with brackets.');
    }

    res.status(200).json({
      text: cleaned,
      confidence: null,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    const message = isTimeout
      ? 'OCR timed out — try a smaller or clearer image.'
      : err?.message || 'Unknown error';
    console.error('[ai/ocr] Error:', message);
    res.status(500).json({
      error: message,
      code: isTimeout ? 'OCR_TIMEOUT' : 'OCR_ERROR',
    });
  }
});

router.post('/api/ai/translate', async (req: any, res: any) => {
  try {
    const { languageId, tokens } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res
        .status(400)
        .json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res
        .status(400)
        .json({
          error: 'tokens must be a non-empty array of strings',
          code: 'INVALID_INPUT',
          field: 'tokens',
        });
    }

    const sentence = tokens.join(' ').trim();
    if (!sentence) {
      return res
        .status(400)
        .json({
          error: 'Sentence text is empty after joining tokens',
          code: 'INVALID_INPUT',
          field: 'tokens',
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(200)
        .json({
          text: sentence,
          confidence: null,
          notes: 'Gemini API key not configured. Returning original text.',
        });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `Translate the following ${getLanguageName(languageId)} sentence into fluent English.

Rules:
- Provide a natural, idiomatic English translation.
- If the text is fragmentary or uncertain, mark uncertain portions with [brackets] and add a note.
- Do not include markdown, explanations, or code fences — return ONLY the translation text.

Sentence: ${sentence}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:text)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    const notes = cleaned.includes('[')
      ? 'Translation contains uncertain portions marked with brackets'
      : undefined;

    res.status(200).json({
      text: cleaned || sentence,
      confidence: cleaned ? null : null,
      notes,
    });
  } catch (err: any) {
    console.error('[ai/translate] Error:', err.message);
    res
      .status(500)
      .json({ error: 'Translation failed', code: 'TRANSLATE_ERROR', text: '', confidence: null });
  }
});

router.post('/api/ai/explain', async (req: any, res: any) => {
  try {
    const { languageId, word, lemma, phrase, type } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res
        .status(400)
        .json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }

    if (!type || !['word', 'phrase', 'paradigm'].includes(type)) {
      return res
        .status(400)
        .json({
          error: 'type must be one of: word, phrase, paradigm',
          code: 'INVALID_INPUT',
          field: 'type',
        });
    }

    if (type === 'phrase' && (!phrase || typeof phrase !== 'string')) {
      return res
        .status(400)
        .json({
          error: 'phrase is required for type=phrase',
          code: 'INVALID_INPUT',
          field: 'phrase',
        });
    }

    if (
      type !== 'phrase' &&
      (!word || typeof word !== 'string' || !lemma || typeof lemma !== 'string')
    ) {
      return res
        .status(400)
        .json({
          error: 'word and lemma are required for type=word or type=paradigm',
          code: 'INVALID_INPUT',
          field: 'word',
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(200)
        .json({ explanation: 'AI explanation not available — Gemini API key not configured.' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    let prompt: string;

    if (type === 'paradigm') {
      prompt = `You are a philologist specializing in ${langName}. Generate a complete paradigm (inflection table) for the word "${word}" (lemma: "${lemma}") in ${langName}.

Return a concise but thorough philological explanation. Include:

1. LEMMA AND PART OF SPEECH
2. PARADIGM TABLE — organized by person/number/tense as applicable for this part of speech. Use a simple text table with consistent spacing, not markdown.
3. KEY NOTES — any irregular forms, phonological shifts, or dialectal variants
4. USAGE NOTE — brief context on how this word is used in classical texts

Keep the response focused and learner-friendly. Use plain text with clear section headers (no markdown). If you are uncertain about any form, note it with [brackets].
`;
    } else if (type === 'phrase') {
      prompt = `You are a philologist specializing in ${langName}. Analyze the following phrase in ${langName}:

"${phrase}"

Return a concise but thorough philological explanation. Include:

1. PHRASE ANALYSIS — break down each word with lemma and gloss
2. SYNTAX — how the words relate to each other (agreement, case, etc.)
3. OVERALL GLOSS — idiomatic English translation
4. USAGE NOTE — brief context or literary reference if known

Keep the response focused and learner-friendly. Use plain text with clear section headers (no markdown). If you are uncertain about any element, note it with [brackets].
`;
    } else {
      prompt = `You are a philologist specializing in ${langName}. Analyze the word "${word}" (lemma: "${lemma}") in ${langName}.

Return a concise but thorough philological explanation. Include:

1. MORPHOLOGY — parse the form: person, number, tense, mood, voice, case, gender, etc.
2. GLOSS — the most likely English meaning(s) for this form
3. POSSIBLE PARSING — if the form is ambiguous, list alternate parsings
4. USAGE NOTE — brief context on how this word is used in classical texts

Keep the response focused and learner-friendly. Use plain text with clear section headers (no markdown). If you are uncertain about any element, note it with [brackets].
`;
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:text)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    res.status(200).json({ explanation: cleaned || 'No explanation could be generated.' });
  } catch (err: any) {
    console.error('[ai/explain] Error:', err.message);
    res
      .status(500)
      .json({
        explanation: 'Failed to generate explanation.',
        error: err.message,
        code: 'EXPLAIN_ERROR',
      });
  }
});

router.post('/api/ai/pronunciation', async (req: any, res: any) => {
  try {
    const { languageId, text, transliteration } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res
        .status(400)
        .json({
          guide: null,
          reconstructionSystem: null,
          warnings: ['languageId is required'],
          code: 'INVALID_INPUT',
        });
    }
    if (!text || typeof text !== 'string') {
      return res
        .status(400)
        .json({
          guide: null,
          reconstructionSystem: null,
          warnings: ['text is required'],
          code: 'INVALID_INPUT',
        });
    }

    const note = LANGUAGE_RECONSTRUCTION_NOTES[languageId] || null;
    const apiKey = process.env.GEMINI_API_KEY;
    const langName = getLanguageName(languageId);

    if (!apiKey) {
      return res.status(200).json({
        guide: null,
        reconstructionSystem: null,
        warnings: ['Gemini API key not configured. Pronunciation guide unavailable.'].concat(
          note ? [note] : []
        ),
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `You are a historical linguist specializing in ${langName}. Provide a pronunciation guide for this text.

Text: "${text}"
${transliteration ? `Transliteration: "${transliteration}"` : ''}

Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "guide": "Step-by-step pronunciation guide in plain English",
  "phoneticApproximation": "Approximate pronunciation using English examples",
  "ipaTranscription": "IPA transcription if confidently known, or null",
  "notes": "Notes on uncertainty or dialectal variation"
}

Rules:
- If the exact historical pronunciation is uncertain, state that clearly.
- For languages with reconstructed pronunciation (Akkadian, Egyptian, Hittite), add prominent uncertainty notes.
- If you cannot provide a guide, set guide to null and explain why in notes.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const textResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = textResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }

    const warnings: string[] = [];
    if (!parsed?.guide) warnings.push('Could not generate pronunciation guide.');
    if (note) warnings.push(note);
    if (parsed?.notes) warnings.push(parsed.notes);

    res.status(200).json({
      guide: parsed?.guide || null,
      phoneticApproximation: parsed?.phoneticApproximation || null,
      ipaTranscription: parsed?.ipaTranscription || null,
      reconstructionSystem: note ? 'reconstructed' : 'standard',
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err: any) {
    console.error('[ai/pronunciation] Error:', err.message);
    res.status(200).json({
      guide: null,
      reconstructionSystem: null,
      warnings: ['Pronunciation guide unavailable.'],
    });
  }
});

router.post('/api/ai/scrape', async (req: any, res: any) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required', code: 'INVALID_INPUT', text: '' });
    }

    const validation = isValidScrapeUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason, code: 'INVALID_INPUT', text: '' });
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Paleoglossa/1.0)' },
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({
          error: `Remote server returned ${response.status}`,
          code: 'FETCH_ERROR',
          text: '',
        });
    }

    const html = await response.text();

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50000);

    const warnings: string[] = [];
    if (!text) warnings.push('No readable text could be extracted from the URL.');
    if (response.headers.get('content-type')?.includes('pdf'))
      warnings.push('PDF content may not extract cleanly.');

    res
      .status(200)
      .json({ text, confidence: null, warnings: warnings.length > 0 ? warnings : undefined });
  } catch (err: any) {
    console.error('[ai/scrape] Error:', err.message);
    res
      .status(500)
      .json({ text: '', confidence: null, warnings: ['Failed to fetch URL: ' + err.message] });
  }
});

router.post('/api/ai/metadata', async (req: any, res: any) => {
  try {
    const { languageId, rawText } = req.body;

    if (!languageId || typeof languageId !== 'string' || !rawText || typeof rawText !== 'string') {
      return res
        .status(400)
        .json({
          error: 'languageId and rawText are required',
          code: 'INVALID_INPUT',
          difficulty: '',
          tags: [],
          summary: '',
          warnings: ['Invalid input'],
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(200)
        .json({
          difficulty: 'unknown',
          tags: [],
          summary: '',
          period: '',
          genre: '',
          warnings: ['Gemini API key not configured. Metadata unavailable.'],
        });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    const prompt = `Analyze the following ${langName} text and return ONLY valid JSON.

{
  "difficulty": "beginner|intermediate|advanced|unknown",
  "tags": ["tag1", "tag2"],
  "summary": "One sentence summary of the content.",
  "period": "historical period or empty string",
  "genre": "genre or empty string"
}

Rules:
- difficulty must be one of: beginner, intermediate, advanced, unknown
- tags should be 2-5 relevant keywords
- summary should be one sentence
- period and genre are optional guesses — leave empty if uncertain
- Do not include markdown. Return ONLY the JSON.

Text: ${rawText.slice(0, 5000)}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      res.status(200).json({
        difficulty: parsed.difficulty || 'unknown',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        summary: parsed.summary || '',
        period: parsed.period || undefined,
        genre: parsed.genre || undefined,
        warnings: undefined,
      });
    } catch {
      res
        .status(200)
        .json({
          difficulty: 'unknown',
          tags: [],
          summary: '',
          warnings: ['AI returned unparseable metadata.'],
        });
    }
  } catch (err: any) {
    console.error('[ai/metadata] Error:', err.message);
    res
      .status(200)
      .json({
        difficulty: 'unknown',
        tags: [],
        summary: '',
        warnings: ['Metadata generation failed.'],
      });
  }
});

router.post('/api/ai/quiz', async (req: any, res: any) => {
  try {
    const { languageId, lemma, form, type } = req.body;

    if (!languageId || !lemma) {
      return res
        .status(400)
        .json({ error: 'languageId and lemma are required', code: 'INVALID_INPUT' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(200)
        .json({
          question: '',
          choices: [],
          answer: '',
          explanation: 'Quiz requires GEMINI_API_KEY.',
          confidence: null,
        });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    const prompt = `Generate a short morphology or reading question for a student of ${langName}.

Lemma: "${lemma}"
${form ? `Form: "${form}"` : ''}
Type: ${type || 'morphology'}

Return ONLY valid JSON:
{
  "question": "The question text",
  "choices": ["option A", "option B", "option C", "option D"],
  "answer": "The correct choice",
  "explanation": "Brief explanation of the correct answer."
}

Rules:
- Question should test recognition of the form/lemma
- Provide 4 choices, one correct
- Explanation should be 1-2 sentences
- Do not include markdown. Return ONLY the JSON.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      res.status(200).json({
        question: parsed.question || '',
        choices: Array.isArray(parsed.choices) ? parsed.choices : undefined,
        answer: parsed.answer || '',
        explanation: parsed.explanation || '',
        confidence: null,
      });
    } catch {
      res
        .status(200)
        .json({
          question: '',
          choices: [],
          answer: '',
          explanation: 'Failed to parse quiz response.',
          confidence: null,
        });
    }
  } catch (err: any) {
    console.error('[ai/quiz] Error:', err.message);
    res
      .status(200)
      .json({
        question: '',
        choices: [],
        answer: '',
        explanation: 'Quiz generation failed.',
        confidence: null,
      });
  }
});

router.post('/api/ai/syntax', async (req: any, res: any) => {
  try {
    const { languageId, sentence, tokens: inputTokens } = req.body;

    if (
      !languageId ||
      typeof languageId !== 'string' ||
      !sentence ||
      typeof sentence !== 'string'
    ) {
      return res
        .status(400)
        .json({ error: 'languageId and sentence are required', code: 'INVALID_INPUT' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(200)
        .json({
          tokens: [],
          explanation: 'Syntax analysis requires GEMINI_API_KEY.',
          confidence: null,
          warnings: ['Gemini API key not configured.'],
        });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    const tokenHint =
      Array.isArray(inputTokens) && inputTokens.length > 0
        ? `\nToken list (0-based indices, forms as they appear):\n${inputTokens.map((t: any, i: number) => `  ${i}: "${t.surface || t.form}" (lemma: ${t.lemma || '?'})`).join('\n')}`
        : '';

    const prompt = `You are a ${langName} linguist. Annotate the syntactic dependency structure of the sentence below using Universal Dependencies conventions.

Sentence: "${sentence}"${tokenHint}

Return a JSON object with this exact shape — no markdown fences, no extra keys:
{
  "tokens": [
    {"index": 0, "form": "word", "lemma": "dictionary_form", "pos": "NOUN", "head": -1, "relation": "root"},
    ...
  ],
  "explanation": "1-2 sentence summary of the key clause structure",
  "confidence": 0.0
}

Rules:
- Split the sentence into individual word/punctuation tokens (one entry per token)
- pos: one of NOUN VERB ADJ ADV ADP CONJ SCONJ PART DET PRON NUM PUNCT INTJ
- head: 0-based index of the syntactic head token; -1 for the root
- relation: Universal Dependencies label (root, nsubj, obj, iobj, obl, nmod, amod, advmod, aux, cop, mark, cc, conj, det, case, vocative, appos, punct, ccomp, xcomp, advcl, acl, compound, flat, dep)
- Exactly one token must have head=-1 and relation="root"
- confidence: 0.0–1.0 reflecting your certainty (be conservative for ancient languages)
- explanation: plain text, no markdown`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const raw = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const resultTokens: any[] = Array.isArray(parsed.tokens) ? parsed.tokens : [];
    const explanation: string = typeof parsed.explanation === 'string' ? parsed.explanation : '';
    const confidence: number | null =
      typeof parsed.confidence === 'number' ? parsed.confidence : null;
    const hasUncertainty =
      explanation.includes('uncertain') ||
      explanation.includes('unclear') ||
      (confidence !== null && confidence < 0.6);

    res.status(200).json({
      tokens: resultTokens,
      explanation: explanation || 'No syntax explanation could be generated.',
      confidence,
      warnings: hasUncertainty
        ? ['AI expressed uncertainty in this analysis — treat as approximate.']
        : undefined,
    });
  } catch (err: any) {
    console.error('[ai/syntax] Error:', err.message);
    res
      .status(200)
      .json({
        tokens: [],
        explanation: 'Syntax analysis failed.',
        confidence: null,
        warnings: ['Analysis failed: ' + err.message],
      });
  }
});

router.post(
  '/api/ai/tutor/start',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { languageId, textId, sentenceIndex } = req.body;
      const userId = req.user!.uid;

      if (!languageId || typeof languageId !== 'string') {
        return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT' });
      }

      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const { FieldValue } = await import('firebase-admin/firestore');

      const uid = userId;
      const planId = await lookupUserPlan(uid);
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && uid) {
        const quota = await checkAndIncrementUsage(uid, planId, 'tutor', languageId.length);
        if (!quota.allowed) {
          return res.status(429).json({
            error: 'Daily AI analysis limit reached. Upgrade your plan for more.',
            code: 'QUOTA_EXCEEDED',
            remaining: quota.remaining,
            resetDate: quota.resetDate,
          });
        }
      }

      const sessionRef = adminDb_.collection('users').doc(userId).collection('tutorSessions').doc();
      const sessionId = sessionRef.id;

      const sessionData: Record<string, any> = {
        languageId,
        textId: textId || null,
        sentenceIndex: sentenceIndex != null ? sentenceIndex : null,
        title: `${getLanguageName(languageId)} Tutor`,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await sessionRef.set(sessionData);

      const greeting = apiKey
        ? `I'm your ${getLanguageName(languageId)} tutor. I can help you understand this text — ask about specific words, grammar, or sentence structure.`
        : 'Tutor session created. AI assistance requires GEMINI_API_KEY.';

      await sessionRef.collection('messages').add({
        role: 'assistant',
        content: greeting,
        context: null,
        warnings: apiKey ? null : ['Gemini API key not configured.'],
        createdAt: FieldValue.serverTimestamp(),
      });

      const suggestedQuestions =
        LANGUAGE_SUGGESTED_QUESTIONS[languageId] ?? DEFAULT_SUGGESTED_QUESTIONS;
      res.status(200).json({
        sessionId,
        greeting,
        suggestedQuestions,
      });
    } catch (err: any) {
      console.error('[tutor/start] Error:', err.message);
      res.status(500).json({ error: 'Failed to start tutor session', code: 'TUTOR_ERROR' });
    }
  }
);

router.post(
  '/api/ai/tutor/message',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { sessionId, message, context } = req.body;
      const userId = req.user!.uid;

      if (!sessionId || !message) {
        return res
          .status(400)
          .json({ error: 'sessionId and message are required', code: 'INVALID_INPUT' });
      }

      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const { FieldValue } = await import('firebase-admin/firestore');

      const sessionRef = adminDb_
        .collection('users')
        .doc(userId)
        .collection('tutorSessions')
        .doc(sessionId);
      const sessionSnap = await sessionRef.get();
      if (!sessionSnap.exists) {
        return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
      }

      const sessionData = sessionSnap.data()!;

      const messagesRef = sessionRef.collection('messages');
      await messagesRef.add({
        role: 'user',
        content: message,
        context: context || null,
        createdAt: FieldValue.serverTimestamp(),
      });

      const planId = await lookupUserPlan(userId);
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && userId) {
        const quota = await checkAndIncrementUsage(userId, planId, 'tutor', message.length);
        if (!quota.allowed) {
          await messagesRef.add({
            role: 'assistant',
            content:
              'You have reached your daily AI analysis limit. Upgrade your plan or try again tomorrow.',
            context: null,
            warnings: ['Daily quota exceeded.'],
            createdAt: FieldValue.serverTimestamp(),
          });
          await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
          return res.status(200).json({
            text: 'You have reached your daily AI analysis limit. Upgrade your plan or try again tomorrow.',
            warnings: ['Daily quota exceeded.'],
          });
        }
      }

      if (!apiKey) {
        await messagesRef.add({
          role: 'assistant',
          content:
            'AI tutor requires a Gemini API key to be configured. You can still use the app without it.',
          context: null,
          warnings: ['Gemini API key not configured.'],
          createdAt: FieldValue.serverTimestamp(),
        });
        await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
        return res.status(200).json({
          text: 'AI tutor requires a Gemini API key to be configured.',
          warnings: ['Gemini API key not configured.'],
        });
      }

      const prompt = buildTutorPrompt(sessionData.languageId || 'grc', message, context);

      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = text
        .replace(/^```(?:text)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      const hasUncertainty =
        cleaned.includes('not certain') ||
        cleaned.includes('uncertain') ||
        cleaned.includes('I think');

      await messagesRef.add({
        role: 'assistant',
        content: cleaned,
        context: null,
        warnings: hasUncertainty ? ['Tutor expressed uncertainty.'] : null,
        createdAt: FieldValue.serverTimestamp(),
      });
      await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });

      res.status(200).json({
        text: cleaned || 'I could not generate a response.',
        warnings: hasUncertainty ? ['Tutor expressed uncertainty.'] : undefined,
      });
    } catch (err: any) {
      console.error('[tutor/message] Error:', err.message);
      res.status(500).json({ error: 'Failed to process message', code: 'TUTOR_ERROR' });
    }
  }
);

router.get(
  '/api/ai/tutor/sessions',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.user!.uid;
      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const snap = await adminDb_
        .collection('users')
        .doc(userId)
        .collection('tutorSessions')
        .orderBy('updatedAt', 'desc')
        .limit(30)
        .get();

      const sessions: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        sessions.push({
          id: d.id,
          languageId: data.languageId,
          title: data.title || `${getLanguageName(data.languageId)} Tutor`,
          textId: data.textId || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        });
      });

      res.status(200).json({ sessions });
    } catch (err: any) {
      console.error('[tutor/sessions] Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch sessions', code: 'TUTOR_ERROR' });
    }
  }
);

router.get(
  '/api/ai/tutor/sessions/:sessionId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.user!.uid;
      const sessionId = String(req.params.sessionId);
      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const sessionRef = adminDb_
        .collection('users')
        .doc(userId)
        .collection('tutorSessions')
        .doc(sessionId);
      const sessionSnap = await sessionRef.get();
      if (!sessionSnap.exists) {
        return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
      }

      const sessionData = sessionSnap.data()!;
      const messagesSnap = await sessionRef
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .get();

      const messages: any[] = [];
      messagesSnap.forEach((d) => {
        const data = d.data();
        messages.push({
          id: d.id,
          role: data.role,
          content: data.content,
          context: data.context || null,
          warnings: data.warnings || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        });
      });

      const suggestedQuestions =
        LANGUAGE_SUGGESTED_QUESTIONS[sessionData.languageId] ?? DEFAULT_SUGGESTED_QUESTIONS;

      res.status(200).json({
        session: {
          id: sessionId,
          languageId: sessionData.languageId,
          title: sessionData.title || `${getLanguageName(sessionData.languageId)} Tutor`,
          textId: sessionData.textId || null,
          createdAt: sessionData.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: sessionData.updatedAt?.toDate?.()?.toISOString() || null,
        },
        messages,
        suggestedQuestions,
      });
    } catch (err: any) {
      console.error('[tutor/session] Error:', err.message);
      res.status(500).json({ error: 'Failed to fetch session', code: 'TUTOR_ERROR' });
    }
  }
);

router.post(
  '/api/ai/sentence-analysis',
  optionalAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { text: sentenceText, language, mode = 'scholar' } = req.body;

      if (!sentenceText || typeof sentenceText !== 'string' || sentenceText.trim().length === 0) {
        return res
          .status(400)
          .json({ error: 'text is required', code: 'INVALID_INPUT', field: 'text' });
      }
      if (!language || typeof language !== 'string') {
        return res
          .status(400)
          .json({ error: 'language is required', code: 'INVALID_INPUT', field: 'language' });
      }
      if (!['beginner', 'scholar'].includes(mode)) {
        return res
          .status(400)
          .json({
            error: 'mode must be beginner or scholar',
            code: 'INVALID_INPUT',
            field: 'mode',
          });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          parsing: [],
          syntax: {
            mainVerb: '',
            subject: '',
            object: '',
            description: 'AI analysis not available — Gemini API key not configured.',
          },
          semantics: { keywords: [], idioms: [], notes: '' },
          context: '',
          translations: [],
        } satisfies SentenceAnalysisResult);
      }

      // Check Firestore cache
      const adminDb_ = getAdminDb();
      const cacheKey = Buffer.from(`${language}:${mode}:${sentenceText}`)
        .toString('base64')
        .replace(/[/+=]/g, '_')
        .slice(0, 128);
      const cacheRef = adminDb_?.collection('sentenceAnalysisCache').doc(cacheKey);

      if (cacheRef) {
        const cached = await cacheRef.get();
        if (cached.exists) {
          const data = cached.data()!;
          const expiry = data.expiresAt?.toDate?.();
          if (!expiry || expiry > new Date()) {
            return res.status(200).json({ ...data.result, cached: true });
          }
        }
      }

      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey });

      const prompt = buildSentenceAnalysisPrompt(
        sentenceText.slice(0, 2000),
        language,
        mode as 'beginner' | 'scholar'
      );
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      let result: SentenceAnalysisResult;
      try {
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/```\s*$/, '')
          .trim();
        result = JSON.parse(cleaned);
      } catch {
        return res.status(200).json({
          parsing: [],
          syntax: {
            mainVerb: '',
            subject: '',
            object: '',
            description: 'AI returned an unreadable response. Please try again.',
          },
          semantics: { keywords: [], idioms: [], notes: '' },
          context: '',
          translations: [],
        } satisfies SentenceAnalysisResult);
      }

      // Cache result for 30 days
      if (cacheRef) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await cacheRef.set({ result, expiresAt, createdAt: new Date() }).catch(() => {});
      }

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[sentence-analysis] Error:', err.message);
      return res.status(500).json({ error: 'Failed to analyze sentence', code: 'ANALYSIS_ERROR' });
    }
  }
);

// ─── Course Comprehension Quiz ────────────────────────────────────────────────
router.post(
  '/api/ai/course-quiz',
  optionalAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { text: textSnippet, languageId, questionCount } = req.body;

      if (!textSnippet || typeof textSnippet !== 'string' || textSnippet.trim().length < 20) {
        return res
          .status(400)
          .json({ error: 'text is required (min 20 chars)', code: 'INVALID_INPUT' });
      }
      if (!languageId || typeof languageId !== 'string') {
        return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT' });
      }

      const count = Math.min(Math.max(Number(questionCount) || 5, 2), 10);

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!apiKey)
        return res.status(500).json({ error: 'AI service not configured', code: 'CONFIG_ERROR' });

      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey });

      const prompt = buildCourseQuizPrompt(textSnippet, languageId, count);
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const raw = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned) as CourseQuizResult;

      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        return res.status(500).json({ error: 'Quiz generation failed', code: 'PARSE_ERROR' });
      }

      return res.status(200).json(parsed);
    } catch (err: any) {
      console.error('[course-quiz] Error:', err.message);
      return res.status(500).json({ error: 'Failed to generate quiz', code: 'QUIZ_ERROR' });
    }
  }
);

export default router;
