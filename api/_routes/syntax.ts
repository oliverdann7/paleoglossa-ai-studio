import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { CorpusDB } from '../../src/data/corpus.js';
import { getTreebankSentence } from '../_lib/treebankIndex.js';

const router = Router();

// ─── Extract treebank data from corpus tokens ─────────────────────────────────
// Returns null if none of the sentence's tokens have deprel annotations.

function corpusTreebankTokens(
  textId: string,
  sentenceIndex: number
): { tokens: object[]; source: string } | null {
  try {
    const text = CorpusDB.getText(textId) as any;
    if (!text) return null;

    // Collect sentences from all sections
    const sections: any[] = [];
    for (const preview of text.sectionsPreview ?? []) {
      const section = CorpusDB.getSection(preview.id) as any;
      if (section?.sentences) sections.push(...section.sentences);
    }

    const sentence = sections[sentenceIndex];
    if (!sentence?.tokens) return null;

    // Check if any tokens carry deprel annotations
    const annotated = (sentence.tokens as any[]).filter(
      (t: any) => t.deprel != null || t.head != null
    );
    if (annotated.length === 0) return null;

    const treebankSource = annotated[0]?.treebankSource ?? 'corpus';

    const tokens = (sentence.tokens as any[]).map((t: any, idx: number) => ({
      index: idx,
      surface: t.surface ?? t.text ?? '',
      lemma: t.lemma ?? t.surface ?? '',
      gloss: t.gloss ?? '',
      head: t.head ?? -1,
      relation: t.deprel ?? 'dep',
      morphology: t.morphology ?? null,
    }));

    return {
      tokens,
      source: `treebank:${treebankSource}`,
    };
  } catch {
    return null;
  }
}

// ─── GET: check corpus treebank → Firestore cache ─────────────────────────────

router.get('/api/syntax/:textId/:sentenceIndex', async (req: any, res: any) => {
  const textId = req.params.textId as string;
  const sentenceIndex = parseInt(req.params.sentenceIndex as string, 10);

  // 1. Prefer inline treebank data from corpus tokens
  const treebank = corpusTreebankTokens(textId, sentenceIndex);
  if (treebank) {
    return res.status(200).json({
      tokens: treebank.tokens,
      explanation: null,
      confidence: 1.0,
      source: treebank.source,
    });
  }

  // 2. Try sidecar treebanks imported from PROIEL/Gorman/Perseus
  const sidecar = getTreebankSentence(textId, sentenceIndex);
  if (sidecar) {
    return res.status(200).json({
      tokens: sidecar.tokens.map((t) => ({
        index: t.index,
        surface: t.surface,
        lemma: t.lemma,
        gloss: t.gloss ?? '',
        head: t.head,
        relation: t.relation,
        morphology: t.morphology ?? null,
      })),
      explanation: null,
      confidence: 1.0,
      source: `treebank:${sidecar.source}`,
      citation: sidecar.citation ?? null,
    });
  }

  // 3. Fall back to Firestore-cached AI annotation
  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(200).json(null);
  try {
    const snap = await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).get();
    if (!snap.exists) return res.status(200).json(null);
    res.status(200).json({ id: snap.id, ...snap.data() });
  } catch {
    res.status(200).json(null);
  }
});

// ─── POST: save AI-generated annotation ───────────────────────────────────────

router.post(
  '/api/syntax/:textId/:sentenceIndex',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const userId = req.user!.uid;
    const textId = req.params.textId as string;
    const sentenceIndex = req.params.sentenceIndex as string;
    const { tokens, dependency, explanation, confidence } = req.body;
    const adminDb_ = getAdminDb();
    if (!adminDb_)
      return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
    try {
      const { FieldValue } = await import('firebase-admin/firestore');
      await adminDb_.doc(`syntaxAnnotations/${textId}_${sentenceIndex}`).set(
        {
          textId,
          sentenceIndex: parseInt(sentenceIndex),
          tokens: tokens || [],
          dependency: dependency || null,
          explanation: explanation || null,
          confidence: confidence ?? null,
          source: 'ai',
          annotatedBy: userId,
          generatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('[syntax] Error saving:', e.message);
      res.status(500).json({ error: 'Failed to save syntax', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
