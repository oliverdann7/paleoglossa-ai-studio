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

// ─── Auth test — verify a Firebase ID token and return user info ─────────────
import { requireAuth } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import type { AuthenticatedRequest } from './_lib/auth';

app.get('/api/auth/me', requireAuth as any, (req: AuthenticatedRequest, res: any) => {
  res.status(200).json({ user: req.user });
});

// ─── Lemmas ──────────────────────────────────────────────────────────────────
app.get('/api/lemmas/:lemma', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/lemmas', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/lemmas/:lemma/paradigm', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Dictionary ───────────────────────────────────────────────────────────────
import { getDictionaryEntry, getDictionaryLanguages, searchDictionaryEntries } from '../src/lib/data/dictionaryDB';

app.get('/api/dictionary', (_req: any, res: any) => {
  const languages = getDictionaryLanguages();
  res.status(200).json(languages);
});

app.get('/api/dictionary/:lemma/:lang', (req: any, res: any) => {
  const { lemma, lang } = req.params;
  const entry = getDictionaryEntry(lemma, lang);
  if (entry) {
    res.status(200).json(entry);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.get('/api/dictionary/search', (req: any, res: any) => {
  const { q: query, lang, limit } = req.query;
  const results = searchDictionaryEntries(
    query && typeof query === 'string' ? query : '',
    lang && typeof lang === 'string' ? lang : undefined,
    limit && typeof limit === 'string' ? parseInt(limit, 10) : 20
  );
  res.status(200).json(results);
});

// ─── AI endpoints ────────────────────────────────────────────────────────────
const MAX_TEXT_LENGTH = 100000;

import { basicAnalyze } from './_lib/basicAnalyze';

app.post('/api/ai/analyze', async (req: any, res: any) => {
  try {
    const { languageId, rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'rawText is required and must be a non-empty string', code: 'INVALID_INPUT' });
    }
    if (!languageId || typeof languageId !== 'string') {
      return res.status(400).json({ error: 'languageId is required', code: 'INVALID_INPUT' });
    }
    if (rawText.length > MAX_TEXT_LENGTH) {
      return res.status(413).json({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`, code: 'TEXT_TOO_LARGE' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const genAI = new GoogleGenAI({ apiKey });

        const prompt = `Analyze the following ${languageId} text. Return ONLY valid JSON matching this schema:
{
  "sentences": [
    {
      "tokens": [
        {
          "text": "...",
          "lemma": "...",
          "normalized": "...",
          "type": "word|punctuation|number|whitespace",
          "transliteration": "...",
          "gloss": "...",
          "pos": "...",
          "confidence": 0.95
        }
      ],
      "translation": "..."
    }
  ]
}

Rules:
- Split text into sentences at natural boundaries (. ! ?)
- For each token: text=original, lemma=base form, normalized=lowercase variant
- type must be exactly: word, punctuation, number, or whitespace
- Set transliteration, gloss, pos to null if uncertain
- confidence should be 0.0-1.0
- translation may be null
- Do not include markdown code blocks or any text outside the JSON

Text to analyze:
${rawText.slice(0, 20000)}`;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });

        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.sentences && Array.isArray(parsed.sentences)) {
            return res.status(200).json({ sentences: parsed.sentences });
          }
        }

        // Gemini returned invalid JSON, fall through to basic analysis
        console.warn('Gemini returned unparseable response, using fallback');
      } catch (geminiErr: any) {
        console.error('Gemini API call failed:', geminiErr.message);
        // Fall through to basic analysis
      }
    }

    // Fallback: rule-based tokenization
    const result = basicAnalyze(rawText);
    return res.status(200).json({ sentences: result.sentences });

  } catch (err: any) {
    console.error('Unexpected error in /api/ai/analyze:', err);
    return res.status(500).json({ error: 'Internal server error during analysis', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/ai/ocr', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/translate', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/explain', (_req: any, res: any) => {
  res.status(200).json({ explanation: '' });
});

app.post('/api/ai/pronunciation', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/scrape', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/metadata', (_req: any, res: any) => {
  res.status(200).json({ difficulty: '', tags: [], summary: '' });
});

app.post('/api/ai/tutor/start', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/tutor/message', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/quiz', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

app.post('/api/ai/syntax', (_req: any, res: any) => {
  res.status(200).json({ text: '' });
});

// ─── Audio ───────────────────────────────────────────────────────────────────
app.post('/api/audio/tts', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null });
});

app.post('/api/audio/recordings', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null });
});

// ─── Courses ────────────────────────────────────────────────────────────────
app.get('/api/courses', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/courses/:courseId', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.post('/api/courses', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/courses/:courseId/members', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

// ─── Manuscripts ────────────────────────────────────────────────────────────
app.get('/api/manuscripts', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/manuscripts/:manuscriptId', (_req: any, res: any) => {
  res.status(200).json(null);
});

// ─── Notebooks & Notes ──────────────────────────────────────────────────────
app.get('/api/notebooks', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/notebooks', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.delete('/api/notebooks/:notebookId', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

app.get('/api/notes', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.post('/api/notes', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.delete('/api/notes/:noteId', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

// ─── Syntax ─────────────────────────────────────────────────────────────────
app.get('/api/syntax/:textId/:sentenceIndex', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/syntax', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Search ─────────────────────────────────────────────────────────────────
app.post('/api/search', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Grammar ────────────────────────────────────────────────────────────────
app.get('/api/grammar/concepts', (_req: any, res: any) => {
  res.status(200).json([]);
});

app.get('/api/grammar/concepts/:conceptId', (_req: any, res: any) => {
  res.status(200).json(null);
});

app.get('/api/grammar/pathway', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Public Library ─────────────────────────────────────────────────────
app.get('/api/public/texts', async (_req: any, res: any) => {
  const { ImportService } = await import('../src/lib/services/importService');
  const texts = await ImportService.getPublicTexts(50);
  res.status(200).json(texts);
});

app.post('/api/public/texts/:textId/fork', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { textId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const publicSnap = await adminDb_.doc('publicTexts/' + textId).get();
    if (!publicSnap.exists) return res.status(404).json({ error: 'Text not found', code: 'NOT_FOUND' });

    const data = publicSnap.data()!;
    const newId = `fork_${textId}_${Date.now()}`;

    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb_.doc(`users/${userId}/imports/${newId}`).set({
      ...data,
      id: newId,
      title: `${data.title} (forked)`,
      visibility: 'private',
      forkedFrom: textId,
      authorId: data.authorId || null,
      authorName: data.authorName || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });

    res.status(200).json({ id: newId });
  } catch (err: any) {
    console.error('Error forking text:', err);
    res.status(500).json({ error: 'Failed to fork text', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/imports/:importId/share', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    const data = snap.data()!;

    await importRef.update({
      visibility: 'public',
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb_.doc('publicTexts/' + importId).set({
      ...data,
      authorId: userId,
      authorName: data.authorName || 'Anonymous',
      publishedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error sharing text:', err);
    res.status(500).json({ error: 'Failed to share text', code: 'INTERNAL_ERROR' });
  }
});

app.post('/api/imports/:importId/unshare', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user!.uid;
  const { importId } = req.params;

  const adminDb_ = getAdminDb();
  if (!adminDb_) return res.status(503).json({ error: 'Database service unavailable', code: 'SERVICE_UNAVAILABLE' });

  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    const importRef = adminDb_.doc(`users/${userId}/imports/${importId}`);
    const snap = await importRef.get();

    if (!snap.exists) return res.status(404).json({ error: 'Import not found', code: 'NOT_FOUND' });

    await importRef.update({
      visibility: 'private',
      publishedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      await adminDb_.doc('publicTexts/' + importId).delete();
    } catch {
      // Ignore if already removed
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error unsharing text:', err);
    res.status(500).json({ error: 'Failed to unshare text', code: 'INTERNAL_ERROR' });
  }
});

// ─── Stripe Payment Integration ────────────────────────────────────────
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

// Reverse mapping for the Stripe webhook — maps a Stripe price ID back to a planId.
const PLANS_BY_PRICE: Record<string, { planId: string; name: string }> = {};
for (const [planId, prices] of Object.entries(PRICE_IDS)) {
  for (const priceId of Object.values(prices)) {
    if (priceId) PLANS_BY_PRICE[priceId] = { planId, name: planId };
  }
}

app.post('/api/stripe/create-checkout-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
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

    // Dev mode: only when NODE_ENV is explicitly development.
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

    // Safely derive default URLs from the request origin.
    const origin = req.headers.origin || 'https://paleoglossa-ai-studio.vercel.app';
    const safeDefault = (path: string) => origin + path;

    // Validate custom URLs point to same origin (prevent open redirect).
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

app.post('/api/stripe/create-portal-session', requireAuth as any, async (req: AuthenticatedRequest, res: any) => {
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

const ALL_LANGUAGES = ['grc', 'grc-koine', 'hbo', 'lat', 'syr', 'cop', 'arc', 'akk', 'san', 'egy', 'hit'];

app.post('/api/stripe/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';

  if (!sig || !webhookSecret || !stripeKey) {
    if (isDev) {
      return res.status(200).json({ received: true, devMode: true });
    }
    return res.status(500).json({ error: 'Stripe webhook not configured', code: 'STRIPE_NOT_CONFIGURED' });
  }

  let event: any;
  try {
    const stripe = new (await import('stripe')).default(stripeKey);
    const rawBody = req.rawBody || JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe-webhook] Invalid signature:', err.message);
    return res.status(400).json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' });
  }

  const adminDb_ = getAdminDb();
  if (!adminDb_) {
    console.error('[stripe-webhook] Admin DB not available');
    return res.status(503).json({ error: 'Database unavailable', code: 'SERVICE_UNAVAILABLE' });
  }

  const { FieldValue } = await import('firebase-admin/firestore');
  const eventId = event.id;

  // Idempotency: skip if already processed
  try {
    const eventDoc = await adminDb_.doc('stripeEvents/' + eventId).get();
    if (eventDoc.exists) {
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch (dbErr: any) {
    console.error('[stripe-webhook] Idempotency check failed:', dbErr.message);
    // Continue processing — better to process twice than miss an event.
  }

  const now = FieldValue.serverTimestamp();

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = (session.client_reference_id || session.metadata?.userId) as string | undefined;
        const planId = (session.metadata?.planId || 'basic_1') as string;

        if (!userId) {
          console.error('[stripe-webhook] No userId in checkout.session.completed');
          break;
        }

        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;
        const customerEmail = session.customer_details?.email as string | undefined;
        const periodEnd = (session as any).current_period_end
          ? new Date((session as any).current_period_end * 1000).toISOString()
          : null;

        const userData: Record<string, any> = {
          currentPlan: planId,
          subscriptionStatus: 'active',
          subscriptionUpdatedAt: now,
        };
        if (customerId) userData.stripeCustomerId = customerId;
        if (subscriptionId) userData.stripeSubscriptionId = subscriptionId;
        if (periodEnd) userData.currentPeriodEnd = periodEnd;
        userData.selectedLanguageIds = planId === 'full_all' ? ALL_LANGUAGES : ['grc'];

        await adminDb_.doc('users/' + userId).set(userData, { merge: true });

        // Create reverse lookup so subscription webhooks can find the user
        if (customerId) {
          await adminDb_.doc('stripeCustomers/' + customerId).set({
            userId,
            email: customerEmail || null,
            createdAt: now,
            updatedAt: now,
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
        const currentPeriodEnd = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + customerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer:', customerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;
        const planInfo = priceId ? PLANS_BY_PRICE[priceId] : null;
        const planId = planInfo?.planId || 'basic_1';
        const subscriptionStatus: string =
          status === 'active' ? 'active' :
          status === 'past_due' ? 'past_due' :
          status === 'canceled' || status === 'unpaid' ? 'canceled' : 'past_due';

        const updateData: Record<string, any> = {
          currentPlan: planId,
          subscriptionStatus,
          subscriptionUpdatedAt: now,
        };
        if (currentPeriodEnd) updateData.currentPeriodEnd = currentPeriodEnd;

        await adminDb_.doc('users/' + userId).set(updateData, { merge: true });
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const deletedCustomerId = deletedSub.customer as string;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + deletedCustomerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer on deletion:', deletedCustomerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;

        await adminDb_.doc('users/' + userId).set({
          currentPlan: 'free',
          subscriptionStatus: 'canceled',
          subscriptionUpdatedAt: now,
        }, { merge: true });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const invCustomerId = invoice.customer as string;

        const lookupSnap = await adminDb_.doc('stripeCustomers/' + invCustomerId).get();
        if (!lookupSnap.exists) {
          console.error('[stripe-webhook] Unknown customer on payment failure:', invCustomerId);
          break;
        }

        const userId = lookupSnap.data()!.userId as string;
        await adminDb_.doc('users/' + userId).set({
          subscriptionStatus: 'past_due',
          subscriptionUpdatedAt: now,
        }, { merge: true });
        break;
      }
    }

    // Mark event as processed (idempotency)
    await adminDb_.doc('stripeEvents/' + eventId).set({
      type: event.type,
      processedAt: now,
    }).catch((dbErr: any) => {
      console.error('[stripe-webhook] Failed to mark event as processed:', dbErr.message);
    });

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[stripe-webhook] Processing error:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed', code: 'WEBHOOK_ERROR' });
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
