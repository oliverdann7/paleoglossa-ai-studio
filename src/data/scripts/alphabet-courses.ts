/**
 * Staged alphabet courses for every supported language.
 *
 * Each course splits the language's sign inventory (see the sibling
 * `*-signs.ts` / `*-letters.ts` files) into short, ordered lessons of
 * 4–8 signs so an absolute beginner can learn the writing system a few
 * signs at a time instead of facing the whole chart at once. Lessons
 * reference signs by id — the sign definitions stay the single source of
 * truth for glyphs, phonetics, and example words.
 *
 * Rendered by `AlphabetCourseView` (Script Lab "Learn" tab), surfaced in
 * the Beginner Hub; completion is tracked per lesson by
 * `useAlphabetProgress`.
 */

import type { AlphabetCourse } from '../../types/scripts.js';

const GREEK_COURSE: AlphabetCourse = {
  langId: 'grc',
  title: 'The Greek Alphabet',
  intro:
    'Greek has 24 letters plus breathing marks and accents. Learn the seven vowels first — every Greek word is built around them.',
  lessons: [
    {
      id: 'grc-1',
      title: 'The Vowels',
      description: 'Seven vowels: α ε η ι ο υ ω. Note the short/long pairs ε–η and ο–ω.',
      tip: 'Eta (η) is a LONG e, omega (ω) is a LONG o — the "mega" (big) O.',
      signIds: [
        'grc-alpha',
        'grc-epsilon',
        'grc-eta',
        'grc-iota',
        'grc-omicron',
        'grc-upsilon',
        'grc-omega',
      ],
      practiceWords: [
        { word: 'ἐγώ', transliteration: 'egō', gloss: 'I' },
        { word: 'ὧδε', transliteration: 'hōde', gloss: 'here' },
      ],
    },
    {
      id: 'grc-2',
      title: 'Familiar Consonants',
      description: 'β γ δ κ τ — letters whose sounds you already know from English.',
      signIds: ['grc-beta', 'grc-gamma', 'grc-delta', 'grc-kappa', 'grc-tau'],
      practiceWords: [
        { word: 'κακός', transliteration: 'kakos', gloss: 'bad' },
        { word: 'τότε', transliteration: 'tote', gloss: 'then' },
      ],
    },
    {
      id: 'grc-3',
      title: 'Liquids and Nasals',
      description: 'λ μ ν ρ — the flowing sounds l, m, n, r.',
      signIds: ['grc-lambda', 'grc-mu', 'grc-nu', 'grc-rho'],
      practiceWords: [
        { word: 'νόμος', transliteration: 'nomos', gloss: 'law' },
        { word: 'μέρα', transliteration: 'mera', gloss: 'day (part)' },
      ],
    },
    {
      id: 'grc-4',
      title: 'Sibilants and Doubles',
      description: 'σ/ς ζ ξ ψ — sigma has a special final form (ς), and ξ, ψ pack two sounds each.',
      tip: 'Sigma is written ς only at the end of a word: σοφός.',
      signIds: ['grc-sigma', 'grc-zeta', 'grc-xi', 'grc-psi'],
      practiceWords: [
        { word: 'δόξα', transliteration: 'doxa', gloss: 'glory' },
        { word: 'σοφός', transliteration: 'sophos', gloss: 'wise' },
      ],
    },
    {
      id: 'grc-5',
      title: 'The Aspirates',
      description: 'θ φ χ π — theta, phi, chi (and pi for contrast).',
      signIds: ['grc-theta', 'grc-phi', 'grc-chi', 'grc-pi'],
      practiceWords: [
        { word: 'φῶς', transliteration: 'phōs', gloss: 'light' },
        { word: 'θεός', transliteration: 'theos', gloss: 'god' },
      ],
    },
    {
      id: 'grc-6',
      title: 'Breathings and Accents',
      description:
        'Every vowel-initial word carries a breathing mark; accents mark the musical pitch.',
      tip: 'Rough breathing (ἁ) = add an h-sound. Smooth breathing (ἀ) = no h.',
      signIds: [
        'grc-smooth-breathing',
        'grc-rough-breathing',
        'grc-acute',
        'grc-circumflex',
        'grc-grave',
        'grc-iota-subscript',
      ],
      practiceWords: [
        { word: 'ὁ λόγος', transliteration: 'ho logos', gloss: 'the word' },
        { word: 'ἡμέρα', transliteration: 'hēmera', gloss: 'day' },
      ],
    },
  ],
};

