import { Router } from 'express';
import { requireAuth } from '../_lib/auth';
import { getAdminDb, getAdminAuth } from '../_lib/firebaseAdmin';
import type { AuthenticatedRequest } from '../_lib/auth';
import type { Timestamp } from 'firebase-admin/firestore';

const router = Router();

const ADMIN_EMAILS = ['ADMIN_EMAIL_REDACTED', 'admin@paleoglossa.com'];

function requireAdmin(req: AuthenticatedRequest, res: any): boolean {
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
    const adminDb_ = getAdminDb();
    if (adminDb_) {
      await adminDb_.collection('users').doc(uid).set({
        currentPlan: 'full_all',
        subscriptionStatus: 'active',
        selectedLanguageIds: [],
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }
  return res.status(200).json({ admin: isAdminEmail });
});

router.get('/api/admin/users', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  const auth_ = getAdminAuth();
  if (!adminDb_ || !auth_) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const snap = await adminDb_.collection('users').limit(limit).get();
    const uids = snap.docs.map(d => d.id);
    const rows: any[] = [];
    for (let i = 0; i < uids.length; i += 100) {
      const batch = uids.slice(i, i + 100);
      const result = await auth_.getUsers(batch.map(uid => ({ uid })));
      const authMap: Record<string, any> = {};
      result.users.forEach(u => { authMap[u.uid] = u; });
      snap.docs.slice(i, i + 100).forEach(d => {
        const data = d.data();
        const authUser = authMap[d.id];
        rows.push({
          uid: d.id,
          email: authUser?.email || data.email || null,
          displayName: authUser?.displayName || null,
          photoURL: authUser?.photoURL || null,
          currentPlan: data.currentPlan || 'free',
          subscriptionStatus: data.subscriptionStatus || 'free',
          isAdmin: !!(authUser?.customClaims?.admin),
          createdAt: authUser?.metadata?.creationTime || null,
          lastSignIn: authUser?.metadata?.lastSignInTime || null,
        });
      });
    }
    res.status(200).json(rows);
  } catch (e: any) {
    console.error('[admin/users] Error:', e.message);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.post('/api/admin/users/:uid/set-plan', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable' });
  const { plan } = req.body;
  const validPlans = ['free', 'basic_1', 'duo_2', 'full_all'];
  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan', validPlans });
  }
  try {
    const uid = req.params.uid as string;
    await adminDb_.collection('users').doc(uid).set({
      currentPlan: plan,
      subscriptionStatus: plan === 'free' ? 'free' : 'active',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[admin/set-plan] Error:', e.message);
    res.status(500).json({ error: 'Failed to set plan' });
  }
});

router.post('/api/admin/users/:uid/set-admin', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const auth_ = getAdminAuth();
  const adminDb_ = getAdminDb();
  if (!auth_) return res.status(503).json({ error: 'Service unavailable' });
  const uid = req.params.uid as string;
  const { grant } = req.body;
  try {
    const existing = await auth_.getUser(uid);
    const currentClaims = existing.customClaims || {};
    await auth_.setCustomUserClaims(uid, { ...currentClaims, admin: !!grant });
    if (grant && adminDb_) {
      await adminDb_.collection('users').doc(uid).set({
        currentPlan: 'full_all',
        subscriptionStatus: 'active',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    res.status(200).json({ ok: true, admin: !!grant });
  } catch (e: any) {
    console.error('[admin/set-admin] Error:', e.message);
    res.status(500).json({ error: 'Failed to update admin claim' });
  }
});

function extractTS(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof (val as Timestamp).toMillis === 'function') return new Date((val as Timestamp).toMillis()).toISOString();
  return null;
}

router.get('/api/admin/activities', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  const auth_ = getAdminAuth();
  if (!adminDb_ || !auth_) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const [aiSnap, textsSnap, usersSnap, reportsSnap] = await Promise.all([
      adminDb_.collection('aiUsage').orderBy('updatedAt', 'desc').limit(30).get(),
      adminDb_.collection('publicTexts').orderBy('createdAt', 'desc').limit(30).get(),
      adminDb_.collection('users').orderBy('createdAt', 'desc').limit(30).get(),
      adminDb_.collection('publicTextReports').orderBy('createdAt', 'desc').limit(30).get(),
    ]);

    const activities: any[] = [];

    aiSnap.forEach(d => {
      const data = d.data();
      const ts = extractTS(data.updatedAt) || extractTS(data.createdAt);
      if (ts) {
        activities.push({
          id: 'ai_' + d.id, uid: d.id, action: 'ai_call',
          details: `${data.count || 0} AI calls used`,
          timestamp: ts,
        });
      }
    });

    textsSnap.forEach(d => {
      const data = d.data();
      const ts = extractTS(data.createdAt);
      if (ts) {
        activities.push({
          id: 'text_' + d.id, uid: data.authorId || data.userId || '',
          action: 'create_text',
          details: data.title || data.name || 'Untitled text',
          timestamp: ts,
        });
      }
    });

    usersSnap.forEach(d => {
      const data = d.data();
      const ts = extractTS(data.createdAt);
      if (ts) {
        activities.push({
          id: 'user_' + d.id, uid: d.id,
          email: data.email, displayName: data.displayName,
          action: 'sign_up',
          timestamp: ts,
        });
      }
    });

    reportsSnap.forEach(d => {
      const data = d.data();
      const ts = extractTS(data.createdAt);
      if (ts) {
        activities.push({
          id: 'report_' + d.id, uid: data.reporterId || '',
          action: 'report',
          details: `Reported text: ${data.textId || 'unknown'}`,
          timestamp: ts,
        });
      }
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const uids = [...new Set(activities.map(a => a.uid).filter(Boolean))] as string[];
    const userMap: Record<string, { email?: string; displayName?: string; photoURL?: string }> = {};
    for (let i = 0; i < uids.length; i += 100) {
      const batch = uids.slice(i, i + 100);
      const result = await auth_.getUsers(batch.map(uid => ({ uid })));
      result.users.forEach(u => {
        userMap[u.uid] = { email: u.email || undefined, displayName: u.displayName || undefined, photoURL: u.photoURL || undefined };
      });
    }

    activities.forEach(a => {
      const u = userMap[a.uid];
      if (u) {
        if (!a.email) a.email = u.email;
        if (!a.displayName) a.displayName = u.displayName;
        if (!a.photoURL) a.photoURL = u.photoURL;
      }
    });

    res.status(200).json(activities.slice(0, 50));
  } catch (e: any) {
    console.error('[admin/activities] Error:', e.message);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

export default router;
