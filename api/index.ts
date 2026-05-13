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

app.post('/api/ai/pronunciation', async (req: any, res: any) => {
  try {
    const { languageId, text, transliteration } = req.body;

    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ guide: null, reconstructionSystem: null, warnings: ['languageId is required'], code: 'INVALID_INPUT' });
    }
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ guide: null, reconstructionSystem: null, warnings: ['text is required'], code: 'INVALID_INPUT' });
    }

    const note = LANGUAGE_RECONSTRUCTION_NOTES[languageId] || null;
    const apiKey = process.env.GEMINI_API_KEY;
    const langName = getLanguageName(languageId);

    if (!apiKey) {
      return res.status(200).json({
        guide: null,
        reconstructionSystem: null,
        warnings: ['Gemini API key not configured. Pronunciation guide unavailable.'].concat(note ? [note] : []),
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

    const response = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const textResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = textResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch { parsed = null; }

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
      guide: null, reconstructionSystem: null,
      warnings: ['Pronunciation guide unavailable.'],
    });
  }
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
const TTS_SUPPORTED_LANGUAGES: Record<string, string> = {
  'grc': 'Google Standard (Ancient Greek accent reconstruction)',
  'lat': 'Google Standard (Restored Classical pronunciation)',
  'grc-koine': 'Google Standard (Koine pronunciation approximation)',
};

const LANGUAGE_RECONSTRUCTION_NOTES: Record<string, string> = {
  'grc': 'Ancient Greek pronunciation is reconstructed. The exact phonetics of the classical period (5th–4th c. BCE) are scholarly approximations based on meter, spelling errors, and comparative linguistics.',
  'grc-koine': 'Koine Greek pronunciation shifted from classical. This synthesis uses the reconstructed Erasmian-influenced system common in academic contexts.',
  'lat': 'Restored Classical pronunciation (1st c. BCE–1st c. CE) based on consensus of historical linguists. Medieval/Ecclesiastical pronunciation differs.',
  'hbo': 'Biblical Hebrew pronunciation follows the Tiberian tradition. Vowel quality and some consonants are reconstructed.',
  'syr': 'Syriac pronunciation follows the Western (Serto) tradition. Eastern and Western traditions differ significantly.',
  'cop': 'Coptic pronunciation follows the Bohairic tradition used in liturgical contexts. Ancient phonetics are partially reconstructed.',
  'arc': 'Aramaic pronunciation is reconstructed from vocalized manuscripts and comparative Semitic data.',
  'akk': 'Akkadian pronunciation is reconstructed from cuneiform writing, which does not record vowels fully. Significant uncertainty remains.',
  'san': 'Sanskrit pronunciation follows the Paninian tradition preserved in oral recitation. Ancient phonetics are well understood.',
  'egy': 'Egyptian pronunciation is highly uncertain. The conventional Egyptological pronunciation used in the field bears unknown resemblance to ancient speech.',
  'hit': 'Hittite pronunciation is partially reconstructed from cuneiform spelling. Significant gaps remain.',
};

app.post('/api/audio/tts', (req: any, res: any) => {
  const { languageId } = req.body;

  if (!languageId) {
    return res.status(400).json({ audioUrl: null, supported: false, reason: 'languageId is required', code: 'INVALID_INPUT' });
  }

  const providerInfo = TTS_SUPPORTED_LANGUAGES[languageId];
  if (!providerInfo) {
    return res.status(200).json({
      audioUrl: null,
      supported: false,
      reason: `TTS is not available for ${languageId}. ${LANGUAGE_RECONSTRUCTION_NOTES[languageId] || ''}`,
    });
  }

  // No TTS provider configured in production. Return honest unavailable.
  const ttsApiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!ttsApiKey) {
    return res.status(200).json({
      audioUrl: null,
      supported: true,
      reason: `TTS engine (${providerInfo}) is not configured. Set GOOGLE_TTS_API_KEY for audio.`,
      provider: providerInfo,
    });
  }

  // If TTS were implemented with a real provider, the audio URL would go here.
  // For now, return honest unavailable with provider info.
  return res.status(200).json({
    audioUrl: null,
    supported: true,
    reason: `TTS engine (${providerInfo}) is available but not yet connected to a streaming endpoint.`,
    provider: providerInfo,
  });
});