const HEBREW_COURSE: AlphabetCourse = {
  langId: 'hbo',
  title: 'The Hebrew Alef-Bet',
  intro:
    'Hebrew is written right-to-left with 22 consonants; vowels are dots and dashes (niqqud) added around them. Five letters change shape at the end of a word.',
  lessons: [
    {
      id: 'hbo-1',
      title: 'Alef to Zayin',
      description: 'The first seven letters: א ב ג ד ה ו ז.',
      tip: 'Hebrew reads right-to-left — start from the rightmost letter.',
      signIds: ['hbo-alef', 'hbo-bet', 'hbo-gimel', 'hbo-dalet', 'hbo-he', 'hbo-vav', 'hbo-zayin'],
      practiceWords: [
        { word: 'אָב', transliteration: 'av', gloss: 'father' },
        { word: 'זֶה', transliteration: 'zeh', gloss: 'this' },
      ],
    },
    {
      id: 'hbo-2',
      title: 'Het to Lamed',
      description: 'ח ט י כ ל — including kaf, the first letter with a final form (ך).',
      signIds: ['hbo-het', 'hbo-tet', 'hbo-yod', 'hbo-kaf', 'hbo-kaf-final', 'hbo-lamed'],
      practiceWords: [
        { word: 'לֵב', transliteration: 'lev', gloss: 'heart' },
        { word: 'יָד', transliteration: 'yad', gloss: 'hand' },
      ],
    },
    {
      id: 'hbo-3',
      title: 'Mem to Ayin',
      description: 'מ נ ס ע with the final forms ם and ן.',
      signIds: ['hbo-mem', 'hbo-mem-final', 'hbo-nun', 'hbo-nun-final', 'hbo-samekh', 'hbo-ayin'],
      practiceWords: [
        { word: 'מַיִם', transliteration: 'mayim', gloss: 'water' },
        { word: 'עַיִן', transliteration: 'ayin', gloss: 'eye' },
      ],
    },
    {
      id: 'hbo-4',
      title: 'Pe to Tav',
      description: 'פ צ ק ר שׁ שׂ ת — including shin/sin, distinguished only by a dot.',
      tip: 'Dot top-RIGHT = shin (sh). Dot top-LEFT = sin (s).',
      signIds: [
        'hbo-pe',
        'hbo-pe-final',
        'hbo-tsade',
        'hbo-tsade-final',
        'hbo-qof',
        'hbo-resh',
        'hbo-shin',
        'hbo-sin',
        'hbo-tav',
      ],
      practiceWords: [
        { word: 'שָׁלוֹם', transliteration: 'shalom', gloss: 'peace' },
        { word: 'תּוֹרָה', transliteration: 'torah', gloss: 'instruction, law' },
      ],
    },
    {
      id: 'hbo-5',
      title: 'Reading Aids: Matres Lectionis',
      description: 'ו ,י ,ה doubling as vowel letters — the oldest way Hebrew marked vowels.',
      signIds: ['hbo-mater-vav', 'hbo-mater-yod', 'hbo-mater-he'],
      practiceWords: [
        { word: 'אִישׁ', transliteration: 'ish', gloss: 'man' },
        { word: 'סוּס', transliteration: 'sus', gloss: 'horse' },
      ],
    },
    {
      id: 'hbo-6',
      title: 'The Vowel Points (Niqqud)',
      description:
        'The Masoretic vowel signs: qamats, patah, tsere, segol, hiriq, holam, qibbuts, shva.',
      tip: 'Vowel points sit under (or above) the consonant they FOLLOW in speech.',
      signIds: [
        'hbo-qamats',
        'hbo-patah',
        'hbo-tsere',
        'hbo-segol',
        'hbo-hiriq',
        'hbo-holam',
        'hbo-qibbuts',
        'hbo-shva',
      ],
      practiceWords: [
        { word: 'דָּבָר', transliteration: 'davar', gloss: 'word, thing' },
        { word: 'מֶלֶךְ', transliteration: 'melekh', gloss: 'king' },
      ],
    },
  ],
};

