/**
 * Beginner mini-stories for the smaller-corpus languages
 * (Hebrew, Aramaic, Syriac, Coptic, Sanskrit). Each story is a few
 * sentences of plain prose with an English translation, useful for
 * absolute-beginner exposure to script and basic syntax.
 *
 * Every token has lemma + gloss + partOfSpeech set so these texts
 * satisfy the completeness gate in validation.ts.
 */

import type { TextSection } from '../../types/corpus.js';
import { sentLex, type LexicalHint } from '../../lib/utils/lexicalHelper.js';

// ─── Hebrew: Genesis 1:1-5 + Psalm 23:1-3 (vocalized Biblical Hebrew) ────

const HEB_MINI_LEX: Record<string, LexicalHint> = {
  בְּרֵאשִׁית: { lemma: 'רֵאשִׁית', gloss: 'in (the) beginning', partOfSpeech: 'noun' },
  בָּרָא: { lemma: 'ברא', gloss: 'he created', partOfSpeech: 'verb' },
  אֱלֹהִים: { lemma: 'אֱלֹהִים', gloss: 'God', partOfSpeech: 'noun' },
  אֵת: { lemma: 'אֵת', gloss: '(direct object marker)', partOfSpeech: 'particle' },
  אֶת: { lemma: 'אֵת', gloss: '(direct object marker)', partOfSpeech: 'particle' },
  הַשָּׁמַיִם: { lemma: 'שָׁמַיִם', gloss: 'the heavens', partOfSpeech: 'noun' },
  וְאֵת: { lemma: 'אֵת', gloss: 'and (dir. obj. marker)', partOfSpeech: 'particle' },
  הָאָרֶץ: { lemma: 'אֶרֶץ', gloss: 'the earth', partOfSpeech: 'noun' },
  וְהָאָרֶץ: { lemma: 'אֶרֶץ', gloss: 'and the earth', partOfSpeech: 'noun' },
  הָיְתָה: { lemma: 'היה', gloss: 'was', partOfSpeech: 'verb' },
  תֹהוּ: { lemma: 'תֹּהוּ', gloss: 'formlessness, waste', partOfSpeech: 'noun' },
  וָבֹהוּ: { lemma: 'בֹּהוּ', gloss: 'and void', partOfSpeech: 'noun' },
  וַיֹּאמֶר: { lemma: 'אמר', gloss: 'and he said', partOfSpeech: 'verb' },
  יְהִי: { lemma: 'היה', gloss: 'let there be', partOfSpeech: 'verb' },
  אוֹר: { lemma: 'אוֹר', gloss: 'light', partOfSpeech: 'noun' },
  הָאוֹר: { lemma: 'אוֹר', gloss: 'the light', partOfSpeech: 'noun' },
  וַיְהִי: { lemma: 'היה', gloss: 'and there was', partOfSpeech: 'verb' },
  וַיַּרְא: { lemma: 'ראה', gloss: 'and he saw', partOfSpeech: 'verb' },
  כִּי: { lemma: 'כִּי', gloss: 'that, because', partOfSpeech: 'conjunction' },
  טוֹב: { lemma: 'טוֹב', gloss: 'good', partOfSpeech: 'adjective' },
  // Psalm 23
  יְהוָה: { lemma: 'יְהוָה', gloss: 'the LORD', partOfSpeech: 'noun' },
  רֹעִי: { lemma: 'רעה', gloss: 'my shepherd', partOfSpeech: 'noun' },
  לֹא: { lemma: 'לֹא', gloss: 'not', partOfSpeech: 'adverb' },
  אֶחְסָר: { lemma: 'חסר', gloss: 'I shall lack', partOfSpeech: 'verb' },
  בִּנְאוֹת: { lemma: 'נָוֶה', gloss: 'in pastures of', partOfSpeech: 'noun' },
  דֶּשֶׁא: { lemma: 'דֶּשֶׁא', gloss: 'green grass', partOfSpeech: 'noun' },
  יַרְבִּיצֵנִי: { lemma: 'רבץ', gloss: 'he makes me lie down', partOfSpeech: 'verb' },
  עַל: { lemma: 'עַל', gloss: 'beside, upon', partOfSpeech: 'preposition' },
  מֵי: { lemma: 'מַיִם', gloss: 'waters of', partOfSpeech: 'noun' },
  מְנֻחוֹת: { lemma: 'מְנוּחָה', gloss: 'rest, stillness', partOfSpeech: 'noun' },
  יְנַהֲלֵנִי: { lemma: 'נהל', gloss: 'he leads me', partOfSpeech: 'verb' },
  נַפְשִׁי: { lemma: 'נֶפֶשׁ', gloss: 'my soul', partOfSpeech: 'noun' },
  יְשׁוֹבֵב: { lemma: 'שׁוב', gloss: 'he restores', partOfSpeech: 'verb' },
};

