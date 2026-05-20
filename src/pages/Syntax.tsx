import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Loader2, AlertTriangle, ChevronRight, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorpusDB } from '../data/corpus.js';
import { isRtlLanguage } from '../lib/constants/languages.js';
import { apiFetch } from '../lib/services/apiFetch.js';
import type { Sentence } from '../types/corpus.js';
import { DependencyTree, type DepToken } from '../components/reader/DependencyTree.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface SyntaxResult {
  tokens: DepToken[];
  explanation: string;
  confidence: number | null;
  warnings?: string[];
  source?: string; // 'ai' | 'treebank:PROIEL' | 'treebank:PLDT' | etc.
}

// ── Relation legend ──────────────────────────────────────────────────────────

const LEGEND = [
  { label: 'root', color: '#e0a800', desc: 'Main predicate' },
  { label: 'nsubj', color: '#2d9e5f', desc: 'Nominal subject' },
  { label: 'obj / iobj', color: '#2563eb', desc: 'Object' },
  { label: 'obl', color: '#7c3aed', desc: 'Oblique nominal' },
  { label: 'nmod / amod', color: '#d97706', desc: 'Modifier' },
  { label: 'aux / cop', color: '#64748b', desc: 'Auxiliary / copula' },
  { label: 'det / case / mark', color: '#94a3b8', desc: 'Function word' },
  { label: 'adv / advcl / acl', color: '#0891b2', desc: 'Adverbial / clause' },
  { label: 'conj', color: '#be123c', desc: 'Conjunct' },
  { label: 'compound / flat', color: '#6d28d9', desc: 'Multiword' },
];

// ── Sentence surface text ─────────────────────────────────────────────────────

function sentenceSurface(sentence: Sentence): string {
  return sentence.tokens
    .map((t) => t.punctBefore + t.surface + t.punctAfter)
    .join(' ')
    .replace(/\s+([.,;:!?·])/g, '$1')
    .trim();
}

// ── Main page ────────────────────────────────────────────────────────────────

