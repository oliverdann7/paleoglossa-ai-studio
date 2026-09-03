/**
 * Advanced (B2/C1) curated excerpts for languages whose corpus previously
 * topped out at intermediate level. Famous, public-domain passages with
 * full lexical hints:
 *
 *  - Biblical Hebrew: Isaiah 40:1–5 (classical prophetic poetry, C1)
 *  - Akkadian:        Enūma Eliš I 1–8 (Standard Babylonian epic, C1)
 *  - Sanskrit:        Īśā Upaniṣad 1–2 (philosophical verse, C1)
 *  - Syriac:          Peshitta Psalm 23:1–4 (unvocalized poetry, B2)
 *
 * All are excerpts of larger works (sourceStatus 'excerpt', isSample true).
 */

import type { TextSection } from '../../types/corpus.js';
import { sentLex, type LexicalHint } from '../../lib/utils/lexicalHelper.js';

// ─── Biblical Hebrew: Isaiah 40:1–5 ──────────────────────────────────────

const HEB_ISA_LEX: Record<string, LexicalHint> = {
  נַחֲמוּ: { lemma: 'נחם', gloss: 'comfort! (pl. impv.)', partOfSpeech: 'verb' },
  עַמִּי: { lemma: 'עַם', gloss: 'my people', partOfSpeech: 'noun' },
  יֹאמַר: { lemma: 'אמר', gloss: 'says', partOfSpeech: 'verb' },
  אֱלֹהֵיכֶם: { lemma: 'אֱלֹהִים', gloss: 'your God', partOfSpeech: 'noun' },
  דַּבְּרוּ: { lemma: 'דבר', gloss: 'speak! (pl. impv.)', partOfSpeech: 'verb' },
  'עַל־לֵב': { lemma: 'לֵב', gloss: 'to the heart of', partOfSpeech: 'noun' },
  יְרוּשָׁלִַם: { lemma: 'יְרוּשָׁלִַם', gloss: 'Jerusalem', partOfSpeech: 'noun' },
  וְקִרְאוּ: { lemma: 'קרא', gloss: 'and call! (pl. impv.)', partOfSpeech: 'verb' },
  אֵלֶיהָ: { lemma: 'אֶל', gloss: 'to her', partOfSpeech: 'preposition' },
  כִּי: { lemma: 'כִּי', gloss: 'that, for', partOfSpeech: 'conjunction' },
  מָלְאָה: { lemma: 'מלא', gloss: 'is completed', partOfSpeech: 'verb' },
  צְבָאָהּ: { lemma: 'צָבָא', gloss: 'her service, warfare', partOfSpeech: 'noun' },
  נִרְצָה: { lemma: 'רצה', gloss: 'is pardoned, accepted', partOfSpeech: 'verb' },
  עֲוֺנָהּ: { lemma: 'עָוֺן', gloss: 'her iniquity', partOfSpeech: 'noun' },
  קוֹל: { lemma: 'קוֹל', gloss: 'a voice', partOfSpeech: 'noun' },
  קוֹרֵא: { lemma: 'קרא', gloss: 'crying out', partOfSpeech: 'verb' },
  בַּמִּדְבָּר: { lemma: 'מִדְבָּר', gloss: 'in the wilderness', partOfSpeech: 'noun' },
  פַּנּוּ: { lemma: 'פנה', gloss: 'clear! prepare! (pl. impv.)', partOfSpeech: 'verb' },
  דֶּרֶךְ: { lemma: 'דֶּרֶךְ', gloss: 'the way of', partOfSpeech: 'noun' },
  יְהוָה: { lemma: 'יְהוָה', gloss: 'the LORD', partOfSpeech: 'noun' },
  יַשְּׁרוּ: { lemma: 'ישׁר', gloss: 'make straight! (pl. impv.)', partOfSpeech: 'verb' },
  בָּעֲרָבָה: { lemma: 'עֲרָבָה', gloss: 'in the desert plain', partOfSpeech: 'noun' },
  מְסִלָּה: { lemma: 'מְסִלָּה', gloss: 'a highway', partOfSpeech: 'noun' },
  לֵאלֹהֵינוּ: { lemma: 'אֱלֹהִים', gloss: 'for our God', partOfSpeech: 'noun' },
  'כָּל־גֶּיא': { lemma: 'גַּיְא', gloss: 'every valley', partOfSpeech: 'noun' },
  יִנָּשֵׂא: { lemma: 'נשׂא', gloss: 'shall be lifted up', partOfSpeech: 'verb' },
  'וְכָל־הַר': { lemma: 'הַר', gloss: 'and every mountain', partOfSpeech: 'noun' },
  וְגִבְעָה: { lemma: 'גִּבְעָה', gloss: 'and hill', partOfSpeech: 'noun' },
  יִשְׁפָּלוּ: { lemma: 'שׁפל', gloss: 'shall be made low', partOfSpeech: 'verb' },
  וְנִגְלָה: { lemma: 'גלה', gloss: 'and shall be revealed', partOfSpeech: 'verb' },
  כְּבוֹד: { lemma: 'כָּבוֹד', gloss: 'the glory of', partOfSpeech: 'noun' },
  וְרָאוּ: { lemma: 'ראה', gloss: 'and they shall see', partOfSpeech: 'verb' },
  'כָל־בָּשָׂר': { lemma: 'בָּשָׂר', gloss: 'all flesh', partOfSpeech: 'noun' },
  יַחְדָּו: { lemma: 'יַחְדָּו', gloss: 'together', partOfSpeech: 'adverb' },
};