app.post('/api/audio/recordings', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null, supported: false, reason: 'User recordings not yet implemented.' });
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
app.get('/api/notebooks', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const snap = await adminDb_.collection('users').doc(userId).collection('notebooks').get();
    const notebooks: any[] = [];
    snap.forEach(d => notebooks.push({ id: d.id, ...d.data() }));
    res.status(200).json(notebooks);
  } catch (e: any) {
    console.error('[notebooks] Error fetching:', e.message);
    res.status(200).json([]);
  }
});

app.post('/api/notebooks', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { title, description, languageId } = req.body;
  if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required', code: 'INVALID_INPUT' });
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection('users').doc(userId).collection('notebooks').doc();
    await ref.set({ title, description: description || '', languageId: languageId || null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    res.status(200).json({ id: ref.id, title, description, languageId, createdAt: new Date().toISOString() });
  } catch (e: any) {
    console.error('[notebooks] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create notebook', code: 'INTERNAL_ERROR' });
  }
});

app.delete('/api/notebooks/:notebookId', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const notebookId = req.params.notebookId as string;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.collection('users').doc(userId).collection('notebooks').doc(notebookId).delete();
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[notebooks] Error deleting:', e.message);
    res.status(500).json({ error: 'Failed to delete notebook', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/notes', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const languageId = req.query.languageId as string | undefined;
  const targetType = req.query.targetType as string | undefined;
  const notebookId = req.query.notebookId as string | undefined;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    let query: any = adminDb_.collection('users').doc(userId).collection('notes');
    if (typeof languageId === "string") query = query.where('languageId', '==', languageId);
    if (targetType) query = query.where('targetType', '==', targetType);
    if (typeof notebookId === "string") query = query.where('notebookId', '==', notebookId);
    const snap = await query.get();
    const notes: any[] = [];
    snap.forEach((d: any) => notes.push({ id: d.id, ...d.data() }));
    res.status(200).json(notes);
  } catch (e: any) {
    console.error('[notes] Error fetching:', e.message);
    res.status(200).json([]);
  }
});

app.post('/api/notes', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { content, languageId, targetType, targetId, lemma, textId, sentenceIndex, tokenIndex, tags, notebookId } = req.body;
  if (!content && (!lemma || !targetType)) return res.status(400).json({ error: 'content or lemma+targetType required', code: 'INVALID_INPUT' });
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection('users').doc(userId).collection('notes').doc();
    await ref.set({
      content, languageId: languageId || null, targetType: targetType || 'free', targetId: targetId || null,
      lemma: lemma || null, textId: textId || null, sentenceIndex: sentenceIndex != null ? sentenceIndex : null,
      tokenIndex: tokenIndex != null ? tokenIndex : null, tags: tags || [], notebookId: notebookId || null,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(200).json({ id: ref.id, content, languageId, targetType, createdAt: new Date().toISOString() });
  } catch (e: any) {
    console.error('[notes] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create note', code: 'INTERNAL_ERROR' });
  }
});

app.delete('/api/notes/:noteId', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const noteId = req.params.noteId as string;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.collection('users').doc(userId).collection('notes').doc(noteId).delete();
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[notes] Error deleting:', e.message);
    res.status(500).json({ error: 'Failed to delete note', code: 'INTERNAL_ERROR' });
  }
});

// ─── Syntax ─────────────────────────────────────────────────────────────────
app.get('/api/syntax/:textId/:sentenceIndex', async (req: any, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(200).json(null);
  try {
    const textId = req.params.textId as string;
    const sentenceIndex = req.params.sentenceIndex as string;
    const snap = await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).get();
    if (!snap.exists) return res.status(200).json(null);
    res.status(200).json({ id: snap.id, ...snap.data() });
  } catch { res.status(200).json(null); }
});

