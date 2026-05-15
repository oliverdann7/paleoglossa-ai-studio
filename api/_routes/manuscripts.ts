import { Router } from 'express';

const router = Router();

router.get('/api/manuscripts', (_req: any, res: any) => {
  res.status(200).json([]);
});

router.get('/api/manuscripts/:manuscriptId', (_req: any, res: any) => {
  res.status(200).json(null);
});

export default router;
