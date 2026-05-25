/**
 * Latin Beginner Texts — A1 level
 *
 * 1. Vulgate John 1:1–14 (Biblia Sacra Vulgata — public domain)
 *    The most familiar Latin prose passage; short, theological,
 *    ideal for beginners learning Latin through the Christian tradition.
 *
 * 2. Disticha Catonis — selections (public domain)
 *    Short two-line moral sayings, simple vocabulary,
 *    widely used in medieval and early-modern Latin education.
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

// ─── Vulgate John 1:1–14 ─────────────────────────────────────────────────────

export const LAT_VULGATE_JOHN_1: TextSection = {
  id: 'Lat-Vg-Jn-1',
  textId: 'Lat-Vg-Jn',
  sequence: 1,
  label: 'Ioannem 1:1–14 — In principio erat Verbum',
  sentences: [
    sent(
      'Lat-Vg-Jn-1',
      [
        'In',
        'principio',
        'erat',
        'Verbum',
        'et',
        'Verbum',
        'erat',
        'apud',
        'Deum',
        'et',
        'Deus',
        'erat',
        'Verbum.',
      ],
      'In the beginning was the Word, and the Word was with God, and the Word was God.'
    ),
    sent(
      'Lat-Vg-Jn-2',
      ['Hoc', 'erat', 'in', 'principio', 'apud', 'Deum.'],
      'This was in the beginning with God.'
    ),
    sent(
      'Lat-Vg-Jn-3',
      [
        'Omnia',
        'per',
        'ipsum',
        'facta',
        'sunt',
        'et',
        'sine',
        'ipso',
        'factum',
        'est',
        'nihil',
        'quod',
        'factum',
        'est.',
      ],
      'All things were made through him, and without him was not any thing made that was made.'
    ),
    sent(
      'Lat-Vg-Jn-4',
      ['In', 'ipso', 'vita', 'erat', 'et', 'vita', 'erat', 'lux', 'hominum.'],
      'In him was life, and the life was the light of men.'
    ),
    sent(
      'Lat-Vg-Jn-5',
      ['Et', 'lux', 'in', 'tenebris', 'lucet', 'et', 'tenebrae', 'eam', 'non', 'comprehenderunt.'],
      'The light shines in the darkness, and the darkness has not overcome it.'
    ),
    sent(
      'Lat-Vg-Jn-6',
      ['Fuit', 'homo', 'missus', 'a', 'Deo', 'cui', 'nomen', 'erat', 'Ioannes.'],
      'There was a man sent from God, whose name was John.'
    ),
    sent(
      'Lat-Vg-Jn-7',
      [
        'Hic',
        'venit',
        'in',
        'testimonium',
        'ut',
        'testimonium',
        'perhiberet',
        'de',
        'lumine',
        'ut',
        'omnes',
        'crederent',
        'per',
        'illum.',
      ],
      'He came as a witness, to bear witness about the light, that all might believe through him.'
    ),
    sent(
      'Lat-Vg-Jn-8',
      ['Non', 'erat', 'ille', 'lux', 'sed', 'ut', 'testimonium', 'perhiberet', 'de', 'lumine.'],
      'He was not the light, but came to bear witness about the light.'
    ),
    sent(
      'Lat-Vg-Jn-9',
      [
        'Erat',
        'lux',
        'vera',
        'quae',
        'inluminat',
        'omnem',
        'hominem',
        'venientem',
        'in',
        'mundum.',
      ],
      'The true light, which gives light to everyone, was coming into the world.'
    ),
    sent(
      'Lat-Vg-Jn-10',
      [
        'In',
        'mundo',
        'erat',
        'et',
        'mundus',
        'per',
        'ipsum',
        'factus',
        'est',
        'et',
        'mundus',
        'eum',
        'non',
        'cognovit.',
      ],
      'He was in the world, and the world was made through him, yet the world did not know him.'
    ),
    sent(
      'Lat-Vg-Jn-11',
      ['In', 'propria', 'venit', 'et', 'sui', 'eum', 'non', 'receperunt.'],
      'He came to his own, and his own people did not receive him.'
    ),
    sent(
      'Lat-Vg-Jn-12',
      [
        'Quotquot',
        'autem',
        'acceperunt',
        'eum',
        'dedit',
        'eis',
        'potestatem',
        'filios',
        'Dei',
        'fieri',
        'his',
        'qui',
        'credunt',
        'in',
        'nomine',
        'eius.',
      ],
      'But to all who did receive him, who believed in his name, he gave the right to become children of God.'
    ),
    sent(
      'Lat-Vg-Jn-13',
      [
        'Qui',
        'non',
        'ex',
        'sanguinibus',
        'neque',
        'ex',
        'voluntate',
        'carnis',
        'neque',
        'ex',
        'voluntate',
        'viri',
        'sed',
        'ex',
        'Deo',
        'nati',
        'sunt.',
      ],
      'Who were born, not of blood nor of the will of the flesh nor of the will of man, but of God.'
    ),
    sent(
      'Lat-Vg-Jn-14',
      [
        'Et',
        'Verbum',
        'caro',
        'factum',
        'est',
        'et',
        'habitavit',
        'in',
        'nobis',
        'et',
        'vidimus',
        'gloriam',
        'eius.',
      ],
      'And the Word became flesh and dwelt among us, and we have seen his glory.'
    ),
  ],
};

// ─── Disticha Catonis — selections ───────────────────────────────────────────

export const LAT_DISTICHA_CATONIS: TextSection = {
  id: 'Lat-Cat-1',
  textId: 'Lat-Cato',
  sequence: 1,
  label: 'Disticha Catonis — Praecepta moralia',
  sentences: [
    sent(
      'Lat-Cat-1',
      [
        'Si',
        'Deus',
        'est',
        'animus,',
        'nobis',
        'ut',
        'carmina',
        'dicunt,',
        'hic',
        'tibi',
        'praecipue',
        'sit',
        'pura',
        'mente',
        'colendus.',
      ],
      'If God is a spirit, as poetry tells us, then he above all should be worshipped with a pure mind.'
    ),
    sent(
      'Lat-Cat-2',
      [
        'Plus',
        'vigila',
        'semper',
        'nec',
        'somno',
        'deditus',
        'esto:',
        'nam',
        'diuturna',
        'quies',
        'vitiis',
        'alimenta',
        'ministrat.',
      ],
      'Always be more watchful and do not give yourself over to sleep: for long rest feeds vices.'
    ),
    sent(
      'Lat-Cat-3',
      [
        'Virtutem',
        'primam',
        'esse',
        'puta',
        'compescere',
        'linguam:',
        'proximus',
        'ille',
        'Deo',
        'est,',
        'qui',
        'scit',
        'ratione',
        'tacere.',
      ],
      'Consider the first virtue to be controlling your tongue: he is closest to God who knows how to be silent by reason.'
    ),
    sent(
      'Lat-Cat-4',
      [
        'Spem',
        'tibi',
        'promissi',
        'certam',
        'promittere',
        'noli:',
        'rara',
        'fides',
        'ideo',
        'est,',
        'quia',
        'multa',
        'promissio',
        'fallit.',
      ],
      'Do not promise a certain hope of what is promised: trust is rare for this reason, because many a promise deceives.'
    ),
    sent(
      'Lat-Cat-5',
      [
        'Cum',
        'recte',
        'vivis,',
        'ne',
        'cures',
        'verba',
        'malorum:',
        'arbitrii',
        'nostri',
        'non',
        'est,',
        'quid',
        'quisque',
        'loquatur.',
      ],
      'When you live rightly, do not heed the words of the wicked: it is not in our power what anyone says.'
    ),
    sent(
      'Lat-Cat-6',
      [
        'Quod',
        'potis',
        'est,',
        'gratum',
        'refer',
        'officium:',
        'qui',
        'gratus',
        'futurus',
        'est,',
        'statim',
        'cum',
        'accipit',
        'cogitare',
        'debet',
        'quomodo',
        'referat.',
      ],
      'Repay whatever service you can with gratitude: he who is going to be grateful ought to think immediately upon receiving how to repay.'
    ),
    sent(
      'Lat-Cat-7',
      [
        'Consilio',
        'ante',
        'petas',
        'quam',
        'tu',
        'diffinire',
        'labores:',
        'consilium',
        'multis',
        'utilius',
        'est',
        'quam',
        'fortitudo.',
      ],
      'Seek counsel before you take pains to decide: counsel is more useful to many than courage.'
    ),
    sent(
      'Lat-Cat-8',
      [
        'Luxuriam',
        'fugito',
        'simul',
        'et',
        'vitare',
        'memento',
        'crimen,',
        'avaritiam',
        'nam',
        'duplex',
        'tollat',
        'utrumque.',
      ],
      'Flee extravagance and remember also to avoid the crime of avarice, for double virtue removes both.'
    ),
  ],
};

export const ALL_LATIN_BEGINNER_SECTIONS = [LAT_VULGATE_JOHN_1, LAT_DISTICHA_CATONIS];
