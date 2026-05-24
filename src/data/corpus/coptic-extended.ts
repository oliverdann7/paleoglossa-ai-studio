import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const COP_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  ⲡⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God', partOfSpeech: 'noun' },
  ⲡⲉ: { lemma: 'ⲡⲉ', gloss: 'is (m)', partOfSpeech: 'verb' },
  ⲡⲟⲩⲟⲉⲓⲛ: { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'light', partOfSpeech: 'noun' },
  ⲙⲡⲟⲩⲟⲉⲓⲛ: { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'of the light', partOfSpeech: 'noun' },
  ⲓⲱϩⲁⲛⲛⲏⲥ: { lemma: 'ⲓⲱϩⲁⲛⲛⲏⲥ', gloss: 'John', partOfSpeech: 'noun' },
  ⲡϣⲁϫⲉ: { lemma: 'ϣⲁϫⲉ', gloss: 'the word', partOfSpeech: 'noun' },
  ⲛⲉⲩⲛ: { lemma: 'ⲟⲩⲛ', gloss: 'there was', partOfSpeech: 'verb' },
  ⲟⲩⲣⲱⲙⲉ: { lemma: 'ⲣⲱⲙⲉ', gloss: 'a man', partOfSpeech: 'noun' },
  ⲡⲁⲓ: { lemma: 'ⲡⲁⲓ', gloss: 'this one', partOfSpeech: 'pronoun' },
  ⲁϥⲉⲓ: { lemma: 'ⲉⲓ', gloss: 'he came', partOfSpeech: 'verb' },
  ⲛⲧⲟϥ: { lemma: 'ⲛⲧⲟϥ', gloss: 'he', partOfSpeech: 'pronoun' },
  ⲛⲉ: { lemma: 'ⲛⲉ', gloss: 'was not', partOfSpeech: 'particle' },
  ⲡⲙⲁ: { lemma: 'ⲙⲁ', gloss: 'the place', partOfSpeech: 'noun' },
  ⲁⲗⲗⲁ: { lemma: 'ⲁⲗⲗⲁ', gloss: 'but', partOfSpeech: 'conjunction' },
  ⲁϥϣⲱⲡⲉ: { lemma: 'ϣⲱⲡⲉ', gloss: 'he became', partOfSpeech: 'verb' },
  ⲁⲩⲱ: { lemma: 'ⲁⲩⲱ', gloss: 'and', partOfSpeech: 'conjunction' },
  ⲁⲛⲁⲩ: { lemma: 'ⲛⲁⲩ', gloss: 'we saw', partOfSpeech: 'verb' },
  ⲡⲉⲓⲱⲧ: { lemma: 'ⲉⲓⲱⲧ', gloss: 'the father', partOfSpeech: 'noun' },
  ⲓⲏⲥⲟⲩⲥ: { lemma: 'ⲓⲏⲥⲟⲩⲥ', gloss: 'Jesus', partOfSpeech: 'noun' },
  ⲡⲉϫⲉ: { lemma: 'ⲡⲉϫⲉ', gloss: 'said', partOfSpeech: 'verb' },
  ϫⲉ: { lemma: 'ϫⲉ', gloss: 'that, saying', partOfSpeech: 'conjunction' },
};

export const COP_JOHN_2: TextSection = {
  id: 'Cop-Jn-2',
  textId: 'Cop-Jn',
  sequence: 2,
  label: 'John 1:6–14 — The True Light',
  sentences: [
    sentLex(
      'Cop-Jn-2-1',
      ['ⲛⲉⲩⲛ', 'ⲟⲩⲣⲱⲙⲉ', 'ⲉⲁⲩϫⲟⲟⲩϥ', 'ϩⲓⲧⲙ', 'ⲡⲛⲟⲩⲧⲉ', 'ⲉⲡⲉϥⲣⲁⲛ', 'ⲡⲉ', 'ⲓⲱϩⲁⲛⲛⲏⲥ'],
      'There was a man sent from God, whose name was John.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Jn-2-2',
      [
        'ⲡⲁⲓ',
        'ⲁϥⲉⲓ',
        'ⲉⲩⲙⲛⲧⲙⲛⲧⲣⲉ',
        'ϫⲉⲕⲁⲁⲥ',
        'ⲉϥⲉⲣⲙⲛⲧⲣⲉ',
        'ⲙⲡⲟⲩⲟⲉⲓⲛ',
        'ϫⲉⲕⲁⲁⲥ',
        'ⲛⲟⲩⲟⲛ',
        'ⲛⲓⲙ',
        'ⲉⲩⲉⲡⲓⲥⲧⲉⲩⲉ',
        'ⲉⲃⲟⲗ',
        'ϩⲓⲧⲟⲟⲧϥ',
      ],
      'He came as a witness, to bear witness about the light, that all might believe through him.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Jn-2-3',
      ['ⲛⲧⲟϥ', 'ⲛⲉ', 'ⲡⲙⲁ', 'ⲡⲉ', 'ⲡⲟⲩⲟⲉⲓⲛ', 'ⲁⲗⲗⲁ', 'ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ', 'ⲙⲡⲟⲩⲟⲉⲓⲛ'],
      'He was not the light, but came to bear witness about the light.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Jn-2-4',
      [
        'ⲡϣⲁϫⲉ',
        'ⲇⲉ',
        'ⲁϥϣⲱⲡⲉ',
        'ⲛⲥⲁⲣⲝ',
        'ⲁϥϣⲱⲡⲉ',
        'ⲛϩⲏⲧⲛ',
        'ⲁⲩⲱ',
        'ⲁⲛⲁⲩ',
        'ⲉⲡⲉϥⲉⲟⲟⲩ',
        'ⲉⲟⲩⲉⲟⲟⲩ',
        'ⲙⲙⲁⲩⲁⲁⲧϥ',
        'ⲉⲃⲟⲗ',
        'ϩⲓⲧⲙ',
        'ⲡⲉⲓⲱⲧ',
        'ⲉϥⲙⲉϩ',
        'ⲛϩⲙⲟⲧ',
        'ⲙⲛ',
        'ⲟⲩⲙⲉ',
      ],
      'And the Word became flesh and dwelt among us, full of grace and truth.',
      COP_LEXICON
    ),
  ],
};

