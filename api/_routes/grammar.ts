import { Router } from 'express';
import { GRAMMAR_CONCEPTS, PATHWAY } from '../_lib/grammarData.js';

const router = Router();

router.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json(GRAMMAR_CONCEPTS);
});

router.get('/api/grammar/concepts/:conceptId', (req: any, res: any) => {
  const concept = GRAMMAR_CONCEPTS.find(c => c.id === req.params.conceptId);
  res.status(200).json(concept || null);
});

router.get('/api/grammar/pathway', (_req: any, res: any) => {
  res.status(200).json(PATHWAY);
});

export default router;
