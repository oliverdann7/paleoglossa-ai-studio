/**
 * Latin Mini-Stories — A1 level graded readers
 * Original compositions for pedagogical use.
 * Simple present/imperfect tense, high-frequency vocabulary,
 * short sentences — designed for absolute Latin beginners.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

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
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── Story 1: Agricola et villa (The farmer and his estate) ──────────────────

export const LAT_MINI_1: TextSection = {
  id: 'LatMini-1',
  textId: 'LatMini-1',
  sequence: 1,
  label: 'Agricola et villa — The farmer and his estate',
  sentences: [
    sent('LatMini-1-1', ['Agricola', 'in', 'villa', 'habitat.'], 'A farmer lives on an estate.'),
    sent('LatMini-1-2', ['Villa', 'magna', 'et', 'pulchra', 'est.'], 'The estate is large and beautiful.'),
    sent('LatMini-1-3', ['Agricola', 'agrum', 'colit.'], 'The farmer cultivates the field.'),
    sent('LatMini-1-4', ['In', 'agro', 'frumentum', 'crescit.'], 'Grain grows in the field.'),
    sent('LatMini-1-5', ['Femina', 'in', 'villa', 'laborat.'], 'The woman works in the house.'),
    sent('LatMini-1-6', ['Liberi', 'in', 'horto', 'ludunt.'], 'The children play in the garden.'),
    sent('LatMini-1-7', ['Agricola', 'laetus', 'est', 'quod', 'frumentum', 'bonum', 'est.'], 'The farmer is happy because the grain is good.'),
  ],
};

// ─── Story 2: Puer et magister (The boy and the teacher) ─────────────────────

export const LAT_MINI_2: TextSection = {
  id: 'LatMini-2',
  textId: 'LatMini-2',
  sequence: 1,
  label: 'Puer et magister — The boy and the teacher',
  sentences: [
    sent('LatMini-2-1', ['Puer', 'ad', 'ludum', 'it.'], 'A boy goes to school.'),
    sent('LatMini-2-2', ['Magister', 'in', 'ludo', 'sedet.'], 'The teacher sits in the school.'),
    sent('LatMini-2-3', ['Magister', 'puerum', 'docet.'], 'The teacher teaches the boy.'),
    sent('LatMini-2-4', ['Puer', 'magistrum', 'rogat:', '"Quid', 'est', 'sapientia?"'], 'The boy asks the teacher: "What is wisdom?"'),
    sent('LatMini-2-5', ['Magister', 'respondet:', '"Virtus', 'et', 'scientia."'], 'The teacher answers: "Virtue and knowledge."'),
    sent('LatMini-2-6', ['Puer', 'audit', 'et', 'discit.'], 'The boy listens and learns.'),
    sent('LatMini-2-7', ['Magister', 'gaudet', 'quod', 'puer', 'studiosus', 'est.'], 'The teacher rejoices because the boy is eager to learn.'),
  ],
};

// ─── Story 3: Piscator (The fisherman) ───────────────────────────────────────

export const LAT_MINI_3: TextSection = {
  id: 'LatMini-3',
  textId: 'LatMini-3',
  sequence: 1,
  label: 'Piscator — The fisherman',
  sentences: [
    sent('LatMini-3-1', ['Piscator', 'ad', 'mare', 'ambulat.'], 'A fisherman walks to the sea.'),
    sent('LatMini-3-2', ['Rete', 'in', 'aquam', 'iacit.'], 'He throws the net into the water.'),
    sent('LatMini-3-3', ['Multi', 'pisces', 'in', 'rete', 'intrant.'], 'Many fish enter the net.'),
    sent('LatMini-3-4', ['Piscator', 'gaudet', 'et', 'deo', 'gratias', 'agit.'], 'The fisherman rejoices and gives thanks to God.'),
    sent('LatMini-3-5', ['Pisces', 'ad', 'forum', 'portat.'], 'He carries the fish to the market.'),
    sent('LatMini-3-6', ['Pisces', 'hominibus', 'vendit.'], 'He sells the fish to the people.'),
    sent('LatMini-3-7', ['Pecuniam', 'accipit', 'et', 'domum', 'redit.'], 'He receives money and returns home.'),
  ],
};

// ─── Story 4: Viator (The traveler) ──────────────────────────────────────────

export const LAT_MINI_4: TextSection = {
  id: 'LatMini-4',
  textId: 'LatMini-4',
  sequence: 1,
  label: 'Viator — The traveler',
  sentences: [
    sent('LatMini-4-1', ['Viator', 'ex', 'urbe', 'in', 'alteram', 'urbem', 'iter', 'facit.'], 'A traveler makes a journey from one city to another.'),
    sent('LatMini-4-2', ['Via', 'longa', 'est.'], 'The road is long.'),
    sent('LatMini-4-3', ['Viator', 'fessus', 'est', 'et', 'sitit.'], 'The traveler is weary and thirsty.'),
    sent('LatMini-4-4', ['Fontem', 'invenit', 'et', 'aquam', 'bibit.'], 'He finds a spring and drinks water.'),
    sent('LatMini-4-5', ['Post', 'hoc', 'sub', 'arbore', 'quiescit.'], 'After this he rests under a tree.'),
    sent('LatMini-4-6', ['Sub', 'vesperum', 'in', 'urbem', 'intrat.'], 'Toward evening he enters the city.'),
    sent('LatMini-4-7', ['Hospitium', 'invenit', 'et', 'dormit.'], 'He finds lodging and sleeps.'),
  ],
};

// ─── Story 5: Pastor et oves (The shepherd and the sheep) ────────────────────

export const LAT_MINI_5: TextSection = {
  id: 'LatMini-5',
  textId: 'LatMini-5',
  sequence: 1,
  label: 'Pastor et oves — The shepherd and the sheep',
  sentences: [
    sent('LatMini-5-1', ['Pastor', 'centum', 'oves', 'habet.'], 'A shepherd has a hundred sheep.'),
    sent('LatMini-5-2', ['Oves', 'in', 'agro', 'pascit.'], 'He grazes them in the field.'),
    sent('LatMini-5-3', ['Una', 'ovis', 'discedit', 'et', 'errат.'], 'One sheep goes away and wanders.'),
    sent('LatMini-5-4', ['Pastor', 'nonaginta', 'novem', 'oves', 'relinquit.'], 'The shepherd leaves the ninety-nine sheep.'),
    sent('LatMini-5-5', ['Ovem', 'errantem', 'quaerit', 'donec', 'inveniat.'], 'He searches for the wandering sheep until he finds it.'),
    sent('LatMini-5-6', ['Eam', 'invenit', 'et', 'gaudet.'], 'He finds it and rejoices.'),
    sent('LatMini-5-7', ['Eam', 'super', 'umeros', 'suos', 'portat.'], 'He carries it on his shoulders.'),
  ],
};

export const ALL_LATIN_MINI_STORIES = [LAT_MINI_1, LAT_MINI_2, LAT_MINI_3, LAT_MINI_4, LAT_MINI_5];
