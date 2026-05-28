export interface HistoricalContext {
  geography: string;
  period: string;
  keyFigures: string;
  culturalBackground: string;
  literaryContext: string;
  _unavailable?: boolean;
}

// Session-scoped cache: cacheKey → HistoricalContext
const _cache = new Map<string, HistoricalContext>();

export async function fetchHistoricalContext(opts: {
  textId?: string;
  title: string;
  languageId: string;
  author?: string;
  period?: string;
}): Promise<HistoricalContext> {
  const cacheKey = opts.textId || opts.title;
  const hit = _cache.get(cacheKey);
  if (hit) return hit;

  const res = await fetch('/api/ai/historical-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });

  if (!res.ok) {
    throw new Error(`Historical context request failed: ${res.status}`);
  }

  const data: HistoricalContext = await res.json();
  _cache.set(cacheKey, data);
  return data;
}
