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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Test route ──────────────────────────────────────────────────────────────
app.post('/api/test', (_req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'Test route works' });
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

app.post('/api/public/texts/:textId/fork', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const newId = await ImportService.forkPublic(userId, req.params.textId);
  
  if (newId) {
    res.status(200).json({ id: newId });
  } else {
    res.status(500).json({ error: 'Failed to fork text' });
  }
});

app.post('/api/imports/:importId/share', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const success = await ImportService.sharePublic(userId, req.params.importId);
  
  res.status(200).json({ success });
});

app.post('/api/imports/:importId/unshare', async (req: any, res: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { ImportService } = await import('../src/lib/services/importService');
  const success = await ImportService.unsharePublic(userId, req.params.importId);
  
  res.status(200).json({ success });
});

// ─── Stripe Payment Integration ────────────────────────────────────────
const PLANS_BY_PRICE: Record<string, { planId: string; name: string }> = {};

function initStripePlans() {
  if (process.env.STRIPE_BASIC_PRICE_ID) {
    PLANS_BY_PRICE[process.env.STRIPE_BASIC_PRICE_ID] = { planId: 'basic_1', name: 'Basic' };
  }
  if (process.env.STRIPE_DUO_PRICE_ID) {
    PLANS_BY_PRICE[process.env.STRIPE_DUO_PRICE_ID] = { planId: 'duo_2', name: 'Duo' };
  }
  if (process.env.STRIPE_FULL_PRICE_ID) {
    PLANS_BY_PRICE[process.env.STRIPE_FULL_PRICE_ID] = { planId: 'full_all', name: 'Full Pack' };
  }
}

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

app.post('/api/stripe/create-checkout-session', async (req: any, res: any) => {
  try {
    const { planId, billingCycle = 'monthly', userId, email, successUrl, cancelUrl } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Missing planId or userId' });
    }

    const priceId = PRICE_IDS[planId]?.[billingCycle as 'monthly' | 'yearly'];
    if (!priceId) {
      return res.status(400).json({ error: `No price configured for plan ${planId} (${billingCycle})` });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(200).json({
        devMode: true,
        url: null,
        message: 'Stripe not configured. Set STRIPE_SECRET_KEY for production payments.',
      });
    }

    const stripe = new (await import('stripe')).default(stripeKey);
    initStripePlans();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      metadata: { planId, userId },
      success_url: successUrl || `${req.headers.origin || 'https://paleoglossa-ai-studio.vercel.app'}/app/subscription?success=true`,
      cancel_url: cancelUrl || `${req.headers.origin || 'https://paleoglossa-ai-studio.vercel.app'}/app/subscription?canceled=true`,
      subscription_data: {
        metadata: { planId, userId },
      },
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

app.post('/api/stripe/create-portal-session', async (req: any, res: any) => {
  try {
    const { customerId, returnUrl } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(200).json({ devMode: true, url: null, message: 'Stripe not configured' });
    }

    const stripe = new (await import('stripe')).default(stripeKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || ''}/app/subscription`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: err.message || 'Failed to create portal session' });
  }
});

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

        // Update user's plan in Firestore
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
