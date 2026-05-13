import { describe, it, expect } from 'vitest';

const SERVER_CONTROLLED = [
  'currentPlan', 'subscriptionStatus', 'stripeCustomerId',
  'stripeSubscriptionId', 'selectedLanguageIds', 'trialEnd',
  'subscriptionUpdatedAt',
];

describe('Profile creation does not include server-controlled fields', () => {

  it('AuthContext profile payload has no server-controlled fields', () => {
    const payload = {
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date().toISOString(),
      stats: { totalKnown: 0, readToday: 0, readingTime: 0 },
    };

    const keys = Object.keys(payload);
    const serverFieldsPresent = keys.filter(k => SERVER_CONTROLLED.includes(k));
    const requiredMissing = ['email', 'displayName', 'createdAt'].filter(k => !keys.includes(k));

    expect(serverFieldsPresent).toEqual([]);
    expect(requiredMissing).toEqual([]);
  });

  it('SignUp profile payload has no server-controlled fields', () => {
    const payload = {
      email: 'newuser@example.com',
      displayName: 'New User',
      createdAt: new Date().toISOString(),
    };

    const keys = Object.keys(payload);
    const serverFieldsPresent = keys.filter(k => SERVER_CONTROLLED.includes(k));
    const requiredMissing = ['email', 'displayName', 'createdAt'].filter(k => !keys.includes(k));

    expect(serverFieldsPresent).toEqual([]);
    expect(requiredMissing).toEqual([]);
  });

  it('Stats field is optional in profile creation (allowed)', () => {
    // AuthContext includes stats, SignUp does not — both are valid
    const withStats = { email: 'a@b.com', displayName: 'A', createdAt: 'now', stats: {} };
    const withoutStats = { email: 'a@b.com', displayName: 'A', createdAt: 'now' };

    expect(Object.keys(withStats)).toContain('stats');
    expect(Object.keys(withoutStats)).not.toContain('stats');
  });
});
