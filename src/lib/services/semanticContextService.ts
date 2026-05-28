export interface SemanticCognate {
  language: string;
  word: string;
  meaning: string;
}

export interface SemanticContext {
  semanticDomain: string;
  cognates: SemanticCognate[];
  usageNotes: string;
  historicalEvolution: string;
  _unavailable?: boolean;
}

// Session-scoped cache keyed by `${languageId}:${lemma}`
const _cache = new Map<string, SemanticContext>();

export async function fetchSemanticContext(opts: {
  lemma: string;
  languageId: string;
  gloss?: string;
}): Promise<SemanticContext> {
  const key = `${opts.languageId}:${opts.lemma}`;
  const hit = _cache.get(key);
  if (hit) return hit;

  const res = await fetch('/api/ai/semantic-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });

  if (!res.ok) {
    throw new Error(`Semantic context request failed: ${res.status}`);
  }

  const data: SemanticContext = await res.json();
  _cache.set(key, data);
  return data;
}
