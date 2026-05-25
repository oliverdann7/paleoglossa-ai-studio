/**
 * Hebrew Beginner — Book of Jonah (complete, 4 chapters)
 * Text: Westminster Leningrad Codex (WLC) — public domain.
 * Translation: adapted from public-domain English versions.
 *
 * Jonah is ideal for beginners: short narrative, familiar story,
 * repetitive vocabulary, complete in 4 chapters (~48 verses).
 * Also included: Psalm 91 — protective psalm, short and thematic.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–׃]+|[\s.,;:!?()"«»—–׃]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized: clean,
        lemma: clean,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── Jonah 1 ─────────────────────────────────────────────────────────────────

export const HEB_JONAH_1: TextSection = {
  id: 'Heb-Jon-1',
  textId: 'Heb-Jonah',
  sequence: 1,
  label: 'יוֹנָה א — Jonah Chapter 1',
  sentences: [
    sent(
      'Jon-1-1',
      ['וַיְהִי', 'דְבַר-יְהוָה', 'אֶל-יוֹנָה', 'בֶן-אֲמִתַּי', 'לֵאמֹר׃'],
      'Now the word of the LORD came to Jonah son of Amittai, saying:'
    ),
    sent(
      'Jon-1-2',
      [
        'קוּם',
        'לֵךְ',
        'אֶל-נִינְוֵה',
        'הָעִיר',
        'הַגְּדוֹלָה',
        'וּקְרָא',
        'עָלֶיהָ',
        'כִּי-עָלְתָה',
        'רָעָתָם',
        'לְפָנָי׃',
      ],
      'Arise, go to Nineveh, that great city, and call out against it, for their evil has come up before me.'
    ),
    sent(
      'Jon-1-3',
      ['וַיָּקָם', 'יוֹנָה', 'לִבְרֹחַ', 'תַּרְשִׁישָׁה', 'מִלִּפְנֵי', 'יְהוָה'],
      'But Jonah rose to flee to Tarshish from the presence of the LORD.'
    ),
    sent(
      'Jon-1-4',
      [
        'וַיֵּרֶד',
        'יָפוֹ',
        'וַיִּמְצָא',
        'אֳנִיָּה',
        'בָּאָה',
        'תַרְשִׁישׁ',
        'וַיִּתֵּן',
        'שְׂכָרָהּ',
        'וַיֵּרֶד',
        'בָּהּ׃',
      ],
      'He went down to Joppa and found a ship going to Tarshish. So he paid the fare and went down into it.'
    ),
    sent(
      'Jon-1-5',
      [
        'וַיהוָה',
        'הֵטִיל',
        'רוּחַ-גְּדוֹלָה',
        'אֶל-הַיָּם',
        'וַיְהִי',
        'סַעַר-גָּדוֹל',
        'בַּיָּם׃',
      ],
      'But the LORD hurled a great wind upon the sea, and there was a mighty tempest on the sea.'
    ),
    sent(
      'Jon-1-6',
      ['וַיִּירְאוּ', 'הַמַּלָּחִים', 'וַיִּזְעֲקוּ', 'אִישׁ', 'אֶל-אֱלֹהָיו'],
      'Then the mariners were afraid, and each cried out to his god.'
    ),
    sent(
      'Jon-1-7',
      ['וְיוֹנָה', 'יָרַד', 'אֶל-יַרְכְּתֵי', 'הַסְּפִינָה', 'וַיִּשְׁכַּב', 'וַיֵּרָדַם׃'],
      'But Jonah had gone down into the inner part of the ship and had lain down and was fast asleep.'
    ),
    sent(
      'Jon-1-8',
      [
        'וַיִּקְרַב',
        'אֵלָיו',
        'רַב',
        'הַחֹבֵל',
        'וַיֹּאמֶר',
        'לוֹ',
        'מַה-לְּךָ',
        'נִרְדָּם',
        'קוּם',
        'קְרָא',
        'אֶל-אֱלֹהֶיךָ׃',
      ],
      'So the captain came and said to him: What are you doing asleep? Arise, call out to your god!'
    ),
    sent(
      'Jon-1-9',
      ['וַיַּפִּילוּ', 'גוֹרָלוֹת', 'וַיִּפֹּל', 'הַגּוֹרָל', 'עַל-יוֹנָה׃'],
      'And they cast lots, and the lot fell on Jonah.'
    ),
    sent(
      'Jon-1-10',
      [
        'וַיֹּאמֶר',
        'אֲלֵיהֶם',
        'עִבְרִי',
        'אָנֹכִי',
        'וְאֶת-יְהוָה',
        'אֱלֹהֵי',
        'הַשָּׁמַיִם',
        'אֲנִי',
        'יָרֵא׃',
      ],
      'He said to them: I am a Hebrew, and I fear the LORD, the God of heaven.'
    ),
    sent(
      'Jon-1-11',
      [
        'וַיֹּאמֶר',
        'אֲלֵיהֶם',
        'שָׂאוּנִי',
        'וַהֲטִילֻנִי',
        'אֶל-הַיָּם',
        'וְיִשְׁקֹט',
        'הַיָּם',
        'מֵעֲלֵיכֶם׃',
      ],
      'He said to them: Pick me up and hurl me into the sea; then the sea will quiet down for you.'
    ),
    sent(
      'Jon-1-12',
      [
        'וַיִּשְׂאוּ',
        'אֶת-יוֹנָה',
        'וַיְטִלֻהוּ',
        'אֶל-הַיָּם',
        'וַיַּעֲמֹד',
        'הַיָּם',
        'מִזַּעְפּוֹ׃',
      ],
      'So they picked up Jonah and hurled him into the sea, and the sea ceased from its raging.'
    ),
    sent(
      'Jon-1-13',
      ['וַיְמַן', 'יְהוָה', 'דָּג', 'גָּדוֹל', 'לִבְלֹעַ', 'אֶת-יוֹנָה׃'],
      'And the LORD appointed a great fish to swallow up Jonah.'
    ),
    sent(
      'Jon-1-14',
      ['וַיְהִי', 'יוֹנָה', 'בִּמְעֵי', 'הַדָּג', 'שְׁלֹשָׁה', 'יָמִים', 'וּשְׁלֹשָׁה', 'לֵילוֹת׃'],
      'And Jonah was in the belly of the fish three days and three nights.'
    ),
  ],
};

// ─── Jonah 2 ─────────────────────────────────────────────────────────────────

export const HEB_JONAH_2: TextSection = {
  id: 'Heb-Jon-2',
  textId: 'Heb-Jonah',
  sequence: 2,
  label: 'יוֹנָה ב — Jonah Chapter 2 (Prayer)',
  sentences: [
    sent(
      'Jon-2-1',
      ['וַיִּתְפַּלֵּל', 'יוֹנָה', 'אֶל-יְהוָה', 'אֱלֹהָיו', 'מִמְּעֵי', 'הַדָּגָה׃'],
      'Then Jonah prayed to the LORD his God from the belly of the fish.'
    ),
    sent(
      'Jon-2-2',
      ['קָרָאתִי', 'מִצָּרָה', 'לִי', 'אֶל-יְהוָה', 'וַיַּעֲנֵנִי'],
      'I called out to the LORD, out of my distress, and he answered me.'
    ),
    sent(
      'Jon-2-3',
      ['מִבֶּטֶן', 'שְׁאוֹל', 'שִׁוַּעְתִּי', 'שָׁמַעְתָּ', 'קוֹלִי׃'],
      'Out of the belly of Sheol I cried, and you heard my voice.'
    ),
    sent(
      'Jon-2-4',
      [
        'הַשְּׁלַכְתַּנִי',
        'מְצוּלָה',
        'בִּלְבַב',
        'יַמִּים',
        'וַיְסֹבְבֵנִי',
        'כָּל-מִשְׁבָּרֶיךָ',
        'וְגַלֶּיךָ',
        'עָלַי',
        'עָבָרוּ׃',
      ],
      'You cast me into the deep, into the heart of the seas; all your waves and your billows passed over me.'
    ),
    sent(
      'Jon-2-5',
      [
        'וַאֲנִי',
        'אָמַרְתִּי',
        'נִגְרַשְׁתִּי',
        'מִנֶּגֶד',
        'עֵינֶיךָ',
        'אַךְ',
        'אוֹסִיף',
        'לְהַבִּיט',
        'אֶל-הֵיכַל',
        'קָדְשֶׁךָ׃',
      ],
      'Then I said: I am driven away from your sight; yet I shall again look upon your holy temple.'
    ),
    sent(
      'Jon-2-6',
      ['הַמַּיִם', 'אֲפָפוּנִי', 'עַד-נֶפֶשׁ', 'תְּהוֹם', 'יְסֹבְבֵנִי'],
      'The waters closed in over me to take my life; the deep surrounded me.'
    ),
    sent(
      'Jon-2-7',
      ['וַתַּעַל', 'מִשַּׁחַת', 'חַיַּי', 'יְהוָה', 'אֱלֹהָי׃'],
      'Yet you brought up my life from the pit, O LORD my God.'
    ),
    sent(
      'Jon-2-8',
      [
        'אֲנִי',
        'בְּקוֹל',
        'תּוֹדָה',
        'אֶזְבְּחָה-לָּךְ',
        'אֲשֶׁר',
        'נָדַרְתִּי',
        'אֲשַׁלֵּמָה',
        'יְשׁוּעָתָה',
        'לַיהוָה׃',
      ],
      'But I with the voice of thanksgiving will sacrifice to you; what I have vowed I will pay. Salvation belongs to the LORD!'
    ),
    sent(
      'Jon-2-9',
      ['וַיֹּאמֶר', 'יְהוָה', 'לַדָּג', 'וַיָּקֵא', 'אֶת-יוֹנָה', 'אֶל-הַיַּבָּשָׁה׃'],
      'And the LORD spoke to the fish, and it vomited Jonah out upon the dry land.'
    ),
  ],
};

// ─── Jonah 3 ─────────────────────────────────────────────────────────────────

export const HEB_JONAH_3: TextSection = {
  id: 'Heb-Jon-3',
  textId: 'Heb-Jonah',
  sequence: 3,
  label: 'יוֹנָה ג — Jonah Chapter 3 (Nineveh repents)',
  sentences: [
    sent(
      'Jon-3-1',
      ['וַיְהִי', 'דְבַר-יְהוָה', 'אֶל-יוֹנָה', 'שֵׁנִית', 'לֵאמֹר׃'],
      'Then the word of the LORD came to Jonah the second time, saying:'
    ),
    sent(
      'Jon-3-2',
      [
        'קוּם',
        'לֵךְ',
        'אֶל-נִינְוֵה',
        'הָעִיר',
        'הַגְּדוֹלָה',
        'וּקְרָא',
        'אֵלֶיהָ',
        'אֶת-הַקְּרִיאָה',
        'אֲשֶׁר',
        'אָנֹכִי',
        'דֹּבֵר',
        'אֵלֶיךָ׃',
      ],
      'Arise, go to Nineveh, that great city, and call out against it the message that I tell you.'
    ),
    sent(
      'Jon-3-3',
      ['וַיָּקָם', 'יוֹנָה', 'וַיֵּלֶךְ', 'אֶל-נִינְוֵה', 'כִּדְבַר', 'יְהוָה׃'],
      'So Jonah arose and went to Nineveh, according to the word of the LORD.'
    ),
    sent(
      'Jon-3-4',
      [
        'וַיָּחֶל',
        'יוֹנָה',
        'לָבוֹא',
        'בָעִיר',
        'מַהֲלַךְ',
        'יוֹם',
        'אֶחָד',
        'וַיִּקְרָא',
        'וַיֹּאמַר',
        'עוֹד',
        'אַרְבָּעִים',
        'יוֹם',
        'וְנִינְוֵה',
        'נֶהְפָּכֶת׃',
      ],
      "Jonah began to go into the city, going a day's journey. And he called out: Yet forty days, and Nineveh shall be overthrown!"
    ),
    sent(
      'Jon-3-5',
      [
        'וַיַּאֲמִינוּ',
        'אַנְשֵׁי',
        'נִינְוֵה',
        'בֵּאלֹהִים',
        'וַיִּקְרְאוּ-צוֹם',
        'וַיִּלְבְּשׁוּ',
        'שַׂקִּים',
        'מִגְּדוֹלָם',
        'וְעַד-קְטַנָּם׃',
      ],
      'And the people of Nineveh believed God. They called for a fast and put on sackcloth, from the greatest to the least of them.'
    ),
    sent(
      'Jon-3-6',
      [
        'וַיִּגַּע',
        'הַדָּבָר',
        'אֶל-מֶלֶךְ',
        'נִינְוֵה',
        'וַיָּקָם',
        'מִכִּסְאוֹ',
        'וַיַּעֲבֵר',
        'אַדַּרְתּוֹ',
        'מֵעָלָיו',
        'וַיְכַס',
        'שַׂק',
        'וַיֵּשֶׁב',
        'עַל-הָאֵפֶר׃',
      ],
      'The word reached the king of Nineveh, and he arose from his throne, removed his robe, covered himself with sackcloth, and sat in ashes.'
    ),
    sent(
      'Jon-3-7',
      [
        'וַיַּרְא',
        'הָאֱלֹהִים',
        'אֶת-מַעֲשֵׂיהֶם',
        'כִּי-שָׁבוּ',
        'מִדַּרְכָּם',
        'הָרָעָה',
        'וַיִּנָּחֶם',
        'הָאֱלֹהִים',
        'עַל-הָרָעָה',
        'אֲשֶׁר-דִּבֶּר',
        'לַעֲשׂוֹת-לָהֶם',
        'וְלֹא',
        'עָשָׂה׃',
      ],
      'When God saw what they did, how they turned from their evil way, God relented of the disaster that he had said he would do to them, and he did not do it.'
    ),
  ],
};

// ─── Jonah 4 ─────────────────────────────────────────────────────────────────

export const HEB_JONAH_4: TextSection = {
  id: 'Heb-Jon-4',
  textId: 'Heb-Jonah',
  sequence: 4,
  label: "יוֹנָה ד — Jonah Chapter 4 (God's mercy)",
  sentences: [
    sent(
      'Jon-4-1',
      ['וַיֵּרַע', 'אֶל-יוֹנָה', 'רָעָה', 'גְדוֹלָה', 'וַיִּחַר', 'לוֹ׃'],
      'But it displeased Jonah exceedingly, and he was angry.'
    ),
    sent(
      'Jon-4-2',
      [
        'וַיִּתְפַּלֵּל',
        'אֶל-יְהוָה',
        'וַיֹּאמַר',
        'אָנָּה',
        'יְהוָה',
        'הֲלוֹא-זֶה',
        'דְבָרִי',
        'עַד-הֱיוֹתִי',
        'עַל-אַדְמָתִי׃',
      ],
      'And he prayed to the LORD and said: O LORD, is not this what I said when I was yet in my country?'
    ),
    sent(
      'Jon-4-3',
      [
        'כִּי',
        'יָדַעְתִּי',
        'כִּי',
        'אַתָּה',
        'אֵל-חַנּוּן',
        'וְרַחוּם',
        'אֶרֶךְ',
        'אַפַּיִם',
        'וְרַב-חֶסֶד',
        'וְנִחָם',
        'עַל-הָרָעָה׃',
      ],
      'For I knew that you are a gracious God and merciful, slow to anger and abounding in steadfast love, and relenting from disaster.'
    ),
    sent(
      'Jon-4-4',
      ['וַיִּגְדַּל', 'יוֹנָה', 'אֶל-הַקִּיקָיוֹן', 'שִׂמְחָה', 'גְדוֹלָה׃'],
      'And Jonah was exceedingly glad because of the plant.'
    ),
    sent(
      'Jon-4-5',
      [
        'וַיְמַן',
        'הָאֱלֹהִים',
        'תּוֹלַעַת',
        'בַּעֲלוֹת',
        'הַשַּׁחַר',
        'לַמָּחֳרָת',
        'וַתַּךְ',
        'אֶת-הַקִּיקָיוֹן',
        'וַיִּיבָשׁ׃',
      ],
      'But when dawn came up the next day, God appointed a worm that attacked the plant, so that it withered.'
    ),
    sent(
      'Jon-4-6',
      [
        'וַיֹּאמֶר',
        'יְהוָה',
        'אֶל-יוֹנָה',
        'הַהֵיטֵב',
        'חָרָה-לְךָ',
        'עַל-הַקִּיקָיוֹן',
        'וַיֹּאמֶר',
        'הֵיטֵב',
        'חָרָה-לִי',
        'עַד-מָוֶת׃',
      ],
      'But God said to Jonah: Do you do well to be angry for the plant? And he said: Yes, I do well to be angry, angry enough to die.'
    ),
    sent(
      'Jon-4-7',
      [
        'וַיֹּאמֶר',
        'יְהוָה',
        'אַתָּה',
        'חַסְתָּ',
        'עַל-הַקִּיקָיוֹן',
        'אֲשֶׁר',
        'לֹא-עָמַלְתָּ',
        'בּוֹ',
        'וְלֹא',
        'גִדַּלְתּוֹ',
        'שֶׁבֶן-לַיְלָה',
        'הָיָה',
        'וּבֶן-לַיְלָה',
        'אָבָד׃',
      ],
      'And the LORD said: You pity the plant, for which you did not labor, nor did you make it grow, which came into being in a night and perished in a night.'
    ),
    sent(
      'Jon-4-8',
      [
        'וַאֲנִי',
        'לֹא',
        'אָחוּס',
        'עַל-נִינְוֵה',
        'הָעִיר',
        'הַגְּדוֹלָה',
        'אֲשֶׁר',
        'יֶשׁ-בָּהּ',
        'הַרְבֵּה',
        'מִשְׁתֵּים-עֶשְׂרֵה',
        'רִבּוֹ',
        'אָדָם',
        'אֲשֶׁר',
        'לֹא-יָדַע',
        'בֵּין-יְמִינוֹ',
        'לִשְׂמֹאלוֹ׃',
      ],
      'And should not I pity Nineveh, that great city, in which there are more than 120,000 persons who do not know their right hand from their left?'
    ),
  ],
};

// ─── Psalm 91 — Protective Psalm ─────────────────────────────────────────────

export const HEB_PSALM_91: TextSection = {
  id: 'Heb-Ps-91',
  textId: 'Heb-Ps91',
  sequence: 1,
  label: 'תְּהִלִּים צא — Psalm 91',
  sentences: [
    sent(
      'Ps91-1',
      ['יֹשֵׁב', 'בְּסֵתֶר', 'עֶלְיוֹן', 'בְּצֵל', 'שַׁדַּי', 'יִתְלוֹנָן׃'],
      'He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.'
    ),
    sent(
      'Ps91-2',
      ['אֹמַר', 'לַיהוָה', 'מַחְסִי', 'וּמְצוּדָתִי', 'אֱלֹהַי', 'אֶבְטַח-בּוֹ׃'],
      'I will say to the LORD: My refuge and my fortress, my God, in whom I trust.'
    ),
    sent(
      'Ps91-3',
      ['כִּי', 'הוּא', 'יַצִּילְךָ', 'מִפַּח', 'יָקוּשׁ', 'מִדֶּבֶר', 'הַוּוֹת׃'],
      'For he will deliver you from the snare of the fowler and from the deadly pestilence.'
    ),
    sent(
      'Ps91-4',
      [
        'בְּאֶבְרָתוֹ',
        'יָסֶךְ',
        'לָךְ',
        'וְתַחַת-כְּנָפָיו',
        'תֶּחְסֶה',
        'צִנָּה',
        'וְסֹחֵרָה',
        'אֲמִתּוֹ׃',
      ],
      'He will cover you with his pinions, and under his wings you will find refuge; his faithfulness is a shield and buckler.'
    ),
    sent(
      'Ps91-5',
      ['לֹא-תִירָא', 'מִפַּחַד', 'לָיְלָה', 'מֵחֵץ', 'יָעוּף', 'יוֹמָם׃'],
      'You will not fear the terror of the night, nor the arrow that flies by day.'
    ),
    sent(
      'Ps91-6',
      ['כִּי', 'מַלְאָכָיו', 'יְצַוֶּה-לָּךְ', 'לִשְׁמָרְךָ', 'בְּכָל-דְּרָכֶיךָ׃'],
      'For he will command his angels concerning you to guard you in all your ways.'
    ),
    sent(
      'Ps91-7',
      ['עַל-כַּפַּיִם', 'יִשָּׂאוּנְךָ', 'פֶּן-תִּגֹּף', 'בָּאֶבֶן', 'רַגְלֶךָ׃'],
      'On their hands they will bear you up, lest you strike your foot against a stone.'
    ),
    sent(
      'Ps91-8',
      ['כִּי', 'בִי', 'חָשַׁק', 'וַאֲפַלְּטֵהוּ', 'אֲשַׂגְּבֵהוּ', 'כִּי-יָדַע', 'שְׁמִי׃'],
      'Because he holds fast to me in love, I will deliver him; I will protect him, because he knows my name.'
    ),
    sent(
      'Ps91-9',
      [
        'יִקְרָאֵנִי',
        'וְאֶעֱנֵהוּ',
        'עִמּוֹ-אָנֹכִי',
        'בְצָרָה',
        'אֲחַלְּצֵהוּ',
        'וַאֲכַבְּדֵהוּ׃',
      ],
      'When he calls to me, I will answer him; I will be with him in trouble; I will rescue him and honor him.'
    ),
    sent(
      'Ps91-10',
      ['אֹרֶךְ', 'יָמִים', 'אַשְׂבִּיעֵהוּ', 'וְאַרְאֵהוּ', 'בִּישׁוּעָתִי׃'],
      'With long life I will satisfy him and show him my salvation.'
    ),
  ],
};

export const ALL_HEBREW_BEGINNER_SECTIONS = [
  HEB_JONAH_1,
  HEB_JONAH_2,
  HEB_JONAH_3,
  HEB_JONAH_4,
  HEB_PSALM_91,
];