export const HEB_MINI_1: TextSection = {
  id: 'HebMini-1',
  textId: 'HebMini-1',
  sequence: 1,
  label: 'בְּרֵאשִׁית — In the beginning',
  sentences: [
    sentLex(
      'HebMini-1-1',
      ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', 'אֵת', 'הַשָּׁמַיִם', 'וְאֵת', 'הָאָרֶץ.'],
      'In the beginning God created the heavens and the earth.',
      HEB_MINI_LEX
    ),
    sentLex(
      'HebMini-1-2',
      ['וְהָאָרֶץ', 'הָיְתָה', 'תֹהוּ', 'וָבֹהוּ.'],
      'And the earth was formless and void.',
      HEB_MINI_LEX
    ),
    sentLex(
      'HebMini-1-3',
      ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'אוֹר.'],
      'And God said: Let there be light.',
      HEB_MINI_LEX
    ),
    sentLex('HebMini-1-4', ['וַיְהִי', 'אוֹר.'], 'And there was light.', HEB_MINI_LEX),
    sentLex(
      'HebMini-1-5',
      ['וַיַּרְא', 'אֱלֹהִים', 'אֶת', 'הָאוֹר', 'כִּי', 'טוֹב.'],
      'And God saw the light, that it was good.',
      HEB_MINI_LEX
    ),
  ],
};

export const HEB_MINI_2: TextSection = {
  id: 'HebMini-2',
  textId: 'HebMini-2',
  sequence: 2,
  label: 'הָרֹעֶה הַטּוֹב — The good shepherd',
  sentences: [
    sentLex(
      'HebMini-2-1',
      ['יְהוָה', 'רֹעִי', 'לֹא', 'אֶחְסָר.'],
      'The LORD is my shepherd; I shall not want.',
      HEB_MINI_LEX
    ),
    sentLex(
      'HebMini-2-2',
      ['בִּנְאוֹת', 'דֶּשֶׁא', 'יַרְבִּיצֵנִי.'],
      'He makes me lie down in green pastures.',
      HEB_MINI_LEX
    ),
    sentLex(
      'HebMini-2-3',
      ['עַל', 'מֵי', 'מְנֻחוֹת', 'יְנַהֲלֵנִי.'],
      'He leads me beside still waters.',
      HEB_MINI_LEX
    ),
    sentLex('HebMini-2-4', ['נַפְשִׁי', 'יְשׁוֹבֵב.'], 'He restores my soul.', HEB_MINI_LEX),
  ],
};

// ─── Aramaic: Pirkei Avot / Targumic phrasing ────────────────────────────

