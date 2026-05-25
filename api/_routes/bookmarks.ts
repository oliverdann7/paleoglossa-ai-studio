import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

// ─── GET /api/bookmarks — list all bookmarks for the authenticated user ────────

router.get('/api/bookmarks', requireAuth as any, async (req: any, res: any) => {
  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;

  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const snap = await db
      .collection(`users/${uid}/bookmarks`)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const bookmarks = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ bookmarks });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/bookmarks — create a bookmark ─────────────────────────────────

router.post('/api/bookmarks', requireAuth as any, async (req: any, res: any) => {
  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const { textId, textTitle, sentenceText, sentenceIndex, languageId, note } = req.body as {
    textId: string;
    textTitle?: string;
    sentenceText: string;
    sentenceIndex: number;
    languageId: string;
    note?: string;
  };

  if (!textId || !sentenceText || sentenceIndex == null || !languageId) {
    return res
      .status(400)
      .json({ error: 'textId, sentenceText, sentenceIndex, and languageId are required' });
  }

  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const { FieldValue } = await import('firebase-admin/firestore');

    const docRef = await db.collection(`users/${uid}/bookmarks`).add({
      textId,
      textTitle: textTitle || null,
      sentenceText,
      sentenceIndex,
      languageId,
      note: note || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    const created = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...created.data() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/bookmarks/:id — update a bookmark's note ─────────────────────

router.patch('/api/bookmarks/:id', requireAuth as any, async (req: any, res: any) => {
  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const bookmarkId = req.params.id as string;
  const { note } = req.body as { note: string };

  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = db.doc(`users/${uid}/bookmarks/${bookmarkId}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Bookmark not found' });

    await ref.update({ note: note ?? null, updatedAt: FieldValue.serverTimestamp() });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/bookmarks/:id — delete a bookmark ───────────────────────────

router.delete('/api/bookmarks/:id', requireAuth as any, async (req: any, res: any) => {
  const authReq = req as AuthenticatedRequest;
  const uid = authReq.user!.uid;
  const bookmarkId = req.params.id as string;

  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const ref = db.doc(`users/${uid}/bookmarks/${bookmarkId}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Bookmark not found' });

    await ref.delete();
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
