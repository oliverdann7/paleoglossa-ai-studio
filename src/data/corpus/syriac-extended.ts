import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string, lemmaGloss?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const mapped = lemmaGloss?.[clean];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: mapped?.lemma || normalized,
        gloss: mapped?.gloss || '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

const SYR_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'ܗܘܐ': { lemma: 'ܗܘܐ', gloss: 'was' },
  'ܓܒܪܐ': { lemma: 'ܓܒܪܐ', gloss: 'man' },
  'ܕܫܝܪ': { lemma: 'ܫܕܪ', gloss: 'sent' },
  'ܡܢ': { lemma: 'ܡܢ', gloss: 'from' },
  'ܐܠܗܐ': { lemma: 'ܐܠܗܐ', gloss: 'God' },
  'ܫܡܗ': { lemma: 'ܫܡܐ', gloss: 'his name' },
  'ܝܘܚܢܢ': { lemma: 'ܝܘܚܢܢ', gloss: 'John' },
  'ܗܢܐ': { lemma: 'ܗܢܐ', gloss: 'this, he' },
  'ܐܬܐ': { lemma: 'ܐܬܐ', gloss: 'came' },
  'ܠܣܗܕܘܬܐ': { lemma: 'ܣܗܕܘܬܐ', gloss: 'for testimony' },
  'ܕܢܣܗܕ': { lemma: 'ܣܗܕ', gloss: 'to bear witness' },
  'ܥܠ': { lemma: 'ܥܠ', gloss: 'on, about' },
  'ܢܘܗܪܐ': { lemma: 'ܢܘܗܪܐ', gloss: 'light' },
  'ܕܟܠ': { lemma: 'ܟܠ', gloss: 'that all' },
  'ܢܗܝܡܘܢ': { lemma: 'ܗܝܡܢ', gloss: 'might believe' },
  'ܒܝܕܗ': { lemma: 'ܒܝܕ', gloss: 'through him' },
  'ܠܐ': { lemma: 'ܠܐ', gloss: 'not' },
  'ܗܘ': { lemma: 'ܗܘ', gloss: 'he' },
  'ܐܠܐ': { lemma: 'ܐܠܐ', gloss: 'but' },
  'ܡܠܬܐ': { lemma: 'ܡܠܬܐ', gloss: 'Word' },
  'ܓܝܪ': { lemma: 'ܓܝܪ', gloss: 'for' },
  'ܦܓܪܐ': { lemma: 'ܦܓܪܐ', gloss: 'flesh' },
  'ܗܘܬ': { lemma: 'ܗܘܐ', gloss: 'became, was' },
  'ܘܫܪܝܬ': { lemma: 'ܫܪܐ', gloss: 'and dwelt' },
  'ܒܝܢܢ': { lemma: 'ܒܝܢ', gloss: 'among us' },
  'ܘܚܙܝܢ': { lemma: 'ܚܙܐ', gloss: 'and we beheld' },
  'ܫܘܒܚܗ': { lemma: 'ܫܘܒܚܐ', gloss: 'his glory' },
  'ܫܘܒܚܐ': { lemma: 'ܫܘܒܚܐ', gloss: 'glory' },
  'ܐܝܟ': { lemma: 'ܐܝܟ', gloss: 'as, like' },
  'ܕܡܢ': { lemma: 'ܕܡܢ', gloss: 'of from' },
  'ܐܒܐ': { lemma: 'ܐܒܐ', gloss: 'Father' },
  'ܠܒܪܗ': { lemma: 'ܒܪ', gloss: 'to his son' },
  'ܘܡܠܐ': { lemma: 'ܡܠܐ', gloss: 'and full' },
  'ܛܝܒܘܬܐ': { lemma: 'ܛܝܒܘܬܐ', gloss: 'grace' },
  'ܘܩܘܫܬܐ': { lemma: 'ܩܘܫܬܐ', gloss: 'and truth' },
  'ܒܪܫܝܬ': { lemma: 'ܒܪܫܝܬ', gloss: 'in the beginning' },
  'ܒܪܐ': { lemma: 'ܒܪܐ', gloss: 'created' },
  'ܝܬ': { lemma: 'ܝܬ', gloss: '(direct object marker)' },
  'ܫܡܝܐ': { lemma: 'ܫܡܝܐ', gloss: 'heavens' },
  'ܘܝܬ': { lemma: 'ܘܝܬ', gloss: 'and (obj.)' },
  'ܐܪܥܐ': { lemma: 'ܐܪܥܐ', gloss: 'earth' },
  'ܘܐܪܥܐ': { lemma: 'ܐܪܥܐ', gloss: 'and the earth' },
  'ܬܘܗ': { lemma: 'ܬܘܗ', gloss: 'without form' },
  'ܘܒܘܗ': { lemma: 'ܒܘܗ', gloss: 'and void' },
  'ܘܚܫܘܟܐ': { lemma: 'ܚܫܘܟܐ', gloss: 'and darkness' },
  'ܐܦܝ': { lemma: 'ܐܦܐ', gloss: 'face of' },
  'ܬܗܘܡܐ': { lemma: 'ܬܗܘܡܐ', gloss: 'deep' },
  'ܘܪܘܚܗ': { lemma: 'ܪܘܚܐ', gloss: 'and the Spirit' },
  'ܕܐܠܗܐ': { lemma: 'ܐܠܗܐ', gloss: 'of God' },
  'ܡܪܚܦܐ': { lemma: 'ܪܚܦ', gloss: 'hovering' },
  'ܡܝܐ': { lemma: 'ܡܝܐ', gloss: 'waters' },
  'ܘܐܡܪ': { lemma: 'ܐܡܪ', gloss: 'and said' },
  'ܢܗܘܐ': { lemma: 'ܗܘܐ', gloss: 'let there be' },
  'ܘܗܘܐ': { lemma: 'ܗܘܐ', gloss: 'and there was' },
};

