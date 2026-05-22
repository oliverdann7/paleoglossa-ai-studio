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

export const EGY_PTAHHOTEP_2: TextSection = {
  id: 'Egy-Ptah-2',
  textId: 'Egy-Ptah',
  sequence: 2,
  label: 'Maxims 3–5 — On Pride and Speech',
  sentences: [
    sent('Egy-Ptah-2-1', ['m', 'qȝ', 'jb.k', 'r', 'rmṯ', 'n', 'ḫpr', 'n', 'ḏd', 'ḫpr.sn'], 'Do not be proud of your knowledge among the ignorant, for the wise has made them.'),
    sent('Egy-Ptah-2-2', ['ḫr', 'rḏi.n', 'ḏsr', 'ḥr', 'm', 'r', 'f', 'nḏs', 'm', 'r', 'f'], 'For his mouth is more hidden than the divine. He who knows the power of speech is hidden like the god.'),
    sent('Egy-Ptah-2-3', ['nfr', 'rn', 'n', 's', 'r', 'bt', 'nb.t', 'n', 'pȝ', 'tȝ'], 'A man\'s good name is more excellent than any possession in this land.'),
  ],
};

export const EGY_PTAHHOTEP_3: TextSection = {
  id: 'Egy-Ptah-3',
  textId: 'Egy-Ptah',
  sequence: 3,
  label: 'Maxims 6–9 — On Greed and Generosity',
  sentences: [
    sent('Egy-Ptah-3-1', ['m', 'ỉw', 'ȝ', 'ḥw', 'm', 'pr', 'n', 'snḏm'], 'Do not be greedy for a little within the house of the peaceful.'),
    sent('Egy-Ptah-3-2', ['ỉnk', 'ḥr', 'mrr', 'nfr', 'ỉw', 'nfr', 'mȝˁt', 'n.t', 'ỉmn'], 'I am one who loves what is good, and what is good is the truth of Maat.'),
    sent('Egy-Ptah-3-3', ['ỉr', 'ỉmy.w', 'pr', 'f', 'n', 'ḏd', 'ỉw', 'wȝ', 'sw', 'r', 'ḥr', 'nb'], 'The one who is in his house, it is said, is far from every face.'),
  ],
};

export const EGY_SINUHE_1: TextSection = {
  id: 'Egy-Sin-1',
  textId: 'Egy-Sin',
  sequence: 1,
  label: 'The Beginning of the Tale',
  sentences: [
    sent('Egy-Sin-1-1', ['ỉnk', 'sȝ', 'n', 'rḫyt', 'ỉnk', 'sȝ', 'n', 'rḫyt', 'ḥmwt', 'n', 'ỉt.f', 'ỉmn', 'ḥr', 'ỉb.f'], 'I am a son of the subjects. I am a son of the subject, a craftsman of his father, Amen is in his heart.'),
    sent('Egy-Sin-1-2', ['ỉw', 'ỉr', 'ḥȝty', 'n', 'ỉr.n', 'sn', 'ỉw', 'ỉr', 'ḥȝty', 'n', 'ỉr.n', 'sn', 'ỉw', 'ỉr', 'n', 'ỉr.n', 'sn'], 'The heart has not done what they have done. The heart has not done what they have done. What has been done cannot be undone.'),
    sent('Egy-Sin-1-3', ['ỉw', 'ỉr.n', 'ỉ', 'ḥȝty', 'ỉnk', 'ḥȝty', 'n', 'ỉt.i', 'ỉw', 'ỉr.n', 'ỉ', 'ỉm', 'n', 'w', 'n', 'sšm'], 'I have done this with my heart. I am the heart of my father. I have done it through the guidance of a scribe.'),
    sent('Egy-Sin-1-4', ['ỉw', 'ỉr.n', 'ỉ', 'ỉr', 'wsḫ', 'n', 'ḥȝty', 'ỉw', 'ỉr.n', 'ỉ', 'ỉr', 'wsḫ', 'n', 'ḥȝty', 'm', 'ȝt', 'nb.t'], 'I have made a broad place for my heart. I have made a broad place for my heart in every moment.'),
  ],
};

export const ALL_EGYPTIAN_EXTENDED_SECTIONS: TextSection[] = [
  EGY_PTAHHOTEP_2,
  EGY_PTAHHOTEP_3,
  EGY_SINUHE_1,
];
