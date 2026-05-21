import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, BookOpen, Network, Sparkles, Globe, Languages, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '../../lib/services/apiBaseUrl.js';
import { DependencyTree } from './DependencyTree.js';
import type { DepToken } from './DependencyTree.js';
import { DiscussionPanel } from './DiscussionPanel.js';

interface WordParsing {
  text: string;
  lemma: string;
  gloss: string;
  pos: string;
  morphology: string;
  notes: string;
}

interface SentenceAnalysis {
  parsing: WordParsing[];
  syntax: {
    mainVerb: string;
    subject: string;
    object: string;
    description: string;
  };
  semantics: {
    keywords: string[];
    idioms: string[];
    notes: string;
  };
  context: string;
  translations: string[];
}

interface Props {
  sentence: { text: string; id: string } | null;
  language: string;
  mode: 'beginner' | 'scholar';
  onClose: () => void;
  isRtl?: boolean;
  textId?: string;
  sentenceIndex?: number;
}

type TabId = 'parsing' | 'syntax' | 'semantics' | 'context' | 'translation' | 'discuss';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'parsing', label: 'Parsing', icon: BookOpen },
  { id: 'syntax', label: 'Syntax', icon: Network },
  { id: 'semantics', label: 'Semantics', icon: Sparkles },
  { id: 'context', label: 'Context', icon: Globe },
  { id: 'translation', label: 'Translation', icon: Languages },
  { id: 'discuss', label: 'Discuss', icon: MessageSquare },
];

const POS_COLORS: Record<string, string> = {
  verb: 'bg-amber-100 text-amber-800',
  noun: 'bg-blue-100 text-blue-800',
  'proper noun': 'bg-purple-100 text-purple-800',
  adjective: 'bg-green-100 text-green-800',
  particle: 'bg-gray-100 text-gray-700',
  conjunction: 'bg-gray-100 text-gray-700',
  preposition: 'bg-gray-100 text-gray-700',
  adverb: 'bg-teal-100 text-teal-700',
  pronoun: 'bg-orange-100 text-orange-700',
  article: 'bg-slate-100 text-slate-600',
};

