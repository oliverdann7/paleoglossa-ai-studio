/**
 * Beginner mini-stories for the smaller-corpus languages
 * (Hebrew, Aramaic, Syriac, Coptic, Sanskrit). Each story is a few
 * sentences of plain prose with an English translation, useful for
 * absolute-beginner exposure to script and basic syntax.
 *
 * Tokens are tokenized inline like the Greek/Latin mini-stories; the
 * offline dictionary handles glosses via the lemma index.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?·()"«»—–]+|[\s.,;:!?·()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: normalized,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── Hebrew: Creation excerpts (vocalized Biblical Hebrew) ────────────────

export const HEB_MINI_1: TextSection = {
  id: 'HebMini-1',
  textId: 'HebMini-1',
  sequence: 1,
  label: 'בְּרֵאשִׁית — In the beginning',
  sentences: [
    sent(
      'HebMini-1-1',
      ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', 'אֵת', 'הַשָּׁמַיִם', 'וְאֵת', 'הָאָרֶץ.'],
      'In the beginning God created the heavens and the earth.'
    ),
    sent(
      'HebMini-1-2',
      ['וְהָאָרֶץ', 'הָיְתָה', 'תֹהוּ', 'וָבֹהוּ.'],
      'And the earth was formless and void.'
    ),
    sent(
      'HebMini-1-3',
      ['וַיֹּאמֶר', 'אֱלֹהִים', 'יְהִי', 'אוֹר.'],
      'And God said: Let there be light.'
    ),
    sent('HebMini-1-4', ['וַיְהִי', 'אוֹר.'], 'And there was light.'),
    sent(
      'HebMini-1-5',
      ['וַיַּרְא', 'אֱלֹהִים', 'אֶת', 'הָאוֹר', 'כִּי', 'טוֹב.'],
      'And God saw the light, that it was good.'
    ),
  ],
};

export const HEB_MINI_2: TextSection = {
  id: 'HebMini-2',
  textId: 'HebMini-2',
  sequence: 2,
  label: 'הָרֹעֶה הַטּוֹב — The good shepherd',
  sentences: [
    sent('HebMini-2-1', ['יְהוָה', 'רֹעִי', 'לֹא', 'אֶחְסָר.'], 'The LORD is my shepherd; I shall not want.'),
    sent(
      'HebMini-2-2',
      ['בִּנְאוֹת', 'דֶּשֶׁא', 'יַרְבִּיצֵנִי.'],
      'He makes me lie down in green pastures.'
    ),
    sent(
      'HebMini-2-3',
      ['עַל', 'מֵי', 'מְנֻחוֹת', 'יְנַהֲלֵנִי.'],
      'He leads me beside still waters.'
    ),
    sent('HebMini-2-4', ['נַפְשִׁי', 'יְשׁוֹבֵב.'], 'He restores my soul.'),
  ],
};

// ─── Aramaic: a short greeting and a saying ──────────────────────────────

export const ARC_MINI_1: TextSection = {
  id: 'ArcMini-1',
  textId: 'ArcMini-1',
  sequence: 1,
  label: 'אֲמַר רַבָּן — The teacher spoke',
  sentences: [
    sent(
      'ArcMini-1-1',
      ['אֲמַר', 'רַבָּן', 'גַּמְלִיאֵל', 'לְתַלְמִידוֹי.'],
      'Rabban Gamliel said to his students.'
    ),
    sent(
      'ArcMini-1-2',
      ['חַכִּימָא', 'דְּחָזֵי', 'יוֹמָא', 'דְּמִיתֵיהּ.'],
      'A wise one is he who sees the day of his death.'
    ),
    sent(
      'ArcMini-1-3',
      ['וְתָאֵב', 'מִן', 'כָּל', 'יוֹם.'],
      'And returns (in repentance) from every day.'
    ),
    sent(
      'ArcMini-1-4',
      ['וְלָא', 'תֵּימָר', 'דָּא', 'יוֹם.'],
      'And do not say: "This is the day."'
    ),
  ],
};

// ─── Syriac: opening lines of the Lord’s Prayer (Peshitta) ──────────────

export const SYR_MINI_1: TextSection = {
  id: 'SyrMini-1',
  textId: 'SyrMini-1',
  sequence: 1,
  label: 'ܐܒܘܢ ܕܒܫܡܝܐ — Our Father in heaven',
  sentences: [
    sent('SyrMini-1-1', ['ܐܒܘܢ', 'ܕܒܫܡܝܐ', 'ܢܬܩܕܫ', 'ܫܡܟ.'], 'Our Father in heaven, hallowed be your name.'),
    sent(
      'SyrMini-1-2',
      ['ܬܐܬܐ', 'ܡܠܟܘܬܟ.'],
      'May your kingdom come.'
    ),
    sent(
      'SyrMini-1-3',
      ['ܢܗܘܐ', 'ܨܒܝܢܟ', 'ܐܝܟܢܐ', 'ܕܒܫܡܝܐ', 'ܐܦ', 'ܒܐܪܥܐ.'],
      'May your will be done as in heaven, also on earth.'
    ),
    sent(
      'SyrMini-1-4',
      ['ܗܒ', 'ܠܢ', 'ܠܚܡܢ', 'ܕܣܘܢܩܢܢ', 'ܝܘܡܢܐ.'],
      'Give us today the bread of our need.'
    ),
  ],
};

// ─── Coptic: opening of Sahidic John's Gospel ───────────────────────────

export const COP_MINI_1: TextSection = {
  id: 'CopMini-1',
  textId: 'CopMini-1',
  sequence: 1,
  label: 'ϩⲛ ⲧⲉϩⲟⲩⲉⲓⲧⲉ — In the beginning',
  sentences: [
    sent(
      'CopMini-1-1',
      ['ϩⲛ', 'ⲧⲉϩⲟⲩⲉⲓⲧⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲡϣⲁϫⲉ.'],
      'In the beginning the Word was.'
    ),
    sent(
      'CopMini-1-2',
      ['ⲁⲩⲱ', 'ⲡϣⲁϫⲉ', 'ⲛⲉϥϣⲟⲟⲡ', 'ⲛⲛⲁϩⲣⲙ', 'ⲡⲛⲟⲩⲧⲉ.'],
      'And the Word was with God.'
    ),
    sent(
      'CopMini-1-3',
      ['ⲁⲩⲱ', 'ⲛⲉⲩⲛⲟⲩⲧⲉ', 'ⲡⲉ', 'ⲡϣⲁϫⲉ.'],
      'And the Word was God.'
    ),
  ],
};

// ─── Sanskrit: opening of the Bhagavad-Gītā (Devanagari) ─────────────────

export const SAN_MINI_1: TextSection = {
  id: 'SanMini-1',
  textId: 'SanMini-1',
  sequence: 1,
  label: 'भगवद्गीता प्रथमाध्यायः — Bhagavad-Gītā, opening',
  sentences: [
    sent(
      'SanMini-1-1',
      ['धृतराष्ट्र', 'उवाच'],
      'Dhritarashtra spoke:'
    ),
    sent(
      'SanMini-1-2',
      ['धर्मक्षेत्रे', 'कुरुक्षेत्रे', 'समवेताः', 'युयुत्सवः.'],
      'On the field of dharma, on the field of Kuru, gathered together, desiring to fight,'
    ),
    sent(
      'SanMini-1-3',
      ['मामकाः', 'पाण्डवाः', 'च', 'एव.'],
      'my own (people) and the Pandavas too —'
    ),
    sent(
      'SanMini-1-4',
      ['किम्', 'अकुर्वत', 'सञ्जय?'],
      'what did they do, O Sanjaya?'
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
