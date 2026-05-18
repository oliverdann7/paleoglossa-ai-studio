import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Fuse from 'fuse.js';
import {
  ChevronLeft,
  BookOpen,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Tag,
  Loader2,
  FileText,
  Clock,
  Search,
  Download,
  Printer,
  Eye,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/hooks/useAuth.js';
import { apiFetch } from '../lib/services/apiFetch.js';
import { formatDistanceToNow } from 'date-fns';

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

function parseWikilinks(content: string): string {
  return content
    .replace(
      /\[\[text:([^\]|]+)\|?([^\]]*)\]\]/g,
      (_, id, label) => `[${label || id}](/app/reader/${id})`
    )
    .replace(
      /\[\[([^\]|:]+)\|?([^\]]*)\]\]/g,
      (_, lemma, label) => `[${label || lemma}](/app/dictionary/grc/${encodeURIComponent(lemma)})`
    );
}

function WikilinkAnchor({ href, children }: { href?: string; children?: React.ReactNode }) {
  const navigate = useNavigate();
  if (href?.startsWith('/app/')) {
    return (
      <span
        onClick={() => navigate(href)}
        className="text-blue underline cursor-pointer hover:opacity-80 transition-opacity font-serif"
      >
        {children}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue underline">
      {children}
    </a>
  );
}

function NoteCard({
  note,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const relativeTime = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : note.createdAt
      ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
      : null;

  const preview = note.content.replace(/[#*`[\]]/g, '').slice(0, 120);

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-b border-bdr/30 cursor-pointer transition-colors group',
        isSelected ? 'bg-blue/5 border-l-2 border-l-blue' : 'hover:bg-parch3/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-ink line-clamp-2 flex-1">
          {preview || 'Empty note'}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1 text-muted hover:text-blue rounded"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 text-muted hover:text-red-500 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {note.lemma && (
        <span className="text-[11px] font-mono text-blue mt-1 block">{note.lemma}</span>
      )}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold uppercase tracking-wider bg-parch3 text-muted px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {relativeTime && <p className="text-[10px] text-muted mt-1.5">{relativeTime}</p>}
    </div>
  );
}

function NoteEditor({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Note | null;
  onSave: (content: string, tags: string[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');
  const [showPreview, setShowPreview] = useState(false);

  const tags = tagInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-bdr/30 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
          {initial ? 'Edit Note' : 'New Note'}
        </span>
        <button
          onClick={() => setShowPreview((p) => !p)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors',
            showPreview ? 'bg-blue/10 text-blue' : 'text-muted hover:text-ink'
          )}
        >
          {showPreview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div className="h-full overflow-y-auto p-4 prose prose-sm max-w-none">
            <ReactMarkdown components={{ a: WikilinkAnchor as any }}>
              {parseWikilinks(content) || '_Nothing to preview_'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              'Write your note in Markdown...\n\nLink to a word: [[λύω]]\nLink to a text: [[text:textId|Title]]\n\n# Heading\n**bold**, *italic*, `code`'
            }
            className="w-full h-full p-4 resize-none font-mono text-[13px] text-ink bg-transparent focus:outline-none leading-relaxed"
          />
        )}
      </div>

      <div className="border-t border-bdr/30 px-4 py-2 space-y-2 shrink-0">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="w-full text-[12px] px-3 py-1.5 border border-bdr/40 rounded-lg bg-white/50 focus:outline-none focus:border-blue"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSave(content, tags)}
            disabled={isSaving || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue text-white rounded-lg text-[12px] font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-parch3 text-ink2 rounded-lg text-[12px] font-bold border border-bdr hover:bg-parch2 transition-colors"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteViewer({ note, onEdit }: { note: Note; onEdit: () => void }) {
  const relativeTime = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : null;

  const exportMd = () => {
    const header = note.tags.length > 0 ? `---\ntags: [${note.tags.join(', ')}]\n---\n\n` : '';
    const blob = new Blob([header + note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-${note.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-bdr/30 shrink-0">
        <div className="flex items-center gap-2">
          {note.lemma && (
            <span className="font-mono text-[12px] text-blue font-bold">{note.lemma}</span>
          )}
          {relativeTime && <span className="text-[10px] text-muted">{relativeTime}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={exportMd}
            title="Download as Markdown"
            className="p-1.5 text-muted hover:text-ink rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.print()}
            title="Print / Save as PDF"
            className="p-1.5 text-muted hover:text-ink rounded transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2 py-1 bg-blue/10 text-blue rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue/20 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown components={{ a: WikilinkAnchor as any }}>
            {parseWikilinks(note.content)}
          </ReactMarkdown>
        </div>
      </div>

      {note.tags.length > 0 && (
        <div className="border-t border-bdr/20 px-4 py-2 flex flex-wrap gap-1.5 shrink-0">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-parch3 text-muted px-2 py-0.5 rounded-full border border-bdr/30"
            >
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>
      )}
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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (!notebookId || !user || isDemoMode) {
      setIsLoadingNotebook(false); // eslint-disable-line react-hooks/set-state-in-effect
      setIsLoadingNotes(false);
      return;
    }
    apiFetch<Notebook>(`/api/notebooks/${notebookId}`)
      .then(setNotebook)
      .catch(() => navigate('/app/notebooks'))
      .finally(() => setIsLoadingNotebook(false));

    apiFetch<Note[]>(`/api/notes?notebookId=${notebookId}`)
      .then((data) =>
        setNotes(
          [...data].sort((a, b) =>
            (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '')
          )
        )
      )
      .catch(() => setNotes([]))
      .finally(() => setIsLoadingNotes(false));
  }, [notebookId, user, isDemoMode, navigate]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ['content', 'lemma', 'tags'],
        threshold: 0.35,
      }),
    [notes]
  );

  const filteredNotes = useMemo(() => {
    let result = searchQuery.trim() ? fuse.search(searchQuery).map((r) => r.item) : notes;
    if (activeTag) result = result.filter((n) => n.tags.includes(activeTag));
    return result;
  }, [notes, searchQuery, activeTag, fuse]);

  const exportAllMd = useCallback(() => {
    if (!notebook) return;
    const body = notes
      .map((n) => {
        const meta = n.tags.length > 0 ? `---\ntags: [${n.tags.join(', ')}]\n---\n\n` : '';
        return `${meta}${n.content}`;
      })
      .join('\n\n---\n\n');
    const blob = new Blob([`# ${notebook.title}\n\n${body}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notebook, notes]);

  const handleCreate = async (content: string, tags: string[]) => {
    if (!notebookId) return;
    setIsSaving(true);
    try {
      const note = await apiFetch<Note>('/api/notes', {
        method: 'POST',
        body: { content, tags, notebookId, targetType: 'free', source: 'manual' },
      });
      note.createdAt = note.createdAt ?? new Date().toISOString();
      note.updatedAt = note.updatedAt ?? note.createdAt;
      setNotes((prev) => [note, ...prev]);
      setIsCreating(false);
      setSelectedNote(note);
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
      await apiFetch(`/api/notes/${editingNote.id}`, { method: 'PATCH', body: { content, tags } });
      const now = new Date().toISOString();
      const updated = { ...editingNote, content, tags, updatedAt: now };
      setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
      setSelectedNote(updated);
      setEditingNote(null);
    } catch {
      /* ignore */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      if (editingNote?.id === id) setEditingNote(null);
    } catch {
      /* ignore */
    }
  };

  const startNewNote = () => {
    setIsCreating(true);
    setEditingNote(null);
    setSelectedNote(null);
  };
  const showEditor = isCreating || editingNote !== null;
  const rightPanelNote = editingNote ?? selectedNote;

  if (isLoadingNotebook) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
      </div>
    );
  }
  if (!notebook) return null;

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bdr/40 bg-parch/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/notebooks')}
            className="flex items-center gap-1 text-muted hover:text-ink text-[12px] font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Notebooks
          </button>
          <span className="text-muted">/</span>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue" />
            <h1 className="text-[15px] font-bold text-ink">{notebook.title}</h1>
            <span className="text-[11px] text-muted">({notes.length})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAllMd}
            title="Export as Markdown"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-ink border border-bdr/40 rounded-lg hover:bg-parch3 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={startNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white font-bold rounded-lg text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — note list */}
        <div className="w-72 shrink-0 border-r border-bdr/40 flex flex-col bg-parch/40 overflow-hidden">
          <div className="p-3 border-b border-bdr/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white/70 border border-bdr/30 rounded-lg focus:outline-none focus:border-blue transition-colors"
              />
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="px-3 py-2 border-b border-bdr/20 flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors border',
                    activeTag === tag
                      ? 'bg-blue text-white border-blue'
                      : 'bg-parch3 text-muted border-bdr/30 hover:border-blue/40'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoadingNotes ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue mx-auto" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-[12px]">
                  {searchQuery || activeTag ? 'No matching notes' : 'No notes yet'}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id && !showEditor}
                  onClick={() => {
                    setSelectedNote(note);
                    setEditingNote(null);
                    setIsCreating(false);
                  }}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setIsCreating(false);
                    setSelectedNote(null);
                  }}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          <div className="border-t border-bdr/20 px-3 py-2 flex items-center gap-2 text-[10px] text-muted shrink-0">
            <Clock className="w-3 h-3" />
            <span>
              {filteredNotes.length} of {notes.length} notes
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/40">
          {showEditor ? (
            <NoteEditor
              initial={editingNote}
              onSave={editingNote ? handleEdit : handleCreate}
              onCancel={() => {
                setIsCreating(false);
                setEditingNote(null);
              }}
              isSaving={isSaving}
            />
          ) : rightPanelNote ? (
            <NoteViewer
              note={rightPanelNote}
              onEdit={() => {
                setEditingNote(rightPanelNote);
                setSelectedNote(null);
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
              <FileText className="w-10 h-10 opacity-30" />
              <p className="text-[14px]">Select a note or create a new one</p>
              <button
                onClick={startNewNote}
                className="text-[12px] text-blue font-bold underline hover:no-underline"
              >
                New Note
              </button>
            </div>
          )}
        </div>
      </div>

      {isDemoMode && (
        <div className="border-t border-bdr/20 p-3 text-center text-[12px] text-muted bg-parch/50 shrink-0">
          Sign in to save notes across sessions.
        </div>
      )}
    </div>
  );
};
