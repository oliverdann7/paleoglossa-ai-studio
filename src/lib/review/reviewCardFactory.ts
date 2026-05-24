import { getTokenInfo } from '../data/dictionary.js';
import { MorphologyService } from '../services/morphologyService.js';
import { SRSState } from '../srs/sm2.js';

export enum CardType {
  FORM_TO_MEANING = 'FORM_TO_MEANING',
  MEANING_TO_FORM = 'MEANING_TO_FORM',
  CLOZE = 'CLOZE',
  PARSE = 'PARSE',
  ROOT = 'ROOT',
  LEMMA_RECOGNITION = 'LEMMA_RECOGNITION',
  CONTEXT_TRANSLATION = 'CONTEXT_TRANSLATION',
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
  srs: SRSState;
  status: string;
}

export interface CardGenerationOptions {
  enabledTypes: CardType[];
  maxCards?: number;
  includeMorphology: boolean;
}

const DEFAULT_OPTIONS: CardGenerationOptions = {
  enabledTypes: [
    CardType.FORM_TO_MEANING,
    CardType.MEANING_TO_FORM,
    CardType.CLOZE,
    CardType.PARSE,
  ],
  includeMorphology: true,
};

function findGloss(term: string, _languageId: string, item: any): string | null {
  if (item.userGloss && item.userGloss !== 'Definition missing') return item.userGloss;
  const tokenInfo = getTokenInfo(term);
  if (tokenInfo?.shortGloss && tokenInfo.shortGloss !== 'Definition unavailable')
    return tokenInfo.shortGloss;
  return null;
}

function getTransliteration(term: string): string | undefined {
  const tokenInfo = getTokenInfo(term);
  return tokenInfo?.transliteration;
}

function getMorphology(term: string): Record<string, string> | undefined {
  const tokenInfo = getTokenInfo(term);
  if (!tokenInfo?.partOfSpeech) return undefined;
  const morph: Record<string, string> = {};
  if (tokenInfo.partOfSpeech) morph.partOfSpeech = tokenInfo.partOfSpeech;
  return Object.keys(morph).length > 0 ? morph : undefined;
}

function getSurface(term: string, item: any): string {
  return item.surface || item.term || term;
}

function getContextMorphology(item: any, languageId: string): string | undefined {
  if (!item.morphology) return undefined;
  const formatted = MorphologyService.formatMorphologyForDisplay(languageId, item.morphology);
  if (formatted.missing) return undefined;
  return formatted.compact;
}

export function generateReviewCard(
  item: any,
  options?: Partial<CardGenerationOptions>
): ReviewCard | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const term = item.term || item.id || '';
  const languageId = item.languageId || 'unknown';
  const gloss = findGloss(term, languageId, item);
  const contexts: string[] = item.contexts || [];
  const morph = opts.includeMorphology ? getMorphology(term) : undefined;
  const translit = getTransliteration(term);
  const surface = getSurface(term, item);
  const contextMorph = opts.includeMorphology
    ? getContextMorphology(item, languageId)
    : undefined;

  // If no gloss is available, skip entirely — avoids weak "Definition missing" cards.
  if (!gloss) return null;

  // Build list of possible card types
  const candidates: CardType[] = [];

  // FORM_TO_MEANING: require gloss
  if (gloss) candidates.push(CardType.FORM_TO_MEANING);

  // MEANING_TO_FORM: require gloss
  if (gloss) candidates.push(CardType.MEANING_TO_FORM);

  // CLOZE: require context containing the term or surface form
  const surfaceForMatch = surface !== term ? surface : term;
  const validContexts = contexts.filter(
    (ctx) =>
      ctx.toLowerCase().includes(term.toLowerCase()) ||
      ctx.toLowerCase().includes(surfaceForMatch.toLowerCase())
  );
  if (validContexts.length > 0) candidates.push(CardType.CLOZE);

  // PARSE: require morphology (static or per-token)
  if (morph || contextMorph) candidates.push(CardType.PARSE);

  // LEMMA_RECOGNITION: surface differs from lemma, and includeMorphology is on
  if (opts.includeMorphology && surface !== term && surface) {
    candidates.push(CardType.LEMMA_RECOGNITION);
  }

  // CONTEXT_TRANSLATION: require sentence translation
  if (item.sentenceTranslation) {
    candidates.push(CardType.CONTEXT_TRANSLATION);
  }

  // Filter to enabled types
  const available = candidates.filter((t) => opts.enabledTypes.includes(t));
  if (available.length === 0) return null;

  const type = available[Math.floor(Math.random() * available.length)];

  let question = term;
  let answer = gloss || '';
  let context: string | undefined;
  let morphHint: string | undefined;

  switch (type) {
    case CardType.FORM_TO_MEANING:
      question = term;
      answer = gloss!;
      break;

    case CardType.MEANING_TO_FORM:
      question = gloss!;
      answer = term;
      break;

    case CardType.CLOZE: {
      const ctx = validContexts[Math.floor(Math.random() * validContexts.length)];
      context = ctx;
      // Blank the surface form (or term if surface matches term)
      const blankTarget = surface !== term ? surface : term;
      const regex = new RegExp(blankTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      question = ctx.replace(regex, '______');
      answer = term;
      break;
    }

    case CardType.PARSE: {
      question = term;
      const parts: string[] = [];
      if (contextMorph) {
        parts.push(contextMorph);
      } else if (morph?.partOfSpeech) {
        parts.push(`POS: ${morph.partOfSpeech}`);
      }
      const tokenInfo = getTokenInfo(term);
      if (tokenInfo?.shortGloss) parts.push(`Gloss: ${tokenInfo.shortGloss}`);
      answer = parts.length > 0 ? parts.join(' · ') : term;
      morphHint = contextMorph || morph?.partOfSpeech;
      break;
    }

    case CardType.LEMMA_RECOGNITION:
      question = surface;
      answer = term;
      break;

    case CardType.CONTEXT_TRANSLATION: {
      const ctxForTranslation =
        item.sentenceText ||
        (contexts.length > 0 ? contexts[0] : undefined);
      context = ctxForTranslation;
      question = ctxForTranslation || '(sentence)';
      answer = item.sentenceTranslation!;
      break;
    }
  }

  const defaultSRS: SRSState = {
    interval: 0,
    ease: 2.5,
    step: 0,
    lastReviewed: null,
    nextReview: new Date().toISOString(),
  };

  return {
    itemId: item.id || term,
    term,
    languageId,
    type,
    question,
    answer,
    context,
    morphHint: morphHint || morph?.partOfSpeech,
    transliteration: translit,
    srs: item.srs ?? defaultSRS,
    status: item.status ?? '',
  };
}

export function generateReviewCards(
  items: any[],
  options?: Partial<CardGenerationOptions>
): ReviewCard[] {
  return items
    .map((item) => generateReviewCard(item, options))
    .filter((card): card is ReviewCard => card !== null);
}