const ARC_MINI_LEX: Record<string, LexicalHint> = {
  אֲמַר: { lemma: 'אמר', gloss: 'said', partOfSpeech: 'verb' },
  רַבָּן: { lemma: 'רַבָּן', gloss: 'our master, Rabban', partOfSpeech: 'noun' },
  גַּמְלִיאֵל: { lemma: 'גַּמְלִיאֵל', gloss: 'Gamliel', partOfSpeech: 'noun' },
  לְתַלְמִידוֹי: { lemma: 'תַּלְמִיד', gloss: 'to his students', partOfSpeech: 'noun' },
  חַכִּימָא: { lemma: 'חַכִּים', gloss: 'the wise (one)', partOfSpeech: 'adjective' },
  דְּחָזֵי: { lemma: 'חזי', gloss: 'who sees', partOfSpeech: 'verb' },
  יוֹמָא: { lemma: 'יוֹם', gloss: 'the day', partOfSpeech: 'noun' },
  דְּמִיתֵיהּ: { lemma: 'מִיתָה', gloss: 'of his death', partOfSpeech: 'noun' },
  וְתָאֵב: { lemma: 'תוב', gloss: 'and (he) returns', partOfSpeech: 'verb' },
  מִן: { lemma: 'מִן', gloss: 'from', partOfSpeech: 'preposition' },
  כָּל: { lemma: 'כֹּל', gloss: 'every, all', partOfSpeech: 'adjective' },
  יוֹם: { lemma: 'יוֹם', gloss: 'day', partOfSpeech: 'noun' },
  וְלָא: { lemma: 'לָא', gloss: 'and not', partOfSpeech: 'adverb' },
  תֵּימָר: { lemma: 'אמר', gloss: 'you shall say', partOfSpeech: 'verb' },
  דָּא: { lemma: 'דָּא', gloss: 'this', partOfSpeech: 'pronoun' },
};

export const ARC_MINI_1: TextSection = {
  id: 'ArcMini-1',
  textId: 'ArcMini-1',
  sequence: 1,
  label: 'אֲמַר רַבָּן — The teacher spoke',
  sentences: [
    sentLex(
      'ArcMini-1-1',
      ['אֲמַר', 'רַבָּן', 'גַּמְלִיאֵל', 'לְתַלְמִידוֹי.'],
      'Rabban Gamliel said to his students.',
      ARC_MINI_LEX
    ),
    sentLex(
      'ArcMini-1-2',
      ['חַכִּימָא', 'דְּחָזֵי', 'יוֹמָא', 'דְּמִיתֵיהּ.'],
      'A wise one is he who sees the day of his death.',
      ARC_MINI_LEX
    ),
    sentLex(
      'ArcMini-1-3',
      ['וְתָאֵב', 'מִן', 'כָּל', 'יוֹם.'],
      'And returns (in repentance) from every day.',
      ARC_MINI_LEX
    ),
    sentLex(
      'ArcMini-1-4',
      ['וְלָא', 'תֵּימָר', 'דָּא', 'יוֹם.'],
      'And do not say: "This is the day."',
      ARC_MINI_LEX
    ),
  ],
};

// ─── Syriac: Lord's Prayer (Peshitta) ──────────────────────────────────

const SYR_MINI_LEX: Record<string, LexicalHint> = {
  ܐܒܘܢ: { lemma: 'ܐܒܐ', gloss: 'our Father', partOfSpeech: 'noun' },
  ܕܒܫܡܝܐ: { lemma: 'ܫܡܝܐ', gloss: 'who (is) in the heavens', partOfSpeech: 'noun' },
  ܢܬܩܕܫ: { lemma: 'ܩܕܫ', gloss: 'let it be sanctified', partOfSpeech: 'verb' },
  ܫܡܟ: { lemma: 'ܫܡܐ', gloss: 'your name', partOfSpeech: 'noun' },
  ܬܐܬܐ: { lemma: 'ܐܬܐ', gloss: 'let it come', partOfSpeech: 'verb' },
  ܡܠܟܘܬܟ: { lemma: 'ܡܠܟܘܬܐ', gloss: 'your kingdom', partOfSpeech: 'noun' },
  ܢܗܘܐ: { lemma: 'ܗܘܐ', gloss: 'let it be', partOfSpeech: 'verb' },
  ܨܒܝܢܟ: { lemma: 'ܨܒܝܢܐ', gloss: 'your will', partOfSpeech: 'noun' },
  ܐܝܟܢܐ: { lemma: 'ܐܝܟܢܐ', gloss: 'as, in the manner that', partOfSpeech: 'adverb' },
  ܐܦ: { lemma: 'ܐܦ', gloss: 'also', partOfSpeech: 'adverb' },
  ܒܐܪܥܐ: { lemma: 'ܐܪܥܐ', gloss: 'on (the) earth', partOfSpeech: 'noun' },
  ܗܒ: { lemma: 'ܝܗܒ', gloss: 'give!', partOfSpeech: 'verb' },
  ܠܢ: { lemma: 'ܐܢܚܢܢ', gloss: 'to us', partOfSpeech: 'pronoun' },
  ܠܚܡܢ: { lemma: 'ܠܚܡܐ', gloss: 'our bread', partOfSpeech: 'noun' },
  ܕܣܘܢܩܢܢ: { lemma: 'ܣܘܢܩܢܐ', gloss: 'of our need', partOfSpeech: 'noun' },
  ܝܘܡܢܐ: { lemma: 'ܝܘܡܢܐ', gloss: 'today', partOfSpeech: 'adverb' },
};

