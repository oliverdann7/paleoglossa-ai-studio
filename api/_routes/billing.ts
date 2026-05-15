import { Router } from 'express';
import { requireAuth } from '../_lib/auth';
import { getAdminDb } from '../_lib/firebaseAdmin';
import type { AuthenticatedRequest } from '../_lib/auth';

const router = Router();

const VALID_PAID_PLANS = ['basic_1', 'duo_2', 'full_all'] as const;

const PRICE_IDS: Record<string, { monthly?: string; yearly?: string }> = {
  basic_1: {
    monthly: process.env.STRIPE_BASIC_PRICE_ID,
    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
  },
  duo_2: {
    monthly: process.env.STRIPE_DUO_PRICE_ID,
    yearly: process.env.STRIPE_DUO_YEARLY_PRICE_ID,
  },
  full_all: {
    monthly: process.env.STRIPE_FULL_PRICE_ID,
    yearly: process.env.STRIPE_FULL_YEARLY_PRICE_ID,
  },
};

router.post('/api/stripe/create-checkout-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { planId, billingCycle = 'monthly', successUrl, cancelUrl } = req.body;
    const uid = req.user!.uid;
    const email = req.user!.email;

    if (!planId || !VALID_PAID_PLANS.includes(planId)) {
      return res.status(400).json({ error: 'Invalid or missing planId', code: 'INVALID_PLAN' });
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return res.status(400).json({ error: 'billingCycle must be monthly or yearly', code: 'INVALID_BILLING_CYCLE' });
    }

    const priceId = PRICE_IDS[planId]?.[billingCycle as 'monthly' | 'yearly'];
    if (!priceId) {
      return res.status(400).json({
        error: `No price configured for plan ${planId} (${billingCycle})`,
        code: 'PRICE_NOT_CONFIGURED',
        hint: 'Set STRIPE_' + planId.toUpperCase() + (billingCycle === 'yearly' ? '_YEARLY' : '') + '_PRICE_ID in environment.',
      });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
    if (!stripeKey) {
      if (isDev) {
        return res.status(200).json({
          devMode: true,
          url: null,
          message: 'Stripe not configured locally. Set STRIPE_SECRET_KEY in .env for production payments.',
        });
      }
      return res.status(500).json({ error: 'Stripe server configuration incomplete', code: 'STRIPE_NOT_CONFIGURED' });
    }

    const origin = req.headers.origin || 'https://paleoglossa.com';
    const safeDefault = (path: string) => origin + path;

    const isValidUrl = (url: string | undefined) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        const reqOrigin = req.headers.origin;
        return reqOrigin ? parsed.origin === reqOrigin : true;
      } catch { return false; }
    };

    const stripe = new (await import('stripe')).default(stripeKey);

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: uid,
      metadata: { planId, userId: uid },
      success_url: isValidUrl(successUrl) ? successUrl! : safeDefault('/app/subscription?success=true'),
      cancel_url: isValidUrl(cancelUrl) ? cancelUrl! : safeDefault('/app/subscription?canceled=true'),
      subscription_data: {
        metadata: { planId, userId: uid },
      },
    };

    const trialDays = process.env.STRIPE_TRIAL_DAYS ? parseInt(process.env.STRIPE_TRIAL_DAYS, 10) : 0;
    if (trialDays > 0) {
      sessionConfig.subscription_data.trial_period_days = trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session', code: 'CHECKOUT_ERROR' });
  }
});

router.post('/api/stripe/create-portal-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  try {
    const uid = req.user!.uid;

    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });
    }

    const userSnap = await adminDb_.doc('users/' + uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User profile not found', code: 'NOT_FOUND' });
    }

    const stripeCustomerId = userSnap.data()?.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'No Stripe customer ID found. Have you subscribed?', code: 'NO_CUSTOMER' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(200).json({ devMode: true, url: null, message: 'Stripe not configured' });
    }

    const stripe = new (await import('stripe')).default(stripeKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: req.body.returnUrl || `${req.headers.origin || ''}/app/subscription`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: err.message || 'Failed to create portal session', code: 'PORTAL_ERROR' });
  }
});

export default router;
