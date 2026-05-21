import { memo, useRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Repeat, StickyNote, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, STATE_COLORS, normalizeWordState } from '@/lib/constants/wordStates';
import type { WordInfo } from '@/lib/services/vocabularyService';
import { GlossTooltip } from './GlossTooltip.js';
import { MorphologyTooltip } from './MorphologyTooltip.js';
import type { DisplayMode, ReaderToken, ReaderSentence } from '@/types/reader';

/** POS-based token color for Morphology mode. Returns undefined for unknowns. */
function getPosStyle(token: ReaderToken): React.CSSProperties | undefined {
  const raw = ((token.morphology || '') + ' ' + (token.pos || '')).toLowerCase();
  if (!raw.trim()) return undefined;

  // Verb
  if (/^v-|verb|\bv\b.*-ai|-vai|V-[PAIF]/.test(raw) || raw.startsWith('v-')) {
    return { color: '#B45309', borderBottomColor: '#F59E0B', backgroundColor: '#FEF3C715' };
  }
  // Proper noun
  if (/proper|N-P|NP-/.test(raw)) {
    return { color: '#7C3AED', borderBottomColor: '#A855F7', backgroundColor: '#F5F3FF15' };
  }
  // Noun
  if (/^n-|noun|\bN\b.*-[NGDAV]/.test(raw) || raw.startsWith('n-')) {
    return { color: '#1D4ED8', borderBottomColor: '#3B82F6', backgroundColor: '#EFF6FF15' };
  }
  // Adjective
  if (/^a-|adj|A-[NGDAV]/.test(raw)) {
    return { color: '#065F46', borderBottomColor: '#10B981', backgroundColor: '#ECFDF515' };
  }
  // Particle / Conjunction / Preposition
  if (/partic|conjunc|prep|^c-|^d-|^p-/.test(raw)) {
    return { color: '#6B7280', borderBottomColor: '#9CA3AF', backgroundColor: 'transparent' };
  }
  return undefined;
}

type SourceKind = 'import' | 'sample' | 'partial' | 'complete';

interface Props {
  sentences: ReaderSentence[];
  readingMode: 'scroll' | 'page';
  currentSentenceIndex: number;
  fontSize: number;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  getWordInfo: (lemma: string) => WordInfo;
  knowledgeVersion: number;
  selectedWordId?: string;
  showTranslit: boolean;
  showParallel: boolean;
  maskKnown: boolean;
  isHebrewFont: boolean;
  isRtl: boolean;
  audioPos: { sentenceIdx: number; wordIdx: number };
  aiTranslations: Record<string, string>;
  translatingId: string | null;
  sourceKind: SourceKind;
  textTitle: string;
  sectionLabel: string;
  hasMorphology: boolean;
  sentenceCount: number;
  analysisStatus?: 'analyzed' | 'raw' | 'needs_ai';
  showGlossTooltip?: boolean;
  glossTooltipForKnown?: boolean;
  interlinearMode?: boolean;
  displayMode?: DisplayMode;
  onWordClick: (token: ReaderToken, sentenceText: string, sentenceIndex: number) => void;
  onWordContextMenu: (token: ReaderToken, x: number, y: number) => void;
  onAITranslate: (sentenceId: string, tokens: ReaderToken[]) => void;
  onSavePhrase: (sentence: ReaderSentence) => void;
  onAnalyzeSentence?: (sentence: { text: string; id: string }) => void;
  onSentenceNote?: (sentence: ReaderSentence, sentenceIndex: number) => void;
  onBookmarkSentence?: (sentence: ReaderSentence, sentenceIndex: number) => void;
  bookmarkedSentenceIds?: Set<string>;
  notedSentenceIds?: Set<string>;
  onMarkPageKnown: () => void;
  onNextPage: () => void;
  onNextChapter: () => void;
  onBackToLibrary: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  currentScrollPage: number;
  totalPages: number;
  currentChapterIndex: number;
  totalChapters: number;
  sentenceSliceStart: number;
}

