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

const COP_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'ⲛⲉⲩⲛ': { lemma: 'ⲟⲩⲛ', gloss: 'there was' },
  'ⲟⲩⲣⲱⲙⲉ': { lemma: 'ⲣⲱⲙⲉ', gloss: 'a man' },
  'ⲉⲁⲩϫⲟⲟⲩϥ': { lemma: 'ϫⲟⲟⲩ', gloss: 'sent' },
  'ϩⲓⲧⲙ': { lemma: 'ϩⲓⲧⲙ', gloss: 'by, from, through' },
  'ⲡⲛⲟⲩⲧⲉ': { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God' },
  'ⲉⲡⲉϥⲣⲁⲛ': { lemma: 'ⲣⲁⲛ', gloss: 'his name' },
  'ⲡⲉ': { lemma: 'ⲡⲉ', gloss: 'is/was (copula)' },
  'ⲓⲱϩⲁⲛⲛⲏⲥ': { lemma: 'ⲓⲱϩⲁⲛⲛⲏⲥ', gloss: 'John' },
  'ⲡⲁⲓ': { lemma: 'ⲡⲁⲓ', gloss: 'this, he' },
  'ⲁϥⲉⲓ': { lemma: 'ⲉⲓ', gloss: 'he came' },
  'ⲉⲩⲙⲛⲧⲙⲛⲧⲣⲉ': { lemma: 'ⲙⲛⲧⲙⲛⲧⲣⲉ', gloss: 'for a witness' },
  'ϫⲉⲕⲁⲁⲥ': { lemma: 'ϫⲉⲕⲁⲁⲥ', gloss: 'in order that' },
  'ⲉϥⲉⲣⲙⲛⲧⲣⲉ': { lemma: 'ⲉⲣⲙⲛⲧⲣⲉ', gloss: 'he might bear witness' },
  'ⲙⲡⲟⲩⲟⲉⲓⲛ': { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'of the light' },
  'ⲛⲟⲩⲟⲛ': { lemma: 'ⲟⲩⲟⲛ', gloss: 'everyone' },
  'ⲛⲓⲙ': { lemma: 'ⲛⲓⲙ', gloss: 'whoever' },
  'ⲉⲩⲉⲡⲓⲥⲧⲉⲩⲉ': { lemma: 'ⲡⲓⲥⲧⲉⲩⲉ', gloss: 'might believe' },
  'ⲉⲃⲟⲗ': { lemma: 'ⲉⲃⲟⲗ', gloss: 'out, forth' },
  'ϩⲓⲧⲟⲟⲧϥ': { lemma: 'ϩⲓⲧⲟⲟⲧϥ', gloss: 'through him' },
  'ⲛⲧⲟϥ': { lemma: 'ⲛⲧⲟϥ', gloss: 'he himself' },
  'ⲛⲉ': { lemma: 'ⲛⲉ', gloss: 'was not (neg.)' },
  'ⲡⲙⲁ': { lemma: 'ⲙⲁ', gloss: 'the place (one)' },
  'ⲡⲟⲩⲟⲉⲓⲛ': { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'the light' },
  'ⲁⲗⲗⲁ': { lemma: 'ⲁⲗⲗⲁ', gloss: 'but' },
  'ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ': { lemma: 'ⲉⲣⲙⲛⲧⲣⲉ', gloss: 'that he bear witness' },
  'ⲡϣⲁϫⲉ': { lemma: 'ϣⲁϫⲉ', gloss: 'the Word' },
  'ⲇⲉ': { lemma: 'ⲇⲉ', gloss: 'and, but' },
  'ⲁϥϣⲱⲡⲉ': { lemma: 'ϣⲱⲡⲉ', gloss: 'it became' },
  'ⲛⲥⲁⲣⲝ': { lemma: 'ⲥⲁⲣⲝ', gloss: 'as flesh' },
  'ⲛϩⲏⲧⲛ': { lemma: 'ϩⲏⲧⲛ', gloss: 'among us' },
  'ⲁⲩⲱ': { lemma: 'ⲁⲩⲱ', gloss: 'and' },
  'ⲁⲛⲁⲩ': { lemma: 'ⲛⲁⲩ', gloss: 'we saw' },
  'ⲉⲡⲉϥⲉⲟⲟⲩ': { lemma: 'ⲉⲟⲟⲩ', gloss: 'his glory' },
  'ⲉⲟⲩⲉⲟⲟⲩ': { lemma: 'ⲉⲟⲟⲩ', gloss: 'a glory' },
  'ⲙⲙⲁⲩⲁⲁⲧϥ': { lemma: 'ⲙⲁⲩⲁⲁⲧϥ', gloss: 'only-begotten' },

  'ⲡⲉⲓⲱⲧ': { lemma: 'ⲉⲓⲱⲧ', gloss: 'the Father' },
  'ⲉϥⲙⲉϩ': { lemma: 'ⲙⲟⲩϩ', gloss: 'full of' },
  'ⲛϩⲙⲟⲧ': { lemma: 'ϩⲙⲟⲧ', gloss: 'grace' },
  'ⲙⲛ': { lemma: 'ⲙⲛ', gloss: 'and, with' },
  'ⲟⲩⲙⲉ': { lemma: 'ⲙⲉ', gloss: 'truth' },
  'ⲛⲉⲓϣⲁϫⲉ': { lemma: 'ϣⲁϫⲉ', gloss: 'these words' },
  'ⲉⲧⲏⲡ': { lemma: 'ⲱⲡ', gloss: 'hidden' },
  'ⲉⲧⲟⲛϧ': { lemma: 'ⲱⲛϧ', gloss: 'living' },
  'ⲁⲩϫⲟⲟⲩ': { lemma: 'ϫⲟⲟⲩ', gloss: 'they spoke' },
  'ⲛϫⲉ': { lemma: 'ⲛϫⲉ', gloss: '(introduces subject)' },
  'ⲓⲏⲥⲟⲩⲥ': { lemma: 'ⲓⲏⲥⲟⲩⲥ', gloss: 'Jesus' },
  'ⲁϥϫⲟⲟⲩ': { lemma: 'ϫⲟⲟⲩ', gloss: 'he spoke' },
  'ⲛϭⲓ': { lemma: 'ⲛϭⲓ', gloss: '(introduces subject)' },
  'ⲑⲱⲙⲁⲥ': { lemma: 'ⲑⲱⲙⲁⲥ', gloss: 'Thomas' },
  'ⲡⲇⲓⲇⲩⲙⲟⲥ': { lemma: 'ⲇⲓⲇⲩⲙⲟⲥ', gloss: 'Didymus' },
  'ⲁϥϫⲟⲟⲥ': { lemma: 'ϫⲟⲟⲥ', gloss: 'he said' },
  'ϫⲉ': { lemma: 'ϫⲉ', gloss: 'that, saying' },
  'ⲡⲉⲧⲉϥⲉϩⲉ': { lemma: 'ϩⲉ', gloss: 'who will find' },
  'ⲉⲡⲗⲁϩ': { lemma: 'ⲗⲁϩ', gloss: 'to the interpretation' },
  'ⲛⲛⲉⲓϣⲁϫⲉ': { lemma: 'ϣⲁϫⲉ', gloss: 'of these words' },
  'ⲛϥϫⲓⲙⲉ': { lemma: 'ϫⲓⲙⲉ', gloss: 'he will find' },
  'ⲉⲡⲟⲩⲟⲉⲓϣ': { lemma: 'ⲟⲩⲟⲉⲓϣ', gloss: 'the taste' },
  'ⲙⲡⲙⲟⲩ': { lemma: 'ⲙⲟⲩ', gloss: 'of death' },
  'ⲁⲛ': { lemma: 'ⲁⲛ', gloss: 'not' },
  'ⲡⲉϫⲉ': { lemma: 'ⲡⲉϫⲉ', gloss: 'said' },
  'ⲙⲁⲣⲉ': { lemma: 'ⲙⲁⲣⲉ', gloss: 'let' },
  'ⲡⲉⲧⲕⲱϯ': { lemma: 'ⲕⲱϯ', gloss: 'he who seeks' },
  'ⲛϥⲧⲟⲩⲛⲟⲥ': { lemma: 'ⲧⲟⲩⲛⲟⲥ', gloss: 'let him not cease' },
  'ϣⲁⲧⲉϥⲉⲓ': { lemma: 'ⲉⲓ', gloss: 'until he comes' },
  'ⲉⲛⲉⲧϣⲟⲟⲡ': { lemma: 'ϣⲱⲡⲉ', gloss: 'to what exists' },
  'ⲙⲡⲉⲓⲛⲁⲩ': { lemma: 'ⲛⲁⲩ', gloss: 'in that time' },
  'ϩⲟⲧⲁⲛ': { lemma: 'ϩⲟⲧⲁⲛ', gloss: 'when' },
  'ⲉϥϣⲁⲛϩⲉ': { lemma: 'ϩⲉ', gloss: 'when he finds' },
  'ϥⲛⲁϣⲧⲟⲣⲧⲣ': { lemma: 'ϣⲧⲟⲣⲧⲣ', gloss: 'he will be troubled' },
  'ⲉϥϣⲁⲛϣⲧⲟⲣⲧⲣ': { lemma: 'ϣⲧⲟⲣⲧⲣ', gloss: 'when he is troubled' },
  'ϥⲛⲁⲣϣⲡⲏⲣⲉ': { lemma: 'ⲣϣⲡⲏⲣⲉ', gloss: 'he will marvel' },
  'ϥⲛⲁⲉⲣⲟ': { lemma: 'ⲉⲣⲟ', gloss: 'he will reign' },
  'ⲉⲧⲡⲉ': { lemma: 'ⲡⲉ', gloss: 'over the' },
  'ⲧⲏⲣⲥ': { lemma: 'ⲧⲏⲣϥ', gloss: 'all' },
};

