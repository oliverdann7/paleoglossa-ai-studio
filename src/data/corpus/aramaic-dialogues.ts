/**
 * Themed beginner dialogues in Biblical Aramaic, modeled on the
 * dialogue-first pedagogy of the Šlomo Surayt course (surayt.com) for
 * modern Neo-Aramaic: everyday scenes (greetings, family, the market)
 * taught as short exchanges with dual-script support — every token
 * carries a Latin transliteration next to the square-script Aramaic.
 *
 * All content is an original Paleoglossa composition in *ancient*
 * (Biblical-style) Aramaic; nothing is copied from the Surayt course.
 * Every token has lemma + gloss + POS + transliteration, so the text
 * passes the `complete` annotation gate in validation.ts.
 */

import type { TextSection } from '../../types/corpus.js';
import { sentLex, type LexicalHint } from '../../lib/utils/lexicalHelper.js';

const ARC_DLG_LEX: Record<string, LexicalHint> = {
  // Greetings
  שְׁלָם: {
    lemma: 'שְׁלָם',
    gloss: 'peace; hello',
    partOfSpeech: 'noun',
    transliteration: 'šəlām',
  },
  לָךְ: { lemma: 'לְ', gloss: 'to you', partOfSpeech: 'preposition', transliteration: 'lāk' },
  אַף: { lemma: 'אַף', gloss: 'also', partOfSpeech: 'adverb', transliteration: 'ʾap' },
  מָה: { lemma: 'מָה', gloss: 'what?', partOfSpeech: 'pronoun', transliteration: 'mā' },
  שְׁמָךְ: { lemma: 'שֻׁם', gloss: 'your name', partOfSpeech: 'noun', transliteration: 'šəmāk' },
  שְׁמִי: { lemma: 'שֻׁם', gloss: 'my name', partOfSpeech: 'noun', transliteration: 'šəmî' },
  דָּנִיֵּאל: {
    lemma: 'דָּנִיֵּאל',
    gloss: 'Daniel',
    partOfSpeech: 'noun',
    transliteration: 'Dāniyyēʾl',
  },
  מִן: { lemma: 'מִן', gloss: 'from', partOfSpeech: 'preposition', transliteration: 'min' },
  אָן: { lemma: 'אָן', gloss: 'where?', partOfSpeech: 'adverb', transliteration: 'ʾān' },
  אַנְתְּ: {
    lemma: 'אַנְתְּ',
    gloss: 'you (m.)',
    partOfSpeech: 'pronoun',
    transliteration: 'ʾant',
  },
  אֲנָה: { lemma: 'אֲנָה', gloss: 'I', partOfSpeech: 'pronoun', transliteration: 'ʾănā' },
  בָּבֶל: { lemma: 'בָּבֶל', gloss: 'Babylon', partOfSpeech: 'noun', transliteration: 'Bābel' },
  // Family
  דְּנָה: { lemma: 'דְּנָה', gloss: 'this (m.)', partOfSpeech: 'pronoun', transliteration: 'dənā' },
  דָּא: { lemma: 'דָּא', gloss: 'this (f.)', partOfSpeech: 'pronoun', transliteration: 'dāʾ' },
  אַבִּי: { lemma: 'אַב', gloss: 'my father', partOfSpeech: 'noun', transliteration: 'ʾabbî' },
  אִמִּי: { lemma: 'אֵם', gloss: 'my mother', partOfSpeech: 'noun', transliteration: 'ʾimmî' },
  סָפְרָא: { lemma: 'סָפַר', gloss: 'a scribe', partOfSpeech: 'noun', transliteration: 'sāprāʾ' },
  חַכִּימָה: {
    lemma: 'חַכִּים',
    gloss: 'wise (f.)',
    partOfSpeech: 'adjective',
    transliteration: 'ḥakkîmā',
  },
  אִית: { lemma: 'אִית', gloss: 'there is', partOfSpeech: 'particle', transliteration: 'ʾît' },
  לִי: { lemma: 'לְ', gloss: 'to me', partOfSpeech: 'preposition', transliteration: 'lî' },
  אָח: { lemma: 'אָח', gloss: 'a brother', partOfSpeech: 'noun', transliteration: 'ʾāḥ' },
  אָחִי: { lemma: 'אָח', gloss: 'my brother', partOfSpeech: 'noun', transliteration: 'ʾāḥî' },
  בְּבָבֶל: {
    lemma: 'בָּבֶל',
    gloss: 'in Babylon',
    partOfSpeech: 'noun',
    transliteration: 'bə-Bābel',
  },
  אֲחָתִי: { lemma: 'אֲחָת', gloss: 'my sister', partOfSpeech: 'noun', transliteration: 'ʾăḥātî' },
  טָבָה: { lemma: 'טָב', gloss: 'good (f.)', partOfSpeech: 'adjective', transliteration: 'ṭābā' },
  אֲנַחְנָא: {
    lemma: 'אֲנַחְנָא',
    gloss: 'we',
    partOfSpeech: 'pronoun',
    transliteration: 'ʾănaḥnāʾ',
  },
  בְּבֵיתָא: {
    lemma: 'בַּיִת',
    gloss: 'in the house',
    partOfSpeech: 'noun',
    transliteration: 'bə-bêtāʾ',
  },
  // Market
  לְחֶם: { lemma: 'לְחֶם', gloss: 'bread', partOfSpeech: 'noun', transliteration: 'ləḥem' },
  כְּמָה: { lemma: 'כְּמָה', gloss: 'how much?', partOfSpeech: 'adverb', transliteration: 'kəmā' },
  כַּסְפָּא: {
    lemma: 'כְּסַף',
    gloss: 'the silver, money',
    partOfSpeech: 'noun',
    transliteration: 'kaspāʾ',
  },
  תְּלָתָה: {
    lemma: 'תְּלָת',
    gloss: 'three',
    partOfSpeech: 'adjective',
    transliteration: 'təlātā',
  },
  זוּזִין: {
    lemma: 'זוּז',
    gloss: 'zuz (silver coins)',
    partOfSpeech: 'noun',
    transliteration: 'zûzîn',
  },
  הַב: { lemma: 'יהב', gloss: 'give! (impv.)', partOfSpeech: 'verb', transliteration: 'hab' },
  לַחְמָא: { lemma: 'לְחֶם', gloss: 'the bread', partOfSpeech: 'noun', transliteration: 'laḥmāʾ' },
  הָא: { lemma: 'הָא', gloss: 'behold, here is', partOfSpeech: 'particle', transliteration: 'hāʾ' },
  בְּרִיךְ: {
    lemma: 'ברך',
    gloss: 'blessed (thank you)',
    partOfSpeech: 'adjective',
    transliteration: 'bərîk',
  },
  אֱזֵל: { lemma: 'אזל', gloss: 'go! (impv.)', partOfSpeech: 'verb', transliteration: 'ʾĕzēl' },
  בִּשְׁלָם: {
    lemma: 'שְׁלָם',
    gloss: 'in peace',
    partOfSpeech: 'noun',
    transliteration: 'bi-šlām',
  },
};

