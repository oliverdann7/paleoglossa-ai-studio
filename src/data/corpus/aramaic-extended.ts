import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const ARC_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  יְיָ: { lemma: 'יְיָ', gloss: 'LORD', partOfSpeech: 'noun' },
  נְהוֹרָא: { lemma: 'נְהוֹרָא', gloss: 'the light', partOfSpeech: 'noun' },
  לִנְהוֹרָא: { lemma: 'נְהוֹרָא', gloss: 'to the light', partOfSpeech: 'noun' },
  חֲשׁוֹכָא: { lemma: 'חֲשׁוֹכָא', gloss: 'the darkness', partOfSpeech: 'noun' },
  וְלַחֲשׁוֹכָא: { lemma: 'חֲשׁוֹכָא', gloss: 'and to the darkness', partOfSpeech: 'noun' },
  יְמָם: { lemma: 'יְמָם', gloss: 'day', partOfSpeech: 'noun' },
  לֵילְיָא: { lemma: 'לֵילְיָא', gloss: 'the night', partOfSpeech: 'noun' },
  רְמַשׁ: { lemma: 'רְמַשׁ', gloss: 'evening', partOfSpeech: 'noun' },
  צַפְרָא: { lemma: 'צַפְרָא', gloss: 'the morning', partOfSpeech: 'noun' },
  יוֹם: { lemma: 'יוֹם', gloss: 'day', partOfSpeech: 'noun' },
  חַד: { lemma: 'חַד', gloss: 'one', partOfSpeech: 'adjective' },
  טָב: { lemma: 'טָב', gloss: 'good', partOfSpeech: 'adjective' },
  וַהֲוָה: { lemma: 'הוי', gloss: 'and it was', partOfSpeech: 'verb' },
  לֶיהֱוֵי: { lemma: 'הוי', gloss: 'let there be', partOfSpeech: 'verb' },
  וַאֲמַר: { lemma: 'אמר', gloss: 'and he said', partOfSpeech: 'verb' },
  וַחֲזָא: { lemma: 'חזי', gloss: 'and he saw', partOfSpeech: 'verb' },
  וְאַפְרֵישׁ: { lemma: 'פרשׁ', gloss: 'and he separated', partOfSpeech: 'verb' },
  וּקְרָא: { lemma: 'קרא', gloss: 'and he called', partOfSpeech: 'verb' },
  קְרָא: { lemma: 'קרא', gloss: 'he called', partOfSpeech: 'verb' },
  בֵּין: { lemma: 'בֵּין', gloss: 'between', partOfSpeech: 'preposition' },
  וּבֵין: { lemma: 'בֵּין', gloss: 'and between', partOfSpeech: 'preposition' },
  אֲרֵי: { lemma: 'אֲרֵי', gloss: 'that, because', partOfSpeech: 'conjunction' },
  יָת: { lemma: 'יָת', gloss: '(direct obj marker)', partOfSpeech: 'particle' },
  נְבֻכַדְנֶצַּר: { lemma: 'נְבֻכַדְנֶצַּר', gloss: 'Nebuchadnezzar', partOfSpeech: 'noun' },
  הַמֶּלֶךְ: { lemma: 'מֶלֶךְ', gloss: 'the king', partOfSpeech: 'noun' },
  מַלְכָּא: { lemma: 'מֶלֶךְ', gloss: 'the king', partOfSpeech: 'noun' },
  חֲלַם: { lemma: 'חלם', gloss: 'dream', partOfSpeech: 'noun' },
  חֲלָם֒: { lemma: 'חלם', gloss: 'dream', partOfSpeech: 'noun' },
};

