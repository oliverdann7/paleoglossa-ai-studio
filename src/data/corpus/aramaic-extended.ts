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

export const ARC_GENESIS_2: TextSection = {
  id: 'Arc-Gen-2',
  textId: 'Arc-Gen',
  sequence: 2,
  label: 'Targum Onkelos Genesis 1:3–5 — Let There Be Light',
  sentences: [
    sent('Arc-Gen-2-1', ['וַאֲמַר', 'יְיָ', 'לֶיהֱוֵי', 'נְהוֹרָא', 'וַהֲוָה', 'נְהוֹרָא'], 'And the Lord said, Let there be light, and there was light.'),
    sent('Arc-Gen-2-2', ['וַחֲזָא', 'יְיָ', 'יָת', 'נְהוֹרָא', 'אֲרֵי', 'טָב', 'וְאַפְרֵישׁ', 'יְיָ', 'בֵּין', 'נְהוֹרָא', 'וּבֵין', 'חֲשׁוֹכָא'], 'And the Lord saw the light, that it was good; and the Lord divided the light from the darkness.'),
    sent('Arc-Gen-2-3', ['וּקְרָא', 'יְיָ', 'לִנְהוֹרָא', 'יְמָם', 'וְלַחֲשׁוֹכָא', 'קְרָא', 'לֵילְיָא', 'וַהֲוָה', 'רְמַשׁ', 'וַהֲוָה', 'צַפְרָא', 'יוֹם', 'חַד'], 'And the Lord called the light Day, and the darkness he called Night. And there was evening and there was morning, one day.'),
  ],
};

export const ARC_DANIEL_1: TextSection = {
  id: 'Arc-Dan-1',
  textId: 'Arc-Dan',
  sequence: 1,
  label: 'Daniel 2:1–5 — Nebuchadnezzar\'s Dream',
  sentences: [
    sent('Arc-Dan-1-1', ['וּבִשְׁנַ֣ת', 'שְׁתַּ֔יִם', 'לְמַלְכ֖וּת', 'נְבֻכַדְנֶצַּ֑ר', 'חֲלַ֣ם', 'נְבֻכַדְנֶצַּר֮', 'חֲלָם֒', 'וַתִּתְפָּ֣עֶם', 'רוּחֹ֔ה', 'וּשְׁנָתֹ֖ו', 'נִהְיְתָ֥ה', 'עָלֹֽוהִי'], 'In the second year of the reign of Nebuchadnezzar, Nebuchadnezzar dreamed dreams, and his spirit was troubled, and his sleep left him.'),
    sent('Arc-Dan-1-2', ['וַיֹּ֧אמֶר', 'הַמֶּ֛לֶךְ', 'לִקְרֹ֥א', 'לַֽחַרְטֻמִּ֖ים', 'וְלָֽאַשָּׁפִ֑ים', 'וְלַֽמְכַשְּׁפִ֖ים', 'וְלַכַּשְׂדָּאִ֛ים', 'לְהַגִּ֥יד', 'לַמֶּ֖לֶךְ', 'חֲלֹמֹתָ֑יו', 'וַיָּבֹ֕אוּ', 'וַיַּֽעַמְד֖וּ', 'לִפְנֵ֥י', 'הַמֶּֽלֶךְ'], 'And the king commanded to call the magicians, the enchanters, the sorcerers, and the Chaldeans, to tell the king his dreams. So they came in and stood before the king.'),
    sent('Arc-Dan-1-3', ['וַיֹּ֧אמֶר', 'לָהֶ֛ם', 'הַמֶּ֖לֶךְ', 'חֲל֣וֹם', 'חָלָ֑מְתִּי', 'וַתִּפָּ֣עֶם', 'רוּחִ֔י', 'לָדַ֖עַת', 'אֶֽת־הַחֲלֽוֹם'], 'And the king said to them, I have dreamed a dream, and my spirit is troubled to know the dream.'),
  ],
};

export const ALL_ARAMAIC_EXTENDED_SECTIONS: TextSection[] = [
  ARC_GENESIS_2,
  ARC_DANIEL_1,
];
