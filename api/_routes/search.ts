import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

router.post('/api/search', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { query, languageId, sourceKind, limit: reqLimit = 20 } = req.body;
  if (!query || typeof query !== 'string')
    return res.status(400).json({ error: 'query is required', code: 'INVALID_INPUT' });

  const adminDb_ = getAdminDb();
  if (!adminDb_)
    return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });
  const q = query.toLowerCase().trim();
  const results: any[] = [];

  try {
    const maxResults = Math.min(reqLimit || 20, 50);

    // 1. Search user imports
    const importSnap = await adminDb_.collection('users').doc(userId).collection('imports').get();
    importSnap.forEach((d) => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const title = (data.title || '').toLowerCase();
      const content = (data.rawContent || '').toLowerCase();
      if (title.includes(q) || content.includes(q)) {
        results.push({
          id: d.id,
          title: data.title || 'Untitled',
          source: 'import',
          languageId: data.languageId,
          snippet: data.rawContent?.slice(0, 200),
          textId: d.id,
        });
      }
    });

    // 2. Search vocabulary
    const vocabSnap = await adminDb_.collection('users').doc(userId).collection('vocabulary').get();
    vocabSnap.forEach((d) => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const term = (data.term || '').toLowerCase();
      const gloss = (data.userGloss || '').toLowerCase();
      if (term.includes(q) || gloss.includes(q)) {
        results.push({
          id: d.id,
          term: data.term,
          lemma: data.term,
          source: 'vocabulary',
          languageId: data.languageId,
          snippet: data.userGloss || data.term,
          textId: null,
        });
      }
    });

    // 3. Search notes
    const noteSnap = await adminDb_.collection('users').doc(userId).collection('notes').get();
    noteSnap.forEach((d) => {
      if (results.length >= maxResults) return;
      const data = d.data();
      const content = (data.content || '').toLowerCase();
      const lemma = (data.lemma || '').toLowerCase();
      if (content.includes(q) || lemma.includes(q)) {
        results.push({
          id: d.id,
          title: data.lemma || 'Note',
          source: 'note',
          languageId: data.languageId,
          snippet: data.content?.slice(0, 200),
          textId: data.textId,
        });
      }
    });

    // 4. Search public texts (visible only)
    if (!sourceKind || sourceKind === 'public') {
      const publicSnap = await adminDb_
        .collection('publicTexts')
        .where('moderationStatus', '==', 'visible')
        .get();
      publicSnap.forEach((d) => {
        if (results.length >= maxResults) return;
        const data = d.data();
        if (languageId && data.languageId !== languageId) return;
        const title = (data.title || '').toLowerCase();
        const content = (data.rawContent || '').toLowerCase();
        if (title.includes(q) || content.includes(q)) {
          results.push({
            id: d.id,
            title: data.title || 'Untitled',
            source: 'public',
            languageId: data.languageId,
            snippet: data.rawContent?.slice(0, 200),
            textId: d.id,
            authorName: data.authorName,
          });
        }
      });
    }

    const filtered =
      sourceKind && sourceKind !== 'all' ? results.filter((r) => r.source === sourceKind) : results;
    const langFiltered = languageId
      ? filtered.filter((r) => !r.languageId || r.languageId === languageId)
      : filtered;

    res.status(200).json(langFiltered.slice(0, maxResults));
  } catch (e: any) {
    console.error('[search] Error:', e.message);
    res.status(200).json([]);
  }
});

export default router;
