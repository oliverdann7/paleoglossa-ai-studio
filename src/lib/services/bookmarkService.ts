import { apiFetch } from './apiFetch.js';

export interface Bookmark {
  id: string;
  textId: string;
  textTitle?: string | null;
  sentenceText: string;
  sentenceIndex: number;
  languageId: string;
  note?: string | null;
  createdAt: string;
}

export const BookmarkService = {
  async list(): Promise<Bookmark[]> {
    const data = await apiFetch<{ bookmarks: Bookmark[] }>('/api/bookmarks');
    return data.bookmarks;
  },

  async create(params: {
    textId: string;
    textTitle?: string;
    sentenceText: string;
    sentenceIndex: number;
    languageId: string;
    note?: string;
  }): Promise<Bookmark> {
    return apiFetch<Bookmark>('/api/bookmarks', { method: 'POST', body: params });
  },

  async updateNote(bookmarkId: string, note: string): Promise<void> {
    await apiFetch<{ ok: boolean }>(`/api/bookmarks/${bookmarkId}`, {
      method: 'PATCH',
      body: { note },
    });
  },

  async delete(bookmarkId: string): Promise<void> {
    await apiFetch<{ ok: boolean }>(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE' });
  },
};
