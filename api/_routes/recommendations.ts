import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../_lib/auth.js';
import {
  getRecommendations,
  getTopLemmasForLanguage,
  invalidateKnownLemmas,
} from '../_lib/recommender.js';

const router = Router();

/**
 * GET /api/recommendations?lang=grc&limit=6
 * Returns ranked "ready to read next" picks for the authenticated user.
 */
router.get('/api/recommendations', requireAuth, async (req: AuthenticatedRequest, res: any) => {
  try {
    const lang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN;
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(20, limitRaw)) : 6;

    const uid = req.user!.uid;
    const recommendations = await getRecommendations(uid, { languageId: lang, limit });
    res.status(200).json({ recommendations });
  } catch (err: any) {
    console.error('[recommendations] error:', err);
    res.status(500).json({ error: 'Failed to compute recommendations' });
  }
});

/**
 * GET /api/recommendations/onboarding-lemmas?lang=grc&limit=50
 * Returns the top-N highest-frequency lemmas in the curated corpus for the
 * given language. Used by the onboarding "tap the words you already know" step.
 * Public — no PII, no auth needed.
 */
router.get('/api/recommendations/onboarding-lemmas', (req: any, res: any) => {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : '';
  if (!lang) return res.status(400).json({ error: 'lang query param is required' });
  const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN;
  const limit = Number.isFinite(limitRaw) ? Math.max(10, Math.min(200, limitRaw)) : 50;
  const lemmas = getTopLemmasForLanguage(lang, limit);
  res.status(200).json({ languageId: lang, lemmas });
});

/**
 * POST /api/recommendations/invalidate
 * Client signals that vocab state changed and the server-side known-lemma
 * cache for this user should be dropped. Cheap — just bumps a Map entry.
 */
router.post(
  '/api/recommendations/invalidate',
  requireAuth,
  (req: AuthenticatedRequest, res: any) => {
    invalidateKnownLemmas(req.user!.uid);
    res.status(204).end();
  }
);

export default router;
