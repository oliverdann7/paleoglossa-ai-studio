import { TextSection } from "../../types/corpus.js";

export const SYRIAC_JOHN_1_1: TextSection = {
  id: "Syr-Jn-1-1",
  textId: "Syr-Jn-1",
  sequence: 1,
  label: "John 1",
  sentences: [
    {
      id: "syr-1",
      translation: "In the beginning was the Word.",
      tokens: [
        {
          id: "syr1",
          surface: "ܒܪܝܫܝܬ",
          normalized: "ܒܪܝܫܝܬ",
          lemma: "ܪܝܫܝܬ",
          gloss: "in the beginning",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "syr2",
          surface: "ܐܝܬܘܗܝ",
          normalized: "ܐܝܬܘܗܝ",
          lemma: "ܐܝܬ",
          gloss: "was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "syr3",
          surface: "ܗܘܐ",
          normalized: "ܗܘܐ",
          lemma: "ܗܘܐ",
          gloss: "he was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "syr4",
          surface: "ܡܠܬܐ",
          normalized: "ܡܠܬܐ",
          lemma: "ܡܠܬܐ",
          gloss: "the Word",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
  ],
};

export const COPTIC_JOHN_1_1: TextSection = {
  id: "Cop-Jn-1-1",
  textId: "Cop-Jn-1",
  sequence: 1,
  label: "John 1",
  sentences: [
    {
      id: "cop-1",
      translation: "In the beginning was the Word.",
      tokens: [
        {
          id: "cop1",
          surface: "ϩⲛ",
          normalized: "ϩⲛ",
          lemma: "ϩⲛ",
          gloss: "in",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "cop2",
          surface: "ⲧⲉ",
          normalized: "ⲧⲉ",
          lemma: "ⲡ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: "",
        },
        {
          id: "cop3",
          surface: "ϩⲟⲩⲉⲓⲧⲉ",
          normalized: "ϩⲟⲩⲉⲓⲧⲉ",
          lemma: "ϩⲟⲩⲉⲓⲧⲉ",
          gloss: "beginning",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "cop4",
          surface: "ⲛⲉϥϣⲟⲟⲡ",
          normalized: "ⲛⲉϥϣⲟⲟⲡ",
          lemma: "ϣⲱⲡⲉ",
          gloss: "was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "cop5",
          surface: "ⲛϭⲓ",
          normalized: "ⲛϭⲓ",
          lemma: "ⲛϭⲓ",
          gloss: "namely",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "cop6",
          surface: "ⲡ",
          normalized: "ⲡ",
          lemma: "ⲡ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: "",
        },
        {
          id: "cop7",
          surface: "ϣⲁϫⲉ",
          normalized: "ϣⲁϫⲉ",
          lemma: "ϣⲁϫⲉ",
          gloss: "word",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
  ],
};



export const ARAMAIC_GENESIS_1_1: TextSection = {
  id: "Arc-Gen-1-1",
  textId: "Arc-Gen-1",
  sequence: 1,
  label: "Genesis 1",
  sentences: [
    {
      id: "arc-1",
      translation: "In the beginning, God created the heavens and the earth.",
      tokens: [
        { id: "arc1", surface: "ܒܩܕܡܝܢ", normalized: "ܒܩܕܡܝܢ", lemma: "ܩܕܡܝ", gloss: "in the beginning", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "arc2", surface: "ܒܪܐ", normalized: "ܒܪܐ", lemma: "ܒܪܐ", gloss: "created", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "arc3", surface: "ܝܘܝ", normalized: "ܝܘܝ", lemma: "ܝܘܝ", gloss: "Lord", morphology: { partOfSpeech: "proper noun" }, punctBefore: "", punctAfter: " " },
        { id: "arc4", surface: "ܝܬ", normalized: "ܝܬ", lemma: "ܝܬ", gloss: "the", morphology: { partOfSpeech: "particle" }, punctBefore: "", punctAfter: " " },
        { id: "arc5", surface: "ܫܡܝܐ", normalized: "ܫܡܝܐ", lemma: "ܫܡܝܐ", gloss: "heavens", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "arc6", surface: "ܘܝܬ", normalized: "ܘܝܬ", lemma: "ܘܝܬ", gloss: "and the", morphology: { partOfSpeech: "particle" }, punctBefore: "", punctAfter: " " },
        { id: "arc7", surface: "ܐܪܥܐ", normalized: "ܐܪܥܐ", lemma: "ܐܪܥܐ", gloss: "earth", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const AKKADIAN_GILGAMESH_1_1: TextSection = {
  id: "Akk-Gilg-1-1",
  textId: "Akk-Gilg-1",
  sequence: 1,
  label: "Tablet I",
  sentences: [
    {
      id: "akk-1",
      translation: "He who saw the Deep, the countrys foundation",
      tokens: [
        { id: "akk1", surface: "ša", normalized: "sa", lemma: "ša", gloss: "He who", morphology: { partOfSpeech: "pronoun" }, punctBefore: "", punctAfter: " " },
        { id: "akk2", surface: "nagba", normalized: "nagba", lemma: "nagbu", gloss: "the Deep", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "akk3", surface: "īmuru", normalized: "imuru", lemma: "amāru", gloss: "saw", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "akk4", surface: "išdi", normalized: "isdi", lemma: "išdu", gloss: "foundation", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "akk5", surface: "māti", normalized: "mati", lemma: "mātu", gloss: "of the land", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const SANSKRIT_GITA_1_1: TextSection = {
  id: "San-Gita-1-1",
  textId: "San-Gita-1",
  sequence: 1,
  label: "Chapter 1",
  sentences: [
    {
      id: "san-1",
      translation: "Dhritarashtra said: O Sanjaya, what did my sons and the sons of Pandu do, when they gathered on the sacred field of Kurukshetra, eager for battle?",
      tokens: [
        { id: "san1", surface: "धृतराष्ट्र", normalized: "dhritarashtra", lemma: "dhṛtarāṣṭra", gloss: "Dhritarashtra", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "san2", surface: "उवाच", normalized: "uvaca", lemma: "vac", gloss: "said", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "san3", surface: "धर्मक्षेत्रे", normalized: "dharmakshetre", lemma: "dharmakṣetra", gloss: "in the sacred field", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "san4", surface: "कुरुक्षेत्रे", normalized: "kurukshetre", lemma: "kurukṣetra", gloss: "in Kurukshetra", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "san5", surface: "समवेता", normalized: "samaveta", lemma: "samaveta", gloss: "assembled", morphology: { partOfSpeech: "adjective" }, punctBefore: "", punctAfter: " " },
        { id: "san6", surface: "युयुत्सवः", normalized: "yuyutsavah", lemma: "yuyutsu", gloss: "eager for battle", morphology: { partOfSpeech: "adjective" }, punctBefore: "", punctAfter: " " },
        { id: "san7", surface: "मामकाः", normalized: "mamakah", lemma: "māmaka", gloss: "my people", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "san8", surface: "पाण्डवाः", normalized: "pandavah", lemma: "pāṇḍava", gloss: "sons of Pandu", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "san9", surface: "च", normalized: "ca", lemma: "ca", gloss: "and", morphology: { partOfSpeech: "conjunction" }, punctBefore: "", punctAfter: " " },
        { id: "san10", surface: "एव", normalized: "eva", lemma: "eva", gloss: "indeed", morphology: { partOfSpeech: "particle" }, punctBefore: "", punctAfter: " " },
        { id: "san11", surface: "किम्", normalized: "kim", lemma: "kim", gloss: "what", morphology: { partOfSpeech: "pronoun" }, punctBefore: "", punctAfter: " " },
        { id: "san12", surface: "अकुर्वत", normalized: "akurvata", lemma: "kṛ", gloss: "did they do", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "san13", surface: "सञ्जय", normalized: "sanjaya", lemma: "sañjaya", gloss: "O Sanjaya", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " || " }
      ]
    }
  ]
};

export const HITTITE_ANNALS_1_1: TextSection = {
  id: "Hit-Annals-1-1",
  textId: "Hit-Annals-1",
  sequence: 1,
  label: "Year 1",
  sentences: [
    {
      id: "hit-1",
      translation: "Thus speaks My Sun, Mursili, the Great King, King of Hatti, Hero.",
      tokens: [
        { id: "hit1", surface: "UM", normalized: "UM", lemma: "umma", gloss: "thus", morphology: { partOfSpeech: "particle" }, transliteration: "UM", punctBefore: "", punctAfter: "-" },
        { id: "hit2", surface: "MA", normalized: "MA", lemma: "umma", gloss: "thus", morphology: { partOfSpeech: "particle" }, transliteration: "MA", punctBefore: "", punctAfter: " " },
        { id: "hit3", surface: "dUTU", normalized: "UTU", lemma: "UTU", gloss: "Sun-god", morphology: { partOfSpeech: "noun" }, transliteration: "dUTU", punctBefore: "", punctAfter: "-" },
        { id: "hit4", surface: "ŠI", normalized: "SI", lemma: "ŠI", gloss: "my", morphology: { partOfSpeech: "pronoun" }, transliteration: "ŠI", punctBefore: "", punctAfter: " " },
        { id: "hit5", surface: "m", normalized: "m", lemma: "mursili", gloss: "Mursili", morphology: { partOfSpeech: "proper_noun" }, transliteration: "m", punctBefore: "", punctAfter: "-" },
        { id: "hit6", surface: "Mur-ši-li", normalized: "mursili", lemma: "mursili", gloss: "Mursili", morphology: { partOfSpeech: "proper_noun" }, transliteration: "Mur-ši-li", punctBefore: "", punctAfter: " " },
        { id: "hit7", surface: "LUGAL", normalized: "LUGAL", lemma: "LUGAL", gloss: "king", morphology: { partOfSpeech: "noun" }, transliteration: "LUGAL", punctBefore: "", punctAfter: " " },
        { id: "hit8", surface: "GAL", normalized: "GAL", lemma: "GAL", gloss: "great", morphology: { partOfSpeech: "adjective" }, transliteration: "GAL", punctBefore: "", punctAfter: " " }
      ]
    }
  ]
};

export const EGYPTIAN_PTAHHOTEP_1_1: TextSection = {
  id: "Egy-Ptah-1-1",
  textId: "Egy-Ptah-1",
  sequence: 1,
  label: "Maxim 1",
  sentences: [
    {
      id: "egy-1",
      translation: "The voice of peace, the speech of contentment. Beginning of the maxims of good speech.",
      tokens: [
        { id: "e1", surface: "𓐍𓂤𓅱", normalized: "ḫrw", lemma: "ḫrw", gloss: "voice, speech", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "e2", surface: "𓈖", normalized: "n", lemma: "n", gloss: "of, for", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "e3", surface: "𓊵𓏏𓊪𓅆", normalized: "ḥtp", lemma: "ḥtp", gloss: "peace, offering, contentment", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

// ── Syriac — John 1:2–7 (Peshitta) ──────────────────────────────────────
export const SYRIAC_JOHN_1_2: TextSection = {
  id: "Syr-Jn-1-2",
  textId: "Syr-Jn-1",
  sequence: 2,
  label: "John 1:2–5",
  sentences: [
    {
      id: "syr-2",
      translation: "This one was in the beginning with God.",
      tokens: [
        { id: "syr2a", surface: "ܗܢܐ", normalized: "ܗܢܐ", lemma: "ܗܢܐ", gloss: "this one", morphology: { partOfSpeech: "pronoun" }, punctBefore: "", punctAfter: " " },
        { id: "syr2b", surface: "ܐܝܬܘܗܝ", normalized: "ܐܝܬܘܗܝ", lemma: "ܐܝܬ", gloss: "was", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr2c", surface: "ܗܘܐ", normalized: "ܗܘܐ", lemma: "ܗܘܐ", gloss: "he was", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr2d", surface: "ܒܪܝܫܝܬ", normalized: "ܒܪܝܫܝܬ", lemma: "ܪܝܫܝܬ", gloss: "in the beginning", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr2e", surface: "ܠܘܬ", normalized: "ܠܘܬ", lemma: "ܠܘܬ", gloss: "with", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "syr2f", surface: "ܐܠܗܐ", normalized: "ܐܠܗܐ", lemma: "ܐܠܗ", gloss: "God", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "syr-3",
      translation: "All things were made by him, and without him nothing was made that was made.",
      tokens: [
        { id: "syr3a", surface: "ܟܠ", normalized: "ܟܠ", lemma: "ܟܠ", gloss: "all", morphology: { partOfSpeech: "adjective" }, punctBefore: "", punctAfter: " " },
        { id: "syr3b", surface: "ܡܕܡ", normalized: "ܡܕܡ", lemma: "ܡܕܡ", gloss: "thing", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr3c", surface: "ܒܐܝܕܗ", normalized: "ܒܐܝܕܗ", lemma: "ܐܝܕ", gloss: "by his hand", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr3d", surface: "ܗܘܐ", normalized: "ܗܘܐ", lemma: "ܗܘܐ", gloss: "was made", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr3e", surface: "ܘܒܠܥܕܘܗܝ", normalized: "ܘܒܠܥܕܘܗܝ", lemma: "ܒܠܥܕ", gloss: "and without him", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "syr3f", surface: "ܐܦܠܐ", normalized: "ܐܦܠܐ", lemma: "ܐܦܠܐ", gloss: "not even", morphology: { partOfSpeech: "particle" }, punctBefore: "", punctAfter: " " },
        { id: "syr3g", surface: "ܚܕ", normalized: "ܚܕ", lemma: "ܚܕ", gloss: "one", morphology: { partOfSpeech: "numeral" }, punctBefore: "", punctAfter: " " },
        { id: "syr3h", surface: "ܡܕܡ", normalized: "ܡܕܡ", lemma: "ܡܕܡ", gloss: "thing", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr3i", surface: "ܗܘܐ", normalized: "ܗܘܐ", lemma: "ܗܘܐ", gloss: "was made", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "syr-4",
      translation: "In him was life, and the life was the light of men.",
      tokens: [
        { id: "syr4a", surface: "ܒܗ", normalized: "ܒܗ", lemma: "ܒ", gloss: "in him", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "syr4b", surface: "ܚܝܐ", normalized: "ܚܝܐ", lemma: "ܚܝܐ", gloss: "life", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr4c", surface: "ܗܘܐ", normalized: "ܗܘܐ", lemma: "ܗܘܐ", gloss: "was", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr4d", surface: "ܘܚܝܐ", normalized: "ܘܚܝܐ", lemma: "ܚܝܐ", gloss: "and the life", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr4e", surface: "ܗܘܘ", normalized: "ܗܘܘ", lemma: "ܗܘܐ", gloss: "were", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr4f", surface: "ܢܘܗܪܐ", normalized: "ܢܘܗܪܐ", lemma: "ܢܘܗܪ", gloss: "light", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr4g", surface: "ܕܒܢܝ", normalized: "ܕܒܢܝ", lemma: "ܒܪ", gloss: "of the sons of", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr4h", surface: "ܐܢܫܐ", normalized: "ܐܢܫܐ", lemma: "ܐܢܫ", gloss: "men", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "syr-5",
      translation: "And the light shines in the darkness, and the darkness did not overcome it.",
      tokens: [
        { id: "syr5a", surface: "ܘܢܘܗܪܐ", normalized: "ܘܢܘܗܪܐ", lemma: "ܢܘܗܪ", gloss: "and the light", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr5b", surface: "ܒܚܫܘܟܐ", normalized: "ܒܚܫܘܟܐ", lemma: "ܚܫܘܟ", gloss: "in the darkness", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr5c", surface: "ܡܢܗܪ", normalized: "ܡܢܗܪ", lemma: "ܢܗܪ", gloss: "shines", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr5d", surface: "ܘܚܫܘܟܐ", normalized: "ܘܚܫܘܟܐ", lemma: "ܚܫܘܟ", gloss: "and the darkness", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr5e", surface: "ܠܐ", normalized: "ܠܐ", lemma: "ܠܐ", gloss: "not", morphology: { partOfSpeech: "particle" }, punctBefore: "", punctAfter: " " },
        { id: "syr5f", surface: "ܐܕܪܟܗ", normalized: "ܐܕܪܟܗ", lemma: "ܐܕܪܟ", gloss: "overcame it", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const SYRIAC_JOHN_1_3: TextSection = {
  id: "Syr-Jn-1-3",
  textId: "Syr-Jn-1",
  sequence: 3,
  label: "John 1:6–14",
  sentences: [
    {
      id: "syr-6",
      translation: "There was a man sent from God, whose name was John.",
      tokens: [
        { id: "syr6a", surface: "ܗܘܐ", normalized: "ܗܘܐ", lemma: "ܗܘܐ", gloss: "there was", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr6b", surface: "ܓܒܪܐ", normalized: "ܓܒܪܐ", lemma: "ܓܒܪ", gloss: "a man", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr6c", surface: "ܕܫܠܝܚ", normalized: "ܕܫܠܝܚ", lemma: "ܫܠܚ", gloss: "who was sent", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr6d", surface: "ܡܢ", normalized: "ܡܢ", lemma: "ܡܢ", gloss: "from", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "syr6e", surface: "ܐܠܗܐ", normalized: "ܐܠܗܐ", lemma: "ܐܠܗ", gloss: "God", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr6f", surface: "ܘܫܡܗ", normalized: "ܘܫܡܗ", lemma: "ܫܡ", gloss: "and his name", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr6g", surface: "ܝܘܚܢܢ", normalized: "ܝܘܚܢܢ", lemma: "ܝܘܚܢܢ", gloss: "John", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "syr-7",
      translation: "This one came as a witness, to testify about the light, so that all might believe through him.",
      tokens: [
        { id: "syr7a", surface: "ܗܢܐ", normalized: "ܗܢܐ", lemma: "ܗܢܐ", gloss: "this one", morphology: { partOfSpeech: "pronoun" }, punctBefore: "", punctAfter: " " },
        { id: "syr7b", surface: "ܐܬܐ", normalized: "ܐܬܐ", lemma: "ܐܬܐ", gloss: "came", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr7c", surface: "ܠܣܗܕܘܬܐ", normalized: "ܠܣܗܕܘܬܐ", lemma: "ܣܗܕܘܬ", gloss: "for a testimony", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr7d", surface: "ܕܢܣܗܕ", normalized: "ܕܢܣܗܕ", lemma: "ܣܗܕ", gloss: "that he might testify", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr7e", surface: "ܥܠ", normalized: "ܥܠ", lemma: "ܥܠ", gloss: "about", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "syr7f", surface: "ܢܘܗܪܐ", normalized: "ܢܘܗܪܐ", lemma: "ܢܘܗܪ", gloss: "the light", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr7g", surface: "ܕܟܠܢܫ", normalized: "ܕܟܠܢܫ", lemma: "ܟܠ", gloss: "so that all", morphology: { partOfSpeech: "pronoun" }, punctBefore: "", punctAfter: " " },
        { id: "syr7h", surface: "ܢܗܝܡܢ", normalized: "ܢܗܝܡܢ", lemma: "ܗܝܡܢ", gloss: "might believe", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr7i", surface: "ܒܐܝܕܗ", normalized: "ܒܐܝܕܗ", lemma: "ܒ", gloss: "through him", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "syr-14",
      translation: "And the Word became flesh and dwelt among us.",
      tokens: [
        { id: "syr14a", surface: "ܘܡܠܬܐ", normalized: "ܘܡܠܬܐ", lemma: "ܡܠܬ", gloss: "and the Word", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr14b", surface: "ܒܣܪܐ", normalized: "ܒܣܪܐ", lemma: "ܒܣܪ", gloss: "flesh", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: " " },
        { id: "syr14c", surface: "ܗܘܬ", normalized: "ܗܘܬ", lemma: "ܗܘܐ", gloss: "became", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr14d", surface: "ܘܥܡܪ", normalized: "ܘܥܡܪ", lemma: "ܥܡܪ", gloss: "and dwelt", morphology: { partOfSpeech: "verb" }, punctBefore: "", punctAfter: " " },
        { id: "syr14e", surface: "ܒܝܢܬܢ", normalized: "ܒܝܢܬܢ", lemma: "ܒܝܢܬ", gloss: "among us", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

// ── Akkadian — Gilgamesh Tablet I, more lines ──────────────────────────────
export const AKKADIAN_GILGAMESH_1_2: TextSection = {
  id: "Akk-Gilg-1-2",
  textId: "Akk-Gilg-1",
  sequence: 2,
  label: "Tablet I: Prologue (lines 2–10)",
  sentences: [
    {
      id: "akk-2",
      translation: "Knower of all things, he attained wisdom in everything.",
      tokens: [
        { id: "akk2a", surface: "mūdû", normalized: "mudu", lemma: "mūdû", gloss: "knower", morphology: { partOfSpeech: "noun" }, transliteration: "mu-du-u", punctBefore: "", punctAfter: " " },
        { id: "akk2b", surface: "kalāma", normalized: "kalama", lemma: "kalāma", gloss: "of all things", morphology: { partOfSpeech: "adverb" }, transliteration: "ka-la-ma", punctBefore: "", punctAfter: " " },
        { id: "akk2c", surface: "iḫūzu", normalized: "ihuzu", lemma: "aḫāzu", gloss: "he grasped", morphology: { partOfSpeech: "verb" }, transliteration: "i-ḫu-zu", punctBefore: "", punctAfter: " " },
        { id: "akk2d", surface: "nēmeqi", normalized: "nemeqi", lemma: "nēmequ", gloss: "wisdom", morphology: { partOfSpeech: "noun" }, transliteration: "ne-me-qi", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "akk-3",
      translation: "He saw the secret, he discovered the hidden.",
      tokens: [
        { id: "akk3a", surface: "arkânu", normalized: "arkanu", lemma: "arkānu", gloss: "the secret", morphology: { partOfSpeech: "noun" }, transliteration: "ar-ka-nu", punctBefore: "", punctAfter: " " },
        { id: "akk3b", surface: "imḫur", normalized: "imhur", lemma: "maḫāru", gloss: "he received/saw", morphology: { partOfSpeech: "verb" }, transliteration: "im-ḫur", punctBefore: "", punctAfter: " " },
        { id: "akk3c", surface: "niṣirtu", normalized: "nisirtu", lemma: "niṣirtu", gloss: "the hidden thing", morphology: { partOfSpeech: "noun" }, transliteration: "ni-ṣir-tu", punctBefore: "", punctAfter: " " },
        { id: "akk3d", surface: "ipte", normalized: "ipte", lemma: "petû", gloss: "he discovered/opened", morphology: { partOfSpeech: "verb" }, transliteration: "ip-te", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "akk-4",
      translation: "He brought tidings of a time before the Flood.",
      tokens: [
        { id: "akk4a", surface: "ūbilam", normalized: "ubilam", lemma: "wabālu", gloss: "he brought", morphology: { partOfSpeech: "verb" }, transliteration: "u-bi-lam", punctBefore: "", punctAfter: " " },
        { id: "akk4b", surface: "tēmu", normalized: "temu", lemma: "ṭēmu", gloss: "tidings, word", morphology: { partOfSpeech: "noun" }, transliteration: "te-e-mu", punctBefore: "", punctAfter: " " },
        { id: "akk4c", surface: "ša", normalized: "sa", lemma: "ša", gloss: "of, who", morphology: { partOfSpeech: "pronoun" }, transliteration: "ša", punctBefore: "", punctAfter: " " },
        { id: "akk4d", surface: "lāmi", normalized: "lami", lemma: "lāmu", gloss: "before", morphology: { partOfSpeech: "prep" }, transliteration: "la-mi", punctBefore: "", punctAfter: " " },
        { id: "akk4e", surface: "abūbi", normalized: "abubi", lemma: "abūbu", gloss: "the Flood", morphology: { partOfSpeech: "noun" }, transliteration: "a-bu-bi", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "akk-5",
      translation: "He went on a distant journey, pushing himself to exhaustion.",
      tokens: [
        { id: "akk5a", surface: "šarraqtu", normalized: "sarraqtu", lemma: "šarraqtu", gloss: "distant journey", morphology: { partOfSpeech: "noun" }, transliteration: "šar-raq-tu", punctBefore: "", punctAfter: " " },
        { id: "akk5b", surface: "urâd", normalized: "urad", lemma: "arādu", gloss: "he went down", morphology: { partOfSpeech: "verb" }, transliteration: "u-ra-ad", punctBefore: "", punctAfter: " " },
        { id: "akk5c", surface: "ana", normalized: "ana", lemma: "ana", gloss: "to", morphology: { partOfSpeech: "prep" }, transliteration: "a-na", punctBefore: "", punctAfter: " " },
        { id: "akk5d", surface: "libbi", normalized: "libbi", lemma: "libbu", gloss: "heart, midst", morphology: { partOfSpeech: "noun" }, transliteration: "lib-bi", punctBefore: "", punctAfter: " " },
        { id: "akk5e", surface: "mati", normalized: "mati", lemma: "mātu", gloss: "the land", morphology: { partOfSpeech: "noun" }, transliteration: "ma-ti", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const AKKADIAN_GILGAMESH_1_3: TextSection = {
  id: "Akk-Gilg-1-3",
  textId: "Akk-Gilg-1",
  sequence: 3,
  label: "Tablet I: Gilgamesh Described (lines 11–25)",
  sentences: [
    {
      id: "akk-6",
      translation: "He built the walls of Uruk-the-Sheepfold.",
      tokens: [
        { id: "akk6a", surface: "Gilgameš", normalized: "gilgames", lemma: "Gilgameš", gloss: "Gilgamesh", morphology: { partOfSpeech: "proper_noun" }, transliteration: "dGIŠ", punctBefore: "", punctAfter: " " },
        { id: "akk6b", surface: "šar", normalized: "sar", lemma: "šarru", gloss: "king", morphology: { partOfSpeech: "noun" }, transliteration: "LUGAL", punctBefore: "", punctAfter: " " },
        { id: "akk6c", surface: "Uruk", normalized: "uruk", lemma: "Uruk", gloss: "Uruk", morphology: { partOfSpeech: "proper_noun" }, transliteration: "UNUG", punctBefore: "", punctAfter: " " },
        { id: "akk6d", surface: "ša", normalized: "sa", lemma: "ša", gloss: "of", morphology: { partOfSpeech: "pronoun" }, transliteration: "ša", punctBefore: "", punctAfter: " " },
        { id: "akk6e", surface: "supūri", normalized: "supuri", lemma: "supūru", gloss: "the sheepfold", morphology: { partOfSpeech: "noun" }, transliteration: "su-pu-ri", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "akk-7",
      translation: "Two-thirds of him is god, one third of him is human.",
      tokens: [
        { id: "akk7a", surface: "šittašu", normalized: "sittasu", lemma: "šittū", gloss: "two-thirds of him", morphology: { partOfSpeech: "noun" }, transliteration: "ši-ta-šu", punctBefore: "", punctAfter: " " },
        { id: "akk7b", surface: "ilūtu", normalized: "ilutu", lemma: "ilūtu", gloss: "divinity, godhood", morphology: { partOfSpeech: "noun" }, transliteration: "DINGIR-tu", punctBefore: "", punctAfter: " " },
        { id: "akk7c", surface: "šalultu", normalized: "salultu", lemma: "šalultu", gloss: "one-third", morphology: { partOfSpeech: "noun" }, transliteration: "šal-ul-tu", punctBefore: "", punctAfter: " " },
        { id: "akk7d", surface: "amēlūtu", normalized: "amelutu", lemma: "amēlūtu", gloss: "humanity", morphology: { partOfSpeech: "noun" }, transliteration: "LU₂-u₂-tu₂", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "akk-8",
      translation: "The form of his body was surpassing.",
      tokens: [
        { id: "akk8a", surface: "kūṣurat", normalized: "kusurat", lemma: "kūṣurtu", gloss: "form, shape", morphology: { partOfSpeech: "noun" }, transliteration: "ku-ṣu-rat", punctBefore: "", punctAfter: " " },
        { id: "akk8b", surface: "zīmīšu", normalized: "zimisu", lemma: "zīmu", gloss: "his features, appearance", morphology: { partOfSpeech: "noun" }, transliteration: "zi-mi-šu", punctBefore: "", punctAfter: " " },
        { id: "akk8c", surface: "ūtir", normalized: "utir", lemma: "atāru", gloss: "exceeded, surpassed", morphology: { partOfSpeech: "verb" }, transliteration: "u-tir", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

// ── Hittite — Mursili II Annals, more sections ────────────────────────────
export const HITTITE_ANNALS_1_2: TextSection = {
  id: "Hit-Annals-1-2",
  textId: "Hit-Annals-1",
  sequence: 2,
  label: "Year 1: Campaign against Arzawa",
  sentences: [
    {
      id: "hit-2",
      translation: "Because Arzawa had become hostile to My Sun.",
      tokens: [
        { id: "hit2a", surface: "mahhan", normalized: "mahhan", lemma: "mahhan", gloss: "because, when", morphology: { partOfSpeech: "conjunction" }, transliteration: "mah-ha-an", punctBefore: "", punctAfter: " " },
        { id: "hit2b", surface: "KUR", normalized: "kur", lemma: "KUR", gloss: "land", morphology: { partOfSpeech: "noun" }, transliteration: "KUR", punctBefore: "", punctAfter: " " },
        { id: "hit2c", surface: "Arzawa", normalized: "arzawa", lemma: "arzawa", gloss: "Arzawa", morphology: { partOfSpeech: "proper_noun" }, transliteration: "ar-za-wa", punctBefore: "", punctAfter: " " },
        { id: "hit2d", surface: "anda", normalized: "anda", lemma: "anda", gloss: "toward, inside", morphology: { partOfSpeech: "adverb" }, transliteration: "an-da", punctBefore: "", punctAfter: " " },
        { id: "hit2e", surface: "LUGAL-i", normalized: "lugali", lemma: "LUGAL", gloss: "the king", morphology: { partOfSpeech: "noun" }, transliteration: "LUGAL-i", punctBefore: "", punctAfter: " " },
        { id: "hit2f", surface: "hurkantahta", normalized: "hurkantahta", lemma: "hurk-", gloss: "had become hostile", morphology: { partOfSpeech: "verb" }, transliteration: "ḫur-kán-ta-aḫ-ta", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "hit-3",
      translation: "The Sun-god, my lord, went before me in battle.",
      tokens: [
        { id: "hit3a", surface: "dUTU", normalized: "dUTU", lemma: "UTU", gloss: "Sun-god", morphology: { partOfSpeech: "noun" }, transliteration: "dUTU", punctBefore: "", punctAfter: " " },
        { id: "hit3b", surface: "EN-YA", normalized: "enya", lemma: "EN", gloss: "my lord", morphology: { partOfSpeech: "noun" }, transliteration: "EN-YA", punctBefore: "", punctAfter: " " },
        { id: "hit3c", surface: "arḫa", normalized: "arha", lemma: "arḫa", gloss: "away, before", morphology: { partOfSpeech: "adverb" }, transliteration: "ar-ḫa", punctBefore: "", punctAfter: " " },
        { id: "hit3d", surface: "pait", normalized: "pait", lemma: "paizzi", gloss: "went", morphology: { partOfSpeech: "verb" }, transliteration: "pa-it", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "hit-4",
      translation: "I struck the land of Arzawa and defeated it.",
      tokens: [
        { id: "hit4a", surface: "KUR", normalized: "kur", lemma: "KUR", gloss: "land", morphology: { partOfSpeech: "noun" }, transliteration: "KUR", punctBefore: "", punctAfter: " " },
        { id: "hit4b", surface: "Arzawa", normalized: "arzawa", lemma: "arzawa", gloss: "Arzawa", morphology: { partOfSpeech: "proper_noun" }, transliteration: "ar-za-wa", punctBefore: "", punctAfter: " " },
        { id: "hit4c", surface: "dāhhun", normalized: "dahhun", lemma: "dā-", gloss: "I struck, took", morphology: { partOfSpeech: "verb" }, transliteration: "DINGIR.MEŠ-un", punctBefore: "", punctAfter: " " },
        { id: "hit4d", surface: "nu", normalized: "nu", lemma: "nu", gloss: "and, then", morphology: { partOfSpeech: "conjunction" }, transliteration: "nu", punctBefore: "", punctAfter: " " },
        { id: "hit4e", surface: "GUL-ahhi", normalized: "gulahhi", lemma: "GUL-", gloss: "I destroyed/defeated", morphology: { partOfSpeech: "verb" }, transliteration: "GUL-aḫ-ḫi", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const HITTITE_ANNALS_1_3: TextSection = {
  id: "Hit-Annals-1-3",
  textId: "Hit-Annals-1",
  sequence: 3,
  label: "Years 2–5: Campaigns and victories",
  sentences: [
    {
      id: "hit-5",
      translation: "In my second year I went to the land of Tipiya.",
      tokens: [
        { id: "hit5a", surface: "EGIR-an", normalized: "egiran", lemma: "EGIR-an", gloss: "afterward, then", morphology: { partOfSpeech: "adverb" }, transliteration: "EGIR-an", punctBefore: "", punctAfter: " " },
        { id: "hit5b", surface: "2", normalized: "2", lemma: "2", gloss: "second", morphology: { partOfSpeech: "numeral" }, transliteration: "2", punctBefore: "", punctAfter: "-" },
        { id: "hit5c", surface: "anni", normalized: "anni", lemma: "anni-", gloss: "year", morphology: { partOfSpeech: "noun" }, transliteration: "an-ni", punctBefore: "", punctAfter: " " },
        { id: "hit5d", surface: "KUR", normalized: "kur", lemma: "KUR", gloss: "land", morphology: { partOfSpeech: "noun" }, transliteration: "KUR", punctBefore: "", punctAfter: " " },
        { id: "hit5e", surface: "Tipiyaš", normalized: "tipiyas", lemma: "Tipiya", gloss: "Tipiya", morphology: { partOfSpeech: "proper_noun" }, transliteration: "ti-pi-ya-aš", punctBefore: "", punctAfter: " " },
        { id: "hit5f", surface: "pānni", normalized: "panni", lemma: "piyanni-", gloss: "I went against", morphology: { partOfSpeech: "verb" }, transliteration: "pá-an-ni", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "hit-6",
      translation: "I, My Sun, plundered many prisoners and cattle.",
      tokens: [
        { id: "hit6a", surface: "ARAD.MEŠ", normalized: "aradmes", lemma: "ARAD", gloss: "prisoners/servants", morphology: { partOfSpeech: "noun" }, transliteration: "ARAD.MEŠ", punctBefore: "", punctAfter: " " },
        { id: "hit6b", surface: "GUD.HI.A", normalized: "gudhia", lemma: "GUD", gloss: "cattle", morphology: { partOfSpeech: "noun" }, transliteration: "GUD.HI.A", punctBefore: "", punctAfter: " " },
        { id: "hit6c", surface: "UDU.HI.A", normalized: "uduhia", lemma: "UDU", gloss: "sheep", morphology: { partOfSpeech: "noun" }, transliteration: "UDU.HI.A", punctBefore: "", punctAfter: " " },
        { id: "hit6d", surface: "mekki", normalized: "mekki", lemma: "mekki-", gloss: "many, much", morphology: { partOfSpeech: "adjective" }, transliteration: "me-ek-ki", punctBefore: "", punctAfter: " " },
        { id: "hit6e", surface: "ḫarnikun", normalized: "harnikun", lemma: "ḫarnik-", gloss: "I destroyed, took as plunder", morphology: { partOfSpeech: "verb" }, transliteration: "ḫar-ni-ku-un", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

// ── Ugaritic — Baal Cycle (KTU 1.2–1.4) ──────────────────────────────────
export const UGARITIC_BAAL_1_1: TextSection = {
  id: "Uga-Baal-1-1",
  textId: "Uga-Baal-1",
  sequence: 1,
  label: "Baal's Victory over Yamm (KTU 1.2.iv)",
  sentences: [
    {
      id: "uga-1",
      translation: "Baal is declared king! Let Baal reign!",
      tokens: [
        { id: "uga1a", surface: "𐎊𐎎𐎍𐎋", normalized: "ymlk", lemma: "mlk", gloss: "let him reign / will reign", morphology: { partOfSpeech: "verb" }, transliteration: "ymlk", punctBefore: "", punctAfter: " " },
        { id: "uga1b", surface: "𐎁𐎓𐎍", normalized: "b'l", lemma: "b'l", gloss: "Baal", morphology: { partOfSpeech: "proper_noun" }, transliteration: "b'l", punctBefore: "", punctAfter: "!" }
      ]
    },
    {
      id: "uga-2",
      translation: "Baal smote Prince Yamm, he finished Judge River.",
      tokens: [
        { id: "uga2a", surface: "𐎎𐎃𐎕", normalized: "mḫṣ", lemma: "mḫṣ", gloss: "struck, smote", morphology: { partOfSpeech: "verb" }, transliteration: "mḫṣ", punctBefore: "", punctAfter: " " },
        { id: "uga2b", surface: "𐎁𐎓𐎍", normalized: "b'l", lemma: "b'l", gloss: "Baal", morphology: { partOfSpeech: "proper_noun" }, transliteration: "b'l", punctBefore: "", punctAfter: " " },
        { id: "uga2c", surface: "𐎄𐎁𐎀𐎍", normalized: "db'l", lemma: "db'l", gloss: "he vanquished", morphology: { partOfSpeech: "verb" }, transliteration: "ymhs", punctBefore: "", punctAfter: " " },
        { id: "uga2d", surface: "𐎇𐎁𐎍", normalized: "zbl", lemma: "zbl", gloss: "Prince", morphology: { partOfSpeech: "noun" }, transliteration: "zbl", punctBefore: "", punctAfter: " " },
        { id: "uga2e", surface: "𐎊𐎎", normalized: "ym", lemma: "ym", gloss: "Yamm, Sea", morphology: { partOfSpeech: "proper_noun" }, transliteration: "ym", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "uga-3",
      translation: "Truly Baal is our king, truly he rules over us.",
      tokens: [
        { id: "uga3a", surface: "𐎀𐎍𐎛𐎊𐎐", normalized: "aliyn", lemma: "aliyn", gloss: "mighty, Aliyan", morphology: { partOfSpeech: "adjective" }, transliteration: "'aliyn", punctBefore: "", punctAfter: " " },
        { id: "uga3b", surface: "𐎁𐎓𐎍", normalized: "b'l", lemma: "b'l", gloss: "Baal", morphology: { partOfSpeech: "proper_noun" }, transliteration: "b'l", punctBefore: "", punctAfter: " " },
        { id: "uga3c", surface: "𐎎𐎍𐎋𐎐", normalized: "mlkn", lemma: "mlk", gloss: "our king", morphology: { partOfSpeech: "noun" }, transliteration: "mlkn", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

export const UGARITIC_BAAL_1_2: TextSection = {
  id: "Uga-Baal-1-2",
  textId: "Uga-Baal-1",
  sequence: 2,
  label: "El and Asherah (KTU 1.4.i–ii)",
  sentences: [
    {
      id: "uga-4",
      translation: "El, the Father of years, replied.",
      tokens: [
        { id: "uga4a", surface: "𐎀𐎍", normalized: "il", lemma: "il", gloss: "El, God", morphology: { partOfSpeech: "proper_noun" }, transliteration: "il", punctBefore: "", punctAfter: " " },
        { id: "uga4b", surface: "𐎃𐎋𐎎", normalized: "ḫkm", lemma: "ḫkm", gloss: "wise, discerning", morphology: { partOfSpeech: "adjective" }, transliteration: "ḫkm", punctBefore: "", punctAfter: " " },
        { id: "uga4c", surface: "𐎛𐎁", normalized: "'ab", lemma: "'ab", gloss: "father", morphology: { partOfSpeech: "noun" }, transliteration: "'ab", punctBefore: "", punctAfter: " " },
        { id: "uga4d", surface: "𐎌𐎐𐎎", normalized: "šnm", lemma: "šnt", gloss: "of years", morphology: { partOfSpeech: "noun" }, transliteration: "šnm", punctBefore: "", punctAfter: " " },
        { id: "uga4e", surface: "𐎊𐎓𐎐", normalized: "y'n", lemma: "y'n", gloss: "replied, answered", morphology: { partOfSpeech: "verb" }, transliteration: "y'n", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "uga-5",
      translation: "The voice of El sounded like the seas.",
      tokens: [
        { id: "uga5a", surface: "𐎖𐎍", normalized: "ql", lemma: "ql", gloss: "voice, sound", morphology: { partOfSpeech: "noun" }, transliteration: "ql", punctBefore: "", punctAfter: " " },
        { id: "uga5b", surface: "𐎀𐎍", normalized: "il", lemma: "il", gloss: "El", morphology: { partOfSpeech: "proper_noun" }, transliteration: "il", punctBefore: "", punctAfter: " " },
        { id: "uga5c", surface: "𐎁𐎌𐎙𐎓𐎂", normalized: "btš'", lemma: "btš'", gloss: "like seven", morphology: { partOfSpeech: "numeral" }, transliteration: "b.šb'", punctBefore: "", punctAfter: " " },
        { id: "uga5d", surface: "𐎊𐎎𐎎", normalized: "ymm", lemma: "ym", gloss: "seas", morphology: { partOfSpeech: "noun" }, transliteration: "ymm", punctBefore: "", punctAfter: "." }
      ]
    },
    {
      id: "uga-6",
      translation: "Asherah, Lady of the Sea, took to her feet.",
      tokens: [
        { id: "uga6a", surface: "𐎀𐎘𐎗𐎚", normalized: "atrt", lemma: "atrt", gloss: "Asherah", morphology: { partOfSpeech: "proper_noun" }, transliteration: "atrt", punctBefore: "", punctAfter: " " },
        { id: "uga6b", surface: "𐎔𐎗𐎎", normalized: "prm", lemma: "prm", gloss: "Lady (mistress)", morphology: { partOfSpeech: "noun" }, transliteration: "rbt", punctBefore: "", punctAfter: " " },
        { id: "uga6c", surface: "𐎊𐎎", normalized: "ym", lemma: "ym", gloss: "Sea, Yamm", morphology: { partOfSpeech: "noun" }, transliteration: "ym", punctBefore: "", punctAfter: " " },
        { id: "uga6d", surface: "𐎖𐎍𐎚𐎐", normalized: "qltn", lemma: "qlt", gloss: "took/went quickly", morphology: { partOfSpeech: "verb" }, transliteration: "tqlt", punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};
