import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

// ─── GET /api/word-collections ───────────────────────────────────────────────

router.get('/api/word-collections', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const snap = await db
      .collection(`users/${uid}/wordCollections`)
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();
    const collections = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ collections });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/word-collections ──────────────────────────────────────────────

router.post('/api/word-collections', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  const { name, description, languageId } = req.body as {
    name: string;
    description?: string;
    languageId: string;
  };
  if (!name || !languageId) {
    return res.status(400).json({ error: 'name and languageId are required' });
  }
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const { FieldValue } = await import('firebase-admin/firestore');
    const now = FieldValue.serverTimestamp();
    const docRef = await db.collection(`users/${uid}/wordCollections`).add({
      name,
      description: description || null,
      languageId,
      lemmas: [],
      createdAt: now,
      updatedAt: now,
    });
    const created = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...created.data() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/word-collections/:id ───────────────────────────────────────────

router.get('/api/word-collections/:id', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  const collectionId = req.params.id as string;
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const snap = await db.doc(`users/${uid}/wordCollections/${collectionId}`).get();
    if (!snap.exists) return res.status(404).json({ error: 'Collection not found' });
    return res.status(200).json({ id: snap.id, ...snap.data() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/word-collections/:id ─────────────────────────────────────────

router.patch('/api/word-collections/:id', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  const collectionId = req.params.id as string;
  const { name, description } = req.body as { name?: string; description?: string };
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = db.doc(`users/${uid}/wordCollections/${collectionId}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Collection not found' });
    const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    await ref.update(updates);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/word-collections/:id ────────────────────────────────────────

router.delete('/api/word-collections/:id', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  const collectionId = req.params.id as string;
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const ref = db.doc(`users/${uid}/wordCollections/${collectionId}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Collection not found' });
    await ref.delete();
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/word-collections/:id/words ────────────────────────────────────

router.post('/api/word-collections/:id/words', requireAuth as any, async (req: any, res: any) => {
  const uid = (req as AuthenticatedRequest).user!.uid;
  const collectionId = req.params.id as string;
  const { lemma } = req.body as { lemma: string };
  if (!lemma) return res.status(400).json({ error: 'lemma is required' });
  try {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Service unavailable' });
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = db.doc(`users/${uid}/wordCollections/${collectionId}`);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Collection not found' });
    await ref.update({
      lemmas: FieldValue.arrayUnion(lemma),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/word-collections/:id/words/:lemma ───────────────────────────

router.delete(
  '/api/word-collections/:id/words/:lemma',
  requireAuth as any,
  async (req: any, res: any) => {
    const uid = (req as AuthenticatedRequest).user!.uid;
    const collectionId = req.params.id as string;
    const lemma = decodeURIComponent(req.params.lemma as string);
    try {
      const db = getAdminDb();
      if (!db) return res.status(503).json({ error: 'Service unavailable' });
      const { FieldValue } = await import('firebase-admin/firestore');
      const ref = db.doc(`users/${uid}/wordCollections/${collectionId}`);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Collection not found' });
      await ref.update({
        lemmas: FieldValue.arrayRemove(lemma),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;