const LATIN_COURSE: AlphabetCourse = {
  langId: 'lat',
  title: 'The Latin Alphabet',
  intro:
    'You already know these letters — Latin gave them to English. The course focuses on what differs: classical values, missing letters, and Roman writing conventions.',
  lessons: [
    {
      id: 'lat-1',
      title: 'A to H',
      description: 'The first letters with their classical sounds — C is always hard (k).',
      tip: 'Classical C is ALWAYS /k/: Cicero = "Kikero".',
      signIds: ['lat-a', 'lat-b', 'lat-c', 'lat-d', 'lat-e', 'lat-f', 'lat-g', 'lat-h'],
      practiceWords: [
        { word: 'aqua', transliteration: 'AH-kwa', gloss: 'water' },
        { word: 'deus', transliteration: 'DEH-us', gloss: 'god' },
      ],
    },
    {
      id: 'lat-2',
      title: 'I to Q',
      description: 'I doubles as the consonant y; Q is always followed by V.',
      signIds: ['lat-i', 'lat-l', 'lat-m', 'lat-n', 'lat-o', 'lat-p', 'lat-q'],
      practiceWords: [
        { word: 'lūna', transliteration: 'LOO-na', gloss: 'moon' },
        { word: 'populus', transliteration: 'PO-pu-lus', gloss: 'people' },
      ],
    },
    {
      id: 'lat-3',
      title: 'R to Z',
      description: 'Rolled R, V as /w/, plus the Greek loans Y and Z.',
      tip: 'Classical V sounds like English W: veni = "weni".',
      signIds: ['lat-r', 'lat-s', 'lat-t', 'lat-v', 'lat-x', 'lat-y', 'lat-z'],
      practiceWords: [
        { word: 'vīnum', transliteration: 'WEE-num', gloss: 'wine' },
        { word: 'rēx', transliteration: 'rayks', gloss: 'king' },
      ],
    },
    {
      id: 'lat-4',
      title: 'Conventions of Roman Writing',
      description:
        'U/V and I/J were single letters; diphthongs AE and OE; macrons mark vowel length; famous abbreviations.',
      signIds: [
        'lat-v-u',
        'lat-i-j',
        'lat-c-g',
        'lat-ae',
        'lat-oe',
        'lat-macron',
        'lat-breve',
        'lat-spqr',
        'lat-cos',
        'lat-imp',
        'lat-scriptio-continua',
      ],
      practiceWords: [
        { word: 'ROMA', transliteration: 'RO-ma', gloss: 'Rome' },
        { word: 'CAESAR', transliteration: 'KYE-sar', gloss: 'Caesar' },
      ],
    },
  ],
};

const SYRIAC_COURSE: AlphabetCourse = {
  langId: 'syr',
  title: 'The Syriac Alphabet',
  intro:
    'Syriac is written right-to-left with 22 consonants — the same inventory as Hebrew and Aramaic — in a flowing, connected script. Vowels are small marks above or below the line.',
  lessons: [
    {
      id: 'syr-1',
      title: 'Ālap to Zayn',
      description: 'The first seven letters: ܐ ܒ ܓ ܕ ܗ ܘ ܙ.',
      tip: 'Most Syriac letters connect to the letter that follows, like cursive.',
      signIds: ['syr-alap', 'syr-bet', 'syr-gamal', 'syr-dalat', 'syr-he', 'syr-waw', 'syr-zayn'],
      practiceWords: [
        { word: 'ܐܒܐ', transliteration: 'ʾabā', gloss: 'father' },
        { word: 'ܗܘ', transliteration: 'hū', gloss: 'he' },
      ],
    },
    {
      id: 'syr-2',
      title: 'Ḥēt to Nūn',
      description: 'ܚ ܛ ܝ ܟ ܠ ܡ ܢ — the middle of the alphabet.',
      signIds: ['syr-het', 'syr-tet', 'syr-yod', 'syr-kap', 'syr-lamad', 'syr-mim', 'syr-nun'],
      practiceWords: [
        { word: 'ܡܠܟܐ', transliteration: 'malkā', gloss: 'king' },
        { word: 'ܝܡܐ', transliteration: 'yamā', gloss: 'sea' },
      ],
    },
    {
      id: 'syr-3',
      title: 'Semkat to Taw',
      description: 'ܣ ܥ ܦ ܨ ܩ ܪ ܫ ܬ — completing the 22 consonants.',
      signIds: [
        'syr-semkat',
        'syr-e',
        'syr-pe',
        'syr-sade',
        'syr-qop',
        'syr-resh',
        'syr-shin',
        'syr-taw',
      ],
      practiceWords: [
        { word: 'ܫܠܡܐ', transliteration: 'šlāmā', gloss: 'peace' },
        { word: 'ܩܕܝܫܐ', transliteration: 'qaddīšā', gloss: 'holy' },
      ],
    },
    {
      id: 'syr-4',
      title: 'The Vowel Marks',
      description: 'West Syriac vowel signs: pṯāḥā, zqāpā, rḇāṣā, ḥḇāṣā, ʿṣāṣā.',
      tip: 'Early Syriac texts have no vowels at all — readers supplied them from context.',
      signIds: ['syr-ptaha', 'syr-zqapa', 'syr-rbasa-arrika', 'syr-hbasa', 'syr-esasa'],
      practiceWords: [{ word: 'ܐܰܒܳܐ', transliteration: 'ʾabā', gloss: 'father (vocalized)' }],
    },
  ],
};

