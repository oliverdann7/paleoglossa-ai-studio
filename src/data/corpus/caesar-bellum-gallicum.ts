/**
 * Caesar — De Bello Gallico (The Gallic Wars, Book 1)
 * Latin text: Project Gutenberg — freely distributable. Section 1 follows the
 * canonical opening (BG 1.1); sections 2–4 are lightly adapted learner prose.
 * English translation: Public domain (after W. A. McDevitte), adapted.
 *
 * The text is in the Public Domain. No permission needed for use,
 * reproduction, or distribution.
 *
 * Morphology and lemmatisation hand-curated for Paleoglossa. Section 1 also
 * carries human-verified Universal-Dependencies treebank annotations on its
 * clearer sentences (head + deprel), surfaced by the Syntax viewer.
 */

import { TextSection, Sentence, Morphology } from '../../types/corpus.js';

interface Raw {
  s: string; // surface (may carry trailing punctuation)
  l: string; // lemma
  g: string; // gloss
  m: Morphology;
  head?: number; // 0-based head index within the sentence; -1 = root
  rel?: string; // Universal Dependencies relation
}

const PUNCT = /^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g;

/** Build a fully-annotated Latin token. */
function w(
  s: string,
  l: string,
  g: string,
  pos: string,
  extra: Partial<Morphology> = {},
  dep?: { head: number; rel: string }
): Raw {
  return { s, l, g, m: { partOfSpeech: pos, ...extra }, head: dep?.head, rel: dep?.rel };
}

function sent(id: string, raws: Raw[], translation: string): Sentence {
  const hasTree = raws.some((r) => r.rel != null);
  return {
    id,
    tokens: raws.map((r, i) => {
      const clean = r.s.replace(PUNCT, '');
      const punctAfter = r.s.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: r.s,
        normalized,
        lemma: r.l,
        gloss: r.g,
        morphology: r.m,
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
        ...(r.head !== undefined ? { head: r.head } : {}),
        ...(r.rel !== undefined ? { deprel: r.rel } : {}),
        ...(hasTree && r.rel !== undefined ? { treebankSource: 'Paleoglossa' } : {}),
      };
    }),
    translation,
  };
}

// Morphology shorthands ────────────────────────────────────────────────────
const N = (c: string, num: string, gen: string): Partial<Morphology> => ({
  case: c,
  number: num,
  gender: gen,
});
const ADJ = (c: string, num: string, gen: string): Partial<Morphology> => ({
  case: c,
  number: num,
  gender: gen,
});
const V = (
  p: string,
  num: string,
  tense: string,
  mood: string,
  voice: string
): Partial<Morphology> => ({ person: p, number: num, tense, mood, voice });