export const HEB_ISAIAH_40_1: TextSection = {
  id: 'Heb-Isa40-1',
  textId: 'Heb-Isa40',
  sequence: 1,
  label: 'Isaiah 40:1–5 — Comfort My People',
  sentences: [
    sentLex(
      'Heb-Isa40-1-1',
      ['נַחֲמוּ', 'נַחֲמוּ', 'עַמִּי', 'יֹאמַר', 'אֱלֹהֵיכֶם.'],
      'Comfort, comfort my people, says your God.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-2',
      ['דַּבְּרוּ', 'עַל־לֵב', 'יְרוּשָׁלִַם', 'וְקִרְאוּ', 'אֵלֶיהָ.'],
      'Speak tenderly to Jerusalem, and cry to her.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-3',
      ['כִּי', 'מָלְאָה', 'צְבָאָהּ', 'כִּי', 'נִרְצָה', 'עֲוֺנָהּ.'],
      'That her warfare is ended, that her iniquity is pardoned.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-4',
      ['קוֹל', 'קוֹרֵא', 'בַּמִּדְבָּר', 'פַּנּוּ', 'דֶּרֶךְ', 'יְהוָה.'],
      'A voice cries: In the wilderness prepare the way of the LORD.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-5',
      ['יַשְּׁרוּ', 'בָּעֲרָבָה', 'מְסִלָּה', 'לֵאלֹהֵינוּ.'],
      'Make straight in the desert a highway for our God.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-6',
      ['כָּל־גֶּיא', 'יִנָּשֵׂא', 'וְכָל־הַר', 'וְגִבְעָה', 'יִשְׁפָּלוּ.'],
      'Every valley shall be lifted up, and every mountain and hill be made low.',
      HEB_ISA_LEX
    ),
    sentLex(
      'Heb-Isa40-1-7',
      ['וְנִגְלָה', 'כְּבוֹד', 'יְהוָה', 'וְרָאוּ', 'כָל־בָּשָׂר', 'יַחְדָּו.'],
      'And the glory of the LORD shall be revealed, and all flesh shall see it together.',
      HEB_ISA_LEX
    ),
  ],
};

// ─── Akkadian: Enūma Eliš I 1–8 ──────────────────────────────────────────

