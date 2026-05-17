/**
 * Caesar — De Bello Gallico (The Gallic Wars, Book 1)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation by W. A. McDevitte.
 *
 * The text is in the Public Domain. No permission needed for use,
 * reproduction, or distribution.
 */

import { TextSection, Sentence } from '../../types/corpus';

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

export const CAESAR_BELLUM_GALLICUM_1: TextSection = {
  id: "Caes-BG-1",
  textId: "Caesar-BG-1",
  sequence: 1,
  label: "De Bello Gallico Book 1 — Geographic and Political Divisions",
  sentences: [
    sent('Caes-1-1', ['Gallia', 'est', 'omnis', 'divisa', 'in', 'partes', 'tres,', 'quarum', 'unam', 'incolunt', 'Belgae,', 'aliam', 'Aquitani,', 'tertiam', 'qui', 'ipsorum', 'lingua', 'Celtae,', 'nostra', 'Galli', 'appellantur.'], 'All Gaul is divided into three parts, one of which is inhabited by the Belgae, another by the Aquitani, and the third by those who, in their own language, are called Celts, but in ours, Gauls.'),
    sent('Caes-1-2', ['hi', 'omnes', 'lingua,', 'institutis,', 'legibus', 'inter', 'se', 'differunt.'], 'All these differ from each other in language, customs, and laws.'),
    sent('Caes-1-3', ['Helvetii', 'ab', 'extremis', 'Galliae', 'finibus', 'initium', 'praebent;', 'Pyrenaei', 'montes', 'Hispaniam', 'ab', 'Gallia', 'cernunt;', 'flumen', 'Rhodanus', 'Italiam', 'a', 'Gallia', 'secernit;'], 'The Helvetii begin from the furthest borders of Gaul; the Pyrenees mountains separate Spain from Gaul; the Rhine river separates Italy from Gaul;'),
    sent('Caes-1-4', ['fines', 'Galliae', 'sunt', 'ex', 'parte', 'tertia', 'Oceanus,', 'ex', 'parte', 'quarta', 'flumen', 'Rhenum.'], 'the borders of Gaul are on one side the Ocean, on the other the Rhine river.'),
    sent('Caes-1-5', ['Helvetii', 'sunt', 'sinistra', 'in', 'Germaniam', 'Rhenumque.'], 'The Helvetii are on the left toward Germany and the Rhine.'),
    sent('Caes-1-6', ['populus', 'Helvetius', 'erat', 'multo', 'ubertate', 'et', 'copiis', 'rerum', 'omnium', 'amplior', 'et', 'ditior', 'quam', 'Belgae.'], 'The Helvetian people were by far richer and more abundant in all kinds of resources than the Belgae.'),
    sent('Caes-1-7', ['idem', 'erat', 'cupiditate', 'incensi', 'ut', 'ex', 'suis', 'finibus', 'exirent.'], 'They were inflamed with the desire to depart from their own borders.'),
    sent('Caes-1-8', ['stimulabantur', 'enim', 'multis', 'et', 'magnis', 'incommoditatibus,', 'quod', 'neque', 'agri', 'satis', 'amplissimi', 'poterant', 'abundare'], 'For they were stirred by many and great difficulties, because their land, not being sufficiently extensive, could not support them;'),
    sent('Caes-1-9', ['neque', 'animum', 'suum', 'cupiditate', 'imperii', 'et', 'gloriae', 'poterat', 'moderari.'], 'nor could they moderate the desire for dominion and glory.'),
    sent('Caes-1-10', ['Helvetii', 'se', 'in', 'Alpes', 'recipere', 'conabantur.'], 'The Helvetii resolved to retreat into the Alps.'),
    sent('Caes-1-11', ['Orgetoric', 'venit', 'per', 'multorum', 'animos', 'earum', 'rerum', 'consilium.'], 'Orgetorix brought word of this plan to many leaders.'),
    sent('Caes-1-12', ['ille', 'imperium', 'obtinere', 'et', 'princeps', 'ac', 'magister', 'ibi', 'fieri', 'studebat.'], 'He sought to seize power and be the chief commander of that people.'),
  ],
};
