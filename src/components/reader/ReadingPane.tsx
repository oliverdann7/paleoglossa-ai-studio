import { memo, useRef, useCallback, useMemo, useState } from 'react';
import { Sparkles, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, STATE_COLORS } from '@/lib/constants/wordStates';
import { GlossTooltip } from './GlossTooltip';

interface TokenData {
  id: string;
  text: string;
  lemma: string;
  gloss?: string;
  translit?: string;
  punctBefore?: string;
  punctAfter?: string;
  type?: string;
}

interface SentenceData {
  id: string;
  tokens: TokenData[];
  translation?: string;
  parallel?: string;
  _cachedText?: string;
  _displayOffset?: number;
}

type SourceKind = 'import' | 'sample' | 'partial' | 'complete';

interface Props {
  sentences: SentenceData[];
  readingMode: 'scroll' | 'page';
  currentSentenceIndex: number;
  fontSize: number;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  getWordInfo: (lemma: string) => any;
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
  onWordClick: (token: TokenData, sentenceText: string, sentenceIndex: number) => void;
  onAITranslate: (sentenceId: string, tokens: TokenData[]) => void;
  onSavePhrase: (sentence: SentenceData) => void;
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
  isSelected: boolean,
) {
  const state = wordInfo ? (typeof wordInfo === 'object' ? wordInfo.state : wordInfo) : WordState.NEW;
  const isKnown = state === WordState.KNOWN;
  const colors = STATE_COLORS[state as WordState] || STATE_COLORS[WordState.NEW];

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
    backgroundColor: isSelected ? '#1E3D6E33' : colors.bg === 'transparent' ? 'transparent' : `${colors.bg}${bgOpacity}`,
    borderBottom: `2px solid ${isSelected ? '#1E3D6E' : isAudioActive ? '#D4AF37' : colors.border}`,
    color: colors.text,
    fontStyle: state === WordState.IGNORED ? 'italic' : 'normal',
    opacity: state === WordState.IGNORED ? 0.6 : 1,
    // Only transition color and background, not all properties
    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  };
}

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
  showGlossTooltip,
  glossTooltipForKnown,
  onWordClick,
  onWordHover,
  onWordLeave,
}: {
  token: TokenData;
  sentenceText: string;
  sentenceIndex: number;
  readingMode: 'scroll' | 'page';
  fontSize: number;
  wordInfo: any;
  isAudioActive: boolean;
  maskKnown: boolean;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  isSelected: boolean;
  showTranslit: boolean;
  interlinearMode?: boolean;
  showGlossTooltip?: boolean;
  glossTooltipForKnown?: boolean;
  onWordClick: (token: TokenData, sentenceText: string, sentenceIndex: number) => void;
  onWordHover: (gloss: string, x: number, y: number) => void;
  onWordLeave: () => void;
}) {
  const state = wordInfo ? (typeof wordInfo === 'object' ? wordInfo.state : wordInfo) : WordState.NEW;
  const isKnown = state === WordState.KNOWN;
  const gloss = token.gloss;
  const showTooltip = showGlossTooltip && !!gloss && (glossTooltipForKnown || !isKnown);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (!showTooltip) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onWordHover(gloss!, rect.left + rect.width / 2, rect.top);
  }, [showTooltip, gloss, onWordHover]);

  return (
    <span key={token.id} className="inline">
      {token.punctBefore && <span className="opacity-40">{token.punctBefore}</span>}
      <span
        onClick={() => onWordClick(token, sentenceText, sentenceIndex)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onWordLeave}
        className="cursor-pointer transition-all px-1 rounded-sm inline-flex flex-col items-center align-top leading-none"
        style={{
          fontSize: readingMode === 'page' ? `${fontSize * 1.2}px` : `${fontSize}px`,
          ...getWordStyle(wordInfo, isAudioActive, maskKnown, highlightIntensity, isSelected),
        }}
      >
        <bdi className="leading-tight mb-1">{token.text}</bdi>
        {showTranslit && token.translit && (
          <span className="text-[0.45em] text-muted opacity-70 font-sans tracking-wide">
            {token.translit}
          </span>
        )}
        {interlinearMode && gloss && (
          <span dir="ltr" className="text-[0.42em] text-blue/70 font-sans tracking-wide leading-tight">
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
   sentences, readingMode, currentSentenceIndex, fontSize, highlightIntensity,
   getWordInfo, selectedWordId, showTranslit, showParallel, maskKnown,
   isHebrewFont, isRtl, audioPos,
   aiTranslations, translatingId,
   sourceKind, textTitle, sectionLabel, hasMorphology, sentenceCount, analysisStatus,
   showGlossTooltip, glossTooltipForKnown, interlinearMode,
   onWordClick, onAITranslate, onSavePhrase,
   onMarkPageKnown, onNextPage, onNextChapter, onBackToLibrary, onSwipe,
   currentScrollPage, totalPages, currentChapterIndex, totalChapters,
   sentenceSliceStart,
}: Props) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const [hoverGloss, setHoverGloss] = useState<{ text: string; x: number; y: number } | null>(null);
  const handleWordHover = useCallback((gloss: string, x: number, y: number) => {
    setHoverGloss({ text: gloss, x, y });
  }, []);
  const handleWordLeave = useCallback(() => { setHoverGloss(null); }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const SWIPE_THRESHOLD = 60;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onSwipe(dx > 0 ? 'right' : 'left');
    }
  }, [onSwipe]);

  // Precompute sentence texts once per sentence to avoid recomputation
  const processedSentences = useMemo(() => {
    return sentences.map(sentence => ({
      ...sentence,
      _cachedText: sentence._cachedText || sentence.tokens.map(t => t.text).join(' ')
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
      _displayOffset: start + i - currentSentenceIndex // Track position relative to current
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
          "mx-auto transition-all w-full",
          showParallel ? "max-w-screen-xl lg:grid grid-cols-2 gap-8 items-center" : "max-w-3xl",
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
              <span className="inline-block bg-amber/10 text-amber text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Sample Excerpt
              </span>
            )}
            {sourceKind === 'partial' && (
              <span className="inline-block bg-blue/10 text-blue text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Partial Section
              </span>
            )}
            {sourceKind === 'complete' && (
              <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
            {sourceKind === 'import' && (
              <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                Your Import
              </span>
            )}
            <span className="text-[10px] text-muted">{sentenceCount} {sentenceCount === 1 ? 'sentence' : 'sentences'}</span>
            {hasMorphology && analysisStatus !== 'raw' && (
              <span className="text-[10px] text-muted">· Morphology</span>
            )}
            {(analysisStatus === 'raw' || analysisStatus === 'needs_ai') && (
              <span className="inline-block bg-amber/10 text-amber text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                AI analysis unavailable
              </span>
            )}
          </div>
        </div>
        <div className="col-span-1 border-r-0 lg:border-r border-bdr/40 lg:pr-8">
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={cn(
              "font-serif tracking-wide transition-all",
              isHebrewFont ? "font-hebrew" : "",
              isRtl ? "text-right" : "text-left",
              readingMode === 'page' ? "text-[24px] leading-[2.5]" : "leading-[2.2]",
            )}
          >
            {visibleSentences.map((sentence, idx) => {
              const sIdx = sentenceSliceStart + (readingMode === 'page' 
                ? (currentSentenceIndex + (sentence._displayOffset || 0)) 
                : idx);
              const isActivePageMode = readingMode === 'page' 
                ? (sentence._displayOffset === 0) 
                : true;
              const sentenceText = sentence._cachedText;

              return (
                <span
                  id={`sentence-${sIdx}`}
                  key={sentence.id}
                  className={cn(
                    "inline transition-opacity duration-500",
                    isRtl ? "ml-2 md:ml-3" : "mr-2 md:mr-3",
                    !isActivePageMode && readingMode === 'page' ? "opacity-30" : "opacity-100",
                  )}
                >
                  {sentence.tokens.map((token, tIdx) => {
                    if (token.type === 'whitespace') {
                      return <span key={token.id} className="whitespace-pre"> </span>;
                    }
                    const isAudioActive = audioPos.sentenceIdx === sIdx && audioPos.wordIdx === tIdx;

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
                        maskKnown={maskKnown}
                        highlightIntensity={highlightIntensity}
                        isSelected={selectedWordId === token.id}
                        showTranslit={showTranslit}
                        interlinearMode={interlinearMode}
                        showGlossTooltip={showGlossTooltip}
                        glossTooltipForKnown={glossTooltipForKnown}
                        onWordClick={onWordClick}
                        onWordHover={handleWordHover}
                        onWordLeave={handleWordLeave}
                      />
                    );
                  })}
                </span>
              );
            })}

            {readingMode === 'scroll' && (
              <>
                <div className="text-muted text-center opacity-30 text-[24px] mt-12 mb-8">❦</div>
                <div className="flex flex-col items-center gap-6 mt-12 pb-24">
                  {currentScrollPage >= totalPages - 1 ? (
                    <div className="text-center">
                      <h4 className="font-serif text-[24px] text-ink mb-2">
                        {sourceKind === 'import'
                          ? 'End of your imported text.'
                          : sourceKind === 'sample'
                            ? 'End of sample excerpt.'
                            : currentChapterIndex < totalChapters - 1
                              ? 'End of this section.'
                              : sourceKind === 'partial'
                                ? 'End of available section.'
                                : 'End of chapter.'}
                      </h4>
                      <p className="text-muted text-[14px]">
                        {sourceKind === 'import'
                          ? 'You can import more text from the library.'
                          : sourceKind === 'sample'
                            ? 'The full text is available in the library.'
                            : currentChapterIndex < totalChapters - 1
                              ? 'Ready to move on to the next section?'
                              : sourceKind === 'partial'
                                ? 'No next section is available yet.'
                                : "You've finished this text."}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h4 className="font-serif text-[20px] text-ink mb-2">
                        End of Page {currentScrollPage + 1} of {totalPages}
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
                          ? 'Mark Text as Seen'
                          : sourceKind === 'sample'
                            ? 'Mark Sample as Seen'
                            : sourceKind === 'partial'
                              ? 'Mark Section as Seen'
                              : 'Mark Chapter as Seen'
                        : 'Mark Page as Seen & Next'}
                    </button>
                    {/* Next section — only shown when a real next section exists */}
                    {currentScrollPage >= totalPages - 1 && currentChapterIndex < totalChapters - 1 && (
                      <button
                        onClick={onNextChapter}
                        className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                      >
                        Next Section
                      </button>
                    )}
                    {/* Back to library / import — shown when there is no next section */}
                    {currentScrollPage >= totalPages - 1 && currentChapterIndex >= totalChapters - 1 && (
                      <button
                        onClick={onBackToLibrary}
                        className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                      >
                        {sourceKind === 'import' ? 'Import More Text' : 'Back to Library'}
                      </button>
                    )}
                    {currentScrollPage < totalPages - 1 && (
                      <button
                        onClick={onNextPage}
                        className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                      >
                        Next Page
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
              const isActivePageMode = readingMode === 'page' 
                ? (sentence._displayOffset === 0) 
                : true;

              return (
                <div
                  key={`par-${sentence.id}`}
                  data-sentence-idx={sentenceSliceStart + idx}
                  className={cn(
                    "font-serif text-ink2 mb-3 transition-opacity duration-500",
                    readingMode === 'page' ? "text-[20px] leading-[2.2]" : "text-[18px] leading-[2.2]",
                    !isActivePageMode && readingMode === 'page' ? "opacity-20" : "opacity-80 hover:opacity-100",
                  )}
                >
                  {aiTranslations[sentence.id] ? (
                    aiTranslations[sentence.id]
                  ) : (
                    <div className="flex flex-col gap-1 items-start">
                      {sentence.parallel && !sentence.parallel.includes('No parallel text') && <div>{sentence.parallel}</div>}
                      {sentence.translation && !sentence.translation.includes('No translation') && <div>{sentence.translation}</div>}
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <GlossTooltip
        text={hoverGloss?.text ?? null}
        x={hoverGloss?.x ?? 0}
        y={hoverGloss?.y ?? 0}
        visible={hoverGloss !== null}
      />
    </div>
  );
}
