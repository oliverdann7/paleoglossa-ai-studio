import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, GraduationCap, Loader2, Search, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Concept {
  id: string;
  title: string;
  languageId: string;
  explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  relatedMorphKeys: string[];
  status: string;
}

const LANG_LABELS: Record<string, string> = {
  grc: 'Ancient Greek',
  'grc-koine': 'Koine Greek',
  hbo: 'Hebrew',
  lat: 'Latin',
  syr: 'Syriac',
  cop: 'Coptic',
  arc: 'Aramaic',
};

const RTL = new Set(['hbo', 'arc', 'syr']);

export const Grammar = () => {
  const { t } = useTranslation();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLang, setActiveLang] = useState<string>("all");

  useEffect(() => {
    fetch('/api/grammar/concepts')
      .then(r => r.json())
      .then(data => { setConcepts(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const languages = useMemo(() => {
    const seen = new Set<string>();
    concepts.forEach(c => seen.add(c.languageId));
    return Array.from(seen);
  }, [concepts]);

  const filtered = useMemo(() => {
    return concepts.filter(c => {
      const matchesLang = activeLang === "all" || c.languageId === activeLang;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q) || c.relatedMorphKeys.some(k => k.toLowerCase().includes(q));
      return matchesLang && matchesSearch;
    });
  }, [concepts, activeLang, searchQuery]);

  if (isLoading) return (
    <div className="p-12 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
    </div>
  );

  if (selected) return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen">
      <button
        onClick={() => setSelected(null)}
        className="text-muted hover:text-ink flex items-center gap-1 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> {t('grammar.back', 'Back to Concepts')}
      </button>

      <div className="flex flex-wrap items-start gap-3 mb-6">
        <div>
          <h2 className="text-[26px] font-serif font-bold text-ink">{selected.title}</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {LANG_LABELS[selected.languageId] || selected.languageId}
          </p>
        </div>
        <span className={cn(
          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full self-start mt-1",
          selected.status === 'complete' ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber"
        )}>
          {selected.status}
        </span>
      </div>

      <div className="card p-6 mb-6">
        <p className="text-[15px] text-ink2 leading-[1.9] whitespace-pre-wrap">{selected.explanation}</p>
      </div>

      {selected.relatedMorphKeys.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selected.relatedMorphKeys.map(k => (
            <span key={k} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue/10 text-blue rounded-full">
              <Tag className="w-3 h-3" /> {k}
            </span>
          ))}
        </div>
      )}

      {selected.examples.length > 0 && (
        <div>
          <h3 className="text-[13px] font-bold text-ink mb-3 uppercase tracking-widest">
            {t('grammar.examples', 'Examples')}
          </h3>
          <div className="space-y-3">
            {selected.examples.map((ex, i) => (
              <div key={i} className="card p-4">
                <div
                  className="text-[20px] font-serif text-ink mb-1"
                  dir={RTL.has(selected.languageId) ? 'rtl' : 'ltr'}
                >
                  {ex.surface}
                </div>
                <div className="text-[13px] text-blue italic">{ex.gloss}</div>
                {ex.translation && <div className="text-[13px] text-muted mt-0.5">{ex.translation}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-1">
        {t('grammar.title', 'Grammar Atlas')}
      </h2>
      <p className="text-ink2 text-[14px] mb-6">
        {t('grammar.subtitle', 'Curated grammar concepts for classical languages.')}
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('grammar.search', 'Search concepts…')}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-bdr rounded-xl text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
        />
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveLang("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all",
            activeLang === "all" ? "bg-blue text-white" : "bg-parch2 text-ink3 hover:bg-parch3"
          )}
        >
          {t('grammar.all', 'All')}
        </button>
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all",
              activeLang === lang ? "bg-blue text-white" : "bg-parch2 text-ink3 hover:bg-parch3"
            )}
          >
            {LANG_LABELS[lang] || lang}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[14px]">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t('grammar.noResults', 'No concepts match your search.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="card p-5 hover:border-blue/30 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-blue mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-ink mb-0.5 truncate">{c.title}</h3>
                  <p className="text-[11px] text-muted mb-2">{LANG_LABELS[c.languageId] || c.languageId}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                      c.status === 'complete' ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber"
                    )}>
                      {c.status}
                    </span>
                    <span className="text-[11px] text-muted">{c.examples.length} examples</span>
                    {c.relatedMorphKeys.slice(0, 2).map(k => (
                      <span key={k} className="text-[10px] font-bold px-1.5 py-0.5 bg-blue/10 text-blue rounded-md">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-muted text-[12px] mt-8 italic">
        {t('grammar.footer', 'More concepts will be added as the corpus grows.')}
      </p>
    </div>
  );
};
