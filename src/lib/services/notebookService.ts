import { ResearchNotebook, ResearchNote } from '../../types/modules';
import { apiFetch } from './apiFetch';

export type CreateNoteInput = Pick<ResearchNote, 'content'> & Partial<Pick<ResearchNote,
  | 'notebookId' | 'languageId' | 'textId' | 'chunkId'
  | 'token' | 'lemma' | 'grammarTag' | 'source'
  | 'sentenceRange' | 'tokenRange' | 'tags' | 'visibility'
>>;

export class NotebookService {
  static async getNotebooks(): Promise<ResearchNotebook[]> {
    try {
      return await apiFetch<ResearchNotebook[]>('/api/notebooks');
    } catch {
      return [];
    }
  }

  static async createNotebook(title: string, description?: string, languageId?: string): Promise<ResearchNotebook | null> {
    try {
      return await apiFetch<ResearchNotebook>('/api/notebooks', {
        method: 'POST',
        body: { title, description: description ?? '', languageId },
      });
    } catch {
      return null;
    }
  }

  static async deleteNotebook(notebookId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/notebooks/${encodeURIComponent(notebookId)}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }

  static async getNotes(filters?: { notebookId?: string; languageId?: string; targetType?: string }): Promise<ResearchNote[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.notebookId) params.set('notebookId', filters.notebookId);
      if (filters?.languageId) params.set('languageId', filters.languageId);
      if (filters?.targetType) params.set('targetType', filters.targetType);
      const qs = params.toString() ? `?${params}` : '';
      return await apiFetch<ResearchNote[]>(`/api/notes${qs}`);
    } catch {
      return [];
    }
  }

  static async createNote(input: CreateNoteInput): Promise<ResearchNote | null> {
    try {
      return await apiFetch<ResearchNote>('/api/notes', { method: 'POST', body: input });
    } catch {
      return null;
    }
  }

  static async deleteNote(noteId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }
}
