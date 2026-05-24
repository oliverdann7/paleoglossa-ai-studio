import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const UGA_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  '𐎍': { lemma: '𐎍', gloss: 'to, for', partOfSpeech: 'preposition' },
  '𐎛𐎍': { lemma: '𐎛𐎍', gloss: 'god, El', partOfSpeech: 'noun' },
  '𐎁𐎓𐎍': { lemma: '𐎁𐎓𐎍', gloss: 'Baal', partOfSpeech: 'noun' },
  '𐎊𐎎': { lemma: '𐎊𐎎', gloss: 'Yam (sea)', partOfSpeech: 'noun' },
  '𐎎𐎐': { lemma: '𐎎𐎐', gloss: 'who, what', partOfSpeech: 'pronoun' },
  '𐎋': { lemma: '𐎋', gloss: 'like, as', partOfSpeech: 'preposition' },
  '𐎂𐎗': { lemma: '𐎂𐎗', gloss: 'to sojourn', partOfSpeech: 'verb' },
  '𐎀': { lemma: '𐎀', gloss: 'O (vocative)', partOfSpeech: 'interjection' },
  '𐎁𐎅': { lemma: '𐎁𐎅', gloss: 'among them', partOfSpeech: 'pronoun' },
  '𐎁𐎐': { lemma: '𐎁𐎐', gloss: 'son', partOfSpeech: 'noun' },
  '𐎁𐎐𐎅': { lemma: '𐎁𐎐', gloss: 'his son', partOfSpeech: 'noun' },
  '𐎈𐎐': { lemma: '𐎈𐎐', gloss: 'grace, favor', partOfSpeech: 'noun' },
  '𐎋𐎒': { lemma: '𐎋𐎒', gloss: 'cup, throne', partOfSpeech: 'noun' },
  '𐎗𐎁': { lemma: '𐎗𐎁', gloss: 'great, chief', partOfSpeech: 'adjective' },
  '𐎖𐎍': { lemma: '𐎖𐎍', gloss: 'voice', partOfSpeech: 'noun' },
};

export const UGA_BAAL_1_1: TextSection = {
  id: 'Uga-Baal-1-1',
  textId: 'Uga-Baal',
  sequence: 1,
  label: 'KTU 1.1 — The Feast of El',
  sentences: [
    sentLex(
      'Uga-Baal-1-1-1',
      ['𐎍𐎛𐎍𐎎', '𐎛𐎍', '𐎚𐎔𐎈', '𐎁𐎐𐎅', '𐎗𐎎𐎚', '𐎍', '𐎘𐎐𐎊', '𐎚𐎔𐎈', '𐎚𐎐𐎋'],
      'To the gods, El prepares a feast; to the assembly, he prepares a banquet.',
      UGA_LEXICON
    ),
    sentLex(
      'Uga-Baal-1-1-2',
      ['𐎊𐎗𐎃', '𐎊𐎗', '𐎁𐎐', '𐎛𐎍', '𐎎𐎚', '𐎚𐎌𐎚', '𐎊𐎌𐎚', '𐎛𐎐𐎌', '𐎅𐎐'],
      'Yarikh shines, the son of El. The staff in hand, he drinks wine.',
      UGA_LEXICON
    ),
    sentLex(
      'Uga-Baal-1-1-3',
      ['𐎍', '𐎁𐎓𐎍', '𐎋𐎗𐎜', '𐎊𐎎𐎌𐎃', '𐎍', '𐎗𐎋𐎁', '𐎓𐎗𐎔𐎚', '𐎋𐎗', '𐎌𐎁𐎓', '𐎁𐎗𐎖'],
      'For Baal we will go; for the Cloud-Rider we will go. Seven lightning bolts, the sound of his voice.',
      UGA_LEXICON
    ),
  ],
};

export const UGA_BAAL_1_2: TextSection = {
  id: 'Uga-Baal-1-2',
  textId: 'Uga-Baal',
  sequence: 2,
  label: 'KTU 1.2 — The Challenge of Yam',
  sentences: [
    sentLex(
      'Uga-Baal-1-2-1',
      ['𐎄𐎁𐎗', '𐎋𐎒𐎐', '𐎛𐎍', '𐎖𐎁𐎓𐎚', '𐎎𐎇𐎁', '𐎔𐎜𐎗', '𐎎𐎓𐎄'],
      'The word of El, the cup of the god, the assembly of the council of the divine ones.',
      UGA_LEXICON
    ),
    sentLex(
      'Uga-Baal-1-2-2',
      ['𐎊𐎄', '𐎔𐎂𐎍', '𐎖𐎍', '𐎊𐎁𐎍', '𐎊𐎓𐎗', '𐎅𐎋𐎍', '𐎚𐎙𐎗', '𐎌𐎐𐎀'],
      'He breaks the horn, his voice he carries. He goes to the palace of the gods.',
      UGA_LEXICON
    ),
    sentLex(
      'Uga-Baal-1-2-3',
      ['𐎋𐎗𐎊', '𐎗𐎁', '𐎋𐎁𐎗', '𐎎𐎗𐎊', '𐎖𐎍𐎅', '𐎊𐎖𐎗𐎀', '𐎍', '𐎃𐎎𐎗', '𐎛𐎍'],
      'The great one, the mighty one, his voice he raises. He calls to the cup of El.',
      UGA_LEXICON
    ),
  ],
};

export const ALL_UGARITIC_EXTENDED_SECTIONS: TextSection[] = [UGA_BAAL_1_1, UGA_BAAL_1_2];
