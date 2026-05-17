import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, GraduationCap, Loader2, Search, Tag, BookOpen, Layers, MessageSquare, AlignLeft, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Paradigm {
  caption: string;
  headers: string[];
  rows: { label: string; cells: string[] }[];
}

interface Concept {
  id: string;
  title: string;
  languageId: string;
  category: string;
  difficulty: string;
  explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  paradigm?: Paradigm;
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
  san: 'Sanskrit',
};

const RTL = new Set(['hbo', 'arc', 'syr']);

const CATEGORY_LABELS: Record<string, string> = {
  nouns: 'Nouns',
  verbs: 'Verbs',
  syntax: 'Syntax',
  particles: 'Particles',
  morphology: 'Morphology',
  pronouns: 'Pronouns',
  other: 'Other',
};

type IconComponent = React.ComponentType<{ className?: string }>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  nouns: BookOpen,
  verbs: Layers,
  syntax: AlignLeft,
  particles: MessageSquare,
  morphology: Hash,
  pronouns: Tag,
  other: GraduationCap,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue/10 text-blue',
  advanced: 'bg-amber/10 text-amber-700',
};

function ParadigmTable({ paradigm, rtl }: { paradigm: Paradigm; rtl: boolean }) {
  return (
    <div className="overflow-x-auto mt-6">
      <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-2">{paradigm.caption}</p>
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr>
            {paradigm.headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "px-3 py-2 text-left border border-bdr bg-parch2 font-bold text-ink2 text-[11px] uppercase tracking-wider",
                  i > 0 && rtl ? "text-right" : "",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paradigm.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-parch2/40"}>
              <td className="px-3 py-2 border border-bdr font-bold text-muted text-[11px] uppercase tracking-wider whitespace-nowrap">
                {row.label}
              </td>
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn("px-3 py-2 border border-bdr font-serif text-[15px] text-ink", rtl ? "text-right" : "")}
                  dir={rtl ? "rtl" : "ltr"}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConceptDetail({ concept, onBack }: { concept: Concept; onBack: () => void }) {
  const { t } = useTranslation();
  const rtl = RTL.has(concept.languageId);
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen">
      <button
        onClick={onBack}
        className="text-muted hover:text-ink flex items-center gap-1 mb-6 transition-colors text-[13px]"
      >
        <ChevronLeft className="w-4 h-4" /> {t('grammar.back', 'Back to Concepts')}
      </button>

      <div className="flex flex-wrap items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[24px] font-serif font-bold text-ink leading-tight">{concept.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[12px] text-muted">{LANG_LABELS[concept.languageId] || concept.languageId}</span>
            <span className="text-muted">·</span>
            <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full", DIFFICULTY_STYLES[concept.difficulty] ?? 'bg-parch2 text-ink3')}>
              {concept.difficulty}
            </span>
            <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
              concept.status === 'complete' ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber"
            )}>
              {concept.status}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <p className="text-[15px] text-ink2 leading-[1.9] whitespace-pre-wrap">{concept.explanation}</p>
      </div>

      {concept.paradigm && (
        <div className="card p-5 mb-6">
          <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest mb-1">Paradigm Table</h3>
          <ParadigmTable paradigm={concept.paradigm} rtl={rtl} />
        </div>
      )}

      {concept.relatedMorphKeys.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {concept.relatedMorphKeys.map(k => (
            <span key={k} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue/10 text-blue rounded-full">
              <Tag className="w-3 h-3" /> {k}
            </span>
          ))}
        </div>
      )}

      {concept.examples.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-ink mb-3 uppercase tracking-widest">
            {t('grammar.examples', 'Examples')}
          </h3>
          <div className="space-y-2">
            {concept.examples.map((ex, i) => (
              <div key={i} className="card p-4 flex gap-4 items-start">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue/10 text-blue text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[19px] font-serif text-ink mb-0.5 leading-snug"
                    dir={rtl ? 'rtl' : 'ltr'}
                  >
                    {ex.surface}
                  </div>
                  <div className="text-[13px] text-blue italic">{ex.gloss}</div>
                  {ex.translation && <div className="text-[12px] text-muted mt-0.5">{ex.translation}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function FilterPill({
  children,
  active,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all",
        active
          ? variant === 'primary' ? "bg-blue text-white" : "bg-ink text-white"
          : "bg-parch2 text-ink3 hover:bg-parch3",
      )}
    >
      {children}
    </button>
  );
}

function ConceptCard({ concept, onClick }: { concept: Concept; onClick: () => void }) {
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;
  const hasParadigm = Boolean(concept.paradigm);

  return (
    <button
      onClick={onClick}
      className="card p-5 hover:border-blue/30 hover:shadow-md transition-all text-left group w-full"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-ink mb-0.5 line-clamp-1">{concept.title}</h3>
          <p className="text-[11px] text-muted mb-2">{LANG_LABELS[concept.languageId] || concept.languageId}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
              DIFFICULTY_STYLES[concept.difficulty] ?? 'bg-parch2 text-ink3'
            )}>
              {concept.difficulty}
            </span>
            {hasParadigm && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-parch3 text-muted rounded-md">table</span>
            )}
            <span className="text-[10px] text-muted">{concept.examples.length} ex.</span>
            {concept.relatedMorphKeys.slice(0, 2).map(k => (
              <span key={k} className="text-[10px] font-bold px-1.5 py-0.5 bg-blue/10 text-blue rounded-md">{k}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const Grammar = () => {
  const { t } = useTranslation();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLang, setActiveLang] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const categories = useMemo(() => {
    const seen = new Set<string>();
    concepts.forEach(c => { if (c.category) seen.add(c.category); });
    return Array.from(seen);
  }, [concepts]);

  const filtered = useMemo(() => {
    return concepts.filter(c => {
      const matchesLang = activeLang === "all" || c.languageId === activeLang;
      const matchesCategory = activeCategory === "all" || c.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q
        || c.title.toLowerCase().includes(q)
        || c.explanation.toLowerCase().includes(q)
        || c.relatedMorphKeys.some(k => k.toLowerCase().includes(q));
      return matchesLang && matchesCategory && matchesSearch;
    });
  }, [concepts, activeLang, activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all" || searchQuery) return null;
    const map = new Map<string, Concept[]>();
    for (const c of filtered) {
      const key = c.category ?? 'other';
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [filtered, activeCategory, searchQuery]);

  if (isLoading) return (
    <div className="p-12 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
    </div>
  );

  if (selected) return <ConceptDetail concept={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[28px] font-serif font-light text-ink tracking-tight">
            {t('grammar.title', 'Grammar Atlas')}
          </h2>
          <p className="text-ink2 text-[12px]">
            {t('grammar.subtitle', 'Curated grammar concepts for classical languages.')}
          </p>
        </div>
      </header>

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
      <div className="flex flex-wrap gap-2 mb-3">
        <FilterPill active={activeLang === "all"} onClick={() => setActiveLang("all")}>All Languages</FilterPill>
        {languages.map(lang => (
          <FilterPill key={lang} active={activeLang === lang} onClick={() => setActiveLang(lang)}>
            {LANG_LABELS[lang] || lang}
          </FilterPill>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill active={activeCategory === "all"} onClick={() => setActiveCategory("all")} variant="secondary">
          All Categories
        </FilterPill>
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] ?? GraduationCap;
          return (
            <FilterPill key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} variant="secondary">
              <Icon className="w-3 h-3" /> {CATEGORY_LABELS[cat] || cat}
            </FilterPill>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[14px]">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t('grammar.noResults', 'No concepts match your search.')}</p>
        </div>
      ) : grouped ? (
        // Grouped by category view (default)
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([cat, items]) => {
            const Icon = CATEGORY_ICONS[cat] ?? GraduationCap;
            return (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    {CATEGORY_LABELS[cat] || cat}
                  </h3>
                  <span className="text-[10px] text-muted/60 font-bold">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map(c => <ConceptCard key={c.id} concept={c} onClick={() => setSelected(c)} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Flat filtered view
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(c => <ConceptCard key={c.id} concept={c} onClick={() => setSelected(c)} />)}
        </div>
      )}

      <p className="text-center text-muted text-[12px] mt-10 italic">
        {t('grammar.footer', 'More concepts will be added as the corpus grows.')}
      </p>
    </div>
  );
};