export const SYR_MINI_1: TextSection = {
  id: 'SyrMini-1',
  textId: 'SyrMini-1',
  sequence: 1,
  label: 'ܐܒܘܢ ܕܒܫܡܝܐ — Our Father in heaven',
  sentences: [
    sentLex(
      'SyrMini-1-1',
      ['ܐܒܘܢ', 'ܕܒܫܡܝܐ', 'ܢܬܩܕܫ', 'ܫܡܟ.'],
      'Our Father in heaven, hallowed be your name.',
      SYR_MINI_LEX
    ),
    sentLex('SyrMini-1-2', ['ܬܐܬܐ', 'ܡܠܟܘܬܟ.'], 'May your kingdom come.', SYR_MINI_LEX),
    sentLex(
      'SyrMini-1-3',
      ['ܢܗܘܐ', 'ܨܒܝܢܟ', 'ܐܝܟܢܐ', 'ܕܒܫܡܝܐ', 'ܐܦ', 'ܒܐܪܥܐ.'],
      'May your will be done as in heaven, also on earth.',
      SYR_MINI_LEX
    ),
    sentLex(
      'SyrMini-1-4',
      ['ܗܒ', 'ܠܢ', 'ܠܚܡܢ', 'ܕܣܘܢܩܢܢ', 'ܝܘܡܢܐ.'],
      'Give us today the bread of our need.',
      SYR_MINI_LEX
    ),
  ],
};

// ─── Coptic: opening of Sahidic John's Gospel ───────────────────────────

const COP_MINI_LEX: Record<string, LexicalHint> = {
  ϩⲛ: { lemma: 'ϩⲛ', gloss: 'in', partOfSpeech: 'preposition' },
  ⲧⲉϩⲟⲩⲉⲓⲧⲉ: { lemma: 'ϩⲟⲩⲉⲓⲧⲉ', gloss: 'the beginning', partOfSpeech: 'noun' },
  ⲛⲉϥϣⲟⲟⲡ: { lemma: 'ϣⲱⲡⲉ', gloss: 'he was existing', partOfSpeech: 'verb' },
  ⲡϣⲁϫⲉ: { lemma: 'ϣⲁϫⲉ', gloss: 'the Word', partOfSpeech: 'noun' },
  ⲁⲩⲱ: { lemma: 'ⲁⲩⲱ', gloss: 'and', partOfSpeech: 'conjunction' },
  ⲛⲛⲁϩⲣⲙ: { lemma: 'ⲛⲁϩⲣⲛ', gloss: 'with, in the presence of', partOfSpeech: 'preposition' },
  ⲡⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God', partOfSpeech: 'noun' },
  ⲛⲉⲩⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'was God (predicate)', partOfSpeech: 'noun' },
  ⲡⲉ: { lemma: 'ⲡⲉ', gloss: '(copula) is/was', partOfSpeech: 'particle' },
};

