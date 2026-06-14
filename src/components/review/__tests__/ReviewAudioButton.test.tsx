import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewAudioButton } from '../ReviewAudioButton';
import { isReviewAudioSupported } from '../reviewAudioSupport';
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
