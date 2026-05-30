/**
 * Lightweight in-process rate limiter for the Express API.
 *
 * Implemented as a sliding-window counter using a Map so there is no
 * infrastructure dependency. Works well on a single server process; on
 * Vercel serverless (multi-instance) it degrades gracefully — each instance
 * enforces its own window, which is looser than the stated limit but still
 * prevents unbounded bursts from a single client hitting the same instance.
 *
 * Usage:
 *   app.use('/api/ai', rateLimiter({ windowMs: 60_000, max: 30 }));
 *   app.use('/api', rateLimiter({ windowMs: 60_000, max: 120 }));
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  /** Window size in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
  /** Max requests per IP per window. Default: 60. */
  max?: number;
  /** HTTP status code when the limit is exceeded. Default: 429. */
  statusCode?: number;
  /** Error message body. Default: standard message. */
  message?: string;
  /**
   * If true, authenticated requests (bearing an Authorization header) are
   * exempt from the limit. Default: false.
   */
  skipAuthenticated?: boolean;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

function getClientIp(req: Request): string {
  // Vercel/proxies forward the real IP in X-Forwarded-For.
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

/** Create a rate-limiter middleware with the given options. */
export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 60;
  const statusCode = options.statusCode ?? 429;
  const message =
    options.message ??
    'Too many requests — please slow down and try again in a moment.';
  const skipAuthenticated = options.skipAuthenticated ?? false;

  const store = new Map<string, WindowEntry>();

  // Periodically sweep expired entries so the Map doesn't grow unbounded.
  // On serverless this interval won't fire frequently, but that's fine —
  // expired entries are also evicted lazily on lookup.
  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, Math.max(windowMs, 60_000));

  // Don't prevent Node from exiting in tests.
  if (sweepInterval.unref) sweepInterval.unref();

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (skipAuthenticated && req.headers.authorization) {
      next();
      return;
    }

    const ip = getClientIp(req);
    const now = Date.now();
    const entry = store.get(ip);

    let current: WindowEntry;
    if (!entry || entry.resetAt <= now) {
      current = { count: 1, resetAt: now + windowMs };
      store.set(ip, current);
    } else {
      entry.count++;
      current = entry;
    }

    const resetSecs = Math.ceil(current.resetAt / 1000);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, max - current.count))
    );
    res.setHeader('X-RateLimit-Reset', String(resetSecs));

    if (current.count > max) {
      const retryAfterSecs = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSecs));
      res.status(statusCode).json({ error: message, code: 'RATE_LIMITED', retryAfterSecs });
      return;
    }

    next();
  };
}

/** Strict limiter for unauthenticated AI endpoints (30 req/min). */
export const aiRateLimit = rateLimiter({
  windowMs: 60_000,
  max: 30,
  skipAuthenticated: false,
  message: 'AI request limit reached. Authenticated users get higher limits.',
});

/** General API limiter (120 req/min). */
export const apiRateLimit = rateLimiter({ windowMs: 60_000, max: 120 });

/** Auth endpoint limiter — tight to slow brute-force (10 req/min). */
export const authRateLimit = rateLimiter({ windowMs: 60_000, max: 10 });

/** Import/OCR — expensive operations, tighter cap (5 req/min). */
export const importRateLimit = rateLimiter({ windowMs: 60_000, max: 5 });
