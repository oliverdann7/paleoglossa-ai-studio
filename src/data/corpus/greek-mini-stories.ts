/**
 * Greek Mini-Stories — A1 Koine Greek graded readers
 * Original compositions for pedagogical use.
 * Simple present/imperfect tense, high-frequency vocabulary,
 * short sentences — designed for absolute beginners.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g, '');
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

// ─── Story 1: Ἄνθρωπος ἐν τῇ ἀγορᾷ (A man at the marketplace) ──────────────

export const GRC_MINI_1: TextSection = {
  id: 'GrcMini-1',
  textId: 'GrcMini-1',
  sequence: 1,
  label: 'Ἄνθρωπος ἐν τῇ ἀγορᾷ — A man at the marketplace',
  sentences: [
    sent(
      'GrcMini-1-1',
      ['Ἄνθρωπός', 'τις', 'βαίνει', 'εἰς', 'τὴν', 'ἀγοράν.'],
      'A certain man walks to the marketplace.'
    ),
    sent(
      'GrcMini-1-2',
      ['Ἐκεῖ', 'ὁρᾷ', 'ἄρτον', 'καὶ', 'ἰχθύας.'],
      'There he sees bread and fish.'
    ),
    sent(
      'GrcMini-1-3',
      ['Λαμβάνει', 'ἄρτον', 'ἀπὸ', 'τοῦ', 'ἀρτοπώλου.'],
      'He takes bread from the bread-seller.'
    ),
    sent(
      'GrcMini-1-4',
      ['Δίδωσιν', 'ἀργύριον', 'τῷ', 'ἀρτοπώλῃ.'],
      'He gives silver to the bread-seller.'
    ),
    sent(
      'GrcMini-1-5',
      ['Ἐπανέρχεται', 'εἰς', 'τὴν', 'οἰκίαν', 'σὺν', 'τῷ', 'ἄρτῳ.'],
      'He returns to the house with the bread.'
    ),
    sent(
      'GrcMini-1-6',
      ['Ἡ', 'γυνὴ', 'χαίρει', 'ὅτι', 'ἔχει', 'ἄρτον.'],
      'The woman rejoices because she has bread.'
    ),
    sent('GrcMini-1-7', ['Τρώγουσιν', 'ὅλη', 'ἡ', 'οἰκία.'], 'The whole household eats.'),
  ],
};

// ─── Story 2: Ὁ διδάσκαλος καὶ ὁ μαθητής (The teacher and the student) ─────

export const GRC_MINI_2: TextSection = {
  id: 'GrcMini-2',
  textId: 'GrcMini-2',
  sequence: 1,
  label: 'Ὁ διδάσκαλος καὶ ὁ μαθητής — The teacher and the student',
  sentences: [
    sent(
      'GrcMini-2-1',
      ['Διδάσκαλός', 'τις', 'κάθηται', 'ἐν', 'τῷ', 'ἱερῷ.'],
      'A certain teacher sits in the temple.'
    ),
    sent(
      'GrcMini-2-2',
      ['Μαθητὴς', 'προσέρχεται', 'καὶ', 'ἐρωτᾷ', 'αὐτόν.'],
      'A student comes forward and asks him.'
    ),
    sent(
      'GrcMini-2-3',
      ['Λέγει', 'ὁ', 'μαθητής·', 'Τί', 'ἐστιν', 'ἡ', 'σοφία;'],
      'The student says: What is wisdom?'
    ),
    sent(
      'GrcMini-2-4',
      ['Ὁ', 'διδάσκαλος', 'ἀποκρίνεται·', 'Ἡ', 'ἀρχὴ', 'σοφίας', 'φόβος', 'θεοῦ.'],
      'The teacher answers: The beginning of wisdom is fear of God.'
    ),
    sent(
      'GrcMini-2-5',
      ['Ὁ', 'μαθητὴς', 'ἀκούει', 'καὶ', 'μανθάνει.'],
      'The student listens and learns.'
    ),
    sent(
      'GrcMini-2-6',
      ['Ὁ', 'διδάσκαλος', 'χαίρει', 'ὅτι', 'ὁ', 'μαθητὴς', 'σοφός', 'ἐστιν.'],
      'The teacher rejoices because the student is wise.'
    ),
  ],
};

// ─── Story 3: Ὁ ἁλιεύς (The fisherman) ──────────────────────────────────────

export const GRC_MINI_3: TextSection = {
  id: 'GrcMini-3',
  textId: 'GrcMini-3',
  sequence: 1,
  label: 'Ὁ ἁλιεύς — The fisherman',
  sentences: [
    sent(
      'GrcMini-3-1',
      ['Ἁλιεύς', 'τις', 'καθίζει', 'παρὰ', 'τὴν', 'θάλασσαν.'],
      'A certain fisherman sits beside the sea.'
    ),
    sent(
      'GrcMini-3-2',
      ['Ρίπτει', 'τὸ', 'δίκτυον', 'εἰς', 'τὸ', 'ὕδωρ.'],
      'He throws the net into the water.'
    ),
    sent(
      'GrcMini-3-3',
      ['Πολλοὶ', 'ἰχθύες', 'εἰσέρχονται', 'εἰς', 'τὸ', 'δίκτυον.'],
      'Many fish enter the net.'
    ),
    sent(
      'GrcMini-3-4',
      ['Ὁ', 'ἁλιεὺς', 'χαίρει', 'καὶ', 'εὐχαριστεῖ', 'τῷ', 'θεῷ.'],
      'The fisherman rejoices and gives thanks to God.'
    ),
    sent(
      'GrcMini-3-5',
      ['Φέρει', 'τοὺς', 'ἰχθύας', 'εἰς', 'τὴν', 'ἀγοράν.'],
      'He carries the fish to the marketplace.'
    ),
    sent(
      'GrcMini-3-6',
      ['Πωλεῖ', 'τοὺς', 'ἰχθύας', 'τοῖς', 'ἀνθρώποις.'],
      'He sells the fish to the people.'
    ),
    sent(
      'GrcMini-3-7',
      ['Λαμβάνει', 'ἀργύριον', 'καὶ', 'ἐπανέρχεται', 'οἴκαδε.'],
      'He receives silver and returns home.'
    ),
  ],
};

// ─── Story 4: Ὁδοιπόρος (The traveler) ──────────────────────────────────────

export const GRC_MINI_4: TextSection = {
  id: 'GrcMini-4',
  textId: 'GrcMini-4',
  sequence: 1,
  label: 'Ὁδοιπόρος — The traveler',
  sentences: [
    sent(
      'GrcMini-4-1',
      ['Ὁδοιπόρος', 'βαίνει', 'ἀπὸ', 'τῆς', 'πόλεως', 'εἰς', 'ἑτέραν', 'πόλιν.'],
      'A traveler walks from one city to another city.'
    ),
    sent('GrcMini-4-2', ['Ἡ', 'ὁδός', 'ἐστι', 'μακρά.'], 'The road is long.'),
    sent(
      'GrcMini-4-3',
      ['Ὁ', 'ὁδοιπόρος', 'κάμνει', 'καὶ', 'διψᾷ.'],
      'The traveler grows weary and is thirsty.'
    ),
    sent(
      'GrcMini-4-4',
      ['Εὑρίσκει', 'πηγὴν', 'καὶ', 'πίνει', 'τὸ', 'ὕδωρ.'],
      'He finds a spring and drinks the water.'
    ),
    sent(
      'GrcMini-4-5',
      ['Μετὰ', 'τοῦτο', 'ἀναπαύεται', 'ὑπὸ', 'δένδρον.'],
      'After this he rests under a tree.'
    ),
    sent(
      'GrcMini-4-6',
      ['Εἰς', 'ἑσπέραν', 'εἰσέρχεται', 'εἰς', 'τὴν', 'πόλιν.'],
      'At evening he enters the city.'
    ),
    sent(
      'GrcMini-4-7',
      ['Εὑρίσκει', 'κατάλυμα', 'καὶ', 'κοιμᾶται.'],
      'He finds lodging and sleeps.'
    ),
  ],
};

// ─── Story 5: Ὁ ποιμήν (The shepherd) ───────────────────────────────────────

export const GRC_MINI_5: TextSection = {
  id: 'GrcMini-5',
  textId: 'GrcMini-5',
  sequence: 1,
  label: 'Ὁ ποιμήν — The shepherd',
  sentences: [
    sent(
      'GrcMini-5-1',
      ['Ποιμήν', 'τις', 'ἔχει', 'ἑκατὸν', 'πρόβατα.'],
      'A certain shepherd has a hundred sheep.'
    ),
    sent('GrcMini-5-2', ['Βόσκει', 'αὐτὰ', 'ἐν', 'τῷ', 'ἀγρῷ.'], 'He grazes them in the field.'),
    sent(
      'GrcMini-5-3',
      ['Ἓν', 'πρόβατον', 'ἀπέρχεται', 'καὶ', 'ἀπόλλυται.'],
      'One sheep goes away and is lost.'
    ),
    sent(
      'GrcMini-5-4',
      ['Ὁ', 'ποιμὴν', 'καταλείπει', 'τὰ', 'ἐνενήκοντα', 'ἐννέα.'],
      'The shepherd leaves the ninety-nine.'
    ),
    sent(
      'GrcMini-5-5',
      ['Ζητεῖ', 'τὸ', 'ἀπολωλὸς', 'ἕως', 'εὕρῃ', 'αὐτό.'],
      'He seeks the lost one until he finds it.'
    ),
    sent('GrcMini-5-6', ['Εὑρίσκει', 'αὐτὸ', 'καὶ', 'χαίρει.'], 'He finds it and rejoices.'),
    sent(
      'GrcMini-5-7',
      ['Φέρει', 'αὐτὸ', 'ἐπὶ', 'τοὺς', 'ὤμους', 'αὐτοῦ.'],
      'He carries it on his shoulders.'
    ),
  ],
};

export const ALL_GREEK_MINI_STORIES = [GRC_MINI_1, GRC_MINI_2, GRC_MINI_3, GRC_MINI_4, GRC_MINI_5];