const AKK_ENUMA_LEX: Record<string, LexicalHint> = {
  enūma: { lemma: 'enūma', gloss: 'when', partOfSpeech: 'conjunction' },
  eliš: { lemma: 'eliš', gloss: 'on high, above', partOfSpeech: 'adverb' },
  lā: { lemma: 'lā', gloss: 'not', partOfSpeech: 'adverb' },
  nabû: { lemma: 'nabû', gloss: 'named', partOfSpeech: 'verb' },
  šamāmū: { lemma: 'šamû', gloss: 'the heavens', partOfSpeech: 'noun' },
  šapliš: { lemma: 'šapliš', gloss: 'below', partOfSpeech: 'adverb' },
  ammatum: { lemma: 'ammatum', gloss: 'the earth', partOfSpeech: 'noun' },
  šuma: { lemma: 'šumu', gloss: 'name (acc.)', partOfSpeech: 'noun' },
  zakrat: { lemma: 'zakāru', gloss: 'was called', partOfSpeech: 'verb' },
  Apsûma: { lemma: 'Apsû', gloss: 'Apsu (with -ma)', partOfSpeech: 'noun' },
  rēštû: { lemma: 'rēštû', gloss: 'the first, primeval', partOfSpeech: 'adjective' },
  zārûšun: { lemma: 'zārû', gloss: 'their begetter', partOfSpeech: 'noun' },
  mummu: { lemma: 'mummu', gloss: 'creator, maker', partOfSpeech: 'noun' },
  Tiāmat: { lemma: 'Tiāmat', gloss: 'Tiamat', partOfSpeech: 'noun' },
  muallidat: { lemma: 'walādu', gloss: 'she who bore', partOfSpeech: 'verb' },
  gimrīšun: { lemma: 'gimru', gloss: 'all of them', partOfSpeech: 'noun' },
  mêšunu: { lemma: 'mû', gloss: 'their waters', partOfSpeech: 'noun' },
  ištēniš: { lemma: 'ištēniš', gloss: 'together, as one', partOfSpeech: 'adverb' },
  iḫiqqūma: { lemma: 'ḫiāqu', gloss: 'they mingled', partOfSpeech: 'verb' },
  gipāra: { lemma: 'gipāru', gloss: 'pasture (acc.)', partOfSpeech: 'noun' },
  kiṣṣurū: { lemma: 'kaṣāru', gloss: 'were formed', partOfSpeech: 'verb' },
  ṣuṣâ: { lemma: 'ṣuṣû', gloss: 'reed-bed (acc.)', partOfSpeech: 'noun' },
  šeʾū: { lemma: 'šeʾû', gloss: 'were to be found', partOfSpeech: 'verb' },
  ilū: { lemma: 'ilum', gloss: 'the gods', partOfSpeech: 'noun' },
  šūpû: { lemma: 'šūpû', gloss: 'had appeared', partOfSpeech: 'verb' },
  manāma: { lemma: 'manāma', gloss: 'any, anyone', partOfSpeech: 'pronoun' },
  zukkurū: { lemma: 'zakāru', gloss: 'were named', partOfSpeech: 'verb' },
  šīmātu: { lemma: 'šīmtu', gloss: 'destinies', partOfSpeech: 'noun' },
  šīmū: { lemma: 'šâmu', gloss: 'were decreed', partOfSpeech: 'verb' },
};

export const AKK_ENUMA_1: TextSection = {
  id: 'Akk-Enuma-1',
  textId: 'Akk-Enuma',
  sequence: 1,
  label: 'Tablet I 1–8 — When on High',
  sentences: [
    sentLex(
      'Akk-Enuma-1-1',
      ['enūma', 'eliš', 'lā', 'nabû', 'šamāmū.'],
      'When on high the heavens had not been named,',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-2',
      ['šapliš', 'ammatum', 'šuma', 'lā', 'zakrat.'],
      'and below the earth had not been called by name,',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-3',
      ['Apsûma', 'rēštû', 'zārûšun.'],
      'there was Apsu the primeval, their begetter,',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-4',
      ['mummu', 'Tiāmat', 'muallidat', 'gimrīšun.'],
      'and maker Tiamat, she who bore them all.',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-5',
      ['mêšunu', 'ištēniš', 'iḫiqqūma.'],
      'They mingled their waters together.',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-6',
      ['gipāra', 'lā', 'kiṣṣurū', 'ṣuṣâ', 'lā', 'šeʾū.'],
      'No pasture had been formed, no reed-bed was to be found.',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-7',
      ['enūma', 'ilū', 'lā', 'šūpû', 'manāma.'],
      'When none of the gods had yet appeared,',
      AKK_ENUMA_LEX
    ),
    sentLex(
      'Akk-Enuma-1-8',
      ['šuma', 'lā', 'zukkurū', 'šīmātu', 'lā', 'šīmū.'],
      'they had not been named, and no destinies decreed.',
      AKK_ENUMA_LEX
    ),
  ],
};

// ─── Sanskrit: Īśā Upaniṣad 1–2 ──────────────────────────────────────────

