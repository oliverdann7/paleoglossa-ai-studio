/**
 * Coptic beginner mini-story — opening of John's Gospel (Sahidic).
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?·()"«»—–]+|[\s.,;:!?·()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: normalized,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

export const COP_MINI_1: TextSection = {
  id: 'CopMini-1',
  textId: 'CopMini-1',
  sequence: 1,
  label: 'ϩⲛ ⲧⲉϩⲟⲩⲉⲓⲧⲉ — In the beginning',
  sentences: [
    sent(
      'CopMini-1-1',
      ['ϩⲛ', 'ⲧⲉϩⲟⲩⲉⲓⲧⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲡϣⲁϫⲉ.'],
      'In the beginning the Word was.'
    ),
    sent(
      'CopMini-1-2',
      ['ⲁⲩⲱ', 'ⲡϣⲁϫⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲛⲛⲁϩⲣⲙ', 'ⲡⲛⲟⲩⲧⲉ.'],
      'And the Word was with God.'
    ),
    sent(
      'CopMini-1-3',
      ['ⲁⲩⲱ', 'ⲛⲉⲩⲛⲟⲩⲧⲉ', 'ⲡⲉ', 'ⲡϣⲁϫⲉ.'],
      'And the Word was God.'
    ),
  ],
};

export const ALL_COPTIC_MINI_STORIES = [COP_MINI_1];
