/**
 * Latin Mini-Stories Volume 2 — five additional A1 graded readers.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
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

// ─── Story 6: Canis et carnem (The dog and the meat) ────────────────────────

export const LAT_MINI_6: TextSection = {
  id: 'LatMini-6',
  textId: 'LatMini-6',
  sequence: 6,
  label: 'Canis et caro — The dog and the piece of meat',
  sentences: [
    sent(
      'LatMini-6-1',
      ['Canis', 'per', 'pontem', 'cum', 'carne', 'ambulat.'],
      'A dog walks across a bridge with meat.'
    ),
    sent(
      'LatMini-6-2',
      ['In', 'aqua', 'imaginem', 'suam', 'videt.'],
      'In the water he sees his own reflection.'
    ),
    sent(
      'LatMini-6-3',
      ['Putat', 'alium', 'canem', 'maiorem', 'carnem', 'habere.'],
      'He thinks another dog is holding a bigger piece.'
    ),
    sent(
      'LatMini-6-4',
      ['Latrat', 'et', 'carnem', 'amittit.'],
      'He barks and loses the meat.'
    ),
    sent(
      'LatMini-6-5',
      ['Sic', 'qui', 'plus', 'cupit', 'omnia', 'perdit.'],
      'Thus he who craves more loses everything.'
    ),
  ],
};

// ─── Story 7: Lupus et agnus (The wolf and the lamb) ────────────────────────

export const LAT_MINI_7: TextSection = {
  id: 'LatMini-7',
  textId: 'LatMini-7',
  sequence: 7,
  label: 'Lupus et agnus — The wolf and the lamb',
  sentences: [
    sent(
      'LatMini-7-1',
      ['Lupus', 'et', 'agnus', 'ad', 'rivum', 'veniunt.'],
      'A wolf and a lamb come to a stream.'
    ),
    sent(
      'LatMini-7-2',
      ['Lupus', 'superior', 'stat,', 'agnus', 'inferior.'],
      'The wolf stands upstream, the lamb downstream.'
    ),
    sent(
      'LatMini-7-3',
      ['Lupus', 'dicit:', 'Cur', 'aquam', 'meam', 'turbas?'],
      'The wolf says: Why are you muddying my water?'
    ),
    sent(
      'LatMini-7-4',
      ['Agnus', 'respondet:', 'Non', 'possum,', 'domine,', 'quia', 'tu', 'superior', 'es.'],
      'The lamb answers: I cannot, lord, because you are upstream.'
    ),
    sent(
      'LatMini-7-5',
      ['Lupus', 'iratus', 'agnum', 'devorat.'],
      'The angry wolf devours the lamb.'
    ),
    sent(
      'LatMini-7-6',
      ['Improbis', 'semper', 'causa', 'nocendi', 'est.'],
      'For the wicked there is always a reason to do harm.'
    ),
  ],
};

// ─── Story 8: Vulpes et uva (The fox and the grapes) ────────────────────────

export const LAT_MINI_8: TextSection = {
  id: 'LatMini-8',
  textId: 'LatMini-8',
  sequence: 8,
  label: 'Vulpes et uva — The fox and the grapes',
  sentences: [
    sent(
      'LatMini-8-1',
      ['Vulpes', 'in', 'horto', 'uvas', 'pulchras', 'videt.'],
      'A fox sees beautiful grapes in a garden.'
    ),
    sent(
      'LatMini-8-2',
      ['Uvae', 'altae', 'sunt', 'et', 'vulpes', 'eas', 'cupit.'],
      'The grapes are high and the fox desires them.'
    ),
    sent(
      'LatMini-8-3',
      ['Saepe', 'salit', 'sed', 'uvas', 'capere', 'non', 'potest.'],
      'Often she leaps but cannot grab the grapes.'
    ),
    sent(
      'LatMini-8-4',
      ['Defessa', 'discedit', 'et', 'dicit:', 'Acidae', 'sunt!'],
      'Tired, she walks away and says: They are sour!'
    ),
    sent(
      'LatMini-8-5',
      ['Sic', 'homines', 'quae', 'capere', 'non', 'possunt', 'spernunt.'],
      'Thus people spurn what they cannot have.'
    ),
  ],
};

// ─── Story 9: Mercator et margarita (The merchant and the pearl) ────────────

export const LAT_MINI_9: TextSection = {
  id: 'LatMini-9',
  textId: 'LatMini-9',
  sequence: 9,
  label: 'Mercator et margarita — The merchant and the pearl',
  sentences: [
    sent(
      'LatMini-9-1',
      ['Mercator', 'pulchram', 'margaritam', 'quaerit.'],
      'A merchant seeks a beautiful pearl.'
    ),
    sent(
      'LatMini-9-2',
      ['Per', 'multas', 'urbes', 'iter', 'facit.'],
      'He travels through many cities.'
    ),
    sent(
      'LatMini-9-3',
      ['Tandem', 'margaritam', 'magni', 'pretii', 'invenit.'],
      'At last he finds a pearl of great price.'
    ),
    sent(
      'LatMini-9-4',
      ['Vendit', 'omnia', 'sua', 'et', 'margaritam', 'emit.'],
      'He sells all his possessions and buys the pearl.'
    ),
    sent(
      'LatMini-9-5',
      ['Gaudet', 'quia', 'thesaurum', 'verum', 'habet.'],
      'He rejoices because he has the true treasure.'
    ),
  ],
};

// ─── Story 10: Samaritanus bonus (The good Samaritan) ───────────────────────

export const LAT_MINI_10: TextSection = {
  id: 'LatMini-10',
  textId: 'LatMini-10',
  sequence: 10,
  label: 'Samaritanus bonus — The good Samaritan',
  sentences: [
    sent(
      'LatMini-10-1',
      ['Homo', 'quidam', 'Hierosolymis', 'in', 'Iericho', 'descendit.'],
      'A certain man was going down from Jerusalem to Jericho.'
    ),
    sent(
      'LatMini-10-2',
      ['Latrones', 'eum', 'capiunt', 'et', 'vulnerant.'],
      'Robbers seize him and wound him.'
    ),
    sent(
      'LatMini-10-3',
      ['Sacerdos', 'transit', 'et', 'non', 'auxiliatur.'],
      'A priest passes by and does not help.'
    ),
    sent(
      'LatMini-10-4',
      ['Levita', 'quoque', 'praeterit.'],
      'A Levite also goes past.'
    ),
    sent(
      'LatMini-10-5',
      ['Samaritanus', 'autem', 'eum', 'videt', 'et', 'miseretur.'],
      'But a Samaritan sees him and has compassion.'
    ),
    sent(
      'LatMini-10-6',
      ['Vulnera', 'curat', 'et', 'ad', 'cauponam', 'fert.'],
      'He treats the wounds and brings him to an inn.'
    ),
    sent(
      'LatMini-10-7',
      ['Pecuniam', 'dat', 'cauponi', 'et', 'dicit:', 'Cura', 'illum.'],
      'He gives money to the innkeeper and says: Take care of him.'
    ),
  ],
};

export const ALL_LATIN_MINI_STORIES_2 = [
  LAT_MINI_6,
  LAT_MINI_7,
  LAT_MINI_8,
  LAT_MINI_9,
  LAT_MINI_10,
];
