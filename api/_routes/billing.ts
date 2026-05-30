import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';
import { sendPaymentReceiptEmail, sendPaymentFailedEmail } from '../_lib/email.js';
import {
  mapStripeStatusToInternal,
  planIdFromPriceId,
  languagesForPlan,
} from '../_lib/billingMappers.js';

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

router.post(
  '/api/stripe/create-checkout-session',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const { planId, billingCycle = 'monthly', successUrl, cancelUrl } = req.body;
      const uid = req.user!.uid;
      const email = req.user!.email;

      if (!planId || !VALID_PAID_PLANS.includes(planId)) {
        return res.status(400).json({ error: 'Invalid or missing planId', code: 'INVALID_PLAN' });
      }

      if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
        return res
          .status(400)
          .json({ error: 'billingCycle must be monthly or yearly', code: 'INVALID_BILLING_CYCLE' });
      }

      const priceId = PRICE_IDS[planId]?.[billingCycle as 'monthly' | 'yearly'];
      if (!priceId) {
        return res.status(400).json({
          error: `No price configured for plan ${planId} (${billingCycle})`,
          code: 'PRICE_NOT_CONFIGURED',
          hint:
            'Set STRIPE_' +
            planId.toUpperCase() +
            (billingCycle === 'yearly' ? '_YEARLY' : '') +
            '_PRICE_ID in environment.',
        });
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;

      const isDev =
        process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
      if (!stripeKey) {
        if (isDev) {
          return res.status(200).json({
            devMode: true,
            url: null,
            message:
              'Stripe not configured locally. Set STRIPE_SECRET_KEY in .env for production payments.',
          });
        }
        return res
          .status(500)
          .json({ error: 'Stripe server configuration incomplete', code: 'STRIPE_NOT_CONFIGURED' });
      }

      const origin = req.headers.origin || 'https://paleoglossa.com';
      const safeDefault = (path: string) => origin + path;

      const isValidUrl = (url: string | undefined) => {
        if (!url) return false;
        try {
          const parsed = new URL(url);
          const reqOrigin = req.headers.origin;
          return reqOrigin ? parsed.origin === reqOrigin : true;
        } catch {
          return false;
        }
      };

      const stripe = new (await import('stripe')).default(stripeKey);

      const sessionConfig: any = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email || undefined,
        client_reference_id: uid,
        metadata: { planId, userId: uid },
        success_url: isValidUrl(successUrl)
          ? successUrl!
          : safeDefault('/app/subscription?success=true'),
        cancel_url: isValidUrl(cancelUrl)
          ? cancelUrl!
          : safeDefault('/app/subscription?canceled=true'),
        subscription_data: {
          metadata: { planId, userId: uid },
        },
      };

      const trialDays = process.env.STRIPE_TRIAL_DAYS
        ? parseInt(process.env.STRIPE_TRIAL_DAYS, 10)
        : 0;
      if (trialDays > 0) {
        sessionConfig.subscription_data.trial_period_days = trialDays;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      res.status(500).json({
        error: err.message || 'Failed to create checkout session',
        code: 'CHECKOUT_ERROR',
      });
    }
  }
);

router.post(
  '/api/stripe/create-portal-session',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    try {
      const uid = req.user!.uid;

      const adminDb_ = getAdminDb();
      if (!adminDb_) {
        return res
          .status(503)
          .json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });
      }

      const userSnap = await adminDb_.doc('users/' + uid).get();
      if (!userSnap.exists) {
        return res.status(404).json({ error: 'User profile not found', code: 'NOT_FOUND' });
      }

      const stripeCustomerId = userSnap.data()?.stripeCustomerId as string | undefined;
      if (!stripeCustomerId) {
        return res.status(404).json({
          error: 'No Stripe customer ID found. Have you subscribed?',
          code: 'NO_CUSTOMER',
        });
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
      res
        .status(500)
        .json({ error: err.message || 'Failed to create portal session', code: 'PORTAL_ERROR' });
    }
  }
);

// Reverse mapping for webhook — maps Stripe price ID back to planId.
const PLANS_BY_PRICE: Record<string, { planId: string; name: string }> = {};
for (const [planId, prices] of Object.entries(PRICE_IDS)) {
  for (const priceId of Object.values(prices)) {
    if (priceId) PLANS_BY_PRICE[priceId] = { planId, name: planId };
  }
}

