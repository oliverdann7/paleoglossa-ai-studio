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

const EGY_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'm': { lemma: 'm', gloss: 'do not (negative imperative)' },
  'qȝ': { lemma: 'qȝ', gloss: 'high, exalt, be proud' },
  'jb.k': { lemma: 'jb', gloss: 'your heart' },
  'r': { lemma: 'r', gloss: 'to, against, toward' },
  'rmṯ': { lemma: 'rmṯ', gloss: 'people, mankind' },
  'n': { lemma: 'n', gloss: 'to, for, of' },
  'ḫpr': { lemma: 'ḫpr', gloss: 'become, come into being' },
  'ḏd': { lemma: 'ḏd', gloss: 'say, speak' },
  'ḫpr.sn': { lemma: 'ḫpr', gloss: 'they become' },
  'ḫr': { lemma: 'ḫr', gloss: 'then, accordingly' },
  'rḏi.n': { lemma: 'rḏi', gloss: 'given, placed' },
  'ḏsr': { lemma: 'ḏsr', gloss: 'sacred, hidden' },
  'ḥr': { lemma: 'ḥr', gloss: 'upon, face, because' },
  'f': { lemma: 'f', gloss: 'he, his' },
  'nḏs': { lemma: 'nḏs', gloss: 'commoner, little man' },
  'nfr': { lemma: 'nfr', gloss: 'good, beautiful' },
  'rn': { lemma: 'rn', gloss: 'name' },
  'bt': { lemma: 'bt', gloss: 'thing, property' },
  'nb.t': { lemma: 'nb', gloss: 'every, any' },
  'pȝ': { lemma: 'pȝ', gloss: 'the' },
  'tȝ': { lemma: 'tȝ', gloss: 'land, earth' },
  'ỉw': { lemma: 'ỉw', gloss: 'is, (auxiliary)' },
  'ȝ': { lemma: 'ȝ', gloss: 'great, much' },
  'ḥw': { lemma: 'ḥw', gloss: 'excess, greed' },
  'pr': { lemma: 'pr', gloss: 'house' },
  'snḏm': { lemma: 'snḏm', gloss: 'peaceful, content' },
  'ỉnk': { lemma: 'ỉnk', gloss: 'I am' },
  'mrr': { lemma: 'mr', gloss: 'love, desire' },
  'mȝˁt': { lemma: 'mȝˁt', gloss: 'truth, justice (Maat)' },
  'ỉmn': { lemma: 'ỉmn', gloss: 'hidden, Amun' },
  'ỉr': { lemma: 'ỉr', gloss: 'as for, regarding' },
  'ỉmy.w': { lemma: 'ỉmy', gloss: 'who is in' },
  'wȝ': { lemma: 'wȝ', gloss: 'far, distant' },
  'nb': { lemma: 'nb', gloss: 'lord, master' },
  'sȝ': { lemma: 'sȝ', gloss: 'son' },
  'rḫyt': { lemma: 'rḫyt', gloss: 'the people, subjects' },
  'ḥmwt': { lemma: 'ḥmwt', gloss: 'craftsman, artisan' },
  'ỉt.f': { lemma: 'ỉt', gloss: 'his father' },
  'ḥȝty': { lemma: 'ḥȝty', gloss: 'heart, mind' },
  'ỉr.n': { lemma: 'ỉr', gloss: 'what did, (relative)' },
  'sn': { lemma: 'sn', gloss: 'they, them' },
  'ỉ': { lemma: 'ỉ', gloss: 'I, me' },
  'ỉm': { lemma: 'ỉm', gloss: 'in, from, by means of' },
  'w': { lemma: 'w', gloss: 'one (indefinite)' },
  'sšm': { lemma: 'sšm', gloss: 'guidance, conduct' },

  'wsḫ': { lemma: 'wsḫ', gloss: 'broad, wide' },
  'ȝt': { lemma: 'ȝt', gloss: 'moment, time' },
};

