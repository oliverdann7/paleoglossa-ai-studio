import express from 'express';

// --- In-memory Rate Limiting (per-process; does not persist across serverless invocations) ---
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

// Test route
app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
});

// Vercel handler
export default function handler(req: any, res: any) {
  app(req, res, () => {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}
