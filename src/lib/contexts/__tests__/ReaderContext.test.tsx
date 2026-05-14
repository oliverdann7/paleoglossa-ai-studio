import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReaderState, ReaderStateProvider } from '../ReaderContext';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <ReaderStateProvider>{children}</ReaderStateProvider>;
}

describe('ReaderStateProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default state', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    expect(result.current.state.display.mode).toBe('scroll');
    expect(result.current.state.display.showTranslit).toBe(false);
    expect(result.current.state.display.fontSize).toBe(18);
    expect(result.current.state.navigation.textId).toBeNull();
    expect(result.current.state.navigation.currentChapterIndex).toBe(0);
    expect(result.current.state.audio.isPlaying).toBe(false);
    expect(result.current.state.audio.speed).toBe(1.0);
  });

  it('toggles translit display', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setShowTranslit(true));
    expect(result.current.state.display.showTranslit).toBe(true);
    act(() => result.current.setShowTranslit(false));
    expect(result.current.state.display.showTranslit).toBe(false);
  });

  it('toggles parallel display', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setShowParallel(true));
    expect(result.current.state.display.showParallel).toBe(true);
  });

  it('toggles mask known', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setMaskKnown(true));
    expect(result.current.state.display.maskKnown).toBe(true);
  });

  it('toggles interlinear mode', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setInterlinearMode(true));
    expect(result.current.state.display.interlinearMode).toBe(true);
  });

  it('sets font size', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setFontSize(24));
    expect(result.current.state.display.fontSize).toBe(24);
  });

  it('sets reading mode', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setMode('page'));
    expect(result.current.state.display.mode).toBe('page');
    act(() => result.current.setMode('scroll'));
    expect(result.current.state.display.mode).toBe('scroll');
  });

  it('sets highlight intensity', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setHighlightIntensity('subtle'));
    expect(result.current.state.display.highlightIntensity).toBe('subtle');
    act(() => result.current.setHighlightIntensity('strong'));
    expect(result.current.state.display.highlightIntensity).toBe('strong');
  });

  it('sets swipe moves to next', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setSwipeMovesToNext(false));
    expect(result.current.state.display.swipeMovesToNext).toBe(false);
  });

  it('sets text id and resets navigation', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setTextId('john-1'));
    expect(result.current.state.navigation.textId).toBe('john-1');
    expect(result.current.state.navigation.currentChapterIndex).toBe(0);
    expect(result.current.state.navigation.currentSentenceIndex).toBe(0);
  });

  it('sets chapter index and resets scroll state', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setChapterIndex(2));
    expect(result.current.state.navigation.currentChapterIndex).toBe(2);
    expect(result.current.state.navigation.currentScrollPage).toBe(0);
    expect(result.current.state.navigation.currentSentenceIndex).toBe(0);
  });

  it('sets sentence index', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setSentenceIndex(5));
    expect(result.current.state.navigation.currentSentenceIndex).toBe(5);
  });

  it('sets scroll page', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setScrollPage(3));
    expect(result.current.state.navigation.currentScrollPage).toBe(3);
  });

  it('sets scroll progress', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setScrollProgress(42));
    expect(result.current.state.navigation.scrollProgress).toBe(42);
  });

  it('goes to next sentence', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.goToNextSentence(10));
    expect(result.current.state.navigation.currentSentenceIndex).toBe(1);
    act(() => result.current.goToNextSentence(10));
    expect(result.current.state.navigation.currentSentenceIndex).toBe(2);
  });

  it('does not advance past the last sentence', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setSentenceIndex(9));
    act(() => result.current.goToNextSentence(10));
    expect(result.current.state.navigation.currentSentenceIndex).toBe(9);
  });

  it('goes to previous sentence', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setSentenceIndex(5));
    act(() => result.current.goToPrevSentence());
    expect(result.current.state.navigation.currentSentenceIndex).toBe(4);
  });

  it('does not go below sentence 0', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.goToPrevSentence());
    expect(result.current.state.navigation.currentSentenceIndex).toBe(0);
  });

  it('goes to next chapter', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.goToNextChapter(5));
    expect(result.current.state.navigation.currentChapterIndex).toBe(1);
    expect(result.current.state.navigation.currentSentenceIndex).toBe(0);
    expect(result.current.state.navigation.currentScrollPage).toBe(0);
  });

  it('does not advance past the last chapter', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setChapterIndex(4));
    act(() => result.current.goToNextChapter(5));
    expect(result.current.state.navigation.currentChapterIndex).toBe(4);
  });

  it('goes to previous chapter with sentence index', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setChapterIndex(2));
    act(() => result.current.goToPrevChapter(15));
    expect(result.current.state.navigation.currentChapterIndex).toBe(1);
    expect(result.current.state.navigation.currentSentenceIndex).toBe(14);
  });

  it('does not go below chapter 0', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.goToPrevChapter(10));
    expect(result.current.state.navigation.currentChapterIndex).toBe(0);
  });

  it('toggles audio play', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.togglePlay());
    expect(result.current.state.audio.isPlaying).toBe(true);
    act(() => result.current.togglePlay());
    expect(result.current.state.audio.isPlaying).toBe(false);
  });

  it('sets audio speed', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setAudioSpeed(1.5));
    expect(result.current.state.audio.speed).toBe(1.5);
  });

  it('toggles loop sentence', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.toggleLoopSentence());
    expect(result.current.state.audio.loopSentence).toBe(true);
  });

  it('toggles loop word', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.toggleLoopWord());
    expect(result.current.state.audio.loopWord).toBe(true);
  });

  it('sets audio position', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setAudioPosition(3, 5));
    expect(result.current.state.audio.position).toEqual({ sentenceIdx: 3, wordIdx: 5 });
  });

  it('advances audio word', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.advanceAudioWord(10));
    expect(result.current.state.audio.position.wordIdx).toBe(1);
  });

  it('does not advance audio word past max', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setAudioPosition(0, 9));
    act(() => result.current.advanceAudioWord(10));
    expect(result.current.state.audio.position.wordIdx).toBe(9);
  });

  it('advances audio sentence', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setAudioPosition(0, 0));
    act(() => result.current.advanceAudioSentence(5));
    expect(result.current.state.audio.position.sentenceIdx).toBe(1);
    expect(result.current.state.audio.position.wordIdx).toBe(0);
  });

  it('stops audio at end of sentences', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setAudioPosition(4, 0));
    act(() => result.current.advanceAudioSentence(5));
    expect(result.current.state.audio.isPlaying).toBe(false);
    expect(result.current.state.audio.position).toEqual({ sentenceIdx: 0, wordIdx: 0 });
  });

  it('resets display to defaults', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setShowTranslit(true));
    act(() => result.current.setMode('page'));
    act(() => result.current.resetDisplay());
    expect(result.current.state.display.mode).toBe('scroll');
    expect(result.current.state.display.showTranslit).toBe(false);
  });

  it('resets navigation to defaults', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setTextId('john-1'));
    act(() => result.current.setChapterIndex(3));
    act(() => result.current.resetNavigation());
    expect(result.current.state.navigation.textId).toBeNull();
    expect(result.current.state.navigation.currentChapterIndex).toBe(0);
  });

  it('resets audio to defaults', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.togglePlay());
    act(() => result.current.setAudioSpeed(1.5));
    act(() => result.current.resetAudio());
    expect(result.current.state.audio.isPlaying).toBe(false);
    expect(result.current.state.audio.speed).toBe(1.0);
  });

  it('resets all state to defaults', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setTextId('john-1'));
    act(() => result.current.setShowTranslit(true));
    act(() => result.current.togglePlay());
    act(() => result.current.resetAll());
    expect(result.current.state).toEqual({
      display: { mode: 'scroll', showTranslit: false, showParallel: false, maskKnown: false, interlinearMode: false, fontSize: 18, highlightIntensity: 'normal', swipeMovesToNext: true },
      navigation: { textId: null, currentChapterIndex: 0, currentSentenceIndex: 0, currentScrollPage: 0, scrollProgress: 0 },
      audio: { isPlaying: false, speed: 1.0, loopSentence: false, loopWord: false, position: { sentenceIdx: 0, wordIdx: 0 } },
    });
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useReaderState(), { wrapper });
    act(() => result.current.setShowTranslit(true));
    act(() => result.current.setFontSize(24));
    const stored = JSON.parse(localStorage.getItem('paleoglossa_reader_state') || '{}');
    expect(stored.display.showTranslit).toBe(true);
    expect(stored.display.fontSize).toBe(24);
  });

  it('restores state from localStorage on mount', () => {
    localStorage.setItem('paleoglossa_reader_state', JSON.stringify({
      display: { mode: 'page', showTranslit: true, showParallel: false, maskKnown: false, interlinearMode: false, fontSize: 22, highlightIntensity: 'subtle', swipeMovesToNext: false },
      navigation: { textId: 'iliad-1', currentChapterIndex: 2, currentSentenceIndex: 5, currentScrollPage: 1, scrollProgress: 33 },
      audio: { isPlaying: true, speed: 1.5, loopSentence: false, loopWord: false, position: { sentenceIdx: 2, wordIdx: 3 } },
    }));
    const { result } = renderHook(() => useReaderState(), { wrapper });
    expect(result.current.state.display.mode).toBe('page');
    expect(result.current.state.display.showTranslit).toBe(true);
    expect(result.current.state.display.fontSize).toBe(22);
    expect(result.current.state.navigation.textId).toBe('iliad-1');
    expect(result.current.state.navigation.currentChapterIndex).toBe(2);
    expect(result.current.state.audio.isPlaying).toBe(true);
    expect(result.current.state.audio.speed).toBe(1.5);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('paleoglossa_reader_state', 'not-valid-json');
    const { result } = renderHook(() => useReaderState(), { wrapper });
    expect(result.current.state.display.mode).toBe('scroll');
    expect(result.current.state.navigation.textId).toBeNull();
  });

  it('throws if used outside provider', () => {
    expect(() => renderHook(() => useReaderState())).toThrow('useReaderState must be used within ReaderStateProvider');
  });
});
