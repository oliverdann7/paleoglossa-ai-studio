/**
 * Languages with real server-side (Google) TTS voices wired in
 * `api/_routes/audio.ts`. We only surface the review audio button for these so
 * we never render a control that produces nothing. Mirror this set if the
 * server map grows.
 */
const TTS_SUPPORTED_LANGUAGE_IDS = new Set(['grc', 'grc-koine', 'lat', 'hbo', 'syr']);

export function isReviewAudioSupported(languageId: string): boolean {
  return TTS_SUPPORTED_LANGUAGE_IDS.has(languageId);
}

interface AudioCardLike {
  type: string;
  term: string;
  question: string;
  answer: string;
  context?: string;
}

export interface ReviewCardAudio {
  /** Target-language text that can be heard while the question is showing. */
  front?: string;
  /** Target-language text that can be heard once the answer is revealed. */
  back?: string;
}

/**
 * What a review card can pronounce on each side.
 *
 * Every card type gets audio somewhere, but never audio that answers the
 * question: a card asking for the form is silent until revealed, and a cloze
 * reads the whole sentence only afterwards.
 */
export function reviewCardAudio(card: AudioCardLike): ReviewCardAudio {
  const term = card.term?.trim() || undefined;
  const sentence = card.context?.trim() || undefined;
  switch (card.type) {
    case 'FORM_TO_MEANING':
    case 'PARSE':
      return { front: term };
    case 'MEANING_TO_FORM':
      return { back: term };
    case 'CLOZE':
      return { back: sentence ?? term };
    case 'LEMMA_RECOGNITION': {
      // The question is the form as met in the text; the answer its lemma.
      const surface = card.question?.trim() || undefined;
      return { front: surface, back: surface === term ? undefined : term };
    }
    case 'CONTEXT_TRANSLATION':
      return { front: sentence };
    default:
      // An unknown card type: pronounce the term where it is already shown.
      return {
        front: card.question === card.term ? term : undefined,
        back: card.answer === card.term && card.question !== card.term ? term : undefined,
      };
  }
}
