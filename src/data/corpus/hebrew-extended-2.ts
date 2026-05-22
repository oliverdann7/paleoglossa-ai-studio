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

export const HEB_RUTH_1: TextSection = {
  id: 'Heb-Ruth-1',
  textId: 'Heb-Ruth',
  sequence: 1,
  label: 'Ruth 1:1–5 — Naomi and Her Daughters-in-Law',
  sentences: [
    sent('Heb-Ruth-1-1', ['וַיְהִ֗י', 'בִּימֵי֙', 'שְׁפֹ֣ט', 'הַשֹּׁפְטִ֔ים', 'וַיְהִ֥י', 'רָעָ֖ב', 'בָּאָ֑רֶץ', 'וַיֵּ֨לֶךְ', 'אִ֜ישׁ', 'מִבֵּ֧ית', 'לֶ֣חֶם', 'יְהוּדָ֗ה', 'לָגוּר֙', 'בִּשְׂדֵ֣י', 'מוֹאָ֔ב', 'ה֥וּא', 'וְאִשְׁתּ֖וֹ', 'וּשְׁנֵ֥י', 'בָנָֽיו׃'], 'In the days when the judges ruled, there was a famine in the land. And a certain man of Bethlehem in Judah went to sojourn in the country of Moab, he and his wife and his two sons.'),
    sent('Heb-Ruth-1-2', ['וְשֵׁ֣ם', 'הָאִ֣ישׁ', 'אֱלִימֶ֗לֶךְ', 'וְשֵׁ֨ם', 'אִשְׁתּ֤וֹ', 'נָעֳמִי֙', 'וְשֵׁ֣ם', 'שְׁנֵ֣י', 'בָנָ֔יו', 'מַחְל֣וֹן', 'וְכִלְי֔וֹן', 'אֶפְרָתִ֔ים', 'מִבֵּ֥ית', 'לֶ֖חֶם', 'יְהוּדָ֑ה', 'וַיָּבֹ֥אוּ', 'שְׂדֵי־מוֹאָ֖ב', 'וַיִּֽהְיוּ־שָֽׁם׃'], 'The name of the man was Elimelech and the name of his wife Naomi, and the names of his two sons were Mahlon and Chilion. They were Ephrathites from Bethlehem in Judah. They entered the country of Moab and remained there.'),
    sent('Heb-Ruth-1-3', ['וַיָּ֥מָת', 'אֱלִימֶ֖לֶךְ', 'אִ֣ישׁ', 'נָעֳמִ֑י', 'וַתִּשָּׁאֵ֥ר', 'הִ֖יא', 'וּשְׁנֵ֥י', 'בָנֶֽיהָ׃'], 'But Elimelech, the husband of Naomi, died, and she was left with her two sons.'),
    sent('Heb-Ruth-1-4', ['וַיִּשְׂא֣וּ', 'לָהֶ֗ם', 'נָשִׁים֙', 'מֹֽאֲבִיּ֔וֹת', 'שֵׁ֤ם', 'הָאַחַת֙', 'עָרְפָּ֔ה', 'וְשֵׁ֥ם', 'הַשֵּׁנִ֖ית', 'ר֑וּת', 'וַיֵּ֥שְׁבוּ', 'שָׁ֖ם', 'כְּעֶ֥שֶׂר', 'שָׁנִֽים׃'], 'They took Moabite wives; the name of the one was Orpah and the name of the other Ruth. They lived there about ten years.'),
    sent('Heb-Ruth-1-5', ['וַיָּמ֥וּתוּ', 'גַם־שְׁנֵיהֶ֖ם', 'מַחְל֣וֹן', 'וְכִלְי֑וֹן', 'וַתִּשָּׁאֵר֙', 'הָֽאִשָּׁ֔ה', 'מִשְּׁנֵ֥י', 'יְלָדֶ֖יהָ', 'וּמֵאִישָֽׁהּ׃'], 'And both Mahlon and Chilion died, so that the woman was left without her two sons and her husband.'),
  ],
};

export const HEB_RUTH_2: TextSection = {
  id: 'Heb-Ruth-2',
  textId: 'Heb-Ruth',
  sequence: 2,
  label: 'Ruth 1:16–17 — Where You Go I Will Go',
  sentences: [
    sent('Heb-Ruth-2-1', ['וַתֹּ֤אמֶר', 'רוּת֙', 'אַל־תִּפְגְּעִי־בִ֔י', 'לְעָזְבֵ֖ךְ', 'לָשׁ֣וּב', 'מֵאַחֲרָ֑יִךְ', 'כִּ֠י', 'אֶל־אֲשֶׁ֨ר', 'תֵּלְכִ֤י', 'אֵלֵ֔ךְ', 'וּבַאֲשֶׁ֥ר', 'תָּלִ֖ינִי', 'אָלִ֑ין', 'עַמֵּ֣ךְ', 'עַמִּ֔י', 'וֵאלֹהַ֖יִךְ', 'אֱלֹהָֽי׃'], 'But Ruth said, Do not urge me to leave you or to return from following you. For where you go I will go, and where you lodge I will lodge. Your people shall be my people, and your God my God.'),
    sent('Heb-Ruth-2-2', ['בַּאֲשֶׁ֥ר', 'תָּמ֛וּתִי', 'אָמ֖וּת', 'וְשָׁ֣ם', 'אֶקָּבֵ֑ר', 'יַעֲשֶׂה֩', 'יְהוָ֨ה', 'לִ֜י', 'וְכֹ֣ה', 'יֹסִ֗יף', 'כִּ֣י', 'הַמָּ֔וֶת', 'יַפְרִ֖יד', 'בֵּינִ֥י', 'וּבֵינֵֽךְ׃'], 'Where you die I will die, and there will I be buried. May the Lord do so to me and more also if anything but death parts me from you.'),
  ],
};

export const ALL_HEBREW_EXTENDED_2_SECTIONS: TextSection[] = [
  HEB_RUTH_1,
  HEB_RUTH_2,
];