app.post('/api/syntax/:textId/:sentenceIndex', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const textId = req.params.textId as string;
  const sentenceIndex = req.params.sentenceIndex as string;
  const { tokens, dependency, explanation, confidence } = req.body;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).set({
      textId, sentenceIndex: parseInt(sentenceIndex), tokens: tokens || [], dependency: dependency || null,
      explanation: explanation || null, confidence: confidence ?? null, source: 'ai',
      annotatedBy: userId, generatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[syntax] Error saving:', e.message);
    res.status(500).json({ error: 'Failed to save syntax', code: 'INTERNAL_ERROR' });
  }
});

// ─── Search ─────────────────────────────────────────────────────────────────
app.post('/api/search', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { query, languageId, sourceKind, limit: reqLimit = 20 } = req.body;
  if (!query || typeof query !== 'string') return res.status(400).json({ error: 'query is required', code: 'INVALID_INPUT' });

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const q = query.toLowerCase().trim();
  const results: any[] = [];

  try {
    const maxResults = Math.min(reqLimit || 20, 50);

    // 1. Search user imports
    const importSnap = await adminDb_.collection('users').doc(userId).collection('imports').get();
    importSnap.forEach(d => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const title = (data.title || '').toLowerCase();
      const content = (data.rawContent || '').toLowerCase();
      if (title.includes(q) || content.includes(q)) {
        results.push({ id: d.id, title: data.title || 'Untitled', source: 'import', languageId: data.languageId, snippet: data.rawContent?.slice(0, 200), textId: d.id });
      }
    });

    // 2. Search vocabulary
    const vocabSnap = await adminDb_.collection('users').doc(userId).collection('vocabulary').get();
    vocabSnap.forEach(d => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const term = (data.term || '').toLowerCase();
      const gloss = (data.userGloss || '').toLowerCase();
      if (term.includes(q) || gloss.includes(q)) {
        results.push({ id: d.id, term: data.term, lemma: data.term, source: 'vocabulary', languageId: data.languageId, snippet: data.userGloss || data.term, textId: null });
      }
    });

    // 3. Search notes
    const noteSnap = await adminDb_.collection('users').doc(userId).collection('notes').get();
    noteSnap.forEach(d => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const content = (data.content || '').toLowerCase();
      const lemma = (data.lemma || '').toLowerCase();
      if (content.includes(q) || lemma.includes(q)) {
        results.push({ id: d.id, title: data.lemma || 'Note', source: 'note', languageId: data.languageId, snippet: data.content?.slice(0, 200), textId: data.textId });
      }
    });

    // 4. Search public texts (visible only)
    if (!sourceKind || sourceKind === 'public') {
      const publicSnap = await adminDb_.collection('publicTexts').where('moderationStatus', '==', 'visible').get();
      publicSnap.forEach(d => {
        if (results.length >= maxResults) return;
        const data = d.data();
        if (languageId && data.languageId !== languageId) return;
        const title = (data.title || '').toLowerCase();
        const content = (data.rawContent || '').toLowerCase();
        if (title.includes(q) || content.includes(q)) {
          results.push({ id: d.id, title: data.title || 'Untitled', source: 'public', languageId: data.languageId, snippet: data.rawContent?.slice(0, 200), textId: d.id, authorName: data.authorName });
        }
      });
    }

    // Filter by source kind if specified
    const filtered = sourceKind && sourceKind !== 'all' ? results.filter(r => r.source === sourceKind) : results;
    // Filter by language if specified
    const langFiltered = languageId ? filtered.filter(r => !r.languageId || r.languageId === languageId) : filtered;

    res.status(200).json(langFiltered.slice(0, maxResults));
  } catch (e: any) {
    console.error('[search] Error:', e.message);
    res.status(200).json([]);
  }
});

// ─── Grammar ────────────────────────────────────────────────────────────────
import { GRAMMAR_CONCEPTS, PATHWAY } from './_lib/grammarData';

