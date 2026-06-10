import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { lookupEffectivePlan } from '../_lib/aiUsage.js';
import { evaluateImportQuota } from '../_lib/importQuota.js';

const router = Router();

/**
 * Server-side import quota check (roadmap § 11, item 0.4).
 *
 * Counts `users/{uid}/imports` with an Admin SDK aggregate query and compares
 * against the user's effective plan limit. Returns 429 with
 * `code: 'IMPORT_LIMIT_REACHED'` when the user is at or over the limit.
 *
 * Fails open (allowed) when the Admin DB is unavailable or the count fails —
 * a degraded quota check must never block a paying user from importing.
 */
router.get(
  '/api/imports/quota',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const uid = req.user!.uid;

    try {
      const adminDb_ = getAdminDb();
      if (!adminDb_) {
        return res
          .status(200)
          .json({ allowed: true, used: 0, limit: 'all', remaining: 'unlimited', planId: 'free' });
      }

      const planId = await lookupEffectivePlan(uid);
      const countSnap = await adminDb_.collection(`users/${uid}/imports`).count().get();
      const used = countSnap.data().count;
      const quota = evaluateImportQuota(planId, used);

      if (!quota.allowed) {
        return res.status(429).json({
          error: `Import limit reached (${quota.used}/${quota.limit} texts on your plan). Upgrade to import more.`,
          code: 'IMPORT_LIMIT_REACHED',
          ...quota,
          planId,
        });
      }

      return res.status(200).json({ ...quota, planId });
    } catch (err) {
      console.error('[imports/quota] check failed:', err);
      return res
        .status(200)
        .json({ allowed: true, used: 0, limit: 'all', remaining: 'unlimited', planId: 'free' });
    }
  }
);

export default router;
