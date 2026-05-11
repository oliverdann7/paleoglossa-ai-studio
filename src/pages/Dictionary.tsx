import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookOpen, ExternalLink, Library, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DictionaryEntry,
  findDictionaryEntry,
  getDictionaryLanguages,
  searchDictionaryEntries,
} from '@/lib/data/dictionary';

const isRtlLanguage = (languageId: string) => ['hbo', 'arc', 'syr', 'egy'].includes(languageId);

const entryPath = (entry: DictionaryEntry) =>
  `/app/dictionary/${encodeURIComponent(entry.languageId)}/${encodeURIComponent(entry.lemma)}`;

function EntryCard({ entry }: { entry: DictionaryEntry }) {
  const isRtl = isRtlLanguage(entry.languageId);

  return (
    <section className="card p-6 md:p-8 bg-[#FEFAF4] border-bdr/60">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow text-blue mb-3">Dictionary Entry</div>
          <h2
            className={cn('text-[42px] md:text-[56px] font-serif leading-none text-ink', isRtl ? 'font-hebrew' : '')}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <bdi>{entry.lemma}</bdi>
          </h2>
          {entry.transliteration && (
            <p className="font-body italic text-muted mt-2">{entry.transliteration}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <span className="pill cefr-b text-[11px] font-bold">{entry.language}</span>
          {entry.partOfSpeech && (
            <span className="px-3 py-1 rounded-full border border-bdr/60 bg-parch text-[11px] font-bold uppercase tracking-wider text-ink3">
              {entry.partOfSpeech}
            </span>
          )}
          <span className="px-3 py-1 rounded-full border border-bdr/60 bg-white text-[11px] font-bold uppercase tracking-wider text-muted">
            {entry.frequency} tokens
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
        <div className="p-5 rounded-[20px] bg-parch/40 border border-bdr/30">
          <div className="eyebrow mb-3 text-ink">Definition</div>
          <p className="font-body text-[22px] text-ink leading-snug mb-4">{entry.shortGloss}</p>
          <p className="font-body text-[15px] text-ink2 leading-relaxed">{entry.fullDefinition}</p>
        </div>

        <div className="p-5 rounded-[20px] bg-parch2/30 border border-bdr/30">
          <div className="eyebrow mb-3 text-ink">Lexical Data</div>
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Semantic domain</dt>
              <dd className="font-bold text-ink text-right">{entry.semanticDomain.join(', ') || 'Unclassified'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Related forms</dt>
              <dd className="font-bold text-ink text-right">{entry.relatedForms.slice(0, 6).join(', ') || 'No forms yet'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mb-8">
        <div className="eyebrow mb-4 flex items-center justify-between text-ink">
          <span>Corpus Examples</span>
          <span className="text-blue">{entry.corpusExamples.length} shown</span>
        </div>
        {entry.corpusExamples.length > 0 ? (
          <div className="space-y-3">
            {entry.corpusExamples.map(example => (
              <Link
                key={example.id}
                to={`/app/reader/${encodeURIComponent(example.textId)}?lemma=${encodeURIComponent(entry.lemma)}&sentence=${encodeURIComponent(example.sentenceId)}`}
                className="block p-4 rounded-2xl border border-bdr/30 bg-white hover:border-blue/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue">{example.textTitle}</span>
                  <span className="text-[11px] text-muted">Open in reader</span>
                </div>
                <p className={cn('font-serif text-[17px] text-ink2 mb-2', isRtl ? 'font-hebrew' : '')} dir={isRtl ? 'rtl' : 'ltr'}>
                  {example.sentenceText}
                </p>
                {example.translation && (
                  <p className="font-body text-[12px] italic text-muted">{example.translation}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-bdr/50 bg-parch/30 text-muted text-[14px]">
            No corpus examples are available for this lemma yet.
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-parch/40 border border-bdr/30">
        <div className="eyebrow mb-2 text-ink">Source / License</div>
        <div className="space-y-2">
          {entry.dictionaries.map(source => (
            <div key={source.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[12px] text-ink2">
              <span>
                <span className="font-bold">{source.name}</span>
                <span className="text-muted"> · {source.licenseName}</span>
              </span>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue font-bold hover:text-ink">
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Dictionary = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || params.lemma || '');
  const [languageId, setLanguageId] = useState(searchParams.get('lang') || params.languageId || '');

  const languages = useMemo(() => getDictionaryLanguages(), []);
  const results = useMemo(() => searchDictionaryEntries(query, languageId || undefined, 80), [query, languageId]);
  const selectedEntry = useMemo(() => {
    if (params.lemma) return findDictionaryEntry(params.lemma, params.languageId);
    return results[0] || null;
  }, [params.lemma, params.languageId, results]);

  useEffect(() => {
    const next: Record<string, string> = {};
    if (query) next.q = query;
    if (languageId) next.lang = languageId;
    setSearchParams(next, { replace: true });
  }, [query, languageId, setSearchParams]);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">Dictionary Hub</h1>
          <p className="font-body text-[15px] italic text-ink2 max-w-2xl">
            Lemma-aware lookup connected to real corpus examples, reader occurrences, and source metadata.
          </p>
        </div>
        <Link to="/app/library" className="btn-primary px-5 py-2.5 inline-flex items-center justify-center gap-2">
          <Library className="w-4 h-4" /> Browse Corpus
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <aside className="card p-4 bg-parch2/30 border-bdr/50 sticky top-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lemma, form, or gloss..."
              className="w-full pl-9 pr-4 py-3 bg-white border border-bdr rounded-[14px] text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
            />
          </div>

          <select
            value={languageId}
            onChange={(event) => setLanguageId(event.target.value)}
            className="w-full mb-5 px-3 py-3 bg-white border border-bdr rounded-[14px] text-[13px] text-ink3 focus:outline-none focus:border-blue"
          >
            <option value="">All languages</option>
            {languages.map(language => (
              <option key={language.id} value={language.id}>{language.name}</option>
            ))}
          </select>

          <div className="eyebrow mb-3 flex items-center justify-between text-ink">
            <span>Results</span>
            <span className="text-blue">{results.length}</span>
          </div>

          <div className="max-h-[62vh] overflow-y-auto space-y-2 pr-1">
            {results.map(entry => {
              const active = selectedEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => navigate(entryPath(entry))}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all',
                    active ? 'bg-bluexl border-blue/30 shadow-sm' : 'bg-white border-bdr/30 hover:border-blue/20 hover:bg-parch/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-serif text-[22px] text-ink leading-none"><bdi>{entry.lemma}</bdi></span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted">{entry.language}</span>
                  </div>
                  <p className="text-[13px] text-ink2 line-clamp-2">{entry.shortGloss}</p>
                  <p className="text-[10px] text-muted mt-1">{entry.relatedForms.slice(0, 3).join(', ')}</p>
                </button>
              );
            })}

            {results.length === 0 && (
              <div className="p-6 text-center text-muted border border-dashed border-bdr/50 rounded-2xl bg-white">
                No dictionary entries found.
              </div>
            )}
          </div>
        </aside>

        {selectedEntry ? (
          <EntryCard entry={selectedEntry} />
        ) : (
          <section className="card p-12 text-center border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center gap-4">
            <BookOpen className="w-12 h-12 text-muted" />
            <p className="text-ink3 max-w-md">Search by lemma, surface form, transliteration, or gloss to open a dictionary entry.</p>
          </section>
        )}
      </div>
    </div>
  );
};
