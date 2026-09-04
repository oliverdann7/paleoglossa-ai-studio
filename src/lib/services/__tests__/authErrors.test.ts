import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

/**
 * Pins the two behaviours behind the sign-in errors reported from TestFlight
 * build 59 (2026-09-03):
 *
 *  1. A dismissed native Apple/Google sheet must be silent. The plugin rejects
 *     with `code: 'USER_CANCELLED'` and the raw iOS description
 *     "(com.apple.AuthenticationServices.AuthorizationError error 1001.)",
 *     which the old message-only check did not recognise — so the user saw it
 *     as an error.
 *  2. Every error key `AuthResult.error` can carry must render as prose, never
 *     as the raw key ("auth.networkError"), even when a locale lacks it.
 */

vi.mock('../../firebase.js', () => ({ auth: {}, appleProvider: {} }));
vi.mock('../vocabularyService.js', () => ({ VocabularyService: { flushPendingWrites: vi.fn() } }));

async function loadAuthService() {
  vi.resetModules();
  return import('../authService.js');
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isUserCancellation', () => {
  it('recognises the plugin USER_CANCELLED code regardless of message', async () => {
    const { isUserCancellation } = await loadAuthService();
    expect(
      isUserCancellation({
        code: 'USER_CANCELLED',
        message:
          "The operation couldn't be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)",
      })
    ).toBe(true);
  });

  it('recognises ASAuthorizationError.canceled (1001) by message alone', async () => {
    const { isUserCancellation } = await loadAuthService();
    expect(
      isUserCancellation(
        new Error(
          "The operation couldn't be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)"
        )
      )
    ).toBe(true);
  });

  it('recognises textual cancellation messages', async () => {
    const { isUserCancellation } = await loadAuthService();
    expect(isUserCancellation(new Error('The user canceled the sign-in flow.'))).toBe(true);
    expect(isUserCancellation('Cancelled')).toBe(true);
  });

  it('does not swallow real failures', async () => {
    const { isUserCancellation } = await loadAuthService();
    expect(isUserCancellation({ code: 'auth/network-request-failed' })).toBe(false);
    expect(
      isUserCancellation(
        new Error('(com.apple.AuthenticationServices.AuthorizationError error 1000.)')
      )
    ).toBe(false);
    expect(isUserCancellation(undefined)).toBe(false);
  });
});

describe('describeAuthError', () => {
  // A translator whose locale has none of the keys: it must fall back to the
  // English default rather than echo the key.
  const missingLocale = (_key: string, fallback: string) => fallback;

  it('never renders a raw i18n key', async () => {
    const { describeAuthError, AUTH_ERROR_DEFAULTS } = await loadAuthService();
    for (const key of Object.keys(AUTH_ERROR_DEFAULTS)) {
      const text = describeAuthError(missingLocale, { success: false, error: key });
      expect(text).not.toMatch(/^auth\./);
      expect(text.length).toBeGreaterThan(10);
    }
  });

  it('prefers the locale translation when present', async () => {
    const { describeAuthError } = await loadAuthService();
    const t = (key: string, fallback: string) =>
      key === 'auth.networkError' ? 'Erro de rede.' : fallback;
    expect(describeAuthError(t, { success: false, error: 'auth.networkError' })).toBe(
      'Erro de rede.'
    );
  });

  it('has a generic message when the result carries no key', async () => {
    const { describeAuthError } = await loadAuthService();
    expect(describeAuthError(missingLocale, { success: false })).toBe(
      'Sign in failed. Please try again.'
    );
  });
});

describe('native sign-in results', () => {
  function stubNative(platform: 'ios') {
    (globalThis as any).window.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => platform,
    };
  }

  afterEach(() => {
    delete (globalThis as any).window.Capacitor;
    vi.doUnmock('@capgo/capacitor-social-login');
  });

  it('a dismissed Apple sheet yields a silent failure, not an error banner', async () => {
    stubNative('ios');
    vi.doMock('@capgo/capacitor-social-login', () => ({
      SocialLogin: {
        initialize: vi.fn().mockResolvedValue(undefined),
        login: vi
          .fn()
          .mockRejectedValue(
            Object.assign(
              new Error(
                "The operation couldn't be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)"
              ),
              { code: 'USER_CANCELLED' }
            )
          ),
      },
    }));
    const { signInWithApple } = await loadAuthService();
    const result = await signInWithApple();
    expect(result).toEqual({ success: false });
  });

  it('a real native failure keeps the raw detail for diagnosis', async () => {
    stubNative('ios');
    vi.doMock('@capgo/capacitor-social-login', () => ({
      SocialLogin: {
        initialize: vi.fn().mockResolvedValue(undefined),
        login: vi.fn().mockRejectedValue(
          Object.assign(new Error('Sign in with Apple is not available on this device.'), {
            code: 'UNAVAILABLE',
          })
        ),
      },
    }));
    const { signInWithApple } = await loadAuthService();
    const result = await signInWithApple();
    expect(result.success).toBe(false);
    expect(result.error).toBe('auth.signInFailed');
    expect(result.detail).toContain('UNAVAILABLE');
    expect(result.detail).toContain('not available on this device');
  });
});

describe('email sign-in failure detail', () => {
  it('keeps the transport cause Firebase hides in customData', async () => {
    vi.doMock('firebase/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('firebase/auth')>();
      return {
        ...actual,
        signInWithEmailAndPassword: vi.fn().mockRejectedValue(
          Object.assign(new Error('Firebase: Error (auth/network-request-failed).'), {
            code: 'auth/network-request-failed',
            customData: { message: 'TypeError: Load failed' },
          })
        ),
      };
    });
    const { signInWithEmail } = await loadAuthService();
    const result = await signInWithEmail('a@b.c', 'secret');
    vi.doUnmock('firebase/auth');
    expect(result.success).toBe(false);
    expect(result.error).toBe('auth.networkError');
    expect(result.detail).toContain('auth/network-request-failed');
    expect(result.detail).toContain('TypeError: Load failed');
  });
});
