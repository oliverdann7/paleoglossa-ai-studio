/**
 * Ovid — Metamorphoses (Book 1, opening)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation.
 *
 * The text is in the Public Domain. No permission needed for use,
 * reproduction, or distribution.
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

export const OVID_METAMORPHOSES_1: TextSection = {
  id: 'Ovid-Met-1',
  textId: 'Ovid-Metamorphoses-1',
  sequence: 1,
  label: 'Metamorphoses Book 1.1–20 — Invocation and Chaos',
  sentences: [
    sent(
      'Ovid-1-1',
      ['In', 'nova', 'fert', 'animus', 'mutatas', 'dicere', 'formas', 'corpora;'],
      'My mind leads me to speak of forms changed into new bodies;'
    ),
    sent(
      'Ovid-1-2',
      [
        'di,',
        'coeptis',
        '(nam',
        'vos',
        'mutastis',
        'et',
        'illas)',
        'adspirate',
        'meis',
        'primaque',
        'ab',
        'origine',
        'mundi',
        'ad',
        'mea',
        'tempora',
        'deducite',
        'carmen!',
      ],
      "O gods, assist my undertaking, for you have transformed even those forms, and I pray you guide my song from the world's beginning down to my own times!"
    ),
    sent(
      'Ovid-1-3',
      [
        'Ante',
        'mare',
        'et',
        'terras',
        'et',
        'quod',
        'tegit',
        'omnia',
        'caelum',
        'unus',
        'erat',
        'toto',
        'naturae',
        'vultus',
        'in',
        'orbe,',
        'quem',
        'dixere',
        'Chaos;',
      ],
      'Before the sea and land and the sky that covers all, there was one face of nature throughout the whole universe, which men called Chaos;'
    ),
    sent(
      'Ovid-1-4',
      [
        'rudis',
        'indigestaque',
        'moles',
        'nec',
        'quicquam',
        'nisi',
        'pondus',
        'iners',
        'congestaque',
        'eodem',
        'non',
        'bene',
        'iunctarum',
        'discordia',
        'semina',
        'rerum.',
      ],
      'a rough and unordered mass, and nothing but an inert weight, and the discord of badly joined seeds of things heaped together.'
    ),
    sent(
      'Ovid-1-5',
      [
        'nulla',
        'suo',
        'fuit',
        'ut',
        'magis',
        'ulla',
        'dies',
        'et',
        'nox',
        'diducta',
        'foret',
        'ab',
        'aethere',
        'caelo;',
      ],
      'There was no day distinct, nor night separated from the heavens by the aether;'
    ),
    sent(
      'Ovid-1-6',
      [
        'nec',
        'madida',
        'tellus',
        'pendebat',
        'in',
        'aere',
        'libra,',
        'nec',
        'circumfuso',
        'pendebat',
        'in',
        'aequore',
        'bracchia',
        'Tethys;',
      ],
      "nor did the moist earth hang in the air's balance, nor did Tethys hang her arms around the surrounding waters;"
    ),
    sent(
      'Ovid-1-7',
      [
        'quisquis',
        'erat',
        'deus',
        'ille',
        'qui',
        'discordia',
        'tali',
        'secrevit',
        'primum',
        'sidera',
        'caelo;',
      ],
      'Whoever this divinity was, he resolved the discord and divided the chaos into its component parts.'
    ),
    sent(
      'Ovid-1-8',
      ['terram', 'et', 'aquas', 'et', 'caelum', 'sortitus', 'est.'],
      'He allotted the earth, the waters, and the heavens to their proper places.'
    ),
    sent(
      'Ovid-1-9',
      [
        'postquam',
        'deorum',
        'quisquam',
        'meliore',
        'luto',
        'finxit',
        'in',
        'effigiem',
        'moderantum',
        'cuncta',
        'deus',
      ],
      'After this, one of the gods shaped mankind from better clay in the image of the all-ruling gods.'
    ),
    sent(
      'Ovid-1-10',
      [
        'aut',
        'ex',
        'divino',
        'semine',
        'erat',
        'aut',
        'ex',
        'nova',
        'terra',
        'adhuc',
        'caelo',
        'mixta',
        'creata.',
      ],
      'Either mankind was made from divine seed, or the newly separated earth retained the germs of the sky.'
    ),
    sent(
      'Ovid-1-11',
      [
        'surgere',
        'in',
        'altum',
        'animam',
        'iussit',
        'et',
        'spectare',
        'in',
        'caelum',
        'quam',
        'caeteris',
        'animantibus',
        'prona',
        'iacent.',
      ],
      'He commanded the mind to rise toward the heights and to gaze upon the heavens—while all other creatures look downward to the earth.'
    ),
    sent(
      'Ovid-1-12',
      [
        'dedit',
        'os',
        'homini',
        'sublime',
        'coelumque',
        'tueri',
        'iussit',
        'et',
        'erectos',
        'ad',
        'sidera',
        'tollere',
        'vultus.',
      ],
      'He gave man a countenance to look upon the sky, and commanded him to raise his eyes toward the stars.'
    ),
  ],
};

export const OVID_METAMORPHOSES_2: TextSection = {
  id: 'Ovid-Met-2',
  textId: 'Ovid-Metamorphoses-1',
  sequence: 2,
  label: 'Metamorphoses Book 1.20–50 — The Four Ages of Humanity',
  sentences: [
    sent(
      'Ovid-2-1',
      ['aurea', 'prima', 'sata', 'est', 'aetas,', 'quae', 'vindice', 'nullo'],
      'First was the golden age, which without any avenger,'
    ),
    sent(
      'Ovid-2-2',
      ['sponte', 'sua,', 'sine', 'lege,', 'fidem', 'rectumque', 'colebat.'],
      'of its own accord, without law, maintained faith and righteousness.'
    ),
    sent(
      'Ovid-2-3',
      ['poena', 'metusque', 'aberant;', 'nec', 'verba', 'minantia', 'fixo', 'aere', 'legebantur,'],
      'Punishment and fear were absent; nor were threatening words read upon bronze tablets,'
    ),
    sent(
      'Ovid-2-4',
      [
        'nec',
        'supplex',
        'turba',
        'magostri',
        'vultum',
        'pavida',
        'timebet,',
        'sed',
        'sine',
        'iudice',
        'tutae',
        'erant.',
      ],
      'nor did the suppliant crowd fear the face of their judge with dread; but all were safe without a judge.'
    ),
    sent(
      'Ovid-2-5',
      ['nondum', 'caesa', 'suis', 'fluitantibus', 'arbor', 'in', 'undis', 'montibus', 'erat'],
      'Not yet had the pine tree, felled from its mountains, descended into the flowing waters,'
    ),
    sent(
      'Ovid-2-6',
      ['nec', 'mortals', 'praeter', 'suam', 'norant', 'litora.'],
      'nor did mortals know shores other than their own.'
    ),
    sent(
      'Ovid-2-7',
      ['argentea', 'postera', 'venit', 'aetas,', 'diminutior', 'auro'],
      'The silver age came after, lesser than the golden,'
    ),
    sent(
      'Ovid-2-8',
      ['sed', 'tamen', 'argentea,', 'non', 'qualis', 'ferrea', 'mundi', 'aetas.'],
      'but nevertheless silver, not such as the iron age of the world.'
    ),
    sent(
      'Ovid-2-9',
      ['tertia', 'tum', 'posita', 'est', 'aetas', 'aerea', 'priscis', 'ferocius'],
      'Then came the bronze age, wilder than ancient times,'
    ),
    sent(
      'Ovid-2-10',
      ['sed', 'non', 'bellatrix;', 'tertia', 'ferrea', 'demum', 'cum', 'omne', 'malum', 'erupot.'],
      'but not warlike; at last came the iron age, when all evil burst forth.'
    ),
    sent(
      'Ovid-2-11',
      [
        'protinus',
        'irrupit',
        'venae',
        'peioris',
        'in',
        'orbem',
        'fraus',
        'dolus',
        'vis',
        'pietas.',
      ],
      'Immediately fraud, deceit, violence, and impiety burst into the world through every vein.'
    ),
    sent(
      'Ovid-2-12',
      [
        'pelago',
        'cessere',
        'deum',
        'velique',
        'reliquere',
        'alumnae',
        'telluri',
        'aditum',
        'pudor',
        'verumque',
        'fidesque.',
      ],
      'The gods withdrew from the earth; and shame, truth, and faith also abandoned it.'
    ),
  ],
};

export const OVID_METAMORPHOSES_3: TextSection = {
  id: 'Ovid-Met-3',
  textId: 'Ovid-Metamorphoses-1',
  sequence: 3,
  label: 'Metamorphoses Book 1.50–75 — Giants and the Rise of Evil',
  sentences: [
    sent(
      'Ovid-3-1',
      ['in', 'maiestatem', 'sese', 'efferre', 'Gigas', 'ausus', 'erat', 'et', 'caelum', 'petere'],
      'The giants dared to rise against divine majesty and sought to seize the sky;'
    ),
    sent(
      'Ovid-3-2',
      ['Ossa', 'Pelion', 'inposita', 'est;', 'ter', 'centum', 'bracchia', 'iactabant'],
      'Ossa was piled upon Pelion; three hundred arms hurled monstrous weapons,'
    ),
    sent(
      'Ovid-3-3',
      ['ad', 'caelum;', 'sed', 'regi', 'aetheris', 'ira', 'deum', 'misere', 'mortales', 'iamque'],
      'toward the sky; but the anger of the king of heaven sent death to mortals, and now'
    ),
    sent(
      'Ovid-3-4',
      ['vix', 'satis', 'una', 'Venus', 'deum', 'reparare', 'genus', 'poterat.'],
      'one Venus scarcely sufficed to repair the race of gods.'
    ),
    sent(
      'Ovid-3-5',
      [
        'vidit',
        'inhumanae',
        'culpas',
        'et',
        'scelera',
        'generis',
        'humani',
        'iuppiter',
        'et',
        'ingemuit.',
      ],
      'Jupiter saw the crimes and wickedness of the inhuman generation and groaned.'
    ),
    sent(
      'Ovid-3-6',
      ['rescidit', 'velle', 'fidem', 'longissimorum', 'abstersit', 'ex', 'ore', 'suo', 'nubem.'],
      'He wished to destroy their ancient promises, and swept the clouds from his face.'
    ),
    sent(
      'Ovid-3-7',
      [
        'cunctis',
        'delenda',
        'videtur',
        'gens',
        'hominum;',
        'damna',
        'luit',
        'mundoque',
        'parans',
        'novas',
      ],
      'The human race seemed destined for destruction; the world suffered loss, and new'
    ),
    sent(
      'Ovid-3-8',
      ['gentes', 'animalia', 'nostris', 'praeferre', 'destinavit.'],
      'creatures and animals were meant to surpass our race.'
    ),
    sent(
      'Ovid-3-9',
      ['sed', 'prius', 'antiqui', 'iusto', 'vincere', 'potestas', 'tempore', 'dabatur,'],
      'But first, power was given to them beyond their deserts of old time,'
    ),
    sent(
      'Ovid-3-10',
      ['et', 'mortalia', 'longum', 'aevum', 'caelum', 'et', 'terra', 'ac', 'mortales', 'paene'],
      'and mortality gained a long age; heaven and earth and mortals nearly'
    ),
    sent(
      'Ovid-3-11',
      ['dum', 'expers', 'Neptunus', 'alasque', 'rotas', 'agitur', 'tenebrosas', 'audet'],
      'while Neptune himself dares to stir the dark wheels of heaven,'
    ),
    sent(
      'Ovid-3-12',
      ['mortales', 'dum', 'dii', 'qui', 'mortalia', 'cernunt', 'iam', 'non', 'vultis', 'amare'],
      'mortals, while gods who perceive mortal things no longer wish to love'
    ),
  ],
};

export const OVID_METAMORPHOSES_4: TextSection = {
  id: 'Ovid-Met-4',
  textId: 'Ovid-Metamorphoses-1',
  sequence: 4,
  label: "Metamorphoses Book 1.75–100 — Lycaon's Impiety and Divine Judgment",
  sentences: [
    sent(
      'Ovid-4-1',
      [
        'temptat',
        'Iuppiter',
        'an',
        'merito',
        'scelus',
        'omne',
        'periret;',
        'scintillante',
        'malo',
        'solum',
        'tempore',
      ],
      'Jupiter tested whether wickedness worthy of death would perish; in that glittering moment alone'
    ),
    sent(
      'Ovid-4-2',
      [
        'non',
        'est',
        'credendum',
        'manere',
        'terra,',
        'qui',
        'mortales',
        'scelere',
        'plena',
        'dixisti;',
      ],
      'is it not to be believed that the earth would remain when you said mortals full of sin exist,'
    ),
    sent(
      'Ovid-4-3',
      [
        'sed',
        'cum',
        'Lycaon',
        'superus',
        'fuit',
        'Arcadia',
        'in',
        'regi,',
        'cuius',
        'ab',
        'ore',
        'fluxerunt',
      ],
      'but when Lycaon was the king of highland Arcadia, from whose mouth flowed'
    ),
    sent(
      'Ovid-4-4',
      [
        'mille',
        'mali,',
        'quotiens',
        'hostis',
        'venerat',
        'tempore',
        'longo',
        'in',
        'deum',
        'regnum',
        'atrocis',
      ],
      'a thousand evils, whenever an enemy came from far away into the kingdom of the cruel god,'
    ),
    sent(
      'Ovid-4-5',
      [
        'ille',
        'dum',
        'se',
        'moverat',
        'mortalis',
        'iamque',
        'erat',
        'Iuppiter',
        'veniens',
        'et',
        'caelum',
      ],
      'he, while he moved as a mortal, and now Jupiter was coming, and heaven'
    ),
    sent(
      'Ovid-4-6',
      [
        'mittebat',
        'signum',
        'coeli',
        'mortales',
        'venerantes;',
        'sed',
        'Lycaon',
        'illum',
        'negaturus',
      ],
      'sent a sign that mortals should worship; but Lycaon, about to deny him,'
    ),
    sent(
      'Ovid-4-7',
      [
        'esse',
        'deum',
        'scelestus,',
        'testes',
        'et',
        'infulgentem',
        'tenebris',
        'noctis',
        'animum',
        'cepit.',
      ],
      'that he was a god, wickedly seized the night and its darkness with a bold heart.'
    ),
    sent(
      'Ovid-4-8',
      [
        'temptat',
        'mortales',
        'dare',
        'preda',
        'sua',
        'mensa;',
        'mortales',
        'parte',
        'suam',
        'visus',
        'hosti',
      ],
      'He attempted to give a dead man as food upon his table; mortals as part of their own looked upon the enemy'
    ),
    sent(
      'Ovid-4-9',
      [
        'cum',
        'caecus',
        'Iuppiter',
        'mensam',
        'vidit',
        'indignam,',
        'sublevit',
        'ima',
        'mensa',
        'ferre',
        'dolorem',
      ],
      'when blind Jupiter saw the unworthy table, he raised it, unable to bear the pain below,'
    ),
    sent(
      'Ovid-4-10',
      [
        'ardor',
        'ab',
        'adhibito',
        'flamma',
        'focique',
        'taberno',
        'potentia',
        'caelum',
        'viridis',
        'asseruit.',
      ],
      'the burning flame applied and hearth power assured the green heaven.'
    ),
    sent(
      'Ovid-4-11',
      [
        'mortalis',
        'in',
        'ipse',
        'malum',
        'versus',
        'est',
        'Lycaon',
        'et',
        'furorem',
        'capillus',
        'iamque',
      ],
      'Lycaon himself was turned into evil and madness seized his hair now'
    ),
    sent(
      'Ovid-4-12',
      [
        'tendens',
        'in',
        'lupum',
        'vertit',
        'suos',
        'manus',
        'Iuppiter',
        'et',
        'lupi',
        'ille',
        'volens',
        'non',
        'vult',
      ],
      'stretching into a wolf Jupiter turned his hands, and the wolf willing unwills,'
    ),
  ],
};