router.post('/api/stripe/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(200).json({ received: true, devMode: true });
  }

  try {
    const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY!);
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planId = session.metadata?.planId || 'basic_1';

        if (userId) {
          const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('../../src/lib/firebase.js');
          await setDoc(
            doc(db, `users/${userId}`),
            {
              currentPlan: planId,
              subscriptionStatus: 'active',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              selectedLanguageIds: languagesForPlan(planId),
              subscriptionUpdatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          // Send payment receipt email
          const customerEmail = session.customer_email || session.customer_details?.email;
          if (customerEmail) {
            const planLabel = PLANS_BY_PRICE[session.metadata?.priceId || '']?.name || planId;
            const amount = session.amount_total
              ? `$${(session.amount_total / 100).toFixed(2)}`
              : '';
            sendPaymentReceiptEmail(customerEmail, planLabel, amount).catch(() => {});
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const items = subscription.items?.data || [];
        const priceId = items[0]?.price?.id;

        const planId = planIdFromPriceId(priceId, PRICE_IDS);
        const subscriptionStatus = mapStripeStatusToInternal(status);

        try {
          const { collection, getDocs, doc, setDoc, serverTimestamp } =
            await import('firebase/firestore');
          const { db } = await import('../../src/lib/firebase.js');
          const usersSnap = await getDocs(collection(db, 'users'));
          for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (data.stripeCustomerId === customerId) {
              await setDoc(
                doc(db, `users/${userDoc.id}`),
                {
                  currentPlan: planId,
                  subscriptionStatus,
                  subscriptionUpdatedAt: serverTimestamp(),
                },
                { merge: true }
              );
              break;
            }
          }
        } catch (e) {
          console.error('Failed to update user subscription from webhook:', e);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          try {
            const { getAdminDb } = await import('../_lib/firebaseAdmin.js');
            const { createLessonRoom } = await import('../_lib/dailyVideo.js');
            const adminDb_ = getAdminDb();
            if (adminDb_) {
              const ref = adminDb_.doc(`bookings/${bookingId}`);
              const snap = await ref.get();
              if (snap.exists && snap.data()?.status === 'pending_payment') {
                const data = snap.data()!;
                const room = await createLessonRoom({
                  bookingId,
                  startMs: new Date(data.startAt).getTime(),
                  durationMin: data.durationMin,
                });
                const now = new Date().toISOString();
                await ref.set(
                  {
                    status: 'confirmed',
                    videoRoomUrl: room.url,
                    updatedAt: now,
                  },
                  { merge: true }
                );
                await adminDb_.collection('marketplaceEvents').add({
                  bookingId,
                  kind: 'booking.confirmed',
                  createdAt: now,
                });
              }
            }
          } catch (e) {
            console.error('[webhook] booking confirm failed', e);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          try {
            const { getAdminDb } = await import('../_lib/firebaseAdmin.js');
            const adminDb_ = getAdminDb();
            if (adminDb_) {
              await adminDb_.doc(`bookings/${bookingId}`).set(
                {
                  status: 'refunded',
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
          } catch (e) {
            console.error('[webhook] payment_failed handler', e);
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as any;
        try {
          const { getAdminDb } = await import('../_lib/firebaseAdmin.js');
          const { deriveConnectStatus } = await import('../_lib/stripeConnect.js');
          const adminDb_ = getAdminDb();
          if (adminDb_) {
            const usersSnap = await adminDb_
              .collection('users')
              .where('stripeConnectAccountId', '==', account.id)
              .limit(1)
              .get();
            const status = deriveConnectStatus(account);
            usersSnap.forEach((doc) => {
              doc.ref.set({ stripeConnectStatus: status }, { merge: true }).catch(() => {});
            });
          }
        } catch (e) {
          console.error('[webhook] account.updated', e);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const failedEmail = invoice.customer_email;
        if (failedEmail) {
          sendPaymentFailedEmail(failedEmail).catch(() => {});
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const deletedCustomerId = deletedSub.customer as string;
        try {
          const { collection, getDocs, doc, setDoc, serverTimestamp } =
            await import('firebase/firestore');
          const { db } = await import('../../src/lib/firebase.js');
          const usersSnap = await getDocs(collection(db, 'users'));
          for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (data.stripeCustomerId === deletedCustomerId) {
              await setDoc(
                doc(db, `users/${userDoc.id}`),
                {
                  currentPlan: 'free',
                  subscriptionStatus: 'canceled',
                  subscriptionUpdatedAt: serverTimestamp(),
                },
                { merge: true }
              );
              break;
            }
          }
        } catch (e) {
          console.error('Failed to cancel subscription from webhook:', e);
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
