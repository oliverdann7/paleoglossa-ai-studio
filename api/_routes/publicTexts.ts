import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.get('/api/public/texts', async (req: any, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    const { ImportService } = await import('../../src/lib/services/importService.js');
    const texts = await ImportService.getPublicTexts(50);
    return res.status(200).json(texts);
  }

  try {
    const language = req.query.language as string | undefined;
    const snap = await adminDb_.collection('publicTexts')
      .where('moderationStatus', '==', 'visible')
      .get();

    const results: any[] = [];
    snap.forEach(doc => {
      const data = doc.data();
      if (language && data.languageId !== language) return;
      results.push({ id: doc.id, ...data });
    });

    results.sort((a, b) => {
      const aTime = a.publishedAt?.toMillis?.() || 0;
      const bTime = b.publishedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    res.status(200).json(results.slice(0, 50));
  } catch (err: any) {
    console.error('Error fetching public texts:', err);
    const { ImportService } = await import('../../src/lib/services/importService.js');
    const texts = await ImportService.getPublicTexts(50);
    res.status(200).json(texts);
  }
});

router.post('/api/public/texts/:textId/report', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { textId } = req.params;
  const { reason } = req.body;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const textSnap = await adminDb_.doc('publicTexts/' + textId).get();
    if (!textSnap.exists) return res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });

    const { FieldValue } = await import('firebase-admin/firestore');
    const reportId = `report_${Date.now()}`;

    await adminDb_.doc('publicTextReports/' + reportId).set({
      textId,
      reporterId: userId,
      reason: reason || 'No reason provided',
      createdAt: FieldValue.serverTimestamp(),
      status: 'open',
    });

    res.status(200).json({ success: true, reportId });
  } catch (err: any) {
    console.error('Error reporting text:', err);
    res.status(500).json({ error: 'Failed to submit report', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/public/texts/:textId/fork', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { textId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const publicSnap = await adminDb_.doc('publicTexts/' + textId).get();
    if (!publicSnap.exists) return res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });

    const data = publicSnap.data()!;
    const newId = `fork_${textId}_${Date.now()}`;

    const { FieldValue } = await import('firebase-admin/firestore');

    await adminDb_.doc(`users/${userId}/imports/${newId}`).set({
      id: newId,
      title: `${data.title} (forked)`,
      languageId: data.languageId,
      sourceType: data.sourceType || 'paste',
      rawContent: data.rawContent || '',
      sentences: data.sentences || [],
      stats: data.stats || {},
      analysisStatus: data.analysisStatus || 'raw',
      visibility: 'private',
      forkedFrom: textId,
      authorId: data.authorId || null,
      authorName: data.authorName || null,
      originalAuthorId: data.authorId || null,
      originalAuthorName: data.authorName || null,
      originalPublicTextId: textId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });

    await adminDb_.doc('publicTexts/' + textId).update({
      forkCount: (data.forkCount || 0) + 1,
    });

    res.status(200).json({ id: newId });
  } catch (err: any) {
    console.error('Error forking text:', err);
    res.status(500).json({ error: 'Failed to fork text', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/imports/:importId/share', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    const data = snap.data()!;
    const now = FieldValue.serverTimestamp();

    await importRef.update({
      visibility: 'public',
      publishedAt: now,
      updatedAt: now,
    });

    const publicData: Record<string, any> = {
      id: importId,
      title: data.title || 'Untitled',
      languageId: data.languageId || 'grc',
      sourceType: data.sourceType || 'paste',
      rawContent: data.rawContent || '',
      sentences: data.sentences || [],
      stats: data.stats || { totalWords: 0, uniqueWords: 0, knownWords: 0, newWords: 0, learningWords: 0 },
      analysisStatus: data.analysisStatus || 'raw',
      visibility: 'public',
      moderationStatus: 'visible',
      authorId: userId,
      authorName: data.authorName || 'Anonymous',
      forkCount: 0,
      forkedFrom: data.forkedFrom || null,
      originalAuthorId: data.originalAuthorId || data.authorId || null,
      originalAuthorName: data.originalAuthorName || data.authorName || null,
      originalPublicTextId: data.originalPublicTextId || null,
      createdAt: data.createdAt || now,
      updatedAt: now,
      publishedAt: now,
    };

    await adminDb_.doc('publicTexts/' + importId).set(publicData);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error sharing text:', err);
    res.status(500).json({ error: 'Failed to share text', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/imports/:importId/unshare', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    await importRef.update({
      visibility: 'private',
      publishedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      await adminDb_.doc('publicTexts/' + importId).delete();
    } catch {
      // Ignore if already removed
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error unsharing text:', err);
    res.status(500).json({ error: 'Failed to unshare text', code: 'INTERNAL_ERROR' });
  }
});

export default router;