function getWordStyle(
  wordInfo: any,
  isAudioActive: boolean,
  maskKnown: boolean,
  highlightIntensity: 'subtle' | 'normal' | 'strong',
  isSelected: boolean
) {
  const state = normalizeWordState(
    wordInfo ? (typeof wordInfo === 'object' ? wordInfo.state : wordInfo) : WordState.NEW
  );
  const isKnown = state === WordState.KNOWN;
  const colors = STATE_COLORS[state];

  const opacityMap = { strong: '50', normal: '33', subtle: '15' };
  let bgOpacity = opacityMap[highlightIntensity];
  if (state === WordState.NEW) bgOpacity = '00';

  if (maskKnown && isKnown && !isSelected && !isAudioActive) {
    return {
      color: 'transparent',
      borderBottom: '2px dotted #8C8273',
      backgroundImage: 'radial-gradient(circle, #8C8273 1px, transparent 1px)',
      backgroundSize: '10px 10px',
      backgroundPosition: '1px 8px',
      backgroundRepeat: 'repeat-x',
    };
  }

  return {
    backgroundColor: isSelected
      ? '#1E3D6E33'
      : colors.bg === 'transparent'
        ? 'transparent'
        : `${colors.bg}${bgOpacity}`,
    borderBottom: `2px solid ${isSelected ? '#1E3D6E' : isAudioActive ? '#D4AF37' : colors.border}`,
    color: colors.text,
    fontStyle: state === WordState.IGNORED ? 'italic' : 'normal',
    opacity: state === WordState.IGNORED ? 0.6 : 1,
    // Only transition color and background, not all properties
    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  };
}

const LONG_PRESS_MS = 500;

const ReaderToken = memo(function ReaderToken({
  token,
  sentenceText,
  sentenceIndex,
  readingMode,
  fontSize,
  wordInfo,
  isAudioActive,
  maskKnown,
  highlightIntensity,
  isSelected,
  showTranslit,
  interlinearMode,
  displayMode,
  showGlossTooltip,
  glossTooltipForKnown,
  onWordClick,
  onWordHover,
  onWordLeave,
  onWordContextMenu,
}: {
  token: ReaderToken;
  sentenceText: string;
  sentenceIndex: number;
  readingMode: 'scroll' | 'page';
  fontSize: number;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  showTranslit: boolean;
  maskKnown: boolean;
  interlinearMode?: boolean;
  displayMode?: DisplayMode;
  wordInfo: WordInfo | WordState | null;
  isAudioActive: boolean;
  isSelected: boolean;
  showGlossTooltip?: boolean;
  glossTooltipForKnown?: boolean;
  onWordClick: (token: ReaderToken, sentenceText: string, sentenceIndex: number) => void;
  onWordHover: (token: ReaderToken, x: number, y: number) => void;
  onWordLeave: () => void;
  onWordContextMenu: (token: ReaderToken, x: number, y: number) => void;
}) {
  const isMorphologyMode = displayMode === 'morphology';
  const state = normalizeWordState(
    wordInfo ? (typeof wordInfo === 'object' ? wordInfo.state : wordInfo) : WordState.NEW
  );
  const isKnown = state === WordState.KNOWN;
  const gloss = token.gloss;
  const showGloss = showGlossTooltip && !!gloss && (glossTooltipForKnown || !isKnown);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseStyle: React.CSSProperties = {
    fontSize: readingMode === 'page' ? `${fontSize * 1.2}px` : `${fontSize}px`,
    borderBottom: '2px solid transparent',
    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  };

  const tokenStyle: React.CSSProperties = isMorphologyMode
    ? { ...baseStyle, ...(getPosStyle(token) ?? {}) }
    : {
        ...baseStyle,
        ...getWordStyle(wordInfo, isAudioActive, maskKnown, highlightIntensity, isSelected),
      };

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top;
      if (isMorphologyMode) {
        onWordHover(token, cx, cy);
      } else if (showGloss && gloss) {
        onWordHover({ ...token, gloss }, cx, cy);
      }
    },
    [isMorphologyMode, showGloss, gloss, token, onWordHover]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.preventDefault();
      onWordContextMenu(token, e.clientX, e.clientY);
    },
    [token, onWordContextMenu]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLSpanElement>) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      longPressTimer.current = setTimeout(() => {
        onWordContextMenu(token, x, y);
      }, LONG_PRESS_MS);
    },
    [token, onWordContextMenu]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <span className="inline">
      {token.punctBefore && <span className="opacity-40">{token.punctBefore}</span>}
      <span
        onClick={() => onWordClick(token, sentenceText, sentenceIndex)}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onWordLeave}
        className="cursor-pointer px-1 rounded-sm inline-flex flex-col items-center align-top leading-none"
        style={tokenStyle}
      >
        <bdi className="leading-tight mb-1">{token.text}</bdi>
        {showTranslit && token.translit && (
          <span className="text-[0.45em] text-muted opacity-70 font-sans tracking-wide">
            {token.translit}
          </span>
        )}
        {(interlinearMode || displayMode === 'interlinear') && gloss && (
          <span
            dir="ltr"
            className="text-[0.42em] text-blue/70 font-sans tracking-wide leading-tight"
          >
            {gloss}
          </span>
        )}
      </span>
      {token.punctAfter !== undefined && token.punctAfter !== null ? (
        <span className="opacity-40 whitespace-pre-wrap">{token.punctAfter}</span>
      ) : (
        <span> </span>
      )}
    </span>
  );
});

