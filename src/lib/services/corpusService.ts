import { apiFetch } from './apiFetch.js';

export interface CorpusSectionPreview {
  id: string;
  label: string;
}

export interface CorpusTextMeta {
  id: string;
  title: string;
  languageId: string;
  sourceStatus?: string;
  isSample?: boolean;
  sentenceCount?: number;
  sectionsPreview: CorpusSectionPreview[];
  source: 'static' | 'firestore';
}

export interface CorpusSection {
  id: string;
  textId: string;
  label: string;
  sequence?: number;
  sentences: Array<{
    id: string;
    translation?: string;
    tokens: Array<{
      id: string;
      surface: string;
      normalized?: string;
      lemma?: string;
      gloss?: string;
      transliteration?: string;
      morphology?: Record<string, string>;
      punctBefore?: string;
      punctAfter?: string;
    }>;
  }>;
  source?: 'static' | 'firestore';
}

// Simple in-memory cache so repeated navigation doesn't re-fetch
const _sectionCache = new Map<string, CorpusSection>();
const _textCache = new Map<string, CorpusTextMeta>();

// ─── File-served local corpus (static CDN assets under /corpus-data) ──────────
// Full works completed by the ingestion pipeline are served as static JSON, not
// through the serverless API (which has a size limit). Each text is one
// { text, sections } record at /corpus-data/<id>.json; /corpus-data/index.json
// lists them. We fetch the record once per text and serve both metadata and
// sections from it.
interface LocalRecord {
  text: CorpusTextMeta & { language?: string };
  sections: CorpusSection[];
}
const _localRecordCache = new Map<string, LocalRecord | null>();
let _localIndex: Promise<Set<string>> | null = null;

function staticUrl(path: string): string {
  return `${import.meta.env.BASE_URL ?? '/'}corpus-data/${path}`.replace(/\/{2,}/g, '/');
}

async function loadLocalIndex(): Promise<CorpusTextMeta[]> {
  try {
    const res = await fetch(staticUrl('index.json'));
    if (!res.ok) return [];
    return (await res.json()) as CorpusTextMeta[];
  } catch {
    return [];
  }
}

function localIds(): Promise<Set<string>> {
  if (!_localIndex) {
    _localIndex = loadLocalIndex().then((list) => new Set(list.map((t) => t.id)));
  }
  return _localIndex;
}

async function localRecord(textId: string): Promise<LocalRecord | null> {
  if (_localRecordCache.has(textId)) return _localRecordCache.get(textId)!;
  let rec: LocalRecord | null = null;
  try {
    const res = await fetch(staticUrl(`${encodeURIComponent(textId)}.json`));
    if (res.ok) rec = (await res.json()) as LocalRecord;
  } catch {
    rec = null;
  }
  _localRecordCache.set(textId, rec);
  return rec;
}

export const corpusService = {
  async listTexts(languageId?: string): Promise<CorpusTextMeta[]> {
    const params = languageId ? `?lang=${encodeURIComponent(languageId)}` : '';
    const [apiList, localList] = await Promise.all([
      apiFetch<CorpusTextMeta[]>(`/api/corpus${params}`, { skipAuth: true }).catch(() => []),
      loadLocalIndex(),
    ]);
    const seen = new Set(apiList.map((t) => t.id));
    const merged = [...apiList];
    for (const t of localList) {
      if (seen.has(t.id)) continue;
      if (languageId && t.languageId !== languageId) continue;
      merged.push(t);
    }
    return merged;
  },

  async getText(textId: string): Promise<CorpusTextMeta | null> {
    if (_textCache.has(textId)) return _textCache.get(textId)!;
    if ((await localIds()).has(textId)) {
      const rec = await localRecord(textId);
      if (rec) {
        const meta: CorpusTextMeta = {
          id: rec.text.id,
          title: rec.text.title,
          languageId: rec.text.languageId || rec.text.language || 'grc',
          sourceStatus: rec.text.sourceStatus,
          isSample: rec.text.isSample ?? false,
          sentenceCount: rec.text.sentenceCount ?? 0,
          sectionsPreview: rec.text.sectionsPreview ?? [],
          source: 'firestore', // non-static → Reader fetches sections via this service
        };
        _textCache.set(textId, meta);
        return meta;
      }
    }
    try {
      const text = await apiFetch<CorpusTextMeta>(`/api/corpus/${encodeURIComponent(textId)}`, {
        skipAuth: true,
      });
      if (text) _textCache.set(textId, text);
      return text;
    } catch {
      return null;
    }
  },

  async getSection(textId: string, sectionId: string): Promise<CorpusSection | null> {
    const cacheKey = `${textId}::${sectionId}`;
    if (_sectionCache.has(cacheKey)) return _sectionCache.get(cacheKey)!;
    if ((await localIds()).has(textId)) {
      const rec = await localRecord(textId);
      const section = rec?.sections.find((s) => s.id === sectionId) ?? null;
      if (section) {
        _sectionCache.set(cacheKey, section);
        return section;
      }
    }
    try {
      const section = await apiFetch<CorpusSection>(
        `/api/corpus/${encodeURIComponent(textId)}/sections/${encodeURIComponent(sectionId)}`,
        { skipAuth: true }
      );
      if (section) _sectionCache.set(cacheKey, section);
      return section;
    } catch {
      return null;
    }
  },

  clearCache() {
    _sectionCache.clear();
    _textCache.clear();
    _localRecordCache.clear();
    _localIndex = null;
  },
};
