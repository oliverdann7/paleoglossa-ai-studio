import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { requireAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

function threadDocId(textId: string, sentenceIndex: number, tokenIndex?: number | null): string {
  const base = `${textId}_s${sentenceIndex}`;
  return tokenIndex != null ? `${base}_t${tokenIndex}` : base;
}

function getUserProfile(req: AuthenticatedRequest) {
  const authUser = req.user!;
  return {
    uid: authUser.uid,
    displayName: (authUser.claims?.name as string) || authUser.email || 'Scholar',
    avatarUrl: (authUser.claims?.picture as string) || undefined,
  };
}

// GET /api/discussions — list threads for a text/sentence/token
router.get('/api/discussions', async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ threads: [] });

  const textId = req.query.textId as string | undefined;
  const sentenceIndex = req.query.sentenceIndex != null ? Number(req.query.sentenceIndex) : undefined;
  const tokenIndex = req.query.tokenIndex != null ? Number(req.query.tokenIndex) : undefined;

  if (!textId) return res.status(400).json({ error: 'textId is required' });

  try {
    if (sentenceIndex != null) {
      const docId = threadDocId(textId, sentenceIndex, tokenIndex);
      const snap = await db.collection('textDiscussions').doc(docId).get();
      if (!snap.exists) return res.status(200).json({ threads: [] });
      return res.status(200).json({ threads: [{ id: snap.id, ...snap.data() }] });
    }

    const snap = await db
      .collection('textDiscussions')
      .where('textId', '==', textId)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();
    const threads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.status(200).json({ threads });
  } catch (e: any) {
    console.error('[discussions GET] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// POST /api/discussions — create or upsert a thread
router.post('/api/discussions', requireAuth, async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: 'Database unavailable' });

  const { textId, languageId, sentenceIndex, tokenIndex, wordText, lemma, sentenceExcerpt } =
    req.body as Record<string, any>;

  if (!textId || sentenceIndex == null) {
    return res.status(400).json({ error: 'textId and sentenceIndex are required' });
  }

  const docId = threadDocId(textId, Number(sentenceIndex), tokenIndex ?? null);
  const now = new Date().toISOString();

  try {
    const ref = db.collection('textDiscussions').doc(docId);
    const existing = await ref.get();
    if (!existing.exists) {
      await ref.set({
        textId,
        languageId: languageId || '',
        sentenceIndex: Number(sentenceIndex),
        tokenIndex: tokenIndex ?? null,
        wordText: wordText || null,
        lemma: lemma || null,
        sentenceExcerpt: sentenceExcerpt || null,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    const snap = await ref.get();
    res.status(200).json({ id: docId, ...snap.data() });
  } catch (e: any) {
    console.error('[discussions POST] Error:', e.message);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// GET /api/discussions/:discussionId/comments
router.get('/api/discussions/:discussionId/comments', async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(200).json({ comments: [] });

  const discussionId = req.params.discussionId as string;

  try {
    const snap = await db
      .collection('textDiscussions')
      .doc(discussionId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .limit(100)
      .get();

    const comments = snap.docs.map((d) => {
      const data = d.data();
      const rest: Record<string, unknown> = { ...data };
      delete rest['upvotedBy'];
      return { id: d.id, upvoteCount: rest.upvoteCount ?? 0, ...rest };
    });
    res.status(200).json({ comments });
  } catch (e: any) {
    console.error('[discussions/comments GET] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/discussions/:discussionId/comments
router.post('/api/discussions/:discussionId/comments', requireAuth, async (req: any, res: any) => {
  const db = getAdminDb();
  if (!db) return res.status(503).json({ error: 'Database unavailable' });

  const authReq = req as AuthenticatedRequest;
  const discussionId = req.params.discussionId as string;
  const { body, parentCommentId } = req.body as Record<string, any>;

  if (!body || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (body.length > 2000) {
    return res.status(400).json({ error: 'body must be under 2000 characters' });
  }

  const { uid, displayName, avatarUrl } = getUserProfile(authReq);
  const now = new Date().toISOString();

  try {
    const threadRef = db.collection('textDiscussions').doc(discussionId);
    const commentRef = threadRef.collection('comments').doc();

    await commentRef.set({
      discussionId,
      authorUid: uid,
      authorDisplayName: displayName,
      authorAvatarUrl: avatarUrl ?? null,
      body: body.trim(),
      upvoteCount: 0,
      upvotedBy: [],
      parentCommentId: parentCommentId || null,
      createdAt: now,
      updatedAt: now,
    });

    await threadRef.update({
      commentCount: FieldValue.increment(1),
      updatedAt: now,
    });

    const snap = await commentRef.get();
    const data = snap.data()!;
    const out: Record<string, unknown> = { ...data };
    delete out['upvotedBy'];
    res.status(201).json({ id: commentRef.id, ...out });
  } catch (e: any) {
    console.error('[discussions/comments POST] Error:', e.message);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// POST /api/discussions/:discussionId/comments/:commentId/upvote
router.post(
  '/api/discussions/:discussionId/comments/:commentId/upvote',
  requireAuth,
  async (req: any, res: any) => {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Database unavailable' });

    const authReq = req as AuthenticatedRequest;
    const discussionId = req.params.discussionId as string;
    const commentId = req.params.commentId as string;
    const uid = authReq.user!.uid;

    try {
      const ref = db
        .collection('textDiscussions')
        .doc(discussionId)
        .collection('comments')
        .doc(commentId);

      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Comment not found' });

      const data = snap.data()!;
      const upvotedBy: string[] = data.upvotedBy ?? [];
      const hasUpvoted = upvotedBy.includes(uid);

      await ref.update({
        upvotedBy: hasUpvoted ? FieldValue.arrayRemove(uid) : FieldValue.arrayUnion(uid),
        upvoteCount: FieldValue.increment(hasUpvoted ? -1 : 1),
      });

      res.status(200).json({ upvoted: !hasUpvoted });
    } catch (e: any) {
      console.error('[discussions/upvote] Error:', e.message);
      res.status(500).json({ error: 'Failed to upvote' });
    }
  }
);

// DELETE /api/discussions/:discussionId/comments/:commentId
router.delete(
  '/api/discussions/:discussionId/comments/:commentId',
  requireAuth,
  async (req: any, res: any) => {
    const db = getAdminDb();
    if (!db) return res.status(503).json({ error: 'Database unavailable' });

    const authReq = req as AuthenticatedRequest;
    const discussionId = req.params.discussionId as string;
    const commentId = req.params.commentId as string;
    const uid = authReq.user!.uid;

    try {
      const ref = db
        .collection('textDiscussions')
        .doc(discussionId)
        .collection('comments')
        .doc(commentId);

      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Comment not found' });
      if (snap.data()!.authorUid !== uid) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await ref.delete();

      const threadRef = db.collection('textDiscussions').doc(discussionId);
      await threadRef.update({ commentCount: FieldValue.increment(-1) });

      res.status(200).json({ deleted: true });
    } catch (e: any) {
      console.error('[discussions/delete] Error:', e.message);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
);

export default router;
