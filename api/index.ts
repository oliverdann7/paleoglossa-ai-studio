import express from 'express';

// --- In-memory Rate Limiting ---
const RATE_LIMIT_COUNT = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateData = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string | undefined): boolean {
  if (!userId) return true;
  const now = Date.now();
  let record = rateData.get(userId);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (record.count >= RATE_LIMIT_COUNT) return false;
  record.count++;
  rateData.set(userId, record);
  return true;
}

// --- Prompt Templates ---
const PROMPTS = {
  v1: {
    phrase: (lang: string, target: string) => [
      'Explain the following phrase in', lang + ':', `"${target}".`,
      'Provide a translation and linguistic breakdown.',
      'Format as clean Markdown.',
    ].join(' '),
    paradigm: (lang: string, target: string, lemma: string) => [
      'Provide a full morphological paradigm for the word',
      `"${target}" (lemma: "${lemma}") in ${lang}.`,
      'Use a clean Markdown table. Format as clean Markdown.',
    ].join(' '),
    word: (lang: string, target: string, lemma: string) => [
      'Explain the following word in', `${lang}: "${target}" (lemma: "${lemma}").`,
      'Provide common meanings, grammatical notes, etymology,',
      'and example phrases. Format as clean Markdown.',
    ].join(' '),
    analyze: (lang: string, text: string) => [
      'Analyze the following text in', `${lang}.`,
      'Return JSON: { "sentences": [{ "tokens": [{"text","lemma","normalized","type","transliteration","gloss","pos","confidence"}], "translation": "" }] }',
      'Text:', text,
    ].join(' '),
    pronunciation: (lang: string, text: string) => [
      'Provide a detailed pronunciation guide for the following text in',
      `${lang}. Break it down syllable by syllable. Format as clean Markdown.`,
      'Text:', `"${text}"`,
    ].join(' '),
    metadata: (lang: string, text: string) => [
      'Analyze this', `${lang} text and generate metadata.`,
      'Return ONLY JSON: { "difficulty": "string", "tags": ["string"], "summary": "string" }',
      'Text:', `"${text}"`,
    ].join(' '),
  },
};

function isValidUrl(string: string) {
  try { const url = new URL(string); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
}

// ----- Build the Express API app -----
const { GoogleGenAI } = require('@google/genai') as any;
const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((_req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// AI Route Wrapper
const constructAiEndpoint = (routePath: string, handler: (req: any, res: any, ai: any) => Promise<void>) => {
  app.post(routePath, async (req, res) => {
    const userId = req.header('X-User-Id') || req.body.userId;
    if (!checkRateLimit(userId)) return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.', code: 'QUOTA_EXCEEDED' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Server AI configuration missing.', code: 'CONFIG_ERROR' });

    try { await handler(req, res, ai); }
    catch (error: any) {
      console.error(`AI Error:`, error);
      if (error.message?.includes('SAFETY')) return res.status(400).json({ error: 'Request blocked by safety filters.', code: 'UNSAFE_CONTENT' });
      res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
    }
  });
};

// ---- API Routes ----
constructAiEndpoint('/api/ai/explain', async (req, res, ai) => {
  const { languageId, text, word, lemma, phrase, type } = req.body;
  const lang = languageId || 'ancient language';
  const target = word || text || '';
  const l = lemma || target;
  let prompt: string;
  if (type === 'phrase' || phrase) prompt = PROMPTS.v1.phrase(lang, phrase || target);
  else if (type === 'paradigm') prompt = PROMPTS.v1.paradigm(lang, target, l);
  else prompt = PROMPTS.v1.word(lang, target, l);
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ explanation: response.text, text: response.text });
});

constructAiEndpoint('/api/ai/translate', async (req, res, ai) => {
  const { tokens, languageId } = req.body;
  const prompt = `Translate the following text in ${languageId || 'ancient language'} into clear, fluent English. Return only the translation:\n${(tokens || []).join(' ')}`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/analyze', async (req, res, ai) => {
  const { languageId, rawText } = req.body;
  if (!rawText) throw new Error('No text provided');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: PROMPTS.v1.analyze(languageId, rawText),
    config: { responseMimeType: 'application/json' } as any,
  });
  res.json(JSON.parse(response.text || '{}'));
});

