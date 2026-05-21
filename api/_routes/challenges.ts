import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.get('/api/challenges/completions', requireAuth, async (req: AuthenticatedRequest, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ completions: [] });

  try {
    const snap = await db
      .collection('users')
      .doc(req.user!.uid)
      .collection('challengeProgress')
      .orderBy('completedAt', 'desc')
      .get();

    const completions = snap.docs.map((d) => ({ challengeId: d.id, ...d.data() }));
    res.status(200).json({ completions });
  } catch (e: any) {
    console.error('[challenges/completions] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch completions', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/challenges/completions', requireAuth, async (req: AuthenticatedRequest, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: 'Service unavailable', code: 'NO_DB' });

  const { challengeId, metric, value } = req.body ?? {};
  if (!challengeId || typeof challengeId !== 'string') {
    return res.status(400).json({ error: 'challengeId required', code: 'INVALID_INPUT' });
  }

  try {
    const ref = db
      .collection('users')
      .doc(req.user!.uid)
      .collection('challengeProgress')
      .doc(challengeId);

    const existing = await ref.get();
    if (existing.exists) {
      return res.status(200).json({ already: true });
    }

    await ref.set({
      challengeId,
      metric: metric ?? '',
      value: typeof value === 'number' ? value : 0,
      completedAt: new Date().toISOString(),
    });

    res.status(201).json({ recorded: true });
  } catch (e: any) {
    console.error('[challenges/completions POST] Error:', e.message);
    res.status(500).json({ error: 'Failed to record completion', code: 'INTERNAL_ERROR' });
  }
});

export default router;
