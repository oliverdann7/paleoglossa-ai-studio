import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

// ─── Notebooks ────────────────────────────────────────────────────────────────

router.get('/api/notebooks', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const snap = await adminDb_.collection('users').doc(userId).collection('notebooks').get();
    const notebooks: any[] = [];
    snap.forEach((d) => notebooks.push({ id: d.id, ...d.data() }));
    res.status(200).json(notebooks);
  } catch (e: any) {
    console.error('[notebooks] Error fetching:', e.message);
    res.status(200).json([]);
  }
});

router.post('/api/notebooks', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { title, description, languageId } = req.body;
  if (!title || typeof title !== 'string')
    return res.status(400).json({ error: 'title is required', code: 'INVALID_INPUT' });
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection('users').doc(userId).collection('notebooks').doc();
    await ref.set({
      title,
      description: description || '',
      languageId: languageId || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res
      .status(200)
      .json({ id: ref.id, title, description, languageId, createdAt: new Date().toISOString() });
  } catch (e: any) {
    console.error('[notebooks] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create notebook', code: 'INTERNAL_ERROR' });
  }
});

router.get(
  '/api/notebooks/:notebookId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const notebookId = req.params.notebookId as string;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      const snap = await adminDb_
        .collection('users')
        .doc(userId)
        .collection('notebooks')
        .doc(notebookId)
        .get();
      if (!snap.exists) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.status(200).json({ id: snap.id, ...snap.data() });
    } catch (e: any) {
      console.error('[notebooks] Error fetching single:', e.message);
      res.status(500).json({ error: 'Failed to fetch notebook', code: 'INTERNAL_ERROR' });
    }
  }
);

router.delete(
  '/api/notebooks/:notebookId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const notebookId = req.params.notebookId as string;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      await adminDb_
        .collection('users')
        .doc(userId)
        .collection('notebooks')
        .doc(notebookId)
        .delete();
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[notebooks] Error deleting:', e.message);
      res.status(500).json({ error: 'Failed to delete notebook', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── Notes ───────────────────────────────────────────────────────────────────

router.get('/api/notes', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const languageId = req.query.languageId as string | undefined;
  const targetType = req.query.targetType as string | undefined;
  const notebookId = req.query.notebookId as string | undefined;
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    let query: any = adminDb_.collection('users').doc(userId).collection('notes');
    if (typeof languageId === 'string') query = query.where('languageId', '==', languageId);
    if (targetType) query = query.where('targetType', '==', targetType);
    if (typeof notebookId === 'string') query = query.where('notebookId', '==', notebookId);
    const snap = await query.get();
    const notes: any[] = [];
    snap.forEach((d: any) => notes.push({ id: d.id, ...d.data() }));
    res.status(200).json(notes);
  } catch (e: any) {
    console.error('[notes] Error fetching:', e.message);
    res.status(200).json([]);
  }
});

router.post('/api/notes', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const {
    content,
    languageId,
    targetType,
    targetId,
    lemma,
    textId,
    chunkId,
    sentenceIndex,
    tokenIndex,
    token,
    grammarTag,
    source,
    tags,
    notebookId,
  } = req.body;
  if (!content && (!lemma || !targetType))
    return res
      .status(400)
      .json({ error: 'content or lemma+targetType required', code: 'INVALID_INPUT' });
  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const ref = adminDb_.collection('users').doc(userId).collection('notes').doc();
    await ref.set({
      content,
      languageId: languageId || null,
      targetType: targetType || 'free',
      targetId: targetId || null,
      lemma: lemma || null,
      textId: textId || null,
      chunkId: chunkId || null,
      sentenceIndex: sentenceIndex != null ? sentenceIndex : null,
      tokenIndex: tokenIndex != null ? tokenIndex : null,
      token: token || null,
      grammarTag: grammarTag || null,
      source: source || 'manual',
      tags: tags || [],
      notebookId: notebookId || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(200).json({
      id: ref.id,
      content,
      languageId,
      targetType,
      source: source || 'manual',
      createdAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('[notes] Error creating:', e.message);
    res.status(500).json({ error: 'Failed to create note', code: 'INTERNAL_ERROR' });
  }
});

router.patch(
  '/api/notes/:noteId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const noteId = req.params.noteId as string;
    const { content, tags, notebookId } = req.body;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
      if (content !== undefined) updates.content = content;
      if (tags !== undefined) updates.tags = tags;
      if (notebookId !== undefined) updates.notebookId = notebookId;
      await adminDb_
        .collection('users')
        .doc(userId)
        .collection('notes')
        .doc(noteId)
        .update(updates);
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[notes] Error updating:', e.message);
      res.status(500).json({ error: 'Failed to update note', code: 'INTERNAL_ERROR' });
    }
  }
);

router.delete(
  '/api/notes/:noteId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const noteId = req.params.noteId as string;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      await adminDb_.collection('users').doc(userId).collection('notes').doc(noteId).delete();
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[notes] Error deleting:', e.message);
      res.status(500).json({ error: 'Failed to delete note', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
