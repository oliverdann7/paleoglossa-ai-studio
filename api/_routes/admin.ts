import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb, getAdminAuth } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import type { Timestamp } from 'firebase-admin/firestore';
import { calculateCorpusQuality } from '../../src/lib/corpus-quality/calculateCorpusQuality.js';

const router = Router();

const ADMIN_EMAILS = ['ADMIN_EMAIL_REDACTED', 'admin@paleoglossa.com'];

function requireAdmin(req: AuthenticatedRequest, res: any): boolean {
  const email = req.user?.email;
  if (email && ADMIN_EMAILS.includes(email)) return true;
  res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
  return false;
}

router.get(
  '/api/admin/overview',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      const usersSnap = await adminDb_.collection('users').get();
      let totalUsers = 0,
        paidUsers = 0,
        freeUsers = 0;
      usersSnap.forEach((d) => {
        totalUsers++;
        const plan = d.data()?.currentPlan;
        if (plan && plan !== 'free') paidUsers++;
        else freeUsers++;
      });

      const publicTextsSnap = await adminDb_
        .collection('publicTexts')
        .where('moderationStatus', '==', 'visible')
        .get();
      const reportsSnap = await adminDb_
        .collection('publicTextReports')
        .where('status', '==', 'open')
        .get();
      const recentAiSnap = await adminDb_
        .collection('aiUsage')
        .orderBy('updatedAt', 'desc')
        .limit(100)
        .get();
      let totalAiCalls = 0;
      recentAiSnap.forEach((d) => {
        totalAiCalls += d.data()?.count || 0;
      });

      res.status(200).json({
        totalUsers,
        paidUsers,
        freeUsers,
        publicTextCount: publicTextsSnap.size,
        openReports: reportsSnap.size,
        recentAiCalls: totalAiCalls,
      });
    } catch (e: any) {
      console.error('[admin/overview] Error:', e.message);
      res.status(500).json({ error: 'Failed to get overview', code: 'INTERNAL_ERROR' });
    }
  }
);

router.get(
  '/api/admin/reports',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      const snap = await adminDb_
        .collection('publicTextReports')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      const reports: any[] = [];
      snap.forEach((d) => reports.push({ id: d.id, ...d.data() }));
      res.status(200).json(reports);
    } catch (e: any) {
      console.error('[admin/reports] Error:', e.message);
      res.status(500).json({ error: 'Failed to get reports', code: 'INTERNAL_ERROR' });
    }
  }
);

router.post(
  '/api/admin/publicTexts/:id/hide',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'hidden' });
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[admin/hide] Error:', e.message);
      res.status(500).json({ error: 'Failed to hide text', code: 'INTERNAL_ERROR' });
    }
  }
);

router.post(
  '/api/admin/publicTexts/:id/restore',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      await adminDb_.doc('publicTexts/' + req.params.id).update({ moderationStatus: 'visible' });
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[admin/restore] Error:', e.message);
      res.status(500).json({ error: 'Failed to restore text', code: 'INTERNAL_ERROR' });
    }
  }
);