export const EGY_PTAHHOTEP_2: TextSection = {
  id: 'Egy-Ptah-2',
  textId: 'Egy-Ptah-1',
  sequence: 2,
  label: 'Maxims 3–5 — On Pride and Speech',
  sentences: [
    sent(
      'Egy-Ptah-2-1',
      ['m', 'qȝ', 'jb.k', 'r', 'rmṯ', 'n', 'ḫpr', 'n', 'ḏd', 'ḫpr.sn'],
      'Do not be proud of your knowledge among the ignorant, for the wise has made them.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Ptah-2-2',
      ['ḫr', 'rḏi.n', 'ḏsr', 'ḥr', 'm', 'r', 'f', 'nḏs', 'm', 'r', 'f'],
      'For his mouth is more hidden than the divine. He who knows the power of speech is hidden like the god.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Ptah-2-3',
      ['nfr', 'rn', 'n', 's', 'r', 'bt', 'nb.t', 'n', 'pȝ', 'tȝ'],
      'A man\'s good name is more excellent than any possession in this land.',
      EGY_GLOSS
    ),
  ],
};

export const EGY_PTAHHOTEP_3: TextSection = {
  id: 'Egy-Ptah-3',
  textId: 'Egy-Ptah-1',
  sequence: 3,
  label: 'Maxims 6–9 — On Greed and Generosity',
  sentences: [
    sent(
      'Egy-Ptah-3-1',
      ['m', 'ỉw', 'ȝ', 'ḥw', 'm', 'pr', 'n', 'snḏm'],
      'Do not be greedy for a little within the house of the peaceful.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Ptah-3-2',
      ['ỉnk', 'ḥr', 'mrr', 'nfr', 'ỉw', 'nfr', 'mȝˁt', 'n.t', 'ỉmn'],
      'I am one who loves what is good, and what is good is the truth of Maat.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Ptah-3-3',
      ['ỉr', 'ỉmy.w', 'pr', 'f', 'n', 'ḏd', 'ỉw', 'wȝ', 'sw', 'r', 'ḥr', 'nb'],
      'The one who is in his house, it is said, is far from every face.',
      EGY_GLOSS
    ),
  ],
};

export const EGY_SINUHE_1: TextSection = {
  id: 'Egy-Sin-1',
  textId: 'Egy-Sin',
  sequence: 1,
  label: 'The Beginning of the Tale',
  sentences: [
    sent(
      'Egy-Sin-1-1',
      ['ỉnk', 'sȝ', 'n', 'rḫyt', 'ỉnk', 'sȝ', 'n', 'rḫyt', 'ḥmwt', 'n', 'ỉt.f', 'ỉmn', 'ḥr', 'ỉb.f'],
      'I am a son of the subjects. I am a son of the subject, a craftsman of his father, Amen is in his heart.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Sin-1-2',
      ['ỉw', 'ỉr', 'ḥȝty', 'n', 'ỉr.n', 'sn', 'ỉw', 'ỉr', 'ḥȝty', 'n', 'ỉr.n', 'sn', 'ỉw', 'ỉr', 'n', 'ỉr.n', 'sn'],
      'The heart has not done what they have done. The heart has not done what they have done. What has been done cannot be undone.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Sin-1-3',
      ['ỉw', 'ỉr.n', 'ỉ', 'ḥȝty', 'ỉnk', 'ḥȝty', 'n', 'ỉt.i', 'ỉw', 'ỉr.n', 'ỉ', 'ỉm', 'n', 'w', 'n', 'sšm'],
      'I have done this with my heart. I am the heart of my father. I have done it through the guidance of a scribe.',
      EGY_GLOSS
    ),
    sent(
      'Egy-Sin-1-4',
      ['ỉw', 'ỉr.n', 'ỉ', 'ỉr', 'wsḫ', 'n', 'ḥȝty', 'ỉw', 'ỉr.n', 'ỉ', 'ỉr', 'wsḫ', 'n', 'ḥȝty', 'm', 'ȝt', 'nb.t'],
      'I have made a broad place for my heart. I have made a broad place for my heart in every moment.',
      EGY_GLOSS
    ),
  ],
};

export const ALL_EGYPTIAN_EXTENDED_SECTIONS: TextSection[] = [EGY_PTAHHOTEP_2, EGY_PTAHHOTEP_3, EGY_SINUHE_1];
