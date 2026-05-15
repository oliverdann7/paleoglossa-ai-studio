import { Router } from 'express';
import { requireAuth, optionalAuth } from '../_lib/auth';
import { getAdminDb } from '../_lib/firebaseAdmin';
import type { AuthenticatedRequest } from '../_lib/auth';

const router = Router();

// ─── List courses (public + owned + enrolled) ────────────────────────────────

router.get('/api/courses', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.uid ?? null;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue: _fv } = await import('firebase-admin/firestore');
    const results: any[] = [];
    const seenIds = new Set<string>();

    // User's owned courses
    if (userId) {
      const ownedSnap = await adminDb_.collection('courses').where('ownerId', '==', userId).get();
      ownedSnap.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push(serializeCourse(doc.id, doc.data()));
        }
      });

      // Enrolled courses via user doc
      const userDoc = await adminDb_.doc(`users/${userId}`).get();
      const enrolledIds: string[] = userDoc.data()?.enrolledCourseIds ?? [];
      if (enrolledIds.length > 0) {
        const chunks = chunkArray(enrolledIds, 10);
        for (const chunk of chunks) {
          const snap = await adminDb_.collection('courses').where('__name__', 'in', chunk).get();
          snap.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              results.push({ ...serializeCourse(doc.id, doc.data()), _enrolled: true });
            }
          });
        }
      }
    }

    // Public courses (limit 50, exclude already fetched)
    const publicSnap = await adminDb_.collection('courses').where('isPublic', '==', true).limit(50).get();
    publicSnap.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        results.push(serializeCourse(doc.id, doc.data()));
      }
    });

    // Sort: owned first, then enrolled, then public; within each group by createdAt desc
    results.sort((a, b) => {
      const rank = (c: any) => (c.ownerId === userId ? 0 : c._enrolled ? 1 : 2);
      const dr = rank(a) - rank(b);
      if (dr !== 0) return dr;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    res.status(200).json(results);
  } catch (e: any) {
    console.error('[courses] Error listing:', e.message);
    res.status(200).json([]);
  }
});

// ─── Get single course ────────────────────────────────────────────────────────

router.get('/api/courses/:courseId', optionalAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const { courseId } = req.params;
  const userId = req.user?.uid ?? null;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });

    const data = doc.data()!;
    if (!data.isPublic && data.ownerId !== userId) {
      return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });
    }

    // Check if viewer is enrolled
    let isEnrolled = data.ownerId === userId;
    if (!isEnrolled && userId) {
      const memberDoc = await adminDb_.doc(`courses/${courseId}/members/${userId}`).get();
      isEnrolled = memberDoc.exists;
    }

    res.status(200).json({ ...serializeCourse(doc.id, data), isEnrolled });
  } catch (e: any) {
    console.error('[courses] Error fetching:', e.message);
    res.status(500).json({ error: 'Failed to fetch course', code: 'INTERNAL_ERROR' });
  }
});

// ─── Create course ────────────────────────────────────────────────────────────

router.post('/api/courses', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { title, description, languageId, isPublic, texts } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required', code: 'INVALID_INPUT' });
  }

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection('courses').doc();
    const courseData = {
      ownerId: userId,
      title: title.trim(),
      description: (description || '').trim(),
      languageId: languageId || 'grc',
      texts: Array.isArray(texts) ? texts : [],
      isPublic: Boolean(isPublic),
      memberCount: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(courseData);

    // Add owner as teacher member
    await ref.collection('members').doc(userId).set({
      userId,
      role: 'teacher',
      progress: {},
      joinedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id: ref.id, ...courseData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  } catch (e: any) {
    console.error('[courses] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create course', code: 'INTERNAL_ERROR' });
  }
});

// ─── Update course ────────────────────────────────────────────────────────────

router.put('/api/courses/:courseId', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;
  const { title, description, languageId, isPublic, texts } = req.body;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });
    if (doc.data()!.ownerId !== userId) return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });

    const { FieldValue } = await import('firebase-admin/firestore');
    const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (languageId !== undefined) updates.languageId = languageId;
    if (isPublic !== undefined) updates.isPublic = Boolean(isPublic);
    if (Array.isArray(texts)) updates.texts = texts;

    await adminDb_.doc(`courses/${courseId}`).update(updates);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[courses] Error updating:', e.message);
    res.status(500).json({ error: 'Failed to update course', code: 'INTERNAL_ERROR' });
  }
});

