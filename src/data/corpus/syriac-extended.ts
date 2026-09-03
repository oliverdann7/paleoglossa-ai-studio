import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const SYR_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  ܗܘܐ: { lemma: 'ܗܘܐ', gloss: 'was', partOfSpeech: 'verb' },
  ܗܘܬ: { lemma: 'ܗܘܐ', gloss: 'was (f)', partOfSpeech: 'verb' },
  ܓܒܪܐ: { lemma: 'ܓܒܪܐ', gloss: 'man', partOfSpeech: 'noun' },
  ܐܠܗܐ: { lemma: 'ܐܠܗܐ', gloss: 'God', partOfSpeech: 'noun' },
  ܕܐܠܗܐ: { lemma: 'ܐܠܗܐ', gloss: 'of God', partOfSpeech: 'noun' },
  ܡܢ: { lemma: 'ܡܢ', gloss: 'from', partOfSpeech: 'preposition' },
  ܕܡܢ: { lemma: 'ܡܢ', gloss: 'of/from', partOfSpeech: 'preposition' },
  ܫܡܗ: { lemma: 'ܫܡܐ', gloss: 'his name', partOfSpeech: 'noun' },
  ܝܘܚܢܢ: { lemma: 'ܝܘܚܢܢ', gloss: 'John', partOfSpeech: 'noun' },
  ܗܢܐ: { lemma: 'ܗܢܐ', gloss: 'this', partOfSpeech: 'pronoun' },
  ܗܘ: { lemma: 'ܗܘ', gloss: 'he', partOfSpeech: 'pronoun' },
  ܐܬܐ: { lemma: 'ܐܬܐ', gloss: 'came', partOfSpeech: 'verb' },
  ܢܘܗܪܐ: { lemma: 'ܢܘܗܪܐ', gloss: 'light', partOfSpeech: 'noun' },
  ܥܠ: { lemma: 'ܥܠ', gloss: 'on, upon', partOfSpeech: 'preposition' },
  ܠܐ: { lemma: 'ܠܐ', gloss: 'not', partOfSpeech: 'adverb' },
  ܐܠܐ: { lemma: 'ܐܠܐ', gloss: 'but', partOfSpeech: 'conjunction' },
  ܡܠܬܐ: { lemma: 'ܡܠܬܐ', gloss: 'word', partOfSpeech: 'noun' },
  ܦܓܪܐ: { lemma: 'ܦܓܪܐ', gloss: 'flesh, body', partOfSpeech: 'noun' },
  ܥܡ: { lemma: 'ܥܡ', gloss: 'with', partOfSpeech: 'preposition' },
  ܐܒܐ: { lemma: 'ܐܒܐ', gloss: 'father', partOfSpeech: 'noun' },
  ܒܪܗ: { lemma: 'ܒܪܐ', gloss: 'his son', partOfSpeech: 'noun' },
  ܟܠ: { lemma: 'ܟܠ', gloss: 'all, every', partOfSpeech: 'adjective' },
  ܕܟܠ: { lemma: 'ܟܠ', gloss: 'of all', partOfSpeech: 'adjective' },
  ܒܪܫܝܬ: { lemma: 'ܒܪܫܝܬ', gloss: 'in the beginning', partOfSpeech: 'adverb' },
  ܒܪܐ: { lemma: 'ܒܪܐ', gloss: 'created', partOfSpeech: 'verb' },
  ܫܡܝܐ: { lemma: 'ܫܡܝܐ', gloss: 'heavens', partOfSpeech: 'noun' },
  ܐܪܥܐ: { lemma: 'ܐܪܥܐ', gloss: 'earth', partOfSpeech: 'noun' },
  ܚܫܘܟܐ: { lemma: 'ܚܫܘܟܐ', gloss: 'darkness', partOfSpeech: 'noun' },
  ܡܝܐ: { lemma: 'ܡܝܐ', gloss: 'waters', partOfSpeech: 'noun' },
  ܢܗܘܐ: { lemma: 'ܗܘܐ', gloss: 'let there be', partOfSpeech: 'verb' },
};

