import express from 'express';
import aiRouter from './_routes/ai.js';
import audioRouter from './_routes/audio.js';
import authRouter from './_routes/auth.js';
import billingRouter from './_routes/billing.js';
import coursesRouter from './_routes/courses.js';
import grammarRouter from './_routes/grammar.js';
import lexiconRouter from './_routes/lexicon.js';
import manuscriptsRouter from './_routes/manuscripts.js';
import notesRouter from './_routes/notes.js';
import publicTextsRouter from './_routes/publicTexts.js';
import searchRouter from './_routes/search.js';
import syntaxRouter from './_routes/syntax.js';
import adminRouter from './_routes/admin.js';
import socialRouter from './_routes/social.js';
import parseRouter from './_routes/parse.js';
import corpusRouter from './_routes/corpus.js';
import discussionsRouter from './_routes/discussions.js';
import bookmarksRouter from './_routes/bookmarks.js';
import annotationsRouter from './_routes/annotations.js';

const app = express();

// Preserve raw body for Stripe webhook verification
app.use((req: any, _res: any, next: any) => {
  if (req.url === '/api/stripe/webhook') {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: '20mb' }));

app.use((_req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
});

// Domain routers — each module registers its own full /api/... paths
app.use(authRouter);
app.use(lexiconRouter);
app.use(aiRouter);
app.use(audioRouter);
app.use(coursesRouter);
app.use(grammarRouter);
app.use(manuscriptsRouter);
app.use(notesRouter);
app.use(publicTextsRouter);
app.use(searchRouter);
app.use(syntaxRouter);
app.use(billingRouter);
app.use(adminRouter);
app.use(socialRouter);
app.use(parseRouter);
app.use(corpusRouter);
app.use(discussionsRouter);
app.use(bookmarksRouter);
app.use(annotationsRouter);

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