export const ARC_DIALOGUE_1: TextSection = {
  id: 'ArcDlg-1',
  textId: 'ArcDialogues',
  sequence: 1,
  label: 'Dialogue 1 — Greetings',
  sentences: [
    sentLex('ArcDlg-1-1', ['שְׁלָם', 'לָךְ.'], '— Peace to you!', ARC_DLG_LEX),
    sentLex('ArcDlg-1-2', ['שְׁלָם', 'אַף', 'לָךְ.'], '— Peace to you too!', ARC_DLG_LEX),
    sentLex('ArcDlg-1-3', ['מָה', 'שְׁמָךְ.'], '— What is your name?', ARC_DLG_LEX),
    sentLex('ArcDlg-1-4', ['שְׁמִי', 'דָּנִיֵּאל.'], '— My name is Daniel.', ARC_DLG_LEX),
    sentLex('ArcDlg-1-5', ['מִן', 'אָן', 'אַנְתְּ.'], '— Where are you from?', ARC_DLG_LEX),
    sentLex('ArcDlg-1-6', ['אֲנָה', 'מִן', 'בָּבֶל.'], '— I am from Babylon.', ARC_DLG_LEX),
    sentLex('ArcDlg-1-7', ['שְׁלָם.'], '— Peace (goodbye)!', ARC_DLG_LEX),
  ],
};

export const ARC_DIALOGUE_2: TextSection = {
  id: 'ArcDlg-2',
  textId: 'ArcDialogues',
  sequence: 2,
  label: 'Dialogue 2 — My Family',
  sentences: [
    sentLex('ArcDlg-2-1', ['דְּנָה', 'אַבִּי.'], '— This is my father.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-2', ['דָּא', 'אִמִּי.'], '— This is my mother.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-3', ['אַבִּי', 'סָפְרָא.'], '— My father is a scribe.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-4', ['אִמִּי', 'חַכִּימָה.'], '— My mother is wise.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-5', ['אִית', 'לִי', 'אָח.'], '— I have a brother.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-6', ['אָחִי', 'בְּבָבֶל.'], '— My brother is in Babylon.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-7', ['אֲחָתִי', 'טָבָה.'], '— My sister is good.', ARC_DLG_LEX),
    sentLex('ArcDlg-2-8', ['אֲנַחְנָא', 'בְּבֵיתָא.'], '— We are in the house.', ARC_DLG_LEX),
  ],
};

export const ARC_DIALOGUE_3: TextSection = {
  id: 'ArcDlg-3',
  textId: 'ArcDialogues',
  sequence: 3,
  label: 'Dialogue 3 — At the Market',
  sentences: [
    sentLex('ArcDlg-3-1', ['מָה', 'דְּנָה.'], '— What is this?', ARC_DLG_LEX),
    sentLex('ArcDlg-3-2', ['דְּנָה', 'לְחֶם.'], '— This is bread.', ARC_DLG_LEX),
    sentLex('ArcDlg-3-3', ['כְּמָה', 'כַּסְפָּא.'], '— How much money?', ARC_DLG_LEX),
    sentLex('ArcDlg-3-4', ['תְּלָתָה', 'זוּזִין.'], '— Three zuz.', ARC_DLG_LEX),
    sentLex('ArcDlg-3-5', ['הַב', 'לִי', 'לַחְמָא.'], '— Give me the bread.', ARC_DLG_LEX),
    sentLex('ArcDlg-3-6', ['הָא', 'לָךְ.'], '— Here you are.', ARC_DLG_LEX),
    sentLex('ArcDlg-3-7', ['בְּרִיךְ', 'אַנְתְּ.'], '— Blessed are you (thank you)!', ARC_DLG_LEX),
    sentLex('ArcDlg-3-8', ['אֱזֵל', 'בִּשְׁלָם.'], '— Go in peace.', ARC_DLG_LEX),
  ],
};

export const ALL_ARAMAIC_DIALOGUE_SECTIONS: TextSection[] = [
  ARC_DIALOGUE_1,
  ARC_DIALOGUE_2,
  ARC_DIALOGUE_3,
];