app.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json(GRAMMAR_CONCEPTS);
});

app.get('/api/grammar/concepts/:conceptId', (req: any, res: any) => {
  const concept = GRAMMAR_CONCEPTS.find(c => c.id === req.params.conceptId);
  res.status(200).json(concept || null);
});

app.get('/api/grammar/pathway', (_req: any, res: any) => {
  res.status(200).json(PATHWAY);
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
    const language = req.query.language as string | undefined;
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
    const origin = req.headers.origin || 'https://paleoglossa.com';
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


const SUGGESTED_QUESTIONS = [
  'What does this word mean in context?',
  'Parse this form for me.',
  'Why is this word in this case?',
  'Show me similar sentences.',
  'What grammatical construction is this?',
];

app.post('/api/ai/tutor/start', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { languageId, textId, sentenceIndex } = req.body;
    const userId = req.user!.uid;

    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT' });
    }

    const adminDb_ = getAdminDb();
    if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    const { FieldValue } = await import('firebase-admin/firestore');

    // Check quota
    const uid = userId;
    const planId = await lookupUserPlan(uid);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && uid) {
      const quota = await checkAndIncrementUsage(uid, planId, 'tutor', languageId.length);
      if (!quota.allowed) {
        return res.status(429).json({
          error: 'Daily AI analysis limit reached. Upgrade your plan for more.',
          code: 'QUOTA_EXCEEDED', remaining: quota.remaining, resetDate: quota.resetDate,
        });
      }
    }

    // Create session document
    const sessionRef = adminDb_.collection('users').doc(userId).collection('tutorSessions').doc();
    const sessionId = sessionRef.id;

    const sessionData: Record<string, any> = {
      languageId, textId: textId || null, sentenceIndex: sentenceIndex != null ? sentenceIndex : null,
      title: `${getLanguageName(languageId)} Tutor`,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    };
    await sessionRef.set(sessionData);

    // Create greeting message
    const greeting = apiKey
      ? `I'm your ${getLanguageName(languageId)} tutor. I can help you understand this text — ask about specific words, grammar, or sentence structure.`
      : 'Tutor session created. AI assistance requires GEMINI_API_KEY.';

    await sessionRef.collection('messages').add({
      role: 'assistant', content: greeting, context: null, warnings: apiKey ? null : ['Gemini API key not configured.'],
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      sessionId, greeting, suggestedQuestions: SUGGESTED_QUESTIONS,
    });
  } catch (err: any) {
    console.error('[tutor/start] Error:', err.message);
    res.status(500).json({ error: 'Failed to start tutor session', code: 'TUTOR_ERROR' });
  }
});

