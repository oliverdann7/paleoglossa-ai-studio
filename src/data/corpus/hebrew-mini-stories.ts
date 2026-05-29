/**
 * Hebrew beginner mini-stories — two short curated readings
 * (Creation excerpts + Psalm 23) with English translations.
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

export const HEB_MINI_1: TextSection = {
  id: 'HebMini-1',
  textId: 'HebMini-1',
  sequence: 1,
  label: 'בְּרֵאשִׁית — In the beginning',
  sentences: [
    sent(
      'HebMini-1-1',
      ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', 'אֵת', 'הַשָּׁמַיִם', 'וְאֵת', 'הָאָרֶץ.'],
      'In the beginning God created the heavens and the earth.'
    ),
    sent(
      'HebMini-1-2',
      ['וְהָאָרֶץ', 'הָיְתָה', 'תֹהוּ', 'וָבֹהוּ.'],
      'And the earth was formless and void.'
    ),
    sent(
      'HebMini-1-3',
      ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'אוֹר.'],
      'And God said: Let there be light.'
    ),
    sent('HebMini-1-4', ['וַיְהִי', 'אוֹר.'], 'And there was light.'),
    sent(
      'HebMini-1-5',
      ['וַיַּרְא', 'אֱלֹהִים', 'אֶת', 'הָאוֹר', 'כִּי', 'טוֹב.'],
      'And God saw the light, that it was good.'
    ),
  ],
};

export const HEB_MINI_2: TextSection = {
  id: 'HebMini-2',
  textId: 'HebMini-2',
  sequence: 2,
  label: 'הָרֹעֶה הַטּוֹב — The good shepherd',
  sentences: [
    sent('HebMini-2-1', ['יְהוָה', 'רֹעִי', 'לֹא', 'אֶחְסָר.'], 'The LORD is my shepherd; I shall not want.'),
    sent(
      'HebMini-2-2',
      ['בִּנְאוֹת', 'דֶּשֶׁא', 'יַרְבִּיצֵנִי.'],
      'He makes me lie down in green pastures.'
    ),
    sent(
      'HebMini-2-3',
      ['עַל', 'מֵי', 'מְנֻחוֹת', 'יְנַהֲלֵנִי.'],
      'He leads me beside still waters.'
    ),
    sent('HebMini-2-4', ['נַפְשִׁי', 'יְשׁוֹבֵב.'], 'He restores my soul.'),
  ],
};

export const ALL_HEBREW_MINI_STORIES = [HEB_MINI_1, HEB_MINI_2];
