import { apiFetch } from './apiFetch.js';

export interface WordCollection {
  id: string;
  name: string;
  description?: string | null;
  languageId: string;
  lemmas: string[];
  createdAt: string;
  updatedAt: string;
}

export const WordCollectionService = {
  async list(): Promise<WordCollection[]> {
    const data = await apiFetch<{ collections: WordCollection[] }>('/api/word-collections');
    return data.collections;
  },

  async get(id: string): Promise<WordCollection> {
    return apiFetch<WordCollection>(`/api/word-collections/${id}`);
  },

  async create(params: {
    name: string;
    description?: string;
    languageId: string;
  }): Promise<WordCollection> {
    return apiFetch<WordCollection>('/api/word-collections', { method: 'POST', body: params });
  },

  async update(id: string, params: { name?: string; description?: string }): Promise<void> {
    await apiFetch<{ ok: boolean }>(`/api/word-collections/${id}`, {
      method: 'PATCH',
      body: params,
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch<{ ok: boolean }>(`/api/word-collections/${id}`, { method: 'DELETE' });
  },

  async addWord(collectionId: string, lemma: string): Promise<void> {
    await apiFetch<{ ok: boolean }>(`/api/word-collections/${collectionId}/words`, {
      method: 'POST',
      body: { lemma },
    });
  },

  async removeWord(collectionId: string, lemma: string): Promise<void> {
    await apiFetch<{ ok: boolean }>(
      `/api/word-collections/${collectionId}/words/${encodeURIComponent(lemma)}`,
      { method: 'DELETE' }
    );
  },
};