const COPTIC_COURSE: AlphabetCourse = {
  langId: 'cop',
  title: 'The Coptic Alphabet',
  intro:
    'Coptic writes the Egyptian language with Greek letters plus seven signs borrowed from Demotic for sounds Greek lacked. If you know Greek, you are two-thirds of the way there.',
  lessons: [
    {
      id: 'cop-1',
      title: 'The Vowels',
      description: 'ⲁ ⲉ ⲏ ⲓ ⲟ ⲩ ⲱ — the Greek vowel set in Coptic dress.',
      signIds: ['cop-alpha', 'cop-ei', 'cop-eta', 'cop-yota', 'cop-o', 'cop-epsilon', 'cop-omega'],
      practiceWords: [{ word: 'ⲟⲩⲁ', transliteration: 'oua', gloss: 'one' }],
    },
    {
      id: 'cop-2',
      title: 'Greek Consonants I',
      description: 'ⲃ ⲅ ⲇ ⲍ ⲑ ⲕ ⲗ ⲙ — familiar shapes from the Greek alphabet.',
      signIds: [
        'cop-vida',
        'cop-gamma',
        'cop-dalda',
        'cop-zeta',
        'cop-theta',
        'cop-kappa',
        'cop-laula',
        'cop-mi',
      ],
      practiceWords: [{ word: 'ⲙⲁⲩ', transliteration: 'mau', gloss: 'mother' }],
    },
    {
      id: 'cop-3',
      title: 'Greek Consonants II',
      description: 'ⲛ ⲝ ⲡ ⲣ ⲥ ⲧ ⲫ ⲭ ⲯ — the rest of the Greek stock (ⲥ is a "lunate" sigma).',
      signIds: [
        'cop-ni',
        'cop-eksi',
        'cop-pi',
        'cop-ro',
        'cop-sima',
        'cop-tau',
        'cop-phi',
        'cop-khi',
        'cop-psi',
      ],
      practiceWords: [{ word: 'ⲣⲁⲛ', transliteration: 'ran', gloss: 'name' }],
    },
    {
      id: 'cop-4',
      title: 'The Demotic Letters',
      description:
        'ϣ ϥ ϧ ϩ ϫ ϭ ϯ — seven signs from Egyptian Demotic for sounds Greek could not write.',
      tip: 'These seven letters are what make the script Coptic rather than Greek.',
      signIds: ['cop-shai', 'cop-fai', 'cop-xai', 'cop-hori', 'cop-janja', 'cop-cima', 'cop-ti'],
      practiceWords: [
        { word: 'ϣⲁϫⲉ', transliteration: 'šadje', gloss: 'word' },
        { word: 'ϩⲏⲧ', transliteration: 'hēt', gloss: 'heart' },
      ],
    },
    {
      id: 'cop-5',
      title: 'Rarities',
      description: 'ⲋ (so/stigma) survives mainly as the numeral 6.',
      signIds: ['cop-so'],
    },
  ],
};

