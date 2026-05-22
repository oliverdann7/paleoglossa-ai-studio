/**
 * Hebrew Extended Corpus 2 — Book of Ruth (Westminster Leningrad Codex, public domain)
 *
 * The Book of Ruth in four chapters. Beginner-friendly Hebrew narrative,
 * familiar storyline, repetitive vocabulary. Hebrew text from the WLC.
 * English translation adapted from public-domain sources (ESV-style register).
 */

import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–׃]+|[\s.,;:!?()"«»—–׃]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[֑-ׇ]/g, '').toLowerCase();
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

// ─── Ruth 1 — Naomi, Ruth, and Orpah ─────────────────────────────────────────

export const HEB_RUTH_1: TextSection = {
  id: 'Heb-Ruth-1',
  textId: 'Heb-Ruth',
  sequence: 1,
  label: 'רוּת א:א-ה — Ruth 1:1-5 — Famine and Death in Moab',
  sentences: [
    sent('Heb-Ruth-1-1', ['וַיְהִי', 'בִּימֵי', 'שְׁפֹט', 'הַשֹּׁפְטִים', 'וַיְהִי', 'רָעָב', 'בָּאָרֶץ', 'וַיֵּלֶךְ', 'אִישׁ', 'מִבֵּית', 'לֶחֶם', 'יְהוּדָה', 'לָגוּר', 'בִּשְׂדֵי', 'מוֹאָב', 'הוּא', 'וְאִשְׁתּוֹ', 'וּשְׁנֵי', 'בָנָיו׃'], 'In the days when the judges ruled, there was a famine in the land, and a man of Bethlehem in Judah went to sojourn in the country of Moab, he and his wife and his two sons.'),
    sent('Heb-Ruth-1-2', ['וְשֵׁם', 'הָאִישׁ', 'אֱלִימֶלֶךְ', 'וְשֵׁם', 'אִשְׁתּוֹ', 'נָעֳמִי', 'וְשֵׁם', 'שְׁנֵי-בָנָיו', 'מַחְלוֹן', 'וְכִלְיוֹן', 'אֶפְרָתִים', 'מִבֵּית', 'לֶחֶם', 'יְהוּדָה', 'וַיָּבֹאוּ', 'שְׂדֵי-מוֹאָב', 'וַיִּהְיוּ-שָׁם׃'], 'The name of the man was Elimelech and the name of his wife Naomi, and the names of his two sons were Mahlon and Chilion. They were Ephrathites from Bethlehem in Judah, and they went into the country of Moab and remained there.'),
    sent('Heb-Ruth-1-3', ['וַיָּמָת', 'אֱלִימֶלֶךְ', 'אִישׁ', 'נָעֳמִי', 'וַתִּשָּׁאֵר', 'הִיא', 'וּשְׁנֵי', 'בָנֶיהָ׃'], 'But Elimelech, the husband of Naomi, died, and she was left with her two sons.'),
    sent('Heb-Ruth-1-4', ['וַיִּשְׂאוּ', 'לָהֶם', 'נָשִׁים', 'מֹאֲבִיּוֹת', 'שֵׁם', 'הָאַחַת', 'עָרְפָּה', 'וְשֵׁם', 'הַשֵּׁנִית', 'רוּת', 'וַיֵּשְׁבוּ', 'שָׁם', 'כְּעֶשֶׂר', 'שָׁנִים׃'], 'These took Moabite wives; the name of the one was Orpah and the name of the other Ruth. They lived there about ten years.'),
    sent('Heb-Ruth-1-5', ['וַיָּמוּתוּ', 'גַם-שְׁנֵיהֶם', 'מַחְלוֹן', 'וְכִלְיוֹן', 'וַתִּשָּׁאֵר', 'הָאִשָּׁה', 'מִשְּׁנֵי', 'יְלָדֶיהָ', 'וּמֵאִישָׁהּ׃'], 'And both Mahlon and Chilion died, so that the woman was left without her two sons and her husband.'),
  ],
};

export const HEB_RUTH_2: TextSection = {
  id: 'Heb-Ruth-2',
  textId: 'Heb-Ruth',
  sequence: 2,
  label: 'רוּת א:ו-יד — Ruth 1:6-14 — Naomi Returns',
  sentences: [
    sent('Heb-Ruth-2-1', ['וַתָּקָם', 'הִיא', 'וְכַלֹּתֶיהָ', 'וַתָּשָׁב', 'מִשְּׂדֵי', 'מוֹאָב', 'כִּי', 'שָׁמְעָה', 'בִּשְׂדֵה', 'מוֹאָב', 'כִּי-פָקַד', 'יְהוָה', 'אֶת-עַמּוֹ', 'לָתֵת', 'לָהֶם', 'לָחֶם׃'], 'Then she arose with her daughters-in-law to return from the country of Moab, for she had heard in the fields of Moab that the LORD had visited his people and given them food.'),
    sent('Heb-Ruth-2-2', ['וַתֵּצֵא', 'מִן-הַמָּקוֹם', 'אֲשֶׁר', 'הָיְתָה-שָּׁמָּה', 'וּשְׁתֵּי', 'כַלֹּתֶיהָ', 'עִמָּהּ', 'וַתֵּלַכְנָה', 'בַדֶּרֶךְ', 'לָשׁוּב', 'אֶל-אֶרֶץ', 'יְהוּדָה׃'], 'So she set out from the place where she was, with her two daughters-in-law, and they went on the way to return to the land of Judah.'),
    sent('Heb-Ruth-2-3', ['וַתֹּאמֶר', 'נָעֳמִי', 'לִשְׁתֵּי', 'כַלֹּתֶיהָ', 'לֵכְנָה', 'שֹּׁבְנָה', 'אִשָּׁה', 'לְבֵית', 'אִמָּהּ', 'יַעַשׂ', 'יְהוָה', 'עִמָּכֶם', 'חֶסֶד', 'כַּאֲשֶׁר', 'עֲשִׂיתֶם', 'עִם-הַמֵּתִים', 'וְעִמָּדִי׃'], 'But Naomi said to her two daughters-in-law: Go, return each of you to her mother’s house. May the LORD deal kindly with you, as you have dealt with the dead and with me.'),
    sent('Heb-Ruth-2-4', ['יִתֵּן', 'יְהוָה', 'לָכֶם', 'וּמְצֶאןָ', 'מְנוּחָה', 'אִשָּׁה', 'בֵּית', 'אִישָׁהּ', 'וַתִּשַּׁק', 'לָהֶן', 'וַתִּשֶּׂאנָה', 'קוֹלָן', 'וַתִּבְכֶּינָה׃'], 'May the LORD grant that you may find rest, each in the house of her husband. Then she kissed them, and they lifted up their voices and wept.'),
    sent('Heb-Ruth-2-5', ['וַתֹּאמַרְנָה-לָּהּ', 'כִּי-אִתָּךְ', 'נָשׁוּב', 'לְעַמֵּךְ׃'], 'And they said to her, No, we will return with you to your people.'),
    sent('Heb-Ruth-2-6', ['וַתִּשַּׂק', 'עָרְפָּה', 'לַחֲמוֹתָהּ', 'וְרוּת', 'דָּבְקָה', 'בָּהּ׃'], 'Then Orpah kissed her mother-in-law, but Ruth clung to her.'),
  ],
};

export const HEB_RUTH_3: TextSection = {
  id: 'Heb-Ruth-3',
  textId: 'Heb-Ruth',
  sequence: 3,
  label: 'רוּת א:טז-יז — Ruth 1:16-17 — Where You Go, I Will Go',
  sentences: [
    sent('Heb-Ruth-3-1', ['וַתֹּאמֶר', 'רוּת', 'אַל-תִּפְגְּעִי-בִי', 'לְעָזְבֵךְ', 'לָשׁוּב', 'מֵאַחֲרָיִךְ'], 'But Ruth said: Do not urge me to leave you or to return from following you.'),
    sent('Heb-Ruth-3-2', ['כִּי', 'אֶל-אֲשֶׁר', 'תֵּלְכִי', 'אֵלֵךְ', 'וּבַאֲשֶׁר', 'תָּלִינִי', 'אָלִין'], 'For where you go I will go, and where you lodge I will lodge.'),
    sent('Heb-Ruth-3-3', ['עַמֵּךְ', 'עַמִּי', 'וֵאלֹהַיִךְ', 'אֱלֹהָי׃'], 'Your people shall be my people, and your God my God.'),
    sent('Heb-Ruth-3-4', ['בַּאֲשֶׁר', 'תָּמוּתִי', 'אָמוּת', 'וְשָׁם', 'אֶקָּבֵר'], 'Where you die I will die, and there will I be buried.'),
    sent('Heb-Ruth-3-5', ['יַעֲשֶׂה', 'יְהוָה', 'לִי', 'וְכֹה', 'יֹסִיף', 'כִּי', 'הַמָּוֶת', 'יַפְרִיד', 'בֵּינִי', 'וּבֵינֵךְ׃'], 'May the LORD do so to me and more also if anything but death parts me from you.'),
  ],
};

export const HEB_RUTH_4: TextSection = {
  id: 'Heb-Ruth-4',
  textId: 'Heb-Ruth',
  sequence: 4,
  label: 'רוּת ב — Ruth 2 — Ruth Meets Boaz',
  sentences: [
    sent('Heb-Ruth-4-1', ['וּלְנָעֳמִי', 'מוֹדָע', 'לְאִישָׁהּ', 'אִישׁ', 'גִּבּוֹר', 'חַיִל', 'מִמִּשְׁפַּחַת', 'אֱלִימֶלֶךְ', 'וּשְׁמוֹ', 'בֹּעַז׃'], 'Now Naomi had a relative of her husband’s, a worthy man of the clan of Elimelech, whose name was Boaz.'),
    sent('Heb-Ruth-4-2', ['וַתֹּאמֶר', 'רוּת', 'הַמּוֹאֲבִיָּה', 'אֶל-נָעֳמִי', 'אֵלְכָה-נָּא', 'הַשָּׂדֶה', 'וַאֲלַקֳטָה', 'בַשִּׁבֳּלִים׃'], 'And Ruth the Moabite said to Naomi: Let me go to the field and glean among the ears of grain.'),
    sent('Heb-Ruth-4-3', ['וַתֵּלֶךְ', 'וַתָּבוֹא', 'וַתְּלַקֵּט', 'בַּשָּׂדֶה', 'אַחֲרֵי', 'הַקֹּצְרִים', 'וַיִּקֶר', 'מִקְרֶהָ', 'חֶלְקַת', 'הַשָּׂדֶה', 'לְבֹעַז׃'], 'So she went out and gleaned in the field after the reapers, and she happened to come to the part of the field belonging to Boaz.'),
    sent('Heb-Ruth-4-4', ['וְהִנֵּה-בֹעַז', 'בָּא', 'מִבֵּית', 'לֶחֶם', 'וַיֹּאמֶר', 'לַקּוֹצְרִים', 'יְהוָה', 'עִמָּכֶם', 'וַיֹּאמְרוּ', 'לוֹ', 'יְבָרֶכְךָ', 'יְהוָה׃'], 'And behold, Boaz came from Bethlehem and said to the reapers: The LORD be with you! And they answered, The LORD bless you.'),
    sent('Heb-Ruth-4-5', ['וַיֹּאמֶר', 'בֹּעַז', 'אֶל-רוּת', 'הֲלוֹא', 'שָׁמַעַתְּ', 'בִּתִּי', 'אַל-תֵּלְכִי', 'לִלְקֹט', 'בְּשָׂדֶה', 'אַחֵר'], 'Then Boaz said to Ruth: Now, listen, my daughter, do not go to glean in another field.'),
    sent('Heb-Ruth-4-6', ['וְכֹה', 'תִדְבָּקִין', 'עִם-נַעֲרֹתָי׃'], 'But keep close to my young women.'),
  ],
};

export const HEB_RUTH_5: TextSection = {
  id: 'Heb-Ruth-5',
  textId: 'Heb-Ruth',
  sequence: 5,
  label: 'רוּת ג — Ruth 3 — At the Threshing Floor',
  sentences: [
    sent('Heb-Ruth-5-1', ['וַתֹּאמֶר', 'לָהּ', 'נָעֳמִי', 'חֲמוֹתָהּ', 'בִּתִּי', 'הֲלֹא', 'אֲבַקֶּשׁ-לָךְ', 'מָנוֹחַ', 'אֲשֶׁר', 'יִיטַב-לָךְ׃'], 'Then Naomi her mother-in-law said to her: My daughter, should I not seek rest for you, that it may be well with you?'),
    sent('Heb-Ruth-5-2', ['וַתֵּרֶד', 'הַגֹּרֶן', 'וַתַּעַשׂ', 'כְּכֹל', 'אֲשֶׁר-צִוַּתָּה', 'חֲמוֹתָהּ׃'], 'So she went down to the threshing floor and did just as her mother-in-law had commanded her.'),
    sent('Heb-Ruth-5-3', ['וַיֹּאכַל', 'בֹּעַז', 'וַיֵּשְׁתְּ', 'וַיִּיטַב', 'לִבּוֹ', 'וַיָּבֹא', 'לִשְׁכַּב', 'בִּקְצֵה', 'הָעֲרֵמָה', 'וַתָּבֹא', 'בַלָּט', 'וַתְּגַל', 'מַרְגְּלֹתָיו', 'וַתִּשְׁכָּב׃'], 'And when Boaz had eaten and drunk, and his heart was merry, he went to lie down at the end of the heap of grain. Then she came softly and uncovered his feet and lay down.'),
    sent('Heb-Ruth-5-4', ['וַיֹּאמֶר', 'מִי-אָתְּ', 'וַתֹּאמֶר', 'אָנֹכִי', 'רוּת', 'אֲמָתֶךָ', 'וּפָרַשְׂתָּ', 'כְנָפֶךָ', 'עַל-אֲמָתְךָ', 'כִּי', 'גֹאֵל', 'אָתָּה׃'], 'He said: Who are you? And she answered: I am Ruth, your servant. Spread your wings over your servant, for you are a redeemer.'),
  ],
};

export const HEB_RUTH_6: TextSection = {
  id: 'Heb-Ruth-6',
  textId: 'Heb-Ruth',
  sequence: 6,
  label: 'רוּת ד:יג-יז — Ruth 4:13-17 — The Redemption and the Son',
  sentences: [
    sent('Heb-Ruth-6-1', ['וַיִּקַּח', 'בֹּעַז', 'אֶת-רוּת', 'וַתְּהִי-לוֹ', 'לְאִשָּׁה', 'וַיָּבֹא', 'אֵלֶיהָ', 'וַיִּתֵּן', 'יְהוָה', 'לָהּ', 'הֵרָיוֹן', 'וַתֵּלֶד', 'בֵּן׃'], 'So Boaz took Ruth, and she became his wife. And he went in to her, and the LORD gave her conception, and she bore a son.'),
    sent('Heb-Ruth-6-2', ['וַתֹּאמַרְנָה', 'הַנָּשִׁים', 'אֶל-נָעֳמִי', 'בָּרוּךְ', 'יְהוָה', 'אֲשֶׁר', 'לֹא', 'הִשְׁבִּית', 'לָךְ', 'גֹּאֵל', 'הַיּוֹם׃'], 'Then the women said to Naomi: Blessed be the LORD, who has not left you this day without a redeemer.'),
    sent('Heb-Ruth-6-3', ['וַתִּקַּח', 'נָעֳמִי', 'אֶת-הַיֶּלֶד', 'וַתְּשִׁתֵהוּ', 'בְחֵיקָהּ', 'וַתְּהִי-לוֹ', 'לְאֹמֶנֶת׃'], 'Then Naomi took the child and laid him on her lap and became his nurse.'),
    sent('Heb-Ruth-6-4', ['וַתִּקְרֶאנָה', 'לוֹ', 'הַשְּׁכֵנוֹת', 'שֵׁם', 'לֵאמֹר', 'יֻלַּד-בֵּן', 'לְנָעֳמִי', 'וַתִּקְרֶאנָה', 'שְׁמוֹ', 'עוֹבֵד', 'הוּא', 'אֲבִי-יִשַׁי', 'אֲבִי', 'דָוִד׃'], 'And the women of the neighborhood gave him a name, saying: A son has been born to Naomi. They named him Obed. He was the father of Jesse, the father of David.'),
  ],
};

export const ALL_HEBREW_EXTENDED_2_SECTIONS: TextSection[] = [
  HEB_RUTH_1,
  HEB_RUTH_2,
  HEB_RUTH_3,
  HEB_RUTH_4,
  HEB_RUTH_5,
  HEB_RUTH_6,
];
