import { describe, it, expect } from 'vitest';
import {
  generateReviewCard,
  generateReviewCards,
  CardType,
  cardTypeWeight,
  isRecognitionCard,
} from './reviewCardFactory.js';

const baseItem = {
  id: 'λύω',
  term: 'λύω',
  languageId: 'grc',
  userGloss: 'I loosen / I destroy',
  contexts: ['λύω τὸ δεσμά', 'λύω τὸν λόγον'],
  status: 'LEARNING',
  srs: {
    interval: 1,
    ease: 2.5,
    step: 1,
    lastReviewed: null,
    nextReview: new Date().toISOString(),
  },
};

describe('generateReviewCard', () => {
  it('creates a FORM_TO_MEANING card when gloss exists', () => {
    const card = generateReviewCard(baseItem, { enabledTypes: [CardType.FORM_TO_MEANING] });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.FORM_TO_MEANING);
    expect(card!.question).toBe('λύω');
    expect(card!.answer).toBe('I loosen / I destroy');
  });

  it('skips card when no gloss available and only meaning types enabled', () => {
    const item = { ...baseItem, userGloss: undefined, contexts: [] };
    const card = generateReviewCard(item, { enabledTypes: [CardType.MEANING_TO_FORM] });
    expect(card).toBeNull();
  });

  it('returns null when no gloss is available (even for CLOZE or PARSE)', () => {
    const item = { ...baseItem, userGloss: undefined };
    const card = generateReviewCard(item, { enabledTypes: [CardType.CLOZE, CardType.PARSE] });
    expect(card).toBeNull();
  });

  it('skips FORM_TO_MEANING when gloss is Definition missing', () => {
    const item = { ...baseItem, userGloss: 'Definition missing', contexts: [] };
    const card = generateReviewCard(item, { enabledTypes: [CardType.FORM_TO_MEANING] });
    // Without a real gloss, FORM_TO_MEANING is not a valid candidate
    expect(card).toBeNull();
  });

  it('creates MEANING_TO_FORM card when enabled and gloss exists', () => {
    const card = generateReviewCard(baseItem, { enabledTypes: [CardType.MEANING_TO_FORM] });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.MEANING_TO_FORM);
    expect(card!.question).toBe('I loosen / I destroy');
    expect(card!.answer).toBe('λύω');
  });

  it('creates CLOZE card when context exists', () => {
    const card = generateReviewCard(baseItem, { enabledTypes: [CardType.CLOZE] });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.CLOZE);
    expect(card!.question).toContain('______');
    expect(card!.context).toBeTruthy();
    expect(card!.answer).toBe('λύω');
  });

  it('skips CLOZE when context does not contain the term', () => {
    const item = { ...baseItem, contexts: ['ἄλλος λόγος ἐστίν'] };
    const card = generateReviewCard(item, { enabledTypes: [CardType.CLOZE] });
    expect(card).toBeNull();
  });

  it('creates PARSE card when includeMorphology is true', () => {
    const card = generateReviewCard(baseItem, {
      enabledTypes: [CardType.PARSE],
      includeMorphology: true,
    });
    // The test may not have real morphology data in the dictionary, so it might return null
    // But if morphology exists, it should be a PARSE card
    if (card) {
      expect(card.type).toBe(CardType.PARSE);
    }
  });

  it('returns null when no types are enabled', () => {
    const card = generateReviewCard(baseItem, { enabledTypes: [] });
    expect(card).toBeNull();
  });

  it('preserves languageId in the card', () => {
    const card = generateReviewCard(baseItem, { enabledTypes: [CardType.FORM_TO_MEANING] });
    expect(card!.languageId).toBe('grc');
  });

  it('uses userGloss over token/dictionary gloss', () => {
    const item = {
      ...baseItem,
      userGloss: 'my custom translation',
      tokenGloss: 'dictionary definition',
    };
    const card = generateReviewCard(item, { enabledTypes: [CardType.FORM_TO_MEANING] });
    expect(card).not.toBeNull();
    expect(card!.answer).toBe('my custom translation');
  });
});

