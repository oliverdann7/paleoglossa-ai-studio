import express from 'express';
import { initServerSentry, captureServerException } from './_lib/sentry.js';
import { correlationIdMiddleware } from './_lib/observability.js';
import { aiRateLimit, apiRateLimit, authRateLimit, importRateLimit, searchRateLimit } from './_lib/rateLimiter.js';
import { logError } from './_lib/errorLog.js';

initServerSentry();
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
import challengesRouter from './_routes/challenges.js';
import connectRouter from './_routes/connect.js';
import tutorsRouter from './_routes/tutors.js';
import availabilityRouter from './_routes/availability.js';
import bookingsRouter from './_routes/bookings.js';
import reviewsRouter from './_routes/reviews.js';
import recommendationsRouter from './_routes/recommendations.js';
import importsRouter from './_routes/imports.js';

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

app.use(correlationIdMiddleware);

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

// Liveness probe — used by the post-deploy smoke check in deploy.yml. Kept
// above the rate limiters so monitors never consume the general quota, and
// dependency-free so it answers even when downstream config is broken.
app.get('/api/health', (_req: any, res: any) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    adminConfigured: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        (process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY)
    ),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ── Rate limiting (applied before domain routers) ────────────────────────────
// Auth endpoints: strict (10 req/min) — slow brute-force
app.use('/api/auth', authRateLimit);
// AI/LLM endpoints: 30 req/min — Gemini calls are expensive
app.use('/api/ai', aiRateLimit);
// Import + OCR: very expensive per-request, tight cap
app.use('/api/ai/analyze', importRateLimit);
app.use('/api/ai/ocr', importRateLimit);
// Search endpoints
app.use('/api/search', searchRateLimit);
// All other API routes: 120 req/min general limit
app.use('/api', apiRateLimit);

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
app.use(challengesRouter);
app.use(connectRouter);
app.use(tutorsRouter);
app.use(availabilityRouter);
app.use(bookingsRouter);
app.use(reviewsRouter);
app.use(recommendationsRouter);
app.use(importsRouter);

// Global error handler — report to Sentry before returning 500
app.use((err: any, req: any, res: any, next: any) => {
  logError(err, { route: req.path, method: req.method, statusCode: 500, userId: req.user?.uid });
  captureServerException(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

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
