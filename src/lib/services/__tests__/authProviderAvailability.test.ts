import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * Guards the two functions that decide which sign-in buttons exist on the
 * login page: `isGoogleSignInAvailable` / `isAppleSignInAvailable`.
 *
 * These are pure config logic, but getting them wrong ships an app nobody can
 * sign into — TestFlight build 15 offered a Google button on Android that the
 * plugin could never satisfy, and a build whose env lost its client id offers
 * no OAuth at all. Neither failure is visible without a device, so it is
 * pinned here instead.
 *
 * The client ids are read into module-level consts at import time, so each
 * case stubs the env, resets the module registry, and re-imports.
 */

const IOS_ID = '1234-ios.apps.googleusercontent.com';
const WEB_ID = '1234-web.apps.googleusercontent.com';

// authService pulls in Firebase at module scope; none of it is exercised by
// the availability helpers, so keep the graph inert.
vi.mock('../../firebase.js', () => ({ auth: {}, appleProvider: {} }));
vi.mock('../vocabularyService.js', () => ({ VocabularyService: { flushPendingWrites: vi.fn() } }));

interface Env {
  platform?: 'ios' | 'android';
  iosClientId?: string;
  webClientId?: string;
}

async function loadAuthService({ platform, iosClientId = '', webClientId = '' }: Env) {
  if (platform) {
    (globalThis as any).window.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => platform,
    };
  } else {
    delete (globalThis as any).window.Capacitor;
  }

  vi.stubEnv('VITE_GOOGLE_IOS_CLIENT_ID', iosClientId);
  vi.stubEnv('VITE_GOOGLE_WEB_CLIENT_ID', webClientId);
  vi.resetModules();

  return import('../authService.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete (globalThis as any).window.Capacitor;
});

describe('sign-in provider availability', () => {
  describe('web', () => {
    it('offers both providers regardless of native client ids', async () => {
      const svc = await loadAuthService({});
      // Web uses Firebase popup flows, which need no build-time client id.
      expect(svc.isGoogleSignInAvailable()).toBe(true);
      expect(svc.isAppleSignInAvailable()).toBe(true);
    });
  });

  describe('iOS', () => {
    it('offers Google when the iOS client id was baked in', async () => {
      const svc = await loadAuthService({ platform: 'ios', iosClientId: IOS_ID });
      expect(svc.isGoogleSignInAvailable()).toBe(true);
    });

    it('hides Google when the iOS client id is missing', async () => {
      const svc = await loadAuthService({ platform: 'ios' });
      expect(svc.isGoogleSignInAvailable()).toBe(false);
    });

    it('ignores the web client id — iOS needs its own', async () => {
      const svc = await loadAuthService({ platform: 'ios', webClientId: WEB_ID });
      expect(svc.isGoogleSignInAvailable()).toBe(false);
    });

    it('always offers Apple — the native sheet needs no extra config', async () => {
      const svc = await loadAuthService({ platform: 'ios' });
      expect(svc.isAppleSignInAvailable()).toBe(true);
    });
  });

  describe('Android', () => {
    it('offers Google when the web client id was baked in', async () => {
      // Credential Manager validates the id token against the *web* OAuth
      // client (client_type 3), not an Android one.
      const svc = await loadAuthService({ platform: 'android', webClientId: WEB_ID });
      expect(svc.isGoogleSignInAvailable()).toBe(true);
    });

    it('hides Google when the web client id is missing', async () => {
      const svc = await loadAuthService({ platform: 'android' });
      expect(svc.isGoogleSignInAvailable()).toBe(false);
    });

    it('ignores the iOS client id — Android cannot use it', async () => {
      const svc = await loadAuthService({ platform: 'android', iosClientId: IOS_ID });
      expect(svc.isGoogleSignInAvailable()).toBe(false);
    });

    it('never offers Apple — no Apple web-flow is configured', async () => {
      const svc = await loadAuthService({ platform: 'android', webClientId: WEB_ID });
      expect(svc.isAppleSignInAvailable()).toBe(false);
    });
  });

  it('leaves no native platform offering zero providers silently', async () => {
    // Android with nothing configured is email-only. That is a legitimate
    // build, but it is the exact state that made the login page render a
    // dangling "Or" divider — the pages must branch on these two flags
    // together rather than assume at least one button exists.
    const svc = await loadAuthService({ platform: 'android' });
    expect(svc.isGoogleSignInAvailable()).toBe(false);
    expect(svc.isAppleSignInAvailable()).toBe(false);
  });
});