const ARAMAIC_COURSE: AlphabetCourse = {
  langId: 'arc',
  title: 'The Aramaic Alphabet',
  intro:
    'Biblical Aramaic uses the same 22-letter square script as Hebrew — the script Jews adopted FROM Aramaic. If you learn one, you can read the other.',
  lessons: [
    {
      id: 'arc-1',
      title: 'Ālep to Zayin',
      description: 'The first seven letters: א ב ג ד ה ו ז.',
      tip: 'This "square script" is the ancestor of the modern Hebrew alphabet.',
      signIds: ['arc-aleph', 'arc-bet', 'arc-gimel', 'arc-dalet', 'arc-he', 'arc-waw', 'arc-zayin'],
      practiceWords: [{ word: 'אַב', transliteration: 'ʾav', gloss: 'father' }],
    },
    {
      id: 'arc-2',
      title: 'Ḥēt to Nūn',
      description: 'ח ט י כ ל מ נ — with the final forms ך ם ן.',
      signIds: ['arc-het', 'arc-tet', 'arc-yod', 'arc-kaf', 'arc-lamed', 'arc-mem', 'arc-nun'],
      practiceWords: [{ word: 'מֶלֶךְ', transliteration: 'melek', gloss: 'king' }],
    },
    {
      id: 'arc-3',
      title: 'Sāmek to Tāw',
      description: 'ס ע פ צ ק ר ש ת — completing the alphabet.',
      signIds: [
        'arc-samekh',
        'arc-ayin',
        'arc-pe',
        'arc-tsade',
        'arc-qof',
        'arc-resh',
        'arc-shin',
        'arc-tav',
      ],
      practiceWords: [{ word: 'שְׁלָם', transliteration: 'šlām', gloss: 'peace' }],
    },
    {
      id: 'arc-4',
      title: 'Aramaic Grammar Signals',
      description:
        'Two features that mark a text as Aramaic rather than Hebrew: the emphatic-state ending ־ָא and the relative particle דִּי.',
      tip: 'Seeing lots of words ending in ־ָא? You are reading Aramaic.',
      signIds: ['arc-emphatic-state', 'arc-di-relative'],
      practiceWords: [{ word: 'מַלְכָּא', transliteration: 'malkāʾ', gloss: 'the king' }],
    },
  ],
};

const AKKADIAN_COURSE: AlphabetCourse = {
  langId: 'akk',
  title: 'Cuneiform for Akkadian',
  intro:
    'Akkadian is written in cuneiform — wedge-shaped signs pressed into clay. Signs stand for syllables (ba, ab, kur…) or whole words (logograms). This course teaches the core syllabary.',
  lessons: [
    {
      id: 'akk-1',
      title: 'The Four Vowels',
      description: 'a e i u — the independent vowel signs, the smallest building blocks.',
      tip: 'Cuneiform has no o — only a, e, i, u.',
      signIds: ['akk-a', 'akk-e', 'akk-i', 'akk-u'],
    },
    {
      id: 'akk-2',
      title: 'BA – DA – GA',
      description: 'Consonant+vowel syllables with b, d, g.',
      signIds: [
        'akk-ba',
        'akk-be',
        'akk-bi',
        'akk-bu',
        'akk-da',
        'akk-di',
        'akk-du',
        'akk-ga',
        'akk-gi',
        'akk-gu',
      ],
    },
    {
      id: 'akk-3',
      title: 'KA – LA – MA',
      description: 'Syllables with k, l, m.',
      signIds: [
        'akk-ka',
        'akk-ki',
        'akk-ku',
        'akk-la',
        'akk-li',
        'akk-lu',
        'akk-ma',
        'akk-mi',
        'akk-mu',
      ],
    },
    {
      id: 'akk-4',
      title: 'NA – RA – SA',
      description: 'Syllables with n, r, s.',
      signIds: [
        'akk-na',
        'akk-ni',
        'akk-nu',
        'akk-ra',
        'akk-ri',
        'akk-ru',
        'akk-sa',
        'akk-si',
        'akk-su',
      ],
    },
    {
      id: 'akk-5',
      title: 'TA – ZA and Closed Syllables',
      description: 'Syllables with t and z, plus vowel+consonant signs like am, en, ur.',
      signIds: [
        'akk-ta',
        'akk-ti',
        'akk-tu',
        'akk-za',
        'akk-zi',
        'akk-zu',
        'akk-am',
        'akk-an',
        'akk-en',
        'akk-in',
        'akk-un',
        'akk-ur',
      ],
    },
    {
      id: 'akk-6',
      title: 'Logograms',
      description:
        'Signs that stand for whole words, inherited from Sumerian: LUGAL "king", KUR "land", DUMU "son", É "house".',
      tip: 'Scholars write logograms in CAPITALS: LUGAL is read šarrum ("king") in Akkadian.',
      signIds: [
        'akk-an-log',
        'akk-en-log',
        'akk-gal-log',
        'akk-lugal-log',
        'akk-dumu-log',
        'akk-kur-log',
        'akk-lu2-log',
        'akk-e2-log',
        'akk-dug4-log',
        'akk-gin-log',
      ],
    },
  ],
};