export const SYR_JOHN_2: TextSection = {
  id: 'Syr-Jn-2',
  textId: 'Syr-Jn-1',
  sequence: 2,
  label: 'John 1:6–14 — The Word Became Flesh',
  sentences: [
    sent(
      'Syr-Jn-2-1',
      ['ܗܘܐ', 'ܓܒܪܐ', 'ܕܫܝܪ', 'ܡܢ', 'ܐܠܗܐ', 'ܫܡܗ', 'ܝܘܚܢܢ'],
      'There was a man sent from God, whose name was John.',
      SYR_GLOSS
    ),
    sent(
      'Syr-Jn-2-2',
      ['ܗܢܐ', 'ܐܬܐ', 'ܠܣܗܕܘܬܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ', 'ܕܟܠ', 'ܢܗܝܡܘܢ', 'ܒܝܕܗ'],
      'He came for testimony, to bear witness about the light, that all might believe through him.',
      SYR_GLOSS
    ),
    sent(
      'Syr-Jn-2-3',
      ['ܠܐ', 'ܗܘܐ', 'ܗܘ', 'ܢܘܗܪܐ', 'ܐܠܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ'],
      'He was not the light, but came to bear witness about the light.',
      SYR_GLOSS
    ),
    sent(
      'Syr-Jn-2-4',
      [
        'ܡܠܬܐ', 'ܓܝܪ', 'ܦܓܪܐ', 'ܗܘܬ', 'ܘܫܪܝܬ', 'ܒܝܢܢ', 'ܘܚܙܝܢ',
        'ܫܘܒܚܗ', 'ܫܘܒܚܐ', 'ܐܝܟ', 'ܕܡܢ', 'ܐܒܐ', 'ܠܒܪܗ', 'ܘܡܠܐ', 'ܛܝܒܘܬܐ', 'ܘܩܘܫܬܐ',
      ],
      'And the Word became flesh and dwelt among us, and we beheld his glory, the glory as of the only begotten of the Father, full of grace and truth.',
      SYR_GLOSS
    ),
  ],
};

export const SYR_GENESIS_1: TextSection = {
  id: 'Syr-Gen-1',
  textId: 'Syr-Gen',
  sequence: 1,
  label: 'Genesis 1:1–5 — Creation',
  sentences: [
    sent(
      'Syr-Gen-1-1',
      ['ܒܪܫܝܬ', 'ܒܪܐ', 'ܐܠܗܐ', 'ܝܬ', 'ܫܡܝܐ', 'ܘܝܬ', 'ܐܪܥܐ'],
      'In the beginning God created the heavens and the earth.',
      SYR_GLOSS
    ),
    sent(
      'Syr-Gen-1-2',
      [
        'ܘܐܪܥܐ', 'ܗܘܬ', 'ܬܘܗ', 'ܘܒܘܗ', 'ܘܚܫܘܟܐ', 'ܥܠ', 'ܐܦܝ', 'ܬܗܘܡܐ',
        'ܘܪܘܚܗ', 'ܕܐܠܗܐ', 'ܡܪܚܦܐ', 'ܗܘܬ', 'ܥܠ', 'ܐܦܝ', 'ܡܝܐ',
      ],
      'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
      SYR_GLOSS
    ),
    sent(
      'Syr-Gen-1-3',
      ['ܘܐܡܪ', 'ܐܠܗܐ', 'ܢܗܘܐ', 'ܢܘܗܪܐ', 'ܘܗܘܐ', 'ܢܘܗܪܐ'],
      'And God said, Let there be light, and there was light.',
      SYR_GLOSS
    ),
  ],
};

export const ALL_SYRIAC_EXTENDED_SECTIONS: TextSection[] = [SYR_JOHN_2, SYR_GENESIS_1];
