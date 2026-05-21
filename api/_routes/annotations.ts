import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

const MAX_ANNOTATION_LEN = 400;
const ANNOTATIONS_PER_TOKEN = 20;

// ─── GET annotations for a lemma (language-scoped) ───────────────────────────

router.get('/api/annotations', async (req: any, res: any) => {
  const { lemma, languageId } = req.query as Record<string, string | undefined>;

  if (!lemma || !languageId) {
    return res.status(400).json({ error: 'lemma and languageId are required', code: 'INVALID_INPUT' });
  }

  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const snap = await adminDb
      .collection('tokenAnnotations')
      .where('lemma', '==', lemma)
      .where('languageId', '==', languageId)
      .orderBy('upvotes', 'desc')
      .limit(ANNOTATIONS_PER_TOKEN)
      .get();

    const annotations: any[] = [];
    snap.forEach((d: any) => annotations.push({ id: d.id, ...d.data() }));
    res.status(200).json({ annotations });
  } catch (e: any) {
    console.error('[annotations] Error fetching:', e.message);
    res.status(500).json({ error: 'Failed to fetch annotations', code: 'INTERNAL_ERROR' });
  }
});

// ─── POST create annotation ───────────────────────────────────────────────────

router.post(
  '/api/annotations',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const { lemma, wordText, languageId, gloss } = req.body;

    if (!lemma || !languageId || !gloss) {
      return res.status(400).json({ error: 'lemma, languageId, and gloss are required', code: 'INVALID_INPUT' });
    }
    if (typeof gloss !== 'string' || gloss.trim().length === 0) {
      return res.status(400).json({ error: 'gloss must be a non-empty string', code: 'INVALID_INPUT' });
    }
    if (gloss.length > MAX_ANNOTATION_LEN) {
      return res.status(400).json({ error: `gloss must be ≤${MAX_ANNOTATION_LEN} characters`, code: 'INVALID_INPUT' });
    }

    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    const user = req.user!;
    const authorName = (user as any).name || (user as any).displayName || 'Scholar';
    const authorAvatarUrl = (user as any).picture || (user as any).photoURL || null;

    try {
      const { FieldValue } = await import('firebase-admin/firestore');

      // Prevent duplicate annotations by the same user on the same lemma
      const existing = await adminDb
        .collection('tokenAnnotations')
        .where('lemma', '==', lemma)
        .where('languageId', '==', languageId)
        .where('authorUid', '==', user.uid)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(409).json({ error: 'You already annotated this word', code: 'DUPLICATE' });
      }

      const ref = adminDb.collection('tokenAnnotations').doc();
      const doc = {
        lemma,
        wordText: wordText || lemma,
        languageId,
        gloss: gloss.trim(),
        authorUid: user.uid,
        authorName,
        authorAvatarUrl,
        upvotes: 0,
        upvotedBy: [],
        createdAt: FieldValue.serverTimestamp(),
      };
      await ref.set(doc);
      res.status(200).json({ id: ref.id, ...doc, createdAt: new Date().toISOString() });
    } catch (e: any) {
      console.error('[annotations] Error creating:', e.message);
      res.status(500).json({ error: 'Failed to create annotation', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── DELETE own annotation ────────────────────────────────────────────────────

router.delete(
  '/api/annotations/:id',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const annotationId = req.params.id as string;
    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const ref = adminDb.collection('tokenAnnotations').doc(annotationId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      if (doc.data()?.authorUid !== req.user!.uid) {
        return res.status(403).json({ error: 'Not your annotation', code: 'FORBIDDEN' });
      }
      await ref.delete();
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[annotations] Error deleting:', e.message);
      res.status(500).json({ error: 'Failed to delete annotation', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── POST upvote / un-upvote ──────────────────────────────────────────────────

router.post(
  '/api/annotations/:id/upvote',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const annotationId = req.params.id as string;
    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const ref = adminDb.collection('tokenAnnotations').doc(annotationId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

      const data = doc.data()!;
      const uid = req.user!.uid;
      const alreadyVoted = (data.upvotedBy || []).includes(uid);

      if (alreadyVoted) {
        await ref.update({
          upvotes: FieldValue.increment(-1),
          upvotedBy: FieldValue.arrayRemove(uid),
        });
        res.status(200).json({ upvoted: false, upvotes: (data.upvotes || 1) - 1 });
      } else {
        await ref.update({
          upvotes: FieldValue.increment(1),
          upvotedBy: FieldValue.arrayUnion(uid),
        });
        res.status(200).json({ upvoted: true, upvotes: (data.upvotes || 0) + 1 });
      }
    } catch (e: any) {
      console.error('[annotations] Error upvoting:', e.message);
      res.status(500).json({ error: 'Failed to upvote', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
