import { Router } from 'express';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { requireAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.get('/api/social/community', async (_req: any, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    return res.status(200).json({ scholars: [] });
  }
  try {
    // No orderBy here — combining where(isPublic) + orderBy(createdAt) requires
    // a composite index that may not exist yet. Sort in memory instead.
    const snap = await adminDb_.collection('users').where('isPublic', '==', true).limit(100).get();

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
});

// ─── Follow / Unfollow ────────────────────────────────────────────────────────

async function getFollowCounts(db: FirebaseFirestore.Firestore, uid: string) {
  const [followersSnap, followingSnap] = await Promise.all([
    db.collection('users').doc(uid).collection('followers').count().get(),
    db.collection('users').doc(uid).collection('following').count().get(),
  ]);
  return {
    followerCount: followersSnap.data().count,
    followingCount: followingSnap.data().count,
  };
}

// GET /api/social/follow/:targetUid/status
router.get('/api/social/follow/:targetUid/status', requireAuth, async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ isFollowing: false, followerCount: 0, followingCount: 0 });

  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const targetUid = req.params.targetUid as string;

  try {
    const [followDoc, counts] = await Promise.all([
      db.collection('users').doc(uid).collection('following').doc(targetUid).get(),
      getFollowCounts(db, targetUid),
    ]);
    res.status(200).json({ isFollowing: followDoc.exists, ...counts });
  } catch (e: any) {
    console.error('[social/follow status] Error:', e.message);
    res.status(500).json({ error: 'Failed to get follow status' });
  }
});

// POST /api/social/follow/:targetUid
router.post('/api/social/follow/:targetUid', requireAuth, async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: 'Database unavailable' });

  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const targetUid = req.params.targetUid as string;

  if (uid === targetUid) return res.status(400).json({ error: 'Cannot follow yourself' });

  try {
    const targetDoc = await db.collection('users').doc(targetUid).get();
    if (!targetDoc.exists || !targetDoc.data()?.isPublic) {
      return res.status(404).json({ error: 'User not found or not public' });
    }

    const now = new Date().toISOString();
    const batch = db.batch();

    batch.set(db.collection('users').doc(uid).collection('following').doc(targetUid), {
      followedAt: now,
    });
    batch.set(db.collection('users').doc(targetUid).collection('followers').doc(uid), {
      followedAt: now,
    });

    await batch.commit();

    const counts = await getFollowCounts(db, targetUid);
    res.status(200).json({ isFollowing: true, ...counts });
  } catch (e: any) {
    console.error('[social/follow POST] Error:', e.message);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// DELETE /api/social/follow/:targetUid
router.delete('/api/social/follow/:targetUid', requireAuth, async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: 'Database unavailable' });

  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const targetUid = req.params.targetUid as string;

  try {
    const batch = db.batch();
    batch.delete(db.collection('users').doc(uid).collection('following').doc(targetUid));
    batch.delete(db.collection('users').doc(targetUid).collection('followers').doc(uid));
    await batch.commit();

    const counts = await getFollowCounts(db, targetUid);
    res.status(200).json({ isFollowing: false, ...counts });
  } catch (e: any) {
    console.error('[social/follow DELETE] Error:', e.message);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// GET /api/social/:uid/following
router.get('/api/social/:uid/following', async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ following: [] });

  const targetUid = req.params.uid as string;
  try {
    const snap = await db
      .collection('users')
      .doc(targetUid)
      .collection('following')
      .orderBy('followedAt', 'desc')
      .limit(100)
      .get();
    const following = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    res.status(200).json({ following });
  } catch (e: any) {
    console.error('[social/following] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// GET /api/social/:uid/followers
router.get('/api/social/:uid/followers', async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ followers: [] });

  const targetUid = req.params.uid as string;
  try {
    const snap = await db
      .collection('users')
      .doc(targetUid)
      .collection('followers')
      .orderBy('followedAt', 'desc')
      .limit(100)
      .get();
    const followers = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    res.status(200).json({ followers });
  } catch (e: any) {
    console.error('[social/followers] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

export default router;
