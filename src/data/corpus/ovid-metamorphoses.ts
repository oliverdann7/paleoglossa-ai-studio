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
  label: "Metamorphoses Book 1 — Creation of the World and Humanity",
  sentences: [
    sent('Ovid-1-1', ['In', 'nova', 'fert', 'animus', 'mutatas', 'dicere', 'formas', 'corpora;'], 'My mind leads me to speak of forms changed into new bodies;'),
    sent('Ovid-1-2', ['di,', 'coeptis', '(nam', 'vos', 'mutastis', 'et', 'illas)', 'adspirate', 'meis', 'primaque', 'ab', 'origine', 'mundi', 'ad', 'mea', 'tempora', 'deducite', 'carmen!'], 'O gods, assist my undertaking, for you have transformed even those forms, and I pray you guide my song from the world\'s beginning down to my own times!'),
    sent('Ovid-1-3', ['Ante', 'mare', 'et', 'terras', 'et', 'quod', 'tegit', 'omnia', 'caelum', 'unus', 'erat', 'toto', 'naturae', 'vultus', 'in', 'orbe,', 'quem', 'dixere', 'Chaos;'], 'Before the sea and land and the sky that covers all, there was one face of nature throughout the whole universe, which men called Chaos;'),
    sent('Ovid-1-4', ['rudis', 'indigestaque', 'moles', 'nec', 'quicquam', 'nisi', 'pondus', 'iners', 'congestaque', 'eodem', 'non', 'bene', 'iunctarum', 'discordia', 'semina', 'rerum.'], 'a rough and unordered mass, and nothing but an inert weight, and the discord of badly joined seeds of things heaped together.'),
    sent('Ovid-1-5', ['nulla', 'suo', 'fuit', 'ut', 'magis', 'ulla', 'dies', 'et', 'nox', 'diducta', 'foret', 'ab', 'aethere', 'caelo;'], 'There was no day distinct, nor night separated from the heavens by the aether;'),
    sent('Ovid-1-6', ['nec', 'madida', 'tellus', 'pendebat', 'in', 'aere', 'libra,', 'nec', 'circumfuso', 'pendebat', 'in', 'aequore', 'bracchia', 'Tethys;'], 'nor did the moist earth hang in the air\'s balance, nor did Tethys hang her arms around the surrounding waters;'),
    sent('Ovid-1-7', ['quisquis', 'erat', 'deus', 'ille', 'qui', 'discordia', 'tali', 'secrevit', 'primum', 'sidera', 'caelo;'], 'Whoever this divinity was, he resolved the discord and divided the chaos into its component parts.'),
    sent('Ovid-1-8', ['terram', 'et', 'aquas', 'et', 'caelum', 'sortitus', 'est.'], 'He allotted the earth, the waters, and the heavens to their proper places.'),
    sent('Ovid-1-9', ['postquam', 'deorum', 'quisquam', 'meliore', 'luto', 'finxit', 'in', 'effigiem', 'moderantum', 'cuncta', 'deus'], 'After this, one of the gods shaped mankind from better clay in the image of the all-ruling gods.'),
    sent('Ovid-1-10', ['aut', 'ex', 'divino', 'semine', 'erat', 'aut', 'ex', 'nova', 'terra', 'adhuc', 'caelo', 'mixta', 'creata.'], 'Either mankind was made from divine seed, or the newly separated earth retained the germs of the sky.'),
    sent('Ovid-1-11', ['surgere', 'in', 'altum', 'animam', 'iussit', 'et', 'spectare', 'in', 'caelum', 'quam', 'caeteris', 'animantibus', 'prona', 'iacent.'], 'He commanded the mind to rise toward the heights and to gaze upon the heavens—while all other creatures look downward to the earth.'),
    sent('Ovid-1-12', ['dedit', 'os', 'homini', 'sublime', 'coelumque', 'tueri', 'iussit', 'et', 'erectos', 'ad', 'sidera', 'tollere', 'vultus.'], 'He gave man a countenance to look upon the sky, and commanded him to raise his eyes toward the stars.'),
  ],
};
