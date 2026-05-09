import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { Search } from 'lucide-react';
import { getTokenInfo } from '../lib/data/dictionary';

export const Notes = () => {
  const { t } = useTranslation();
  const { knowledge } = useKnowledge();
  const [searchQuery, setSearchQuery] = useState("");

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
          lastUpdated: info.lastReviewed || new Date().toISOString()
        };
      })
      .filter((n) => n.term.toLowerCase().includes(searchQuery.toLowerCase()) || n.notes?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [knowledge, searchQuery]);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t("notes.title", "My Notes")}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t("notes.description", "Your personal annotations on specific vocabulary.")}
        </p>
      </header>
      
      <div className="mb-8 relative max-w-lg">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={t("notes.search", "Search notes...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-bdr rounded-2xl text-[14px] focus:outline-none focus:border-blue transition-colors shadow-sm"
        />
      </div>

      {notesList.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <p>{t("notes.empty", "No notes found. You can add notes to words in the Reader.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notesList.map((note) => (
            <div key={note.lemma} className="card p-6 flex flex-col hover:border-blue/30 transition-colors">
              <h3 className="font-serif text-[20px] text-ink mb-2">{note.term}</h3>
              <p className="font-body text-[14px] text-ink2 whitespace-pre-wrap flex-1">{note.notes}</p>
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
