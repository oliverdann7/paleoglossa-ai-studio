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

export const AKK_GILGAMESH_2: TextSection = {
  id: 'Akk-Gilg-2',
  textId: 'Akk-Gilg-1',
  sequence: 2,
  label: 'Tablet II — The Coming of Enkidu',
  sentences: [
    sent(
      'Akk-Gilg-2-1',
      [
        'iš-pur-rak-ku-nu-ši',
        'i-na',
        'e-ma-ru-ti-šu',
        'šá',
        'a-na',
        'šá-šu-nu',
        'i-šap-pa-ru',
        'a-na',
        'mu-up-pal-sí',
        'te-er-šú-nu',
      ],
      'He will send to you, in his wisdom, that which he commands to them — send for the dream interpreter.'
    ),
    sent(
      'Akk-Gilg-2-2',
      [
        'i-na',
        'ka-a-ri',
        'na-di',
        'pa-rak-ku',
        'šá',
        'a-na',
        'dIR-RA',
        'qá-bu-ú',
        'a-na',
        'dGUD',
        'ú-šad-di-ḫu',
        'ip-pa-rak',
      ],
      'In the quay stands a shrine. For the god Irra it is dedicated. The bull they will drive away.'
    ),
    sent(
      'Akk-Gilg-2-3',
      [
        'ša₂',
        'pi-i',
        'pe-e-tu-ú',
        'nap-šá-tu',
        'pu-ut-ru',
        'ip-šú-šú',
        'a-na',
        'zi-qi-qi',
        'ú-še-la-a',
        'ni-iš',
        'ka-ak-kí',
      ],
      'He who opens the mouth, releases life, his deed to the wind they lifted the weapon.'
    ),
  ],
};

export const AKK_HAMMURABI_1: TextSection = {
  id: 'Akk-Ham-1',
  textId: 'Akk-Ham',
  sequence: 1,
  label: 'Prologue — Anum and Enlil',
  sentences: [
    sent(
      'Akk-Ham-1-1',
      [
        'i-nu',
        'Anum',
        'ṣi-ru-um',
        'šar',
        'da-ri-im',
        'šá',
        'ki-ma',
        'ša-me-e',
        'ra-bu-ú',
        'i-na',
        'ma-tim',
        'šu-pu-ú',
      ],
      'When the lofty Anum, king of the Anunnaki, and Enlil, lord of heaven and earth, who determines the destinies of the land...'
    ),
    sent(
      'Akk-Ham-1-2',
      [
        'a-na',
        'mi-ša-ri-im',
        'ša-ka-a-nim',
        'da-ni-nim',
        'šu-ḫu-zi-im',
        'a-na',
        'ḫa-ab-lim',
        'e-ni-im',
        'da-nim',
        'en-šim',
        'a-na',
        'ḫa-ab-li-šu',
        'la',
        'na-da-nim',
      ],
      'To establish justice in the land, to destroy the wicked and the evil, to prevent the strong from oppressing the weak...'
    ),
    sent(
      'Akk-Ham-1-3',
      [
        'ḫa-am-mu-ra-pi',
        'ru-ba-am',
        'na-’i-dam',
        'pa-li-iḫ',
        'i-li',
        'ki-it-tam',
        'u',
        'mi-ša-ram',
        'a-na',
        'ki-ib-ra-at',
        'er-bé-tim',
        'ú-ša-ar-di',
      ],
      'Hammurabi, the reverent prince, who fears the gods, to make justice appear in the land, to destroy the wicked and the evil, so that the strong might not harm the weak.'
    ),
  ],
};

export const ALL_AKKADIAN_EXTENDED_SECTIONS: TextSection[] = [AKK_GILGAMESH_2, AKK_HAMMURABI_1];