export const COP_JOHN_2: TextSection = {
  id: 'Cop-Jn-2',
  textId: 'Cop-Jn-1',
  sequence: 2,
  label: 'John 1:6–14 — The True Light',
  sentences: [
    sent(
      'Cop-Jn-2-1',
      ['ⲛⲉⲩⲛ', 'ⲟⲩⲣⲱⲙⲉ', 'ⲉⲁⲩϫⲟⲟⲩϥ', 'ϩⲓⲧⲙ', 'ⲡⲛⲟⲩⲧⲉ', 'ⲉⲡⲉϥⲣⲁⲛ', 'ⲡⲉ', 'ⲓⲱϩⲁⲛⲛⲏⲥ'],
      'There was a man sent from God, whose name was John.',
      COP_GLOSS
    ),
    sent(
      'Cop-Jn-2-2',
      [
        'ⲡⲁⲓ', 'ⲁϥⲉⲓ', 'ⲉⲩⲙⲛⲧⲙⲛⲧⲣⲉ', 'ϫⲉⲕⲁⲁⲥ', 'ⲉϥⲉⲣⲙⲛⲧⲣⲉ',
        'ⲙⲡⲟⲩⲟⲉⲓⲛ', 'ϫⲉⲕⲁⲁⲥ', 'ⲛⲟⲩⲟⲛ', 'ⲛⲓⲙ', 'ⲉⲩⲉⲡⲓⲥⲧⲉⲩⲉ', 'ⲉⲃⲟⲗ', 'ϩⲓⲧⲟⲟⲧϥ',
      ],
      'He came as a witness, to bear witness about the light, that all might believe through him.',
      COP_GLOSS
    ),
    sent(
      'Cop-Jn-2-3',
      ['ⲛⲧⲟϥ', 'ⲛⲉ', 'ⲡⲙⲁ', 'ⲡⲉ', 'ⲡⲟⲩⲟⲉⲓⲛ', 'ⲁⲗⲗⲁ', 'ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ', 'ⲙⲡⲟⲩⲟⲉⲓⲛ'],
      'He was not the light, but came to bear witness about the light.',
      COP_GLOSS
    ),
    sent(
      'Cop-Jn-2-4',
      [
        'ⲡϣⲁϫⲉ', 'ⲇⲉ', 'ⲁϥϣⲱⲡⲉ', 'ⲛⲥⲁⲣⲝ', 'ⲁϥϣⲱⲡⲉ', 'ⲛϩⲏⲧⲛ',
        'ⲁⲩⲱ', 'ⲁⲛⲁⲩ', 'ⲉⲡⲉϥⲉⲟⲟⲩ', 'ⲉⲟⲩⲉⲟⲟⲩ', 'ⲙⲙⲁⲩⲁⲁⲧϥ',
        'ⲉⲃⲟⲗ', 'ϩⲓⲧⲙ', 'ⲡⲉⲓⲱⲧ', 'ⲉϥⲙⲉϩ', 'ⲛϩⲙⲟⲧ', 'ⲙⲛ', 'ⲟⲩⲙⲉ',
      ],
      'And the Word became flesh and dwelt among us, full of grace and truth.',
      COP_GLOSS
    ),
  ],
};