export const COP_MINI_1: TextSection = {
  id: 'CopMini-1',
  textId: 'CopMini-1',
  sequence: 1,
  label: 'ϩⲛ ⲧⲉϩⲟⲩⲉⲓⲧⲉ — In the beginning',
  sentences: [
    sentLex(
      'CopMini-1-1',
      ['ϩⲛ', 'ⲧⲉϩⲟⲩⲉⲓⲧⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲡϣⲁϫⲉ.'],
      'In the beginning the Word was.',
      COP_MINI_LEX
    ),
    sentLex(
      'CopMini-1-2',
      ['ⲁⲩⲱ', 'ⲡϣⲁϫⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲛⲛⲁϩⲣⲙ', 'ⲡⲛⲟⲩⲧⲉ.'],
      'And the Word was with God.',
      COP_MINI_LEX
    ),
    sentLex(
      'CopMini-1-3',
      ['ⲁⲩⲱ', 'ⲛⲉⲩⲛⲟⲩⲧⲉ', 'ⲡⲉ', 'ⲡϣⲁϫⲉ.'],
      'And the Word was God.',
      COP_MINI_LEX
    ),
  ],
};

// ─── Sanskrit: opening of the Bhagavad-Gītā (Devanagari) ─────────────────

const SAN_MINI_LEX: Record<string, LexicalHint> = {
  धृतराष्ट्र: { lemma: 'धृतराष्ट्र', gloss: 'Dhritarashtra', partOfSpeech: 'noun' },
  उवाच: { lemma: 'वच्', gloss: 'spoke, said', partOfSpeech: 'verb' },
  धर्मक्षेत्रे: { lemma: 'धर्मक्षेत्र', gloss: 'on the field of dharma', partOfSpeech: 'noun' },
  कुरुक्षेत्रे: { lemma: 'कुरुक्षेत्र', gloss: 'on the field of the Kurus', partOfSpeech: 'noun' },
  समवेताः: { lemma: 'समवेत', gloss: 'gathered together', partOfSpeech: 'adjective' },
  युयुत्सवः: { lemma: 'युयुत्सु', gloss: 'desiring to fight', partOfSpeech: 'adjective' },
  मामकाः: { lemma: 'मामक', gloss: 'mine, my (people)', partOfSpeech: 'adjective' },
  पाण्डवाः: { lemma: 'पाण्डव', gloss: 'the sons of Pandu', partOfSpeech: 'noun' },
  च: { lemma: 'च', gloss: 'and', partOfSpeech: 'conjunction' },
  एव: { lemma: 'एव', gloss: 'indeed, too', partOfSpeech: 'particle' },
  किम्: { lemma: 'किम्', gloss: 'what?', partOfSpeech: 'pronoun' },
  अकुर्वत: { lemma: 'कृ', gloss: 'they did', partOfSpeech: 'verb' },
  सञ्जय: { lemma: 'सञ्जय', gloss: 'O Sanjaya', partOfSpeech: 'noun' },
};

export const SAN_MINI_1: TextSection = {
  id: 'SanMini-1',
  textId: 'SanMini-1',
  sequence: 1,
  label: 'भगवद्गीता प्रथमाध्यायः — Bhagavad-Gītā, opening',
  sentences: [
    sentLex('SanMini-1-1', ['धृतराष्ट्र', 'उवाच'], 'Dhritarashtra spoke:', SAN_MINI_LEX),
    sentLex(
      'SanMini-1-2',
      ['धर्मक्षेत्रे', 'कुरुक्षेत्रे', 'समवेताः', 'युयुत्सवः.'],
      'On the field of dharma, on the field of Kuru, gathered together, desiring to fight,',
      SAN_MINI_LEX
    ),
    sentLex(
      'SanMini-1-3',
      ['मामकाः', 'पाण्डवाः', 'च', 'एव.'],
      'my own (people) and the Pandavas too —',
      SAN_MINI_LEX
    ),
    sentLex(
      'SanMini-1-4',
      ['किम्', 'अकुर्वत', 'सञ्जय?'],
      'what did they do, O Sanjaya?',
      SAN_MINI_LEX
    ),
  ],
};

export const ALL_MULTILANG_MINI_STORIES = [
  HEB_MINI_1,
  HEB_MINI_2,
  ARC_MINI_1,
  SYR_MINI_1,
  COP_MINI_1,
  SAN_MINI_1,
];
