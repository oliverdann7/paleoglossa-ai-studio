/**
 * Aramaic beginner mini-story — a Mishnaic-style saying.
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

export const ARC_MINI_1: TextSection = {
  id: 'ArcMini-1',
  textId: 'ArcMini-1',
  sequence: 1,
  label: 'אֲמַר רַבָּן — The teacher spoke',
  sentences: [
    sent(
      'ArcMini-1-1',
      ['אֲמַר', 'רַבָּן', 'גַּמְלִיאֵל', 'לְתַלְמִידוֹי.'],
      'Rabban Gamliel said to his students.'
    ),
    sent(
      'ArcMini-1-2',
      ['חַכִּימָא', 'דְּחָזֵי', 'יוֹמָא', 'דְּמִיתֵיהּ.'],
      'A wise one is he who sees the day of his death.'
    ),
    sent(
      'ArcMini-1-3',
      ['וְתָאֵב', 'מִן', 'כָּל', 'יוֹם.'],
      'And returns (in repentance) from every day.'
    ),
    sent(
      'ArcMini-1-4',
      ['וְלָא', 'תֵּימָר', 'דָּא', 'יוֹם.'],
      'And do not say: "This is the day."'
    ),
  ],
};

export const ALL_ARAMAIC_MINI_STORIES = [ARC_MINI_1];
