import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: normalized,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

export const COP_JOHN_2: TextSection = {
  id: 'Cop-Jn-2',
  textId: 'Cop-Jn',
  sequence: 2,
  label: 'John 1:6–14 — The True Light',
  sentences: [
    sent('Cop-Jn-2-1', ['ⲛⲉⲩⲛ', 'ⲟⲩⲣⲱⲙⲉ', 'ⲉⲁⲩϫⲟⲟⲩϥ', 'ϩⲓⲧⲙ', 'ⲡⲛⲟⲩⲧⲉ', 'ⲉⲡⲉϥⲣⲁⲛ', 'ⲡⲉ', 'ⲓⲱϩⲁⲛⲛⲏⲥ'], 'There was a man sent from God, whose name was John.'),
    sent('Cop-Jn-2-2', ['ⲡⲁⲓ', 'ⲁϥⲉⲓ', 'ⲉⲩⲙⲛⲧⲙⲛⲧⲣⲉ', 'ϫⲉⲕⲁⲁⲥ', 'ⲉϥⲉⲣⲙⲛⲧⲣⲉ', 'ⲙⲡⲟⲩⲟⲉⲓⲛ', 'ϫⲉⲕⲁⲁⲥ', 'ⲛⲟⲩⲟⲛ', 'ⲛⲓⲙ', 'ⲉⲩⲉⲡⲓⲥⲧⲉⲩⲉ', 'ⲉⲃⲟⲗ', 'ϩⲓⲧⲟⲟⲧϥ'], 'He came as a witness, to bear witness about the light, that all might believe through him.'),
    sent('Cop-Jn-2-3', ['ⲛⲧⲟϥ', 'ⲛⲉ', 'ⲡⲙⲁ', 'ⲡⲉ', 'ⲡⲟⲩⲟⲉⲓⲛ', 'ⲁⲗⲗⲁ', 'ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ', 'ⲙⲡⲟⲩⲟⲉⲓⲛ'], 'He was not the light, but came to bear witness about the light.'),
    sent('Cop-Jn-2-4', ['ⲡϣⲁϫⲉ', 'ⲇⲉ', 'ⲁϥϣⲱⲡⲉ', 'ⲛⲥⲁⲣⲝ', 'ⲁϥϣⲱⲡⲉ', 'ⲛϩⲏⲧⲛ', 'ⲁⲩⲱ', 'ⲁⲛⲁⲩ', 'ⲉⲡⲉϥⲉⲟⲟⲩ', 'ⲉⲟⲩⲉⲟⲟⲩ', 'ⲙⲙⲁⲩⲁⲁⲧϥ', 'ⲉⲃⲟⲗ', 'ϩⲓⲧⲙ', 'ⲡⲉⲓⲱⲧ', 'ⲉϥⲙⲉϩ', 'ⲛϩⲙⲟⲧ', 'ⲙⲛ', 'ⲟⲩⲙⲉ'], 'And the Word became flesh and dwelt among us, full of grace and truth.'),
  ],
};

export const COP_GOSPEL_THOMAS_1: TextSection = {
  id: 'Cop-Thom-1',
  textId: 'Cop-Thom',
  sequence: 1,
  label: 'Logion 1–4 — The Hidden Sayings',
  sentences: [
    sent('Cop-Thom-1-1', ['ⲛⲉⲓϣⲁϫⲉ', 'ⲉⲧⲏⲡ', 'ⲉⲧⲟⲛϧ', 'ⲁⲩϫⲟⲟⲩ', 'ⲛϫⲉ', 'ⲓⲏⲥⲟⲩⲥ', 'ⲁⲩⲱ', 'ⲁϥϫⲟⲟⲩ', 'ⲛϭⲓ', 'ⲑⲱⲙⲁⲥ', 'ⲡⲇⲓⲇⲩⲙⲟⲥ', 'ⲁϥϫⲟⲟⲥ', 'ϫⲉ', 'ⲡⲉⲧⲉϥⲉϩⲉ'], 'These are the hidden sayings that the living Jesus spoke and Didymus Judas Thomas wrote down.'),
    sent('Cop-Thom-1-2', ['ⲁϥϫⲟⲟⲥ', 'ϫⲉ', 'ⲡⲉⲧⲉϥⲉϩⲉ', 'ⲉⲡⲗⲁϩ', 'ⲛⲛⲉⲓϣⲁϫⲉ', 'ⲛϥϫⲓⲙⲉ', 'ⲉⲡⲟⲩⲟⲉⲓϣ', 'ⲙⲡⲙⲟⲩ', 'ⲁⲛ'], 'And he said, Whoever finds the interpretation of these sayings will not taste death.'),
    sent('Cop-Thom-1-3', ['ⲡⲉϫⲉ', 'ⲓⲏⲥⲟⲩⲥ', 'ϫⲉ', 'ⲙⲁⲣⲉ', 'ⲡⲉⲧⲕⲱϯ', 'ⲛϥⲧⲟⲩⲛⲟⲥ', 'ϣⲁⲧⲉϥⲉⲓ', 'ⲉⲛⲉⲧϣⲟⲟⲡ', 'ⲙⲡⲉⲓⲛⲁⲩ'], 'Jesus said, Let him who seeks not cease seeking until he finds.'),
    sent('Cop-Thom-1-4', ['ⲁⲩⲱ', 'ϩⲟⲧⲁⲛ', 'ⲉϥϣⲁⲛϩⲉ', 'ϥⲛⲁϣⲧⲟⲣⲧⲣ', 'ⲁⲩⲱ', 'ⲉϥϣⲁⲛϣⲧⲟⲣⲧⲣ', 'ϥⲛⲁⲣϣⲡⲏⲣⲉ', 'ⲁⲩⲱ', 'ϥⲛⲁⲉⲣⲟ', 'ⲉⲧⲡⲉ', 'ⲧⲏⲣⲥ'], 'And when he finds, he will be troubled; and when he is troubled, he will marvel, and he will reign over the All.'),
  ],
};

export const ALL_COPTIC_EXTENDED_SECTIONS: TextSection[] = [
  COP_JOHN_2,
  COP_GOSPEL_THOMAS_1,
];
