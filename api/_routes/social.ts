import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.get(
  '/api/social/community',
  requireAuth as any,
  async (_req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    try {
      // No orderBy here — combining where(isPublic) + orderBy(createdAt) requires
      // a composite index that may not exist yet. Sort in memory instead.
      const snap = await adminDb_
        .collection('users')
        .where('isPublic', '==', true)
        .limit(100)
        .get();

      const scholars: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        scholars.push({
          uid: d.id,
          displayName: data.displayName || '',
          nickname: data.nickname ?? undefined,
          bio: data.bio ?? undefined,
          avatarUrl: data.avatarUrl ?? undefined,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
          stats: data.stats
            ? { totalKnown: data.stats.totalKnown ?? 0, streak: data.stats.streak ?? 0 }
            : undefined,
          sharedTextsCount: data.sharedTextsCount ?? undefined,
        });
      });

      scholars.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.localeCompare(a.createdAt);
      });

      res.status(200).json({ scholars });
    } catch (e: any) {
      console.error('[community] Error fetching scholars:', e.message);
      res.status(500).json({ error: 'Failed to fetch community', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