// ─── Delete course ────────────────────────────────────────────────────────────

router.delete('/api/courses/:courseId', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });
    if (doc.data()!.ownerId !== userId) return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });

    await adminDb_.doc(`courses/${courseId}`).delete();
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[courses] Error deleting:', e.message);
    res.status(500).json({ error: 'Failed to delete course', code: 'INTERNAL_ERROR' });
  }
});

// ─── Join a course ────────────────────────────────────────────────────────────

router.post('/api/courses/:courseId/join', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });
    if (!doc.data()!.isPublic) return res.status(403).json({ error: 'Course is not public', code: 'FORBIDDEN' });

    const { FieldValue } = await import('firebase-admin/firestore');
    const memberRef = adminDb_.doc(`courses/${courseId}/members/${userId}`);
    const existing = await memberRef.get();
    if (existing.exists) return res.status(200).json({ ok: true, alreadyJoined: true });

    await memberRef.set({ userId, role: 'student', progress: {}, joinedAt: FieldValue.serverTimestamp() });
    await adminDb_.doc(`courses/${courseId}`).update({ memberCount: FieldValue.increment(1) });

    // Store reverse index on user doc
    await adminDb_.doc(`users/${userId}`).set(
      { enrolledCourseIds: FieldValue.arrayUnion(courseId) },
      { merge: true }
    );

    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[courses] Error joining:', e.message);
    res.status(500).json({ error: 'Failed to join course', code: 'INTERNAL_ERROR' });
  }
});

// ─── Leave a course ───────────────────────────────────────────────────────────

router.delete('/api/courses/:courseId/join', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });
    if (doc.data()!.ownerId === userId) {
      return res.status(400).json({ error: 'Owner cannot leave their own course', code: 'INVALID_OPERATION' });
    }

    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb_.doc(`courses/${courseId}/members/${userId}`).delete();
    await adminDb_.doc(`courses/${courseId}`).update({ memberCount: FieldValue.increment(-1) });
    await adminDb_.doc(`users/${userId}`).update({ enrolledCourseIds: FieldValue.arrayRemove(courseId) });

    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[courses] Error leaving:', e.message);
    res.status(500).json({ error: 'Failed to leave course', code: 'INTERNAL_ERROR' });
  }
});

// ─── List members ─────────────────────────────────────────────────────────────

router.get('/api/courses/:courseId/members', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const doc = await adminDb_.doc(`courses/${courseId}`).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found', code: 'NOT_FOUND' });
    if (doc.data()!.ownerId !== userId) return res.status(403).json({ error: 'Access denied', code: 'FORBIDDEN' });

    const snap = await adminDb_.collection(`courses/${courseId}/members`).get();
    const members: any[] = [];
    snap.forEach(d => members.push({ id: d.id, ...d.data() }));
    res.status(200).json(members);
  } catch (e: any) {
    console.error('[courses] Error listing members:', e.message);
    res.status(200).json([]);
  }
});

// ─── Update progress for a text in a course ──────────────────────────────────

router.post('/api/courses/:courseId/progress', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { courseId } = req.params;
  const { textId, percent } = req.body;

  if (!textId || typeof percent !== 'number') {
    return res.status(400).json({ error: 'textId and percent are required', code: 'INVALID_INPUT' });
  }

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const memberRef = adminDb_.doc(`courses/${courseId}/members/${userId}`);
    await memberRef.set({ progress: { [textId]: Math.min(100, Math.max(0, percent)) } }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[courses] Error updating progress:', e.message);
    res.status(500).json({ error: 'Failed to update progress', code: 'INTERNAL_ERROR' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serializeCourse(id: string, data: any) {
  return {
    id,
    ownerId: data.ownerId,
    title: data.title,
    description: data.description || '',
    languageId: data.languageId || 'grc',
    texts: data.texts || [],
    isPublic: Boolean(data.isPublic),
    memberCount: data.memberCount ?? 1,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? null,
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default router;
