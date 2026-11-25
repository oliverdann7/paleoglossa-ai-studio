import { describe, it, expect, vi, beforeEach } from 'vitest';

const reauthenticateWithCredential = vi.fn();
const reauthenticateWithProvider = vi.fn();
let currentUser: { email: string | null; providerData: { providerId: string }[] } | null = null;

vi.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser }),
  reauthenticateWithCredential: (...args: unknown[]) => reauthenticateWithCredential(...args),
  EmailAuthProvider: { credential: (email: string, password: string) => ({ email, password }) },
  signOut: vi.fn(),
}));
vi.mock('firebase/analytics', () => ({ getAnalytics: vi.fn(), setUserId: vi.fn() }));
vi.mock('../authService.js', () => ({
  reauthenticateWithProvider: (...args: unknown[]) => reauthenticateWithProvider(...args),
}));
vi.mock('../apiBaseUrl.js', () => ({ getApiUrl: (p: string) => p }));

import { getReauthMethod, reauthenticateUser } from '../accountDeletionService.js';

const userWith = (...ids: string[]) => ({
  email: 'reader@example.com',
  providerData: ids.map((providerId) => ({ providerId })),
});

describe('account deletion re-authentication', () => {
  beforeEach(() => {
    reauthenticateWithCredential.mockReset();
    reauthenticateWithProvider.mockReset();
  });

  it('picks the method from linked providers, not from having an email', () => {
    expect(getReauthMethod(userWith('password'))).toBe('password');
    expect(getReauthMethod(userWith('google.com'))).toBe('google.com');
    expect(getReauthMethod(userWith('apple.com'))).toBe('apple.com');
    expect(getReauthMethod(userWith('google.com', 'password'))).toBe('password');
    expect(getReauthMethod(userWith())).toBe('none');
    expect(getReauthMethod(null)).toBe('none');
  });

  it('does not demand a password from a Google account', async () => {
    currentUser = userWith('google.com');
    await expect(reauthenticateUser({})).resolves.toBeUndefined();
    expect(reauthenticateWithProvider).toHaveBeenCalledWith('google.com');
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it('re-authenticates an Apple account through Apple', async () => {
    currentUser = userWith('apple.com');
    await reauthenticateUser({});
    expect(reauthenticateWithProvider).toHaveBeenCalledWith('apple.com');
  });

  it('requires and uses the password for email/password accounts', async () => {
    currentUser = userWith('password');
    await expect(reauthenticateUser({})).rejects.toThrow(/Password required/);
    await reauthenticateUser({ password: 'hunter22' });
    expect(reauthenticateWithCredential).toHaveBeenCalledWith(currentUser, {
      email: 'reader@example.com',
      password: 'hunter22',
    });
    expect(reauthenticateWithProvider).not.toHaveBeenCalled();
  });

  it('propagates a provider failure so deletion does not proceed', async () => {
    currentUser = userWith('google.com');
    reauthenticateWithProvider.mockRejectedValueOnce(new Error('auth/user-mismatch'));
    await expect(reauthenticateUser({})).rejects.toThrow('auth/user-mismatch');
  });
});
