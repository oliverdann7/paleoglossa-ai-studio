import { Router } from 'express';
import { requireAuth, optionalAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import {
  resolveAvailableSlots,
  type AvailabilityException,
  type RecurringWeek,
} from '../_lib/availability.js';

const router = Router();

function validRanges(value: any): { startMin: number; endMin: number }[] | null {
  if (!Array.isArray(value)) return null;
  const out: { startMin: number; endMin: number }[] = [];
  for (const r of value) {
    if (
      !r ||
      typeof r.startMin !== 'number' ||
      typeof r.endMin !== 'number' ||
      r.startMin < 0 ||
      r.endMin <= r.startMin ||
      r.endMin > 24 * 60
    ) {
      return null;
    }
    out.push({ startMin: r.startMin, endMin: r.endMin });
  }
  return out;
}

// PUT recurring for a weekday (own only).
router.put(
  '/api/tutors/me/availability/recurring/:weekday',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const weekday = Number(req.params.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      return res.status(400).json({ error: 'Invalid weekday', code: 'INVALID_WEEKDAY' });
    }
    const ranges = validRanges(req.body?.slots);
    if (!ranges)
      return res.status(400).json({ error: 'Invalid slot ranges', code: 'INVALID_SLOTS' });
    const uid = req.user!.uid;
    await adminDb_
      .doc(`tutorProfiles/${uid}/availability/recurring`)
      .collection('weekday')
      .doc(String(weekday))
      .set({ weekday, slots: ranges, updatedAt: new Date().toISOString() });
    res.status(200).json({ ok: true });
  }
);

// PUT exception for a YYYY-MM-DD.
router.put(
  '/api/tutors/me/availability/exception/:date',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const date = req.params.date as string;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res.status(400).json({ error: 'Invalid date', code: 'INVALID_DATE' });
    const blocks = validRanges(req.body?.blocks) ?? [];
    const extraSlots = validRanges(req.body?.extraSlots) ?? [];
    const uid = req.user!.uid;
    await adminDb_
      .doc(`tutorProfiles/${uid}/availabilityExceptions/${date}`)
      .set({ date, blocks, extraSlots, updatedAt: new Date().toISOString() });
    res.status(200).json({ ok: true });
  }
);

// GET public slot resolver.
router.get(
  '/api/tutors/:uid/slots',
  optionalAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const { uid } = req.params;
    const from = Number(req.query.from);
    const to = Number(req.query.to);
    const duration = Number(req.query.duration || 60);
    if (!from || !to || to <= from)
      return res.status(400).json({ error: 'Invalid range', code: 'INVALID_RANGE' });
    if (![30, 60, 90].includes(duration))
      return res.status(400).json({ error: 'Invalid duration', code: 'INVALID_DURATION' });
    try {
      const recurringSnap = await adminDb_
        .collection(`tutorProfiles/${uid}/availability/recurring/weekday`)
        .get();
      const byWeekday: Record<number, { startMin: number; endMin: number }[]> = {};
      recurringSnap.forEach((d) => {
        const data = d.data() as { weekday: number; slots: { startMin: number; endMin: number }[] };
        byWeekday[data.weekday] = data.slots || [];
      });
      const exSnap = await adminDb_
        .collection(`tutorProfiles/${uid}/availabilityExceptions`)
        .get();
      const exceptionsByDate: Record<string, AvailabilityException> = {};
      exSnap.forEach((d) => {
        const data = d.data() as AvailabilityException;
        exceptionsByDate[data.date] = data;
      });
      const bookingsSnap = await adminDb_
        .collection('bookings')
        .where('tutorId', '==', uid)
        .where('status', 'in', ['pending_payment', 'confirmed'])
        .get();
      const busy = bookingsSnap.docs.map((d) => {
        const data = d.data() as { startAt: string; durationMin: number };
        const startMs = new Date(data.startAt).getTime();
        return { startMs, endMs: startMs + data.durationMin * 60_000 };
      });
      const recurring: RecurringWeek = { byWeekday };
      const slots = resolveAvailableSlots({
        fromMs: from,
        toMs: to,
        durationMin: duration,
        recurring,
        exceptionsByDate,
        busy,
      });
      res
        .status(200)
        .json(slots.map((s) => ({ startAt: new Date(s.startMs).toISOString(), endMs: s.endMs })));
    } catch (err: any) {
      console.error('[availability/slots]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to resolve slots', code: 'SLOTS_ERROR' });
    }
  }
);

export default router;
