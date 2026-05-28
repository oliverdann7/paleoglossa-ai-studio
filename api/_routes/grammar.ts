import { Router } from 'express';
import { GRAMMAR_CONCEPTS, PATHWAY, NAMED_PATHWAYS } from '../_lib/grammarData.js';
import { getDictionaryEntries } from '../../src/lib/data/dictionary.js';

const router = Router();

router.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json(GRAMMAR_CONCEPTS);
});

router.get('/api/grammar/graph', (req: any, res: any) => {
  const lang = (req.query.lang as string) || '';
  const concepts = lang
    ? GRAMMAR_CONCEPTS.filter((c) => c.languageId === lang || c.languageId.startsWith(lang))
    : GRAMMAR_CONCEPTS;
  const nodes = concepts.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    languageId: c.languageId,
    prerequisites: c.prerequisites ?? [],
  }));
  const edges = concepts.flatMap((c) =>
    (c.prerequisites ?? [])
      .filter((p) => concepts.some((n) => n.id === p))
      .map((p) => ({ from: p, to: c.id }))
  );
  res.status(200).json({ nodes, edges });
});

router.get('/api/grammar/concepts/:conceptId', (req: any, res: any) => {
  const concept = GRAMMAR_CONCEPTS.find((c) => c.id === req.params.conceptId);
  if (!concept) return res.status(200).json(null);

  if (!concept.lemmaKeys?.length) return res.status(200).json(concept);

  const corpusSentences: Array<{
    lemma: string;
    surface: string;
    sentenceText: string;
    translation: string;
    textTitle: string;
    textId: string;
  }> = [];

  try {
    const all = getDictionaryEntries();
    for (const lemma of concept.lemmaKeys) {
      const entry = all.find((e) => e.lemma === lemma && e.languageId === concept.languageId);
      if (!entry?.corpusExamples?.length) continue;
      for (const ex of entry.corpusExamples.slice(0, 2)) {
        corpusSentences.push({
          lemma,
          surface: ex.surface,
          sentenceText: ex.sentenceText,
          translation: ex.translation || '',
          textTitle: ex.textTitle || '',
          textId: ex.textId,
        });
        if (corpusSentences.length >= 5) break;
      }
      if (corpusSentences.length >= 5) break;
    }
  } catch {
    // corpus lookup failure is non-fatal — static examples still return
  }

  res.status(200).json({ ...concept, corpusSentences });
});

router.get('/api/grammar/pathway', (_req: any, res: any) => {
  res.status(200).json(PATHWAY);
});

router.get('/api/grammar/pathways', (_req: any, res: any) => {
  res.status(200).json(NAMED_PATHWAYS);
});

router.get('/api/grammar/pathways/:pathwayId', (req: any, res: any) => {
  const pathway = NAMED_PATHWAYS.find((p) => p.id === req.params.pathwayId);
  if (!pathway) return res.status(404).json({ error: 'Not found' });
  const steps = pathway.steps.map((s) => ({
    ...s,
    concept: GRAMMAR_CONCEPTS.find((c) => c.id === s.conceptId) ?? null,
  }));
  res.status(200).json({ ...pathway, steps });
});

export default router;
