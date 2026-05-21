import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

function serializeManuscript(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    title: data.title ?? '',
    description: data.description ?? '',
    imageUrl: data.imageUrl ?? '',
    iiifManifestUrl: data.iiifManifestUrl ?? '',
    transcription: data.transcription ?? '',
    languageId: data.languageId ?? '',
    source: data.source ?? '',
    date: data.date ?? '',
    tags: data.tags ?? [],
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

// ─── List ─────────────────────────────────────────────────────────────────────

router.get('/api/manuscripts', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const snap = await adminDb_
      .collection(`users/${userId}/manuscripts`)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const results = snap.docs.map((doc) => serializeManuscript(doc.id, doc.data()));
    res.status(200).json(results);
  } catch (e: any) {
    console.error('[manuscripts] Error listing:', e.message);
    res.status(200).json([]);
  }
});

// ─── Create ───────────────────────────────────────────────────────────────────

router.post('/api/manuscripts', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  const {
    title,
    description,
    imageUrl,
    iiifManifestUrl,
    transcription,
    languageId,
    source,
    date,
    tags,
  } = req.body ?? {};

  if (!title?.trim()) {
    return res.status(400).json({ error: 'title is required', code: 'INVALID_INPUT' });
  }

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection(`users/${userId}/manuscripts`).doc();
    const data = {
      title: title.trim(),
      description: String(description ?? '').trim(),
      imageUrl: String(imageUrl ?? '').trim(),
      iiifManifestUrl: String(iiifManifestUrl ?? '').trim(),
      transcription: String(transcription ?? '').trim(),
      languageId: String(languageId ?? '').trim(),
      source: String(source ?? '').trim(),
      date: String(date ?? '').trim(),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    const doc = await ref.get();
    res.status(201).json(serializeManuscript(ref.id, doc.data()!));
  } catch (e: any) {
    console.error('[manuscripts] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create manuscript', code: 'INTERNAL_ERROR' });
  }
});

// ─── Get single ───────────────────────────────────────────────────────────────

router.get(
  '/api/manuscripts/:id',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const doc = await adminDb_.doc(`users/${userId}/manuscripts/${req.params.id}`).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.status(200).json(serializeManuscript(doc.id, doc.data()!));
    } catch (e: any) {
      console.error('[manuscripts] Error getting:', e.message);
      res.status(500).json({ error: 'Failed to get manuscript', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── Update ───────────────────────────────────────────────────────────────────

router.patch(
  '/api/manuscripts/:id',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const ref = adminDb_.doc(`users/${userId}/manuscripts/${req.params.id}`);
      const existing = await ref.get();
      if (!existing.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

      const ALLOWED = [
        'title',
        'description',
        'imageUrl',
        'iiifManifestUrl',
        'transcription',
        'languageId',
        'source',
        'date',
        'tags',
      ] as const;
      const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
      for (const field of ALLOWED) {
        if (req.body?.[field] !== undefined) {
          updates[field] =
            field === 'tags'
              ? Array.isArray(req.body[field])
                ? req.body[field].map((t: any) => String(t).trim()).filter(Boolean)
                : []
              : String(req.body[field] ?? '').trim();
        }
      }
      await ref.update(updates);
      const doc = await ref.get();
      res.status(200).json(serializeManuscript(doc.id, doc.data()!));
    } catch (e: any) {
      console.error('[manuscripts] Error updating:', e.message);
      res.status(500).json({ error: 'Failed to update manuscript', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── Delete ───────────────────────────────────────────────────────────────────

router.delete(
  '/api/manuscripts/:id',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      await adminDb_.doc(`users/${userId}/manuscripts/${req.params.id}`).delete();
      res.status(204).send();
    } catch (e: any) {
      console.error('[manuscripts] Error deleting:', e.message);
      res.status(500).json({ error: 'Failed to delete manuscript', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
