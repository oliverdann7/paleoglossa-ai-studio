/**
 * Greek Mini-Stories — A1 Koine Greek graded readers
 * Original compositions for pedagogical use.
 * Simple present/imperfect tense, high-frequency vocabulary,
 * short sentences — designed for absolute beginners.
 */

import { TextSection, Sentence } from '../../types/corpus.js';
import { LXX_LEX } from './lxx-septuagint.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const hit = MINI_LEX[normalized] || LXX_LEX[normalized];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: hit?.lemma || normalized,
        gloss: hit?.gloss || '',
        morphology: { partOfSpeech: hit?.partOfSpeech || 'unknown' },
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

export const MINI_LEX: Record<string, { lemma: string; gloss: string; partOfSpeech?: string }> = {
  // Story narrative vocabulary used across both volumes
  αρτον: { lemma: 'ἄρτος', gloss: 'bread', partOfSpeech: 'noun' },
  αρτος: { lemma: 'ἄρτος', gloss: 'bread', partOfSpeech: 'noun' },
  αρτω: { lemma: 'ἄρτος', gloss: 'with bread', partOfSpeech: 'noun' },
  αρτους: { lemma: 'ἄρτος', gloss: 'loaves', partOfSpeech: 'noun' },
  ιησους: { lemma: 'Ἰησοῦς', gloss: 'Jesus', partOfSpeech: 'noun' },
  ιησου: { lemma: 'Ἰησοῦς', gloss: 'of/to Jesus', partOfSpeech: 'noun' },
  ιχθυας: { lemma: 'ἰχθύς', gloss: 'fish (pl. acc.)', partOfSpeech: 'noun' },
  ιχθυες: { lemma: 'ἰχθύς', gloss: 'fish (pl.)', partOfSpeech: 'noun' },
  χαιρει: { lemma: 'χαίρω', gloss: 'rejoices', partOfSpeech: 'verb' },
  μαθητης: { lemma: 'μαθητής', gloss: 'disciple', partOfSpeech: 'noun' },
  μαθηται: { lemma: 'μαθητής', gloss: 'disciples', partOfSpeech: 'noun' },
  μαθηταις: { lemma: 'μαθητής', gloss: 'to disciples', partOfSpeech: 'noun' },
  τεκνον: { lemma: 'τέκνον', gloss: 'child', partOfSpeech: 'noun' },
  λαμβανει: { lemma: 'λαμβάνω', gloss: 'takes', partOfSpeech: 'verb' },
  διδασκαλος: { lemma: 'διδάσκαλος', gloss: 'teacher', partOfSpeech: 'noun' },
  ευρισκει: { lemma: 'εὑρίσκω', gloss: 'finds', partOfSpeech: 'verb' },
  ευρη: { lemma: 'εὑρίσκω', gloss: 'might find', partOfSpeech: 'verb' },
  πατηρ: { lemma: 'πατήρ', gloss: 'father', partOfSpeech: 'noun' },
  πατρι: { lemma: 'πατήρ', gloss: 'to father', partOfSpeech: 'noun' },
  πατερα: { lemma: 'πατήρ', gloss: 'father (acc.)', partOfSpeech: 'noun' },
  τυφλος: { lemma: 'τυφλός', gloss: 'blind man', partOfSpeech: 'adjective' },
  βαινει: { lemma: 'βαίνω', gloss: 'walks', partOfSpeech: 'verb' },
  αγοραν: { lemma: 'ἀγορά', gloss: 'marketplace', partOfSpeech: 'noun' },
  διδωσιν: { lemma: 'δίδωμι', gloss: 'gives', partOfSpeech: 'verb' },
  διδωσι: { lemma: 'δίδωμι', gloss: 'gives', partOfSpeech: 'verb' },
  δος: { lemma: 'δίδωμι', gloss: 'give!', partOfSpeech: 'verb' },
  αργυριον: { lemma: 'ἀργύριον', gloss: 'silver', partOfSpeech: 'noun' },
  επανερχεται: { lemma: 'ἐπανέρχομαι', gloss: 'returns', partOfSpeech: 'verb' },
  ερωτα: { lemma: 'ἐρωτάω', gloss: 'asks', partOfSpeech: 'verb' },
  αποκρινεται: { lemma: 'ἀποκρίνομαι', gloss: 'answers', partOfSpeech: 'verb' },
  ακουει: { lemma: 'ἀκούω', gloss: 'hears', partOfSpeech: 'verb' },
  αλιευς: { lemma: 'ἁλιεύς', gloss: 'fisherman', partOfSpeech: 'noun' },
  καθιζει: { lemma: 'καθίζω', gloss: 'sits down', partOfSpeech: 'verb' },
  καθηται: { lemma: 'κάθημαι', gloss: 'sits', partOfSpeech: 'verb' },
  δικτυον: { lemma: 'δίκτυον', gloss: 'net', partOfSpeech: 'noun' },
  πολλοι: { lemma: 'πολύς', gloss: 'many', partOfSpeech: 'adjective' },
  εισερχονται: { lemma: 'εἰσέρχομαι', gloss: 'they enter', partOfSpeech: 'verb' },
  εισερχεται: { lemma: 'εἰσέρχομαι', gloss: 'enters', partOfSpeech: 'verb' },
  φερει: { lemma: 'φέρω', gloss: 'carries', partOfSpeech: 'verb' },
  οδοιπορος: { lemma: 'ὁδοιπόρος', gloss: 'traveler', partOfSpeech: 'noun' },
  πινει: { lemma: 'πίνω', gloss: 'drinks', partOfSpeech: 'verb' },
  κοιμαται: { lemma: 'κοιμάομαι', gloss: 'sleeps', partOfSpeech: 'verb' },
  ποιμην: { lemma: 'ποιμήν', gloss: 'shepherd', partOfSpeech: 'noun' },
  απερχεται: { lemma: 'ἀπέρχομαι', gloss: 'departs', partOfSpeech: 'verb' },
  πεινα: { lemma: 'πεινάω', gloss: 'is hungry', partOfSpeech: 'verb' },
  πεινωσι: { lemma: 'πεινάω', gloss: 'they hunger', partOfSpeech: 'verb' },
  ασπαζεται: { lemma: 'ἀσπάζομαι', gloss: 'greets', partOfSpeech: 'verb' },
  βλεπει: { lemma: 'βλέπω', gloss: 'sees', partOfSpeech: 'verb' },
  βλεπειν: { lemma: 'βλέπω', gloss: 'to see', partOfSpeech: 'verb' },
  γινεται: { lemma: 'γίνομαι', gloss: 'becomes', partOfSpeech: 'verb' },
  υιος: { lemma: 'υἱός', gloss: 'son', partOfSpeech: 'noun' },
  υιους: { lemma: 'υἱός', gloss: 'sons (acc.)', partOfSpeech: 'noun' },
  ορα: { lemma: 'ὁράω', gloss: 'sees', partOfSpeech: 'verb' },
  αρτοπωλου: { lemma: 'ἀρτοπώλης', gloss: 'of the bread-seller', partOfSpeech: 'noun' },
  αρτοπωλη: { lemma: 'ἀρτοπώλης', gloss: 'to the bread-seller', partOfSpeech: 'noun' },
  τρωγουσιν: { lemma: 'τρώγω', gloss: 'they eat', partOfSpeech: 'verb' },
  τρωγουσι: { lemma: 'τρώγω', gloss: 'they eat', partOfSpeech: 'verb' },
  ολη: { lemma: 'ὅλος', gloss: 'whole', partOfSpeech: 'adjective' },
  ιερω: { lemma: 'ἱερόν', gloss: 'in the temple', partOfSpeech: 'noun' },
  προσερχεται: { lemma: 'προσέρχομαι', gloss: 'approaches', partOfSpeech: 'verb' },
  σοφια: { lemma: 'σοφία', gloss: 'wisdom', partOfSpeech: 'noun' },
  μανθανει: { lemma: 'μανθάνω', gloss: 'learns', partOfSpeech: 'verb' },
  ριπτει: { lemma: 'ῥίπτω', gloss: 'throws', partOfSpeech: 'verb' },
  ευχαριστει: { lemma: 'εὐχαριστέω', gloss: 'gives thanks', partOfSpeech: 'verb' },
  πωλει: { lemma: 'πωλέω', gloss: 'sells', partOfSpeech: 'verb' },
  ανθρωποις: { lemma: 'ἄνθρωπος', gloss: 'to people', partOfSpeech: 'noun' },
  ανθρωπους: { lemma: 'ἄνθρωπος', gloss: 'people (acc.)', partOfSpeech: 'noun' },
  ανθρωποι: { lemma: 'ἄνθρωπος', gloss: 'people', partOfSpeech: 'noun' },
  οικαδε: { lemma: 'οἴκαδε', gloss: 'homeward', partOfSpeech: 'adverb' },
  πολεως: { lemma: 'πόλις', gloss: 'of the city', partOfSpeech: 'noun' },
  ετεραν: { lemma: 'ἕτερος', gloss: 'another', partOfSpeech: 'adjective' },
  οδος: { lemma: 'ὁδός', gloss: 'road', partOfSpeech: 'noun' },
  οδον: { lemma: 'ὁδός', gloss: 'road (acc.)', partOfSpeech: 'noun' },
  μακρα: { lemma: 'μακρός', gloss: 'long', partOfSpeech: 'adjective' },
  μακραν: { lemma: 'μακρός', gloss: 'far', partOfSpeech: 'adverb' },
  καμνει: { lemma: 'κάμνω', gloss: 'grows tired', partOfSpeech: 'verb' },
  διψα: { lemma: 'διψάω', gloss: 'thirsts', partOfSpeech: 'verb' },
  πηγην: { lemma: 'πηγή', gloss: 'spring', partOfSpeech: 'noun' },
  αναπαυεται: { lemma: 'ἀναπαύομαι', gloss: 'rests', partOfSpeech: 'verb' },
  δενδρον: { lemma: 'δένδρον', gloss: 'tree', partOfSpeech: 'noun' },
  καταλυμα: { lemma: 'κατάλυμα', gloss: 'lodging', partOfSpeech: 'noun' },
  εκατον: { lemma: 'ἑκατόν', gloss: 'hundred', partOfSpeech: 'numeral' },
  προβατα: { lemma: 'πρόβατον', gloss: 'sheep', partOfSpeech: 'noun' },
  βοσκει: { lemma: 'βόσκω', gloss: 'pastures', partOfSpeech: 'verb' },
  αγρω: { lemma: 'ἀγρός', gloss: 'in the field', partOfSpeech: 'noun' },
  απολλυται: { lemma: 'ἀπόλλυμι', gloss: 'is lost', partOfSpeech: 'verb' },
  καταλειπει: { lemma: 'καταλείπω', gloss: 'leaves behind', partOfSpeech: 'verb' },
  ενενηκοντα: { lemma: 'ἐνενήκοντα', gloss: 'ninety', partOfSpeech: 'numeral' },
  εννεα: { lemma: 'ἐννέα', gloss: 'nine', partOfSpeech: 'numeral' },
  ζητει: { lemma: 'ζητέω', gloss: 'seeks', partOfSpeech: 'verb' },
  απολωλος: { lemma: 'ἀπόλλυμι', gloss: 'lost', partOfSpeech: 'verb' },
  ωμους: { lemma: 'ὦμος', gloss: 'shoulders', partOfSpeech: 'noun' },
  μικρον: { lemma: 'μικρός', gloss: 'little', partOfSpeech: 'adjective' },
  μικρος: { lemma: 'μικρός', gloss: 'small', partOfSpeech: 'adjective' },
  κλαιει: { lemma: 'κλαίω', gloss: 'weeps', partOfSpeech: 'verb' },
  εσθιει: { lemma: 'ἐσθίω', gloss: 'eats', partOfSpeech: 'verb' },
  γαλα: { lemma: 'γάλα', gloss: 'milk', partOfSpeech: 'noun' },
  ψαλλει: { lemma: 'ψάλλω', gloss: 'sings', partOfSpeech: 'verb' },
  μητερα: { lemma: 'μήτηρ', gloss: 'mother (acc.)', partOfSpeech: 'noun' },
  φωνει: { lemma: 'φωνέω', gloss: 'calls', partOfSpeech: 'verb' },
  θελεις: { lemma: 'θέλω', gloss: 'you want', partOfSpeech: 'verb' },
  θελω: { lemma: 'θέλω', gloss: 'I want', partOfSpeech: 'verb' },
  απτεται: { lemma: 'ἅπτω', gloss: 'touches', partOfSpeech: 'verb' },
  οφθαλμων: { lemma: 'ὀφθαλμός', gloss: 'of eyes', partOfSpeech: 'noun' },
  ευθυς: { lemma: 'εὐθύς', gloss: 'immediately', partOfSpeech: 'adverb' },
  δοξαζει: { lemma: 'δοξάζω', gloss: 'glorifies', partOfSpeech: 'verb' },
  ακολουθουσιν: { lemma: 'ἀκολουθέω', gloss: 'they follow', partOfSpeech: 'verb' },
  εχουσι: { lemma: 'ἔχω', gloss: 'they have', partOfSpeech: 'verb' },
  παιδιον: { lemma: 'παιδίον', gloss: 'child', partOfSpeech: 'noun' },
  πεντε: { lemma: 'πέντε', gloss: 'five', partOfSpeech: 'numeral' },
  ευλογει: { lemma: 'εὐλογέω', gloss: 'blesses', partOfSpeech: 'verb' },
  οχλοις: { lemma: 'ὄχλος', gloss: 'to crowds', partOfSpeech: 'noun' },
  χορταζονται: { lemma: 'χορτάζω', gloss: 'they are satisfied', partOfSpeech: 'verb' },
  δωδεκα: { lemma: 'δώδεκα', gloss: 'twelve', partOfSpeech: 'numeral' },
  κοφινοι: { lemma: 'κόφινος', gloss: 'baskets', partOfSpeech: 'noun' },
  πληρεις: { lemma: 'πλήρης', gloss: 'full', partOfSpeech: 'adjective' },
  περισσευουσιν: { lemma: 'περισσεύω', gloss: 'they are left over', partOfSpeech: 'verb' },
  πλεουσιν: { lemma: 'πλέω', gloss: 'they sail', partOfSpeech: 'verb' },
  αλλην: { lemma: 'ἄλλος', gloss: 'other (f. acc.)', partOfSpeech: 'adjective' },
  οχθην: { lemma: 'ὄχθη', gloss: 'shore', partOfSpeech: 'noun' },
  μεγαλη: { lemma: 'μέγας', gloss: 'great (f.)', partOfSpeech: 'adjective' },
  θυελλα: { lemma: 'θύελλα', gloss: 'storm', partOfSpeech: 'noun' },
  κυματα: { lemma: 'κῦμα', gloss: 'waves', partOfSpeech: 'noun' },
  εμπιπτουσιν: { lemma: 'ἐμπίπτω', gloss: 'fall upon', partOfSpeech: 'verb' },
  καθευδει: { lemma: 'καθεύδω', gloss: 'is sleeping', partOfSpeech: 'verb' },
  φοβουνται: { lemma: 'φοβέομαι', gloss: 'fear', partOfSpeech: 'verb' },
  εγειρουσιν: { lemma: 'ἐγείρω', gloss: 'they wake', partOfSpeech: 'verb' },
  λεγουσιν: { lemma: 'λέγω', gloss: 'they say', partOfSpeech: 'verb' },
  σωσον: { lemma: 'σῴζω', gloss: 'save!', partOfSpeech: 'verb' },
  επιτιμα: { lemma: 'ἐπιτιμάω', gloss: 'rebukes', partOfSpeech: 'verb' },
  ανεμοις: { lemma: 'ἄνεμος', gloss: 'winds', partOfSpeech: 'noun' },
  γαληνη: { lemma: 'γαλήνη', gloss: 'calm', partOfSpeech: 'noun' },
  νεωτερος: { lemma: 'νέος', gloss: 'younger', partOfSpeech: 'adjective' },
  μερος: { lemma: 'μέρος', gloss: 'portion', partOfSpeech: 'noun' },
  χωραν: { lemma: 'χώρα', gloss: 'country', partOfSpeech: 'noun' },
  δαπανα: { lemma: 'δαπανάω', gloss: 'spends', partOfSpeech: 'verb' },
  αναστας: { lemma: 'ἀνίστημι', gloss: 'having arisen', partOfSpeech: 'verb' },
  πορευσομαι: { lemma: 'πορεύομαι', gloss: 'I will go', partOfSpeech: 'verb' },
  τρεχει: { lemma: 'τρέχω', gloss: 'runs', partOfSpeech: 'verb' },
  νεκρος: { lemma: 'νεκρός', gloss: 'dead', partOfSpeech: 'adjective' },
  ανεζησεν: { lemma: 'ἀναζάω', gloss: 'came alive again', partOfSpeech: 'verb' },
};