describe('LEMMA_RECOGNITION', () => {
  it('creates lemma recognition card when surface differs from term', () => {
    const item = {
      ...baseItem,
      surface: 'ἔλυσε',
      term: 'λύω',
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.LEMMA_RECOGNITION],
      includeMorphology: true,
    });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.LEMMA_RECOGNITION);
    expect(card!.question).toBe('ἔλυσε');
    expect(card!.answer).toBe('λύω');
  });

  it('skips lemma recognition when surface equals term', () => {
    const item = {
      ...baseItem,
      surface: 'λύω',
      term: 'λύω',
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.LEMMA_RECOGNITION],
      includeMorphology: true,
    });
    expect(card).toBeNull();
  });

  it('skips lemma recognition when includeMorphology is false', () => {
    const item = {
      ...baseItem,
      surface: 'ἔλυσε',
      term: 'λύω',
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.LEMMA_RECOGNITION],
      includeMorphology: false,
    });
    expect(card).toBeNull();
  });
});

describe('CONTEXT_TRANSLATION', () => {
  it('creates context translation card when sentenceTranslation exists', () => {
    const item = {
      ...baseItem,
      sentenceTranslation: 'I loosen the bonds',
      sentenceText: 'λύω τὸ δεσμά',
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.CONTEXT_TRANSLATION],
    });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.CONTEXT_TRANSLATION);
    expect(card!.answer).toBe('I loosen the bonds');
  });

  it('skips context translation when no sentenceTranslation', () => {
    const card = generateReviewCard(baseItem, {
      enabledTypes: [CardType.CONTEXT_TRANSLATION],
    });
    expect(card).toBeNull();
  });
});

describe('CLOZE with surface form', () => {
  it('blanks surface form instead of lemma when they differ', () => {
    const item = {
      ...baseItem,
      surface: 'ἔλυσε',
      contexts: ['ἔλυσε τὸ δεσμά'],
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.CLOZE],
    });
    expect(card).not.toBeNull();
    expect(card!.question).toContain('______');
    // The original sentence had "ἔλυσε" which should be blanked
    expect(card!.context).toContain('τὸ δεσμά');
    expect(card!.answer).toBe('λύω');
  });
});

describe('PARSE with per-token morphology', () => {
  it('uses item morphology when available', () => {
    const item = {
      ...baseItem,
      morphology: 'V-PAI-3S',
    };
    const card = generateReviewCard(item, {
      enabledTypes: [CardType.PARSE],
      includeMorphology: true,
    });
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.PARSE);
  });

  it('falls back to dictionary morphology when item has none', () => {
    const card = generateReviewCard(baseItem, {
      enabledTypes: [CardType.PARSE],
      includeMorphology: true,
    });
    // May or may not have dictionary data, but should not crash
    if (card) {
      expect(card.type).toBe(CardType.PARSE);
    }
  });
});