const SAN_ISHA_LEX: Record<string, LexicalHint> = {
  ईशा: { lemma: 'ईश्', gloss: 'by the Lord', partOfSpeech: 'noun' },
  वास्यम्: { lemma: 'वस्', gloss: 'is to be pervaded, clothed', partOfSpeech: 'verb' },
  इदं: { lemma: 'इदम्', gloss: 'this', partOfSpeech: 'pronoun' },
  सर्वं: { lemma: 'सर्व', gloss: 'all, everything', partOfSpeech: 'adjective' },
  यत्किञ्च: { lemma: 'यद्', gloss: 'whatever', partOfSpeech: 'pronoun' },
  जगत्यां: { lemma: 'जगती', gloss: 'in the world', partOfSpeech: 'noun' },
  जगत्: { lemma: 'जगत्', gloss: 'moves, the moving world', partOfSpeech: 'noun' },
  तेन: { lemma: 'तद्', gloss: 'by that', partOfSpeech: 'pronoun' },
  त्यक्तेन: { lemma: 'त्यज्', gloss: 'by renunciation', partOfSpeech: 'verb' },
  भुञ्जीथाः: { lemma: 'भुज्', gloss: 'you should enjoy', partOfSpeech: 'verb' },
  मा: { lemma: 'मा', gloss: 'do not', partOfSpeech: 'particle' },
  गृधः: { lemma: 'गृध्', gloss: 'covet', partOfSpeech: 'verb' },
  कस्यस्वित्: { lemma: 'क', gloss: "anyone's", partOfSpeech: 'pronoun' },
  धनम्: { lemma: 'धन', gloss: 'wealth', partOfSpeech: 'noun' },
  कुर्वन्न्: { lemma: 'कृ', gloss: 'doing, performing', partOfSpeech: 'verb' },
  एव: { lemma: 'एव', gloss: 'indeed, only', partOfSpeech: 'particle' },
  इह: { lemma: 'इह', gloss: 'here (in this world)', partOfSpeech: 'adverb' },
  कर्माणि: { lemma: 'कर्मन्', gloss: 'works, actions', partOfSpeech: 'noun' },
  जिजीविषेत्: { lemma: 'जीव्', gloss: 'one should wish to live', partOfSpeech: 'verb' },
  शतं: { lemma: 'शत', gloss: 'a hundred', partOfSpeech: 'noun' },
  समाः: { lemma: 'समा', gloss: 'years', partOfSpeech: 'noun' },
};

export const SAN_ISHA_1: TextSection = {
  id: 'San-Upan-1',
  textId: 'San-Upan',
  sequence: 1,
  label: 'Īśā Upaniṣad 1–2',
  sentences: [
    sentLex(
      'San-Upan-1-1',
      ['ईशा', 'वास्यम्', 'इदं', 'सर्वं', 'यत्किञ्च', 'जगत्यां', 'जगत्.'],
      'All this, whatever moves in this moving world, is pervaded by the Lord.',
      SAN_ISHA_LEX
    ),
    sentLex(
      'San-Upan-1-2',
      ['तेन', 'त्यक्तेन', 'भुञ्जीथाः', 'मा', 'गृधः', 'कस्यस्वित्', 'धनम्.'],
      'Enjoy it through renunciation; do not covet anyone’s wealth.',
      SAN_ISHA_LEX
    ),
    sentLex(
      'San-Upan-1-3',
      ['कुर्वन्न्', 'एव', 'इह', 'कर्माणि', 'जिजीविषेत्', 'शतं', 'समाः.'],
      'Performing works here alone, one should wish to live a hundred years.',
      SAN_ISHA_LEX
    ),
  ],
};

// ─── Syriac: Peshitta Psalm 23:1–4 ───────────────────────────────────────

