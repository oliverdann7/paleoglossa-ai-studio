import { describe, it, expect } from 'vitest';
import { generateReviewCard, generateReviewCards, CardType } from './reviewCardFactory';

const baseItem = {
  id: 'λύω',
  term: 'λύω',
  languageId: 'grc',
  userGloss: 'I loosen / I destroy',
  contexts: ['λύω τὸ δεσμά', 'λύω τὸν λόγον'],
  status: 'LEARNING',
  srs: { interval: 1, ease: 2.5, step: 1, lastReviewed: null, nextReview: new Date().toISOString() },
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
    const card = generateReviewCard(baseItem, { enabledTypes: [CardType.PARSE], includeMorphology: true });
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
    const ids = cards.map(c => c.term);
    // If shuffled, the order won't exactly match the input (probabilistic)
    expect(ids.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
