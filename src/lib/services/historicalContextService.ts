export interface HistoricalContext {
  geography: string;
  period: string;
  keyFigures: string;
  culturalBackground: string;
  literaryContext: string;
  _unavailable?: boolean;
}

// Session-scoped fast cache: cacheKey → HistoricalContext
const _cache = new Map<string, HistoricalContext>();

// Persistent cache (survives reloads / works offline). Bump the version suffix
// if the response shape ever changes so stale entries are ignored.
const STORAGE_PREFIX = 'pg:histctx:v1:';
const PERSIST_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

interface PersistedEntry {
  data: HistoricalContext;
  cachedAt: number;
}

/** Normalize so trivial title differences (case/whitespace) hit the same cache entry. */
function makeCacheKey(opts: { textId?: string; title: string }): string {
  const raw = opts.textId || opts.title || '';
  return raw.toLowerCase().trim().replace(/\s+/g, ' ');
}

function readPersisted(key: string): HistoricalContext | null {
  try {
    const rawEntry = localStorage.getItem(STORAGE_PREFIX + key);
    if (!rawEntry) return null;
    const entry = JSON.parse(rawEntry) as PersistedEntry;
    if (!entry?.data || Date.now() - entry.cachedAt > PERSIST_TTL) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writePersisted(key: string, data: HistoricalContext): void {
  // Never persist the "no API key" placeholder — it would mask the feature
  // becoming available later.
  if (data._unavailable) return;
  try {
    const entry: PersistedEntry = { data, cachedAt: Date.now() };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota errors / private mode — caching is best-effort.
  }
}

export async function fetchHistoricalContext(
  opts: {
    textId?: string;
    title: string;
    languageId: string;
    author?: string;
    period?: string;
  },
  signal?: AbortSignal
): Promise<HistoricalContext> {
  const cacheKey = makeCacheKey(opts);

  const memHit = _cache.get(cacheKey);
  if (memHit) return memHit;

  const persisted = readPersisted(cacheKey);
  if (persisted) {
    _cache.set(cacheKey, persisted);
    return persisted;
  }

  const res = await fetch('/api/ai/historical-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Historical context request failed: ${res.status}`);
  }

  const data: HistoricalContext = await res.json();
  _cache.set(cacheKey, data);
  writePersisted(cacheKey, data);
  return data;
}
