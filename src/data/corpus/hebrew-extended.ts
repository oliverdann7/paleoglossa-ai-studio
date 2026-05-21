/**
 * Hebrew Extended — Genesis 1–3 + Psalm 23
 * Text: Westminster Leningrad Codex (WLC) — public domain.
 * Translation: adapted from public-domain English versions.
 *
 * Genesis 1: Creation narrative — most famous Hebrew passage, repetitive
 *   vocabulary (וַיֹּאמֶר, וַיְהִי, טוֹב), ideal entry point.
 * Genesis 2: Garden of Eden — introduces key vocabulary (אָדָם, אִשָּׁה, גַּן).
 * Genesis 3: The Fall — narrative tension, dialogue, high-frequency verbs.
 * Psalm 23: 6 verses, beloved, short — fast win for Hebrew beginners.
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

// ─── Genesis 1 ───────────────────────────────────────────────────────────────

export const HEB_GENESIS_1: TextSection = {
  id: 'Heb-Gen-1',
  textId: 'Heb-Genesis',
  sequence: 1,
  label: 'בְּרֵאשִׁית א — Genesis Chapter 1',
  sentences: [
    sent('Heb-Gen-1-1', ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', 'אֵת', 'הַשָּׁמַיִם', 'וְאֵת', 'הָאָרֶץ׃'], 'In the beginning God created the heavens and the earth.'),
    sent('Heb-Gen-1-2', ['וְהָאָרֶץ', 'הָיְתָה', 'תֹהוּ', 'וָבֹהוּ', 'וְחֹשֶׁךְ', 'עַל-פְּנֵי', 'תְהוֹם', 'וְרוּחַ', 'אֱלֹהִים', 'מְרַחֶפֶת', 'עַל-פְּנֵי', 'הַמָּיִם׃'], 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.'),
    sent('Heb-Gen-1-3', ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'אוֹר', 'וַיְהִי-אוֹר׃'], 'And God said, "Let there be light," and there was light.'),
    sent('Heb-Gen-1-4', ['וַיַּרְא', 'אֱלֹהִים', 'אֶת-הָאוֹר', 'כִּי-טוֹב', 'וַיַּבְדֵּל', 'אֱלֹהִים', 'בֵּין', 'הָאוֹר', 'וּבֵין', 'הַחֹשֶׁךְ׃'], 'And God saw that the light was good. And God separated the light from the darkness.'),
    sent('Heb-Gen-1-5', ['וַיִּקְרָא', 'אֱלֹהִים', 'לָאוֹר', 'יוֹם', 'וְלַחֹשֶׁךְ', 'קָרָא', 'לָיְלָה', 'וַיְהִי-עֶרֶב', 'וַיְהִי-בֹקֶר', 'יוֹם', 'אֶחָד׃'], 'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.'),
    sent('Heb-Gen-1-6', ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'רָקִיעַ', 'בְּתוֹךְ', 'הַמָּיִם', 'וִיהִי', 'מַבְדִּיל', 'בֵּין', 'מַיִם', 'לָמָיִם׃'], 'And God said, "Let there be an expanse in the midst of the waters, and let it separate the waters from the waters."'),
    sent('Heb-Gen-1-7', ['וַיַּעַשׂ', 'אֱלֹהִים', 'אֶת-הָרָקִיעַ', 'וַיַּבְדֵּל', 'בֵּין', 'הַמַּיִם', 'אֲשֶׁר', 'מִתַּחַת', 'לָרָקִיעַ', 'וּבֵין', 'הַמַּיִם', 'אֲשֶׁר', 'מֵעַל', 'לָרָקִיעַ', 'וַיְהִי-כֵן׃'], 'And God made the expanse and separated the waters that were under the expanse from the waters that were above the expanse. And it was so.'),
    sent('Heb-Gen-1-8', ['וַיִּקְרָא', 'אֱלֹהִים', 'לָרָקִיעַ', 'שָׁמָיִם', 'וַיְהִי-עֶרֶב', 'וַיְהִי-בֹקֶר', 'יוֹם', 'שֵׁנִי׃'], 'And God called the expanse Heaven. And there was evening and there was morning, the second day.'),
    sent('Heb-Gen-1-9', ['וַיֹּאמֶר', 'אֱלֹהִים', 'יִקָּווּ', 'הַמַּיִם', 'מִתַּחַת', 'הַשָּׁמַיִם', 'אֶל-מָקוֹם', 'אֶחָד', 'וְתֵרָאֶה', 'הַיַּבָּשָׁה', 'וַיְהִי-כֵן׃'], 'And God said, "Let the waters under the heavens be gathered together into one place, and let the dry land appear." And it was so.'),
    sent('Heb-Gen-1-10', ['וַיִּקְרָא', 'אֱלֹהִים', 'לַיַּבָּשָׁה', 'אֶרֶץ', 'וּלְמִקְוֵה', 'הַמַּיִם', 'קָרָא', 'יַמִּים', 'וַיַּרְא', 'אֱלֹהִים', 'כִּי-טוֹב׃'], 'God called the dry land Earth, and the waters that were gathered together he called Seas. And God saw that it was good.'),
    sent('Heb-Gen-1-11', ['וַיֹּאמֶר', 'אֱלֹהִים', 'תַּדְשֵׁא', 'הָאָרֶץ', 'דֶּשֶׁא', 'עֵשֶׂב', 'מַזְרִיעַ', 'זֶרַע', 'עֵץ', 'פְּרִי', 'עֹשֶׂה', 'פְּרִי', 'לְמִינוֹ', 'וַיְהִי-כֵן׃'], 'And God said, "Let the earth sprout vegetation, plants yielding seed, and fruit trees bearing fruit." And it was so.'),
    sent('Heb-Gen-1-14', ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'מְאֹרֹת', 'בִּרְקִיעַ', 'הַשָּׁמַיִם', 'לְהַבְדִּיל', 'בֵּין', 'הַיּוֹם', 'וּבֵין', 'הַלָּיְלָה', 'וַיְהִי-כֵן׃'], 'And God said, "Let there be lights in the expanse of the heavens to separate the day from the night." And it was so.'),
    sent('Heb-Gen-1-20', ['וַיֹּאמֶר', 'אֱלֹהִים', 'יִשְׁרְצוּ', 'הַמַּיִם', 'שֶׁרֶץ', 'נֶפֶשׁ', 'חַיָּה', 'וְעוֹף', 'יְעוֹפֵף', 'עַל-הָאָרֶץ׃'], 'And God said, "Let the waters swarm with swarms of living creatures, and let birds fly above the earth."'),
    sent('Heb-Gen-1-24', ['וַיֹּאמֶר', 'אֱלֹהִים', 'תּוֹצֵא', 'הָאָרֶץ', 'נֶפֶשׁ', 'חַיָּה', 'לְמִינָהּ', 'בְּהֵמָה', 'וָרֶמֶשׂ', 'וְחַיְתוֹ-אֶרֶץ', 'לְמִינָהּ', 'וַיְהִי-כֵן׃'], 'And God said, "Let the earth bring forth living creatures according to their kinds — livestock, creeping things, and beasts of the earth." And it was so.'),
    sent('Heb-Gen-1-26', ['וַיֹּאמֶר', 'אֱלֹהִים', 'נַעֲשֶׂה', 'אָדָם', 'בְּצַלְמֵנוּ', 'כִּדְמוּתֵנוּ', 'וְיִרְדּוּ', 'בִדְגַת', 'הַיָּם', 'וּבְעוֹף', 'הַשָּׁמַיִם׃'], 'Then God said, "Let us make man in our image, after our likeness. And let them have dominion over the fish of the sea and over the birds of the heavens."'),
    sent('Heb-Gen-1-27', ['וַיִּבְרָא', 'אֱלֹהִים', 'אֶת-הָאָדָם', 'בְּצַלְמוֹ', 'בְּצֶלֶם', 'אֱלֹהִים', 'בָּרָא', 'אֹתוֹ', 'זָכָר', 'וּנְקֵבָה', 'בָּרָא', 'אֹתָם׃'], 'So God created man in his own image, in the image of God he created him; male and female he created them.'),
    sent('Heb-Gen-1-31', ['וַיַּרְא', 'אֱלֹהִים', 'אֶת-כָּל-אֲשֶׁר', 'עָשָׂה', 'וְהִנֵּה-טוֹב', 'מְאֹד', 'וַיְהִי-עֶרֶב', 'וַיְהִי-בֹקֶר', 'יוֹם', 'הַשִּׁשִּׁי׃'], 'And God saw everything that he had made, and behold, it was very good. And there was evening and there was morning, the sixth day.'),
  ],
};

// ─── Psalm 23 ─────────────────────────────────────────────────────────────────

export const HEB_PSALM_23: TextSection = {
  id: 'Heb-Ps-23',
  textId: 'Heb-Ps23',
  sequence: 1,
  label: 'תְּהִלִּים כג — Psalm 23',
  sentences: [
    sent('Heb-Ps-23-1', ['יְהוָה', 'רֹעִי', 'לֹא', 'אֶחְסָר׃'], 'The LORD is my shepherd; I shall not want.'),
    sent('Heb-Ps-23-2', ['בִּנְאוֹת', 'דֶּשֶׁא', 'יַרְבִּיצֵנִי', 'עַל-מֵי', 'מְנֻחוֹת', 'יְנַהֲלֵנִי׃'], 'He makes me lie down in green pastures. He leads me beside still waters.'),
    sent('Heb-Ps-23-3', ['נַפְשִׁי', 'יְשׁוֹבֵב', 'יַנְחֵנִי', 'בְמַעְגְּלֵי-צֶדֶק', 'לְמַעַן', 'שְׁמוֹ׃'], 'He restores my soul. He leads me in paths of righteousness for his name\'s sake.'),
    sent('Heb-Ps-23-4', ['גַּם', 'כִּי-אֵלֵךְ', 'בְּגֵיא', 'צַלְמָוֶת', 'לֹא-אִירָא', 'רָע', 'כִּי-אַתָּה', 'עִמָּדִי', 'שִׁבְטְךָ', 'וּמִשְׁעַנְתֶּךָ', 'הֵמָּה', 'יְנַחֲמֻנִי׃'], 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.'),
    sent('Heb-Ps-23-5', ['תַּעֲרֹךְ', 'לְפָנַי', 'שֻׁלְחָן', 'נֶגֶד', 'צֹרְרָי', 'דִּשַּׁנְתָּ', 'בַשֶּׁמֶן', 'רֹאשִׁי', 'כּוֹסִי', 'רְוָיָה׃'], 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.'),
    sent('Heb-Ps-23-6', ['אַךְ', 'טוֹב', 'וָחֶסֶד', 'יִרְדְּפוּנִי', 'כָּל-יְמֵי', 'חַיָּי', 'וְשַׁבְתִּי', 'בְּבֵית-יְהוָה', 'לְאֹרֶךְ', 'יָמִים׃'], 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.'),
  ],
};

// ─── Genesis 2 ───────────────────────────────────────────────────────────────

export const HEB_GENESIS_2: TextSection = {
  id: 'Heb-Gen-2',
  textId: 'Heb-Genesis',
  sequence: 2,
  label: 'בְּרֵאשִׁית ב — Genesis Chapter 2',
  sentences: [
    sent('Heb-Gen-2-1', ['וַיְכֻלּוּ', 'הַשָּׁמַיִם', 'וְהָאָרֶץ', 'וְכָל-צְבָאָם׃'], 'Thus the heavens and the earth were finished, and all the host of them.'),
    sent('Heb-Gen-2-2', ['וַיְכַל', 'אֱלֹהִים', 'בַּיּוֹם', 'הַשְּׁבִיעִי', 'מְלַאכְתּוֹ', 'אֲשֶׁר', 'עָשָׂה', 'וַיִּשְׁבֹּת', 'בַּיּוֹם', 'הַשְּׁבִיעִי', 'מִכָּל-מְלַאכְתּוֹ׃'], 'And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work that he had done.'),
    sent('Heb-Gen-2-4', ['אֵלֶּה', 'תוֹלְדוֹת', 'הַשָּׁמַיִם', 'וְהָאָרֶץ', 'בְּהִבָּרְאָם', 'בְּיוֹם', 'עֲשׂוֹת', 'יְהוָה', 'אֱלֹהִים', 'אֶרֶץ', 'וְשָׁמָיִם׃'], 'These are the generations of the heavens and the earth when they were created, in the day that the LORD God made the earth and the heavens.'),
    sent('Heb-Gen-2-7', ['וַיִּיצֶר', 'יְהוָה', 'אֱלֹהִים', 'אֶת-הָאָדָם', 'עָפָר', 'מִן-הָאֲדָמָה', 'וַיִּפַּח', 'בְּאַפָּיו', 'נִשְׁמַת', 'חַיִּים', 'וַיְהִי', 'הָאָדָם', 'לְנֶפֶשׁ', 'חַיָּה׃'], 'Then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.'),
    sent('Heb-Gen-2-8', ['וַיִּטַּע', 'יְהוָה', 'אֱלֹהִים', 'גַּן-בְּעֵדֶן', 'מִקֶּדֶם', 'וַיָּשֶׂם', 'שָׁם', 'אֶת-הָאָדָם', 'אֲשֶׁר', 'יָצָר׃'], 'And the LORD God planted a garden in Eden, in the east, and there he put the man whom he had formed.'),
    sent('Heb-Gen-2-15', ['וַיִּקַּח', 'יְהוָה', 'אֱלֹהִים', 'אֶת-הָאָדָם', 'וַיַּנִּחֵהוּ', 'בְגַן-עֵדֶן', 'לְעָבְדָהּ', 'וּלְשָׁמְרָהּ׃'], 'The LORD God took the man and put him in the garden of Eden to work it and keep it.'),
    sent('Heb-Gen-2-16', ['וַיְצַו', 'יְהוָה', 'אֱלֹהִים', 'עַל-הָאָדָם', 'לֵאמֹר', 'מִכֹּל', 'עֵץ-הַגָּן', 'אָכֹל', 'תֹּאכֵל׃'], 'And the LORD God commanded the man, saying, "You may surely eat of every tree of the garden."'),
    sent('Heb-Gen-2-17', ['וּמֵעֵץ', 'הַדַּעַת', 'טוֹב', 'וָרָע', 'לֹא', 'תֹאכַל', 'מִמֶּנּוּ', 'כִּי', 'בְּיוֹם', 'אֲכָלְךָ', 'מִמֶּנּוּ', 'מוֹת', 'תָּמוּת׃'], '"But of the tree of the knowledge of good and evil you shall not eat, for in the day that you eat of it you shall surely die."'),
    sent('Heb-Gen-2-18', ['וַיֹּאמֶר', 'יְהוָה', 'אֱלֹהִים', 'לֹא-טוֹב', 'הֱיוֹת', 'הָאָדָם', 'לְבַדּוֹ', 'אֶעֱשֶׂה-לּוֹ', 'עֵזֶר', 'כְּנֶגְדּוֹ׃'], 'Then the LORD God said, "It is not good that the man should be alone; I will make him a helper fit for him."'),
    sent('Heb-Gen-2-21', ['וַיַּפֵּל', 'יְהוָה', 'אֱלֹהִים', 'תַּרְדֵּמָה', 'עַל-הָאָדָם', 'וַיִּישָׁן', 'וַיִּקַּח', 'אַחַת', 'מִצַּלְעֹתָיו', 'וַיִּסְגֹּר', 'בָּשָׂר', 'תַּחְתֶּנָּה׃'], 'So the LORD God caused a deep sleep to fall upon the man, and while he slept took one of his ribs and closed up its place with flesh.'),
    sent('Heb-Gen-2-22', ['וַיִּבֶן', 'יְהוָה', 'אֱלֹהִים', 'אֶת-הַצֵּלָע', 'אֲשֶׁר-לָקַח', 'מִן-הָאָדָם', 'לְאִשָּׁה', 'וַיְבִאֶהָ', 'אֶל-הָאָדָם׃'], 'And the rib that the LORD God had taken from the man he made into a woman and brought her to the man.'),
    sent('Heb-Gen-2-23', ['וַיֹּאמֶר', 'הָאָדָם', 'זֹאת', 'הַפַּעַם', 'עֶצֶם', 'מֵעֲצָמַי', 'וּבָשָׂר', 'מִבְּשָׂרִי', 'לְזֹאת', 'יִקָּרֵא', 'אִשָּׁה', 'כִּי', 'מֵאִישׁ', 'לֻקְחָה-זֹּאת׃'], 'Then the man said, "This at last is bone of my bones and flesh of my flesh; she shall be called Woman, because she was taken out of Man."'),
    sent('Heb-Gen-2-25', ['וַיִּהְיוּ', 'שְׁנֵיהֶם', 'עֲרוּמִּים', 'הָאָדָם', 'וְאִשְׁתּוֹ', 'וְלֹא', 'יִתְבֹּשָׁשׁוּ׃'], 'And the man and his wife were both naked and were not ashamed.'),
  ],
};

// ─── Genesis 3 ───────────────────────────────────────────────────────────────

export const HEB_GENESIS_3: TextSection = {
  id: 'Heb-Gen-3',
  textId: 'Heb-Genesis',
  sequence: 3,
  label: 'בְּרֵאשִׁית ג — Genesis Chapter 3',
  sentences: [
    sent('Heb-Gen-3-1', ['וְהַנָּחָשׁ', 'הָיָה', 'עָרוּם', 'מִכֹּל', 'חַיַּת', 'הַשָּׂדֶה', 'אֲשֶׁר', 'עָשָׂה', 'יְהוָה', 'אֱלֹהִים', 'וַיֹּאמֶר', 'אֶל-הָאִשָּׁה', 'אַף', 'כִּי-אָמַר', 'אֱלֹהִים', 'לֹא', 'תֹאכְלוּ', 'מִכֹּל', 'עֵץ', 'הַגָּן׃'], 'Now the serpent was more crafty than any other beast of the field that the LORD God had made. He said to the woman, "Did God actually say, \'You shall not eat of any tree in the garden\'?"'),
    sent('Heb-Gen-3-2', ['וַתֹּאמֶר', 'הָאִשָּׁה', 'אֶל-הַנָּחָשׁ', 'מִפְּרִי', 'עֵץ-הַגָּן', 'נֹאכֵל׃'], 'And the woman said to the serpent, "We may eat of the fruit of the trees in the garden."'),
    sent('Heb-Gen-3-3', ['וּמִפְּרִי', 'הָעֵץ', 'אֲשֶׁר', 'בְּתוֹךְ-הַגָּן', 'אָמַר', 'אֱלֹהִים', 'לֹא', 'תֹאכְלוּ', 'מִמֶּנּוּ', 'וְלֹא', 'תִגְּעוּ', 'בּוֹ', 'פֶּן-תְּמֻתוּן׃'], '"But God said, \'You shall not eat of the fruit of the tree that is in the midst of the garden, neither shall you touch it, lest you die.\'"'),
    sent('Heb-Gen-3-4', ['וַיֹּאמֶר', 'הַנָּחָשׁ', 'אֶל-הָאִשָּׁה', 'לֹא-מוֹת', 'תְּמֻתוּן׃'], 'But the serpent said to the woman, "You will not surely die."'),
    sent('Heb-Gen-3-6', ['וַתֵּרֶא', 'הָאִשָּׁה', 'כִּי', 'טוֹב', 'הָעֵץ', 'לְמַאֲכָל', 'וַתִּקַּח', 'מִפִּרְיוֹ', 'וַתֹּאכַל', 'וַתִּתֵּן', 'גַּם-לְאִישָׁהּ', 'עִמָּהּ', 'וַיֹּאכַל׃'], 'So when the woman saw that the tree was good for food, she took of its fruit and ate, and she also gave some to her husband who was with her, and he ate.'),
    sent('Heb-Gen-3-8', ['וַיִּשְׁמְעוּ', 'אֶת-קוֹל', 'יְהוָה', 'אֱלֹהִים', 'מִתְהַלֵּךְ', 'בַּגָּן', 'לְרוּחַ', 'הַיּוֹם', 'וַיִּתְחַבֵּא', 'הָאָדָם', 'וְאִשְׁתּוֹ', 'מִפְּנֵי', 'יְהוָה', 'אֱלֹהִים׃'], 'And they heard the sound of the LORD God walking in the garden in the cool of the day, and the man and his wife hid themselves from the presence of the LORD God among the trees of the garden.'),
    sent('Heb-Gen-3-9', ['וַיִּקְרָא', 'יְהוָה', 'אֱלֹהִים', 'אֶל-הָאָדָם', 'וַיֹּאמֶר', 'לוֹ', 'אַיֶּכָּה׃'], 'But the LORD God called to the man and said to him, "Where are you?"'),
    sent('Heb-Gen-3-10', ['וַיֹּאמֶר', 'אֶת-קֹלְךָ', 'שָׁמַעְתִּי', 'בַּגָּן', 'וָאִירָא', 'כִּי-עֵירֹם', 'אָנֹכִי', 'וָאֵחָבֵא׃'], 'And he said, "I heard the sound of you in the garden, and I was afraid, because I was naked, and I hid myself."'),
    sent('Heb-Gen-3-12', ['וַיֹּאמֶר', 'הָאָדָם', 'הָאִשָּׁה', 'אֲשֶׁר', 'נָתַתָּה', 'עִמָּדִי', 'הִוא', 'נָתְנָה-לִּי', 'מִן-הָעֵץ', 'וָאֹכֵל׃'], 'The man said, "The woman whom you gave to be with me, she gave me fruit of the tree, and I ate."'),
    sent('Heb-Gen-3-14', ['וַיֹּאמֶר', 'יְהוָה', 'אֱלֹהִים', 'אֶל-הַנָּחָשׁ', 'כִּי', 'עָשִׂיתָ', 'זֹּאת', 'אָרוּר', 'אַתָּה', 'מִכָּל-הַבְּהֵמָה', 'וּמִכֹּל', 'חַיַּת', 'הַשָּׂדֶה׃'], 'The LORD God said to the serpent, "Because you have done this, cursed are you above all livestock and above all beasts of the field."'),
    sent('Heb-Gen-3-21', ['וַיַּעַשׂ', 'יְהוָה', 'אֱלֹהִים', 'לְאָדָם', 'וּלְאִשְׁתּוֹ', 'כָּתְנוֹת', 'עוֹר', 'וַיַּלְבִּשֵׁם׃'], 'And the LORD God made for Adam and for his wife garments of skins and clothed them.'),
    sent('Heb-Gen-3-23', ['וַיְשַׁלְּחֵהוּ', 'יְהוָה', 'אֱלֹהִים', 'מִגַּן-עֵדֶן', 'לַעֲבֹד', 'אֶת-הָאֲדָמָה', 'אֲשֶׁר', 'לֻקַּח', 'מִשָּׁם׃'], 'Therefore the LORD God sent him out from the garden of Eden to work the ground from which he was taken.'),
  ],
};

export const ALL_HEBREW_EXTENDED_SECTIONS = [HEB_GENESIS_1, HEB_GENESIS_2, HEB_GENESIS_3, HEB_PSALM_23];
