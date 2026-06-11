import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../_lib/auth.js';
import { checkImportQuotaForUser } from '../_lib/importQuota.js';

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

    const quota = await checkImportQuotaForUser(uid);
    if (!quota) {
      return res
        .status(200)
        .json({ allowed: true, used: 0, limit: 'all', remaining: 'unlimited', planId: 'free' });
    }

    if (!quota.allowed) {
      return res.status(429).json({
        error: `Import limit reached (${quota.used}/${quota.limit} texts on your plan). Upgrade to import more.`,
        code: 'IMPORT_LIMIT_REACHED',
        ...quota,
      });
    }

    return res.status(200).json(quota);
  }
);

export default router;