export function ReadingPane({
  sentences,
  readingMode,
  currentSentenceIndex,
  fontSize,
  highlightIntensity,
  getWordInfo,
  selectedWordId,
  showTranslit,
  showParallel,
  maskKnown,
  isHebrewFont,
  isRtl,
  audioPos,
  aiTranslations,
  translatingId,
  sourceKind,
  textTitle,
  sectionLabel,
  hasMorphology,
  sentenceCount,
  analysisStatus,
  showGlossTooltip,
  glossTooltipForKnown,
  interlinearMode,
  displayMode,
  onWordClick,
  onWordContextMenu,
  onAITranslate,
  onSavePhrase,
  onAnalyzeSentence,
  onMarkPageKnown,
  onNextPage,
  onNextChapter,
  onBackToLibrary,
  onSwipe,
  currentScrollPage,
  totalPages,
  currentChapterIndex,
  totalChapters,
  sentenceSliceStart,
  onSentenceNote,
  notedSentenceIds,
  onBookmarkSentence,
  bookmarkedSentenceIds,
}: Props) {
  const { t } = useTranslation();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const isMorphologyMode = displayMode === 'morphology';
  const isFocusMode = displayMode === 'focus';

  const [hoverToken, setHoverToken] = useState<{ token: ReaderToken; x: number; y: number } | null>(
    null
  );

  const handleWordHover = useCallback((token: ReaderToken, x: number, y: number) => {
    setHoverToken({ token, x, y });
  }, []);
  const handleWordLeave = useCallback(() => {
    setHoverToken(null);
  }, []);

  // Per-paragraph unknown-word density for difficulty heatmap.
  // Group sentences into paragraphs of ~5 sentences and compute the ratio of
  // unknown/new tokens to total content tokens.
  const sentenceDifficulty = useMemo(() => {
    return sentences.map((s) => {
      const content = s.tokens.filter((t) => t.type !== 'whitespace' && t.type !== 'punctuation');
      if (content.length === 0) return 0;
      const unknown = content.filter((t) => {
        const info = getWordInfo(t.lemma || t.text);
        const state = normalizeWordState(
          info ? (typeof info === 'object' ? (info as any).state : info) : WordState.NEW
        );
        return state === WordState.NEW || state === WordState.SEEN;
      }).length;
      return unknown / content.length;
    });
  }, [sentences, getWordInfo]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const SWIPE_THRESHOLD = 60;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        onSwipe(dx > 0 ? 'right' : 'left');
      }
    },
    [onSwipe]
  );

  // Precompute sentence texts once per sentence to avoid recomputation
  const processedSentences = useMemo(() => {
    return sentences.map((sentence) => ({
      ...sentence,
      _cachedText: sentence._cachedText || sentence.tokens.map((t) => t.text).join(' '),
    }));
  }, [sentences]);

  // Windowing for page mode - only render nearby sentences
  const visibleSentences = useMemo(() => {
    if (readingMode !== 'page') return processedSentences;

    const WINDOW_SIZE = 5; // Show 5 sentences around current
    const start = Math.max(0, currentSentenceIndex - WINDOW_SIZE);
    const end = Math.min(processedSentences.length, currentSentenceIndex + WINDOW_SIZE + 1);
    return processedSentences.slice(start, end).map((s, i) => ({
      ...s,
      _displayOffset: start + i - currentSentenceIndex, // Track position relative to current
    }));
  }, [processedSentences, readingMode, currentSentenceIndex]);

  return (
    <div
      id="reading-area-scroll"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 overflow-y-auto px-4 md:px-12 py-8 md:py-16 scroll-smooth bg-transparent relative"
    >
      <div
        className={cn(
          'mx-auto transition-all w-full',
          showParallel ? 'max-w-screen-xl lg:grid grid-cols-2 gap-8 items-center' : 'max-w-3xl'
        )}
      >
        {/* Metadata strip — always visible so the user knows exactly what they're reading */}
        <div className="col-span-full mb-5 flex flex-wrap items-start gap-x-4 gap-y-1">
          <div className="flex flex-col leading-tight">
            {textTitle && <span className="text-[13px] font-bold text-ink">{textTitle}</span>}
            {sectionLabel && <span className="text-[11px] text-muted">{sectionLabel}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            {sourceKind === 'sample' && (
              <span className="inline-block bg-amber/10 text-amber text-tiny font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Sample Excerpt
              </span>
            )}
            {sourceKind === 'partial' && (
              <span className="inline-block bg-blue/10 text-blue text-tiny font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Partial Section
              </span>
            )}
            {sourceKind === 'complete' && (
              <span className="inline-block bg-green-100 text-green-700 text-tiny font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
            {sourceKind === 'import' && (
              <span className="inline-block bg-purple-100 text-purple-700 text-tiny font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Your Import
              </span>
            )}
            <span className="text-tiny text-muted">
              {sentenceCount} {sentenceCount === 1 ? 'sentence' : 'sentences'}
            </span>
            {hasMorphology && analysisStatus !== 'raw' && (
              <span className="text-tiny text-muted">· Morphology</span>
            )}
            {(analysisStatus === 'raw' || analysisStatus === 'needs_ai') && (
              <span className="inline-block bg-amber/10 text-amber text-tiny font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                AI analysis unavailable
              </span>
            )}
          </div>
        </div>
        <div className="col-span-1 border-r-0 lg:border-r border-bdr/40 lg:pr-8">
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={cn(
              'font-serif tracking-wide transition-all',
              isHebrewFont ? 'font-hebrew' : '',
              isRtl ? 'text-right' : 'text-left',
              readingMode === 'page' ? 'text-[24px] leading-[2.5]' : 'leading-[2.2]'
            )}
          >
            {visibleSentences.map((sentence, idx) => {
              const sIdx =
                sentenceSliceStart +
                (readingMode === 'page'
                  ? currentSentenceIndex + (sentence._displayOffset || 0)
                  : idx);
              const isActivePageMode =
                readingMode === 'page' ? sentence._displayOffset === 0 : true;
              const sentenceText = sentence._cachedText;
              const difficulty = sentenceDifficulty[sIdx] ?? 0;

              // Difficulty heatmap: left border color when not in focus mode
              const difficultyBorderColor =
                !isFocusMode && difficulty > 0
                  ? difficulty >= 0.6
                    ? 'border-l-red-400'
                    : difficulty >= 0.35
                      ? 'border-l-amber-400'
                      : difficulty >= 0.1
                        ? 'border-l-blue-300'
                        : 'border-l-green-300'
                  : '';

              return (
                <span
                  id={`sentence-${sIdx}`}
                  key={sentence.id}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 48px' }}
                  className={cn(
                    'group inline transition-opacity duration-500',
                    isRtl ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3',
                    !isActivePageMode && readingMode === 'page' ? 'opacity-30' : 'opacity-100',
                    !isFocusMode && difficultyBorderColor
                      ? `border-l-2 pl-1 ${difficultyBorderColor}`
                      : ''
                  )}
                >
                  {sentence.tokens.map((token, tIdx) => {
                    if (token.type === 'whitespace') {
                      return (
                        <span key={token.id} className="whitespace-pre">
                          {' '}
                        </span>
                      );
                    }
                    const isAudioActive =
                      audioPos.sentenceIdx === sIdx && audioPos.wordIdx === tIdx;

                    return (
                      <ReaderToken
                        key={token.id}
                        token={token}
                        sentenceText={sentenceText}
                        sentenceIndex={sIdx}
                        readingMode={readingMode}
                        fontSize={fontSize}
                        wordInfo={getWordInfo(token.lemma)}
                        isAudioActive={isAudioActive}
                        maskKnown={isFocusMode ? false : maskKnown}
                        highlightIntensity={highlightIntensity}
                        isSelected={selectedWordId === token.id}
                        showTranslit={isFocusMode ? false : showTranslit}
                        interlinearMode={interlinearMode}
                        displayMode={displayMode}
                        showGlossTooltip={showGlossTooltip}
                        glossTooltipForKnown={glossTooltipForKnown}
                        onWordClick={onWordClick}
                        onWordHover={handleWordHover}
                        onWordLeave={handleWordLeave}
                        onWordContextMenu={onWordContextMenu}
                      />
                    );
                  })}
                  {onSentenceNote && isActivePageMode && (
                    <button
                      onClick={() => onSentenceNote(sentence, sIdx)}
                      title="Add note to this sentence"
                      className={cn(
                        'inline-flex items-center justify-center align-middle w-5 h-5 rounded-sm ml-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
                        notedSentenceIds?.has(sentence.id)
                          ? 'opacity-100 text-gold'
                          : 'text-muted hover:text-ink2'
                      )}
                    >
                      <StickyNote className="w-3 h-3" />
                    </button>
                  )}
                  {onBookmarkSentence && isActivePageMode && (
                    <button
                      onClick={() => onBookmarkSentence(sentence, sIdx)}
                      title="Bookmark this sentence"
                      className={cn(
                        'inline-flex items-center justify-center align-middle w-5 h-5 rounded-sm ml-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
                        bookmarkedSentenceIds?.has(sentence.id)
                          ? 'opacity-100 text-amber'
                          : 'text-muted hover:text-amber'
                      )}
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}

            {readingMode === 'scroll' && (
              <>
                <div className="text-muted text-center opacity-30 text-[24px] mt-12 mb-8">❦</div>
                <div className="flex flex-col items-center gap-6 mt-12 pb-24">
                  {currentScrollPage >= totalPages - 1 ? (
                    /* Only show end-of-text messaging on the final chunk of the lesson */
                    currentChapterIndex >= totalChapters - 1 ? (
                      <div className="text-center">
                        <h4 className="font-serif text-[24px] text-ink mb-2">
                          {sourceKind === 'import'
                            ? t('reader.endOfImport', 'End of your imported text.')
                            : sourceKind === 'sample'
                              ? t('reader.endOfSample', 'End of sample excerpt.')
                              : sourceKind === 'partial'
                                ? t('reader.endOfAvailableSection', 'End of available section.')
                                : t('reader.endOfChapter', 'End of chapter.')}
                        </h4>
                        <p className="text-muted text-[14px]">
                          {sourceKind === 'import'
                            ? t('reader.importMoreText', 'Import More Text')
                            : sourceKind === 'sample'
                              ? t('reader.fullText', 'Full Text')
                              : sourceKind === 'partial'
                                ? t('reader.noNextSection', 'No next section is available yet.')
                                : t('reader.finishedText', "You've finished this text.")}
                        </p>
                      </div>
                    ) : null /* intermediate sections: no heading, just nav buttons */
                  ) : (
                    <div className="text-center">
                      <h4 className="font-serif text-[20px] text-ink mb-2">
                        {t('reader.endOfPage', 'End of Page {{current}} of {{total}}', {
                          current: currentScrollPage + 1,
                          total: totalPages,
                        })}
                      </h4>
                    </div>
                  )}
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button
                      onClick={() => onMarkPageKnown()}
                      className="px-8 py-3 bg-blue text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      {currentScrollPage >= totalPages - 1
                        ? sourceKind === 'import'
                          ? t('reader.markTextSeen', 'Mark Text as Seen')
                          : sourceKind === 'sample'
                            ? t('reader.markSampleSeen', 'Mark Sample as Seen')
                            : sourceKind === 'partial'
                              ? t('reader.markSectionSeen', 'Mark Section as Seen')
                              : t('reader.markChapterSeen', 'Mark Chapter as Seen')
                        : t('reader.markPageKnown', 'Mark Page as Seen & Next')}
                    </button>
                    {/* Next section — only shown when a real next section exists */}
                    {currentScrollPage >= totalPages - 1 &&
                      currentChapterIndex < totalChapters - 1 && (
                        <button
                          onClick={onNextChapter}
                          className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                        >
                          {t('reader.nextSection', 'Next Section')}
                        </button>
                      )}
                    {/* Back to library / import — shown when there is no next section */}
                    {currentScrollPage >= totalPages - 1 &&
                      currentChapterIndex >= totalChapters - 1 && (
                        <button
                          onClick={onBackToLibrary}
                          className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                        >
                          {sourceKind === 'import'
                            ? t('reader.importMoreText', 'Import More Text')
                            : t('common.backToLibrary', 'Back to Library')}
                        </button>
                      )}
                    {currentScrollPage < totalPages - 1 && (
                      <button
                        onClick={onNextPage}
                        className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                      >
                        {t('reader.nextSection', 'Next Section')}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showParallel && (
          <div className="col-span-1 pt-8 lg:pt-0 pb-16">
            {visibleSentences.map((sentence, idx) => {
              // Note: sIdx computed but not needed for parallel view
              const isActivePageMode =
                readingMode === 'page' ? sentence._displayOffset === 0 : true;

              return (
                <div
                  key={`par-${sentence.id}`}
                  data-sentence-idx={sentenceSliceStart + idx}
                  className={cn(
                    'font-serif text-ink2 mb-3 transition-opacity duration-500',
                    readingMode === 'page'
                      ? 'text-[20px] leading-[2.2]'
                      : 'text-[18px] leading-[2.2]',
                    !isActivePageMode && readingMode === 'page'
                      ? 'opacity-20'
                      : 'opacity-80 hover:opacity-100'
                  )}
                >
                  {aiTranslations[sentence.id] ? (
                    aiTranslations[sentence.id]
                  ) : (
                    <div className="flex flex-col gap-1 items-start">
                      {sentence.parallel && !sentence.parallel.includes('No parallel text') && (
                        <div>{sentence.parallel}</div>
                      )}
                      <button
                        onClick={() => onAITranslate(sentence.id, sentence.tokens)}
                        disabled={translatingId === sentence.id}
                        className="text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 bg-blue/5 text-blue font-medium rounded-lg hover:bg-blue/10 transition-colors disabled:opacity-50 mt-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {translatingId === sentence.id ? 'Translating...' : 'Ask AI to Translate'}
                      </button>
                      <button
                        onClick={() => onSavePhrase(sentence)}
                        className="text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 bg-amber/5 text-amber font-medium rounded-lg hover:bg-amber/10 transition-colors mt-1"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        Save as Phrase
                      </button>
                      {onAnalyzeSentence && (
                        <button
                          onClick={() =>
                            onAnalyzeSentence({
                              id: sentence.id,
                              text: sentence.tokens
                                .filter((tk) => tk.type === 'word')
                                .map((tk) => tk.text)
                                .join(' '),
                            })
                          }
                          className="text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Analyze Sentence
                        </button>
                      )}
                      {onBookmarkSentence && (
                        <button
                          onClick={() => onBookmarkSentence(sentence, sentenceSliceStart + idx)}
                          className={cn(
                            'text-sm font-sans flex items-center justify-center gap-1.5 px-3 py-1 font-medium rounded-lg transition-colors mt-1',
                            bookmarkedSentenceIds?.has(sentence.id)
                              ? 'bg-amber/15 text-amber'
                              : 'bg-parch2 text-ink3 hover:bg-parch3'
                          )}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          {bookmarkedSentenceIds?.has(sentence.id) ? 'Bookmarked' : 'Bookmark'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isMorphologyMode ? (
        <MorphologyTooltip
          word={hoverToken?.token.text ?? ''}
          lemma={hoverToken?.token.lemma ?? ''}
          gloss={hoverToken?.token.gloss}
          morphology={hoverToken?.token.morphology}
          pos={hoverToken?.token.pos}
          x={hoverToken?.x ?? 0}
          y={hoverToken?.y ?? 0}
          visible={hoverToken !== null}
        />
      ) : (
        <GlossTooltip
          text={hoverToken?.token.gloss ?? null}
          x={hoverToken?.x ?? 0}
          y={hoverToken?.y ?? 0}
          visible={hoverToken !== null && !isMorphologyMode}
        />
      )}
    </div>
  );
}
