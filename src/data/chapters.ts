import { Chapter } from '../types/library';
import * as tokens from './tokens';

export const getChapters = (textId: number): Chapter[] => {
  const languageMap: Record<number, { title: string, translation: string, tokens: any[] }[]> = {
    // Ancient Greek
    101: [{ title: "Greek Alphabet & Sounds", translation: "The Greek Alphabet", tokens: tokens.greekAlphabetTokens }],
    102: [{ title: "Basic Greetings & Phrasing", translation: "Basic Greek Vocabulary", tokens: tokens.greekBasicVocabTokens }],
    103: [{ title: "Aesop's Fables", translation: "A fox was hungry", tokens: tokens.aesopTokens }],
    104: [
      { title: "John 1:1 - The Word", translation: "In the beginning was the Word, and the Word was with God, and the Word was God.", tokens: tokens.greekTokens },
      { title: "John 1:2-3 - Creation", translation: "The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.", tokens: tokens.nextGreekTokens }
    ],
    105: [{ title: "Anabasis", translation: "Darius and Parysatis had two sons born to them, the elder Artaxerxes, the younger Cyrus.", tokens: tokens.anabasisTokens }],
    106: [{ title: "Iliad", translation: "Sing, O goddess, the anger of Achilles son of Peleus...", tokens: tokens.iliadTokens }],
    107: [{ title: "The Odyssey", translation: "Tell me, O muse, of that ingenious hero...", tokens: tokens.odysseyTokens }],

    // Biblical Hebrew
    201: [{ title: "The Aleph-Bet & Vowels", translation: "The Hebrew Alphabet", tokens: tokens.hebrewAlphabetTokens }],
    202: [{ title: "Basic Vocabulary", translation: "Basic Hebrew Vocabulary", tokens: tokens.hebrewBasicVocabTokens }],
    203: [{ title: "Book of Ruth", translation: "In the days when the judges ruled, there was a famine in the land...", tokens: tokens.ruthTokens }], 
    204: [
      { title: "Genesis 1:1 - Creation", translation: "In the beginning God created the heaven and the earth.", tokens: tokens.genesisTokens },
      { title: "Genesis 1:2 - Formless", translation: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.", tokens: tokens.nextHebrewTokens }
    ],
    205: [{ title: "Psalms", translation: "Blessed is the man", tokens: tokens.psalmsTokens }],
    206: [{ title: "Isaiah", translation: "The vision of Isaiah", tokens: tokens.isaiahTokens }],
    207: [{ title: "Job", translation: "There was a man", tokens: tokens.jobTokens }],

    // Egyptian
    301: [{ title: "Uniliteral Signs & Sounds", translation: "The Egyptian Alphabet", tokens: tokens.egyptianAlphabetTokens }],
    302: [{ title: "Basic Offering Formula", translation: "Basic Egyptian Vocabulary", tokens: tokens.egyptianBasicVocabTokens }],
    303: [
      { title: "Shipwrecked Sailor Part 1", translation: "The jackal is upon the hunter", tokens: tokens.egyptianTokens },
      { title: "Shipwrecked Sailor Part 2", translation: "in the field of the king making peace with the good god.", tokens: tokens.nextEgyptianTokens }
    ],
    304: [{ title: "The Tale of Sinuhe", translation: "The hereditary prince", tokens: tokens.sinuheTokens }],
    305: [{ title: "Great Hymn to the Aten", translation: "Adoration of the sun", tokens: tokens.atenHymnTokens }],
    306: [{ title: "Pyramid Texts", translation: "Words spoken", tokens: tokens.pyramidTextsTokens }],
    
    // Vedic Sanskrit
    401: [{ title: "Devanagari Script & Matras", translation: "The Sanskrit Alphabet", tokens: tokens.sanskritAlphabetTokens }],
    402: [{ title: "Hitopadesha (Selections)", translation: "Basic Sanskrit Vocabulary", tokens: tokens.sanskritBasicVocabTokens }],
    403: [
      { title: "Bhagavad Gita Part 1", translation: "I praise Agni, the high priest of the sacrifice, the divine ministrant, the invoker, the best bestower of treasure.", tokens: tokens.sanskritTokens },
      { title: "Bhagavad Gita Part 2", translation: "He goes to the forest, there he sees a deer.", tokens: tokens.nextSanskritTokens }
    ],
    404: [{ title: "Ramayana", translation: "Asceticism", tokens: tokens.ramayanaTokens }],
    405: [{ title: "Upanishads", translation: "Om", tokens: tokens.upanishadsTokens }],
    406: [{ title: "The Rigveda", translation: "Agni", tokens: tokens.rigvedaTokens }],

    // Classical Latin
    501: [{ title: "Latin Alphabet & Pronunciation", translation: "The Latin Alphabet", tokens: tokens.latinAlphabetTokens }],
    502: [{ title: "Vulgate", translation: "In the beginning God created the heavens and the earth.", tokens: tokens.latinVulgateTokens }],
    503: [{ title: "Gallic War", translation: "All Gaul is divided into three parts.", tokens: tokens.gallicWarTokens }],
    504: [{ title: "Odes", translation: "Maecenas", tokens: tokens.odesHoraceTokens }],
    505: [{ title: "Metamorphoses", translation: "Into new forms", tokens: tokens.metamorphosesTokens }],
    506: [
      { title: "Aeneid I: Arms and the Man", translation: "Arms and the man I sing, who first from the shores of Troy", tokens: tokens.latinTokens },
      { title: "Aeneid I: The Journey", translation: "exiled by fate, came to Italy and Lavinian shores", tokens: tokens.aeneidNextTokens },
      { title: "Aeneid I: Tossed on the Deep", translation: "much he was tossed both on land and on the deep, by the power of the gods, because of cruel Juno.", tokens: tokens.aeneidAdditionalTokens }
    ],
    
    // Koine Greek
    601: [{ title: "Koine Alphabet & Sounds", translation: "The Koine Greek Alphabet", tokens: tokens.koineGreekAlphabetTokens }],
    602: [{ title: "Basic Vocabulary", translation: "Basic Koine Greek Vocabulary", tokens: tokens.koineGreekBasicVocabTokens }],
    603: [{ title: "Didache", translation: "There are two ways, one of life and one of death.", tokens: tokens.didacheTokens }],
    604: [{ title: "Gospel of Mark", translation: "The beginning of the gospel of Jesus Christ, the Son of God.", tokens: tokens.markTokens }],
    605: [
      { title: "John 1:1 - The Word", translation: "In the beginning was the Word, and the Word was with God, and the Word was God.", tokens: tokens.greekTokens },
      { title: "John 1:2-3 - Creation", translation: "The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.", tokens: tokens.nextGreekTokens }
    ],
    606: [
      { title: "Epistles of Paul 1", translation: "Paul, a servant of Jesus Christ, called to be an apostle, set apart for the gospel of God", tokens: tokens.paulTokens },
      { title: "Epistles of Paul 2", translation: "First, I thank my God through Jesus Christ concerning", tokens: tokens.paulNextTokens },
      { title: "Epistles of Paul 3", translation: "For God is my witness, whom I serve in my spirit", tokens: tokens.paulAdditionalTokens }
    ],
    607: [{ title: "Revelation", translation: "The Revelation", tokens: tokens.revelationTokens }],
    
    // Aramaic
    701: [{ title: "Aramaic Alphabet", translation: "The Aramaic Alphabet", tokens: tokens.aramaicAlphabetTokens }],
    702: [{ title: "Basic Vocabulary", translation: "Basic Aramaic Vocabulary", tokens: tokens.aramaicBasicVocabTokens }],
    703: [{ title: "Elephantine Papyri", translation: "To our lord Bagoas, governor of Yehud...", tokens: tokens.elephantineTokens }],
    704: [
      { title: "Book of Daniel 2:4", translation: "Then Daniel spoke to the king", tokens: tokens.danielTokens },
      { title: "Book of Daniel 2:4b", translation: "'O king, live forever! Your kingdom is a kingdom of all ages'", tokens: tokens.danielNextTokens },
      { title: "Book of Daniel 2:4c", translation: "'and your dominion in all generations.'", tokens: tokens.danielAdditionalTokens }
    ],
    705: [{ title: "Book of Ezra", translation: "In the year", tokens: tokens.ezraTokens }],
    706: [{ title: "Targum Onqelos", translation: "In ancient times", tokens: tokens.targumTokens }],
    707: [{ title: "Genesis Apocryphon", translation: "I", tokens: tokens.genesisApocryphonTokens }],

    // Coptic
    801: [{ title: "Coptic Alphabet", translation: "The Coptic Alphabet", tokens: tokens.copticAlphabetTokens }],
    802: [{ title: "Basic Vocabulary", translation: "Basic Coptic Vocabulary", tokens: tokens.copticBasicVocabTokens }],
    803: [{ title: "Sayings of the Desert Fathers", translation: "Abba Anthony said...", tokens: tokens.desertFathersTokens }],
    804: [
      { title: "Gospel of Thomas 1", translation: "Jesus said:", tokens: tokens.thomasTokens },
      { title: "Gospel of Thomas 2", translation: "He who finds the interpretation of these words will not taste death.", tokens: tokens.thomasNextTokens },
      { title: "Gospel of Thomas 3", translation: "And he said to them, 'In that place men customarily...'", tokens: tokens.thomasAdditionalTokens }
    ],
    805: [{ title: "Sahidic New Testament", translation: "Paul", tokens: tokens.sahidicNtTokens }],
    806: [{ title: "Shenoute of Atripe", translation: "I", tokens: tokens.shenouteTokens }],
    807: [{ title: "Pistis Sophia", translation: "It happened", tokens: tokens.pistisSophiaTokens }],

    // Akkadian
    901: [{ title: "Cuneiform Signs", translation: "The Akkadian Signs", tokens: tokens.akkadianAlphabetTokens }],
    902: [{ title: "Basic Vocabulary", translation: "Basic Akkadian Vocabulary", tokens: tokens.akkadianBasicVocabTokens }],
    903: [{ title: "Amarna Letters", translation: "To the king, my lord, say:", tokens: tokens.amarnaTokens }],
    904: [{ title: "Code of Hammurabi", translation: "If a man destroys the eye of another man, they shall destroy his eye.", tokens: tokens.hammurabiTokens }],
    905: [{ title: "Enuma Elish", translation: "When on high the heavens were not named...", tokens: tokens.enumaTokens }],
    906: [
      { title: "Epic of Gilgamesh 1", translation: "He who saw the deep, the foundation of the land", tokens: tokens.gilgameshTokens },
      { title: "Epic of Gilgamesh 2", translation: "he knew everything.", tokens: tokens.gilgameshNextTokens },
      { title: "Epic of Gilgamesh 3", translation: "In the days of that god Enlil, the king of the heavens was...", tokens: tokens.gilgameshAdditionalTokens }
    ],
    907: [{ title: "Atra-Hasis", translation: "When the gods like men bore the work...", tokens: tokens.atrahasisTokens }],

    // Syriac
    1001: [{ title: "Estrangelo Alphabet", translation: "The Syriac Alphabet", tokens: tokens.syriacAlphabetTokens }],
    1002: [{ title: "Basic Vocabulary", translation: "Basic Syriac Vocabulary", tokens: tokens.syriacBasicVocabTokens }],
    1003: [
      { title: "Peshitta Gospels - John 1:1", translation: "In the beginning was the Word, and the Word was with God", tokens: tokens.peshittaTokens },
      { title: "Peshitta Gospels - John 1:2", translation: "He was from the beginning with God.", tokens: tokens.peshittaNextTokens },
      { title: "Peshitta Gospels - John 1:3", translation: "All things by his hand were made.", tokens: tokens.peshittaAdditionalTokens }
    ],
    1004: [{ title: "Odes of Solomon", translation: "As the hand of his striking upon the harp...", tokens: tokens.odesTokens }],
    1005: [{ title: "Hymns of Ephrem", translation: "Give me, my Lord, a word that I may say...", tokens: tokens.ephremTokens }],
    1006: [{ title: "Chronicle of Edessa", translation: "In the year five hundred and thirty-three...", tokens: tokens.edessaTokens }],
    1007: [{ title: "Isaac of Nineveh", translation: "Purity of heart is the mirror of the soul...", tokens: tokens.isaacTokens }],

    // Hittite
    1101: [{ title: "Cuneiform Basics", translation: "The Hittite Cuneiform", tokens: tokens.hittiteAlphabetTokens }],
    1102: [{ title: "Basic Vocabulary", translation: "Basic Hittite Vocabulary", tokens: tokens.hittiteBasicVocabTokens }],
    1103: [
      { title: "Ritual of Tunnawiya 1", translation: "Thus speaks His Majesty, Mursili", tokens: tokens.tunnawiyaTokens },
      { title: "Ritual of Tunnawiya 2", translation: "the great king of Hatti.", tokens: tokens.tunnawiyaNextTokens },
      { title: "Ritual of Tunnawiya 3", translation: "And to me the Sun-god, my lord, Ishtar, my lady, turned forth.", tokens: tokens.tunnawiyaAdditionalTokens }
    ],
    1104: [{ title: "Illuyanka Myth", translation: "When the Storm-god killed the serpent Illuyanka...", tokens: tokens.illuyankaTokens }],
    1105: [{ title: "Song of Kumarbi", translation: "Sing to the gods of Kumarbi...", tokens: tokens.kumarbiTokens }],
    1106: [{ title: "Annals of Mursili II", translation: "Thus speaks His Majesty Mursili, great king...", tokens: tokens.mursiliTokens }],
    1107: [{ title: "Apology of Hattusili III", translation: "Thus speaks Hattusili, great king...", tokens: tokens.hattusiliTokens }],
  };

  const defaultData = [
    {
      title: "Unknown Text Chapter 1",
      translation: "Translation not available for this text yet.",
      tokens: []
    }
  ];

  const data = languageMap[textId];
  
  if (data) {
    return data.map((d, index) => ({
      id: index + 1,
      textId,
      chapterNumber: index + 1,
      title: d.title,
      translation: d.translation,
      tokens: d.tokens || [],
    }));
  }

  // Fallbacks
  const getFallback = (baseId: number) => {
    return languageMap[baseId].map((d, index) => ({
      id: index + 1,
      textId,
      chapterNumber: index + 1,
      title: d.title,
      translation: d.translation,
      tokens: d.tokens || [],
    }));
  };

  if (textId > 100 && textId < 200) return getFallback(104);
  if (textId > 200 && textId < 300) return getFallback(204);
  if (textId > 300 && textId < 400) return getFallback(303);
  if (textId > 400 && textId < 500) return getFallback(403);
  if (textId > 500 && textId < 600) return getFallback(506);
  if (textId > 600 && textId < 700) return getFallback(605);
  if (textId > 700 && textId < 800) return getFallback(704);
  if (textId > 800 && textId < 900) return getFallback(804);
  if (textId > 900 && textId < 1000) return getFallback(906);
  if (textId > 1000 && textId < 1100) return getFallback(1003);
  if (textId > 1100 && textId < 1200) return getFallback(1103);

  return defaultData.map((d, index) => ({
    id: index + 1,
    textId,
    chapterNumber: index + 1,
    title: d.title,
    translation: d.translation,
    tokens: d.tokens,
  }));
};
