/**
 * Syriac beginner mini-story — opening of the Lord's Prayer (Peshitta).
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

export const SYR_MINI_1: TextSection = {
  id: 'SyrMini-1',
  textId: 'SyrMini-1',
  sequence: 1,
  label: 'ܐܒܘܢ ܕܒܫܡܝܐ — Our Father in heaven',
  sentences: [
    sent('SyrMini-1-1', ['ܐܒܘܢ', 'ܕܒܫܡܝܐ', 'ܢܬܩܕܫ', 'ܫܡܟ.'], 'Our Father in heaven, hallowed be your name.'),
    sent(
      'SyrMini-1-2',
      ['ܬܐܬܐ', 'ܡܠܟܘܬܟ.'],
      'May your kingdom come.'
    ),
    sent(
      'SyrMini-1-3',
      ['ܢܗܘܐ', 'ܨܒܝܢܟ', 'ܐܝܟܢܐ', 'ܕܒܫܡܝܐ', 'ܐܦ', 'ܒܐܪܥܐ.'],
      'May your will be done as in heaven, also on earth.'
    ),
    sent(
      'SyrMini-1-4',
      ['ܗܒ', 'ܠܢ', 'ܠܚܡܢ', 'ܕܣܘܢܩܢܢ', 'ܝܘܡܢܐ.'],
      'Give us today the bread of our need.'
    ),
  ],
};

export const ALL_SYRIAC_MINI_STORIES = [SYR_MINI_1];
