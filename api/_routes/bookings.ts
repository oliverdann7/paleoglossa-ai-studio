import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { getStripe } from '../_lib/stripeConnect.js';
import {
  calculateLessonPriceCents,
  calculatePlatformFeeCents,
} from '../_lib/availability.js';
import {
  canTransition,
  learnerCancelRefund,
  tutorCancelRefund,
  type BookingStatus,
} from '../_lib/bookingPolicy.js';

const router = Router();

const PLATFORM_FEE_BPS = Number(process.env.STRIPE_PLATFORM_FEE_BPS || 1500);
const REFUND_WINDOW_HOURS = 24;
const SLOT_HOLD_MIN = 15;

router.post('/api/bookings', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  const learnerId = req.user!.uid;
  const { tutorId, languageId, startAt, durationMin, lessonGoal, attachedTextId } = req.body || {};
  if (!tutorId || !languageId || !startAt || !durationMin)
    return res.status(400).json({ error: 'Missing fields', code: 'INVALID_INPUT' });
  if (![30, 60, 90].includes(durationMin))
    return res.status(400).json({ error: 'Invalid duration', code: 'INVALID_DURATION' });
  const startMs = new Date(startAt).getTime();
  if (!Number.isFinite(startMs) || startMs < Date.now())
    return res.status(400).json({ error: 'Invalid start time', code: 'INVALID_START' });

  try {
    const tutorSnap = await adminDb_.doc(`tutorProfiles/${tutorId}`).get();
    if (
      !tutorSnap.exists ||
      !tutorSnap.data()?.published ||
      tutorSnap.data()?.verificationStatus !== 'approved'
    ) {
      return res.status(404).json({ error: 'Tutor not bookable', code: 'TUTOR_NOT_BOOKABLE' });
    }
    const tutor = tutorSnap.data()!;
    const priceCents = calculateLessonPriceCents(tutor.hourlyRateCents, durationMin);
    const platformFeeCents = calculatePlatformFeeCents(priceCents, PLATFORM_FEE_BPS);

    // Check the slot isn't already claimed by an active booking.
    const overlap = await adminDb_
      .collection('bookings')
      .where('tutorId', '==', tutorId)
      .where('status', 'in', ['pending_payment', 'confirmed'])
      .where('startAt', '==', new Date(startMs).toISOString())
      .limit(1)
      .get();
    if (!overlap.empty)
      return res.status(409).json({ error: 'Slot already taken', code: 'SLOT_TAKEN' });

    const tutorUser = await adminDb_.doc(`users/${tutorId}`).get();
    const connectAccountId = tutorUser.data()?.stripeConnectAccountId;

    const bookingRef = adminDb_.collection('bookings').doc();
    const expiresAt = new Date(Date.now() + SLOT_HOLD_MIN * 60_000).toISOString();

    let paymentIntentId: string | undefined;
    let clientSecret: string | undefined;
    let devMode = false;

    if (process.env.STRIPE_SECRET_KEY && connectAccountId) {
      const stripe = await getStripe();
      const pi = await stripe.paymentIntents.create({
        amount: priceCents,
        currency: (tutor.currency || 'USD').toLowerCase(),
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: connectAccountId },
        metadata: {
          bookingId: bookingRef.id,
          learnerId,
          tutorId,
          languageId,
        },
      });
      paymentIntentId = pi.id;
      clientSecret = pi.client_secret || undefined;
    } else {
      devMode = true;
    }

    const now = new Date().toISOString();
    await bookingRef.set({
      tutorId,
      learnerId,
      languageId,
      startAt: new Date(startMs).toISOString(),
      durationMin,
      priceCents,
      platformFeeCents,
      currency: tutor.currency || 'USD',
      status: 'pending_payment',
      stripePaymentIntentId: paymentIntentId,
      lessonGoal: typeof lessonGoal === 'string' ? lessonGoal.slice(0, 500) : undefined,
      attachedTextId: typeof attachedTextId === 'string' ? attachedTextId : undefined,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    await adminDb_.collection('marketplaceEvents').add({
      bookingId: bookingRef.id,
      tutorId,
      learnerId,
      kind: 'booking.created',
      createdAt: now,
    });

    res.status(200).json({
      bookingId: bookingRef.id,
      clientSecret,
      paymentIntentId,
      priceCents,
      platformFeeCents,
      currency: tutor.currency,
      devMode,
    });
  } catch (err: any) {
    console.error('[bookings/create]', err);
    res
      .status(500)
      .json({ error: err.message || 'Failed to create booking', code: 'BOOKING_CREATE_ERROR' });
  }
});

