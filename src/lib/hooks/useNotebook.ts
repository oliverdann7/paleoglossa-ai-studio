import { useState, useEffect, useCallback } from 'react';
import { ResearchNote } from '../../types/modules.js';
import { NotebookService, CreateNoteInput } from '../services/notebookService.js';
import { useAuth } from './useAuth.js';

interface UseNotebookOptions {
  notebookId?: string;
  languageId?: string;
  /** Skip fetching notes on mount (useful when only saving is needed) */
  skipFetch?: boolean;
}

interface UseNotebookReturn {
  notes: ResearchNote[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveNote: (input: CreateNoteInput) => Promise<ResearchNote | null>;
  deleteNote: (noteId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useNotebook(options: UseNotebookOptions = {}): UseNotebookReturn {
  const { notebookId, languageId, skipFetch } = options;
  const { user, isDemoMode } = useAuth();

  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isLoading, setIsLoading] = useState(!skipFetch);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user || isDemoMode) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await NotebookService.getNotes({ notebookId, languageId });
      setNotes(fetched);
    } catch {
      setError('Failed to load notes.');
    } finally {
      setIsLoading(false);
    }
  }, [user, isDemoMode, notebookId, languageId]);

  useEffect(() => {
    if (!skipFetch) fetch(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetch, skipFetch]);

  const saveNote = useCallback(async (input: CreateNoteInput): Promise<ResearchNote | null> => {
    if (!user || isDemoMode) return null;
    setIsSaving(true);
    setError(null);
    try {
      const created = await NotebookService.createNote(input);
      if (created) {
        setNotes(prev => [created, ...prev]);
      }
      return created;
    } catch {
      setError('Failed to save note.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, isDemoMode]);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const ok = await NotebookService.deleteNote(noteId);
      if (ok) setNotes(prev => prev.filter(n => n.id !== noteId));
      return ok;
    } catch {
      return false;
    }
  }, [user]);

  return { notes, isLoading, isSaving, error, saveNote, deleteNote, refresh: fetch };
}
