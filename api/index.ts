import express from 'express';

// Build the Express API app
const app = express();

// Preserve raw body for Stripe webhook verification
app.use((req: any, _res: any, next: any) => {
  if (req.url === '/api/stripe/webhook') {
    let data = '';
    req.on('data', (chunk: string) => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));

// CORS headers for cross-origin API calls
app.use((_req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Test route ──────────────────────────────────────────────────────────────
app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
});

// ─── Auth test — verify a Firebase ID token and return user info ─────────────
import { requireAuth } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import type { AuthenticatedRequest } from './_lib/auth';

app.get('/api/auth/me', requireAuth as any, (req: AuthenticatedRequest, res: any) => {
  res.status(200).json({ user: req.user });
});

// ─── Lemmas ──────────────────────────────────────────────────────────────────
app.get('/api/lemmas/:lemma', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/lemmas', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/lemmas/:lemma/paradigm', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Dictionary ───────────────────────────────────────────────────────────────
import { getDictionaryEntry, getDictionaryLanguages, searchDictionaryEntries } from '../src/lib/data/dictionaryDB';

app.get('/api/dictionary', (_req: any, res: any) => {
  const languages = getDictionaryLanguages();
  res.status(200).json(languages);
});

app.get('/api/dictionary/:lemma/:lang', (req: any, res: any) => {
  const { lemma, lang } = req.params;
  const entry = getDictionaryEntry(lemma, lang);
  if (entry) {
    res.status(200).json(entry);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.get('/api/dictionary/search', (req: any, res: any) => {
  const { q: query, lang, limit } = req.query;
  const results = searchDictionaryEntries(
    query && typeof query === 'string' ? query : '',
    lang && typeof lang === 'string' ? lang : undefined,
    limit && typeof limit === 'string' ? parseInt(limit, 10) : 20
  );
  res.status(200).json(results);
});

// ─── AI endpoints ────────────────────────────────────────────────────────────
const MAX_TEXT_LENGTH = 100000;
const MAX_TEXT_LENGTH_HUMAN = '100,000';

import { basicAnalyze } from './_lib/basicAnalyze';
import { parseAndValidateAIResponse } from './_lib/aiValidation';
import { LANGUAGE_INSTRUCTIONS, getLanguageName, BASE_JSON_SCHEMA } from './_lib/aiPrompts';
import { optionalAuth } from './_lib/auth';
import { checkAndIncrementUsage } from './_lib/aiUsage';

app.post('/api/ai/analyze', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { languageId, rawText } = req.body;

    // ── Input validation ──────────────────────────────────────────────
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

    // ── Gemini AI analysis ────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    let geminiAttempted = false;
    let aiWarnings: string[] = [];

    // ── Usage quota check ────────────────────────────────────────────
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

        // Build language-specific instruction
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

        // Parse, repair, and validate the AI response
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

        // Gemini returned unparseable JSON, fall through
        aiWarnings.push('Gemini returned unparseable response');
        if (warnings.length > 0) aiWarnings.push(...warnings);
        console.warn('[ai/analyze] Gemini unparseable, using fallback');
      } catch (geminiErr: any) {
        aiWarnings.push('Gemini API call failed: ' + geminiErr.message);
        console.error('[ai/analyze] Gemini API call failed:', geminiErr.message);
      }
    }

    // ── Fallback: rule-based tokenization ──────────────────────────────
    const result = basicAnalyze(rawText);
    const fallbackSentences = result.sentences.map(s => ({
      tokens: s.tokens.map(t => ({
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
        ? (aiWarnings.length > 0 ? aiWarnings : undefined)
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

function computeOverallConfidence(sentences: { tokens: { confidence: number | null }[] }[]): number | null {
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

// ── Scrape URL validation ────────────────────────────────────────────────
function isPrivateIP(hostname: string): boolean {
  return /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|0\.0\.0\.0$|localhost$|.*\.local$)/.test(hostname);
}

function isValidScrapeUrl(urlString: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try { parsed = new URL(urlString); } catch {
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

app.post('/api/ai/ocr', async (req: any, res: any) => {
  try {
    const { languageId, imageBase64, mimeType } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 is required', code: 'INVALID_INPUT', field: 'imageBase64' });
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
      return res.status(200).json({
        text: '',
        confidence: null,
        warnings: ['Gemini API key not configured. OCR is unavailable.'],
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

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
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
      confidence: cleaned ? null : null,
      warnings: warnings.length > 0 ? warnings : undefined,
    });

  } catch (err: any) {
    console.error('[ai/ocr] Error:', err.message);
    res.status(500).json({
      text: '',
      confidence: null,
      warnings: ['OCR processing failed: ' + err.message],
      error: err.message,
      code: 'OCR_ERROR',
    });
  }
});

app.post('/api/ai/translate', async (req: any, res: any) => {
  try {
    const { languageId, tokens } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'tokens must be a non-empty array of strings', code: 'INVALID_INPUT', field: 'tokens' });
    }

    const sentence = tokens.join(' ').trim();
    if (!sentence) {
      return res.status(400).json({ error: 'Sentence text is empty after joining tokens', code: 'INVALID_INPUT', field: 'tokens' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ text: sentence, confidence: null, notes: 'Gemini API key not configured. Returning original text.' });
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
    const cleaned = text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const notes = cleaned.includes('[') ? 'Translation contains uncertain portions marked with brackets' : undefined;

    res.status(200).json({
      text: cleaned || sentence,
      confidence: cleaned ? null : null,
      notes,
    });

  } catch (err: any) {
    console.error('[ai/translate] Error:', err.message);
    res.status(500).json({ error: 'Translation failed', code: 'TRANSLATE_ERROR', text: '', confidence: null });
  }
});

app.post('/api/ai/explain', async (req: any, res: any) => {
  try {
    const { languageId, word, lemma, phrase, type } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT', field: 'languageId' });
    }

    if (!type || !['word', 'phrase', 'paradigm'].includes(type)) {
      return res.status(400).json({ error: 'type must be one of: word, phrase, paradigm', code: 'INVALID_INPUT', field: 'type' });
    }

    if (type === 'phrase' && (!phrase || typeof phrase !== 'string')) {
      return res.status(400).json({ error: 'phrase is required for type=phrase', code: 'INVALID_INPUT', field: 'phrase' });
    }

    if (type !== 'phrase' && (!word || typeof word !== 'string' || !lemma || typeof lemma !== 'string')) {
      return res.status(400).json({ error: 'word and lemma are required for type=word or type=paradigm', code: 'INVALID_INPUT', field: 'word' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ explanation: 'AI explanation not available — Gemini API key not configured.' });
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
    const cleaned = text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    res.status(200).json({ explanation: cleaned || 'No explanation could be generated.' });

  } catch (err: any) {
    console.error('[ai/explain] Error:', err.message);
    res.status(500).json({ explanation: 'Failed to generate explanation.', error: err.message, code: 'EXPLAIN_ERROR' });
  }
});

app.post('/api/ai/pronunciation', (_req: any, res: any) => {
  res.status(200).json({ text: '', confidence: null, warnings: ['Pronunciation guide requires GEMINI_API_KEY.'] });
});

app.post('/api/ai/scrape', async (req: any, res: any) => {
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
      return res.status(502).json({ error: `Remote server returned ${response.status}`, code: 'FETCH_ERROR', text: '' });
    }

    const html = await response.text();

    // Basic text extraction: strip HTML tags
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
    if (response.headers.get('content-type')?.includes('pdf')) warnings.push('PDF content may not extract cleanly.');

    res.status(200).json({ text, confidence: null, warnings: warnings.length > 0 ? warnings : undefined });
  } catch (err: any) {
    console.error('[ai/scrape] Error:', err.message);
    res.status(500).json({ text: '', confidence: null, warnings: ['Failed to fetch URL: ' + err.message] });
  }
});

app.post('/api/ai/metadata', async (req: any, res: any) => {
  try {
    const { languageId, rawText } = req.body;

    if (!languageId || typeof languageId !== 'string' || !rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'languageId and rawText are required', code: 'INVALID_INPUT', difficulty: '', tags: [], summary: '', warnings: ['Invalid input'] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ difficulty: 'unknown', tags: [], summary: '', period: '', genre: '', warnings: ['Gemini API key not configured. Metadata unavailable.'] });
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

    const response = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

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
      res.status(200).json({ difficulty: 'unknown', tags: [], summary: '', warnings: ['AI returned unparseable metadata.'] });
    }
  } catch (err: any) {
    console.error('[ai/metadata] Error:', err.message);
    res.status(200).json({ difficulty: 'unknown', tags: [], summary: '', warnings: ['Metadata generation failed.'] });
  }
});

app.post('/api/ai/tutor/start', (_req: any, res: any) => {
  res.status(200).json({ text: '', warnings: ['Tutor session requires GEMINI_API_KEY.'] });
});

app.post('/api/ai/tutor/message', (_req: any, res: any) => {
  res.status(200).json({ text: '', warnings: ['Tutor session requires GEMINI_API_KEY.'] });
});

app.post('/api/ai/quiz', async (req: any, res: any) => {
  try {
    const { languageId, lemma, form, type } = req.body;

    if (!languageId || !lemma) {
      return res.status(400).json({ error: 'languageId and lemma are required', code: 'INVALID_INPUT' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ question: '', choices: [], answer: '', explanation: 'Quiz requires GEMINI_API_KEY.', confidence: null });
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

    const response = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

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
      res.status(200).json({ question: '', choices: [], answer: '', explanation: 'Failed to parse quiz response.', confidence: null });
    }
  } catch (err: any) {
    console.error('[ai/quiz] Error:', err.message);
    res.status(200).json({ question: '', choices: [], answer: '', explanation: 'Quiz generation failed.', confidence: null });
  }
});

app.post('/api/ai/syntax', async (req: any, res: any) => {
  try {
    const { languageId, sentence } = req.body;

    if (!languageId || typeof languageId !== 'string' || !sentence || typeof sentence !== 'string') {
      return res.status(400).json({ error: 'languageId and sentence are required', code: 'INVALID_INPUT', explanation: '', confidence: null });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ explanation: 'Syntax analysis requires GEMINI_API_KEY.', confidence: null, warnings: ['Gemini API key not configured.'] });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(languageId);

    const prompt = `Provide a syntactic explanation of the following ${langName} sentence.

Sentence: "${sentence}"

Explain the clause structure, word order, and dependencies. Be honest about uncertainty.
If you are not confident about the parsing, say so explicitly.
Do not invent a full treebank. Focus on explanation.

Return ONLY the explanation text — no markdown, no JSON.`;

    const response = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const hasUncertainty = cleaned.includes('uncertain') || cleaned.includes('not confident') || cleaned.includes('unclear');

    res.status(200).json({
      explanation: cleaned || 'No syntax explanation could be generated.',
      confidence: null,
      warnings: hasUncertainty ? ['AI expressed uncertainty in the analysis.'] : undefined,
    });
  } catch (err: any) {
    console.error('[ai/syntax] Error:', err.message);
    res.status(200).json({ explanation: 'Syntax analysis failed.', confidence: null, warnings: ['Analysis failed: ' + err.message] });
  }
});

// ─── Audio ───────────────────────────────────────────────────────────────────
app.post('/api/audio/tts', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null });
});

app.post('/api/audio/recordings', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null });
});