router.post(
  '/api/admin/refresh-claims',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const { uid, email } = req.user!;
    const isAdminEmail = email ? ADMIN_EMAILS.includes(email) : false;
    if (isAdminEmail) {
      const auth_ = getAdminAuth();
      if (auth_) await auth_.setCustomUserClaims(uid, { admin: true });
      const adminDb_ = getAdminDb();
      if (adminDb_) {
        await adminDb_.collection('users').doc(uid).set(
          {
            currentPlan: 'full_all',
            subscriptionStatus: 'active',
            selectedLanguageIds: [],
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }
    return res.status(200).json({ admin: isAdminEmail });
  }
);

router.get('/api/admin/users', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  if (!requireAdmin(req, res)) return;
  const adminDb_ = getAdminDb();
  const auth_ = getAdminAuth();
  if (!adminDb_ || !auth_) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const snap = await adminDb_.collection('users').limit(limit).get();
    const uids = snap.docs.map((d) => d.id);
    const rows: any[] = [];
    for (let i = 0; i < uids.length; i += 100) {
      const batch = uids.slice(i, i + 100);
      const result = await auth_.getUsers(batch.map((uid) => ({ uid })));
      const authMap: Record<string, any> = {};
      result.users.forEach((u) => {
        authMap[u.uid] = u;
      });
      snap.docs.slice(i, i + 100).forEach((d) => {
        const data = d.data();
        const authUser = authMap[d.id];
        rows.push({
          uid: d.id,
          email: authUser?.email || data.email || null,
          displayName: authUser?.displayName || null,
          photoURL: authUser?.photoURL || null,
          currentPlan: data.currentPlan || 'free',
          subscriptionStatus: data.subscriptionStatus || 'free',
          isAdmin: !!authUser?.customClaims?.admin,
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

router.post(
  '/api/admin/users/:uid/set-plan',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
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
      await adminDb_
        .collection('users')
        .doc(uid)
        .set(
          {
            currentPlan: plan,
            subscriptionStatus: plan === 'free' ? 'free' : 'active',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[admin/set-plan] Error:', e.message);
      res.status(500).json({ error: 'Failed to set plan' });
    }
  }
);

router.post(
  '/api/admin/users/:uid/set-admin',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
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
        await adminDb_.collection('users').doc(uid).set(
          {
            currentPlan: 'full_all',
            subscriptionStatus: 'active',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      res.status(200).json({ ok: true, admin: !!grant });
    } catch (e: any) {
      console.error('[admin/set-admin] Error:', e.message);
      res.status(500).json({ error: 'Failed to update admin claim' });
    }
  }
);

// ─── Admin courses: list all ───────────────────────────────────────────────────

router.get(
  '/api/admin/courses',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const snap = await adminDb_
        .collection('courses')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
      const courses: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        courses.push({
          id: doc.id,
          ownerId: data.ownerId,
          title: data.title,
          description: data.description || '',
          languageId: data.languageId || 'grc',
          texts: data.texts || [],
          isPublic: Boolean(data.isPublic),
          memberCount: data.memberCount ?? 1,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? null,
        });
      });
      res.status(200).json(courses);
    } catch (e: any) {
      console.error('[admin/courses] Error listing:', e.message);
      res.status(500).json({ error: 'Failed to list courses', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── Admin courses: delete any ─────────────────────────────────────────────────

router.delete(
  '/api/admin/courses/:courseId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { courseId } = req.params;
      const doc = await adminDb_.doc(`courses/${courseId}`).get();
      if (!doc.exists)
        return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });

      await adminDb_.doc(`courses/${courseId}`).delete();
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[admin/courses] Error deleting:', e.message);
      res.status(500).json({ error: 'Failed to delete course', code: 'INTERNAL_ERROR' });
    }
  }
);

function extractTS(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof (val as Timestamp).toMillis === 'function')
    return new Date((val as Timestamp).toMillis()).toISOString();
  return null;
}

router.get(
  '/api/admin/activities',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
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

      aiSnap.forEach((d) => {
        const data = d.data();
        const ts = extractTS(data.updatedAt) || extractTS(data.createdAt);
        if (ts) {
          activities.push({
            id: 'ai_' + d.id,
            uid: d.id,
            action: 'ai_call',
            details: `${data.count || 0} AI calls used`,
            timestamp: ts,
          });
        }
      });

      textsSnap.forEach((d) => {
        const data = d.data();
        const ts = extractTS(data.createdAt);
        if (ts) {
          activities.push({
            id: 'text_' + d.id,
            uid: data.authorId || data.userId || '',
            action: 'create_text',
            details: data.title || data.name || 'Untitled text',
            timestamp: ts,
          });
        }
      });

      usersSnap.forEach((d) => {
        const data = d.data();
        const ts = extractTS(data.createdAt);
        if (ts) {
          activities.push({
            id: 'user_' + d.id,
            uid: d.id,
            email: data.email,
            displayName: data.displayName,
            action: 'sign_up',
            timestamp: ts,
          });
        }
      });

      reportsSnap.forEach((d) => {
        const data = d.data();
        const ts = extractTS(data.createdAt);
        if (ts) {
          activities.push({
            id: 'report_' + d.id,
            uid: data.reporterId || '',
            action: 'report',
            details: `Reported text: ${data.textId || 'unknown'}`,
            timestamp: ts,
          });
        }
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const uids = [...new Set(activities.map((a) => a.uid).filter(Boolean))] as string[];
      const userMap: Record<string, { email?: string; displayName?: string; photoURL?: string }> =
        {};
      for (let i = 0; i < uids.length; i += 100) {
        const batch = uids.slice(i, i + 100);
        const result = await auth_.getUsers(batch.map((uid) => ({ uid })));
        result.users.forEach((u) => {
          userMap[u.uid] = {
            email: u.email || undefined,
            displayName: u.displayName || undefined,
            photoURL: u.photoURL || undefined,
          };
        });
      }

      activities.forEach((a) => {
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
  }
);

// ─── Firebase Debug Diagnostics ───────────────────────────────────────────────

router.get(
  '/api/admin/firebase-debug',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    const result: Record<string, unknown> = {
      adminSdkAvailable: adminDb !== null && adminAuth !== null,
      projectId: null as string | null,
      clientTokenVerified: false,
      clientEmail: req.user?.email || null,
      clientUid: req.user?.uid || null,
      serverTimestamp: new Date().toISOString(),
      serverTests: { adminDb: null, adminAuth: null },
    };

    if (adminDb) {
      try {
        result.projectId =
          process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || null;
      } catch {
        result.projectId = null;
      }
      try {
        await adminDb
          .collection('adminDebug')
          .doc('server-write-test')
          .set({
            testedAt: new Date().toISOString(),
            testedBy: req.user?.uid || 'unknown',
            action: 'write',
          });
        const snap = await adminDb.collection('adminDebug').doc('server-write-test').get();
        const exists = snap.exists;
        await adminDb.collection('adminDebug').doc('server-write-test').delete();
        (result.serverTests as Record<string, unknown>).adminDb = {
          writeOk: true,
          readOk: exists,
          deleteOk: true,
        };
      } catch (e: any) {
        (result.serverTests as Record<string, unknown>).adminDb = {
          ok: false,
          error: e.message,
          code: e.code || 'UNKNOWN',
        };
      }
    }

    if (adminAuth) {
      try {
        const userRecord = await adminAuth.getUser(req.user!.uid);
        (result.serverTests as Record<string, unknown>).adminAuth = {
          ok: true,
          userFound: !!userRecord,
          email: userRecord.email || null,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          hasCustomClaims: Object.keys(userRecord.customClaims || {}).length > 0,
        };
      } catch (e: any) {
        (result.serverTests as Record<string, unknown>).adminAuth = {
          ok: false,
          error: e.message,
          code: e.code || 'UNKNOWN',
        };
      }
    }

    res.status(200).json(result);
  }
);

// ─── Admin corpus quality ─────────────────────────────────────────────────────

router.get(
  '/api/admin/corpus-quality',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    try {
      const report = calculateCorpusQuality();
      res.status(200).json(report);
    } catch (e: any) {
      console.error('[admin/corpus-quality] Error:', e.message);
      res.status(500).json({ error: 'Failed to compute corpus quality', code: 'INTERNAL_ERROR' });
    }
  },
);

// ─── Marketplace: tutor verification ────────────────────────────────────────

router.get(
  '/api/admin/tutors/pending',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const snap = await adminDb_
      .collection('tutorProfiles')
      .where('verificationStatus', '==', 'pending')
      .limit(100)
      .get();
    res.status(200).json(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  }
);

router.post(
  '/api/admin/tutors/:uid/verification',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    if (!requireAdmin(req, res)) return;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    const { status } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(status))
      return res.status(400).json({ error: 'Invalid status', code: 'INVALID_STATUS' });
    await adminDb_
      .doc(`tutorProfiles/${req.params.uid}`)
      .set({ verificationStatus: status, updatedAt: new Date().toISOString() }, { merge: true });
    res.status(200).json({ ok: true });
  }
);

export default router;
