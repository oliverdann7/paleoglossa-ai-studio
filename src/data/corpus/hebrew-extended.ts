/**
 * Hebrew Extended — Genesis 1 + Psalm 23
 * Text: Westminster Leningrad Codex (WLC) — public domain.
 * Translation: adapted from public-domain English versions.
 *
 * Genesis 1: the Creation narrative — most famous Hebrew passage,
 * repetitive vocabulary (וַיֹּאמֶר, וַיְהִי, טוֹב), ideal entry point.
 * Psalm 23: short (6 verses), beloved, highly memorized — fast win for beginners.
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

export const ALL_HEBREW_EXTENDED_SECTIONS = [HEB_GENESIS_1, HEB_PSALM_23];
