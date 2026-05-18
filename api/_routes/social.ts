import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

const VALID_REASONS = new Set([
  'spam',
  'harassment',
  'inappropriate_content',
  'fake_account',
  'other',
]);

// ── GET /api/social/community ────────────────────────────────────────────────
// Returns public scholars, excluding any the requesting user has blocked.
router.get(
  '/api/social/community',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    try {
      const uid = req.user!.uid;

      // Fetch blocked UIDs for this user so we can filter them out.
      const blocksSnap = await adminDb_.collection('users').doc(uid).collection('blocks').get();
      const blockedUids = new Set<string>();
      blocksSnap.forEach((d) => blockedUids.add(d.id));

      // No orderBy here — combining where(isPublic) + orderBy(createdAt) requires
      // a composite index that may not exist yet. Sort in memory instead.
      const snap = await adminDb_
        .collection('users')
        .where('isPublic', '==', true)
        .limit(100)
        .get();

      const scholars: any[] = [];
      snap.forEach((d) => {
        if (blockedUids.has(d.id)) return;
        const data = d.data();
        // Skip users with a hidden moderation status.
        if (data.moderationStatus === 'hidden') return;
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

// ── POST /api/social/report ──────────────────────────────────────────────────
// Persists a user report for admin review.
// Body: { type: 'profile' | 'text', targetId, reason, details? }
router.post(
  '/api/social/report',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    const { type, targetId, reason, details } = req.body ?? {};

    if (!['profile', 'text'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type', code: 'INVALID_TYPE' });
    }
    if (typeof targetId !== 'string' || !targetId.trim()) {
      return res.status(400).json({ error: 'targetId required', code: 'MISSING_TARGET' });
    }
    if (!VALID_REASONS.has(reason)) {
      return res.status(400).json({ error: 'Invalid reason', code: 'INVALID_REASON' });
    }

    const reporterId = req.user!.uid;
    if (type === 'profile' && targetId === reporterId) {
      return res.status(400).json({ error: 'Cannot report yourself', code: 'SELF_REPORT' });
    }

    try {
      const collection = type === 'profile' ? 'userReports' : 'publicTextReports';
      await adminDb_.collection(collection).add({
        type,
        targetId,
        reporterId,
        reason,
        details: typeof details === 'string' ? details.slice(0, 500) : null,
        status: 'open',
        createdAt: new Date(),
      });
      res.status(201).json({ ok: true });
    } catch (e: any) {
      console.error('[social/report] Error:', e.message);
      res.status(500).json({ error: 'Failed to submit report', code: 'INTERNAL_ERROR' });
    }
  }
);

// ── POST /api/social/block ───────────────────────────────────────────────────
// Blocks a user. Blocked users are hidden from the community list.
// Body: { targetUid }
router.post(
  '/api/social/block',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    const { targetUid } = req.body ?? {};
    if (typeof targetUid !== 'string' || !targetUid.trim()) {
      return res.status(400).json({ error: 'targetUid required', code: 'MISSING_TARGET' });
    }

    const uid = req.user!.uid;
    if (targetUid === uid) {
      return res.status(400).json({ error: 'Cannot block yourself', code: 'SELF_BLOCK' });
    }

    try {
      await adminDb_
        .collection('users')
        .doc(uid)
        .collection('blocks')
        .doc(targetUid)
        .set({ blockedAt: new Date() });
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[social/block] Error:', e.message);
      res.status(500).json({ error: 'Failed to block user', code: 'INTERNAL_ERROR' });
    }
  }
);

// ── DELETE /api/social/block/:targetUid ─────────────────────────────────────
// Unblocks a previously blocked user.
router.delete(
  '/api/social/block/:targetUid',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    const uid = req.user!.uid;
    const targetUid = String(req.params.targetUid);
    try {
      await adminDb_
        .collection('users')
        .doc(uid)
        .collection('blocks')
        .doc(targetUid)
        .delete();
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[social/unblock] Error:', e.message);
      res.status(500).json({ error: 'Failed to unblock user', code: 'INTERNAL_ERROR' });
    }
  }
);

// ── GET /api/social/blocks ───────────────────────────────────────────────────
// Returns the list of UIDs the current user has blocked.
router.get(
  '/api/social/blocks',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }
    const uid = req.user!.uid;
    try {
      const snap = await adminDb_.collection('users').doc(uid).collection('blocks').get();
      const blocked: { uid: string; blockedAt: string }[] = [];
      snap.forEach((d) => {
        blocked.push({
          uid: d.id,
          blockedAt: d.data().blockedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        });
      });
      res.status(200).json({ blocked });
    } catch (e: any) {
      console.error('[social/blocks] Error:', e.message);
      res.status(500).json({ error: 'Failed to fetch blocks', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