const SANSKRIT_COURSE: AlphabetCourse = {
  langId: 'san',
  title: 'Devanāgarī for Sanskrit',
  intro:
    'Devanāgarī is an abugida: every consonant carries an inherent "a" (क = ka), and other vowels are written as marks around it. The letters are ordered scientifically by where in the mouth they are made.',
  lessons: [
    {
      id: 'san-1',
      title: 'Simple Vowels',
      description: 'अ आ इ ई उ ऊ ऋ — short and long vowel pairs.',
      tip: 'A small extra stroke usually means "make it long": इ i → ई ī.',
      signIds: ['san-a', 'san-aa', 'san-i', 'san-ii', 'san-u', 'san-uu', 'san-ri'],
    },
    {
      id: 'san-2',
      title: 'Compound Vowels',
      description: 'ए ऐ ओ औ plus the nasal anusvāra (ं) and breathy visarga (ः).',
      signIds: ['san-e', 'san-ai', 'san-o', 'san-au', 'san-anusvara', 'san-visarga'],
    },
    {
      id: 'san-3',
      title: 'Velars and Palatals',
      description: 'क ख ग घ ङ (throat) and च छ ज झ ञ (palate) — the first two consonant rows.',
      tip: 'Each row runs: unvoiced, unvoiced-aspirated, voiced, voiced-aspirated, nasal.',
      signIds: [
        'san-ka',
        'san-kha',
        'san-ga',
        'san-gha',
        'san-nga',
        'san-ca',
        'san-cha',
        'san-ja',
        'san-jha',
        'san-nya',
      ],
    },
    {
      id: 'san-4',
      title: 'Retroflexes and Dentals',
      description: 'ट ठ ड ढ ण (tongue curled back) and त थ द ध न (tongue at the teeth).',
      signIds: [
        'san-tta',
        'san-ttha',
        'san-dda',
        'san-ddha',
        'san-nna',
        'san-ta',
        'san-tha',
        'san-da',
        'san-dha',
        'san-na',
      ],
    },
    {
      id: 'san-5',
      title: 'Labials and Semivowels',
      description: 'प फ ब भ म (lips) and य र ल व.',
      signIds: [
        'san-pa',
        'san-pha',
        'san-ba',
        'san-bha',
        'san-ma',
        'san-ya',
        'san-ra',
        'san-la',
        'san-va',
      ],
      practiceWords: [{ word: 'नमः', transliteration: 'namaḥ', gloss: 'homage, salutation' }],
    },
    {
      id: 'san-6',
      title: 'Sibilants, Ha, and Special Marks',
      description: 'श ष स ह plus the vowel-killer virāma (्) and candrabindu (ँ).',
      tip: 'The virāma strips the inherent a: क ka → क् k.',
      signIds: ['san-sha', 'san-ssa', 'san-sa', 'san-ha', 'san-virama', 'san-chandrabindu'],
      practiceWords: [{ word: 'योगः', transliteration: 'yogaḥ', gloss: 'yoga, union' }],
    },
  ],
};

