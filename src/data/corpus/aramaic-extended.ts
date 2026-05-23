import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string, lemmaGloss?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const mapped = lemmaGloss?.[clean];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: mapped?.lemma || normalized,
        gloss: mapped?.gloss || '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

const ARC_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'וַאֲמַר': { lemma: 'אֲמַר', gloss: 'and he said' },
  'יְיָ': { lemma: 'יְיָ', gloss: 'Lord' },
  'לֶיהֱוֵי': { lemma: 'הֲוָא', gloss: 'let there be' },
  'נְהוֹרָא': { lemma: 'נְהוֹר', gloss: 'light' },
  'וַהֲוָה': { lemma: 'הֲוָא', gloss: 'and there was' },
  'וַחֲזָא': { lemma: 'חֲזָא', gloss: 'and he saw' },
  'יָת': { lemma: 'יָת', gloss: '(direct object marker)' },
  'אֲרֵי': { lemma: 'אֲרֵי', gloss: 'that, because' },
  'טָב': { lemma: 'טָב', gloss: 'good' },
  'וְאַפְרֵישׁ': { lemma: 'פְּרַשׁ', gloss: 'and he divided' },
  'בֵּין': { lemma: 'בֵּין', gloss: 'between' },
  'וּבֵין': { lemma: 'בֵּין', gloss: 'and between' },
  'חֲשׁוֹכָא': { lemma: 'חֲשׁוֹךְ', gloss: 'darkness' },
  'וּקְרָא': { lemma: 'קְרָא', gloss: 'and he called' },
  'לִנְהוֹרָא': { lemma: 'נְהוֹר', gloss: 'to the light' },
  'יְמָם': { lemma: 'יְמָם', gloss: 'day' },
  'וְלַחֲשׁוֹכָא': { lemma: 'חֲשׁוֹךְ', gloss: 'and to the darkness' },
  'קְרָא': { lemma: 'קְרָא', gloss: 'he called' },
  'לֵילְיָא': { lemma: 'לֵילְיָא', gloss: 'night' },
  'רְמַשׁ': { lemma: 'רְמַשׁ', gloss: 'evening' },
  'צַפְרָא': { lemma: 'צַפְרָא', gloss: 'morning' },
  'יוֹם': { lemma: 'יוֹם', gloss: 'day' },
  'חַד': { lemma: 'חַד', gloss: 'one' },
  'וּבִשְׁנַ֣ת': { lemma: 'שְׁנָה', gloss: 'and in the year' },
  'שְׁתַּ֔יִם': { lemma: 'תְּרֵין', gloss: 'two' },
  'לְמַלְכ֖וּת': { lemma: 'מַלְכוּ', gloss: 'of the reign' },
  'נְבֻכַדְנֶצַּ֑ר': { lemma: 'נְבֻכַדְנֶצַּר', gloss: 'Nebuchadnezzar' },
  'חֲלַ֣ם': { lemma: 'חֵלֶם', gloss: 'a dream' },
  'נְבֻכַדְנֶצַּר֮': { lemma: 'נְבֻכַדְנֶצַּר', gloss: 'Nebuchadnezzar' },
  'חֲלָם֒': { lemma: 'חֲלָם', gloss: 'he dreamed' },
  'וַתִּתְפָּ֣עֶם': { lemma: 'תְּפַע', gloss: 'and was troubled' },
  'רוּחֹ֔ה': { lemma: 'רוּחַ', gloss: 'his spirit' },
  'וּשְׁנָתֹ֖ו': { lemma: 'שֵׁנָה', gloss: 'and his sleep' },
  'נִהְיְתָ֥ה': { lemma: 'הֲוָא', gloss: 'was' },
  'עָלֹֽוהִי': { lemma: 'עַל', gloss: 'from him, upon him' },
  'וַיֹּ֧אמֶר': { lemma: 'אֲמַר', gloss: 'and he said' },
  'הַמֶּ֛לֶךְ': { lemma: 'מֶלֶךְ', gloss: 'the king' },
  'לִקְרֹ֥א': { lemma: 'קְרָא', gloss: 'to call' },
  'לַֽחַרְטֻמִּ֖ים': { lemma: 'חַרְטֹם', gloss: 'to the magicians' },
  'וְלָֽאַשָּׁפִ֑ים': { lemma: 'אַשָּׁף', gloss: 'and to the enchanters' },
  'וְלַֽמְכַשְּׁפִ֖ים': { lemma: 'מְכַשֵּׁף', gloss: 'and to the sorcerers' },
  'וְלַכַּשְׂדָּאִ֛ים': { lemma: 'כַּשְׂדַּי', gloss: 'and to the Chaldeans' },
  'לְהַגִּ֥יד': { lemma: 'נְגַד', gloss: 'to tell' },
  'לַמֶּ֖לֶךְ': { lemma: 'מֶלֶךְ', gloss: 'to the king' },
  'חֲלֹמֹתָ֑יו': { lemma: 'חֵלֶם', gloss: 'his dreams' },
  'וַיָּבֹ֕אוּ': { lemma: 'אֲתָא', gloss: 'and they came' },
  'וַיַּֽעַמְד֖וּ': { lemma: 'קְמָא', gloss: 'and they stood' },
  'לִפְנֵ֥י': { lemma: 'קֳדָם', gloss: 'before' },
  'לָהֶ֛ם': { lemma: 'לְ', gloss: 'to them' },
  'חֲל֣וֹם': { lemma: 'חֵלֶם', gloss: 'a dream' },
  'חָלָ֑מְתִּי': { lemma: 'חֲלָם', gloss: 'I have dreamed' },
  'וַתִּפָּ֣עֶם': { lemma: 'תְּפַע', gloss: 'and is troubled' },
  'רוּחִ֔י': { lemma: 'רוּחַ', gloss: 'my spirit' },
  'לָדַ֖עַת': { lemma: 'יְדַע', gloss: 'to know' },
  'אֶֽת־הַחֲלֽוֹם': { lemma: 'חֵלֶם', gloss: 'the dream' },
};

