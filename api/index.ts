import express from 'express';

// Build the Express API app
const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS headers for cross-origin API calls
app.use((_req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Test route ──────────────────────────────────────────────────────────────
app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
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
app.post('/api/ai/analyze', (req: any, res: any) => {
  const { languageId, rawText } = req.body;
  
  if (!rawText || !languageId) {
    return res.status(400).json({ error: 'Missing languageId or rawText' });
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    // Use Gemini API if key is available
    // For now, we'll still return stub as implementing full Gemini calls requires significant code
    // In production, this would call the Gemini API
    return res.status(200).json({ sentences: [] });
  }
  
  // Fallback: Simple rule-based tokenization when no API key
  const sentences = rawText
    .split(/(?<=[.?!])\s+/)
    .filter(Boolean)
    .map((sentenceText: string) => {
      const tokens = sentenceText
        .split(/(\s+)/)
        .filter(t => t && t.trim())
        .map((tokenText: string) => {
          const isWhitespace = /^\s+$/.test(tokenText);
          const isPunctuation = /^[,;:!?()[\]{}«»–—]+$/.test(tokenText);
          
          return {
            text: tokenText.replace(/[,;:!?()[\]{}«»–—]/g, ''),
            lemma: tokenText.toLowerCase().replace(/[,;:!?()[\]{}«»–—]/g, ''),
            normalized: tokenText.toLowerCase().replace(/[,;:!?()[\]{}«»–—]/g, ''),
            type: isWhitespace ? 'whitespace' : isPunctuation ? 'punctuation' : 'word',
            transliteration: null,
            gloss: null,
            pos: null,
            confidence: null
          };
        });
      
      return {
        tokens,
        translation: null
      };
    });
  
  res.status(200).json({ sentences });
});

app.post('/api/ai/ocr', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/translate', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/explain', (_req: any, res: any) => {
  res.status(200).json({ explanation: '' });
});

app.post('/api/ai/pronunciation', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/scrape', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/metadata', (_req: any, res: any) => {
  res.status(200).json({ difficulty: '', tags: [], summary: '' });
});

app.post('/api/ai/tutor/start', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/tutor/message', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/quiz', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/syntax', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
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
app.get('/api/public/texts', async (_req: any, res: any) => {
  const { ImportService } = await import('../src/lib/services/importService');
  const texts = await ImportService.getPublicTexts(50);
  res.status(200).json(texts);
});

app.post('/api/public/texts/:textId/fork', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const newId = await ImportService.forkPublic(userId, req.params.textId);
  
  if (newId) {
    res.status(200).json({ id: newId });
  } else {
    res.status(500).json({ error: 'Failed to fork text' });
  }
});

app.post('/api/imports/:importId/share', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const success = await ImportService.sharePublic(userId, req.params.importId);
  
  res.status(200).json({ success });
});

app.post('/api/imports/:importId/unshare', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const success = await ImportService.unsharePublic(userId, req.params.importId);
  
  res.status(200).json({ success });
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