app.post('/api/ai/tutor/message', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { sessionId, message, context } = req.body;
    const userId = req.user!.uid;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required', code: 'INVALID_INPUT' });
    }

    const adminDb_ = getAdminDb();
    if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    const { FieldValue } = await import('firebase-admin/firestore');

    // Verify session belongs to user
    const sessionRef = adminDb_.collection('users').doc(userId).collection('tutorSessions').doc(sessionId);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    }

    const sessionData = sessionSnap.data()!;

    // Save user message
    const messagesRef = sessionRef.collection('messages');
    await messagesRef.add({
      role: 'user', content: message, context: context || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Check quota
    const planId = await lookupUserPlan(userId);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && userId) {
      const quota = await checkAndIncrementUsage(userId, planId, 'tutor', message.length);
      if (!quota.allowed) {
        // Save an assistant message explaining quota reached
        await messagesRef.add({
          role: 'assistant',
          content: 'You have reached your daily AI analysis limit. Upgrade your plan or try again tomorrow.',
          context: null, warnings: ['Daily quota exceeded.'],
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
        content: 'AI tutor requires a Gemini API key to be configured. You can still use the app without it.',
        context: null, warnings: ['Gemini API key not configured.'],
        createdAt: FieldValue.serverTimestamp(),
      });
      await sessionRef.update({ updatedAt: FieldValue.serverTimestamp() });
      return res.status(200).json({
        text: 'AI tutor requires a Gemini API key to be configured.',
        warnings: ['Gemini API key not configured.'],
      });
    }

    // Build prompt with context
    const langName = getLanguageName(sessionData.languageId || 'grc');
    let prompt = `You are a ${langName} tutor helping a student read an ancient text in its original language.

Rules:
- Answer questions about morphology, syntax, and meaning based on ${langName} grammar.
- If you are uncertain about a form or parsing, say so explicitly with "I'm not certain, but..."
- Do NOT invent morphology or grammar rules that do not apply to ${langName}.
- Distinguish between:
  • KNOWN: facts confirmed by standard grammars
  • AI-GENERATED: your analysis based on context
  • UNCERTAIN: forms you cannot confidently parse
- Keep answers concise (2-4 sentences). Focus on the student's specific question.`;

    if (context) {
      if (context.textTitle) prompt += `\n\nText: "${context.textTitle}"`;
      if (context.sentenceText) prompt += `\nSentence: "${context.sentenceText}"`;
      if (context.selectedToken) prompt += `\nSelected word: "${context.selectedToken}"`;
      if (context.lemma) prompt += `\nLemma: ${context.lemma}`;
      if (context.morphology) prompt += `\nKnown morphology: ${JSON.stringify(context.morphology)}`;
      if (context.gloss) prompt += `\nGloss: ${context.gloss}`;
    }

    prompt += `\n\nStudent's question: ${message}`;

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const hasUncertainty = cleaned.includes('not certain') || cleaned.includes('uncertain') || cleaned.includes('I think');

    // Save assistant response
    await messagesRef.add({
      role: 'assistant', content: cleaned, context: null,
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
});

// ─── Admin API ─────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['danezolv@gmail.com'];

function requireAdmin(req: AuthenticatedRequest, res: any): boolean {
  const email = req.user?.email;
  if (!email || !ADMIN_EMAILS.includes(email)) {
    res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    return false;
  }
  return true;
}

app.get('/api/admin/overview', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const usersSnap = await adminDb_.collection('users').get();
    let totalUsers = 0, paidUsers = 0, freeUsers = 0;
    usersSnap.forEach(d => {
      totalUsers++;
      const plan = d.data()?.currentPlan;
      if (plan && plan !== 'free') paidUsers++;
      else freeUsers++;
    });

    const publicTextsSnap = await adminDb_.collection('publicTexts').where('moderationStatus', '==', 'visible').get();
    const reportsSnap = await adminDb_.collection('publicTextReports').where('status', '==', 'open').get();
    const recentAiSnap = await adminDb_.collection('aiUsage').orderBy('updatedAt', 'desc').limit(100).get();
    let totalAiCalls = 0;
    recentAiSnap.forEach(d => { totalAiCalls += d.data()?.count || 0; });

    res.status(200).json({ totalUsers, paidUsers, freeUsers, publicTextCount: publicTextsSnap.size, openReports: reportsSnap.size, recentAiCalls: totalAiCalls });
  } catch (e: any) {
    console.error('[admin/overview] Error:', e.message);
    res.status(500).json({ error: 'Failed to get overview', code: 'INTERNAL_ERROR' });
  }
});

app.get('/api/admin/reports', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const snap = await adminDb_.collection('publicTextReports').orderBy('createdAt', 'desc').limit(50).get();
    const reports: any[] = [];
    snap.forEach(d => reports.push({ id: d.id, ...d.data() }));
    res.status(200).json(reports);
  } catch (e: any) {
    console.error('[admin/reports] Error:', e.message);
    res.status(500).json({ error: 'Failed to get reports', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/admin/publicTexts/:id/hide', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'hidden' });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[admin/hide] Error:', e.message);
    res.status(500).json({ error: 'Failed to hide text', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/admin/publicTexts/:id/restore', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'visible' });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[admin/restore] Error:', e.message);
    res.status(500).json({ error: 'Failed to restore text', code: 'INTERNAL_ERROR' });
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
