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
  label: "De Bello Gallico Book 1",
  sentences: [
    sent('Caes-1-1', ['Gallia', 'est', 'omnis', 'divisa', 'in', 'partes', 'tres,', 'quarum', 'unam', 'incolunt', 'Belgae,', 'aliam', 'Aquitani,', 'tertiam', 'qui', 'ipsorum', 'lingua', 'Celtae,', 'nostra', 'Galli', 'appellantur.'], 'All Gaul is divided into three parts, one of which is inhabited by the Belgae, another by the Aquitani, and the third by those who, in their own language, are called Celts, but in ours, Gauls.'),
    sent('Caes-1-2', ['hi', 'omnes', 'lingua,', 'institutis,', 'legibus', 'inter', 'se', 'differunt.'], 'All these differ from each other in language, customs, and laws.'),
    sent('Caes-1-3', ['Helvetii', 'ab', 'extremis', 'Galliae', 'finibus', 'initium', 'praebent;', 'Pyrenaei', 'montes', 'Hispaniam', 'ab', 'Gallia', 'cernunt;', 'flumen', 'Rhodanus', 'Italiam', 'a', 'Gallia', 'secernit;'], 'The Helvetii begin from the furthest borders of Gaul; the Pyrenees mountains separate Spain from Gaul; the Rhine river separates Italy from Gaul;'),
    sent('Caes-1-4', ['fines', 'Galliae', 'sunt', 'ex', 'parte', 'tertia', 'Oceanus,', 'ex', 'parte', 'quarta', 'flumen', 'Rhenum.'], 'the borders of Gaul are on one side the Ocean, on the other the Rhine river.'),
    sent('Caes-1-5', ['Helvetii', 'sunt', 'sinistra', 'in', 'Germaniam', 'Rhenumque.'], 'The Helvetii are on the left toward Germany and the Rhine.'),
    sent('Caes-1-6', ['populus', 'Helvetius', 'erat', 'multo', 'ubertate', 'et', 'copiis', 'rerum', 'omnium', 'amplior', 'et', 'ditior', 'quam', 'Belgae.'], 'The Helvetian people were by far richer and more abundant in all kinds of resources than the Belgae.'),
  ],
};
