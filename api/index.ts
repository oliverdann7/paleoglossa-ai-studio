import express from 'express';

// Build the Express API app
const app = express();

// Preserve raw body for Stripe webhook verification
app.use((req: any, _res: any, next: any) => {
  if (req.url === '/api/stripe/webhook') {
    let data = '';
    req.on('data', (chunk: string) => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));

// CORS headers for cross-origin API calls
app.use((_req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Test route ──────────────────────────────────────────────────────────────
app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
});

// ─── Route modules ───────────────────────────────────────────────────────────
import authRouter from './_routes/auth';
import lexiconRouter from './_routes/lexicon';
import aiRouter from './_routes/ai';
import audioRouter from './_routes/audio';
import coursesRouter from './_routes/courses';
import manuscriptsRouter from './_routes/manuscripts';
import notesRouter from './_routes/notes';
import syntaxRouter from './_routes/syntax';
import searchRouter from './_routes/search';
import grammarRouter from './_routes/grammar';
import publicTextsRouter from './_routes/publicTexts';
import billingRouter from './_routes/billing';
import adminRouter from './_routes/admin';

app.use('/', authRouter);
app.use('/', lexiconRouter);
app.use('/', aiRouter);
app.use('/', audioRouter);
app.use('/', coursesRouter);
app.use('/', manuscriptsRouter);
app.use('/', notesRouter);
app.use('/', syntaxRouter);
app.use('/', searchRouter);
app.use('/', grammarRouter);
app.use('/', publicTextsRouter);
app.use('/', billingRouter);
app.use('/', adminRouter);

// ─── Stripe Webhook (must stay here — requires rawBody) ──────────────────────

const PRICE_IDS_WEBHOOK: Record<string, { monthly?: string; yearly?: string }> = {
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

// Reverse mapping for the Stripe webhook — maps a Stripe price ID back to a planId.
const PLANS_BY_PRICE: Record<string, { planId: string; name: string }> = {};
for (const [planId, prices] of Object.entries(PRICE_IDS_WEBHOOK)) {
  for (const priceId of Object.values(prices)) {
    if (priceId) PLANS_BY_PRICE[priceId] = { planId, name: planId };
  }
}

app.post('/api/stripe/webhook', async (req: any, res: any) => {
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
          const { db } = await import('../src/lib/firebase');
          await setDoc(doc(db, `users/${userId}`), {
            currentPlan: planId,
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            selectedLanguageIds: planId === 'full_all' ? ['grc', 'grc-koine', 'hbo', 'lat', 'syr', 'cop', 'arc', 'akk', 'san', 'egy', 'hit'] : ['grc'],
            subscriptionUpdatedAt: serverTimestamp(),
          }, { merge: true });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const items = subscription.items?.data || [];
        const priceId = items[0]?.price?.id;

        const planInfo = priceId ? PLANS_BY_PRICE[priceId] : null;
        const planId = planInfo?.planId || 'basic_1';
        const subscriptionStatus = status === 'active' ? 'active' as const : status === 'past_due' ? 'past_due' as const : status === 'canceled' || status === 'unpaid' ? 'canceled' as const : 'past_due' as const;

        try {
          const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('../src/lib/firebase');
          const usersSnap = await getDocs(collection(db, 'users'));
          for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (data.stripeCustomerId === customerId) {
              await setDoc(doc(db, `users/${userDoc.id}`), {
                currentPlan: planId,
                subscriptionStatus,
                subscriptionUpdatedAt: serverTimestamp(),
              }, { merge: true });
              break;
            }
          }
        } catch (e) {
          console.error('Failed to update user subscription from webhook:', e);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const deletedCustomerId = deletedSub.customer as string;
        try {
          const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('../src/lib/firebase');
          const usersSnap = await getDocs(collection(db, 'users'));
          for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (data.stripeCustomerId === deletedCustomerId) {
              await setDoc(doc(db, `users/${userDoc.id}`), {
                currentPlan: 'free',
                subscriptionStatus: 'canceled',
                subscriptionUpdatedAt: serverTimestamp(),
              }, { merge: true });
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

// Vercel handler
export const expressApp = app;
export default function handler(req: any, res: any) {
  app(req, res, () => {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}