const EGYPTIAN_COURSE: AlphabetCourse = {
  langId: 'egy',
  title: 'Reading Hieroglyphs',
  intro:
    'Hieroglyphs mix three kinds of sign: phonograms that spell sounds, logograms that stand for words, and silent determinatives that classify meaning. Start with the one-sound "alphabet" every Egyptologist learns first.',
  lessons: [
    {
      id: 'egy-1',
      title: 'Uniliterals I',
      description: 'One-sound signs: the vulture (ꜣ), reed (ỉ), arm (ꜥ), quail chick (w) and more.',
      tip: 'Egyptian writes no vowels — the signs record consonants only.',
      signIds: [
        'egy-G1',
        'egy-M17',
        'egy-M17-M17',
        'egy-D36',
        'egy-D58',
        'egy-Q3',
        'egy-I9',
        'egy-G43',
      ],
    },
    {
      id: 'egy-2',
      title: 'Uniliterals II',
      description: 'The rest of the one-sound signs: mouth (r), owl (m), water (n), and friends.',
      signIds: [
        'egy-D21',
        'egy-O4',
        'egy-V28',
        'egy-AA1',
        'egy-D3',
        'egy-M36',
        'egy-S29',
        'egy-N35',
        'egy-G17',
      ],
    },
    {
      id: 'egy-3',
      title: 'Uniliterals III',
      description:
        'Completing the alphabet: basket (k), stand (g), loaf (t), tether (ṯ), and more.',
      signIds: ['egy-V31', 'egy-W11', 'egy-X1', 'egy-V13', 'egy-Z7', 'egy-Aa15'],
    },
    {
      id: 'egy-4',
      title: 'Common Biliterals and Triliterals',
      description: 'Signs carrying two or three sounds: mn, pr, nb, ḥtp, nfr, ꜥnḫ.',
      tip: 'ꜥnḫ — the ankh — is both the word "life" and one of the most famous signs on earth.',
      signIds: [
        'egy-mn',
        'egy-pr',
        'egy-ra',
        'egy-nb',
        'egy-htp',
        'egy-nfr',
        'egy-anx',
        'egy-xeper',
        'egy-seneb',
      ],
    },
    {
      id: 'egy-5',
      title: 'Sacred Logograms',
      description: 'Word-signs: djed pillar, was scepter, maat feather, ka arms, ba bird.',
      signIds: [
        'egy-djed',
        'egy-was',
        'egy-maat',
        'egy-ka',
        'egy-ba',
        'egy-nebty',
        'egy-sekhem',
        'egy-qema',
      ],
    },
    {
      id: 'egy-6',
      title: 'Determinatives',
      description:
        'Silent classifiers placed at the end of words: man, woman, god, city, water, plural strokes.',
      tip: 'Determinatives are never pronounced — they tell you what KIND of word you just read.',
      signIds: [
        'egy-det-man',
        'egy-det-woman',
        'egy-det-god',
        'egy-det-city',
        'egy-det-water',
        'egy-det-plural',
      ],
    },
  ],
};

const HITTITE_COURSE: AlphabetCourse = {
  langId: 'hit',
  title: 'Cuneiform for Hittite',
  intro:
    'Hittite borrowed the cuneiform syllabary from Mesopotamia. Signs spell syllables (a, ta, an…), and scribes mixed in Sumerian and Akkadian word-signs. Learn the vowels first, then build outward.',
  lessons: [
    {
      id: 'hit-1',
      title: 'Vowels',
      description: 'The four vowel signs: a e i u.',
      signIds: ['hit-a', 'hit-e', 'hit-i', 'hit-u'],
    },
    {
      id: 'hit-2',
      title: 'PA – TA – KA',
      description: 'Consonant+vowel signs with p, t, k.',
      signIds: [
        'hit-pa',
        'hit-pi',
        'hit-pu',
        'hit-ta',
        'hit-te',
        'hit-ti',
        'hit-tu',
        'hit-ka',
        'hit-ki',
        'hit-ku',
      ],
    },
    {
      id: 'hit-3',
      title: 'GA – LA – MA – NA',
      description: 'Syllables with g, l, m, n.',
      signIds: [
        'hit-ga',
        'hit-gi',
        'hit-gu',
        'hit-la',
        'hit-li',
        'hit-lu',
        'hit-ma',
        'hit-mi',
        'hit-mu',
        'hit-na',
        'hit-ni',
        'hit-nu',
      ],
    },
    {
      id: 'hit-4',
      title: 'WA – ZA – SA',
      description: 'Syllables with w, z, s.',
      signIds: ['hit-wa', 'hit-wi', 'hit-za', 'hit-zi', 'hit-zu', 'hit-sa', 'hit-si', 'hit-su'],
    },
    {
      id: 'hit-5',
      title: 'Closed Syllables',
      description: 'Vowel+consonant signs: ah, an, ar, as, az, en, ir, uk, up and more.',
      tip: 'Scribes spell a closed syllable like "tar" as ta-ar, or use a single VC sign.',
      signIds: [
        'hit-ah',
        'hit-an',
        'hit-ar',
        'hit-as',
        'hit-az',
        'hit-eh',
        'hit-en',
        'hit-er',
        'hit-es',
        'hit-ih',
        'hit-in',
        'hit-ir',
        'hit-is',
        'hit-iz',
        'hit-uh',
        'hit-un',
        'hit-ur',
        'hit-us',
        'hit-uz',
        'hit-ul',
        'hit-el',
        'hit-ak',
        'hit-uk',
        'hit-ap',
        'hit-ip',
        'hit-up',
      ],
    },
  ],
};

