import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import {
  createAccountLink,
  createExpressAccount,
  createLoginLink,
  deriveConnectStatus,
  retrieveAccount,
} from '../_lib/stripeConnect.js';

const router = Router();

function devModeResponse(res: any, payload: Record<string, unknown> = {}) {
  return res.status(200).json({ devMode: true, ...payload });
}

router.post(
  '/api/connect/onboard',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email;
      const { country, refreshUrl, returnUrl } = req.body || {};

      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      if (!process.env.STRIPE_SECRET_KEY) {
        return devModeResponse(res, { message: 'Stripe not configured locally', url: null });
      }

      const userRef = adminDb_.doc(`users/${uid}`);
      const userSnap = await userRef.get();
      let accountId = userSnap.data()?.stripeConnectAccountId as string | undefined;

      if (!accountId) {
        const account = await createExpressAccount({
          email,
          country,
          metadata: { userId: uid, role: 'tutor' },
        });
        accountId = account.id;
        await userRef.set(
          {
            stripeConnectAccountId: accountId,
            stripeConnectStatus: 'pending',
            roles: Array.from(new Set([...(userSnap.data()?.roles || ['learner']), 'tutor'])),
          },
          { merge: true }
        );
      }

      const origin = req.headers.origin || 'https://paleoglossa.com';
      const link = await createAccountLink(accountId, {
        refresh: refreshUrl || `${origin}/app/teach?onboarding=refresh`,
        return: returnUrl || `${origin}/app/teach?onboarding=return`,
      });

      res.status(200).json({ url: link.url, accountId });
    } catch (err: any) {
      console.error('[connect/onboard]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to start Connect onboarding', code: 'CONNECT_ERROR' });
    }
  }
);

router.get(
  '/api/connect/status',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const uid = req.user!.uid;
      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const userSnap = await adminDb_.doc(`users/${uid}`).get();
      const accountId = userSnap.data()?.stripeConnectAccountId as string | undefined;
      if (!accountId) {
        return res.status(200).json({ status: 'none', accountId: null });
      }
      if (!process.env.STRIPE_SECRET_KEY) {
        return devModeResponse(res, {
          status: userSnap.data()?.stripeConnectStatus || 'pending',
          accountId,
        });
      }
      const account = await retrieveAccount(accountId);
      const status = deriveConnectStatus(account);
      await adminDb_.doc(`users/${uid}`).set({ stripeConnectStatus: status }, { merge: true });
      res.status(200).json({
        status,
        accountId,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });
    } catch (err: any) {
      console.error('[connect/status]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to read Connect status', code: 'CONNECT_ERROR' });
    }
  }
);

router.post(
  '/api/connect/dashboard-link',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const uid = req.user!.uid;
      const adminDb_ = getAdminDb();
      if (!adminDb_)
        return res.status(503).json({ error: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' });

      const userSnap = await adminDb_.doc(`users/${uid}`).get();
      const accountId = userSnap.data()?.stripeConnectAccountId as string | undefined;
      if (!accountId) {
        return res.status(404).json({ error: 'No Connect account', code: 'NO_CONNECT_ACCOUNT' });
      }
      if (!process.env.STRIPE_SECRET_KEY) {
        return devModeResponse(res, { url: null });
      }
      const link = await createLoginLink(accountId);
      res.status(200).json({ url: link.url });
    } catch (err: any) {
      console.error('[connect/dashboard-link]', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to mint dashboard link', code: 'CONNECT_ERROR' });
    }
  }
);

export default router;
