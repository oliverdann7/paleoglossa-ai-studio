import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewAudioButton } from '../ReviewAudioButton';
import { isReviewAudioSupported, reviewCardAudio } from '../reviewAudioSupport';
import { AudioService } from '../../../lib/services/audioService';

vi.mock('../../../lib/services/audioService', () => ({
  AudioService: { generateTTS: vi.fn() },
}));

const generateTTS = vi.mocked(AudioService.generateTTS);

// jsdom's HTMLAudioElement.play() is unimplemented; install a controllable
// stub so we can assert playback is triggered and replayed from cache.
class FakeAudio {
  static instances: FakeAudio[] = [];
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public src: string) {
    FakeAudio.instances.push(this);
  }
}

beforeEach(() => {
  generateTTS.mockReset();
  FakeAudio.instances = [];
  // @ts-expect-error — swap in the controllable Audio stub
  globalThis.Audio = FakeAudio;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isReviewAudioSupported', () => {
  it('is true for languages with server TTS voices', () => {
    expect(isReviewAudioSupported('grc')).toBe(true);
    expect(isReviewAudioSupported('lat')).toBe(true);
    expect(isReviewAudioSupported('hbo')).toBe(true);
  });

  it('is false for languages without a TTS voice', () => {
    expect(isReviewAudioSupported('san')).toBe(false);
    expect(isReviewAudioSupported('akk')).toBe(false);
    expect(isReviewAudioSupported('')).toBe(false);
  });
});