// ─── Story 1: Ἄνθρωπος ἐν τῇ ἀγορᾷ (A man at the marketplace) ──────────────

export const GRC_MINI_1: TextSection = {
  id: 'GrcMini-1',
  textId: 'GrcMini-1',
  sequence: 1,
  label: 'Ἄνθρωπος ἐν τῇ ἀγορᾷ — A man at the marketplace',
  sentences: [
    sent('GrcMini-1-1', ['Ἄνθρωπός', 'τις', 'βαίνει', 'εἰς', 'τὴν', 'ἀγοράν.'], 'A certain man walks to the marketplace.'),
    sent('GrcMini-1-2', ['Ἐκεῖ', 'ὁρᾷ', 'ἄρτον', 'καὶ', 'ἰχθύας.'], 'There he sees bread and fish.'),
    sent('GrcMini-1-3', ['Λαμβάνει', 'ἄρτον', 'ἀπὸ', 'τοῦ', 'ἀρτοπώλου.'], 'He takes bread from the bread-seller.'),
    sent('GrcMini-1-4', ['Δίδωσιν', 'ἀργύριον', 'τῷ', 'ἀρτοπώλῃ.'], 'He gives silver to the bread-seller.'),
    sent('GrcMini-1-5', ['Ἐπανέρχεται', 'εἰς', 'τὴν', 'οἰκίαν', 'σὺν', 'τῷ', 'ἄρτῳ.'], 'He returns to the house with the bread.'),
    sent('GrcMini-1-6', ['Ἡ', 'γυνὴ', 'χαίρει', 'ὅτι', 'ἔχει', 'ἄρτον.'], 'The woman rejoices because she has bread.'),
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
    sent('GrcMini-2-1', ['Διδάσκαλός', 'τις', 'κάθηται', 'ἐν', 'τῷ', 'ἱερῷ.'], 'A certain teacher sits in the temple.'),
    sent('GrcMini-2-2', ['Μαθητὴς', 'προσέρχεται', 'καὶ', 'ἐρωτᾷ', 'αὐτόν.'], 'A student comes forward and asks him.'),
    sent('GrcMini-2-3', ['Λέγει', 'ὁ', 'μαθητής·', 'Τί', 'ἐστιν', 'ἡ', 'σοφία;'], 'The student says: What is wisdom?'),
    sent('GrcMini-2-4', ['Ὁ', 'διδάσκαλος', 'ἀποκρίνεται·', 'Ἡ', 'ἀρχὴ', 'σοφίας', 'φόβος', 'θεοῦ.'], 'The teacher answers: The beginning of wisdom is fear of God.'),
    sent('GrcMini-2-5', ['Ὁ', 'μαθητὴς', 'ἀκούει', 'καὶ', 'μανθάνει.'], 'The student listens and learns.'),
    sent('GrcMini-2-6', ['Ὁ', 'διδάσκαλος', 'χαίρει', 'ὅτι', 'ὁ', 'μαθητὴς', 'σοφός', 'ἐστιν.'], 'The teacher rejoices because the student is wise.'),
  ],
};

