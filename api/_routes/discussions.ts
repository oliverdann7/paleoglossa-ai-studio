import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function threadDocId(textId: string, sentenceIndex: number, tokenIndex?: number | null): string {
  const base = `${textId}_s${sentenceIndex}`;
  return tokenIndex != null ? `${base}_t${tokenIndex}` : base;
}

function getUserProfile(req: AuthenticatedRequest) {
  return {
    uid: req.user!.uid,
    displayName: (req.user as any).name || (req.user as any).displayName || 'Scholar',
    avatarUrl: (req.user as any).picture || (req.user as any).photoURL || null,
  };
}

// ─── GET thread (or list threads for a sentence) ──────────────────────────────

router.get('/api/discussions', async (req: any, res: any) => {
  const { textId, sentenceIndex, tokenIndex } = req.query as Record<string, string | undefined>;

  if (!textId || sentenceIndex == null) {
    return res.status(400).json({ error: 'textId and sentenceIndex are required', code: 'INVALID_INPUT' });
  }

  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    let query: any = adminDb.collection('textDiscussions')
      .where('textId', '==', textId)
      .where('sentenceIndex', '==', Number(sentenceIndex));

    if (tokenIndex != null) {
      query = query.where('tokenIndex', '==', Number(tokenIndex));
    }

    const snap = await query.limit(20).get();
    const threads: any[] = [];
    snap.forEach((d: any) => threads.push({ id: d.id, ...d.data() }));

    res.status(200).json({ threads });
  } catch (e: any) {
    console.error('[discussions] Error listing threads:', e.message);
    res.status(500).json({ error: 'Failed to fetch discussions', code: 'INTERNAL_ERROR' });
  }
});

// ─── POST create/get thread ───────────────────────────────────────────────────

router.post(
  '/api/discussions',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const { textId, languageId, sentenceIndex, tokenIndex, wordText, lemma, sentenceExcerpt } =
      req.body;

    if (!textId || sentenceIndex == null) {
      return res.status(400).json({ error: 'textId and sentenceIndex are required', code: 'INVALID_INPUT' });
    }

    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    const docId = threadDocId(textId, Number(sentenceIndex), tokenIndex);
    const ref = adminDb.collection('textDiscussions').doc(docId);

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const existing = await ref.get();

      if (existing.exists) {
        return res.status(200).json({ id: existing.id, ...existing.data() });
      }

      const now = FieldValue.serverTimestamp();
      const thread = {
        textId,
        languageId: languageId || null,
        sentenceIndex: Number(sentenceIndex),
        tokenIndex: tokenIndex != null ? Number(tokenIndex) : null,
        wordText: wordText || null,
        lemma: lemma || null,
        sentenceExcerpt: sentenceExcerpt || null,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await ref.set(thread);
      return res.status(200).json({ id: docId, ...thread });
    } catch (e: any) {
      console.error('[discussions] Error creating thread:', e.message);
      res.status(500).json({ error: 'Failed to create discussion', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── GET comments ─────────────────────────────────────────────────────────────

router.get('/api/discussions/:discussionId/comments', async (req: any, res: any) => {
  const discussionId = req.params.discussionId as string;
  const adminDb = getAdminDb();
  if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const snap = await adminDb
      .collection('textDiscussions')
      .doc(discussionId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .limit(100)
      .get();

    const comments: any[] = [];
    snap.forEach((d: any) => {
      const data = d.data();
      comments.push({
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
        upvotedBy: undefined, // strip private field from response
      });
    });

    res.status(200).json({ comments });
  } catch (e: any) {
    console.error('[discussions] Error fetching comments:', e.message);
    res.status(500).json({ error: 'Failed to fetch comments', code: 'INTERNAL_ERROR' });
  }
});

// ─── POST comment ─────────────────────────────────────────────────────────────

router.post(
  '/api/discussions/:discussionId/comments',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const discussionId = req.params.discussionId as string;
    const { body, parentCommentId } = req.body;
    const profile = getUserProfile(req);

    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'body is required', code: 'INVALID_INPUT' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ error: 'Comment exceeds 2000 characters', code: 'INVALID_INPUT' });
    }

    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const threadRef = adminDb.collection('textDiscussions').doc(discussionId);
      const threadSnap = await threadRef.get();
      if (!threadSnap.exists) {
        return res.status(404).json({ error: 'Discussion not found', code: 'NOT_FOUND' });
      }

      const commentRef = threadRef.collection('comments').doc();
      const now = FieldValue.serverTimestamp();
      const comment = {
        discussionId,
        authorUid: profile.uid,
        authorDisplayName: profile.displayName,
        authorAvatarUrl: profile.avatarUrl,
        body: body.trim(),
        upvoteCount: 0,
        upvotedBy: [],
        parentCommentId: parentCommentId || null,
        createdAt: now,
        updatedAt: now,
      };

      await commentRef.set(comment);
      await threadRef.update({
        commentCount: FieldValue.increment(1),
        updatedAt: now,
      });

      res.status(200).json({
        id: commentRef.id,
        ...comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        upvotedBy: undefined,
      });
    } catch (e: any) {
      console.error('[discussions] Error posting comment:', e.message);
      res.status(500).json({ error: 'Failed to post comment', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── POST upvote ──────────────────────────────────────────────────────────────

router.post(
  '/api/discussions/:discussionId/comments/:commentId/upvote',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const discussionId = req.params.discussionId as string;
    const commentId = req.params.commentId as string;
    const uid = req.user!.uid;

    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const commentRef = adminDb
        .collection('textDiscussions')
        .doc(discussionId)
        .collection('comments')
        .doc(commentId);

      const snap = await commentRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Comment not found', code: 'NOT_FOUND' });

      const data = snap.data()!;
      const upvotedBy: string[] = data.upvotedBy || [];
      const alreadyUpvoted = upvotedBy.includes(uid);

      if (alreadyUpvoted) {
        await commentRef.update({
          upvoteCount: FieldValue.increment(-1),
          upvotedBy: FieldValue.arrayRemove(uid),
        });
        return res.status(200).json({ upvoted: false, upvoteCount: (data.upvoteCount || 1) - 1 });
      } else {
        await commentRef.update({
          upvoteCount: FieldValue.increment(1),
          upvotedBy: FieldValue.arrayUnion(uid),
        });
        return res.status(200).json({ upvoted: true, upvoteCount: (data.upvoteCount || 0) + 1 });
      }
    } catch (e: any) {
      console.error('[discussions] Error upvoting:', e.message);
      res.status(500).json({ error: 'Failed to upvote', code: 'INTERNAL_ERROR' });
    }
  }
);

// ─── DELETE comment ───────────────────────────────────────────────────────────

router.delete(
  '/api/discussions/:discussionId/comments/:commentId',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const discussionId = req.params.discussionId as string;
    const commentId = req.params.commentId as string;
    const uid = req.user!.uid;

    const adminDb = getAdminDb();
    if (!adminDb) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      const commentRef = adminDb
        .collection('textDiscussions')
        .doc(discussionId)
        .collection('comments')
        .doc(commentId);

      const snap = await commentRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Comment not found', code: 'NOT_FOUND' });

      const data = snap.data()!;
      if (data.authorUid !== uid) {
        return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      }

      await commentRef.delete();
      await adminDb.collection('textDiscussions').doc(discussionId).update({
        commentCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[discussions] Error deleting comment:', e.message);
      res.status(500).json({ error: 'Failed to delete comment', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
