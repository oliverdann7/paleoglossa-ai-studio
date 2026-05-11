import { ResearchNotebook, ResearchNote } from '../../types/modules';

export class NotebookService {
  static async getNotebooks(userId: string): Promise<ResearchNotebook[]> {
    try {
      const response = await fetch(`/api/notebooks?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async createNotebook(userId: string, title: string, description: string): Promise<ResearchNotebook | null> {
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, description }),
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async deleteNotebook(userId: string, notebookId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notebooks/${encodeURIComponent(notebookId)}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  static async getNotes(userId: string, notebookId?: string): Promise<ResearchNote[]> {
    try {
      const params = new URLSearchParams({ userId });
      if (notebookId) params.set('notebookId', notebookId);
      const response = await fetch(`/api/notes?${params}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async createNote(userId: string, note: Partial<ResearchNote>): Promise<ResearchNote | null> {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...note }),
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async deleteNote(userId: string, noteId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