// ─── Story 3: Ὁ ἁλιεύς (The fisherman) ──────────────────────────────────────

export const GRC_MINI_3: TextSection = {
  id: 'GrcMini-3',
  textId: 'GrcMini-3',
  sequence: 1,
  label: 'Ὁ ἁλιεύς — The fisherman',
  sentences: [
    sent('GrcMini-3-1', ['Ἁλιεύς', 'τις', 'καθίζει', 'παρὰ', 'τὴν', 'θάλασσαν.'], 'A certain fisherman sits beside the sea.'),
    sent('GrcMini-3-2', ['Ρίπτει', 'τὸ', 'δίκτυον', 'εἰς', 'τὸ', 'ὕδωρ.'], 'He throws the net into the water.'),
    sent('GrcMini-3-3', ['Πολλοὶ', 'ἰχθύες', 'εἰσέρχονται', 'εἰς', 'τὸ', 'δίκτυον.'], 'Many fish enter the net.'),
    sent('GrcMini-3-4', ['Ὁ', 'ἁλιεὺς', 'χαίρει', 'καὶ', 'εὐχαριστεῖ', 'τῷ', 'θεῷ.'], 'The fisherman rejoices and gives thanks to God.'),
    sent('GrcMini-3-5', ['Φέρει', 'τοὺς', 'ἰχθύας', 'εἰς', 'τὴν', 'ἀγοράν.'], 'He carries the fish to the marketplace.'),
    sent('GrcMini-3-6', ['Πωλεῖ', 'τοὺς', 'ἰχθύας', 'τοῖς', 'ἀνθρώποις.'], 'He sells the fish to the people.'),
    sent('GrcMini-3-7', ['Λαμβάνει', 'ἀργύριον', 'καὶ', 'ἐπανέρχεται', 'οἴκαδε.'], 'He receives silver and returns home.'),
  ],
};