export const ARC_GENESIS_2: TextSection = {
  id: 'Arc-Gen-2',
  textId: 'Arc-Gen',
  sequence: 2,
  label: 'Targum Onkelos Genesis 1:3–5 — Let There Be Light',
  sentences: [
    sentLex(
      'Arc-Gen-2-1',
      ['וַאֲמַר', 'יְיָ', 'לֶיהֱוֵי', 'נְהוֹרָא', 'וַהֲוָה', 'נְהוֹרָא'],
      'And the Lord said, Let there be light, and there was light.',
      ARC_LEXICON
    ),
    sentLex(
      'Arc-Gen-2-2',
      [
        'וַחֲזָא',
        'יְיָ',
        'יָת',
        'נְהוֹרָא',
        'אֲרֵי',
        'טָב',
        'וְאַפְרֵישׁ',
        'יְיָ',
        'בֵּין',
        'נְהוֹרָא',
        'וּבֵין',
        'חֲשׁוֹכָא',
      ],
      'And the Lord saw the light, that it was good; and the Lord divided the light from the darkness.',
      ARC_LEXICON
    ),
    sentLex(
      'Arc-Gen-2-3',
      [
        'וּקְרָא',
        'יְיָ',
        'לִנְהוֹרָא',
        'יְמָם',
        'וְלַחֲשׁוֹכָא',
        'קְרָא',
        'לֵילְיָא',
        'וַהֲוָה',
        'רְמַשׁ',
        'וַהֲוָה',
        'צַפְרָא',
        'יוֹם',
        'חַד',
      ],
      'And the Lord called the light Day, and the darkness he called Night. And there was evening and there was morning, one day.',
      ARC_LEXICON
    ),
  ],
};

export const ARC_DANIEL_1: TextSection = {
  id: 'Arc-Dan-1',
  textId: 'Arc-Dan',
  sequence: 1,
  label: "Daniel 2:1–5 — Nebuchadnezzar's Dream",
  sentences: [
    sentLex(
      'Arc-Dan-1-1',
      [
        'וּבִשְׁנַ֣ת',
        'שְׁתַּ֔יִם',
        'לְמַלְכ֖וּת',
        'נְבֻכַדְנֶצַּ֑ר',
        'חֲלַ֣ם',
        'נְבֻכַדְנֶצַּר֮',
        'חֲלָם֒',
        'וַתִּתְפָּ֣עֶם',
        'רוּחֹ֔ה',
        'וּשְׁנָתֹ֖ו',
        'נִהְיְתָ֥ה',
        'עָלֹֽוהִי',
      ],
      'In the second year of the reign of Nebuchadnezzar, Nebuchadnezzar dreamed dreams, and his spirit was troubled, and his sleep left him.',
      ARC_LEXICON
    ),
    sentLex(
      'Arc-Dan-1-2',
      [
        'וַיֹּ֧אמֶר',
        'הַמֶּ֛לֶךְ',
        'לִקְרֹ֥א',
        'לַֽחַרְטֻמִּ֖ים',
        'וְלָֽאַשָּׁפִ֑ים',
        'וְלַֽמְכַשְּׁפִ֖ים',
        'וְלַכַּשְׂדָּאִ֛ים',
        'לְהַגִּ֥יד',
        'לַמֶּ֖לֶךְ',
        'חֲלֹמֹתָ֑יו',
        'וַיָּבֹ֕אוּ',
        'וַיַּֽעַמְד֖וּ',
        'לִפְנֵ֥י',
        'הַמֶּֽלֶךְ',
      ],
      'And the king commanded to call the magicians, the enchanters, the sorcerers, and the Chaldeans, to tell the king his dreams. So they came in and stood before the king.',
      ARC_LEXICON
    ),
    sentLex(
      'Arc-Dan-1-3',
      [
        'וַיֹּ֧אמֶר',
        'לָהֶ֛ם',
        'הַמֶּ֖לֶךְ',
        'חֲל֣וֹם',
        'חָלָ֑מְתִּי',
        'וַתִּפָּ֣עֶם',
        'רוּחִ֔י',
        'לָדַ֖עַת',
        'אֶֽת־הַחֲלֽוֹם',
      ],
      'And the king said to them, I have dreamed a dream, and my spirit is troubled to know the dream.',
      ARC_LEXICON
    ),
  ],
};

export const ALL_ARAMAIC_EXTENDED_SECTIONS: TextSection[] = [ARC_GENESIS_2, ARC_DANIEL_1];
