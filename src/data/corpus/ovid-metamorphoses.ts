/**
 * Ovid — Metamorphoses (Book 1, opening)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation.
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

export const OVID_METAMORPHOSES_1: TextSection = {
  id: "Ovid-Met-1",
  textId: "Ovid-Metamorphoses-1",
  sequence: 1,
  label: "Metamorphoses Book 1",
  sentences: [
    sent('Ovid-1-1', ['In', 'nova', 'fert', 'animus', 'mutatas', 'dicere', 'formas', 'corpora;'], 'My mind leads me to speak of forms changed into new bodies;'),
    sent('Ovid-1-2', ['di,', 'coeptis', '(nam', 'vos', 'mutastis', 'et', 'illas)', 'adspirate', 'meis', 'primaque', 'ab', 'origine', 'mundi', 'ad', 'mea', 'tempora', 'deducite', 'carmen!'], 'O gods, assist my undertaking, for you have transformed even those forms, and I pray you guide my song from the world\'s beginning down to my own times!'),
    sent('Ovid-1-3', ['Ante', 'mare', 'et', 'terras', 'et', 'quod', 'tegit', 'omnia', 'caelum', 'unus', 'erat', 'toto', 'naturae', 'vultus', 'in', 'orbe,', 'quem', 'dixere', 'Chaos;'], 'Before the sea and land and the sky that covers all, there was one face of nature throughout the whole universe, which men called Chaos;'),
    sent('Ovid-1-4', ['rudis', 'indigestaque', 'moles', 'nec', 'quicquam', 'nisi', 'pondus', 'iners', 'congestaque', 'eodem', 'non', 'bene', 'iunctarum', 'discordia', 'semina', 'rerum.'], 'a rough and unordered mass, and nothing but an inert weight, and the discord of badly joined seeds of things heaped together.'),
    sent('Ovid-1-5', ['nulla', 'suo', 'fuit', 'ut', 'magis', 'ulla', 'dies', 'et', 'nox', 'diducta', 'foret', 'ab', 'aethere', 'caelo;'], 'There was no day distinct, nor night separated from the heavens by the aether;'),
    sent('Ovid-1-6', ['nec', 'madida', 'tellus', 'pendebat', 'in', 'aere', 'libra,', 'nec', 'circumfuso', 'pendebat', 'in', 'aequore', 'bracchia', 'Tethys;'], 'nor did the moist earth hang in the air\'s balance, nor did Tethys hang her arms around the surrounding waters;'),
  ],
};
