import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

export const EGY_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  m: { lemma: 'm', gloss: 'in, by, as', partOfSpeech: 'preposition' },
  n: { lemma: 'n', gloss: 'to, for, of', partOfSpeech: 'preposition' },
  r: { lemma: 'r', gloss: 'to, concerning', partOfSpeech: 'preposition' },
  ḥr: { lemma: 'ḥr', gloss: 'upon, face', partOfSpeech: 'preposition' },
  nfr: { lemma: 'nfr', gloss: 'good, beautiful', partOfSpeech: 'adjective' },
  ỉw: { lemma: 'ỉw', gloss: '(auxiliary)', partOfSpeech: 'particle' },
  ỉnk: { lemma: 'ỉnk', gloss: 'I am', partOfSpeech: 'pronoun' },
  ỉr: { lemma: 'ỉr', gloss: 'as for, regarding', partOfSpeech: 'particle' },
  'n.t': { lemma: 'n.t', gloss: 'of (f)', partOfSpeech: 'preposition' },
  nb: { lemma: 'nb', gloss: 'all, every', partOfSpeech: 'adjective' },
  'nb.t': { lemma: 'nb.t', gloss: 'all, every (f)', partOfSpeech: 'adjective' },
  pȝ: { lemma: 'pȝ', gloss: 'the (m)', partOfSpeech: 'article' },
  tȝ: { lemma: 'tȝ', gloss: 'the (f) / land', partOfSpeech: 'article' },
  bt: { lemma: 'bt', gloss: 'thing, property', partOfSpeech: 'noun' },
  rn: { lemma: 'rn', gloss: 'name', partOfSpeech: 'noun' },
  s: { lemma: 's', gloss: 'man, person', partOfSpeech: 'noun' },
  pr: { lemma: 'pr', gloss: 'house', partOfSpeech: 'noun' },
  ḥȝty: { lemma: 'ḥȝty', gloss: 'heart, mind', partOfSpeech: 'noun' },
  ȝ: { lemma: 'ȝ', gloss: 'great, big', partOfSpeech: 'adjective' },
  bw: { lemma: 'bw', gloss: 'place; (negation)', partOfSpeech: 'particle' },
  'f,': { lemma: 'f', gloss: 'he, his (suffix)', partOfSpeech: 'pronoun' },
  f: { lemma: 'f', gloss: 'he, his', partOfSpeech: 'pronoun' },
  jr: { lemma: 'jr', gloss: 'as for, if', partOfSpeech: 'particle' },
  jrj: { lemma: 'jrj', gloss: 'to do, make', partOfSpeech: 'verb' },
  'jrj.n': { lemma: 'jrj', gloss: 'did, made', partOfSpeech: 'verb' },
  'jrj.n.f': { lemma: 'jrj', gloss: 'he made', partOfSpeech: 'verb' },
  jrr: { lemma: 'jrj', gloss: 'does, makes', partOfSpeech: 'verb' },
  jrt: { lemma: 'jrj', gloss: 'doing, making', partOfSpeech: 'verb' },
  jry: { lemma: 'jrj', gloss: 'done', partOfSpeech: 'verb' },
  jtjw: { lemma: 'jtj', gloss: 'fathers, ancestors', partOfSpeech: 'noun' },
  jw: { lemma: 'jw', gloss: '(auxiliary)', partOfSpeech: 'particle' },
  jȝw: { lemma: 'jȝw', gloss: 'old age', partOfSpeech: 'noun' },
  mꜣꜥ: { lemma: 'mꜣꜥ', gloss: 'true, just', partOfSpeech: 'adjective' },
  'n.f': { lemma: 'n', gloss: 'to him', partOfSpeech: 'preposition' },
  'n.k': { lemma: 'n', gloss: 'to you', partOfSpeech: 'preposition' },
  nbt: { lemma: 'nb', gloss: 'all, every (f.)', partOfSpeech: 'adjective' },
  nt: { lemma: 'nt', gloss: 'of (f.)', partOfSpeech: 'preposition' },
  nṯr: { lemma: 'nṯr', gloss: 'god', partOfSpeech: 'noun' },
  qꜣ: { lemma: 'qꜣ', gloss: 'high; be proud', partOfSpeech: 'adjective' },
  rmṯ: { lemma: 'rmṯ', gloss: 'people, men', partOfSpeech: 'noun' },
  st: { lemma: 'st', gloss: 'place, seat', partOfSpeech: 'noun' },
  sštꜣ: { lemma: 'sštꜣ', gloss: 'secret, mystery', partOfSpeech: 'noun' },
  sḫr: { lemma: 'sḫr', gloss: 'counsel, plan', partOfSpeech: 'noun' },
  sḫrw: { lemma: 'sḫr', gloss: 'counsels, plans', partOfSpeech: 'noun' },
  šw: { lemma: 'šw', gloss: 'empty; free from', partOfSpeech: 'adjective' },
  ꜥnḫ: { lemma: 'ꜥnḫ', gloss: 'life; to live', partOfSpeech: 'noun' },
  ꜥqꜣ: { lemma: 'ꜥqꜣ', gloss: 'straight, correct', partOfSpeech: 'adjective' },
  ꜥḏ: { lemma: 'ꜥḏ', gloss: 'safe, sound', partOfSpeech: 'adjective' },
  ꜥḏꜣ: { lemma: 'ꜥḏꜣ', gloss: 'wrong, false', partOfSpeech: 'adjective' },
  ꜥḥꜥw: { lemma: 'ꜥḥꜥw', gloss: 'lifetime', partOfSpeech: 'noun' },
};

