import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, BookOpen, Plus, Trash2, Pencil, Check, X,
  Tag, Loader2, FileText, Clock,
} from "lucide-react";
import { useAuth } from "../lib/hooks/useAuth";
import { apiFetch } from "../lib/services/apiFetch";
import { formatDistanceToNow } from "date-fns";

interface Notebook {
  id: string;
  title: string;
  description?: string;
  languageId?: string;
  createdAt?: string;
}

interface Note {
  id: string;
  content: string;
  tags: string[];
  targetType?: string;
  lemma?: string;
  textId?: string | null;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(note.id);
  };

  const relativeTime = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : note.createdAt
    ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
    : null;

  return (
    <div className="card p-5 group hover:border-blue/30 transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {note.lemma && (
            <span className="font-serif text-[15px] text-blue font-bold">{note.lemma}</span>
          )}
          {note.targetType && note.targetType !== "free" && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue/10 text-blue">
              {note.targetType}
            </span>
          )}
          {note.source && note.source !== "manual" && (
            <span className="text-[10px] text-muted italic">{note.source}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-muted hover:text-blue hover:bg-blue/5 transition-colors"
            title="Edit note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap mb-3">{note.content}</p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-parch2 text-ink3 rounded-full border border-bdr/40"
            >
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      {relativeTime && (
        <div className="flex items-center gap-1 text-[10px] text-muted">
          <Clock className="w-3 h-3" />
          <span>{relativeTime}</span>
        </div>
      )}
    </div>
  );
}

function NoteEditor({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Note;
  onSave: (content: string, tags: string[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [tagInput, setTagInput] = useState(initial?.tags?.join(", ") ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const parsedTags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSave(content.trim(), parsedTags);
  };

  return (
    <div className="card p-5 border-blue/30 ring-1 ring-blue/10 space-y-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note…"
        rows={5}
        className="w-full px-4 py-3 bg-white border border-bdr rounded-xl text-[14px] font-body leading-relaxed resize-none focus:outline-none focus:border-blue transition-colors"
      />
      <div>
        <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 block">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="grammar, vocabulary, exegesis…"
          className="w-full px-4 py-2 border border-bdr rounded-xl text-[13px] focus:outline-none focus:border-blue transition-colors"
        />
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {parsedTags.map((t) => (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-blue/10 text-blue rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSaving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 disabled:opacity-50 transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {initial ? "Save changes" : "Add note"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 border border-bdr text-ink2 font-bold rounded-xl text-[13px] hover:bg-parch2 transition-all"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export const NotebookDetail = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotebook, setIsLoadingNotebook] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!notebookId || !user || isDemoMode) {
      setIsLoadingNotebook(false);
      setIsLoadingNotes(false);
      return;
    }
    apiFetch<Notebook>(`/api/notebooks/${notebookId}`)
      .then(setNotebook)
      .catch(() => navigate("/app/notebooks"))
      .finally(() => setIsLoadingNotebook(false));

    apiFetch<Note[]>(`/api/notes?notebookId=${notebookId}`)
      .then((data) =>
        setNotes(
          [...data].sort((a, b) => {
            const ta = a.updatedAt ?? a.createdAt ?? "";
            const tb = b.updatedAt ?? b.createdAt ?? "";
            return tb.localeCompare(ta);
          })
        )
      )
      .catch(() => setNotes([]))
      .finally(() => setIsLoadingNotes(false));
  }, [notebookId, user, isDemoMode, navigate]);

  const handleCreate = async (content: string, tags: string[]) => {
    if (!notebookId) return;
    setIsSaving(true);
    try {
      const note = await apiFetch<Note>("/api/notes", {
        method: "POST",
        body: { content, tags, notebookId, targetType: "free", source: "manual" },
      });
      note.createdAt = note.createdAt ?? new Date().toISOString();
      note.updatedAt = note.updatedAt ?? note.createdAt;
      setNotes((prev) => [note, ...prev]);
      setShowNewNote(false);
    } catch {
      /* ignore */
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (content: string, tags: string[]) => {
    if (!editingNote) return;
    setIsSaving(true);
    try {
      await apiFetch(`/api/notes/${editingNote.id}`, {
        method: "PATCH",
        body: { content, tags },
      });
      const now = new Date().toISOString();
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id ? { ...n, content, tags, updatedAt: now } : n
        )
      );
      setEditingNote(null);
    } catch {
      /* ignore */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  if (isLoadingNotebook) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
      </div>
    );
  }

  if (!notebook) return null;

  const isLoading = isLoadingNotes;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      {/* Back */}
      <button
        onClick={() => navigate("/app/notebooks")}
        className="flex items-center gap-1.5 text-muted hover:text-ink text-[13px] font-medium mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> All Notebooks
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center text-blue shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[26px] font-serif font-bold text-ink leading-tight">{notebook.title}</h2>
            {notebook.description && (
              <p className="text-[14px] text-ink2 mt-0.5">{notebook.description}</p>
            )}
            <p className="text-[12px] text-muted mt-1">
              {isLoading ? "Loading…" : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowNewNote(true); setEditingNote(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* New note form */}
      {showNewNote && (
        <div className="mb-6">
          <NoteEditor
            onSave={handleCreate}
            onCancel={() => setShowNewNote(false)}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
        </div>
      ) : notes.length === 0 && !showNewNote ? (
        <div className="text-center py-16 text-ink2">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted" />
          <p className="text-[16px] mb-4">No notes in this notebook yet.</p>
          <button
            onClick={() => setShowNewNote(true)}
            className="px-6 py-2.5 bg-ink text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Add Your First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) =>
            editingNote?.id === note.id ? (
              <NoteEditor
                key={note.id}
                initial={note}
                onSave={handleEdit}
                onCancel={() => setEditingNote(null)}
                isSaving={isSaving}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => { setEditingNote(n); setShowNewNote(false); }}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

      {isDemoMode && (
        <div className="mt-8 card p-5 text-center text-ink2 border-dashed border-2 border-bdr/40 bg-parch2/50">
          <p className="text-[14px]">Sign in to save notes across sessions.</p>
        </div>
      )}
    </div>
  );
};