export const ARC_GENESIS_2: TextSection = {
  id: 'Arc-Gen-2',
  textId: 'Arc-Gen-1',
  sequence: 2,
  label: 'Targum Onkelos Genesis 1:3–5 — Let There Be Light',
  sentences: [
    sent(
      'Arc-Gen-2-1',
      ['וַאֲמַר', 'יְיָ', 'לֶיהֱוֵי', 'נְהוֹרָא', 'וַהֲוָה', 'נְהוֹרָא'],
      'And the Lord said, Let there be light, and there was light.',
      ARC_GLOSS
    ),
    sent(
      'Arc-Gen-2-2',
      ['וַחֲזָא', 'יְיָ', 'יָת', 'נְהוֹרָא', 'אֲרֵי', 'טָב', 'וְאַפְרֵישׁ', 'יְיָ', 'בֵּין', 'נְהוֹרָא', 'וּבֵין', 'חֲשׁוֹכָא'],
      'And the Lord saw the light, that it was good; and the Lord divided the light from the darkness.',
      ARC_GLOSS
    ),
    sent(
      'Arc-Gen-2-3',
      ['וּקְרָא', 'יְיָ', 'לִנְהוֹרָא', 'יְמָם', 'וְלַחֲשׁוֹכָא', 'קְרָא', 'לֵילְיָא', 'וַהֲוָה', 'רְמַשׁ', 'וַהֲוָה', 'צַפְרָא', 'יוֹם', 'חַד'],
      'And the Lord called the light Day, and the darkness he called Night. And there was evening and there was morning, one day.',
      ARC_GLOSS
    ),
  ],
};

export const ARC_DANIEL_1: TextSection = {
  id: 'Arc-Dan-1',
  textId: 'Arc-Dan',
  sequence: 1,
  label: "Daniel 2:1–5 — Nebuchadnezzar's Dream",
  sentences: [
    sent(
      'Arc-Dan-1-1',
      ['וּבִשְׁנַ֣ת', 'שְׁתַּ֔יִם', 'לְמַלְכ֖וּת', 'נְבֻכַדְנֶצַּ֑ר', 'חֲלַ֣ם', 'נְבֻכַדְנֶצַּר֮', 'חֲלָם֒', 'וַתִּתְפָּ֣עֶם', 'רוּחֹ֔ה', 'וּשְׁנָתֹ֖ו', 'נִהְיְתָ֥ה', 'עָלֹֽוהִי'],
      'In the second year of the reign of Nebuchadnezzar, Nebuchadnezzar dreamed dreams, and his spirit was troubled, and his sleep left him.',
      ARC_GLOSS
    ),
    sent(
      'Arc-Dan-1-2',
      ['וַיֹּ֧אמֶר', 'הַמֶּ֛לֶךְ', 'לִקְרֹ֥א', 'לַֽחַרְטֻמִּ֖ים', 'וְלָֽאַשָּׁפִ֑ים', 'וְלַֽמְכַשְּׁפִ֖ים', 'וְלַכַּשְׂדָּאִ֛ים', 'לְהַגִּ֥יד', 'לַמֶּ֖לֶךְ', 'חֲלֹמֹתָ֑יו', 'וַיָּבֹ֕אוּ', 'וַיַּֽעַמְד֖וּ', 'לִפְנֵ֥י', 'הַמֶּֽלֶךְ'],
      'And the king commanded to call the magicians, the enchanters, the sorcerers, and the Chaldeans, to tell the king his dreams. So they came in and stood before the king.',
      ARC_GLOSS
    ),
    sent(
      'Arc-Dan-1-3',
      ['וַיֹּ֧אמֶר', 'לָהֶ֛ם', 'הַמֶּ֖לֶךְ', 'חֲל֣וֹם', 'חָלָ֑מְתִּי', 'וַתִּפָּ֣עֶם', 'רוּחִ֔י', 'לָדַ֖עַת', 'אֶֽת־הַחֲלֽוֹם'],
      'And the king said to them, I have dreamed a dream, and my spirit is troubled to know the dream.',
      ARC_GLOSS
    ),
  ],
};

export const ALL_ARAMAIC_EXTENDED_SECTIONS: TextSection[] = [ARC_GENESIS_2, ARC_DANIEL_1];
