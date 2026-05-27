import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { sendWelcomeEmail } from '../_lib/email.js';

const router = Router();

router.get('/api/auth/me', requireAuth as any, (req: AuthenticatedRequest, res: any) => {
  res.status(200).json({ user: req.user });
});

router.post(
  '/api/auth/welcome-email',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const email = req.user!.email;
    if (!email) {
      return res.status(400).json({ error: 'No email on account' });
    }
    const displayName = req.body.displayName || undefined;
    await sendWelcomeEmail(email, displayName);
    res.status(200).json({ sent: true });
  }
);

export default router;