describe('ReviewAudioButton', () => {
  it('renders an accessible button with the given label', () => {
    generateTTS.mockResolvedValue('data:audio/mp3;base64,AAA');
    render(<ReviewAudioButton text="λόγος" languageId="grc" label="Hear pronunciation" />);
    expect(screen.getByRole('button', { name: 'Hear pronunciation' })).toBeInTheDocument();
  });

  it('fetches TTS once and plays it on click', async () => {
    generateTTS.mockResolvedValue('data:audio/mp3;base64,AAA');
    render(<ReviewAudioButton text="λόγος" languageId="grc" label="Hear pronunciation" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(FakeAudio.instances).toHaveLength(1));
    expect(generateTTS).toHaveBeenCalledWith('λόγος', 'grc');
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(1);
  });

  it('falls back to speech synthesis when the server returns no audio', async () => {
    generateTTS.mockResolvedValue(null);
    const speak = vi.fn();
    // @ts-expect-error — minimal speechSynthesis stub
    globalThis.speechSynthesis = { speak, cancel: vi.fn() };
    // @ts-expect-error — constructor stub
    globalThis.SpeechSynthesisUtterance = class {
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    };

    render(<ReviewAudioButton text="λόγος" languageId="grc" label="Hear pronunciation" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    expect(FakeAudio.instances).toHaveLength(0);
  });
});

describe('reviewCardAudio', () => {
  const card = (type: string, extra: Record<string, string> = {}) => ({
    type,
    term: 'λόγος',
    question: 'λόγος',
    answer: 'word',
    ...extra,
  });
  const sentence = 'ἐν ἀρχῇ ἦν ὁ λόγος';

  it('pronounces the form on the front when the form is the question', () => {
    expect(reviewCardAudio(card('FORM_TO_MEANING'))).toEqual({ front: 'λόγος' });
    expect(reviewCardAudio(card('PARSE', { answer: 'noun · nom. sg.' }))).toEqual({
      front: 'λόγος',
    });
  });

  it('never gives the answer away before it is revealed', () => {
    const production = reviewCardAudio(
      card('MEANING_TO_FORM', { question: 'word', answer: 'λόγος' })
    );
    expect(production).toEqual({ back: 'λόγος' });
    const cloze = reviewCardAudio(
      card('CLOZE', { question: 'ἐν ἀρχῇ ἦν ὁ ______', answer: 'λόγος', context: sentence })
    );
    // The whole sentence, but only once the gap has been filled.
    expect(cloze).toEqual({ back: sentence });
  });

  it('reads the form met in the text, then its lemma', () => {
    expect(
      reviewCardAudio(card('LEMMA_RECOGNITION', { question: 'λόγου', answer: 'λόγος' }))
    ).toEqual({
      front: 'λόγου',
      back: 'λόγος',
    });
    // Nothing to add when the form is already the lemma.
    expect(reviewCardAudio(card('LEMMA_RECOGNITION', { answer: 'λόγος' }))).toEqual({
      front: 'λόγος',
      back: undefined,
    });
  });

  it('reads the sentence of a translation card, when there is one', () => {
    expect(
      reviewCardAudio(
        card('CONTEXT_TRANSLATION', {
          question: sentence,
          answer: 'In the beginning…',
          context: sentence,
        })
      )
    ).toEqual({ front: sentence });
    expect(
      reviewCardAudio(card('CONTEXT_TRANSLATION', { question: '(sentence)', answer: '…' }))
    ).toEqual({ front: undefined });
  });

  it('gives every card type the learner can enable some audio', () => {
    const cards = [
      card('FORM_TO_MEANING'),
      card('MEANING_TO_FORM', { question: 'word', answer: 'λόγος' }),
      card('CLOZE', { question: '______', answer: 'λόγος', context: sentence }),
      card('PARSE'),
      card('LEMMA_RECOGNITION', { question: 'λόγου', answer: 'λόγος' }),
      card('CONTEXT_TRANSLATION', { question: sentence, context: sentence }),
    ];
    for (const c of cards) {
      const audio = reviewCardAudio(c);
      expect(audio.front ?? audio.back, c.type).toBeTruthy();
    }
  });
});

describe('ReviewAudioButton auto-play', () => {
  it('plays without a tap, and again when the card changes', async () => {
    generateTTS.mockResolvedValue('data:audio/mp3;base64,AAA');
    const { rerender } = render(
      <ReviewAudioButton text="λόγος" languageId="grc" label="Hear" autoPlay />
    );
    await waitFor(() => expect(FakeAudio.instances.at(-1)?.play).toHaveBeenCalled());
    expect(generateTTS).toHaveBeenLastCalledWith('λόγος', 'grc');

    const first = FakeAudio.instances.at(-1)!;
    rerender(<ReviewAudioButton text="θεός" languageId="grc" label="Hear" autoPlay />);
    await waitFor(() => expect(generateTTS).toHaveBeenLastCalledWith('θεός', 'grc'));
    await waitFor(() => expect(FakeAudio.instances.at(-1)).not.toBe(first));
    // The previous card stops talking.
    expect(first.pause).toHaveBeenCalled();
  });

  it('stays silent when there is no recorded voice, rather than using the browser voice', async () => {
    generateTTS.mockResolvedValue(null);
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
    vi.stubGlobal('SpeechSynthesisUtterance', class {});
    render(<ReviewAudioButton text="λόγος" languageId="grc" label="Hear" autoPlay />);
    await waitFor(() => expect(generateTTS).toHaveBeenCalled());
    await Promise.resolve();
    expect(speak).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);

    // Asked for by a tap, the browser voice is still the last resort.
    fireEvent.click(screen.getByRole('button', { name: 'Hear' }));
    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    vi.unstubAllGlobals();
  });

  it('does not play unprompted when auto-play is off', async () => {
    generateTTS.mockResolvedValue('data:audio/mp3;base64,AAA');
    render(<ReviewAudioButton text="λόγος" languageId="grc" label="Hear" />);
    await Promise.resolve();
    expect(generateTTS).not.toHaveBeenCalled();
  });

  it('lets only one button speak at a time', async () => {
    generateTTS.mockResolvedValue('data:audio/mp3;base64,AAA');
    render(
      <>
        <ReviewAudioButton text="λόγου" languageId="grc" label="Front" />
        <ReviewAudioButton text="λόγος" languageId="grc" label="Back" />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Front' }));
    await waitFor(() => expect(FakeAudio.instances).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(FakeAudio.instances).toHaveLength(2));
    expect(FakeAudio.instances[0].pause).toHaveBeenCalled();
    expect(FakeAudio.instances[1].pause).not.toHaveBeenCalled();
  });
});
