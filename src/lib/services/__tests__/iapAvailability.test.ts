import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * `isIapAvailable` decides whether the plans page sells through the App Store.
 * Getting it wrong either shows Stripe-style prices inside the iOS app or
 * purchase buttons on Android/web that cannot work, so it is pinned here.
 * The key is read at import time: stub env, reset modules, re-import.
 */
vi.mock('../apiFetch.js', () => ({ apiFetch: vi.fn() }));

async function load(opts: { platform: 'ios' | 'android' | null; flag?: string; key?: string }) {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_MOBILE_PURCHASES', opts.flag ?? '');
  vi.stubEnv('VITE_REVENUECAT_IOS_API_KEY', opts.key ?? '');
  vi.doMock('../../platform.js', () => ({
    isCapacitor: () => opts.platform !== null,
    capacitorPlatform: () => opts.platform,
  }));
  return (await import('../iapService.js')).isIapAvailable();
}

describe('isIapAvailable', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('../../platform.js');
  });

  it('is on for iOS with the flag and a key', async () => {
    expect(await load({ platform: 'ios', flag: 'true', key: 'appl_x' })).toBe(true);
  });

  it('is off on iOS without the flag or without the key', async () => {
    expect(await load({ platform: 'ios', flag: 'false', key: 'appl_x' })).toBe(false);
    expect(await load({ platform: 'ios', flag: 'true', key: '' })).toBe(false);
  });

  it('is off on Android and on the web even when fully configured', async () => {
    expect(await load({ platform: 'android', flag: 'true', key: 'appl_x' })).toBe(false);
    expect(await load({ platform: null, flag: 'true', key: 'appl_x' })).toBe(false);
  });
});
