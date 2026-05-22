import type { TextSection, Sentence } from '../../types/corpus.js';

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
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

export const UGA_BAAL_1_1: TextSection = {
  id: 'Uga-Baal-1-1',
  textId: 'Uga-Baal',
  sequence: 1,
  label: 'KTU 1.1 — The Feast of El',
  sentences: [
    sent('Uga-Baal-1-1-1', ['𐎍𐎛𐎍𐎎', '𐎛𐎍', '𐎚𐎔𐎈', '𐎁𐎐𐎅', '𐎗𐎎𐎚', '𐎍', '𐎘𐎐𐎊', '𐎚𐎔𐎈', '𐎚𐎐𐎋'], 'To the gods, El prepares a feast; to the assembly, he prepares a banquet.'),
    sent('Uga-Baal-1-1-2', ['𐎊𐎗𐎃', '𐎊𐎗', '𐎁𐎐', '𐎛𐎍', '𐎎𐎚', '𐎚𐎌𐎚', '𐎊𐎌𐎚', '𐎛𐎐𐎌', '𐎅𐎐'], 'Yarikh shines, the son of El. The staff in hand, he drinks wine.'),
    sent('Uga-Baal-1-1-3', ['𐎍', '𐎁𐎓𐎍', '𐎋𐎗𐎜', '𐎊𐎎𐎌𐎃', '𐎍', '𐎗𐎋𐎁', '𐎓𐎗𐎔𐎚', '𐎋𐎗', '𐎌𐎁𐎓', '𐎁𐎗𐎖'], 'For Baal we will go; for the Cloud-Rider we will go. Seven lightning bolts, the sound of his voice.'),
  ],
};

export const UGA_BAAL_1_2: TextSection = {
  id: 'Uga-Baal-1-2',
  textId: 'Uga-Baal',
  sequence: 2,
  label: 'KTU 1.2 — The Challenge of Yam',
  sentences: [
    sent('Uga-Baal-1-2-1', ['𐎄𐎁𐎗', '𐎋𐎒𐎐', '𐎛𐎍', '𐎖𐎁𐎓𐎚', '𐎎𐎇𐎁', '𐎔𐎜𐎗', '𐎎𐎓𐎄'], 'The word of El, the cup of the god, the assembly of the council of the divine ones.'),
    sent('Uga-Baal-1-2-2', ['𐎊𐎄', '𐎔𐎂𐎍', '𐎖𐎍', '𐎊𐎁𐎍', '𐎊𐎓𐎗', '𐎅𐎋𐎍', '𐎚𐎙𐎗', '𐎌𐎐𐎀'], 'He breaks the horn, his voice he carries. He goes to the palace of the gods.'),
    sent('Uga-Baal-1-2-3', ['𐎋𐎗𐎊', '𐎗𐎁', '𐎋𐎁𐎗', '𐎎𐎗𐎊', '𐎖𐎍𐎅', '𐎊𐎖𐎗𐎀', '𐎍', '𐎃𐎎𐎗', '𐎛𐎍'], 'The great one, the mighty one, his voice he raises. He calls to the cup of El.'),
  ],
};

export const ALL_UGARITIC_EXTENDED_SECTIONS: TextSection[] = [
  UGA_BAAL_1_1,
  UGA_BAAL_1_2,
];