export const COP_GOSPEL_THOMAS_1: TextSection = {
  id: 'Cop-Thom-1',
  textId: 'Cop-Thom',
  sequence: 1,
  label: 'Logion 1–4 — The Hidden Sayings',
  sentences: [
    sentLex(
      'Cop-Thom-1-1',
      [
        'ⲛⲉⲓϣⲁϫⲉ',
        'ⲉⲧⲏⲡ',
        'ⲉⲧⲟⲛϧ',
        'ⲁⲩϫⲟⲟⲩ',
        'ⲛϫⲉ',
        'ⲓⲏⲥⲟⲩⲥ',
        'ⲁⲩⲱ',
        'ⲁϥϫⲟⲟⲩ',
        'ⲛϭⲓ',
        'ⲑⲱⲙⲁⲥ',
        'ⲡⲇⲓⲇⲩⲙⲟⲥ',
        'ⲁϥϫⲟⲟⲥ',
        'ϫⲉ',
        'ⲡⲉⲧⲉϥⲉϩⲉ',
      ],
      'These are the hidden sayings that the living Jesus spoke and Didymus Judas Thomas wrote down.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Thom-1-2',
      ['ⲁϥϫⲟⲟⲥ', 'ϫⲉ', 'ⲡⲉⲧⲉϥⲉϩⲉ', 'ⲉⲡⲗⲁϩ', 'ⲛⲛⲉⲓϣⲁϫⲉ', 'ⲛϥϫⲓⲙⲉ', 'ⲉⲡⲟⲩⲟⲉⲓϣ', 'ⲙⲡⲙⲟⲩ', 'ⲁⲛ'],
      'And he said, Whoever finds the interpretation of these sayings will not taste death.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Thom-1-3',
      ['ⲡⲉϫⲉ', 'ⲓⲏⲥⲟⲩⲥ', 'ϫⲉ', 'ⲙⲁⲣⲉ', 'ⲡⲉⲧⲕⲱϯ', 'ⲛϥⲧⲟⲩⲛⲟⲥ', 'ϣⲁⲧⲉϥⲉⲓ', 'ⲉⲛⲉⲧϣⲟⲟⲡ', 'ⲙⲡⲉⲓⲛⲁⲩ'],
      'Jesus said, Let him who seeks not cease seeking until he finds.',
      COP_LEXICON
    ),
    sentLex(
      'Cop-Thom-1-4',
      [
        'ⲁⲩⲱ',
        'ϩⲟⲧⲁⲛ',
        'ⲉϥϣⲁⲛϩⲉ',
        'ϥⲛⲁϣⲧⲟⲣⲧⲣ',
        'ⲁⲩⲱ',
        'ⲉϥϣⲁⲛϣⲧⲟⲣⲧⲣ',
        'ϥⲛⲁⲣϣⲡⲏⲣⲉ',
        'ⲁⲩⲱ',
        'ϥⲛⲁⲉⲣⲟ',
        'ⲉⲧⲡⲉ',
        'ⲧⲏⲣⲥ',
      ],
      'And when he finds, he will be troubled; and when he is troubled, he will marvel, and he will reign over the All.',
      COP_LEXICON
    ),
  ],
};

export const ALL_COPTIC_EXTENDED_SECTIONS: TextSection[] = [COP_JOHN_2, COP_GOSPEL_THOMAS_1];