export const Syntax = () => {
  const texts = useMemo(() => CorpusDB.getTexts(), []);

  const [selectedTextId, setSelectedTextId] = useState<string>(texts[0]?.id ?? '');
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number | null>(null);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);
  const [syntaxResult, setSyntaxResult] = useState<SyntaxResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedText = useMemo(
    () => texts.find((t) => t.id === selectedTextId),
    [texts, selectedTextId]
  );
  const isRTL = selectedText ? isRtlLanguage(selectedText.language) : false;

  // Load sentences from the first section of the selected text
  const sentences = useMemo<Sentence[]>(() => {
    if (!selectedText?.sectionsPreview?.length) return [];
    const firstSection = CorpusDB.getSection(selectedText.sectionsPreview[0].id);
    return firstSection?.sentences ?? [];
  }, [selectedText]);

  const selectedSentence = selectedSentenceIdx !== null ? sentences[selectedSentenceIdx] : null;

  const handleTextChange = useCallback((textId: string) => {
    setSelectedTextId(textId);
    setSelectedSentenceIdx(null);
    setSelectedTokenIdx(null);
    setSyntaxResult(null);
    setError(null);
  }, []);

  const handleSelectSentence = useCallback((idx: number) => {
    setSelectedSentenceIdx(idx);
    setSelectedTokenIdx(null);
    setSyntaxResult(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedSentence || !selectedText) return;
    setIsAnalyzing(true);
    setSyntaxResult(null);
    setError(null);
    try {
      // 1. Check if corpus tokens carry treebank dependency annotations
      const annotated = selectedSentence.tokens.filter(
        (t: any) => t.deprel != null || t.head != null
      );
      if (annotated.length > 0) {
        const treebankSource = (annotated[0] as any).treebankSource ?? 'corpus';
        const depTokens: DepToken[] = selectedSentence.tokens.map((t: any, idx: number) => ({
          index: idx,
          form: t.surface ?? t.text ?? '',
          lemma: t.lemma ?? '',
          pos: t.morphology?.partOfSpeech ?? '',
          head: t.head ?? -1,
          relation: t.deprel ?? 'dep',
        }));
        setSyntaxResult({
          tokens: depTokens,
          explanation: `Dependency tree from ${treebankSource} treebank. Annotations are human-verified.`,
          confidence: 1.0,
          source: `treebank:${treebankSource}`,
        });
        return;
      }

      // 2. Fall back to AI analysis
      const surface = sentenceSurface(selectedSentence);
      const res = await apiFetch('/api/ai/syntax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: selectedText.language,
          sentence: surface,
          tokens: selectedSentence.tokens.map((t) => ({ surface: t.surface, lemma: t.lemma })),
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as SyntaxResult;
      setSyntaxResult({ ...data, source: 'ai' });
    } catch (e: any) {
      setError(e.message ?? 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedSentence, selectedText]);

  const selectedTokenInfo = useMemo(() => {
    if (selectedTokenIdx === null || !syntaxResult?.tokens.length) return null;
    return syntaxResult.tokens.find((t) => t.index === selectedTokenIdx) ?? null;
  }, [selectedTokenIdx, syntaxResult]);

  const headToken = useMemo(() => {
    if (!selectedTokenInfo || selectedTokenInfo.head === -1 || !syntaxResult) return null;
    return syntaxResult.tokens.find((t) => t.index === selectedTokenInfo.head) ?? null;
  }, [selectedTokenInfo, syntaxResult]);

  const dependents = useMemo(() => {
    if (selectedTokenIdx === null || !syntaxResult) return [];
    return syntaxResult.tokens.filter((t) => t.head === selectedTokenIdx);
  }, [selectedTokenIdx, syntaxResult]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[26px] font-serif font-light text-ink tracking-tight">
              Syntax &amp; Treebank Viewer
            </h2>
            {syntaxResult?.source?.startsWith('treebank:') ? (
              <p className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                {syntaxResult.source.replace('treebank:', '')} Treebank · Human-verified
              </p>
            ) : (
              <p className="text-[10px] font-bold text-blue tracking-wider uppercase">
                AI-Generated · Experimental
              </p>
            )}
          </div>
        </div>
        <p className="text-[14px] text-ink2 max-w-2xl">
          Visualize the syntactic structure of ancient sentences as dependency arc diagrams. Select
          a text and sentence, then click <strong>Analyze</strong> to generate the tree.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left panel: text + sentence selector */}
        <aside className="space-y-4">
          {/* Text picker */}
          <div className="card p-4">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
              Text
            </label>
            <select
              className="w-full text-[13px] bg-transparent text-ink border border-bdr rounded-lg px-3 py-2 focus:outline-none focus:border-blue"
              value={selectedTextId}
              onChange={(e) => handleTextChange(e.target.value)}
            >
              {texts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            {selectedText && (
              <p className="text-[11px] text-muted mt-1.5 capitalize">
                {selectedText.language} · {sentences.length} sentences available
              </p>
            )}
          </div>

          {/* Sentence list */}
          <div className="card p-3 max-h-[480px] overflow-y-auto">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 px-1">
              Sentences
            </p>
            {sentences.length === 0 ? (
              <p className="text-[13px] text-ink3 p-2">No sentences available.</p>
            ) : (
              <ul className="space-y-0.5">
                {sentences.map((s, idx) => (
                  <li key={s.id}>
                    <button
                      onClick={() => handleSelectSentence(idx)}
                      className={cn(
                        'w-full text-left px-2 py-2 rounded-lg text-[12px] transition-colors flex items-start gap-1.5',
                        isRTL && 'direction-rtl text-right',
                        idx === selectedSentenceIdx
                          ? 'bg-blue/10 text-blue font-medium'
                          : 'hover:bg-parch2 text-ink2'
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'w-3 h-3 mt-0.5 shrink-0 text-muted',
                          idx === selectedSentenceIdx && 'text-blue'
                        )}
                      />
                      <span className={cn('line-clamp-2 font-serif', isRTL && 'direction-rtl')}>
                        {sentenceSurface(s)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Relation legend */}
          <div className="card p-4">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
              Relation Types
            </p>
            <ul className="space-y-1">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  <span
                    className="text-[11px] font-mono font-bold text-ink"
                    style={{ color: l.color }}
                  >
                    {l.label}
                  </span>
                  <span className="text-[11px] text-muted">{l.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right panel: diagram + details */}
        <main className="space-y-4">
          {/* Selected sentence + Analyze button */}
          {selectedSentence ? (
            <div className="card p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p
                  className={cn(
                    'font-serif text-[16px] text-ink leading-relaxed flex-1',
                    isRTL && 'direction-rtl text-right'
                  )}
                  lang={selectedText?.language}
                >
                  {sentenceSurface(selectedSentence)}
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue text-white font-bold rounded-xl text-[12px] hover:bg-blue/90 disabled:opacity-50 transition-all shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…
                    </>
                  ) : syntaxResult ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-3.5 h-3.5" /> Analyze
                    </>
                  )}
                </button>
              </div>
              {selectedSentence.translation && (
                <p className="text-[12px] text-ink2 italic border-t border-bdr/40 pt-2 mt-2">
                  {selectedSentence.translation}
                </p>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center border-dashed border-2 border-bdr/40 bg-parch2/50">
              <GitBranch className="w-12 h-12 text-muted/50 mx-auto mb-3" />
              <p className="text-[14px] text-ink3">Select a sentence from the list to begin.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Analyzing spinner overlay */}
          {isAnalyzing && (
            <div className="card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue mx-auto mb-3" />
              <p className="text-[13px] text-ink2">Generating dependency tree…</p>
              <p className="text-[11px] text-muted mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Dependency tree */}
          {!isAnalyzing && syntaxResult && syntaxResult.tokens.length > 0 && (
            <>
              {/* Warnings */}
              {syntaxResult.warnings?.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-amber/5 border border-amber/20 rounded-xl text-[12px] text-amber"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}

              {/* Arc diagram */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                    Dependency Tree
                  </p>
                  {syntaxResult.confidence !== null && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        syntaxResult.confidence >= 0.75
                          ? 'bg-emerald-50 text-emerald-700'
                          : syntaxResult.confidence >= 0.5
                            ? 'bg-amber/10 text-amber-700'
                            : 'bg-red-50 text-red-600'
                      )}
                    >
                      {Math.round(syntaxResult.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <DependencyTree
                  tokens={syntaxResult.tokens}
                  isRTL={isRTL}
                  selectedIndex={selectedTokenIdx}
                  onTokenClick={(idx) => setSelectedTokenIdx((prev) => (prev === idx ? null : idx))}
                />
                <p className="text-[10px] text-muted mt-2 text-center">
                  Click a token to inspect its dependencies
                </p>
              </div>

              {/* Token detail panel */}
              {selectedTokenInfo && (
                <div className="card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue" />
                    <span className="text-[12px] font-bold text-ink">Token detail</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Form', value: selectedTokenInfo.form },
                      { label: 'Lemma', value: selectedTokenInfo.lemma },
                      { label: 'POS', value: selectedTokenInfo.pos },
                      { label: 'Relation', value: selectedTokenInfo.relation },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-parch2 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                          {label}
                        </p>
                        <p className="text-[13px] font-medium text-ink font-serif">{value}</p>
                      </div>
                    ))}
                  </div>
                  {headToken && (
                    <p className="text-[12px] text-ink2">
                      Head:{' '}
                      <span className="font-serif font-medium text-ink">{headToken.form}</span> (
                      {headToken.relation} · {headToken.pos})
                    </p>
                  )}
                  {dependents.length > 0 && (
                    <p className="text-[12px] text-ink2">
                      Dependents:{' '}
                      {dependents.map((d, i) => (
                        <span key={d.index}>
                          <span className="font-serif font-medium text-ink">{d.form}</span>
                          <span className="text-muted"> ({d.relation})</span>
                          {i < dependents.length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                  )}
                  {selectedTokenInfo.head === -1 && (
                    <p className="text-[12px] font-bold text-amber">
                      Root — main predicate of the clause
                    </p>
                  )}
                </div>
              )}

              {/* AI explanation */}
              {syntaxResult.explanation && (
                <div className="card p-4 bg-blue/3">
                  <p className="text-[11px] font-bold text-blue uppercase tracking-wider mb-1.5">
                    Syntactic Analysis
                  </p>
                  <p className="text-[14px] text-ink2 leading-relaxed">
                    {syntaxResult.explanation}
                  </p>
                </div>
              )}

              {/* Token table */}
              <div className="card p-4 overflow-x-auto">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">
                  Token Annotations
                </p>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-bdr/40">
                      {['#', 'Form', 'Lemma', 'POS', 'Head', 'Relation'].map((h) => (
                        <th key={h} className="text-left text-muted font-bold py-1 pr-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {syntaxResult.tokens.map((t) => {
                      const isSelected = t.index === selectedTokenIdx;
                      return (
                        <tr
                          key={t.index}
                          onClick={() =>
                            setSelectedTokenIdx((prev) => (prev === t.index ? null : t.index))
                          }
                          className={cn(
                            'border-b border-bdr/20 cursor-pointer hover:bg-parch2 transition-colors',
                            isSelected && 'bg-blue/5'
                          )}
                        >
                          <td className="py-1.5 pr-4 text-muted font-mono">{t.index}</td>
                          <td className="py-1.5 pr-4 font-serif text-ink">{t.form}</td>
                          <td className="py-1.5 pr-4 font-serif italic text-ink2">{t.lemma}</td>
                          <td className="py-1.5 pr-4 font-mono text-muted">{t.pos}</td>
                          <td className="py-1.5 pr-4 font-mono text-muted">
                            {t.head === -1 ? '—' : t.head}
                          </td>
                          <td className="py-1.5 pr-4">
                            <span
                              className="font-mono font-bold text-[10px]"
                              style={{ color: t.head === -1 ? '#e0a800' : '#64748b' }}
                            >
                              {t.relation}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Empty state after analysis with no tokens */}
          {!isAnalyzing && syntaxResult && syntaxResult.tokens.length === 0 && (
            <div className="card p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-amber mx-auto mb-2" />
              <p className="text-[13px] text-ink2">
                {syntaxResult.explanation || 'No dependency tree could be generated.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
