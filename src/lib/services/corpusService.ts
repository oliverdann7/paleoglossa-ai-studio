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

export const corpusService = {
  async listTexts(languageId?: string): Promise<CorpusTextMeta[]> {
    const params = languageId ? `?lang=${encodeURIComponent(languageId)}` : '';
    return apiFetch<CorpusTextMeta[]>(`/api/corpus${params}`, { skipAuth: true }).catch(() => []);
  },

  async getText(textId: string): Promise<CorpusTextMeta | null> {
    if (_textCache.has(textId)) return _textCache.get(textId)!;
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
  },
};
