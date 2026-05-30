import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookOpen, ExternalLink, Library, Search, AlignLeft, Table2, Sparkles, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveLanguage } from '@/lib/hooks/useActiveLanguage';
import {
  DictionaryEntry,
  findDictionaryEntry,
  getDictionaryLanguages,
  searchDictionaryEntries,
} from '@/lib/data/dictionary';
import { KWICPanel } from '../components/corpus/KWICPanel.js';
import { frequencyTier } from '../lib/utils/frequencyTier.js';
import { getApiUrl } from '../lib/services/apiBaseUrl.js';

const isRtlLanguage = (languageId: string) => ['hbo', 'arc', 'syr', 'egy'].includes(languageId);

const entryPath = (entry: DictionaryEntry) =>
  `/app/dictionary/${encodeURIComponent(entry.languageId)}/${encodeURIComponent(entry.lemma)}`;

type EntryTab = 'definition' | 'concordance' | 'paradigm';

// ─── Paradigm tab ─────────────────────────────────────────────────────────────

interface AttestedForm {
  surface: string;
  features: Record<string, string>;
  count: number;
}

const CASE_ORDER = ['nominative', 'vocative', 'accusative', 'genitive', 'dative'];
const NUMBER_ORDER = ['singular', 'dual', 'plural'];
const TENSE_ORDER = ['present', 'imperfect', 'future', 'aorist', 'perfect', 'pluperfect'];
const PERSON_ORDER = ['first', 'second', 'third'];
const VOICE_ORDER = ['active', 'middle', 'passive', 'middle/passive'];

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

function AiParadigmFallback({ entry }: { entry: DictionaryEntry }) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generate = () => {
    setLoadingAi(true);
    setAiError(null);
    fetch(getApiUrl('/api/ai/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        languageId: entry.languageId,
        word: entry.lemma,
        lemma: entry.lemma,
        type: 'paradigm',
      }),
    })
      .then((r) => r.json())
      .then((d) => setAiText(d.explanation ?? null))
      .catch(() => setAiError('Failed to generate paradigm.'))
      .finally(() => setLoadingAi(false));
  };

  if (loadingAi) {
    return (
      <div className="py-16 text-center text-muted text-[14px]">
        Generating AI paradigm…
      </div>
    );
  }

  if (aiText) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue/10 text-blue text-[11px] font-semibold rounded-full">
            <Sparkles className="w-3 h-3" />
            AI-generated
          </span>
          <span className="text-[12px] text-muted italic">
            Theoretical paradigm — may include reconstructed or uncertain forms.
          </span>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-[12px] text-ink leading-relaxed bg-parch2/60 border border-bdr/30 rounded-lg p-4 overflow-x-auto">
          {aiText}
        </pre>
      </div>
    );
  }

  return (
    <div className="py-12 text-center space-y-4">
      <p className="text-muted text-[14px]">
        No attested forms found for{' '}
        <span className="font-serif text-ink">{entry.lemma}</span> in the corpus.
      </p>
      {aiError && <p className="text-red-500 text-[13px]">{aiError}</p>}
      <button
        onClick={generate}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue/10 text-blue text-[13px] font-semibold rounded-lg hover:bg-blue/20 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Generate AI Paradigm
      </button>
    </div>
  );
}