function posColor(pos: string): string {
  const lower = pos.toLowerCase();
  for (const [key, cls] of Object.entries(POS_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return 'bg-gray-100 text-gray-700';
}

export function SentenceAnalysisPanel({ sentence, language, mode, onClose, isRtl = false, textId, sentenceIndex }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('parsing');
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depTokens, setDepTokens] = useState<DepToken[] | null>(null);
  const [depLoading, setDepLoading] = useState(false);
  const [selectedDepIndex, setSelectedDepIndex] = useState<number | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!sentence) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(getApiUrl('/api/ai/sentence-analysis'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence.text, language, mode }),
      });

      if (!res.ok) {
        throw new Error(`Analysis failed (${res.status})`);
      }

      const data: SentenceAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sentence');
    } finally {
      setLoading(false);
    }
  }, [sentence, language, mode]);

  const fetchDepTree = useCallback(async () => {
    if (!sentence) return;
    setDepLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/ai/syntax'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId: language, sentence: sentence.text, tokens: [] }),
      });
      if (!res.ok) throw new Error('Syntax fetch failed');
      const data = await res.json();
      const tokens: DepToken[] = (data.tokens ?? []).map((t: any, i: number) => ({
        index: i,
        form: t.form || t.surface || t.text || '',
        lemma: t.lemma || '',
        pos: t.pos || t.partOfSpeech || '',
        head: t.head ?? -1,
        relation: t.relation || t.deprel || 'dep',
      }));
      setDepTokens(tokens.length > 0 ? tokens : null);
    } catch {
      setDepTokens(null);
    } finally {
      setDepLoading(false);
    }
  }, [sentence, language]);

  // Reset tab and fetch when sentence changes — setActiveTab is safe to call without triggering loops
  // because it only runs when sentence?.id changes (a stable external input, not derived from state)
  useEffect(() => {
    if (!sentence) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab('parsing');
    setDepTokens(null);
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence?.id]);

  if (!sentence) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 380, y: 0 }}
        animate={{ x: 0, y: 0 }}
        exit={{ x: 380, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="md:!translate-y-0 fixed md:relative bottom-0 left-0 w-full md:w-[380px] h-[65vh] md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-bdr/40 bg-parch/60 backdrop-blur-sm overflow-hidden z-50 md:z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_40px_rgba(35,20,10,0.04)] rounded-t-3xl md:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bdr/40 bg-parch/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink2">
              Sentence Analysis
            </span>
            {mode === 'scholar' && (
              <span className="text-[9px] font-bold uppercase tracking-widest bg-blue/10 text-blue px-1.5 py-0.5 rounded">
                Scholar
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-parch3 text-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sentence preview */}
        <div
          className={cn('px-4 py-2.5 border-b border-bdr/20 bg-parch3/40', isRtl && 'text-right')}
        >
          <p
            className="font-serif text-[15px] leading-relaxed text-ink line-clamp-3"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {sentence.text}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-bdr/40 bg-parch/50 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'syntax' && !depTokens && !depLoading) {
                    fetchDepTree();
                  }
                }}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2',
                  activeTab === tab.id
                    ? 'border-blue text-blue bg-blue/5'
                    : 'border-transparent text-muted hover:text-ink'
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-blue" />
              <span className="text-[11px] font-medium">Analyzing with AI...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
                <button
                  onClick={fetchAnalysis}
                  className="mt-2 block text-[11px] font-bold underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <div className="p-4 space-y-3">
              {activeTab === 'parsing' && (
                <div className="space-y-2">
                  {analysis.parsing.length === 0 && (
                    <p className="text-sm text-muted italic">No parsing data available.</p>
                  )}
                  {analysis.parsing.map((word, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-bdr/40 rounded-lg p-3 bg-white/60"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className="font-serif text-[17px] text-ink"
                          dir={isRtl ? 'rtl' : 'ltr'}
                        >
                          {word.text}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                            posColor(word.pos)
                          )}
                        >
                          {word.pos}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-muted font-mono">{word.lemma}</span>
                        <span className="text-[10px] text-ink2">— {word.gloss}</span>
                      </div>
                      {word.morphology && (
                        <div className="text-[10px] font-medium text-ink2/70 bg-parch3/50 px-2 py-1 rounded font-mono">
                          {word.morphology}
                        </div>
                      )}
                      {word.notes && (
                        <p className="mt-1.5 text-[10px] text-muted italic">{word.notes}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'syntax' && (
                <div className="space-y-4">
                  <p className="text-[13px] text-ink leading-relaxed">
                    {analysis.syntax.description || 'No syntax analysis available.'}
                  </p>
                  {(analysis.syntax.mainVerb ||
                    analysis.syntax.subject ||
                    analysis.syntax.object) && (
                    <div className="border border-bdr/40 rounded-lg divide-y divide-bdr/20 overflow-hidden">
                      {analysis.syntax.mainVerb && (
                        <div className="flex items-center gap-2 px-3 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted w-16">
                            Verb
                          </span>
                          <span className="text-[12px] font-mono text-amber-700">
                            {analysis.syntax.mainVerb}
                          </span>
                        </div>
                      )}
                      {analysis.syntax.subject && (
                        <div className="flex items-center gap-2 px-3 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted w-16">
                            Subject
                          </span>
                          <span className="text-[12px] text-blue">{analysis.syntax.subject}</span>
                        </div>
                      )}
                      {analysis.syntax.object && (
                        <div className="flex items-center gap-2 px-3 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted w-16">
                            Object
                          </span>
                          <span className="text-[12px] text-ink">{analysis.syntax.object}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dependency tree */}
                  <div className="border border-bdr/40 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-bdr/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        Dependency Tree
                      </span>
                      {!depTokens && !depLoading && (
                        <button
                          onClick={fetchDepTree}
                          className="text-[10px] text-blue hover:underline"
                        >
                          Generate
                        </button>
                      )}
                    </div>
                    <div className="p-2 overflow-x-auto min-h-[60px] flex items-center justify-center">
                      {depLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted" />
                      ) : depTokens && depTokens.length > 0 ? (
                        <DependencyTree
                          tokens={depTokens}
                          isRTL={isRtl}
                          selectedIndex={selectedDepIndex}
                          onTokenClick={(i) =>
                            setSelectedDepIndex((prev) => (prev === i ? null : i))
                          }
                        />
                      ) : (
                        <p className="text-[11px] text-muted italic py-2">
                          Click "Generate" to build the dependency tree.
                        </p>
                      )}
                    </div>
                    {selectedDepIndex != null && depTokens && (
                      <div className="px-3 py-2 border-t border-bdr/30 bg-parch2/40 text-[11px] text-ink2">
                        <strong className="font-mono">{depTokens[selectedDepIndex]?.form}</strong>
                        {' · '}
                        <span className="text-muted">{depTokens[selectedDepIndex]?.relation}</span>
                        {depTokens[selectedDepIndex]?.head >= 0 && (
                          <> → <strong className="font-mono">{depTokens[depTokens[selectedDepIndex].head]?.form}</strong></>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'semantics' && (
                <div className="space-y-3">
                  {analysis.semantics.keywords.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                        Key Words
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.semantics.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="font-mono text-[11px] bg-amber/10 text-amber-800 px-2 py-0.5 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.semantics.idioms.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                        Idioms & Expressions
                      </h4>
                      <ul className="space-y-1">
                        {analysis.semantics.idioms.map((idiom, i) => (
                          <li key={i} className="text-[12px] text-ink italic">
                            "{idiom}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.semantics.notes && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                        Semantic Notes
                      </h4>
                      <p className="text-[13px] text-ink leading-relaxed">
                        {analysis.semantics.notes}
                      </p>
                    </div>
                  )}
                  {!analysis.semantics.keywords.length &&
                    !analysis.semantics.idioms.length &&
                    !analysis.semantics.notes && (
                      <p className="text-sm text-muted italic">No semantic analysis available.</p>
                    )}
                </div>
              )}

              {activeTab === 'context' && (
                <div>
                  {analysis.context ? (
                    <p className="text-[13px] text-ink leading-relaxed">{analysis.context}</p>
                  ) : (
                    <p className="text-sm text-muted italic">No context available.</p>
                  )}
                </div>
              )}

              {activeTab === 'translation' && (
                <div className="space-y-3">
                  {analysis.translations.length === 0 && (
                    <p className="text-sm text-muted italic">No translation available.</p>
                  )}
                  {analysis.translations.map((tr, i) => (
                    <div key={i} className="border border-bdr/40 rounded-lg p-3 bg-white/60">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
                          {i === 0 ? 'Literal' : 'Natural'}
                        </span>
                      </div>
                      <p className="text-[14px] text-ink leading-relaxed">{tr}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discuss' && (
            <div className="pt-1">
              {textId ? (
                <DiscussionPanel
                  textId={textId}
                  languageId={language}
                  sentenceIndex={sentenceIndex ?? 0}
                  sentenceExcerpt={sentence?.text?.slice(0, 120)}
                />
              ) : (
                <p className="text-sm text-muted italic py-4 text-center">
                  Discussions are only available for corpus texts and imported texts.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
