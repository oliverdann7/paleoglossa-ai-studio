import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, FileText, Globe, BookMarked, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "../lib/services/apiFetch";
import { useTranslation } from "react-i18next";
import { LoadingState, EmptyState } from "../components/ui";

interface SearchResult {
  id: string;
  title?: string;
  term?: string;
  lemma?: string;
  source: string;
  languageId?: string;
  snippet?: string;
  textId?: string;
  authorName?: string;
}

const SOURCE_ICONS: Record<string, any> = { import: FileText, vocabulary: BookMarked, note: MessageSquare, public: Globe };

export const SearchPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const data = await apiFetch<SearchResult[]>('/api/search', { method: 'POST', body: { query: query.trim() } });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-2">{t("search.title", "Search")}</h2>
      <p className="text-ink2 text-[15px] mb-6">{t("search.description", "Search across the entire corpus by lemma, inflected form, or morphology.")}</p>

      <form onSubmit={handleSearch} className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={t("search.placeholder", "Search by lemma, text, gloss, or note…")}
          className="w-full pl-12 pr-4 py-3 bg-white border border-bdr rounded-xl text-[15px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
        />
      </form>

      {isLoading && <LoadingState />}

      {!isLoading && searched && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon className="w-12 h-12" />}
          heading={t("search.noResults", "No results found.")}
        />
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => {
            const Icon = SOURCE_ICONS[r.source] || FileText;
            return (
              <div key={`${r.source}-${r.id}-${i}`}
                className={cn("card p-4 flex items-start gap-4 hover:border-blue/30 transition-all cursor-pointer",
                  r.source === 'public' && "border-emerald-200/50")}
                onClick={() => {
                  if (r.textId) navigate(`/app/reader/${r.textId}`);
                  else if (r.lemma) navigate(`/app/dictionary/${r.languageId || 'grc'}/${encodeURIComponent(r.lemma)}`);
                }}
              >
                <Icon className="w-5 h-5 mt-0.5 text-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-ink truncate">{r.title || r.term || r.lemma}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted bg-parch3 px-2 py-0.5 rounded-full shrink-0">
                      {r.source === 'import' ? t("search.sourceImport", "Your Import") : r.source === 'vocabulary' ? t("search.sourceVocabulary", "Vocabulary") : r.source === 'note' ? t("search.sourceNote", "Note") : r.source === 'public' ? t("search.sourcePublicLibrary", "Public Library") : r.source}
                    </span>
                  </div>
                  {r.snippet && <p className="text-[13px] text-ink2 line-clamp-2">{r.snippet}</p>}
                  {r.languageId && <span className="text-[10px] text-muted mt-1 block">{r.languageId}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
