import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.get('/api/syntax/:textId/:sentenceIndex', async (req: any, res: any) => {
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(200).json(null);
  try {
    const textId = req.params.textId as string;
    const sentenceIndex = req.params.sentenceIndex as string;
    const snap = await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).get();
    if (!snap.exists) return res.status(200).json(null);
    res.status(200).json({ id: snap.id, ...snap.data() });
  } catch { res.status(200).json(null); }
});

router.post('/api/syntax/:textId/:sentenceIndex', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const textId = req.params.textId as string;
  const sentenceIndex = req.params.sentenceIndex as string;
  const { tokens, dependency, explanation, confidence } = req.body;
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).set({
      textId, sentenceIndex: parseInt(sentenceIndex), tokens: tokens || [], dependency: dependency || null,
      explanation: explanation || null, confidence: confidence ?? null, source: 'ai',
      annotatedBy: userId, generatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[syntax] Error saving:', e.message);
    res.status(500).json({ error: 'Failed to save syntax', code: 'INTERNAL_ERROR' });
  }
});

export default router;
