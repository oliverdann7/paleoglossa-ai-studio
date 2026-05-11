import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordState, STATE_COLORS } from '@/lib/constants/wordStates';

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
}

interface Props {
  sentences: SentenceData[];
  readingMode: 'scroll' | 'page';
  currentSentenceIndex: number;
  fontSize: number;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  knowledge: Record<string, any>;
  selectedWordId?: string;
  showTranslit: boolean;
  showParallel: boolean;
  maskKnown: boolean;
  isHebrewFont: boolean;
  isRtl: boolean;
  audioPos: { sentenceIdx: number; wordIdx: number };
  aiTranslations: Record<string, string>;
  translatingId: string | null;
  onWordClick: (token: TokenData, sentenceText: string, sentenceIndex: number) => void;
  onAITranslate: (sentenceId: string, tokens: TokenData[]) => void;
  onSavePhrase: (sentence: SentenceData) => void;
  onMarkPageKnown: () => void;
  onNextPage: () => void;
  onNextChapter: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  currentScrollPage: number;
  totalPages: number;
  currentChapterIndex: number;
  totalChapters: number;
  sentenceSliceStart: number;
}

function getWordStyle(
  token: TokenData,
  knowledge: Record<string, any>,
  isAudioActive: boolean,
  maskKnown: boolean,
  highlightIntensity: 'subtle' | 'normal' | 'strong',
  selectedWordId?: string,
) {
  const info = knowledge[token.lemma];
  const state = info ? (typeof info === 'object' ? info.state : info) : WordState.NEW;
  const isSelected = selectedWordId === token.id;
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
    transition: 'all 0.15s ease',
  };
}

export function ReadingPane({
  sentences, readingMode, currentSentenceIndex, fontSize, highlightIntensity,
  knowledge, selectedWordId, showTranslit, showParallel, maskKnown,
  isHebrewFont, isRtl, audioPos,
  aiTranslations, translatingId,
  onWordClick, onAITranslate, onSavePhrase,
  onMarkPageKnown, onNextPage, onNextChapter, onSwipe,
  currentScrollPage, totalPages, currentChapterIndex, totalChapters,
  sentenceSliceStart,
}: Props) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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
            {sentences.map((sentence, idx) => {
              const sIdx = sentenceSliceStart + idx;
              const isActivePageMode = readingMode === 'page' ? sIdx === currentSentenceIndex : true;

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
                    const sentenceText = sentence.tokens.map(t => t.text).join(' ');

                    return (
                      <span key={token.id} className="inline">
                        {token.punctBefore && <span className="opacity-40">{token.punctBefore}</span>}
                        <motion.span
                          layoutId={`word-${token.id}`}
                          onClick={() => onWordClick(token, sentenceText, sIdx)}
                          className="cursor-pointer transition-all px-1 rounded-sm inline-flex flex-col items-center align-top leading-none"
                          style={{
                            fontSize: readingMode === 'page' ? `${fontSize * 1.2}px` : `${fontSize}px`,
                            ...getWordStyle(token, knowledge, isAudioActive, maskKnown, highlightIntensity, selectedWordId),
                          }}
                        >
                          <bdi className="leading-tight mb-1">{token.text}</bdi>
                          {showTranslit && token.translit && (
                            <span className="text-[0.45em] text-muted opacity-70 font-sans tracking-wide">
                              {token.translit}
                            </span>
                          )}
                        </motion.span>
                        {token.punctAfter !== undefined && token.punctAfter !== null ? (
                          <span className="opacity-40 whitespace-pre-wrap">{token.punctAfter}</span>
                        ) : (
                          <span> </span>
                        )}
                      </span>
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
                        You've reached the end of this chapter.
                      </h4>
                      <p className="text-muted text-[14px]">Ready to move on to the next one?</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h4 className="font-serif text-[20px] text-ink mb-2">
                        End of Page {currentScrollPage + 1} of {totalPages}
                      </h4>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => onMarkPageKnown()}
                      className="px-8 py-3 bg-blue text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      {currentScrollPage >= totalPages - 1
                        ? 'Mark Chapter as Seen & Finish'
                        : 'Mark Page as Seen & Next'}
                    </button>
                    {currentScrollPage >= totalPages - 1 && currentChapterIndex < totalChapters - 1 && (
                      <button
                        onClick={onNextChapter}
                        className="px-8 py-3 bg-parch3 text-ink2 rounded-2xl font-bold border border-bdr/50 hover:bg-parch2 transition-all active:scale-95"
                      >
                        Next Chapter
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
            {sentences.map((sentence, idx) => {
              const sIdx = sentenceSliceStart + idx;
              const isActivePageMode = readingMode === 'page' ? sIdx === currentSentenceIndex : true;

              return (
                <div
                  key={`par-${sentence.id}`}
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
    </div>
  );
}