export const SYR_JOHN_2: TextSection = {
  id: 'Syr-Jn-2',
  textId: 'Syr-Jn-1',
  sequence: 2,
  label: 'John 1:6–14 — The Word Became Flesh',
  sentences: [
    sentLex(
      'Syr-Jn-2-1',
      ['ܗܘܐ', 'ܓܒܪܐ', 'ܕܫܝܪ', 'ܡܢ', 'ܐܠܗܐ', 'ܫܡܗ', 'ܝܘܚܢܢ'],
      'There was a man sent from God, whose name was John.',
      SYR_LEXICON
    ),
    sentLex(
      'Syr-Jn-2-2',
      ['ܗܢܐ', 'ܐܬܐ', 'ܠܣܗܕܘܬܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ', 'ܕܟܠ', 'ܢܗܝܡܘܢ', 'ܒܝܕܗ'],
      'He came for testimony, to bear witness about the light, that all might believe through him.',
      SYR_LEXICON
    ),
    sentLex(
      'Syr-Jn-2-3',
      ['ܠܐ', 'ܗܘܐ', 'ܗܘ', 'ܢܘܗܪܐ', 'ܐܠܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ'],
      'He was not the light, but came to bear witness about the light.',
      SYR_LEXICON
    ),
    sentLex(
      'Syr-Jn-2-4',
      [
        'ܡܠܬܐ',
        'ܓܝܪ',
        'ܦܓܪܐ',
        'ܗܘܬ',
        'ܘܫܪܝܬ',
        'ܒܝܢܢ',
        'ܘܚܙܝܢ',
        'ܫܘܒܚܗ',
        'ܫܘܒܚܐ',
        'ܐܝܟ',
        'ܕܡܢ',
        'ܐܒܐ',
        'ܠܒܪܗ',
        'ܘܡܠܐ',
        'ܛܝܒܘܬܐ',
        'ܘܩܘܫܬܐ',
      ],
      'And the Word became flesh and dwelt among us, and we beheld his glory, the glory as of the only begotten of the Father, full of grace and truth.',
      SYR_LEXICON
    ),
  ],
};

export const SYR_GENESIS_1: TextSection = {
  id: 'Syr-Gen-1',
  textId: 'Syr-Gen',
  sequence: 1,
  label: 'Genesis 1:1–5 — Creation',
  sentences: [
    sentLex(
      'Syr-Gen-1-1',
      ['ܒܪܫܝܬ', 'ܒܪܐ', 'ܐܠܗܐ', 'ܝܬ', 'ܫܡܝܐ', 'ܘܝܬ', 'ܐܪܥܐ'],
      'In the beginning God created the heavens and the earth.',
      SYR_LEXICON
    ),
    sentLex(
      'Syr-Gen-1-2',
      [
        'ܘܐܪܥܐ',
        'ܗܘܬ',
        'ܬܘܗ',
        'ܘܒܘܗ',
        'ܘܚܫܘܟܐ',
        'ܥܠ',
        'ܐܦܝ',
        'ܬܗܘܡܐ',
        'ܘܪܘܚܗ',
        'ܕܐܠܗܐ',
        'ܡܪܚܦܐ',
        'ܗܘܬ',
        'ܥܠ',
        'ܐܦܝ',
        'ܡܝܐ',
      ],
      'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
      SYR_LEXICON
    ),
    sentLex(
      'Syr-Gen-1-3',
      ['ܘܐܡܪ', 'ܐܠܗܐ', 'ܢܗܘܐ', 'ܢܘܗܪܐ', 'ܘܗܘܐ', 'ܢܘܗܪܐ'],
      'And God said, Let there be light, and there was light.',
      SYR_LEXICON
    ),
  ],
};

export const ALL_SYRIAC_EXTENDED_SECTIONS: TextSection[] = [SYR_JOHN_2, SYR_GENESIS_1];
