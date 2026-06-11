/**
 * ImportService.forkPublic — forks go through the server fork endpoint so the
 * plan's import quota is enforced; a 429 IMPORT_LIMIT_REACHED is rethrown for
 * the UI to show an upgrade CTA, while other failures return null.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '../apiFetch.js';

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
}));

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('../apiFetch.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../apiFetch.js')>();
  return { ...actual, apiFetch: mockApiFetch };
});

import { ImportService } from '../importService.js';

describe('ImportService.forkPublic', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it('forks via the server endpoint and returns the new import id', async () => {
    mockApiFetch.mockResolvedValue({ id: 'fork_abc_123' });

    const newId = await ImportService.forkPublic('user1', 'abc');

    expect(newId).toBe('fork_abc_123');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/public/texts/abc/fork', { method: 'POST' });
  });

  it('rethrows IMPORT_LIMIT_REACHED so the UI can show an upgrade CTA', async () => {
    mockApiFetch.mockRejectedValue(
      new ApiError('Import limit reached', 429, {
        code: 'IMPORT_LIMIT_REACHED',
        used: 5,
        limit: 5,
      })
    );

    await expect(ImportService.forkPublic('user1', 'abc')).rejects.toMatchObject({
      status: 429,
      code: 'IMPORT_LIMIT_REACHED',
    });
  });

  it('returns null on generic failures (404, network)', async () => {
    mockApiFetch.mockRejectedValue(new ApiError('Text not found', 404, { code: 'NOT_FOUND' }));
    expect(await ImportService.forkPublic('user1', 'gone')).toBeNull();

    mockApiFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await ImportService.forkPublic('user1', 'abc')).toBeNull();
  });

  it('returns null without calling the API when there is no user', async () => {
    expect(await ImportService.forkPublic('', 'abc')).toBeNull();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });
});
