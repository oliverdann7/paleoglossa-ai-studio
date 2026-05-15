import { Router } from 'express';

const router = Router();

router.get('/api/courses', (_req: any, res: any) => {
  res.status(200).json([]);
});

router.get('/api/courses/:courseId', (_req: any, res: any) => {
  res.status(200).json(null);
});

router.post('/api/courses', (_req: any, res: any) => {
  res.status(200).json(null);
});

router.get('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json([]);
});

router.post('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

export default router;
