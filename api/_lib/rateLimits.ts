import rateLimit from 'express-rate-limit';

// Vercel serverless resets in-memory state per invocation, so rate limiting
// there only slows burst per cold-start. For now we still apply limits; a
// future improvement is to use an external store (Redis/KV).

// On Vercel the real client IP is in X-Forwarded-For; on local it's req.ip.
function makeKeyGenerator(prefix: string) {
  return (req: any) => {
    const ip: string =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      (req.headers['x-real-ip'] as string | undefined) ??
      req.ip ??
      'unknown';
    const uid: string = (req.headers['x-user-id'] as string | undefined) ?? '';
    return `${prefix}:${uid || ip}`;
  };
}

/** General API: 300 requests / 15 minutes per IP/user */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: makeKeyGenerator('gen'),
  message: { error: 'Too many requests', code: 'RATE_LIMITED' },
});

/** AI endpoints: 30 requests / 15 minutes per IP/user (Gemini is expensive) */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: makeKeyGenerator('ai'),
  message: { error: 'AI rate limit exceeded. Please wait before making more AI requests.', code: 'AI_RATE_LIMITED' },
});

/** Auth endpoints: 20 attempts / 15 minutes per IP (brute-force protection) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: makeKeyGenerator('auth'),
  message: { error: 'Too many authentication attempts. Please try again later.', code: 'AUTH_RATE_LIMITED' },
});

/** Search endpoints: 60 searches / minute (read-heavy but Firestore has limits) */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: makeKeyGenerator('search'),
  message: { error: 'Search rate limit exceeded. Please slow down.', code: 'SEARCH_RATE_LIMITED' },
});
