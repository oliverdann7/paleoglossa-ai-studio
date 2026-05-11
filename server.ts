import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';

// --- Persistent Rate Limiting ---
const RATE_LIMIT_COUNT = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_FILE = path.join(process.cwd(), '.ratelimit.json');

interface RateRecord { count: number; resetAt: number; }

function loadRateLimits(): Record<string, RateRecord> {
  try {
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveRateLimits(data: Record<string, RateRecord>) {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data));
}

function checkRateLimit(userId: string | undefined): boolean {
  if (!userId) return true;
  const now = Date.now();
  const data = loadRateLimits();
  let record = data[userId];
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (record.count >= RATE_LIMIT_COUNT) return false;
  record.count++;
  data[userId] = record;
  saveRateLimits(data);
  return true;
}

// --- Prompt Templates ---
const PROMPTS = {
  v1: {
    phrase: (lang: string, target: string) => `
      Explain the following phrase in ${lang}: "${target}".
      Provide a translation and linguistic breakdown of why it means what it means.
      Keep it educational and insightful for a serious student.
      Format as clean Markdown.
    `,
    paradigm: (lang: string, target: string, lemma: string) => `
      Provide a full morphological paradigm table (declension or conjugation) for the word "${target}" (lemma: "${lemma}") in ${lang}.
      Include all relevant cases, numbers, genders (for nouns/adjectives) or tenses, moods, voices, persons, numbers (for verbs).
      Use a clean Markdown table format.
      If the word is irregular, highlight the irregularities.
    `,
    word: (lang: string, target: string, lemma: string) => `
      Explain the following word in ${lang}: "${target}" (lemma: "${lemma}").
      Provide a detailed linguistic explanation including:
      1. Common meanings.
      2. Grammatical notes (morphology, usage).
      3. Etymological hints if interesting.
      4. A few example short phrases.
      Format as clean Markdown.
    `,
    analyze: (lang: string, text: string) => `
      Analyze the following text in ${lang}.
      1. Segment it into sentences.
      2. For each sentence, tokenize it into words, punctuation, and whitespace.
      3. For each word token:
         - Provide the lemma (dictionary form).
         - Provide a normalized form (lowercase, potentially stripped of some diacritics if appropriate for ${lang}).
         - Provide a brief gloss/translation.
         - Provide the part of speech (pos).
         - Provide a transliteration if the script is not Latin.
         - Provide a confidence score (0.0 to 1.0).
      4. For each sentence, provide a fluent English translation.

      Return the result as a JSON object with this structure:
      {
        "sentences": [
          {
            "tokens": [
              { "text": "...", "lemma": "...", "normalized": "...", "type": "word|punctuation|number|whitespace", "transliteration": "...", "gloss": "...", "pos": "...", "confidence": 0.95 }
            ],
            "translation": "..."
          }
        ]
      }

      Text:
      ${text}
    `,
    pronunciation: (lang: string, text: string) => `
      Provide a detailed pronunciation guide for the following text in ${lang}.
      Break it down syllable by syllable and explain the phonetic rules applying to these words.
      Keep it readable with Markdown.
      Text: "${text}"
    `,
    metadata: (lang: string, text: string) => `
      Analyze this ${lang} text and generate metadata for a reading lesson.
      Determine the 'difficulty' (Beginner, Intermediate, Advanced), a few relevant 'tags', and a short English 'summary'.
      Return ONLY JSON matching this structure: { "difficulty": "string", "tags": ["string"], "summary": "string" }
      Text: "${text}"
    `
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI Route Wrapper with Rate Limiter
  const constructAiEndpoint = (path: string, handler: (req: express.Request, res: express.Response, ai: GoogleGenAI) => Promise<void>) => {
    app.post(path, async (req, res) => {
      const userId = req.header('X-User-Id') || req.body.userId;
      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.', code: 'QUOTA_EXCEEDED' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server AI configuration missing.', code: 'CONFIG_ERROR' });
      }

      try {
        await handler(req, res, ai);
      } catch (error: any) {
        console.error(`AI Error on ${path}:`, error);
        // Handle unsafe/safety errors
        if (error.message?.includes('SAFETY')) {
          return res.status(400).json({ error: 'Request blocked by safety filters.', code: 'UNSAFE_CONTENT' });
        }
        res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
      }
    });
  };

  // API Routes
  constructAiEndpoint('/api/ai/explain', async (req, res, ai) => {
    const { languageId, text, word, lemma, phrase, type } = req.body;
    let prompt: string;
    const targetLangId = languageId || "ancient language";
    const targetWord = word || text || "";
    const targetLemma = lemma || targetWord;

    if (type === 'phrase' || phrase) {
      prompt = PROMPTS.v1.phrase(targetLangId, phrase || targetWord);
    } else if (type === 'paradigm') {
      prompt = PROMPTS.v1.paradigm(targetLangId, targetWord, targetLemma);
    } else {
      prompt = PROMPTS.v1.word(targetLangId, targetWord, targetLemma);
    }
    
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ explanation: response.text, text: response.text });
  });

  constructAiEndpoint('/api/ai/translate', async (req, res, ai) => {
    const { tokens, languageId } = req.body;
    const prompt = `Translate the following text in ${languageId || 'ancient language'} into clear, fluent English. Just provide the English translation, and nothing else:\n${tokens.join(" ")}`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/analyze', async (req, res, ai) => {
    const { languageId, rawText } = req.body;
    if (!rawText) throw new Error("No text provided");
    const prompt = PROMPTS.v1.analyze(languageId, rawText);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || '{}'));
  });

  constructAiEndpoint('/api/ai/ocr', async (req, res, ai) => {
    const { languageId, imageBase64, mimeType } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: `Extract the text from this image in ${languageId}. Preservation of script and accents is critical. Return ONLY the extracted text.` }
      ]
    });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/metadata', async (req, res, ai) => {
    const { languageId, rawText } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: PROMPTS.v1.metadata(languageId, rawText),
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || '{}'));
  });

  constructAiEndpoint('/api/ai/pronunciation', async (req, res, ai) => {
    const { languageId, text } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: PROMPTS.v1.pronunciation(languageId, text)
    });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/scrape', async (req, res, ai) => {
    const { url } = req.body;
    const response = await fetch(url);
    const html = await response.text();
    const prompt = `Extract the main article text from this HTML content. Ignore navigation, ads, and footers. Return ONLY the article text:\n\n${html.slice(0, 10000)}`;
    const aiResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: aiResponse.text });
  });

  // --- New Module AI Endpoints ---
  constructAiEndpoint('/api/ai/tutor/start', async (req, res, ai) => {
    const { languageId, textId } = req.body;
    const prompt = `You are a philology tutor specializing in ${languageId || 'ancient languages'}. The student is reading ${textId || 'a text'}. Greet them and ask what grammatical feature they would like to explore. Keep your response concise (2-3 sentences).`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/tutor/message', async (req, res, ai) => {
    const { message, context } = req.body;
    const contextInfo = context?.textId ? ` (context: ${context.textId}${context.sentenceIndex !== undefined ? `:${context.sentenceIndex}` : ''}${context.lemma ? `, lemma: ${context.lemma}` : ''})` : '';
    const prompt = `You are a philology tutor. The student asks: "${message}"${contextInfo}. Provide a clear, scholarly answer with examples where relevant. Be precise but pedagogical.`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/quiz', async (req, res, ai) => {
    const { languageId, lemma, form, type } = req.body;
    const prompt = `Generate a ${type || 'morphology'} quiz question for a student of ${languageId}. Focus on the word "${form}" (lemma: "${lemma}"). Ask the student to parse the form and provide the correct answer. Format as: "Question: ... Answer: ..."`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: response.text });
  });

  constructAiEndpoint('/api/ai/syntax', async (req, res, ai) => {
    const { languageId, sentence } = req.body;
    const prompt = `Analyze the syntax of this ${languageId} sentence: "${sentence}". Identify the main clause, dependencies, and grammatical relations. Return the analysis as a structured description.`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ text: response.text });
  });

  // --- Stub API Routes for New Modules ---
  app.get('/api/lemmas/:lemma', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/lemmas', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/lemmas/:lemma/paradigm', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.get('/api/grammar/concepts', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/grammar/concepts/:conceptId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/grammar/pathway', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.post('/api/search', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.get('/api/syntax', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/syntax/:textId/:sentenceIndex', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.get('/api/notebooks', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.post('/api/notebooks', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.delete('/api/notebooks/:notebookId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/notes', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.post('/api/notes', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.delete('/api/notes/:noteId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.get('/api/manuscripts', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/manuscripts/:manuscriptId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.post('/api/audio/tts', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.post('/api/audio/recordings', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  app.get('/api/courses', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/courses/:courseId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.post('/api/courses', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.get('/api/courses/:courseId/members', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
  app.post('/api/courses/:courseId/members', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

  // Alias
  app.post('/api/scrape', (_req, res) => {
    res.redirect(307, '/api/ai/scrape');
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
