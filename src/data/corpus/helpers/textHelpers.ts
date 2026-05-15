export interface RawToken {
  id: string;
  surface: string;
  normalized: string;
  lemma: string;
  gloss: string;
  morphology?: Record<string, string>;
  transliteration?: string;
  punctBefore: string;
  punctAfter: string;
}

export interface RawSentence {
  id: string;
  tokens: RawToken[];
  translation?: string;
}

export function buildBasicToken(
  id: string,
  surface: string,
  lemma?: string,
  gloss?: string,
  transliteration?: string,
): RawToken {
  const normalized = surface
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return {
    id,
    surface,
    normalized,
    lemma: lemma || normalized,
    gloss: gloss || '',
    punctBefore: '',
    punctAfter: ' ',
    transliteration,
  };
}

export function tokenizeSentence(
  baseId: string,
  rawText: string,
  tokenMap?: Record<string, { lemma: string; gloss: string; transliteration?: string }>,
): RawToken[] {
  const words = rawText.split(/\s+/).filter(Boolean);
  return words.map((word, idx) => {
    const clean = word.replace(/^[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›]+|[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›]+$/g, '');
    const punctEnd = word.replace(clean, '');
    const mapped = tokenMap?.[clean];
    const normalized = clean
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return {
      id: `${baseId}-t${idx}`,
      surface: word,
      normalized,
      lemma: mapped?.lemma || normalized,
      gloss: mapped?.gloss || '',
      punctBefore: idx === 0 ? '' : ' ',
      punctAfter: punctEnd ? punctEnd + ' ' : ' ',
      transliteration: mapped?.transliteration,
    };
  });
}

export function sentenceFromTokens(id: string, tokens: RawToken[], translation?: string): RawSentence {
  return { id, tokens, translation };
}

export function makeSection(
  textId: string,
  sequence: number,
  label: string,
  sentences: RawSentence[],
  nextSectionId?: string,
  previousSectionId?: string,
) {
  return {
    id: `${textId}-sec${sequence}`,
    textId,
    sequence,
    label,
    sentences: sentences.map((s) => ({
      id: s.id,
      tokens: s.tokens.map((t) => ({
        id: t.id,
        surface: t.surface,
        normalized: t.normalized,
        lemma: t.lemma,
        gloss: t.gloss,
        morphology: t.morphology || { partOfSpeech: 'unknown' },
        transliteration: t.transliteration,
        punctBefore: t.punctBefore,
        punctAfter: t.punctAfter,
      })),
      translation: s.translation,
    })),
    nextSectionId,
    previousSectionId,
  };
}
