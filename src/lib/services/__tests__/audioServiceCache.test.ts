import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiFetch = vi.fn();
vi.mock('../apiFetch.js', () => ({ apiFetch: (...args: unknown[]) => apiFetch(...args) }));

import { AudioService } from '../audioService.js';

beforeEach(() => {
  apiFetch.mockReset();
  AudioService.clearTTSCache();
});

describe('AudioService.generateTTS', () => {
  it('asks the server once for a text, however often it is played', async () => {
    apiFetch.mockResolvedValue({ audioUrl: 'data:audio/mpeg;base64,AAA' });
    const first = await AudioService.generateTTS('λόγος', 'grc');
    const second = await AudioService.generateTTS('λόγος', 'grc');
    expect(first).toBe('data:audio/mpeg;base64,AAA');
    expect(second).toBe(first);
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('shares one request between callers that ask at the same time', async () => {
    let resolve!: (value: { audioUrl: string }) => void;
    apiFetch.mockReturnValue(new Promise((r) => (resolve = r)));
    const a = AudioService.generateTTS('λόγος', 'grc');
    const b = AudioService.generateTTS('λόγος', 'grc');
    resolve({ audioUrl: 'data:x' });
    expect(await a).toBe('data:x');
    expect(await b).toBe('data:x');
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('keeps languages apart', async () => {
    apiFetch.mockResolvedValue({ audioUrl: 'data:x' });
    await AudioService.generateTTS('amen', 'lat');
    await AudioService.generateTTS('amen', 'grc');
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

  it('does not remember a failure, so a later tap can succeed', async () => {
    apiFetch.mockRejectedValueOnce(new Error('offline'));
    expect(await AudioService.generateTTS('λόγος', 'grc')).toBeNull();
    apiFetch.mockResolvedValueOnce({ audioUrl: null });
    expect(await AudioService.generateTTS('λόγος', 'grc')).toBeNull();
    apiFetch.mockResolvedValueOnce({ audioUrl: 'data:x' });
    expect(await AudioService.generateTTS('λόγος', 'grc')).toBe('data:x');
    expect(apiFetch).toHaveBeenCalledTimes(3);
  });
});