// ─── Story 4: Ὁδοιπόρος (The traveler) ──────────────────────────────────────

export const GRC_MINI_4: TextSection = {
  id: 'GrcMini-4',
  textId: 'GrcMini-4',
  sequence: 1,
  label: 'Ὁδοιπόρος — The traveler',
  sentences: [
    sent('GrcMini-4-1', ['Ὁδοιπόρος', 'βαίνει', 'ἀπὸ', 'τῆς', 'πόλεως', 'εἰς', 'ἑτέραν', 'πόλιν.'], 'A traveler walks from one city to another city.'),
    sent('GrcMini-4-2', ['Ἡ', 'ὁδός', 'ἐστι', 'μακρά.'], 'The road is long.'),
    sent('GrcMini-4-3', ['Ὁ', 'ὁδοιπόρος', 'κάμνει', 'καὶ', 'διψᾷ.'], 'The traveler grows weary and is thirsty.'),
    sent('GrcMini-4-4', ['Εὑρίσκει', 'πηγὴν', 'καὶ', 'πίνει', 'τὸ', 'ὕδωρ.'], 'He finds a spring and drinks the water.'),
    sent('GrcMini-4-5', ['Μετὰ', 'τοῦτο', 'ἀναπαύεται', 'ὑπὸ', 'δένδρον.'], 'After this he rests under a tree.'),
    sent('GrcMini-4-6', ['Εἰς', 'ἑσπέραν', 'εἰσέρχεται', 'εἰς', 'τὴν', 'πόλιν.'], 'At evening he enters the city.'),
    sent('GrcMini-4-7', ['Εὑρίσκει', 'κατάλυμα', 'καὶ', 'κοιμᾶται.'], 'He finds lodging and sleeps.'),
  ],
};