const UGARITIC_COURSE: AlphabetCourse = {
  langId: 'uga',
  title: 'The Ugaritic Alphabet',
  intro:
    'Ugaritic looks like cuneiform but is actually an alphabet — 30 wedge-signs, one per consonant, invented around 1400 BCE. It is one of the earliest alphabets ever devised.',
  lessons: [
    {
      id: 'uga-1',
      title: 'ʾa to ḥ',
      description: 'The first eight signs: 𐎀 𐎁 𐎂 𐎃 𐎄 𐎅 𐎆 𐎇.',
      tip: 'Unlike Mesopotamian cuneiform, each Ugaritic sign is one consonant — a true alphabet.',
      signIds: [
        'uga-alpa',
        'uga-beta',
        'uga-gamla',
        'uga-kha',
        'uga-delta',
        'uga-ho',
        'uga-wo',
        'uga-zetta',
      ],
    },
    {
      id: 'uga-2',
      title: 'ḥ to n',
      description: '𐎈 𐎉 𐎊 𐎋 𐎌 𐎍 𐎎 𐎏 𐎐 — the middle of the abecedary.',
      signIds: [
        'uga-hota',
        'uga-tet',
        'uga-yod',
        'uga-kaf',
        'uga-shin',
        'uga-lamda',
        'uga-mem',
        'uga-dhal',
        'uga-nun',
      ],
    },
    {
      id: 'uga-3',
      title: 'ẓ to ġ',
      description: '𐎑 𐎒 𐎓 𐎔 𐎕 𐎖 𐎗 𐎘 𐎙 — emphatics and gutturals.',
      signIds: [
        'uga-dhann',
        'uga-samka',
        'uga-ayin',
        'uga-pe',
        'uga-sade',
        'uga-qopa',
        'uga-rasha',
        'uga-thann',
        'uga-ghain',
      ],
    },
    {
      id: 'uga-4',
      title: 'The Final Signs',
      description: '𐎚 𐎛 𐎜 𐎝 — t, the extra alephs ʾi and ʾu, and s₂.',
      tip: 'Three aleph signs (ʾa ʾi ʾu) record which vowel follows the glottal stop — a bonus hint in a vowel-less script.',
      signIds: ['uga-to', 'uga-i', 'uga-u', 'uga-su2'],
      practiceWords: [
        { word: '𐎎𐎍𐎋', transliteration: 'mlk', gloss: 'king' },
        { word: '𐎁𐎓𐎍', transliteration: 'bʿl', gloss: 'Baal, lord' },
      ],
    },
  ],
};

/** All courses, keyed by language id. Koine shares the Greek course. */
export const ALPHABET_COURSES: Record<string, AlphabetCourse> = {
  grc: GREEK_COURSE,
  'grc-koine': { ...GREEK_COURSE, langId: 'grc-koine' },
  hbo: HEBREW_COURSE,
  lat: LATIN_COURSE,
  syr: SYRIAC_COURSE,
  cop: COPTIC_COURSE,
  arc: ARAMAIC_COURSE,
  akk: AKKADIAN_COURSE,
  san: SANSKRIT_COURSE,
  egy: EGYPTIAN_COURSE,
  hit: HITTITE_COURSE,
  uga: UGARITIC_COURSE,
};

export function getAlphabetCourse(langId: string): AlphabetCourse | null {
  return ALPHABET_COURSES[langId] ?? null;
}