export const COP_GOSPEL_THOMAS_1: TextSection = {
  id: 'Cop-Thom-1',
  textId: 'Cop-Thom',
  sequence: 1,
  label: 'Logion 1–4 — The Hidden Sayings',
  sentences: [
    sent(
      'Cop-Thom-1-1',
      [
        'ⲛⲉⲓϣⲁϫⲉ', 'ⲉⲧⲏⲡ', 'ⲉⲧⲟⲛϧ', 'ⲁⲩϫⲟⲟⲩ', 'ⲛϫⲉ', 'ⲓⲏⲥⲟⲩⲥ',
        'ⲁⲩⲱ', 'ⲁϥϫⲟⲟⲩ', 'ⲛϭⲓ', 'ⲑⲱⲙⲁⲥ', 'ⲡⲇⲓⲇⲩⲙⲟⲥ',
        'ⲁϥϫⲟⲟⲥ', 'ϫⲉ', 'ⲡⲉⲧⲉϥⲉϩⲉ',
      ],
      'These are the hidden sayings that the living Jesus spoke and Didymus Judas Thomas wrote down.',
      COP_GLOSS
    ),
    sent(
      'Cop-Thom-1-2',
      ['ⲁϥϫⲟⲟⲥ', 'ϫⲉ', 'ⲡⲉⲧⲉϥⲉϩⲉ', 'ⲉⲡⲗⲁϩ', 'ⲛⲛⲉⲓϣⲁϫⲉ', 'ⲛϥϫⲓⲙⲉ', 'ⲉⲡⲟⲩⲟⲉⲓϣ', 'ⲙⲡⲙⲟⲩ', 'ⲁⲛ'],
      'And he said, Whoever finds the interpretation of these sayings will not taste death.',
      COP_GLOSS
    ),
    sent(
      'Cop-Thom-1-3',
      ['ⲡⲉϫⲉ', 'ⲓⲏⲥⲟⲩⲥ', 'ϫⲉ', 'ⲙⲁⲣⲉ', 'ⲡⲉⲧⲕⲱϯ', 'ⲛϥⲧⲟⲩⲛⲟⲥ', 'ϣⲁⲧⲉϥⲉⲓ', 'ⲉⲛⲉⲧϣⲟⲟⲡ', 'ⲙⲡⲉⲓⲛⲁⲩ'],
      'Jesus said, Let him who seeks not cease seeking until he finds.',
      COP_GLOSS
    ),
    sent(
      'Cop-Thom-1-4',
      [
        'ⲁⲩⲱ', 'ϩⲟⲧⲁⲛ', 'ⲉϥϣⲁⲛϩⲉ', 'ϥⲛⲁϣⲧⲟⲣⲧⲣ',
        'ⲁⲩⲱ', 'ⲉϥϣⲁⲛϣⲧⲟⲣⲧⲣ', 'ϥⲛⲁⲣϣⲡⲏⲣⲉ',
        'ⲁⲩⲱ', 'ϥⲛⲁⲉⲣⲟ', 'ⲉⲧⲡⲉ', 'ⲧⲏⲣⲥ',
      ],
      'And when he finds, he will be troubled; and when he is troubled, he will marvel, and he will reign over the All.',
      COP_GLOSS
    ),
  ],
};

export const ALL_COPTIC_EXTENDED_SECTIONS: TextSection[] = [COP_JOHN_2, COP_GOSPEL_THOMAS_1];
