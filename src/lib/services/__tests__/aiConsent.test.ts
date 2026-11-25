import { describe, it, expect, vi, beforeEach } from 'vitest';

let native = false;
vi.mock('../../platform.js', () => ({ isCapacitor: () => native }));
vi.mock('../apiBaseUrl.js', () => ({ getApiUrl: (p: string) => `https://api.test${p}` }));

async function load() {
  vi.resetModules();
  return import('../aiConsent.js');
}

describe('AI consent', () => {
  beforeEach(() => {
    localStorage.clear();
    native = false;
  });

  it('web: allowed by default, no prompt', async () => {
    const c = await load();
    await expect(c.ensureAiConsent()).resolves.toBeUndefined();
    expect(c.isAiConsentPromptOpen()).toBe(false);
    expect(c.isAiProcessingAllowed()).toBe(true);
  });

  it('native: nothing is sent until the user allows it', async () => {
    native = true;
    const c = await load();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    expect(c.isAiProcessingAllowed()).toBe(false);

    const request = c.aiFetch('/api/ai/explain', { method: 'POST' });
    await Promise.resolve();
    expect(c.isAiConsentPromptOpen()).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();

    c.answerAiConsentPrompt(true);
    await request;
    expect(fetchSpy).toHaveBeenCalledWith('https://api.test/api/ai/explain', { method: 'POST' });
    expect(c.isAiConsentPromptOpen()).toBe(false);
    expect(c.getAiConsent()).toBe('granted');
    fetchSpy.mockRestore();
  });

  it('native: concurrent requests share one prompt', async () => {
    native = true;
    const c = await load();
    let opens = 0;
    c.subscribeAiConsentPrompt(() => {
      if (c.isAiConsentPromptOpen()) opens += 1;
    });
    const a = c.ensureAiConsent();
    const b = c.ensureAiConsent();
    c.answerAiConsentPrompt(true);
    await Promise.all([a, b]);
    expect(opens).toBe(1);
  });

  it('declining blocks the request and is remembered without re-prompting', async () => {
    native = true;
    const c = await load();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));

    const request = c.aiFetch('/api/ai/explain');
    await Promise.resolve();
    c.answerAiConsentPrompt(false);
    await expect(request).rejects.toBeInstanceOf(c.AiConsentDeclinedError);

    await expect(c.ensureAiConsent()).rejects.toBeInstanceOf(c.AiConsentDeclinedError);
    expect(c.isAiConsentPromptOpen()).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('the Settings switch overrides either default', async () => {
    const c = await load();
    c.setAiConsent(false);
    await expect(c.ensureAiConsent()).rejects.toBeInstanceOf(c.AiConsentDeclinedError);
    c.setAiConsent(true);
    await expect(c.ensureAiConsent()).resolves.toBeUndefined();
  });
});
