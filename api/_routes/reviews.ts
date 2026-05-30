import { Router } from 'express';
import { requireAuth, optionalAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';

const router = Router();

router.post(
  '/api/bookings/:id/review',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const uid = req.user!.uid;
    const { rating, body } = req.body || {};
    if (![1, 2, 3, 4, 5].includes(rating))
      return res.status(400).json({ error: 'Invalid rating', code: 'INVALID_RATING' });
    const bookingRef = adminDb_.doc(`bookings/${req.params.id}`);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists)
      return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    const booking = bookingSnap.data()!;
    if (booking.learnerId !== uid)
      return res.status(403).json({ error: 'Only learner can review', code: 'FORBIDDEN' });
    if (booking.status !== 'completed')
      return res
        .status(400)
        .json({ error: 'Booking not completed', code: 'BOOKING_NOT_COMPLETED' });

    const existing = await adminDb_
      .collection('reviews')
      .where('bookingId', '==', req.params.id)
      .limit(1)
      .get();
    if (!existing.empty)
      return res.status(409).json({ error: 'Already reviewed', code: 'REVIEW_EXISTS' });

    const now = new Date().toISOString();
    const reviewRef = adminDb_.collection('reviews').doc();
    await reviewRef.set({
      bookingId: req.params.id,
      tutorId: booking.tutorId,
      learnerId: uid,
      rating,
      body: typeof body === 'string' ? body.slice(0, 4000) : '',
      createdAt: now,
    });

    // Recompute tutor aggregate.
    const allReviews = await adminDb_
      .collection('reviews')
      .where('tutorId', '==', booking.tutorId)
      .get();
    const totals = allReviews.docs.reduce(
      (acc, d) => {
        acc.sum += d.data().rating;
        acc.n += 1;
        return acc;
      },
      { sum: 0, n: 0 }
    );
    await adminDb_.doc(`tutorProfiles/${booking.tutorId}`).set(
      {
        avgRating: totals.n === 0 ? 0 : totals.sum / totals.n,
        reviewCount: totals.n,
        updatedAt: now,
      },
      { merge: true }
    );

    res.status(200).json({ id: reviewRef.id });
  }
);

router.get(
  '/api/tutors/:uid/reviews',
  optionalAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const snap = await adminDb_
      .collection('reviews')
      .where('tutorId', '==', req.params.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    res.status(200).json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
);

export default router;