// ─── Courses ────────────────────────────────────────────────────────────────
app.get('/api/courses', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/courses/:courseId', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.post('/api/courses', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

// ─── Manuscripts ────────────────────────────────────────────────────────────
app.get('/api/manuscripts', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/manuscripts/:manuscriptId', (_req: any, res: any) => {
  res.status(200).json(null);
});

// ─── Notebooks & Notes ──────────────────────────────────────────────────────
app.get('/api/notebooks', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/notebooks', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.delete('/api/notebooks/:notebookId', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

app.get('/api/notes', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/notes', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.delete('/api/notes/:noteId', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

// ─── Syntax ─────────────────────────────────────────────────────────────────
app.get('/api/syntax/:textId/:sentenceIndex', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/syntax', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Search ─────────────────────────────────────────────────────────────────
app.post('/api/search', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Grammar ────────────────────────────────────────────────────────────────
app.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/grammar/concepts/:conceptId', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/grammar/pathway', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Public Library ─────────────────────────────────────────────────────
app.get('/api/public/texts', async (req: any, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    // Fallback to client SDK if admin DB unavailable
    const { ImportService } = await import('../src/lib/services/importService');
    const texts = await ImportService.getPublicTexts(50);
    return res.status(200).json(texts);
  }

  try {
    const { language } = req.query;
    const snap = await adminDb_.collection('publicTexts')
      .where('moderationStatus', '==', 'visible')
      .get();

    const results: any[] = [];
    snap.forEach(doc => {
      const data = doc.data();
      if (language && data.languageId !== language) return;
      results.push({ id: doc.id, ...data });
    });

    // Sort by publishedAt desc
    results.sort((a, b) => {
      const aTime = a.publishedAt?.toMillis?.() || 0;
      const bTime = b.publishedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    res.status(200).json(results.slice(0, 50));
  } catch (err: any) {
    console.error('Error fetching public texts:', err);
    // Fallback
    const { ImportService } = await import('../src/lib/services/importService');
    const texts = await ImportService.getPublicTexts(50);
    res.status(200).json(texts);
  }
});

app.post('/api/public/texts/:textId/report', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { textId } = req.params;
  const { reason } = req.body;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    // Verify the public text exists
    const textSnap = await adminDb_.doc('publicTexts/' + textId).get();
    if (!textSnap.exists) return res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });

    const { FieldValue } = await import('firebase-admin/firestore');
    const reportId = `report_${Date.now()}`;

    await adminDb_.doc('publicTextReports/' + reportId).set({
      textId,
      reporterId: userId,
      reason: reason || 'No reason provided',
      createdAt: FieldValue.serverTimestamp(),
      status: 'open',
    });

    res.status(200).json({ success: true, reportId });
  } catch (err: any) {
    console.error('Error reporting text:', err);
    res.status(500).json({ error: 'Failed to submit report', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/public/texts/:textId/fork', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { textId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const publicSnap = await adminDb_.doc('publicTexts/' + textId).get();
    if (!publicSnap.exists) return res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });

    const data = publicSnap.data()!;
    const newId = `fork_${textId}_${Date.now()}`;

    const { FieldValue } = await import('firebase-admin/firestore');

    // Create fork as a private import
    await adminDb_.doc(`users/${userId}/imports/${newId}`).set({
      id: newId,
      title: `${data.title} (forked)`,
      languageId: data.languageId,
      sourceType: data.sourceType || 'paste',
      rawContent: data.rawContent || '',
      sentences: data.sentences || [],
      stats: data.stats || {},
      analysisStatus: data.analysisStatus || 'raw',
      visibility: 'private',
      forkedFrom: textId,
      authorId: data.authorId || null,
      authorName: data.authorName || null,
      originalAuthorId: data.authorId || null,
      originalAuthorName: data.authorName || null,
      originalPublicTextId: textId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });

    // Increment forkCount on the public text
    await adminDb_.doc('publicTexts/' + textId).update({
      forkCount: (data.forkCount || 0) + 1,
    });

    res.status(200).json({ id: newId });
  } catch (err: any) {
    console.error('Error forking text:', err);
    res.status(500).json({ error: 'Failed to fork text', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/imports/:importId/share', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    const data = snap.data()!;
    const now = FieldValue.serverTimestamp();

    await importRef.update({
      visibility: 'public',
      publishedAt: now,
      updatedAt: now,
    });

    const publicData: Record<string, any> = {
      id: importId,
      title: data.title || 'Untitled',
      languageId: data.languageId || 'grc',
      sourceType: data.sourceType || 'paste',
      rawContent: data.rawContent || '',
      sentences: data.sentences || [],
      stats: data.stats || { totalWords: 0, uniqueWords: 0, knownWords: 0, newWords: 0, learningWords: 0 },
      analysisStatus: data.analysisStatus || 'raw',
      visibility: 'public',
      moderationStatus: 'visible',
      authorId: userId,
      authorName: data.authorName || 'Anonymous',
      forkCount: 0,
      forkedFrom: data.forkedFrom || null,
      originalAuthorId: data.originalAuthorId || data.authorId || null,
      originalAuthorName: data.originalAuthorName || data.authorName || null,
      originalPublicTextId: data.originalPublicTextId || null,
      createdAt: data.createdAt || now,
      updatedAt: now,
      publishedAt: now,
    };

    await adminDb_.doc('publicTexts/' + importId).set(publicData);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error sharing text:', err);
    res.status(500).json({ error: 'Failed to share text', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/imports/:importId/unshare', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    await importRef.update({
      visibility: 'private',
      publishedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      await adminDb_.doc('publicTexts/' + importId).delete();
    } catch {
      // Ignore if already removed
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error unsharing text:', err);
    res.status(500).json({ error: 'Failed to unshare text', code: 'INTERNAL_ERROR' });
  }
});

// ─── Stripe Payment Integration ────────────────────────────────────────
const VALID_PAID_PLANS = ['basic_1', 'duo_2', 'full_all'] as const;

const PRICE_IDS: Record<string, { monthly?: string; yearly?: string }> = {
  basic_1: {
    monthly: process.env.STRIPE_BASIC_PRICE_ID,
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
  },
  duo_2: {
    monthly: process.env.STRIPE_DUO_PRICE_ID,
    yearly: process.env.STRIPE_DUO_YEARLY_PRICE_ID,
  },
  full_all: {
    monthly: process.env.STRIPE_FULL_PRICE_ID,
    yearly: process.env.STRIPE_FULL_YEARLY_PRICE_ID,
  },
};

// Reverse mapping for the Stripe webhook — maps a Stripe price ID back to a planId.
const PLANS_BY_PRICE: Record<string, { planId: string; name: string }> = {};
for (const [planId, prices] of Object.entries(PRICE_IDS)) {
  for (const priceId of Object.values(prices)) {
    if (priceId) PLANS_BY_PRICE[priceId] = { planId, name: planId };
  }
}

app.post('/api/stripe/create-checkout-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { planId, billingCycle = 'monthly', successUrl, cancelUrl } = req.body;
    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!planId || !VALID_PAID_PLANS.includes(planId)) {
      return res.status(400).json({ error: 'Invalid or missing planId', code: 'INVALID_PLAN' });
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return res.status(400).json({ error: 'billingCycle must be monthly or yearly', code: 'INVALID_BILLING_CYCLE' });
    }

    const priceId = PRICE_IDS[planId]?.[billingCycle as 'monthly' | 'yearly'];
    if (!priceId) {
      return res.status(400).json({
        error: `No price configured for plan ${planId} (${billingCycle})`,
        code: 'PRICE_NOT_CONFIGURED',
        hint: 'Set STRIPE_' + planId.toUpperCase() + (billingCycle === 'yearly' ? '_YEARLY' : '') + '_PRICE_ID in environment.',
      });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Dev mode: only when NODE_ENV is explicitly development.
    const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
    if (!stripeKey) {
      if (isDev) {
        return res.status(200).json({
          devMode: true,
          url: null,
          message: 'Stripe not configured locally. Set STRIPE_SECRET_KEY in .env for production payments.',
        });
      }
      return res.status(500).json({ error: 'Stripe server configuration incomplete', code: 'STRIPE_NOT_CONFIGURED' });
    }

    // Safely derive default URLs from the request origin.
    const origin = req.headers.origin || 'https://paleoglossa-ai-studio.vercel.app';
    const safeDefault = (path: string) => origin + path;

    // Validate custom URLs point to same origin (prevent open redirect).
    const isValidUrl = (url: string | undefined) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        const reqOrigin = req.headers.origin;
        return reqOrigin ? parsed.origin === reqOrigin : true;
      } catch { return false; }
    };

    const stripe = new (await import('stripe')).default(stripeKey);

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: uid,
      metadata: { planId, userId: uid },
      success_url: isValidUrl(successUrl) ? successUrl! : safeDefault('/app/subscription?success=true'),
      cancel_url: isValidUrl(cancelUrl) ? cancelUrl! : safeDefault('/app/subscription?canceled=true'),
      subscription_data: {
        metadata: { planId, userId: uid },
      },
    };

    const trialDays = process.env.STRIPE_TRIAL_DAYS ? parseInt(process.env.STRIPE_TRIAL_DAYS, 10) : 0;
    if (trialDays > 0) {
      sessionConfig.subscription_data.trial_period_days = trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session', code: 'CHECKOUT_ERROR' });
  }
});

app.post('/api/stripe/create-portal-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const uid = req.user!.uid;

    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }

    const userSnap = await adminDb_.doc('users/' + uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User profile not found', code: 'NOT_FOUND' });
    }

    const stripeCustomerId = userSnap.data()?.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'No Stripe customer ID found. Have you subscribed?', code: 'NO_CUSTOMER' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(200).json({ devMode: true, url: null, message: 'Stripe not configured' });
    }

    const stripe = new (await import('stripe')).default(stripeKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: req.body.returnUrl || `${req.headers.origin || ''}/app/subscription`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: err.message || 'Failed to create portal session', code: 'PORTAL_ERROR' });
  }
});