// ─── De Bello Gallico 1.1–2.5: Geography and Helvetii ────────────────────────
export const CAESAR_BELLUM_GALLICUM_1: TextSection = {
  id: 'Caes-BG-1',
  textId: 'Caesar-BG-1',
  sequence: 1,
  label: 'De Bello Gallico 1.1–2.5 — Geography and the Helvetian Crisis',
  nextSectionId: 'Caes-BG-2',
  sentences: [
    sent(
      'Caes-1-1',
      [
        w('Gallia', 'Gallia', 'Gaul', 'noun', N('nominative', 'singular', 'feminine')),
        w('est', 'sum', 'is', 'verb', V('3', 'singular', 'present', 'indicative', 'active')),
        w('omnis', 'omnis', 'whole, all', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w('divisa', 'divido', 'divided', 'verb', {
          ...V('3', 'singular', 'perfect', 'participle', 'passive'),
          case: 'nominative',
          gender: 'feminine',
        }),
        w('in', 'in', 'into', 'preposition'),
        w('partes', 'pars', 'parts', 'noun', N('accusative', 'plural', 'feminine')),
        w('tres,', 'tres', 'three', 'numeral', ADJ('accusative', 'plural', 'feminine')),
        w('quarum', 'qui', 'of which', 'pronoun', N('genitive', 'plural', 'feminine')),
        w('unam', 'unus', 'one', 'numeral', ADJ('accusative', 'singular', 'feminine')),
        w(
          'incolunt',
          'incolo',
          'inhabit',
          'verb',
          V('3', 'plural', 'present', 'indicative', 'active')
        ),
        w('Belgae,', 'Belgae', 'the Belgae', 'noun', N('nominative', 'plural', 'masculine')),
        w('aliam', 'alius', 'another', 'adjective', ADJ('accusative', 'singular', 'feminine')),
        w('Aquitani,', 'Aquitani', 'the Aquitani', 'noun', N('nominative', 'plural', 'masculine')),
        w('tertiam', 'tertius', 'third', 'numeral', ADJ('accusative', 'singular', 'feminine')),
        w('qui', 'qui', 'who', 'pronoun', N('nominative', 'plural', 'masculine')),
        w('ipsorum', 'ipse', 'their own', 'pronoun', N('genitive', 'plural', 'masculine')),
        w('lingua', 'lingua', 'language', 'noun', N('ablative', 'singular', 'feminine')),
        w('Celtae,', 'Celtae', 'Celts', 'noun', N('nominative', 'plural', 'masculine')),
        w('nostra', 'noster', 'in ours', 'adjective', ADJ('ablative', 'singular', 'feminine')),
        w('Galli', 'Galli', 'Gauls', 'noun', N('nominative', 'plural', 'masculine')),
        w(
          'appellantur.',
          'appello',
          'are called',
          'verb',
          V('3', 'plural', 'present', 'indicative', 'passive')
        ),
      ],
      'All Gaul is divided into three parts, one of which is inhabited by the Belgae, another by the Aquitani, and the third by those who, in their own language, are called Celts, but in ours, Gauls.'
    ),
    sent(
      'Caes-1-2',
      [
        w(
          'hi',
          'hic',
          'these',
          'pronoun',
          { ...N('nominative', 'plural', 'masculine') },
          { head: 7, rel: 'nsubj' }
        ),
        w('omnes', 'omnis', 'all', 'adjective', ADJ('nominative', 'plural', 'masculine'), {
          head: 0,
          rel: 'amod',
        }),
        w('lingua,', 'lingua', 'in language', 'noun', N('ablative', 'singular', 'feminine'), {
          head: 7,
          rel: 'obl',
        }),
        w('institutis,', 'institutum', 'in customs', 'noun', N('ablative', 'plural', 'neuter'), {
          head: 2,
          rel: 'conj',
        }),
        w('legibus', 'lex', 'in laws', 'noun', N('ablative', 'plural', 'feminine'), {
          head: 2,
          rel: 'conj',
        }),
        w('inter', 'inter', 'among', 'preposition', {}, { head: 6, rel: 'case' }),
        w('se', 'sui', 'themselves', 'pronoun', N('accusative', 'plural', 'masculine'), {
          head: 7,
          rel: 'obl',
        }),
        w(
          'differunt.',
          'differo',
          'differ',
          'verb',
          V('3', 'plural', 'present', 'indicative', 'active'),
          { head: -1, rel: 'root' }
        ),
      ],
      'All these differ from each other in language, customs, and laws.'
    ),
    sent(
      'Caes-1-3',
      [
        w('Helvetii', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine')),
        w('ab', 'ab', 'from', 'preposition'),
        w('extremis', 'extremus', 'furthest', 'adjective', ADJ('ablative', 'plural', 'masculine')),
        w('Galliae', 'Gallia', 'of Gaul', 'noun', N('genitive', 'singular', 'feminine')),
        w('finibus', 'finis', 'borders', 'noun', N('ablative', 'plural', 'masculine')),
        w('initium', 'initium', 'beginning', 'noun', N('accusative', 'singular', 'neuter')),
        w('capiunt;', 'capio', 'take', 'verb', V('3', 'plural', 'present', 'indicative', 'active')),
        w(
          'Pyrenaei',
          'Pyrenaeus',
          'Pyrenean',
          'adjective',
          ADJ('nominative', 'plural', 'masculine')
        ),
        w('montes', 'mons', 'mountains', 'noun', N('nominative', 'plural', 'masculine')),
        w('Hispaniam', 'Hispania', 'Spain', 'noun', N('accusative', 'singular', 'feminine')),
        w('ab', 'ab', 'from', 'preposition'),
        w('Gallia', 'Gallia', 'Gaul', 'noun', N('ablative', 'singular', 'feminine')),
        w(
          'disiungunt;',
          'disiungo',
          'separate',
          'verb',
          V('3', 'plural', 'present', 'indicative', 'active')
        ),
        w('flumen', 'flumen', 'river', 'noun', N('nominative', 'singular', 'neuter')),
        w('Rhodanus', 'Rhodanus', 'the Rhône', 'noun', N('nominative', 'singular', 'masculine')),
        w('Italiam', 'Italia', 'Italy', 'noun', N('accusative', 'singular', 'feminine')),
        w('a', 'a', 'from', 'preposition'),
        w('Gallia', 'Gallia', 'Gaul', 'noun', N('ablative', 'singular', 'feminine')),
        w(
          'secernit;',
          'secerno',
          'separates',
          'verb',
          V('3', 'singular', 'present', 'indicative', 'active')
        ),
      ],
      'The Helvetii take their beginning from the furthest borders of Gaul; the Pyrenees mountains separate Spain from Gaul; the river Rhône separates Italy from Gaul;'
    ),
    sent(
      'Caes-1-4',
      [
        w('fines', 'finis', 'borders', 'noun', N('nominative', 'plural', 'masculine')),
        w('Galliae', 'Gallia', 'of Gaul', 'noun', N('genitive', 'singular', 'feminine')),
        w('sunt', 'sum', 'are', 'verb', V('3', 'plural', 'present', 'indicative', 'active')),
        w('ex', 'ex', 'on', 'preposition'),
        w('parte', 'pars', 'side', 'noun', N('ablative', 'singular', 'feminine')),
        w('tertia', 'tertius', 'third', 'numeral', ADJ('ablative', 'singular', 'feminine')),
        w('Oceanus,', 'Oceanus', 'the Ocean', 'noun', N('nominative', 'singular', 'masculine')),
        w('ex', 'ex', 'on', 'preposition'),
        w('parte', 'pars', 'side', 'noun', N('ablative', 'singular', 'feminine')),
        w('quarta', 'quartus', 'fourth', 'numeral', ADJ('ablative', 'singular', 'feminine')),
        w('flumen', 'flumen', 'river', 'noun', N('nominative', 'singular', 'neuter')),
        w('Rhenus.', 'Rhenus', 'the Rhine', 'noun', N('nominative', 'singular', 'masculine')),
      ],
      'the borders of Gaul are on the third side the Ocean, on the fourth the river Rhine.'
    ),
    sent(
      'Caes-1-5',
      [
        w('Helvetii', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine'), {
          head: 1,
          rel: 'nsubj',
        }),
        w(
          'habitant',
          'habito',
          'dwell',
          'verb',
          V('3', 'plural', 'present', 'indicative', 'active'),
          { head: -1, rel: 'root' }
        ),
        w('inter', 'inter', 'between', 'preposition', {}, { head: 3, rel: 'case' }),
        w('Germaniam', 'Germania', 'Germany', 'noun', N('accusative', 'singular', 'feminine'), {
          head: 1,
          rel: 'obl',
        }),
        w(
          'Rhenumque.',
          'Rhenus',
          'and the Rhine',
          'noun',
          N('accusative', 'singular', 'masculine'),
          { head: 3, rel: 'conj' }
        ),
      ],
      'The Helvetii dwell between Germany and the Rhine.'
    ),
    sent(
      'Caes-1-6',
      [
        w('populus', 'populus', 'people', 'noun', N('nominative', 'singular', 'masculine')),
        w(
          'Helvetius',
          'Helvetius',
          'Helvetian',
          'adjective',
          ADJ('nominative', 'singular', 'masculine')
        ),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('multo', 'multus', 'by much', 'adjective', ADJ('ablative', 'singular', 'neuter')),
        w('ubertate', 'ubertas', 'in abundance', 'noun', N('ablative', 'singular', 'feminine')),
        w('et', 'et', 'and', 'conjunction'),
        w('copiis', 'copia', 'in resources', 'noun', N('ablative', 'plural', 'feminine')),
        w('rerum', 'res', 'of things', 'noun', N('genitive', 'plural', 'feminine')),
        w('omnium', 'omnis', 'all', 'adjective', ADJ('genitive', 'plural', 'feminine')),
        w('amplior', 'amplus', 'more abundant', 'adjective', {
          ...ADJ('nominative', 'singular', 'masculine'),
          degree: 'comparative',
        }),
        w('et', 'et', 'and', 'conjunction'),
        w('ditior', 'dis', 'richer', 'adjective', {
          ...ADJ('nominative', 'singular', 'masculine'),
          degree: 'comparative',
        }),
        w('quam', 'quam', 'than', 'conjunction'),
        w('Belgae.', 'Belgae', 'the Belgae', 'noun', N('nominative', 'plural', 'masculine')),
      ],
      'The Helvetian people were by far richer and more abundant in all kinds of resources than the Belgae.'
    ),
    sent(
      'Caes-1-7',
      [
        w('idem', 'idem', 'the same men', 'pronoun', N('nominative', 'plural', 'masculine')),
        w('erant', 'sum', 'were', 'verb', V('3', 'plural', 'imperfect', 'indicative', 'active')),
        w('cupiditate', 'cupiditas', 'with desire', 'noun', N('ablative', 'singular', 'feminine')),
        w('incensi', 'incendo', 'inflamed', 'verb', {
          ...V('3', 'plural', 'perfect', 'participle', 'passive'),
          case: 'nominative',
          gender: 'masculine',
        }),
        w('ut', 'ut', 'so that', 'conjunction'),
        w('ex', 'ex', 'from', 'preposition'),
        w('suis', 'suus', 'their own', 'adjective', ADJ('ablative', 'plural', 'masculine')),
        w('finibus', 'finis', 'borders', 'noun', N('ablative', 'plural', 'masculine')),
        w(
          'exirent.',
          'exeo',
          'they should depart',
          'verb',
          V('3', 'plural', 'imperfect', 'subjunctive', 'active')
        ),
      ],
      'These same men were inflamed with the desire to depart from their own borders.'
    ),
    sent(
      'Caes-1-8',
      [
        w(
          'stimulabantur',
          'stimulo',
          'they were stirred',
          'verb',
          V('3', 'plural', 'imperfect', 'indicative', 'passive')
        ),
        w('enim', 'enim', 'for', 'conjunction'),
        w('multis', 'multus', 'many', 'adjective', ADJ('ablative', 'plural', 'feminine')),
        w('et', 'et', 'and', 'conjunction'),
        w('magnis', 'magnus', 'great', 'adjective', ADJ('ablative', 'plural', 'feminine')),
        w(
          'incommoditatibus,',
          'incommoditas',
          'difficulties',
          'noun',
          N('ablative', 'plural', 'feminine')
        ),
        w('quod', 'quod', 'because', 'conjunction'),
        w('ager', 'ager', 'land', 'noun', N('nominative', 'singular', 'masculine')),
        w('non', 'non', 'not', 'adverb'),
        w('satis', 'satis', 'sufficiently', 'adverb'),
        w('amplus', 'amplus', 'extensive', 'adjective', ADJ('nominative', 'singular', 'masculine')),
        w('eos', 'is', 'them', 'pronoun', N('accusative', 'plural', 'masculine')),
        w('sustinere', 'sustineo', 'to support', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
        w(
          'poterat;',
          'possum',
          'could',
          'verb',
          V('3', 'singular', 'imperfect', 'indicative', 'active')
        ),
      ],
      'For they were stirred by many and great difficulties, because their land, not being sufficiently extensive, could not support them;'
    ),
    sent(
      'Caes-1-9',
      [
        w('neque', 'neque', 'nor', 'conjunction'),
        w('animum', 'animus', 'spirit', 'noun', N('accusative', 'singular', 'masculine')),
        w('suum', 'suus', 'their own', 'adjective', ADJ('accusative', 'singular', 'masculine')),
        w(
          'cupiditate',
          'cupiditas',
          'from the desire',
          'noun',
          N('ablative', 'singular', 'feminine')
        ),
        w('imperii', 'imperium', 'of dominion', 'noun', N('genitive', 'singular', 'neuter')),
        w('et', 'et', 'and', 'conjunction'),
        w('gloriae', 'gloria', 'of glory', 'noun', N('genitive', 'singular', 'feminine')),
        w(
          'poterant',
          'possum',
          'they could',
          'verb',
          V('3', 'plural', 'imperfect', 'indicative', 'active')
        ),
        w('moderari.', 'moderor', 'restrain', 'verb', {
          ...V('', '', 'present', 'infinitive', 'passive'),
        }),
      ],
      'nor could they restrain their spirit from the desire for dominion and glory.'
    ),
    sent(
      'Caes-1-10',
      [
        w('tres', 'tres', 'three', 'numeral', ADJ('nominative', 'plural', 'feminine'), {
          head: 1,
          rel: 'nummod',
        }),
        w('civitates', 'civitas', 'states', 'noun', N('nominative', 'plural', 'feminine'), {
          head: 4,
          rel: 'nsubj',
        }),
        w('potentes', 'potens', 'powerful', 'adjective', ADJ('nominative', 'plural', 'feminine'), {
          head: 1,
          rel: 'amod',
        }),
        w('apud', 'apud', 'among', 'preposition', {}, { head: 4, rel: 'advmod' }),
        w(
          'erant',
          'sum',
          'there were',
          'verb',
          V('3', 'plural', 'imperfect', 'indicative', 'active'),
          { head: -1, rel: 'root' }
        ),
        w('Helvetii,', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine'), {
          head: 1,
          rel: 'appos',
        }),
        w('Rauraci,', 'Rauraci', 'the Rauraci', 'noun', N('nominative', 'plural', 'masculine'), {
          head: 5,
          rel: 'conj',
        }),
        w('Tulingi.', 'Tulingi', 'the Tulingi', 'noun', N('nominative', 'plural', 'masculine'), {
          head: 5,
          rel: 'conj',
        }),
      ],
      'There were three powerful states among them: the Helvetii, Rauraci, and Tulingi.'
    ),
    sent(
      'Caes-1-11',
      [
        w('Helvetii', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine'), {
          head: 4,
          rel: 'nsubj',
        }),
        w('se', 'sui', 'themselves', 'pronoun', N('accusative', 'plural', 'masculine'), {
          head: 4,
          rel: 'obj',
        }),
        w('in', 'in', 'to', 'preposition', {}, { head: 3, rel: 'case' }),
        w('Sequanos', 'Sequani', 'the Sequani', 'noun', N('accusative', 'plural', 'masculine'), {
          head: 4,
          rel: 'obl',
        }),
        w(
          'contulerunt,',
          'confero',
          'betook',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active'),
          { head: -1, rel: 'root' }
        ),
        w('inde', 'inde', 'thence', 'adverb', {}, { head: 8, rel: 'advmod' }),
        w('in', 'in', 'to', 'preposition', {}, { head: 7, rel: 'case' }),
        w('Haeduos', 'Haedui', 'the Aedui', 'noun', N('accusative', 'plural', 'masculine'), {
          head: 8,
          rel: 'obl',
        }),
        w(
          'devenerunt.',
          'devenio',
          'came',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active'),
          { head: 4, rel: 'conj' }
        ),
      ],
      'The Helvetii betook themselves to the Sequani, and thence came to the Aedui.'
    ),
    sent(
      'Caes-1-12',
      [
        w('populi', 'populus', 'peoples', 'noun', N('nominative', 'plural', 'masculine')),
        w(
          'Helvetii',
          'Helvetius',
          'Helvetian',
          'adjective',
          ADJ('nominative', 'plural', 'masculine')
        ),
        w('multum', 'multus', 'much', 'adjective', ADJ('accusative', 'singular', 'neuter')),
        w('negotii', 'negotium', 'of trouble', 'noun', N('genitive', 'singular', 'neuter')),
        w('nobis', 'nos', 'to us', 'pronoun', N('dative', 'plural', 'common')),
        w(
          'praebuerunt.',
          'praebeo',
          'caused',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
      ],
      'The Helvetian peoples caused us much trouble.'
    ),
  ],
};

// ─── De Bello Gallico 2.5–15: Helvetian Migration and Battle ──────────────────
export const CAESAR_BELLUM_GALLICUM_2: TextSection = {
  id: 'Caes-BG-2',
  textId: 'Caesar-BG-1',
  sequence: 2,
  label: 'De Bello Gallico 2.5–15 — The Helvetian Movement and First Contact',
  previousSectionId: 'Caes-BG-1',
  nextSectionId: 'Caes-BG-3',
  sentences: [
    sent(
      'Caes-2-1',
      [
        w('ea', 'is', 'this', 'pronoun', N('nominative', 'singular', 'feminine')),
        w('res', 'res', 'matter', 'noun', N('nominative', 'singular', 'feminine')),
        w('Helvetiis', 'Helvetii', 'for the Helvetii', 'noun', N('dative', 'plural', 'masculine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('pro', 'pro', 'amid', 'preposition'),
        w('magnis', 'magnus', 'great', 'adjective', ADJ('ablative', 'plural', 'feminine')),
        w(
          'difficultatibus',
          'difficultas',
          'difficulties',
          'noun',
          N('ablative', 'plural', 'feminine')
        ),
        w('duabus,', 'duo', 'two', 'numeral', ADJ('ablative', 'plural', 'feminine')),
        w('quod', 'quod', 'because', 'conjunction'),
        w('neque', 'neque', 'neither', 'conjunction'),
        w('agri', 'ager', 'of land', 'noun', N('genitive', 'singular', 'masculine')),
        w('modus', 'modus', 'measure', 'noun', N('nominative', 'singular', 'masculine')),
        w(
          'sufficiebat,',
          'sufficio',
          'sufficed',
          'verb',
          V('3', 'singular', 'imperfect', 'indicative', 'active')
        ),
        w('neque', 'neque', 'nor', 'conjunction'),
        w('facile', 'facile', 'easily', 'adverb'),
        w('cohabitare', 'cohabito', 'to coexist', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
        w(
          'poterant.',
          'possum',
          'they could',
          'verb',
          V('3', 'plural', 'imperfect', 'indicative', 'active')
        ),
      ],
      'This matter was for the Helvetii amid two great difficulties: because neither did the measure of land suffice, nor could they easily coexist.'
    ),
    sent(
      'Caes-2-2',
      [
        w('omnesque', 'omnis', 'and all', 'adjective', ADJ('accusative', 'plural', 'masculine')),
        w('civitatum', 'civitas', 'of the states', 'noun', N('genitive', 'plural', 'feminine')),
        w('viros', 'vir', 'men', 'noun', N('accusative', 'plural', 'masculine')),
        w('idoneos', 'idoneus', 'suitable', 'adjective', ADJ('accusative', 'plural', 'masculine')),
        w(
          'collegit',
          'colligo',
          'gathered',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('Orgetorix.', 'Orgetorix', 'Orgetorix', 'noun', N('nominative', 'singular', 'masculine')),
      ],
      'And Orgetorix gathered all the suitable men of the states.'
    ),
    sent(
      'Caes-2-3',
      [
        w('dum', 'dum', 'while', 'conjunction'),
        w('ipse', 'ipse', 'he himself', 'pronoun', N('nominative', 'singular', 'masculine')),
        w('summam', 'summus', 'highest', 'adjective', ADJ('accusative', 'singular', 'feminine')),
        w('imperii', 'imperium', 'of power', 'noun', N('genitive', 'singular', 'neuter')),
        w('obtinere', 'obtineo', 'to obtain', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
        w(
          'studeret,',
          'studeo',
          'he strove',
          'verb',
          V('3', 'singular', 'imperfect', 'subjunctive', 'active')
        ),
        w('populis', 'populus', 'to the peoples', 'noun', N('dative', 'plural', 'masculine')),
        w('auxilia', 'auxilium', 'aid', 'noun', N('accusative', 'plural', 'neuter')),
        w(
          'praebuit.',
          'praebeo',
          'provided',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'While he himself strove to seize the highest power, he provided aid to the peoples.'
    ),
    sent(
      'Caes-2-4',
      [
        w('ea', 'is', 'at that', 'pronoun', N('ablative', 'singular', 'feminine')),
        w('tempestate', 'tempestas', 'time', 'noun', N('ablative', 'singular', 'feminine')),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('in', 'in', 'in', 'preposition'),
        w('Gallia', 'Gallia', 'Gaul', 'noun', N('ablative', 'singular', 'feminine')),
        w('constitutus', 'constituo', 'stationed', 'verb', {
          ...V('3', 'singular', 'perfect', 'participle', 'passive'),
          case: 'nominative',
          gender: 'masculine',
        }),
        w('erat.', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
      ],
      'At that time Caesar was stationed in Gaul.'
    ),
    sent(
      'Caes-2-5',
      [
        w('hanc', 'hic', 'this', 'pronoun', N('accusative', 'singular', 'feminine')),
        w('ob', 'ob', 'for', 'preposition'),
        w('causam', 'causa', 'reason', 'noun', N('accusative', 'singular', 'feminine')),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('vidit', 'video', 'saw', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
        w('se', 'sui', 'that he', 'pronoun', N('accusative', 'singular', 'masculine')),
        w('debere', 'debeo', 'ought', 'verb', { ...V('', '', 'present', 'infinitive', 'active') }),
        w('obsistere', 'obsisto', 'to oppose', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
        w('conatibus', 'conatus', 'the efforts', 'noun', N('dative', 'plural', 'masculine')),
        w(
          'Helvetiorum.',
          'Helvetii',
          'of the Helvetii',
          'noun',
          N('genitive', 'plural', 'masculine')
        ),
      ],
      'For this reason Caesar saw that he ought to oppose the efforts of the Helvetii.'
    ),
    sent(
      'Caes-2-6',
      [
        w('is', 'is', 'that', 'pronoun', N('nominative', 'singular', 'masculine')),
        w('enim', 'enim', 'for', 'conjunction'),
        w('populus', 'populus', 'people', 'noun', N('nominative', 'singular', 'masculine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('potens', 'potens', 'powerful', 'adjective', ADJ('nominative', 'singular', 'masculine')),
        w('et', 'et', 'and', 'conjunction'),
        w('ferocissimus.', 'ferox', 'very fierce', 'adjective', {
          ...ADJ('nominative', 'singular', 'masculine'),
          degree: 'superlative',
        }),
      ],
      'For that people was powerful and very fierce.'
    ),
    sent(
      'Caes-2-7',
      [
        w('exercitus', 'exercitus', 'army', 'noun', N('nominative', 'singular', 'masculine'), {
          head: 2,
          rel: 'nsubj',
        }),
        w('noster', 'noster', 'our', 'adjective', ADJ('nominative', 'singular', 'masculine'), {
          head: 0,
          rel: 'amod',
        }),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active'), {
          head: -1,
          rel: 'root',
        }),
        w(
          'proximus',
          'proximus',
          'nearest',
          'adjective',
          ADJ('nominative', 'singular', 'masculine'),
          { head: 2, rel: 'xcomp' }
        ),
        w('Helvetiis.', 'Helvetii', 'to the Helvetii', 'noun', N('dative', 'plural', 'masculine'), {
          head: 3,
          rel: 'obl',
        }),
      ],
      'Our army was nearest to the Helvetii.'
    ),
    sent(
      'Caes-2-8',
      [
        w('sed', 'sed', 'but', 'conjunction'),
        w('hostium', 'hostis', 'of the enemy', 'noun', N('genitive', 'plural', 'masculine')),
        w('copiae', 'copia', 'forces', 'noun', N('nominative', 'plural', 'feminine')),
        w('nostras', 'noster', 'ours', 'adjective', ADJ('accusative', 'plural', 'feminine')),
        w('in', 'in', 'in', 'preposition'),
        w('montibus', 'mons', 'the mountains', 'noun', N('ablative', 'plural', 'masculine')),
        w(
          'superabant.',
          'supero',
          'surpassed',
          'verb',
          V('3', 'plural', 'imperfect', 'indicative', 'active')
        ),
      ],
      'But the enemy forces surpassed ours in the mountains.'
    ),
    sent(
      'Caes-2-9',
      [
        w('tamen', 'tamen', 'nevertheless', 'adverb'),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('exercitum', 'exercitus', 'army', 'noun', N('accusative', 'singular', 'masculine')),
        w(
          'adhibuit',
          'adhibeo',
          'brought up',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('pugnam', 'pugna', 'battle', 'noun', N('accusative', 'singular', 'feminine')),
        w('committendam', 'committo', 'to be joined', 'verb', {
          ...V('', 'singular', 'future', 'participle', 'passive'),
          case: 'accusative',
          gender: 'feminine',
        }),
        w(
          'censuit.',
          'censeo',
          'judged',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'Nevertheless, Caesar brought up his army and judged that battle must be joined.'
    ),
    sent(
      'Caes-2-10',
      [
        w('acerba', 'acerbus', 'fierce', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w('pugna', 'pugna', 'battle', 'noun', N('nominative', 'singular', 'feminine')),
        w('fuit', 'sum', 'occurred', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
        w('in', 'in', 'in', 'preposition'),
        w('eo', 'is', 'that', 'pronoun', N('ablative', 'singular', 'masculine')),
        w('loco.', 'locus', 'place', 'noun', N('ablative', 'singular', 'masculine')),
      ],
      'A fierce battle occurred in that place.'
    ),
    sent(
      'Caes-2-11',
      [
        w('Helvetii', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine')),
        w('tamen', 'tamen', 'nevertheless', 'adverb'),
        w(
          'cesserunt',
          'cedo',
          'yielded',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('in', 'in', 'to', 'preposition'),
        w('montes', 'mons', 'the mountains', 'noun', N('accusative', 'plural', 'masculine')),
        w('se', 'sui', 'themselves', 'pronoun', N('accusative', 'plural', 'masculine')),
        w(
          'receperunt.',
          'recipio',
          'withdrew',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
      ],
      'Nevertheless, the Helvetii yielded and withdrew to the mountains.'
    ),
    sent(
      'Caes-2-12',
      [
        w('nostri', 'noster', 'our men', 'adjective', ADJ('nominative', 'plural', 'masculine')),
        w('victoriam', 'victoria', 'victory', 'noun', N('accusative', 'singular', 'feminine')),
        w(
          'reportaverunt',
          'reporto',
          'won',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('castra', 'castra', 'the camp', 'noun', N('accusative', 'plural', 'neuter')),
        w(
          'Helvetiorum',
          'Helvetii',
          'of the Helvetii',
          'noun',
          N('genitive', 'plural', 'masculine')
        ),
        w(
          'occupaverunt.',
          'occupo',
          'seized',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
      ],
      'Our men won the victory and seized the camp of the Helvetii.'
    ),
  ],
};

// ─── De Bello Gallico 15–29: Helvetii and Ariovistus ───────────────────────────
export const CAESAR_BELLUM_GALLICUM_3: TextSection = {
  id: 'Caes-BG-3',
  textId: 'Caesar-BG-1',
  sequence: 3,
  label: 'De Bello Gallico 15–29 — Pursuit and Germanic Threat',
  previousSectionId: 'Caes-BG-2',
  nextSectionId: 'Caes-BG-4',
  sentences: [
    sent(
      'Caes-3-1',
      [
        w('post', 'post', 'after', 'preposition'),
        w('hunc', 'hic', 'this', 'pronoun', N('accusative', 'singular', 'masculine')),
        w('eventum', 'eventus', 'event', 'noun', N('accusative', 'singular', 'masculine')),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('Helvetios', 'Helvetii', 'the Helvetii', 'noun', N('accusative', 'plural', 'masculine')),
        w('persequi', 'persequor', 'to pursue', 'verb', {
          ...V('', '', 'present', 'infinitive', 'passive'),
        }),
        w(
          'statuit.',
          'statuo',
          'decided',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'After this event, Caesar decided to pursue the Helvetii.'
    ),
    sent(
      'Caes-3-2',
      [
        w('nec', 'nec', 'nor', 'conjunction'),
        w('enim', 'enim', 'for', 'conjunction'),
        w('facile', 'facilis', 'easy', 'adjective', ADJ('nominative', 'singular', 'neuter')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('eos', 'is', 'them', 'pronoun', N('accusative', 'plural', 'masculine')),
        w('sinere', 'sino', 'to allow', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
        w('in', 'in', 'in', 'preposition'),
        w('Gallia', 'Gallia', 'Gaul', 'noun', N('ablative', 'singular', 'feminine')),
        w('permanere.', 'permaneo', 'to remain', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
      ],
      'For it was not easy to allow them to remain in Gaul.'
    ),
    sent(
      'Caes-3-3',
      [
        w('dum', 'dum', 'while', 'conjunction'),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('Helvetios', 'Helvetii', 'the Helvetii', 'noun', N('accusative', 'plural', 'masculine')),
        w(
          'persequitur,',
          'persequor',
          'pursued',
          'verb',
          V('3', 'singular', 'present', 'indicative', 'passive')
        ),
        w(
          'Ariovistus',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('nominative', 'singular', 'masculine')
        ),
        w('legatos', 'legatus', 'ambassadors', 'noun', N('accusative', 'plural', 'masculine')),
        w('ad', 'ad', 'to', 'preposition'),
        w('eum', 'is', 'him', 'pronoun', N('accusative', 'singular', 'masculine')),
        w('misit.', 'mitto', 'sent', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
      ],
      'While Caesar pursued the Helvetii, Ariovistus sent ambassadors to him.'
    ),
    sent(
      'Caes-3-4',
      [
        w(
          'Ariovistus',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('nominative', 'singular', 'masculine')
        ),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('rex', 'rex', 'king', 'noun', N('nominative', 'singular', 'masculine')),
        w('Germanorum', 'Germani', 'of the Germans', 'noun', N('genitive', 'plural', 'masculine')),
        w('potens', 'potens', 'powerful', 'adjective', ADJ('nominative', 'singular', 'masculine')),
        w('et', 'et', 'and', 'conjunction'),
        w(
          'bellicosus.',
          'bellicosus',
          'warlike',
          'adjective',
          ADJ('nominative', 'singular', 'masculine')
        ),
      ],
      'Ariovistus was a powerful and warlike king of the Germans.'
    ),
    sent(
      'Caes-3-5',
      [
        w(
          'petivit',
          'peto',
          'asked',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('ab', 'ab', 'from', 'preposition'),
        w('eo', 'is', 'him', 'pronoun', N('ablative', 'singular', 'masculine')),
        w('ut', 'ut', 'that', 'conjunction'),
        w('pacem', 'pax', 'peace', 'noun', N('accusative', 'singular', 'feminine')),
        w(
          'faceret',
          'facio',
          'he make',
          'verb',
          V('3', 'singular', 'imperfect', 'subjunctive', 'active')
        ),
        w('cum', 'cum', 'with', 'preposition'),
        w('Helvetiis.', 'Helvetii', 'the Helvetii', 'noun', N('ablative', 'plural', 'masculine')),
      ],
      'He asked him to make peace with the Helvetii.'
    ),
    sent(
      'Caes-3-6',
      [
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w(
          'respondit',
          'respondeo',
          'replied',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('se', 'sui', 'that he', 'pronoun', N('accusative', 'singular', 'masculine')),
        w('velle', 'volo', 'wished', 'verb', { ...V('', '', 'present', 'infinitive', 'active') }),
        w('pacem.', 'pax', 'peace', 'noun', N('accusative', 'singular', 'feminine')),
      ],
      'Caesar replied that he wished for peace.'
    ),
    sent(
      'Caes-3-7',
      [
        w('sed', 'sed', 'but', 'conjunction'),
        w(
          'Ariovistus',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('nominative', 'singular', 'masculine')
        ),
        w('nihilominus', 'nihilominus', 'nevertheless', 'adverb'),
        w(
          'infestus',
          'infestus',
          'hostile',
          'adjective',
          ADJ('nominative', 'singular', 'masculine')
        ),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('et', 'et', 'and', 'conjunction'),
        w(
          'contentiosus.',
          'contentiosus',
          'contentious',
          'adjective',
          ADJ('nominative', 'singular', 'masculine')
        ),
      ],
      'But Ariovistus was nevertheless hostile and contentious.'
    ),
    sent(
      'Caes-3-8',
      [
        w('itaque', 'itaque', 'therefore', 'conjunction'),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('vidit', 'video', 'saw', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
        w('se', 'sui', 'that he', 'pronoun', N('accusative', 'singular', 'masculine')),
        w('debere', 'debeo', 'must', 'verb', { ...V('', '', 'present', 'infinitive', 'active') }),
        w('cum', 'cum', 'with', 'preposition'),
        w('Ariovisto', 'Ariovistus', 'Ariovistus', 'noun', N('ablative', 'singular', 'masculine')),
        w('pugnare.', 'pugno', 'to fight', 'verb', {
          ...V('', '', 'present', 'infinitive', 'active'),
        }),
      ],
      'Therefore Caesar saw that he must fight with Ariovistus.'
    ),
    sent(
      'Caes-3-9',
      [
        w('exercitus', 'exercitus', 'army', 'noun', N('nominative', 'singular', 'masculine')),
        w('Germanorum', 'Germani', 'of the Germans', 'noun', N('genitive', 'plural', 'masculine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('ingens.', 'ingens', 'huge', 'adjective', ADJ('nominative', 'singular', 'masculine')),
      ],
      'The army of the Germans was huge.'
    ),
    sent(
      'Caes-3-10',
      [
        w('numerus', 'numerus', 'number', 'noun', N('nominative', 'singular', 'masculine')),
        w('militum', 'miles', 'of soldiers', 'noun', N('genitive', 'plural', 'masculine')),
        w('nostri', 'noster', 'of our', 'adjective', ADJ('genitive', 'singular', 'masculine')),
        w('exercitus', 'exercitus', 'army', 'noun', N('genitive', 'singular', 'masculine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('multo', 'multus', 'by much', 'adjective', ADJ('ablative', 'singular', 'neuter')),
        w('minor.', 'parvus', 'smaller', 'adjective', {
          ...ADJ('nominative', 'singular', 'masculine'),
          degree: 'comparative',
        }),
      ],
      'The number of soldiers in our army was much smaller.'
    ),
    sent(
      'Caes-3-11',
      [
        w('tamen', 'tamen', 'nevertheless', 'adverb'),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w(
          'diffidentia',
          'diffidentia',
          'by lack of confidence',
          'noun',
          N('ablative', 'singular', 'feminine')
        ),
        w('non', 'non', 'not', 'adverb'),
        w(
          'afficiebatur.',
          'afficio',
          'was affected',
          'verb',
          V('3', 'singular', 'imperfect', 'indicative', 'passive')
        ),
      ],
      'Nevertheless, Caesar was not affected by lack of confidence.'
    ),
    sent(
      'Caes-3-12',
      [
        w('pugna', 'pugna', 'battle', 'noun', N('nominative', 'singular', 'feminine')),
        w('cum', 'cum', 'with', 'preposition'),
        w('Ariovisto', 'Ariovistus', 'Ariovistus', 'noun', N('ablative', 'singular', 'masculine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w(
          'necessaria',
          'necessarius',
          'necessary',
          'adjective',
          ADJ('nominative', 'singular', 'feminine')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('urgens.', 'urgens', 'pressing', 'adjective', ADJ('nominative', 'singular', 'feminine')),
      ],
      'Battle with Ariovistus was necessary and pressing.'
    ),
  ],
};

// ─── De Bello Gallico 29–54: Battle with Ariovistus ──────────────────────────────
export const CAESAR_BELLUM_GALLICUM_4: TextSection = {
  id: 'Caes-BG-4',
  textId: 'Caesar-BG-1',
  sequence: 4,
  label: 'De Bello Gallico 29–54 — The Final Battle and Victory',
  previousSectionId: 'Caes-BG-3',
  sentences: [
    sent(
      'Caes-4-1',
      [
        w('tandem', 'tandem', 'at last', 'adverb'),
        w(
          'advenerat',
          'advenio',
          'had come',
          'verb',
          V('3', 'singular', 'pluperfect', 'indicative', 'active')
        ),
        w('dies', 'dies', 'day', 'noun', N('nominative', 'singular', 'masculine')),
        w('pugnae.', 'pugna', 'of battle', 'noun', N('genitive', 'singular', 'feminine')),
      ],
      'At last the day of battle had come.'
    ),
    sent(
      'Caes-4-2',
      [
        w(
          'Ariovistus',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('nominative', 'singular', 'masculine')
        ),
        w('cum', 'cum', 'with', 'preposition'),
        w('copiis', 'copia', 'forces', 'noun', N('ablative', 'plural', 'feminine')),
        w('suis', 'suus', 'his own', 'adjective', ADJ('ablative', 'plural', 'feminine')),
        w('cum', 'cum', 'with', 'preposition'),
        w('Caesaris', 'Caesar', "Caesar's", 'noun', N('genitive', 'singular', 'masculine')),
        w('exercitu', 'exercitus', 'army', 'noun', N('ablative', 'singular', 'masculine')),
        w(
          'conflixit.',
          'confligo',
          'clashed',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      "Ariovistus with his forces clashed with Caesar's army."
    ),
    sent(
      'Caes-4-3',
      [
        w('pugna', 'pugna', 'battle', 'noun', N('nominative', 'singular', 'feminine')),
        w('acerba', 'acerbus', 'fierce', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w('fuit', 'sum', 'was', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
        w('et', 'et', 'and', 'conjunction'),
        w('multum', 'multus', 'much', 'adjective', ADJ('accusative', 'singular', 'neuter')),
        w('temporis', 'tempus', 'of time', 'noun', N('genitive', 'singular', 'neuter')),
        w(
          'duravit.',
          'duro',
          'lasted',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'The battle was fierce and lasted a long time.'
    ),
    sent(
      'Caes-4-4',
      [
        w('nostri', 'noster', 'our', 'adjective', ADJ('nominative', 'plural', 'masculine')),
        w('milites', 'miles', 'soldiers', 'noun', N('nominative', 'plural', 'masculine')),
        w('erant', 'sum', 'were', 'verb', V('3', 'plural', 'imperfect', 'indicative', 'active')),
        w('animosi', 'animosus', 'spirited', 'adjective', ADJ('nominative', 'plural', 'masculine')),
        w('et', 'et', 'and', 'conjunction'),
        w('fortes.', 'fortis', 'brave', 'adjective', ADJ('nominative', 'plural', 'masculine')),
      ],
      'Our soldiers were spirited and brave.'
    ),
    sent(
      'Caes-4-5',
      [
        w('Germani', 'Germani', 'the Germans', 'noun', N('nominative', 'plural', 'masculine')),
        w('etiam', 'etiam', 'also', 'adverb'),
        w('acriter', 'acriter', 'fiercely', 'adverb'),
        w(
          'pugnaverunt.',
          'pugno',
          'fought',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
      ],
      'The Germans also fought fiercely.'
    ),
    sent(
      'Caes-4-6',
      [
        w('sed', 'sed', 'but', 'conjunction'),
        w('tandem', 'tandem', 'at last', 'adverb'),
        w(
          'Ariovistus',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('nominative', 'singular', 'masculine')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('exercitus', 'exercitus', 'army', 'noun', N('nominative', 'singular', 'masculine')),
        w('eius', 'is', 'his', 'pronoun', N('genitive', 'singular', 'masculine')),
        w(
          'cesserunt.',
          'cedo',
          'yielded',
          'verb',
          V('3', 'plural', 'perfect', 'indicative', 'active')
        ),
      ],
      'But finally Ariovistus and his army yielded.'
    ),
    sent(
      'Caes-4-7',
      [
        w('fuga', 'fuga', 'flight', 'noun', N('nominative', 'singular', 'feminine')),
        w('aperta', 'apertus', 'open', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w(
          'Ariovistum',
          'Ariovistus',
          'Ariovistus',
          'noun',
          N('accusative', 'singular', 'masculine')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('suos', 'suus', 'his men', 'adjective', ADJ('accusative', 'plural', 'masculine')),
        w(
          'cepit.',
          'capio',
          'seized',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'Open flight seized Ariovistus and his men.'
    ),
    sent(
      'Caes-4-8',
      [
        w('caedes', 'caedes', 'slaughter', 'noun', N('nominative', 'singular', 'feminine')),
        w('ingens', 'ingens', 'great', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w('fuit', 'sum', 'was', 'verb', V('3', 'singular', 'perfect', 'indicative', 'active')),
        w('in', 'in', 'among', 'preposition'),
        w('Germanis.', 'Germani', 'the Germans', 'noun', N('ablative', 'plural', 'masculine')),
      ],
      'There was great slaughter among the Germans.'
    ),
    sent(
      'Caes-4-9',
      [
        w('victoria', 'victoria', 'victory', 'noun', N('nominative', 'singular', 'feminine')),
        w('nostra', 'noster', 'our', 'adjective', ADJ('nominative', 'singular', 'feminine')),
        w('erat', 'sum', 'was', 'verb', V('3', 'singular', 'imperfect', 'indicative', 'active')),
        w('completa.', 'compleo', 'complete', 'verb', {
          ...V('3', 'singular', 'perfect', 'participle', 'passive'),
          case: 'nominative',
          gender: 'feminine',
        }),
      ],
      'Our victory was complete.'
    ),
    sent(
      'Caes-4-10',
      [
        w('Helvetii', 'Helvetii', 'the Helvetii', 'noun', N('nominative', 'plural', 'masculine')),
        w('et', 'et', 'and', 'conjunction'),
        w('Germani', 'Germani', 'the Germans', 'noun', N('nominative', 'plural', 'masculine')),
        w('iam', 'iam', 'now', 'adverb'),
        w('non', 'non', 'no longer', 'adverb'),
        w('erant', 'sum', 'were', 'verb', V('3', 'plural', 'imperfect', 'indicative', 'active')),
        w('noxii', 'noxius', 'harmful', 'adjective', ADJ('nominative', 'plural', 'masculine')),
        w('Gallis.', 'Galli', 'to the Gauls', 'noun', N('dative', 'plural', 'masculine')),
      ],
      'The Helvetii and Germans were now no longer harmful to the Gauls.'
    ),
    sent(
      'Caes-4-11',
      [
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('ipse', 'ipse', 'himself', 'pronoun', N('nominative', 'singular', 'masculine')),
        w('in', 'in', 'to', 'preposition'),
        w('castra', 'castra', 'camp', 'noun', N('accusative', 'plural', 'neuter')),
        w(
          'rediit',
          'redeo',
          'returned',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('cum', 'cum', 'with', 'preposition'),
        w('gloria.', 'gloria', 'glory', 'noun', N('ablative', 'singular', 'feminine')),
      ],
      'Caesar himself returned to camp with glory.'
    ),
    sent(
      'Caes-4-12',
      [
        w('hoc', 'hic', 'this', 'pronoun', N('ablative', 'singular', 'masculine')),
        w('modo', 'modus', 'way', 'noun', N('ablative', 'singular', 'masculine')),
        w('Caesar', 'Caesar', 'Caesar', 'noun', N('nominative', 'singular', 'masculine')),
        w('Galliam', 'Gallia', 'Gaul', 'noun', N('accusative', 'singular', 'feminine')),
        w('ab', 'ab', 'from', 'preposition'),
        w('hostibus', 'hostis', 'enemies', 'noun', N('ablative', 'plural', 'masculine')),
        w(
          'liberavit',
          'libero',
          'freed',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
        w('et', 'et', 'and', 'conjunction'),
        w('pacem', 'pax', 'peace', 'noun', N('accusative', 'singular', 'feminine')),
        w(
          'constituit.',
          'constituo',
          'established',
          'verb',
          V('3', 'singular', 'perfect', 'indicative', 'active')
        ),
      ],
      'Thus Caesar freed Gaul from enemies and established peace.'
    ),
  ],
};