// ─── Story 5: Ὁ ποιμήν (The shepherd) ───────────────────────────────────────

export const GRC_MINI_5: TextSection = {
  id: 'GrcMini-5',
  textId: 'GrcMini-5',
  sequence: 1,
  label: 'Ὁ ποιμήν — The shepherd',
  sentences: [
    sent('GrcMini-5-1', ['Ποιμήν', 'τις', 'ἔχει', 'ἑκατὸν', 'πρόβατα.'], 'A certain shepherd has a hundred sheep.'),
    sent('GrcMini-5-2', ['Βόσκει', 'αὐτὰ', 'ἐν', 'τῷ', 'ἀγρῷ.'], 'He grazes them in the field.'),
    sent('GrcMini-5-3', ['Ἓν', 'πρόβατον', 'ἀπέρχεται', 'καὶ', 'ἀπόλλυται.'], 'One sheep goes away and is lost.'),
    sent('GrcMini-5-4', ['Ὁ', 'ποιμὴν', 'καταλείπει', 'τὰ', 'ἐνενήκοντα', 'ἐννέα.'], 'The shepherd leaves the ninety-nine.'),
    sent('GrcMini-5-5', ['Ζητεῖ', 'τὸ', 'ἀπολωλὸς', 'ἕως', 'εὕρῃ', 'αὐτό.'], 'He seeks the lost one until he finds it.'),
    sent('GrcMini-5-6', ['Εὑρίσκει', 'αὐτὸ', 'καὶ', 'χαίρει.'], 'He finds it and rejoices.'),
    sent('GrcMini-5-7', ['Φέρει', 'αὐτὸ', 'ἐπὶ', 'τοὺς', 'ὤμους', 'αὐτοῦ.'], 'He carries it on his shoulders.'),
  ],
};

export const ALL_GREEK_MINI_STORIES = [GRC_MINI_1, GRC_MINI_2, GRC_MINI_3, GRC_MINI_4, GRC_MINI_5];