const ALL_LANGUAGES = ['grc', 'grc-koine', 'hbo', 'lat', 'syr', 'cop', 'arc', 'akk', 'san', 'egy', 'hit'];

app.post('/api/stripe/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';

  if (!sig || !webhookSecret || !stripeKey) {
    if (isDev) {
      return res.status(200).json({ received: true, devMode: true });
    }
    return res.status(500).json({ error: 'Stripe webhook not configured', code: 'STRIPE_NOT_CONFIGURED' });
  }

  let event: any;
  try {
    const stripe = new (await import('stripe')).default(stripeKey);
    const rawBody = req.rawBody || JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe-webhook] Invalid signature:', err.message);
    return res.status(400).json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' });
  }

  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    console.error('[stripe-webhook] Admin DB not available');
    return res.status(503).json({ error: 'Database unavailable', code: 'SERVICE_UNAVAILABLE' });
  }

  const { FieldValue } = await import('firebase-admin/firestore');
  const eventId = event.id;

  // Idempotency: skip if already processed
  try {
    const eventDoc = await adminDb_.doc('stripeEvents/' + eventId).get();
    if (eventDoc.exists) {
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch (dbErr: any) {
    console.error('[stripe-webhook] Idempotency check failed:', dbErr.message);
    // Continue processing — better to process twice than miss an event.
  }

  const now = FieldValue.serverTimestamp();

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = (session.client_reference_id || session.metadata?.userId) as string | undefined;
        const planId = (session.metadata?.planId || 'basic_1') as string;

        if (!userId) {
          console.error('[stripe-webhook] No userId in checkout.session.completed');
          break;
        }

        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;
        const customerEmail = session.customer_details?.email as string | undefined;
        const periodEnd = (session as any).current_period_end
          ? new Date((session as any).current_period_end * 1000).toISOString()
          : null;

        const userData: Record<string, any> = {
          currentPlan: planId,
          subscriptionStatus: 'active',
          subscriptionUpdatedAt: now,
        };
        if (customerId) userData.stripeCustomerId = customerId;
        if (subscriptionId) userData.stripeSubscriptionId = subscriptionId;
        if (periodEnd) userData.currentPeriodEnd = periodEnd;
        userData.selectedLanguageIds = planId === 'full_all' ? ALL_LANGUAGES : ['grc'];

        await adminDb_.doc('users/' + userId).set(userData, { merge: true });

        // Create reverse lookup so subscription webhooks can find the user
        if (customerId) {
          await adminDb_.doc('stripeCustomers/' + customerId).set({
            userId,
            email: customerEmail || null,
            createdAt: now,
            updatedAt: now,
          }, { merge: true });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const items = subscription.items?.data || [];
        const priceId = items[0]?.price?.id;
        const currentPeriodEnd = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + customerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer:', customerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;
        const planInfo = priceId ? PLANS_BY_PRICE[priceId] : null;
        const planId = planInfo?.planId || 'basic_1';
        const subscriptionStatus: string =
          status === 'active' ? 'active' :
          status === 'past_due' ? 'past_due' :
          status === 'canceled' || status === 'unpaid' ? 'canceled' : 'past_due';

        const updateData: Record<string, any> = {
          currentPlan: planId,
          subscriptionStatus,
          subscriptionUpdatedAt: now,
        };
        if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;

        await adminDb_.doc('users/' + userId).set(updateData, { merge: true });
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const deletedCustomerId = deletedSub.customer as string;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + deletedCustomerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer on deletion:', deletedCustomerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;

        await adminDb_.doc('users/' + userId).set({
          currentPlan: 'free',
          subscriptionStatus: 'canceled',
          subscriptionUpdatedAt: now,
        }, { merge: true });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const invCustomerId = invoice.customer as string;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + invCustomerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer on payment failure:', invCustomerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;
        await adminDb_.doc('users/' + userId).set({
          subscriptionStatus: 'past_due',
          subscriptionUpdatedAt: now,
        }, { merge: true });
        break;
      }
    }

    // Mark event as processed (idempotency)
    await adminDb_.doc('stripeEvents/' + eventId).set({
      type: event.type,
      processedAt: now,
    }).catch((dbErr: any) => {
      console.error('[stripe-webhook] Failed to mark event as processed:', dbErr.message);
    });

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[stripe-webhook] Processing error:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed', code: 'WEBHOOK_ERROR' });
  }
});

// Vercel handler
export const expressApp = app;
export default function handler(req: any, res: any) {
  app(req, res, () => {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}

/**
 * Look up a user's current plan from Firestore.
 * Falls back to 'free' if the user is not found or Admin DB unavailable.
 */
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
