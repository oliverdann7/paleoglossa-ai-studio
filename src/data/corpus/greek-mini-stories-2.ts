/**
 * Greek Mini-Stories Volume 2 — five more A1 Koine Greek graded readers.
 *
 * Same shape as greek-mini-stories.ts. Original compositions for
 * pedagogical use, using high-frequency NT vocabulary and simple
 * present/imperfect tenses.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g, '');
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

// ─── Story 6: Ἡ μήτηρ καὶ τὸ τέκνον (The mother and the child) ────────────

export const GRC_MINI_6: TextSection = {
  id: 'GrcMini-6',
  textId: 'GrcMini-6',
  sequence: 6,
  label: 'Ἡ μήτηρ καὶ τὸ τέκνον — The mother and the child',
  sentences: [
    sent(
      'GrcMini-6-1',
      ['Μήτηρ', 'τις', 'ἔχει', 'τέκνον', 'μικρόν.'],
      'A certain mother has a small child.'
    ),
    sent(
      'GrcMini-6-2',
      ['Τὸ', 'τέκνον', 'κλαίει', 'καὶ', 'πεινᾷ.'],
      'The child cries and is hungry.'
    ),
    sent(
      'GrcMini-6-3',
      ['Ἡ', 'μήτηρ', 'δίδωσιν', 'αὐτῷ', 'ἄρτον.'],
      'The mother gives him bread.'
    ),
    sent(
      'GrcMini-6-4',
      ['Τὸ', 'τέκνον', 'ἐσθίει', 'τὸν', 'ἄρτον', 'καὶ', 'πίνει', 'γάλα.'],
      'The child eats the bread and drinks milk.'
    ),
    sent(
      'GrcMini-6-5',
      ['Ἡ', 'μήτηρ', 'ψάλλει', 'καὶ', 'τὸ', 'τέκνον', 'κοιμᾶται.'],
      'The mother sings and the child sleeps.'
    ),
    sent(
      'GrcMini-6-6',
      ['Ὁ', 'πατὴρ', 'εἰσέρχεται', 'καὶ', 'ἀσπάζεται', 'τὴν', 'μητέρα.'],
      'The father enters and greets the mother.'
    ),
  ],
};

// ─── Story 7: Ὁ τυφλὸς (The blind man) ────────────────────────────────────

export const GRC_MINI_7: TextSection = {
  id: 'GrcMini-7',
  textId: 'GrcMini-7',
  sequence: 7,
  label: 'Ὁ τυφλὸς — The blind man',
  sentences: [
    sent(
      'GrcMini-7-1',
      ['Τυφλός', 'τις', 'καθίζει', 'παρὰ', 'τὴν', 'ὁδόν.'],
      'A certain blind man sits by the road.'
    ),
    sent(
      'GrcMini-7-2',
      ['Ἀκούει', 'τοὺς', 'ἀνθρώπους', 'καὶ', 'φωνεῖ.'],
      'He hears the people and calls out.'
    ),
    sent(
      'GrcMini-7-3',
      ['Ὁ', 'Ἰησοῦς', 'ἐρωτᾷ', 'αὐτόν·', 'Τί', 'θέλεις;'],
      'Jesus asks him: What do you want?'
    ),
    sent(
      'GrcMini-7-4',
      ['Ὁ', 'τυφλὸς', 'ἀποκρίνεται·', 'Κύριε,', 'θέλω', 'βλέπειν.'],
      'The blind man answers: Lord, I want to see.'
    ),
    sent(
      'GrcMini-7-5',
      ['Ὁ', 'Ἰησοῦς', 'ἅπτεται', 'τῶν', 'ὀφθαλμῶν', 'αὐτοῦ.'],
      'Jesus touches his eyes.'
    ),
    sent(
      'GrcMini-7-6',
      ['Εὐθὺς', 'ὁ', 'τυφλὸς', 'βλέπει', 'καὶ', 'δοξάζει', 'τὸν', 'θεόν.'],
      'Immediately the blind man sees and glorifies God.'
    ),
  ],
};

// ─── Story 8: Τὸ ἄρτος καὶ οἱ ἰχθύες (The bread and the fish) ─────────────

export const GRC_MINI_8: TextSection = {
  id: 'GrcMini-8',
  textId: 'GrcMini-8',
  sequence: 8,
  label: 'Ὁ ἄρτος καὶ οἱ ἰχθύες — The bread and the fish',
  sentences: [
    sent(
      'GrcMini-8-1',
      ['Πολλοὶ', 'ἄνθρωποι', 'ἀκολουθοῦσιν', 'τῷ', 'Ἰησοῦ.'],
      'Many people follow Jesus.'
    ),
    sent(
      'GrcMini-8-2',
      ['Πεινῶσι', 'καὶ', 'οὐκ', 'ἔχουσι', 'ἄρτον.'],
      'They are hungry and have no bread.'
    ),
    sent(
      'GrcMini-8-3',
      ['Παιδίον', 'τι', 'ἔχει', 'πέντε', 'ἄρτους', 'καὶ', 'δύο', 'ἰχθύας.'],
      'A certain child has five loaves and two fish.'
    ),
    sent(
      'GrcMini-8-4',
      ['Ὁ', 'Ἰησοῦς', 'λαμβάνει', 'τὸν', 'ἄρτον', 'καὶ', 'εὐλογεῖ.'],
      'Jesus takes the bread and blesses it.'
    ),
    sent(
      'GrcMini-8-5',
      ['Δίδωσι', 'τοῖς', 'μαθηταῖς', 'καὶ', 'οἱ', 'μαθηταὶ', 'τοῖς', 'ὄχλοις.'],
      'He gives to the disciples and the disciples to the crowds.'
    ),
    sent(
      'GrcMini-8-6',
      ['Πάντες', 'τρώγουσι', 'καὶ', 'χορτάζονται.'],
      'All eat and are filled.'
    ),
    sent(
      'GrcMini-8-7',
      ['Δώδεκα', 'κόφινοι', 'πλήρεις', 'περισσεύουσιν.'],
      'Twelve baskets full remain over.'
    ),
  ],
};

// ─── Story 9: Ἡ θύελλα (The storm) ────────────────────────────────────────

export const GRC_MINI_9: TextSection = {
  id: 'GrcMini-9',
  textId: 'GrcMini-9',
  sequence: 9,
  label: 'Ἡ θύελλα — The storm',
  sentences: [
    sent(
      'GrcMini-9-1',
      ['Ὁ', 'Ἰησοῦς', 'καὶ', 'οἱ', 'μαθηταὶ', 'εἰσέρχονται', 'εἰς', 'τὸ', 'πλοῖον.'],
      'Jesus and the disciples enter the boat.'
    ),
    sent(
      'GrcMini-9-2',
      ['Πλέουσιν', 'εἰς', 'τὴν', 'ἄλλην', 'ὄχθην.'],
      'They sail to the other shore.'
    ),
    sent(
      'GrcMini-9-3',
      ['Μεγάλη', 'θύελλα', 'γίνεται', 'ἐν', 'τῇ', 'θαλάσσῃ.'],
      'A great storm arises on the sea.'
    ),
    sent(
      'GrcMini-9-4',
      ['Τὰ', 'κύματα', 'ἐμπίπτουσιν', 'εἰς', 'τὸ', 'πλοῖον.'],
      'The waves fall into the boat.'
    ),
    sent(
      'GrcMini-9-5',
      ['Ὁ', 'Ἰησοῦς', 'καθεύδει', 'καὶ', 'οἱ', 'μαθηταὶ', 'φοβοῦνται.'],
      'Jesus sleeps and the disciples are afraid.'
    ),
    sent(
      'GrcMini-9-6',
      ['Ἐγείρουσιν', 'αὐτὸν', 'καὶ', 'λέγουσιν·', 'Κύριε,', 'σῶσον.'],
      'They wake him and say: Lord, save us.'
    ),
    sent(
      'GrcMini-9-7',
      ['Ὁ', 'Ἰησοῦς', 'ἐπιτιμᾷ', 'τοῖς', 'ἀνέμοις', 'καὶ', 'γαλήνη', 'γίνεται.'],
      'Jesus rebukes the winds and a calm comes.'
    ),
  ],
};

// ─── Story 10: Ὁ ἄσωτος υἱός (The lost son) ───────────────────────────────

export const GRC_MINI_10: TextSection = {
  id: 'GrcMini-10',
  textId: 'GrcMini-10',
  sequence: 10,
  label: 'Ὁ ἄσωτος υἱός — The lost son',
  sentences: [
    sent(
      'GrcMini-10-1',
      ['Ἄνθρωπός', 'τις', 'ἔχει', 'δύο', 'υἱούς.'],
      'A certain man has two sons.'
    ),
    sent(
      'GrcMini-10-2',
      ['Ὁ', 'νεώτερος', 'λέγει', 'τῷ', 'πατρί·', 'Δός', 'μοι', 'τὸ', 'μέρος.'],
      'The younger says to the father: Give me the share.'
    ),
    sent(
      'GrcMini-10-3',
      ['Ὁ', 'πατὴρ', 'δίδωσι', 'καὶ', 'ὁ', 'υἱὸς', 'ἀπέρχεται', 'εἰς', 'χώραν', 'μακράν.'],
      'The father gives, and the son goes away to a far country.'
    ),
    sent(
      'GrcMini-10-4',
      ['Ἐκεῖ', 'δαπανᾷ', 'τὰ', 'πάντα', 'καὶ', 'πεινᾷ.'],
      'There he spends everything and is hungry.'
    ),
    sent(
      'GrcMini-10-5',
      ['Λέγει', 'ἐν', 'ἑαυτῷ·', 'Ἀναστὰς', 'πορεύσομαι', 'πρὸς', 'τὸν', 'πατέρα.'],
      'He says within himself: Rising up, I will go to the father.'
    ),
    sent(
      'GrcMini-10-6',
      ['Ὁ', 'πατὴρ', 'βλέπει', 'αὐτὸν', 'καὶ', 'τρέχει', 'καὶ', 'ἀσπάζεται.'],
      'The father sees him and runs and embraces him.'
    ),
    sent(
      'GrcMini-10-7',
      ['Λέγει·', 'Οὗτος', 'ὁ', 'υἱός', 'μου', 'νεκρὸς', 'ἦν', 'καὶ', 'ἀνέζησεν.'],
      'He says: This son of mine was dead and has come to life again.'
    ),
  ],
};

export const ALL_GREEK_MINI_STORIES_2 = [
  GRC_MINI_6,
  GRC_MINI_7,
  GRC_MINI_8,
  GRC_MINI_9,
  GRC_MINI_10,
];