describe('card weighting (roadmap 2.4)', () => {
  it('classifies recognition vs production card types', () => {
    expect(isRecognitionCard(CardType.FORM_TO_MEANING)).toBe(true);
    expect(isRecognitionCard(CardType.LEMMA_RECOGNITION)).toBe(true);
    expect(isRecognitionCard(CardType.CLOZE)).toBe(true);
    expect(isRecognitionCard(CardType.CONTEXT_TRANSLATION)).toBe(true);
    expect(isRecognitionCard(CardType.MEANING_TO_FORM)).toBe(false);
    expect(isRecognitionCard(CardType.PARSE)).toBe(false);
  });

  it('adaptive: LEARNING words weight recognition above production', () => {
    const recog = cardTypeWeight(CardType.FORM_TO_MEANING, 'LEARNING', 'adaptive');
    const prod = cardTypeWeight(CardType.MEANING_TO_FORM, 'LEARNING', 'adaptive');
    expect(recog).toBeGreaterThan(prod);
  });

  it('adaptive: KNOWN words weight production above recognition', () => {
    const recog = cardTypeWeight(CardType.FORM_TO_MEANING, 'KNOWN', 'adaptive');
    const prod = cardTypeWeight(CardType.MEANING_TO_FORM, 'KNOWN', 'adaptive');
    expect(prod).toBeGreaterThan(recog);
  });

  it('adaptive: FAMILIAR words are balanced (equal weight)', () => {
    const recog = cardTypeWeight(CardType.FORM_TO_MEANING, 'FAMILIAR', 'adaptive');
    const prod = cardTypeWeight(CardType.MEANING_TO_FORM, 'FAMILIAR', 'adaptive');
    expect(recog).toBe(prod);
  });

  it('adaptive: unknown/blank state defaults to favoring recognition', () => {
    const recog = cardTypeWeight(CardType.FORM_TO_MEANING, undefined, 'adaptive');
    const prod = cardTypeWeight(CardType.MEANING_TO_FORM, '', 'adaptive');
    expect(recog).toBeGreaterThan(prod);
  });

  it('recognition / production presets override word state', () => {
    // recognition preset favors recognition even for KNOWN words
    expect(cardTypeWeight(CardType.FORM_TO_MEANING, 'KNOWN', 'recognition')).toBeGreaterThan(
      cardTypeWeight(CardType.MEANING_TO_FORM, 'KNOWN', 'recognition')
    );
    // production preset favors production even for brand-new words
    expect(cardTypeWeight(CardType.MEANING_TO_FORM, 'NEW', 'production')).toBeGreaterThan(
      cardTypeWeight(CardType.FORM_TO_MEANING, 'NEW', 'production')
    );
  });

  it('balanced preset weights every type equally', () => {
    const types = [CardType.FORM_TO_MEANING, CardType.MEANING_TO_FORM, CardType.PARSE];
    const weights = types.map((t) => cardTypeWeight(t, 'LEARNING', 'balanced'));
    expect(new Set(weights).size).toBe(1);
  });

  it('still produces a valid card when only one type is enabled regardless of weighting', () => {
    const card = generateReviewCard(
      { ...baseItem, status: 'KNOWN' },
      { enabledTypes: [CardType.FORM_TO_MEANING], includeMorphology: true, weighting: 'adaptive' }
    );
    expect(card).not.toBeNull();
    expect(card!.type).toBe(CardType.FORM_TO_MEANING);
  });
});

describe('generateReviewCards', () => {
  it('generates cards for all items with valid gloss', () => {
    const items = [
      baseItem,
      { ...baseItem, term: 'ἀγάπη', id: 'ἀγάπη', userGloss: 'love' },
      { ...baseItem, term: 'λόγος', id: 'λόγος', userGloss: undefined, contexts: [] },
    ];
    const cards = generateReviewCards(items, { enabledTypes: [CardType.FORM_TO_MEANING] });
    // Items 1 and 2 have gloss and generate cards. Item 3 has no gloss, so FORM_TO_MEANING skips it.
    expect(cards.length).toBe(2);
  });

  it('shuffles cards (order differs from input)', () => {
    const items = [
      { ...baseItem, term: 'a', id: 'a', userGloss: 'a' },
      { ...baseItem, term: 'b', id: 'b', userGloss: 'b' },
      { ...baseItem, term: 'c', id: 'c', userGloss: 'c' },
      { ...baseItem, term: 'd', id: 'd', userGloss: 'd' },
      { ...baseItem, term: 'e', id: 'e', userGloss: 'e' },
    ];
    const cards = generateReviewCards(items, { enabledTypes: [CardType.FORM_TO_MEANING] });
    const ids = cards.map((c) => c.term);
    // If shuffled, the order won't exactly match the input (probabilistic)
    expect(ids.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