router.get('/api/bookings/mine', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const uid = req.user!.uid;
  try {
    const learnerSnap = await adminDb_
      .collection('bookings')
      .where('learnerId', '==', uid)
      .orderBy('startAt', 'desc')
      .limit(100)
      .get();
    const tutorSnap = await adminDb_
      .collection('bookings')
      .where('tutorId', '==', uid)
      .orderBy('startAt', 'desc')
      .limit(100)
      .get();
    const seen = new Set<string>();
    const all: any[] = [];
    [...learnerSnap.docs, ...tutorSnap.docs].forEach((d) => {
      if (seen.has(d.id)) return;
      seen.add(d.id);
      all.push({ id: d.id, ...d.data() });
    });
    res.status(200).json(all);
  } catch (err: any) {
    console.error('[bookings/mine]', err);
    res
      .status(500)
      .json({ error: err.message || 'Failed to list bookings', code: 'BOOKING_LIST_ERROR' });
  }
});

router.get('/api/bookings/:id', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const uid = req.user!.uid;
  const snap = await adminDb_.doc(`bookings/${req.params.id}`).get();
  if (!snap.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
  const data = snap.data()!;
  if (data.learnerId !== uid && data.tutorId !== uid)
    return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
  res.status(200).json({ id: snap.id, ...data });
});

router.post(
  '/api/bookings/:id/cancel',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const uid = req.user!.uid;
    const ref = adminDb_.doc(`bookings/${req.params.id}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    const data = snap.data()!;
    const isLearner = data.learnerId === uid;
    const isTutor = data.tutorId === uid;
    if (!isLearner && !isTutor)
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    const nextStatus: BookingStatus = isLearner ? 'cancelled_by_learner' : 'cancelled_by_tutor';
    if (!canTransition(data.status as BookingStatus, nextStatus))
      return res
        .status(400)
        .json({ error: 'Cannot cancel in current state', code: 'INVALID_TRANSITION' });

    const startMs = new Date(data.startAt).getTime();
    const refund = isLearner
      ? learnerCancelRefund({
          startMs,
          nowMs: Date.now(),
          priceCents: data.priceCents,
          windowHours: REFUND_WINDOW_HOURS,
        })
      : tutorCancelRefund(data.priceCents);

    try {
      if (
        process.env.STRIPE_SECRET_KEY &&
        data.stripePaymentIntentId &&
        refund.refundCents > 0 &&
        data.status === 'confirmed'
      ) {
        const stripe = await getStripe();
        await stripe.refunds.create({
          payment_intent: data.stripePaymentIntentId,
          amount: refund.refundCents,
          reverse_transfer: true,
          refund_application_fee: true,
        });
      }
      const now = new Date().toISOString();
      await ref.set(
        {
          status: nextStatus,
          cancelReason: req.body?.reason || null,
          cancelledAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      await adminDb_.collection('marketplaceEvents').add({
        bookingId: snap.id,
        kind: `booking.${nextStatus}`,
        detail: { refundCents: refund.refundCents },
        createdAt: now,
      });
      res.status(200).json({ ok: true, refundCents: refund.refundCents });
    } catch (err: any) {
      console.error('[bookings/cancel]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to cancel', code: 'BOOKING_CANCEL_ERROR' });
    }
  }
);

export default router;