const SYR_PS23_LEX: Record<string, LexicalHint> = {
  ܡܪܝܐ: { lemma: 'ܡܪܝܐ', gloss: 'the Lord (māryā)', partOfSpeech: 'noun' },
  ܢܪܥܝܢܝ: { lemma: 'ܪܥܐ', gloss: 'shepherds me (nerʿēn(y))', partOfSpeech: 'verb' },
  ܘܡܕܡ: { lemma: 'ܡܕܡ', gloss: 'and anything (w-meddem)', partOfSpeech: 'pronoun' },
  ܠܐ: { lemma: 'ܠܐ', gloss: 'not (lā)', partOfSpeech: 'adverb' },
  ܢܚܣܪ: { lemma: 'ܚܣܪ', gloss: 'shall lack (neḥsar)', partOfSpeech: 'verb' },
  ܠܝ: { lemma: 'ܠ', gloss: 'to me (lī)', partOfSpeech: 'preposition' },
  ܥܠ: { lemma: 'ܥܠ', gloss: 'upon, by (ʿal)', partOfSpeech: 'preposition' },
  ܡܪ̈ܓܐ: { lemma: 'ܡܪܓܐ', gloss: 'meadows (margē)', partOfSpeech: 'noun' },
  ܕܥܘܫܢܐ: { lemma: 'ܥܘܫܢܐ', gloss: 'of strength (d-ʿušnā)', partOfSpeech: 'noun' },
  ܢܫܪܝܢܝ: { lemma: 'ܫܪܐ', gloss: 'he makes me dwell (našrēn(y))', partOfSpeech: 'verb' },
  ܡܝ̈ܐ: { lemma: 'ܡܝܐ', gloss: 'waters (mayyā)', partOfSpeech: 'noun' },
  ܢܝ̈ܚܐ: { lemma: 'ܢܝܚܐ', gloss: 'of rest, still (nīḥē)', partOfSpeech: 'adjective' },
  ܢܕܒܪܢܝ: { lemma: 'ܕܒܪ', gloss: 'he leads me (nedabbran(y))', partOfSpeech: 'verb' },
  ܢܦܫܝ: { lemma: 'ܢܦܫܐ', gloss: 'my soul (napš(y))', partOfSpeech: 'noun' },
  ܢܗܦܟ: { lemma: 'ܗܦܟ', gloss: 'he restores (nahpek)', partOfSpeech: 'verb' },
  ܘܢܕܒܪܢܝ: { lemma: 'ܕܒܪ', gloss: 'and he leads me (wa-nedabbran(y))', partOfSpeech: 'verb' },
  ܒܫܒܝ̈ܠܐ: { lemma: 'ܫܒܝܠܐ', gloss: 'in the paths (ba-šbīlē)', partOfSpeech: 'noun' },
  ܕܙܕܝܩܘܬܐ: { lemma: 'ܙܕܝܩܘܬܐ', gloss: 'of righteousness (d-zaddīqūtā)', partOfSpeech: 'noun' },
  ܡܛܠ: { lemma: 'ܡܛܠ', gloss: 'for the sake of (meṭṭul)', partOfSpeech: 'preposition' },
  ܫܡܗ: { lemma: 'ܫܡܐ', gloss: 'his name (šmeh)', partOfSpeech: 'noun' },
};

export const SYR_PSALM_23_1: TextSection = {
  id: 'Syr-Ps23-1',
  textId: 'Syr-Ps23',
  sequence: 1,
  label: 'Psalm 23:1–3 — The Lord Is My Shepherd',
  sentences: [
    sentLex(
      'Syr-Ps23-1-1',
      ['ܡܪܝܐ', 'ܢܪܥܝܢܝ', 'ܘܡܕܡ', 'ܠܐ', 'ܢܚܣܪ', 'ܠܝ.'],
      'The Lord shepherds me, and I shall lack nothing.',
      SYR_PS23_LEX
    ),
    sentLex(
      'Syr-Ps23-1-2',
      ['ܥܠ', 'ܡܪ̈ܓܐ', 'ܕܥܘܫܢܐ', 'ܢܫܪܝܢܝ.'],
      'In meadows of strength he makes me dwell.',
      SYR_PS23_LEX
    ),
    sentLex(
      'Syr-Ps23-1-3',
      ['ܥܠ', 'ܡܝ̈ܐ', 'ܢܝ̈ܚܐ', 'ܢܕܒܪܢܝ.'],
      'Beside still waters he leads me.',
      SYR_PS23_LEX
    ),
    sentLex('Syr-Ps23-1-4', ['ܢܦܫܝ', 'ܢܗܦܟ.'], 'He restores my soul.', SYR_PS23_LEX),
    sentLex(
      'Syr-Ps23-1-5',
      ['ܘܢܕܒܪܢܝ', 'ܒܫܒܝ̈ܠܐ', 'ܕܙܕܝܩܘܬܐ', 'ܡܛܠ', 'ܫܡܗ.'],
      'And he leads me in the paths of righteousness for his name’s sake.',
      SYR_PS23_LEX
    ),
  ],
};

export const ALL_ADVANCED_READING_SECTIONS: TextSection[] = [
  HEB_ISAIAH_40_1,
  AKK_ENUMA_1,
  SAN_ISHA_1,
  SYR_PSALM_23_1,
];
