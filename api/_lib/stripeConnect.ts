/**
 * Stripe Connect (Express accounts) helpers for the tutor marketplace.
 *
 * All callers must check process.env.STRIPE_SECRET_KEY before using these —
 * we surface devMode responses in routes when it's missing, just like billing.ts.
 */

export async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_NOT_CONFIGURED');
  const StripeMod = (await import('stripe')).default;
  return new StripeMod(key);
}

export async function createExpressAccount(opts: {
  email: string | null;
  country?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = await getStripe();
  return stripe.accounts.create({
    type: 'express',
    email: opts.email || undefined,
    country: opts.country,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    metadata: opts.metadata,
  });
}

export async function createAccountLink(accountId: string, opts: { refresh: string; return: string }) {
  const stripe = await getStripe();
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: opts.refresh,
    return_url: opts.return,
    type: 'account_onboarding',
  });
}

export async function createLoginLink(accountId: string) {
  const stripe = await getStripe();
  return stripe.accounts.createLoginLink(accountId);
}

export async function retrieveAccount(accountId: string) {
  const stripe = await getStripe();
  return stripe.accounts.retrieve(accountId);
}

export function deriveConnectStatus(
  account: { charges_enabled?: boolean; payouts_enabled?: boolean; requirements?: { disabled_reason?: string | null } }
): 'none' | 'pending' | 'verified' | 'restricted' {
  if (account.charges_enabled && account.payouts_enabled) return 'verified';
  if (account.requirements?.disabled_reason) return 'restricted';
  return 'pending';
}
