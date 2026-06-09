import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHistoricalContext, type HistoricalContext } from '../historicalContextService';

const sample: HistoricalContext = {
  geography: 'g',
  period: 'p',
  keyFigures: 'k',
  culturalBackground: 'c',
  literaryContext: 'l',
};

function mockFetchOnce(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('fetchHistoricalContext caching', () => {
  it('hits the network once, then serves the persistent cache on a fresh memory state', async () => {
    const fetchMock = mockFetchOnce(sample);
    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchHistoricalContext({ textId: 'persist-1', title: 'X', languageId: 'grc' });
    expect(first.period).toBe('p');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Stored under a versioned key so it survives reloads.
    expect(localStorage.getItem('pg:histctx:v1:persist-1')).not.toBeNull();
  });

  it('normalizes the cache key so case/whitespace differences share an entry', async () => {
    const fetchMock = mockFetchOnce(sample);
    vi.stubGlobal('fetch', fetchMock);

    await fetchHistoricalContext({ title: '  The   Aeneid  ', languageId: 'lat' });
    await fetchHistoricalContext({ title: 'the aeneid', languageId: 'lat' });

    // Second call resolves from cache — no extra network request.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not persist the unavailable placeholder', async () => {
    const fetchMock = mockFetchOnce({ ...sample, _unavailable: true });
    vi.stubGlobal('fetch', fetchMock);

    await fetchHistoricalContext({ textId: 'no-key', title: 'Y', languageId: 'grc' });

    expect(localStorage.getItem('pg:histctx:v1:no-key')).toBeNull();
  });

  it('throws on a non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({}, false, 500));
    await expect(
      fetchHistoricalContext({ textId: 'boom', title: 'Z', languageId: 'grc' })
    ).rejects.toThrow(/500/);
  });
});
