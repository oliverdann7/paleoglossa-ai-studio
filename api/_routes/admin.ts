import { Router } from 'express';
import { requireAuth } from '../_lib/auth';
import { getAdminDb, getAdminAuth } from '../_lib/firebaseAdmin';
import type { AuthenticatedRequest } from '../_lib/auth';

const router = Router();

const ADMIN_EMAILS = ['danezolv@gmail.com'];

function requireAdmin(req: AuthenticatedRequest, res: any): boolean {
  if (req.user?.claims?.admin === true) return true;
  const email = req.user?.email;
  if (email && ADMIN_EMAILS.includes(email)) return true;
  res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
  return false;
}

router.get('/api/admin/overview', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const usersSnap = await adminDb_.collection('users').get();
    let totalUsers = 0, paidUsers = 0, freeUsers = 0;
    usersSnap.forEach(d => {
      totalUsers++;
      const plan = d.data()?.currentPlan;
      if (plan && plan !== 'free') paidUsers++;
      else freeUsers++;
    });

    const publicTextsSnap = await adminDb_.collection('publicTexts').where('moderationStatus', '==', 'visible').get();
    const reportsSnap = await adminDb_.collection('publicTextReports').where('status', '==', 'open').get();
    const recentAiSnap = await adminDb_.collection('aiUsage').orderBy('updatedAt', 'desc').limit(100).get();
    let totalAiCalls = 0;
    recentAiSnap.forEach(d => { totalAiCalls += d.data()?.count || 0; });

    res.status(200).json({ totalUsers, paidUsers, freeUsers, publicTextCount: publicTextsSnap.size, openReports: reportsSnap.size, recentAiCalls: totalAiCalls });
  } catch (e: any) {
    console.error('[admin/overview] Error:', e.message);
    res.status(500).json({ error: 'Failed to get overview', code: 'INTERNAL_ERROR' });
  }
});

router.get('/api/admin/reports', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const snap = await adminDb_.collection('publicTextReports').orderBy('createdAt', 'desc').limit(50).get();
    const reports: any[] = [];
    snap.forEach(d => reports.push({ id: d.id, ...d.data() }));
    res.status(200).json(reports);
  } catch (e: any) {
    console.error('[admin/reports] Error:', e.message);
    res.status(500).json({ error: 'Failed to get reports', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/admin/publicTexts/:id/hide', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'hidden' });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[admin/hide] Error:', e.message);
    res.status(500).json({ error: 'Failed to hide text', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/admin/publicTexts/:id/restore', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'visible' });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[admin/restore] Error:', e.message);
    res.status(500).json({ error: 'Failed to restore text', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/admin/refresh-claims', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const { uid, email } = req.user!;
  const isAdminEmail = email ? ADMIN_EMAILS.includes(email) : false;
  if (isAdminEmail) {
    const auth_ = getAdminAuth();
    if (auth_) await auth_.setCustomUserClaims(uid, { admin: true });
  }
  return res.status(200).json({ admin: isAdminEmail });
});

export default router;
