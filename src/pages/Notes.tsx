import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/ui/index.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { Search, Pencil, Trash2, Check, X } from 'lucide-react';
import { getTokenInfo } from '../lib/data/dictionary.js';

export const Notes = () => {
  const { t } = useTranslation();
  const { knowledge, setWordNote } = useKnowledge();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLemma, setEditingLemma] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const notesList = useMemo(() => {
    return Object.keys(knowledge)
      .filter((lemma) => typeof knowledge[lemma] === 'object' && (knowledge[lemma] as any).notes)
      .map((lemma) => {
        const info = knowledge[lemma] as any;
        const dict = getTokenInfo(lemma);
        return {
          lemma,
          term: dict?.term || lemma,
          notes: info.notes,
          languageId: info.languageId || 'unknown',
          lastUpdated: info.lastReviewed || new Date().toISOString(),
        };
      })
      .filter(
        (n) =>
          n.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [knowledge, searchQuery]);

  const startEdit = (lemma: string, currentNote: string) => {
    setEditingLemma(lemma);
    setEditValue(currentNote);
  };

  const saveEdit = (lemma: string, languageId: string) => {
    setWordNote(lemma, editValue, languageId);
    setEditingLemma(null);
  };

  const cancelEdit = () => {
    setEditingLemma(null);
    setEditValue('');
  };

  const deleteNote = (lemma: string, languageId: string) => {
    setWordNote(lemma, '', languageId);
  };

  return (
    <div className="p-6 md:p-12 pt-safe-page max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('notes.title', 'My Notes')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('notes.description', 'Your personal annotations on specific vocabulary.')}
        </p>
      </header>

      <div className="mb-8 relative max-w-lg">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={t('notes.search', 'Search notes...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-bdr rounded-2xl text-[14px] focus:outline-none focus:border-blue transition-colors shadow-sm"
        />
      </div>

      {notesList.length === 0 ? (
        <EmptyState
          illustration="quill"
          heading={t('notes.emptyHeading', 'No notes yet')}
          description={t(
            'notes.empty',
            'No notes found. You can add notes to words in the Reader.'
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notesList.map((note) => (
            <div
              key={note.lemma}
              className="card p-6 flex flex-col hover:border-blue/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-serif text-[20px] text-ink">{note.term}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingLemma !== note.lemma && (
                    <>
                      <button
                        onClick={() => startEdit(note.lemma, note.notes)}
                        className="p-1.5 rounded-lg text-muted hover:text-blue hover:bg-blue/5 transition-colors"
                        title={t('notes.edit', 'Edit note')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.lemma, note.languageId)}
                        className="p-1.5 rounded-lg text-muted hover:text-ruby hover:bg-ruby/5 transition-colors"
                        title={t('notes.delete', 'Delete note')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingLemma === note.lemma ? (
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full flex-1 min-h-[80px] p-3 bg-white border border-blue rounded-xl text-[14px] font-body resize-none focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(note.lemma, note.languageId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white rounded-lg text-[12px] font-bold hover:bg-blue/90 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> {t('notes.save', 'Save')}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-parch3 text-ink2 rounded-lg text-[12px] font-bold border border-bdr hover:bg-parch2 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> {t('notes.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-body text-[14px] text-ink2 whitespace-pre-wrap flex-1">
                  {note.notes}
                </p>
              )}

              <div className="mt-4 text-[10px] uppercase tracking-widest text-muted">
                {new Date(note.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