constructAiEndpoint('/api/ai/ocr', async (req, res, ai) => {
  const { languageId, imageBase64, mimeType } = req.body;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { inlineData: { mimeType, data: imageBase64 } } as any,
      { text: `Extract the text from this image in ${languageId}. Return ONLY the extracted text.` },
    ],
  });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/metadata', async (req, res, ai) => {
  const { languageId, rawText } = req.body;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: PROMPTS.v1.metadata(languageId, rawText),
    config: { responseMimeType: 'application/json' } as any,
  });
  res.json(JSON.parse(response.text || '{}'));
});

constructAiEndpoint('/api/ai/pronunciation', async (req, res, ai) => {
  const { languageId, text } = req.body;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: PROMPTS.v1.pronunciation(languageId, text) });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/scrape', async (req, res, ai) => {
  const { url } = req.body;
  if (!url || !isValidUrl(url)) return res.status(400).json({ error: 'Invalid or disallowed URL.', code: 'INVALID_URL' });
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) as any });
  const html = await response.text();
  const prompt = `Extract the main article text from this HTML. Ignore navigation, ads, and footers. Return ONLY the article text:\n\n${html.slice(0, 10000)}`;
  const aiResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: aiResponse.text });
});

constructAiEndpoint('/api/ai/tutor/start', async (req, res, ai) => {
  const { languageId } = req.body;
  const prompt = `You are a philology tutor specializing in ${languageId || 'ancient languages'}. Greet the student and ask what they'd like to explore. Keep it to 2-3 sentences.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/tutor/message', async (req, res, ai) => {
  const { message, context } = req.body;
  const ctx = context?.textId ? ` (context: ${context.textId}${context.lemma ? `, lemma: ${context.lemma}` : ''})` : '';
  const prompt = `You are a philology tutor. The student asks: "${message}"${ctx}. Provide a clear, scholarly answer.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/quiz', async (req, res, ai) => {
  const { languageId, lemma, form, type } = req.body;
  const prompt = `Generate a ${type || 'morphology'} quiz question for ${languageId}. Focus on "${form}" (lemma: "${lemma}"). Format: "Question: ... Answer: ..."`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: response.text });
});

constructAiEndpoint('/api/ai/syntax', async (req, res, ai) => {
  const { languageId, sentence } = req.body;
  const prompt = `Analyze the syntax of this ${languageId} sentence: "${sentence}". Identify clauses, dependencies, and relations.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  res.json({ text: response.text });
});

// Stub routes
const stubRoutes = [
  ['/api/lemmas/:lemma'], ['/api/lemmas'], ['/api/lemmas/:lemma/paradigm'],
  ['/api/grammar/concepts'], ['/api/grammar/concepts/:conceptId'], ['/api/grammar/pathway'],
  ['/api/search', 'post'], ['/api/syntax'], ['/api/syntax/:textId/:sentenceIndex'],
  ['/api/notebooks'], ['/api/notebooks', 'post'], ['/api/notebooks/:notebookId', 'delete'],
  ['/api/notes'], ['/api/notes', 'post'], ['/api/notes/:noteId', 'delete'],
  ['/api/manuscripts'], ['/api/manuscripts/:manuscriptId'],
  ['/api/audio/tts', 'post'], ['/api/audio/recordings', 'post'],
  ['/api/courses'], ['/api/courses/:courseId'], ['/api/courses', 'post'],
  ['/api/courses/:courseId/members'], ['/api/courses/:courseId/members', 'post'],
];

for (const [route, method] of stubRoutes) {
  const m = (method || 'get') as 'get' | 'post' | 'delete';
  app[m](route, (_req: any, res: any) => res.status(501).json({ error: 'Not implemented' }));
}

// Scrape alias
app.post('/api/scrape', (_req: any, res: any) => res.redirect(307, '/api/ai/scrape'));

// ---- Vercel handler ----
export default function handler(req: any, res: any) {
  app(req, res, () => {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}
