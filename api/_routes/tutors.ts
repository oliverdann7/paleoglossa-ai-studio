import { Router } from 'express';
import { requireAuth, optionalAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';

const router = Router();

const MIN_HOURLY_CENTS = 500;
const MAX_HOURLY_CENTS = 30000;

function sanitizeProfileInput(body: any) {
  if (!body || typeof body !== 'object') return null;
  const {
    displayName,
    headline,
    bio,
    avatarUrl,
    videoIntroUrl,
    timezone,
    country,
    currency,
    hourlyRateCents,
    languagesTaught,
    spokenLanguages,
    credentials,
    tags,
  } = body;
  if (typeof displayName !== 'string' || displayName.trim().length < 2) return null;
  if (typeof timezone !== 'string') return null;
  if (typeof country !== 'string' || country.length !== 2) return null;
  if (typeof currency !== 'string' || currency.length !== 3) return null;
  if (
    typeof hourlyRateCents !== 'number' ||
    hourlyRateCents < MIN_HOURLY_CENTS ||
    hourlyRateCents > MAX_HOURLY_CENTS
  ) {
    return null;
  }
  if (!Array.isArray(languagesTaught) || languagesTaught.length === 0) return null;
  return {
    displayName: displayName.trim(),
    headline: typeof headline === 'string' ? headline.slice(0, 140) : '',
    bio: typeof bio === 'string' ? bio.slice(0, 4000) : '',
    avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : undefined,
    videoIntroUrl: typeof videoIntroUrl === 'string' ? videoIntroUrl : undefined,
    timezone,
    country: country.toUpperCase(),
    currency: currency.toUpperCase(),
    hourlyRateCents: Math.floor(hourlyRateCents),
    languagesTaught,
    spokenLanguages: Array.isArray(spokenLanguages) ? spokenLanguages : [],
    credentials: Array.isArray(credentials) ? credentials : [],
    tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
  };
}

// ─── Public directory ───────────────────────────────────────────────────────

router.get('/api/tutors', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { languageId, maxPriceCents, minRating } = req.query as Record<string, string>;
    let query = adminDb_
      .collection('tutorProfiles')
      .where('published', '==', true)
      .where('verificationStatus', '==', 'approved') as FirebaseFirestore.Query;

    if (maxPriceCents) {
      query = query.where('hourlyRateCents', '<=', Number(maxPriceCents));
    }
    const snap = await query.limit(100).get();
    const minR = minRating ? Number(minRating) : 0;
    const results = snap.docs
      .map((d) => ({ uid: d.id, ...d.data() }))
      .filter((p: any) => {
        if (languageId && !(p.languagesTaught || []).some((l: any) => l.languageId === languageId))
          return false;
        if ((p.avgRating || 0) < minR) return false;
        return true;
      });
    res.status(200).json(results);
  } catch (err: any) {
    console.error('[tutors/list]', err);
    res.status(500).json({ error: err.message || 'Failed to list tutors', code: 'TUTOR_LIST_ERROR' });
  }
});

router.get('/api/tutors/:uid', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const { uid } = req.params;
  try {
    const snap = await adminDb_.doc(`tutorProfiles/${uid}`).get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    const data = snap.data() as any;
    const isSelf = req.user?.uid === uid;
    if (!isSelf && !(data.published && data.verificationStatus === 'approved')) {
      return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ uid, ...data });
  } catch (err: any) {
    console.error('[tutors/get]', err);
    res.status(500).json({ error: err.message || 'Failed to load tutor', code: 'TUTOR_GET_ERROR' });
  }
});

// ─── Own profile CRUD ───────────────────────────────────────────────────────

router.get(
  '/api/tutors/me/profile',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const uid = req.user!.uid;
    try {
      const snap = await adminDb_.doc(`tutorProfiles/${uid}`).get();
      if (!snap.exists) return res.status(200).json(null);
      res.status(200).json({ uid, ...snap.data() });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message || 'Failed to load own profile', code: 'TUTOR_GET_ERROR' });
    }
  }
);

router.post('/api/tutors/me', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const uid = req.user!.uid;
  const input = sanitizeProfileInput(req.body);
  if (!input) {
    return res.status(400).json({ error: 'Invalid profile input', code: 'INVALID_INPUT' });
  }
  try {
    const userRef = adminDb_.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const roles: string[] = userSnap.data()?.roles || ['learner'];
    if (!roles.includes('tutor')) {
      await userRef.set({ roles: [...roles, 'tutor'] }, { merge: true });
    }

    const ref = adminDb_.doc(`tutorProfiles/${uid}`);
    const existing = await ref.get();
    const now = new Date().toISOString();
    const next = {
      ...input,
      uid,
      avgRating: existing.data()?.avgRating ?? 0,
      reviewCount: existing.data()?.reviewCount ?? 0,
      lessonCount: existing.data()?.lessonCount ?? 0,
      verificationStatus: existing.data()?.verificationStatus ?? 'pending',
      published: existing.data()?.published ?? false,
      createdAt: existing.data()?.createdAt ?? now,
      updatedAt: now,
    };
    await ref.set(next, { merge: true });
    res.status(200).json(next);
  } catch (err: any) {
    console.error('[tutors/me upsert]', err);
    res
      .status(500)
      .json({ error: err.message || 'Failed to save profile', code: 'TUTOR_UPSERT_ERROR' });
  }
});

router.post(
  '/api/tutors/me/publish',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const uid = req.user!.uid;
    try {
      const userSnap = await adminDb_.doc(`users/${uid}`).get();
      const connectStatus = userSnap.data()?.stripeConnectStatus;
      if (connectStatus !== 'verified') {
        return res
          .status(400)
          .json({ error: 'Stripe Connect not verified', code: 'CONNECT_NOT_VERIFIED' });
      }
      const profileSnap = await adminDb_.doc(`tutorProfiles/${uid}`).get();
      if (!profileSnap.exists) {
        return res.status(404).json({ error: 'No profile to publish', code: 'NO_PROFILE' });
      }
      if (profileSnap.data()?.verificationStatus !== 'approved') {
        return res.status(400).json({
          error: 'Awaiting admin verification before publishing',
          code: 'VERIFICATION_PENDING',
        });
      }
      await adminDb_
        .doc(`tutorProfiles/${uid}`)
        .set({ published: true, updatedAt: new Date().toISOString() }, { merge: true });
      res.status(200).json({ published: true });
    } catch (err: any) {
      console.error('[tutors/publish]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to publish', code: 'TUTOR_PUBLISH_ERROR' });
    }
  }
);

export default router;
