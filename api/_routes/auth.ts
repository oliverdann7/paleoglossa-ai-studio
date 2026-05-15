import { Router } from 'express';
import { requireAuth } from '../_lib/auth';
import type { AuthenticatedRequest } from '../_lib/auth';

const router = Router();

router.get('/api/auth/me', requireAuth as any, (req: AuthenticatedRequest, res: any) => {
  res.status(200).json({ user: req.user });
});

export default router;
