import { Router } from 'express';
import { GRAMMAR_CONCEPTS, PATHWAY } from '../_lib/grammarData.js';
import { getDictionaryEntries } from '../../src/lib/data/dictionary.js';

const router = Router();

router.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json(GRAMMAR_CONCEPTS);
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

export default router;
