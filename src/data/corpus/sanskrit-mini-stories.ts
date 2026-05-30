/**
 * Sanskrit beginner mini-story — opening of the Bhagavad-Gītā.
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

export const SAN_MINI_1: TextSection = {
  id: 'SanMini-1',
  textId: 'SanMini-1',
  sequence: 1,
  label: 'भगवद्गीता प्रथमाध्यायः — Bhagavad-Gītā, opening',
  sentences: [
    sent(
      'SanMini-1-1',
      ['धृतराष्ट्र', 'उवाच'],
      'Dhritarashtra spoke:'
    ),
    sent(
      'SanMini-1-2',
      ['धर्मक्षेत्रे', 'कुरुक्षेत्रे', 'समवेताः', 'युयुत्सवः.'],
      'On the field of dharma, on the field of Kuru, gathered together, desiring to fight,'
    ),
    sent(
      'SanMini-1-3',
      ['मामकाः', 'पाण्डवाः', 'च', 'एव.'],
      'my own (people) and the Pandavas too —'
    ),
    sent(
      'SanMini-1-4',
      ['किम्', 'अकुर्वत', 'सञ्जय?'],
      'what did they do, O Sanjaya?'
    ),
  ],
};

export const ALL_SANSKRIT_MINI_STORIES = [SAN_MINI_1];