export const EGY_PTAHHOTEP_2: TextSection = {
  id: 'Egy-Ptah-2',
  textId: 'Egy-Ptah',
  sequence: 2,
  label: 'Maxims 3–5 — On Pride and Speech',
  sentences: [
    sentLex(
      'Egy-Ptah-2-1',
      ['m', 'qȝ', 'jb.k', 'r', 'rmṯ', 'n', 'ḫpr', 'n', 'ḏd', 'ḫpr.sn'],
      'Do not be proud of your knowledge among the ignorant, for the wise has made them.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Ptah-2-2',
      ['ḫr', 'rḏi.n', 'ḏsr', 'ḥr', 'm', 'r', 'f', 'nḏs', 'm', 'r', 'f'],
      'For his mouth is more hidden than the divine. He who knows the power of speech is hidden like the god.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Ptah-2-3',
      ['nfr', 'rn', 'n', 's', 'r', 'bt', 'nb.t', 'n', 'pȝ', 'tȝ'],
      "A man's good name is more excellent than any possession in this land.",
      EGY_LEXICON
    ),
  ],
};

export const EGY_PTAHHOTEP_3: TextSection = {
  id: 'Egy-Ptah-3',
  textId: 'Egy-Ptah',
  sequence: 3,
  label: 'Maxims 6–9 — On Greed and Generosity',
  sentences: [
    sentLex(
      'Egy-Ptah-3-1',
      ['m', 'ỉw', 'ȝ', 'ḥw', 'm', 'pr', 'n', 'snḏm'],
      'Do not be greedy for a little within the house of the peaceful.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Ptah-3-2',
      ['ỉnk', 'ḥr', 'mrr', 'nfr', 'ỉw', 'nfr', 'mȝˁt', 'n.t', 'ỉmn'],
      'I am one who loves what is good, and what is good is the truth of Maat.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Ptah-3-3',
      ['ỉr', 'ỉmy.w', 'pr', 'f', 'n', 'ḏd', 'ỉw', 'wȝ', 'sw', 'r', 'ḥr', 'nb'],
      'The one who is in his house, it is said, is far from every face.',
      EGY_LEXICON
    ),
  ],
};

export const EGY_SINUHE_1: TextSection = {
  id: 'Egy-Sin-1',
  textId: 'Egy-Sin',
  sequence: 1,
  label: 'The Beginning of the Tale',
  sentences: [
    sentLex(
      'Egy-Sin-1-1',
      [
        'ỉnk',
        'sȝ',
        'n',
        'rḫyt',
        'ỉnk',
        'sȝ',
        'n',
        'rḫyt',
        'ḥmwt',
        'n',
        'ỉt.f',
        'ỉmn',
        'ḥr',
        'ỉb.f',
      ],
      'I am a son of the subjects. I am a son of the subject, a craftsman of his father, Amen is in his heart.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Sin-1-2',
      [
        'ỉw',
        'ỉr',
        'ḥȝty',
        'n',
        'ỉr.n',
        'sn',
        'ỉw',
        'ỉr',
        'ḥȝty',
        'n',
        'ỉr.n',
        'sn',
        'ỉw',
        'ỉr',
        'n',
        'ỉr.n',
        'sn',
      ],
      'The heart has not done what they have done. The heart has not done what they have done. What has been done cannot be undone.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Sin-1-3',
      [
        'ỉw',
        'ỉr.n',
        'ỉ',
        'ḥȝty',
        'ỉnk',
        'ḥȝty',
        'n',
        'ỉt.i',
        'ỉw',
        'ỉr.n',
        'ỉ',
        'ỉm',
        'n',
        'w',
        'n',
        'sšm',
      ],
      'I have done this with my heart. I am the heart of my father. I have done it through the guidance of a scribe.',
      EGY_LEXICON
    ),
    sentLex(
      'Egy-Sin-1-4',
      [
        'ỉw',
        'ỉr.n',
        'ỉ',
        'ỉr',
        'wsḫ',
        'n',
        'ḥȝty',
        'ỉw',
        'ỉr.n',
        'ỉ',
        'ỉr',
        'wsḫ',
        'n',
        'ḥȝty',
        'm',
        'ȝt',
        'nb.t',
      ],
      'I have made a broad place for my heart. I have made a broad place for my heart in every moment.',
      EGY_LEXICON
    ),
  ],
};

export const ALL_EGYPTIAN_EXTENDED_SECTIONS: TextSection[] = [
  EGY_PTAHHOTEP_2,
  EGY_PTAHHOTEP_3,
  EGY_SINUHE_1,
];
