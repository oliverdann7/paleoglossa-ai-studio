import { getTokenInfo } from '../data/dictionary';

export enum CardType {
  FORM_TO_MEANING = 'FORM_TO_MEANING',
  MEANING_TO_FORM = 'MEANING_TO_FORM',
  CLOZE = 'CLOZE',
  PARSE = 'PARSE',
  ROOT = 'ROOT',
}

export interface ReviewCard {
  itemId: string;
  term: string;
  languageId: string;
  type: CardType;
  question: string;
  answer: string;
  context?: string;
  morphHint?: string;
  transliteration?: string;
}

export interface CardGenerationOptions {
  enabledTypes: CardType[];
  maxCards?: number;
  includeMorphology: boolean;
}

const DEFAULT_OPTIONS: CardGenerationOptions = {
  enabledTypes: [CardType.FORM_TO_MEANING, CardType.MEANING_TO_FORM, CardType.CLOZE, CardType.PARSE],
  includeMorphology: true,
};

function findGloss(term: string, _languageId: string, item: any): string | null {
  if (item.userGloss && item.userGloss !== 'Definition missing') return item.userGloss;
  const tokenInfo = getTokenInfo(term);
  if (tokenInfo?.shortGloss && tokenInfo.shortGloss !== 'Definition unavailable') return tokenInfo.shortGloss;
  return null;
}

function getTransliteration(term: string): string | undefined {
  const tokenInfo = getTokenInfo(term);
  return tokenInfo?.transliteration;
}

function getMorphology(term: string): Record<string, string> | undefined {
  const tokenInfo = getTokenInfo(term);
  if (!tokenInfo?.partOfSpeech) return undefined;
  // Return only meaningful morphology fields
  const morph: Record<string, string> = {};
  if (tokenInfo.partOfSpeech) morph.partOfSpeech = tokenInfo.partOfSpeech;
  // The dictionary only stores partOfSpeech and transliteration at the entry level.
  // Per-token morphology (case, number, etc.) lives in the corpus tokens.
  return Object.keys(morph).length > 0 ? morph : undefined;
}

export function generateReviewCard(item: any, options?: Partial<CardGenerationOptions>): ReviewCard | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const term = item.term || item.id || '';
  const languageId = item.languageId || 'unknown';
  const gloss = findGloss(term, languageId, item);
  const contexts: string[] = item.contexts || [];
  const morph = opts.includeMorphology ? getMorphology(term) : undefined;
  const translit = getTransliteration(term);

  // Build list of possible card types
  const candidates: CardType[] = [];

  // FORM_TO_MEANING: always possible (default)
  candidates.push(CardType.FORM_TO_MEANING);

  // MEANING_TO_FORM: require gloss
  if (gloss) candidates.push(CardType.MEANING_TO_FORM);

  // CLOZE: require context containing the term
  const validContexts = contexts.filter(ctx => ctx.toLowerCase().includes(term.toLowerCase()));
  if (validContexts.length > 0) candidates.push(CardType.CLOZE);

  // PARSE: require morphology
  if (morph) candidates.push(CardType.PARSE);

  // Filter to enabled types
  const available = candidates.filter(t => opts.enabledTypes.includes(t));
  if (available.length === 0) return null;

  const type = available[Math.floor(Math.random() * available.length)];

  let question = term;
  let answer = gloss || term;
  let context: string | undefined;

  switch (type) {
    case CardType.FORM_TO_MEANING:
      question = term;
      answer = gloss || term;
      break;

    case CardType.MEANING_TO_FORM:
      question = gloss!;
      answer = term;
      break;

    case CardType.CLOZE: {
      const ctx = validContexts[Math.floor(Math.random() * validContexts.length)];
      context = ctx;
      // Replace the term with blank
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      question = ctx.replace(regex, '______');
      answer = term;
      break;
    }

    case CardType.PARSE: {
      question = term;
      const parts: string[] = [];
      if (morph?.partOfSpeech) parts.push(`POS: ${morph.partOfSpeech}`);
      const tokenInfo = getTokenInfo(term);
      if (tokenInfo?.shortGloss) parts.push(`Gloss: ${tokenInfo.shortGloss}`);
      answer = parts.length > 0 ? parts.join(' · ') : term;
      break;
    }
  }

  return {
    itemId: item.id || term,
    term,
    languageId,
    type,
    question,
    answer,
    context,
    morphHint: morph?.partOfSpeech,
    transliteration: translit,
  };
}

export function generateReviewCards(items: any[], options?: Partial<CardGenerationOptions>): ReviewCard[] {
  return items
    .map(item => generateReviewCard(item, options))
    .filter((card): card is ReviewCard => card !== null);
}
