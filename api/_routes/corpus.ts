import { Router } from 'express';
import { CorpusDB } from '../../src/data/corpus.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';

interface CorpusTextListItem {
  id: string;
  title: string;
  languageId: string;
  sourceStatus: string | undefined;
  isSample: boolean;
  sentenceCount: number;
  sectionsPreview: { id: string; label: string }[];
  source: 'static' | 'firestore';
}

const router = Router();

// ─── List corpus texts ────────────────────────────────────────────────────────
// Returns metadata + sectionsPreview for all static corpus texts, optionally
// filtered by languageId. Also merges texts stored in the Firestore
// `corpus/{textId}` collection so admin-imported texts appear alongside.

router.get('/api/corpus', async (req: any, res: any) => {
  const { lang } = req.query;

  // Static corpus
  const all = CorpusDB.getTexts();
  const filtered = lang && typeof lang === 'string' ? all.filter((text) => (text as any).languageId === lang || (text as any).language === lang) : all;

  const staticItems: CorpusTextListItem[] = filtered.map((text) => ({
    id: text.id,
    title: text.title,
    languageId: (text as any).languageId || (text as any).language,
    sourceStatus: (text as any).sourceStatus,
    isSample: (text as any).isSample ?? false,
    sentenceCount: (text as any).sentenceCount ?? 0,
    sectionsPreview: (text as any).sectionsPreview ?? [],
    source: 'static' as const,
  }));

  // Merge Firestore corpus texts (non-destructive: static wins on id collision)
  const firestoreItems: CorpusTextListItem[] = [];
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      const snap = await adminDb.collection('corpus').get();
      const staticIds = new Set(staticItems.map((si) => si.id));
      snap.forEach((doc) => {
        const data = doc.data();
        if (staticIds.has(doc.id)) return; // static takes precedence
        if (lang && data.languageId !== lang) return;
        firestoreItems.push({
          id: doc.id,
          title: data.title || doc.id,
          languageId: data.languageId || 'grc',
          sourceStatus: data.sourceStatus || 'complete',
          isSample: Boolean(data.isSample),
          sentenceCount: data.sentenceCount ?? 0,
          sectionsPreview: data.sectionsPreview ?? [],
          source: 'firestore' as const,
        });
      });
    }
  } catch {
    // Firestore unavailable — static corpus only
  }

  res.status(200).json([...staticItems, ...firestoreItems]);
});

// ─── Get single corpus text metadata ─────────────────────────────────────────

router.get('/api/corpus/:textId', async (req: any, res: any) => {
  const { textId } = req.params;

  // Try static first
  const staticText = CorpusDB.getText(textId);
  if (staticText) {
    return res.status(200).json({
      id: staticText.id,
      title: staticText.title,
      languageId: (staticText as any).languageId || (staticText as any).language,
      sectionsPreview: (staticText as any).sectionsPreview ?? [],
      source: 'static',
    });
  }

  // Try Firestore
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      const doc = await adminDb.doc(`corpus/${textId}`).get();
      if (doc.exists) {
        const data = doc.data()!;
        return res.status(200).json({
          id: doc.id,
          title: data.title || doc.id,
          languageId: data.languageId || 'grc',
          sectionsPreview: data.sectionsPreview ?? [],
          source: 'firestore',
        });
      }
    }
  } catch {
    // fall through
  }

  res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });
});

// ─── Get corpus section (sentences + tokens) ──────────────────────────────────

router.get('/api/corpus/:textId/sections/:sectionId', async (req: any, res: any) => {
  const { textId, sectionId } = req.params;

  // Try static CorpusDB first
  const section = CorpusDB.getSection(sectionId);
  if (section) {
    return res.status(200).json({ ...section, source: 'static' });
  }

  // Try Firestore corpus/{textId}/sections/{sectionId}
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      const doc = await adminDb.doc(`corpus/${textId}/sections/${sectionId}`).get();
      if (doc.exists) {
        return res.status(200).json({ ...doc.data(), source: 'firestore' });
      }
    }
  } catch {
    // fall through
  }

  res.status(404).json({ error: 'Section not found', code: 'NOT_FOUND' });
});

export default router;