function ParadigmTab({ entry }: { entry: DictionaryEntry }) {
  const [forms, setForms] = useState<AttestedForm[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setForms(null);
    fetch(getApiUrl(`/api/lemmas/${encodeURIComponent(entry.languageId)}/${encodeURIComponent(entry.lemma)}/forms`))
      .then((r) => r.json())
      .then((d) => setForms(d.forms ?? []))
      .catch(() => setForms([]))
      .finally(() => setLoading(false));
  }, [entry.languageId, entry.lemma]);

  if (loading) {
    return (
      <div className="py-16 text-center text-muted text-[14px]">
        Loading corpus forms…
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return <AiParadigmFallback entry={entry} />;
  }

  const pos = forms[0]?.features?.pos || entry.partOfSpeech || '';
  const isVerb = pos.toLowerCase().includes('verb');
  const isNoun = pos.toLowerCase().includes('noun') || pos.toLowerCase().includes('adjective') || pos.toLowerCase().includes('article');
  const isRtl = isRtlLanguage(entry.languageId);

  // Group forms by relevant features
  if (isNoun) {
    // Case × Number table
    const genders = Array.from(new Set(forms.map((f) => f.features.gender).filter(Boolean)));
    const cases = CASE_ORDER.filter((c) => forms.some((f) => f.features.case === c));
    const numbers = NUMBER_ORDER.filter((n) => forms.some((f) => f.features.number === n));

    return (
      <div className="space-y-6">
        <p className="text-[12px] text-muted italic">
          Showing all forms attested in the corpus for <span className="font-serif text-ink not-italic">{entry.lemma}</span>. Grey cells = form not yet attested.
        </p>
        {(genders.length > 0 ? genders : ['']).map((gender) => {
          const gForms = gender ? forms.filter((f) => !f.features.gender || f.features.gender === gender) : forms;
          if (gForms.length === 0) return null;
          return (
            <div key={gender || 'all'}>
              {gender && <div className="eyebrow mb-3 text-ink">{capitalize(gender)}</div>}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-muted font-bold border-b border-bdr/40 bg-parch/30 w-28"></th>
                      {numbers.map((n) => (
                        <th key={n} className="p-2 text-center text-muted font-bold border-b border-bdr/40 bg-parch/30 capitalize">
                          {capitalize(n)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c, i) => (
                      <tr key={c} className={i % 2 === 0 ? 'bg-white' : 'bg-parch/20'}>
                        <td className="p-2 text-muted font-bold capitalize border-r border-bdr/20">{capitalize(c)}</td>
                        {numbers.map((n) => {
                          const match = gForms.find((f) => f.features.case === c && f.features.number === n);
                          return (
                            <td
                              key={n}
                              className={cn(
                                'p-2 text-center font-serif text-[16px]',
                                match ? 'text-ink' : 'text-muted/30',
                                isRtl ? 'font-hebrew' : ''
                              )}
                              dir={isRtl ? 'rtl' : 'ltr'}
                              title={match ? `${match.count}× attested` : 'Not attested'}
                            >
                              {match ? match.surface : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        <UnorganizedForms forms={forms.filter((f) => !f.features.case)} isRtl={isRtl} />
      </div>
    );
  }

  if (isVerb) {
    // Tense × Person table per Voice
    const voices = VOICE_ORDER.filter((v) => forms.some((f) => f.features.voice === v));
    const tenses = TENSE_ORDER.filter((t) => forms.some((f) => f.features.tense === t));
    const persons = PERSON_ORDER.filter((p) => forms.some((f) => f.features.person === p));
    const numbers = NUMBER_ORDER.filter((n) => forms.some((f) => f.features.number === n));

    const personNum = persons.length > 0 && numbers.length > 0
      ? persons.flatMap((p) => numbers.map((n) => ({ p, n, label: `${capitalize(p).slice(0, 3)} ${capitalize(n).slice(0, 2)}` })))
      : [];

    return (
      <div className="space-y-8">
        <p className="text-[12px] text-muted italic">
          Showing forms attested in the corpus. Grey = not yet attested.
        </p>
        {voices.map((voice) => {
          const vForms = forms.filter((f) => f.features.voice === voice);
          if (vForms.length === 0) return null;
          return (
            <div key={voice}>
              <div className="eyebrow mb-3 text-ink">{capitalize(voice)} Voice</div>
              {personNum.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-muted font-bold border-b border-bdr/40 bg-parch/30 w-20"></th>
                        {tenses.map((t) => (
                          <th key={t} className="p-2 text-center text-muted font-bold border-b border-bdr/40 bg-parch/30 capitalize text-[11px]">
                            {capitalize(t)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {personNum.map(({ p, n, label }, i) => (
                        <tr key={`${p}-${n}`} className={i % 2 === 0 ? 'bg-white' : 'bg-parch/20'}>
                          <td className="p-2 text-muted font-bold text-[11px] border-r border-bdr/20">{label}</td>
                          {tenses.map((t) => {
                            const match = vForms.find((f) => f.features.tense === t && f.features.person === p && f.features.number === n);
                            return (
                              <td
                                key={t}
                                className={cn('p-2 text-center font-serif text-[15px]', match ? 'text-ink' : 'text-muted/30')}
                                title={match ? `${match.count}× attested` : 'Not attested'}
                              >
                                {match ? match.surface : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <UnorganizedForms forms={vForms} isRtl={false} />
              )}
            </div>
          );
        })}
        <UnorganizedForms forms={forms.filter((f) => !f.features.voice && !f.features.tense)} isRtl={false} />
      </div>
    );
  }

  // Fallback: flat list of all forms
  return <UnorganizedForms forms={forms} isRtl={isRtl} />;
}

function UnorganizedForms({ forms, isRtl }: { forms: AttestedForm[]; isRtl: boolean }) {
  if (forms.length === 0) return null;
  return (
    <div>
      <div className="eyebrow mb-3 text-ink">Other Attested Forms</div>
      <div className="flex flex-wrap gap-2">
        {forms.map((f, i) => (
          <span
            key={i}
            className={cn('px-3 py-1.5 rounded-xl border border-bdr/40 bg-parch/30 font-serif text-[15px] text-ink', isRtl ? 'font-hebrew' : '')}
            dir={isRtl ? 'rtl' : 'ltr'}
            title={Object.entries(f.features).map(([k, v]) => `${k}: ${v}`).join(' · ') + ` · ${f.count}×`}
          >
            {f.surface}
            <span className="ml-1.5 text-[10px] text-muted font-sans">{f.count}×</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Display names for the supported UI languages, keyed by i18n locale code.
const UI_LANGUAGE_LABELS: Record<string, string> = {
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  tr: 'Türkçe',
  zh: '中文',
};

// Native-language "show definition in <lang>" call to action.
const UI_LANGUAGE_CTA: Record<string, string> = {
  pt: 'Ver em Português',
  es: 'Ver en Español',
  fr: 'Voir en Français',
  de: 'Auf Deutsch anzeigen',
  ru: 'Показать на русском',
  tr: 'Türkçe göster',
  zh: '用中文显示',
};

// Part C: on-demand AI gloss translated into the learner's UI language.
// Shown only when the interface language is not English, since the bundled
// glosses are English.
function LocalizedDefinition({ entry }: { entry: DictionaryEntry }) {
  const { i18n } = useTranslation();
  const uiLang = (i18n.language || 'en').split('-')[0];
  // State resets across entries via the `key` prop at the call site, so no
  // effect-based reset is needed here.
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (uiLang === 'en' || !UI_LANGUAGE_LABELS[uiLang]) return null;
  const langLabel = UI_LANGUAGE_LABELS[uiLang];

  const generate = () => {
    setLoading(true);
    setError(false);
    fetch(getApiUrl('/api/ai/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        languageId: entry.languageId,
        word: entry.lemma,
        lemma: entry.lemma,
        type: 'gloss',
        targetLanguage: uiLang,
      }),
    })
      .then((r) => r.json())
      .then((d) => setText(d.explanation ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mt-4 pt-4 border-t border-bdr/30">
      {text ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue">
            <Sparkles className="w-3 h-3" />
            {langLabel}
          </div>
          <p className="font-body text-[16px] text-ink leading-snug">{text}</p>
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue/10 text-blue text-[12px] font-semibold rounded-lg hover:bg-blue/20 transition-colors disabled:opacity-60"
        >
          <Languages className="w-3.5 h-3.5" />
          {loading ? `${langLabel}…` : UI_LANGUAGE_CTA[uiLang] || langLabel}
        </button>
      )}
      {error && (
        <p className="text-red-500 text-[12px] mt-2">Could not generate translation.</p>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: DictionaryEntry }) {
  const isRtl = isRtlLanguage(entry.languageId);
  const [activeTab, setActiveTab] = useState<EntryTab>('definition');
  const tier = frequencyTier(entry.frequency);

  return (
    <section className="card p-6 md:p-8 bg-[#FEFAF4] border-bdr/60">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
        <div>
          <div className="eyebrow text-blue mb-3">Dictionary Entry</div>
          <h2
            className={cn(
              'text-[42px] md:text-[56px] font-serif leading-none text-ink',
              isRtl ? 'font-hebrew' : ''
            )}
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
          <span
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider',
              tier.color
            )}
          >
            {tier.label}
          </span>
          <span className="px-3 py-1 rounded-full border border-bdr/60 bg-white text-[11px] font-bold uppercase tracking-wider text-muted">
            {entry.frequency} tokens
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bdr/40 mb-6">
        {(
          [
            ['definition', 'Definition', BookOpen],
            ['paradigm', 'Paradigm', Table2],
            ['concordance', 'Concordance', AlignLeft],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest border-b-2 transition-colors',
              activeTab === id
                ? 'border-blue text-blue'
                : 'border-transparent text-muted hover:text-ink'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'definition' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
            <div className="p-5 rounded-[20px] bg-parch/40 border border-bdr/30">
              <div className="eyebrow mb-3 text-ink">Definition</div>
              {entry.shortGloss ? (
                <>
                  <p className="font-body text-[22px] text-ink leading-snug mb-4">
                    {entry.shortGloss}
                  </p>
                  <p className="font-body text-[15px] text-ink2 leading-relaxed">
                    {entry.fullDefinition}
                  </p>
                </>
              ) : (
                <p className="font-body text-[15px] text-muted italic leading-relaxed">
                  No bundled definition for this lemma yet — generate one below or check the
                  concordance for usage in context.
                </p>
              )}
              <LocalizedDefinition key={entry.id} entry={entry} />
            </div>

            <div className="p-5 rounded-[20px] bg-parch2/30 border border-bdr/30">
              <div className="eyebrow mb-3 text-ink">Lexical Data</div>
              <dl className="space-y-3 text-[13px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Semantic domain</dt>
                  <dd className="font-bold text-ink text-right">
                    {entry.semanticDomain.join(', ') || 'Unclassified'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Related forms</dt>
                  <dd className="font-bold text-ink text-right">
                    {entry.relatedForms.slice(0, 6).join(', ') || 'No forms yet'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Corpus rank</dt>
                  <dd className="font-bold text-ink text-right">{entry.frequency} occurrences</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mb-8">
            <div className="eyebrow mb-4 flex items-center justify-between text-ink">
              <span>Corpus Examples</span>
              <button
                onClick={() => setActiveTab('concordance')}
                className="text-[11px] text-blue font-bold hover:underline"
              >
                Full concordance →
              </button>
            </div>
            {entry.corpusExamples.length > 0 ? (
              <div className="space-y-3">
                {entry.corpusExamples.slice(0, 3).map((example) => (
                  <Link
                    key={example.id}
                    to={`/app/reader/${encodeURIComponent(example.textId)}?lemma=${encodeURIComponent(entry.lemma)}&sentence=${encodeURIComponent(example.sentenceId)}`}
                    className="block p-4 rounded-2xl border border-bdr/30 bg-white hover:border-blue/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-blue">
                        {example.textTitle}
                      </span>
                      <span className="text-[11px] text-muted">Open in reader</span>
                    </div>
                    <p
                      className={cn(
                        'font-serif text-[17px] text-ink2 mb-2',
                        isRtl ? 'font-hebrew' : ''
                      )}
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      {example.sentenceText}
                    </p>
                    {example.translation && (
                      <p className="font-body text-[12px] italic text-muted">
                        {example.translation}
                      </p>
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
              {entry.dictionaries.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[12px] text-ink2"
                >
                  <span>
                    <span className="font-bold">{source.name}</span>
                    <span className="text-muted"> · {source.licenseName}</span>
                  </span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue font-bold hover:text-ink"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'paradigm' && <ParadigmTab entry={entry} />}

      {activeTab === 'concordance' && (
        <KWICPanel lemma={entry.lemma} languageId={entry.languageId} maxResults={200} />
      )}
    </section>
  );
}

export const Dictionary = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { activeLanguageId } = useActiveLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || params.lemma || '');
  // Default the language filter to the global navbar selection, but let an
  // explicit deep link (?lang= or /:languageId) win on first load.
  const [languageId, setLanguageId] = useState(
    searchParams.get('lang') || params.languageId || activeLanguageId || ''
  );

  // Follow the global language selector when the user switches it in the
  // navbar (but not on the initial mount, so deep links survive).
  const prevActiveLang = useRef(activeLanguageId);
  useEffect(() => {
    if (prevActiveLang.current !== activeLanguageId) {
      prevActiveLang.current = activeLanguageId;
      setLanguageId(activeLanguageId);
    }
  }, [activeLanguageId]);

  const languages = useMemo(() => getDictionaryLanguages(), []);
  const results = useMemo(
    () => searchDictionaryEntries(query, languageId || undefined, 80),
    [query, languageId]
  );
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
          <h1 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
            Dictionary Hub
          </h1>
          <p className="font-body text-[15px] italic text-ink2 max-w-2xl">
            Lemma-aware lookup connected to real corpus examples, reader occurrences, and source
            metadata.
          </p>
        </div>
        <Link
          to="/app/library"
          className="btn-primary px-5 py-2.5 inline-flex items-center justify-center gap-2"
        >
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
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>

          <div className="eyebrow mb-3 flex items-center justify-between text-ink">
            <span>Results</span>
            <span className="text-blue">{results.length}</span>
          </div>

          <div className="max-h-[62vh] overflow-y-auto space-y-2 pr-1">
            {results.map((entry) => {
              const active = selectedEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => navigate(entryPath(entry))}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all',
                    active
                      ? 'bg-bluexl border-blue/30 shadow-sm'
                      : 'bg-white border-bdr/30 hover:border-blue/20 hover:bg-parch/30'
                  )}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-serif text-[22px] text-ink leading-none">
                      <bdi>{entry.lemma}</bdi>
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
                      {entry.language}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink2 line-clamp-2">{entry.shortGloss}</p>
                  <p className="text-[10px] text-muted mt-1">
                    {entry.relatedForms.slice(0, 3).join(', ')}
                  </p>
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
            <p className="text-ink3 max-w-md">
              Search by lemma, surface form, transliteration, or gloss to open a dictionary entry.
            </p>
          </section>
        )}
      </div>
    </div>
  );
};
