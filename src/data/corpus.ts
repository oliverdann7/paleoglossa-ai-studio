import { Text, TextSection, Corpus } from "../types/corpus.js";

// ATTRIBUTIONS now lives in ./attributions.ts (extracted to keep this file
// small and to let the ingestion pipeline import the license registry without
// pulling in the whole bundled corpus). Imported for local use in the corpus
// definitions below and re-exported for existing importers.
import { ATTRIBUTIONS, getAttribution, isCommercialSafe } from "./attributions.js";
export { ATTRIBUTIONS, getAttribution, isCommercialSafe };

export const GREEK_CORPUS: Corpus = {
  id: "SBLGNT",
  title: "SBL Greek New Testament",
  description: "The SBL Greek New Testament — John 1 fully available with morphology and glosses",
  language: "grc-koine",
  sourceAttributionId: "sblgnt-text",
  licenseSummary: "Non-Commercial",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["sblgnt-text"], ATTRIBUTIONS["morphgnt-parsing"]],
};
export const HEBREW_CORPUS: Corpus = {
  id: "OSHB",
  title: "Open Scriptures Hebrew Bible",
  description: "Hebrew Bible — Genesis 1 and Psalm 23 fully available with morphology and glosses",
  language: "hbo",
  sourceAttributionId: "oshb-text-morph",
  licenseSummary: "CC BY 4.0",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["oshb-text-morph"]],
};
export const LATIN_CORPUS: Corpus = {
  id: "LATIN_CLASSIC",
  title: "Classical Latin Corpus",
  description: "Ancient Latin texts — Aeneid Book 1 fully available with morphology and glosses",
  language: "lat",
  sourceAttributionId: "perseus-texts",
  licenseSummary: "CC BY-SA 3.0",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["perseus-texts"]],
};

export const ANCIENT_GREEK_CORPUS: Corpus = {
  id: "ANCIENT_GREEK",
  title: "Ancient Greek Literature",
  description: "Classical and Hellenistic Greek texts — Iliad Book 1 and Anabasis 1.1 available",
  language: "grc",
  sourceAttributionId: "perseus-texts",
  licenseSummary: "CC BY-SA 3.0",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["perseus-texts"]],
};
export const LXX_CORPUS: Corpus = {
  id: "LXX",
  title: "Septuagint (LXX)",
  description: "The Greek Old Testament — Koine Greek Genesis, Psalms, Exodus, and Isaiah",
  language: "grc-koine",
  sourceAttributionId: "lxx-text",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["lxx-text"]],
};
export const PATRISTIC_CORPUS: Corpus = {
  id: "PATRISTIC_GREEK",
  title: "Patristic Greek",
  description: "Early Christian writings in Koine Greek — Clement, Didache, Athanasius, Chrysostom",
  language: "grc-koine",
  sourceAttributionId: "patristic-texts",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["patristic-texts"]],
};
export const SYRIAC_CORPUS: Corpus = {
  id: "SYRIAC_PESHITTA",
  title: "Syriac Peshitta",
  description: "The Syriac Bible",
  language: "syr",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};
export const COPTIC_CORPUS: Corpus = {
  id: "COPTIC_SAHIDIC",
  title: "Sahidic Coptic New Testament",
  description: "Coptic New Testament",
  language: "cop",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};
export const ARAMAIC_CORPUS: Corpus = {
  id: "ARAMAIC_TARGUM",
  title: "Aramaic Targum",
  description: "Aramaic Targum of the Hebrew Bible",
  language: "arc",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};
export const AKKADIAN_CORPUS: Corpus = {
  id: "AKKADIAN_GILGAMESH",
  title: "Epic of Gilgamesh",
  description: "Standard Babylonian Epic of Gilgamesh (Transliteration)",
  language: "akk",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};
export const SANSKRIT_CORPUS: Corpus = {
  id: "SANSKRIT_MAHABHARATA",
  title: "Mahabharata",
  description: "The Mahabharata in Sanskrit",
  language: "san",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};

export const HITTITE_CORPUS: Corpus = {
  id: "HITTITE_ANNALS",
  title: "Annals of Mursili II",
  description: "The extensive ten-year annals documenting the early reign of Mursili II",
  language: "hit",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};

export const EGYPTIAN_CORPUS: Corpus = {
  id: "EGYPTIAN_TEXTS",
  title: "Egyptian Hieroglyphs",
  description: "Classic Middle Egyptian texts",
  language: "egy",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};

export const UGARITIC_CORPUS: Corpus = {
  id: "UGARITIC_BAAL",
  title: "Baal Cycle",
  description: "The Ugaritic Baal Cycle (KTU 1.1–1.6), the most important mythological text from Ugarit",
  language: "uga",
  sourceAttributionId: "project-gutenberg",
  licenseSummary: "Public Domain",
  importStatus: "partial",
  attribution: [ATTRIBUTIONS["project-gutenberg"]],
};

export const TEXT_JOHN_FULL: Text = {
  id: "Jn-full",
  corpusId: "SBLGNT",
  title: "ΚΑΤΑ ΙΩΑΝΝΗΝ",
  canonicalRef: "John 1–21",
  author: "John",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '1st century CE',
  genre: 'gospel',
  corpusType: 'biblical',
  tags: ['New Testament', 'Johannine', 'theology'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 878,
  sectionsPreview: [
    { id: "Jn-1",  label: "John 1"  },
    { id: "Jn-2",  label: "John 2"  },
    { id: "Jn-3",  label: "John 3"  },
    { id: "Jn-4",  label: "John 4"  },
    { id: "Jn-5",  label: "John 5"  },
    { id: "Jn-6",  label: "John 6"  },
    { id: "Jn-7",  label: "John 7"  },
    { id: "Jn-8",  label: "John 8"  },
    { id: "Jn-9",  label: "John 9"  },
    { id: "Jn-10", label: "John 10" },
    { id: "Jn-11", label: "John 11" },
    { id: "Jn-12", label: "John 12" },
    { id: "Jn-13", label: "John 13" },
    { id: "Jn-14", label: "John 14" },
    { id: "Jn-15", label: "John 15" },
    { id: "Jn-16", label: "John 16" },
    { id: "Jn-17", label: "John 17" },
    { id: "Jn-18", label: "John 18" },
    { id: "Jn-19", label: "John 19" },
    { id: "Jn-20", label: "John 20" },
    { id: "Jn-21", label: "John 21" },
  ],
};

export const TEXT_GENESIS: Text = {
  id: "Gen",
  corpusId: "OSHB",
  title: "בְּרֵאשִׁית",
  canonicalRef: "Genesis",
  author: "Moses",
  language: "hbo",
  direction: "rtl",
  level: "A2",
  period: 'Iron Age',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Torah', 'Pentateuch', 'creation', 'narrative'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  hasSyntax: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 31,
  sectionsPreview: [
    { id: "Gen-1", label: "Genesis 1:1" },
    { id: "Gen-1-2", label: "Genesis 1:2-5" },
    { id: "Gen-1-3", label: "Genesis 1:6-10" },
    { id: "Gen-1-4", label: "Genesis 1:11-15" },
    { id: "Gen-1-5", label: "Genesis 1:16-20" },
    { id: "Gen-1-6", label: "Genesis 1:21-25" },
    { id: "Gen-1-7", label: "Genesis 1:26-31" },
  ],
};

export const TEXT_AENEID_1: Text = {
  id: "Aeneid-1",
  corpusId: "LATIN_CLASSIC",
  title: "AENEIS",
  canonicalRef: "Aeneid 1",
  author: "Virgil",
  language: "lat",
  direction: "ltr",
  level: "B2",
  period: '1st century BCE',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Augustan', 'Virgil', 'mythology'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  hasSyntax: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 26,
  sectionsPreview: [
    { id: "Aen-1-1", label: "Aeneid 1.1-7" },
    { id: "Aen-1-2", label: "Aeneid 1.8-33" },
    { id: "Aen-1-3", label: "Aeneid 1.34-66" },
    { id: "Aen-1-4", label: "Aeneid 1.67-100" },
    { id: "Aen-1-5", label: "Aeneid 1.101-400" },
    { id: "Aen-1-6", label: "Aeneid 1.401-756" },
  ],
};

export const TEXT_PSALM_23: Text = {
  id: "Ps-23",
  corpusId: "OSHB",
  title: "תְּהִלִּים כג",
  canonicalRef: "Psalm 23",
  author: "David",
  language: "hbo",
  direction: "rtl",
  level: "B1",
  period: 'Iron Age',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Psalms', 'wisdom', 'liturgical'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Ps-23-1", label: "Psalm 23:1-2" },
    { id: "Ps-23-2", label: "Psalm 23:3-6" },
  ],
};

export const TEXT_SYRIAC_JOHN: Text = {
  id: "Syr-Jn-1",
  corpusId: "SYRIAC_PESHITTA",
  title: "ܝܘܚܢܢ",
  canonicalRef: "John 1",
  author: "John",
  language: "syr",
  direction: "rtl",
  level: "A1",
  period: '2nd–5th century CE',
  genre: 'gospel',
  corpusType: 'biblical',
  tags: ['Peshitta', 'New Testament', 'Johannine'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Syr-Jn-1-1", label: "John 1:1" },
    { id: "Syr-Jn-1-2", label: "John 1:2–5" },
    { id: "Syr-Jn-1-3", label: "John 1:6–14" },
  ],
};

export const TEXT_COPTIC_JOHN: Text = {
  id: "Cop-Jn-1",
  corpusId: "COPTIC_SAHIDIC",
  title: "ⲡⲕⲁⲧⲁ ⲓⲱϩⲁⲛⲛⲏⲥ",
  canonicalRef: "John 1",
  author: "John",
  language: "cop",
  direction: "ltr",
  level: "A1",
  period: '3rd–4th century CE',
  genre: 'gospel',
  corpusType: 'biblical',
  tags: ['Sahidic', 'New Testament', 'Johannine'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 12,
  sectionsPreview: [
    { id: "Cop-Jn-1-1", label: "John 1:1" },
    { id: "Cop-Jn-1-2", label: "John 1:1-5" },
    { id: "Cop-Jn-1-3", label: "John 1:6-18" },
  ],
};

export const TEXT_ARAMAIC_GENESIS: Text = {
  id: "Arc-Gen-1",
  corpusId: "ARAMAIC_TARGUM",
  title: "תרגום אונקלוס בראשית",
  canonicalRef: "Targum Onkelos Genesis 1",
  author: "Onkelos",
  language: "arc",
  direction: "rtl",
  level: "A2",
  period: '2nd–5th century CE',
  genre: 'targum',
  corpusType: 'biblical',
  tags: ['Onkelos', 'Torah', 'translation'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 11,
  sectionsPreview: [
    { id: "Arc-Gen-1-1", label: "Genesis 1:1" },
    { id: "Arc-Gen-1-2", label: "Genesis 1:1-5" },
    { id: "Arc-Gen-1-3", label: "Genesis 1:6-18" },
    { id: "Arc-Gen-1-4", label: "Genesis 1:19-31" },
  ],
};

export const TEXT_AKKADIAN_GILGAMESH: Text = {
  id: "Akk-Gilg-1",
  corpusId: "AKKADIAN_GILGAMESH",
  title: "Epic of Gilgamesh, Tablet I",
  canonicalRef: "Gilgamesh Tablet I",
  author: "Sin-leqi-unninni",
  language: "akk",
  direction: "ltr",
  level: "B1",
  period: 'Old Babylonian / Standard Babylonian',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Mesopotamia', 'mythology', 'Enkidu'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Akk-Gilg-1-1", label: "Tablet I: Prologue (line 1)" },
    { id: "Akk-Gilg-1-2", label: "Tablet I: Prologue (lines 2–10)" },
    { id: "Akk-Gilg-1-3", label: "Tablet I: Gilgamesh Described" },
  ],
};

export const TEXT_AKKADIAN_GILGAMESH_FULL: Text = {
  id: "Akk-Gilg-full",
  corpusId: "AKKADIAN_GILGAMESH",
  title: "Epic of Gilgamesh — Tablets II, VI, X",
  canonicalRef: "Gilgamesh Tablets II, VI, X (selections)",
  author: "Sin-leqi-unninni",
  language: "akk",
  direction: "ltr",
  level: "B1",
  period: 'Old Babylonian / Standard Babylonian',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Mesopotamia', 'mythology', 'Enkidu'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 22,
  sectionsPreview: [
    { id: "Akk-Gilg-2", label: "Tablet II — Enkidu Comes to Uruk" },
    { id: "Akk-Gilg-6", label: "Tablet VI — Ishtar and the Bull of Heaven" },
    { id: "Akk-Gilg-10", label: "Tablet X — The Search for Eternal Life" },
  ],
};

export const TEXT_HAMMURABI_CODE: Text = {
  id: "Akk-Ham",
  corpusId: "AKKADIAN_GILGAMESH",
  title: "Code of Hammurabi",
  canonicalRef: "Codex Hammurabi (selections)",
  author: "Hammurabi",
  language: "akk",
  direction: "ltr",
  level: "B2",
  period: 'Old Babylonian (c. 1754 BCE)',
  genre: 'legal',
  corpusType: 'inscription',
  tags: ['Mesopotamia', 'law', 'royal'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 16,
  sectionsPreview: [
    { id: "Akk-Ham-1", label: "Prologue — When Anum the Lofty" },
    { id: "Akk-Ham-2", label: "Selected Laws (§1, §3, §5)" },
  ],
};

export const TEXT_SANSKRIT_GITA: Text = {
  id: "San-Gita-1",
  corpusId: "SANSKRIT_MAHABHARATA",
  title: "भगवद्गीता",
  canonicalRef: "Bhagavad Gita 1",
  author: "Vyasa",
  language: "san",
  direction: "ltr",
  level: "B1",
  period: 'c. 2nd century BCE',
  genre: 'philosophical poetry',
  corpusType: 'classical',
  tags: ['Hindu scripture', 'Mahabharata', 'Vedanta'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 12,
  sectionsPreview: [
    { id: "San-Gita-1-1", label: "Bhagavad Gita 1.1" },
    { id: "San-Gita-1-2", label: "Bhagavad Gita 1.2-6" },
    { id: "San-Gita-1-3", label: "Bhagavad Gita 1.7-1.26" },
    { id: "San-Gita-1-4", label: "Bhagavad Gita 1.27-1.47" },
  ],
};

export const TEXT_HITTITE_ANNALS: Text = {
  id: "Hit-Annals-1",
  corpusId: "HITTITE_ANNALS",
  title: "Annals of Mursili II - Ten Year Annals",
  canonicalRef: "CTH 61.II",
  author: "Mursili II",
  language: "hit",
  direction: "ltr",
  level: "C1",
  period: 'Late Bronze Age (c. 1321 BCE)',
  genre: 'historical',
  corpusType: 'inscription',
  tags: ['Anatolia', 'royal annals', 'military'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Hit-Annals-1-1", label: "Year 1: Introduction" },
    { id: "Hit-Annals-1-2", label: "Year 1: Campaign against Arzawa" },
    { id: "Hit-Annals-1-3", label: "Years 2–5: Campaigns" },
  ],
};

export const TEXT_EGYPTIAN_PTAHHOTEP: Text = {
  id: "Egy-Ptah-1",
  corpusId: "EGYPTIAN_TEXTS",
  title: "The Maxims of Ptahhotep",
  canonicalRef: "Prisse Papyrus",
  author: "Ptahhotep",
  language: "egy",
  direction: "ltr",
  level: "B1",
  period: 'Old Kingdom (c. 2400 BCE)',
  genre: 'wisdom literature',
  corpusType: 'classical',
  tags: ['Egypt', 'instruction', 'ethics'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 7,
  sectionsPreview: [
    { id: "Egy-Ptah-1-1", label: "Maxim 1 (Opening)" },
    { id: "Egy-Ptah-1-2", label: "Maxim 1 (continued)" },
    { id: "Egy-Ptah-1-3", label: "Maxim 1 (more)" },
  ],
};

export const TEXT_UGARITIC_BAAL: Text = {
  id: "Uga-Baal-1",
  corpusId: "UGARITIC_BAAL",
  title: "𐎀𐎍𐎛𐎊𐎐 𐎁𐎓𐎍 — Aliyan Baal",
  canonicalRef: "KTU 1.2–1.4 (Baal Cycle)",
  author: "Anonymous",
  language: "uga",
  direction: "ltr",
  level: "C1",
  period: 'Late Bronze Age (c. 1400 BCE)',
  genre: 'mythological poetry',
  corpusType: 'classical',
  tags: ['Canaan', 'mythology', 'Ugarit'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Uga-Baal-1-1", label: "Baal's Victory over Yamm (KTU 1.2.iv)" },
    { id: "Uga-Baal-1-2", label: "El and Asherah (KTU 1.4.i–ii)" },
  ],
};

export const TEXT_ANABASIS: Text = {
  id: "Anab-1",
  corpusId: "ANCIENT_GREEK",
  title: "Ἀνάβασις",
  canonicalRef: "Anabasis 1.1",
  author: "Xenophon",
  language: "grc",
  direction: "ltr",
  level: "B1",
  period: '4th century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Xenophon', 'military', 'Persian Empire'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 20,
  sectionsPreview: [
    { id: "Anab-1-1", label: "Anabasis 1.1 §1-3" },
    { id: "Anab-1-2", label: "Anabasis 1.1 §4-6" },
    { id: "Anab-1-3", label: "Anabasis 1, Ch 2-5" },
    { id: "Anab-1-4", label: "Anabasis 1, Ch 6-9" },
  ],
};

export const TEXT_ILIAD: Text = {
  id: "Iliad-1",
  corpusId: "ANCIENT_GREEK",
  title: "Ἰλιάς",
  canonicalRef: "Iliad Book 1",
  author: "Homer",
  language: "grc",
  direction: "ltr",
  level: "C1",
  period: '8th century BCE',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Homer', 'mythology', 'Trojan War'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 32,
  sectionsPreview: [
    { id: "Iliad-1-1", label: "Iliad 1.1-7" },
    { id: "Iliad-1-2", label: "Iliad 1.8-32" },
    { id: "Iliad-1-3", label: "Iliad 1.33-67" },
    { id: "Iliad-1-4", label: "Iliad 1.68-100" },
    { id: "Iliad-1-5", label: "Iliad 1.101-300" },
    { id: "Iliad-1-6", label: "Iliad 1.301-611" },
  ],
};

export const TEXT_ODYSSEY: Text = {
  id: "Odyssey-1",
  corpusId: "ANCIENT_GREEK",
  title: "Ὀδύσσεια",
  canonicalRef: "Odyssey Book 1",
  author: "Homer",
  language: "grc",
  direction: "ltr",
  level: "C1",
  period: '8th century BCE',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Homer', 'mythology', 'journey'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 20,
  sectionsPreview: [
    { id: "Odyssey-1-1", label: "Odyssey 1.1-5" },
    { id: "Odyssey-1-2", label: "Odyssey 1.6-21" },
    { id: "Odyssey-1-3", label: "Odyssey 1.22-200" },
    { id: "Odyssey-1-4", label: "Odyssey 1.201-444" },
  ],
};

export const TEXT_AESOP: Text = {
  id: "Aesop-1",
  corpusId: "ANCIENT_GREEK",
  title: "Αἰσώπου Μῦθοι",
  canonicalRef: "Aesop's Fables",
  author: "Aesop",
  language: "grc",
  direction: "ltr",
  level: "A2",
  period: '6th–5th century BCE',
  genre: 'fable',
  corpusType: 'classical',
  tags: ['didactic', 'beginner', 'animals'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 13,
  sectionsPreview: [
    { id: "Aesop-1-1", label: "The Fox and the Grapes" },
    { id: "Aesop-1-2", label: "The Ant and the Grasshopper; Tortoise and Hare" },
    { id: "Aesop-1-3", label: "The Wolf; The Farmer and His Sons" },
  ],
};

// ─── Beginner texts (A1) ──────────────────────────────────────────────────────

export const TEXT_GRC_MINI_STORIES: Text = {
  id: "GrcMini",
  corpusId: "SBLGNT",
  title: "Ἑλληνικαὶ Διηγήσεις",
  canonicalRef: "Greek Mini-Stories",
  author: "Paleoglossa",
  language: "grc-koine",
  direction: "ltr",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice', 'simplified'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 70,
  sectionsPreview: [
    { id: "GrcMini-1", label: "A man at the marketplace" },
    { id: "GrcMini-2", label: "The teacher and the student" },
    { id: "GrcMini-3", label: "The fisherman" },
    { id: "GrcMini-4", label: "The traveler" },
    { id: "GrcMini-5", label: "The shepherd" },
    { id: "GrcMini-6", label: "The mother and the child" },
    { id: "GrcMini-7", label: "The blind man" },
    { id: "GrcMini-8", label: "The bread and the fish" },
    { id: "GrcMini-9", label: "The storm" },
    { id: "GrcMini-10", label: "The lost son" },
  ],
};

export const TEXT_LAT_VG_JOHN: Text = {
  id: "Lat-Vg-Jn",
  corpusId: "LATIN_CLASSIC",
  title: "Ioannem",
  canonicalRef: "Vulgate John 1:1–14",
  author: "Jerome (translator)",
  language: "lat",
  direction: "ltr",
  level: "A1",
  period: '4th century CE',
  genre: 'gospel',
  corpusType: 'biblical',
  tags: ['Vulgate', 'Jerome', 'New Testament'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 14,
  sectionsPreview: [
    { id: "Lat-Vg-Jn-1", label: "John 1:1–14 — In principio erat Verbum" },
  ],
};

export const TEXT_LAT_CATO: Text = {
  id: "Lat-Cato",
  corpusId: "LATIN_CLASSIC",
  title: "Disticha Catonis",
  canonicalRef: "Moral Distichs",
  author: "Pseudo-Cato",
  language: "lat",
  direction: "ltr",
  level: "A1",
  period: '3rd century BCE',
  genre: 'didactic prose',
  corpusType: 'classical',
  tags: ['agriculture', 'practical', 'beginner'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Lat-Cat-1", label: "Praecepta moralia — Moral Precepts" },
  ],
};

export const TEXT_LAT_MINI_STORIES: Text = {
  id: "LatMini",
  corpusId: "LATIN_CLASSIC",
  title: "Fabulae Latinae",
  canonicalRef: "Latin Mini-Stories — A1",
  author: "Original compositions",
  language: "lat",
  direction: "ltr",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice', 'simplified'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 65,
  sectionsPreview: [
    { id: "LatMini-1", label: "Agricola et villa — The farmer and his estate" },
    { id: "LatMini-2", label: "Puer et magister — The boy and the teacher" },
    { id: "LatMini-3", label: "Piscator — The fisherman" },
    { id: "LatMini-4", label: "Viator — The traveler" },
    { id: "LatMini-5", label: "Pastor et oves — The shepherd and the sheep" },
    { id: "LatMini-6", label: "Canis et caro — The dog and the meat" },
    { id: "LatMini-7", label: "Lupus et agnus — The wolf and the lamb" },
    { id: "LatMini-8", label: "Vulpes et uva — The fox and the grapes" },
    { id: "LatMini-9", label: "Mercator et margarita — The merchant and the pearl" },
    { id: "LatMini-10", label: "Samaritanus bonus — The good Samaritan" },
  ],
};

export const TEXT_HEB_GENESIS: Text = {
  id: "Heb-Genesis",
  corpusId: "OSHB",
  title: "בְּרֵאשִׁית",
  canonicalRef: "Genesis 1–3 — Creation and the Fall",
  author: "Anonymous",
  language: "hbo",
  direction: "rtl",
  level: "A1",
  period: 'Iron Age',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Torah', 'Pentateuch', 'creation'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 42,
  sectionsPreview: [
    { id: "Heb-Gen-1", label: "Genesis 1 — In the beginning" },
    { id: "Heb-Gen-2", label: "Genesis 2 — The Garden of Eden" },
    { id: "Heb-Gen-3", label: "Genesis 3 — The Fall" },
  ],
};

// ── Hebrew/Aramaic/Syriac/Coptic/Sanskrit beginner mini-stories ──────────

export const TEXT_HEB_MINI_STORIES: Text = {
  id: "HebMini",
  corpusId: "OSHB",
  title: "סִפּוּרִים קְצָרִים",
  canonicalRef: "Hebrew Mini-Stories",
  author: "Paleoglossa",
  language: "hbo",
  direction: "rtl",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice', 'biblical'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 9,
  sectionsPreview: [
    { id: "HebMini-1", label: "In the beginning" },
    { id: "HebMini-2", label: "The good shepherd" },
  ],
};

export const TEXT_ARC_MINI_STORIES: Text = {
  id: "ArcMini",
  corpusId: "ARAMAIC_TARGUM",
  title: "סִפּוּרִין קַצִּירִין",
  canonicalRef: "Aramaic Mini-Stories",
  author: "Paleoglossa",
  language: "arc",
  direction: "rtl",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "ArcMini-1", label: "The teacher spoke" },
  ],
};

export const TEXT_SYR_MINI_STORIES: Text = {
  id: "SyrMini",
  corpusId: "SYRIAC_PESHITTA",
  title: "ܬܫܥܝܬܐ ܙܥܘܪ̈ܝܬܐ",
  canonicalRef: "Syriac Mini-Stories",
  author: "Paleoglossa",
  language: "syr",
  direction: "rtl",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice', 'liturgical'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "SyrMini-1", label: "Our Father in heaven" },
  ],
};

export const TEXT_COP_MINI_STORIES: Text = {
  id: "CopMini",
  corpusId: "COPTIC_SAHIDIC",
  title: "ⲛⲉϣⲁϫⲉ ⲛⲕⲟⲩⲓ",
  canonicalRef: "Coptic Mini-Stories",
  author: "Paleoglossa",
  language: "cop",
  direction: "ltr",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 3,
  sectionsPreview: [
    { id: "CopMini-1", label: "In the beginning (John 1)" },
  ],
};

export const TEXT_SAN_MINI_STORIES: Text = {
  id: "SanMini",
  corpusId: "SANSKRIT_MAHABHARATA",
  title: "लघुकथाः",
  canonicalRef: "Sanskrit Mini-Stories",
  author: "Paleoglossa",
  language: "san",
  direction: "ltr",
  level: "A1",
  period: 'modern adaptation',
  genre: 'graded reader',
  corpusType: 'vocabulary',
  tags: ['beginner', 'practice'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "SanMini-1", label: "Bhagavad-Gītā opening" },
  ],
};

export const TEXT_HEB_PS23: Text = {
  id: "Heb-Ps23",
  corpusId: "OSHB",
  title: "מִזְמוֹר כג",
  canonicalRef: "Psalm 23",
  author: "David",
  language: "hbo",
  direction: "rtl",
  level: "A1",
  period: 'Iron Age',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Psalms', 'wisdom', 'liturgical'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Heb-Ps-23", label: "Psalm 23 — The LORD is my shepherd" },
  ],
};

export const TEXT_HEB_JONAH: Text = {
  id: "Heb-Jonah",
  corpusId: "OSHB",
  title: "יוֹנָה",
  canonicalRef: "Jonah 1–4",
  author: "Anonymous",
  language: "hbo",
  direction: "rtl",
  level: "A2",
  period: 'Iron Age',
  genre: 'prophetic narrative',
  corpusType: 'biblical',
  tags: ['Twelve Prophets', 'narrative', 'repentance'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 38,
  sectionsPreview: [
    { id: "Heb-Jon-1", label: "Jonah 1 — The Flight" },
    { id: "Heb-Jon-2", label: "Jonah 2 — The Prayer" },
    { id: "Heb-Jon-3", label: "Jonah 3 — Nineveh Repents" },
    { id: "Heb-Jon-4", label: "Jonah 4 — God's Mercy" },
  ],
};

export const TEXT_HEB_PS91: Text = {
  id: "Heb-Ps91",
  corpusId: "OSHB",
  title: "מִזְמוֹר צא",
  canonicalRef: "Psalm 91",
  author: "Anonymous",
  language: "hbo",
  direction: "rtl",
  level: "A2",
  period: 'Iron Age',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Psalms', 'protection', 'liturgical'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 10,
  sectionsPreview: [
    { id: "Heb-Ps-91", label: "Psalm 91 — He who dwells in the shelter" },
  ],
};

export const TEXT_HEB_RUTH: Text = {
  id: "Heb-Ruth",
  corpusId: "OSHB",
  title: "מְגִלַּת רוּת",
  canonicalRef: "Ruth 1-4",
  author: "Anonymous",
  language: "hbo",
  direction: "rtl",
  level: "A2",
  period: 'Iron Age',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Megillot', 'narrative', 'Moab'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 30,
  sectionsPreview: [
    { id: "Heb-Ruth-1", label: "Ruth 1:1-5 — Famine and Death in Moab" },
    { id: "Heb-Ruth-2", label: "Ruth 1:6-14 — Naomi Returns" },
    { id: "Heb-Ruth-3", label: "Ruth 1:16-17 — Where You Go, I Will Go" },
    { id: "Heb-Ruth-4", label: "Ruth 2 — Ruth Meets Boaz" },
    { id: "Heb-Ruth-5", label: "Ruth 3 — At the Threshing Floor" },
    { id: "Heb-Ruth-6", label: "Ruth 4:13-17 — Redemption and the Son" },
  ],
};

export const TEXT_CICERO_CATILINA: Text = {
  id: "Cic-Catilina-1",
  corpusId: "LATIN_CLASSIC",
  title: "In Catilinam",
  canonicalRef: "Oration 1",
  author: "Marcus Tullius Cicero",
  language: "lat",
  direction: "ltr",
  level: "B1",
  period: '1st century BCE',
  genre: 'oratory',
  corpusType: 'classical',
  tags: ['rhetoric', 'Roman Republic', 'politics'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 48,
  sectionsPreview: [
    { id: "Cic-Cat-1", label: "1.1–4 — Opening Invocation and Denunciation" },
    { id: "Cic-Cat-2", label: "1.5–10 — The Conspiracy Exposed" },
    { id: "Cic-Cat-3", label: "1.11–20 — The Evidence of Treachery" },
    { id: "Cic-Cat-4", label: "1.21–33 — The Final Warning" },
  ],
};

export const TEXT_OVID_METAMORPHOSES: Text = {
  id: "Ovid-Metamorphoses-1",
  corpusId: "LATIN_CLASSIC",
  title: "Metamorphoses",
  canonicalRef: "Book 1",
  author: "Publius Ovidius Naso",
  language: "lat",
  direction: "ltr",
  level: "B2",
  period: '1st century CE',
  genre: 'epic poetry',
  corpusType: 'classical',
  tags: ['Augustan', 'mythology', 'transformation'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 48,
  sectionsPreview: [
    { id: "Ovid-Met-1", label: "Book 1.1–20 — Invocation and Chaos" },
    { id: "Ovid-Met-2", label: "Book 1.20–50 — The Four Ages of Humanity" },
    { id: "Ovid-Met-3", label: "Book 1.50–75 — Giants and the Rise of Evil" },
    { id: "Ovid-Met-4", label: "Book 1.75–100 — Lycaon's Impiety and Divine Judgment" },
  ],
};

export const TEXT_CAESAR_BG: Text = {
  id: "Caesar-BG-1",
  corpusId: "LATIN_CLASSIC",
  title: "De Bello Gallico",
  canonicalRef: "Book 1",
  author: "Gaius Julius Caesar",
  language: "lat",
  direction: "ltr",
  level: "B1",
  period: '1st century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['military', 'Gaul', 'Roman Republic'],
  hasMorphology: true,
  hasSyntax: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 48,
  sectionsPreview: [
    { id: "Caes-BG-1", label: "1.1–2.5 — Geography and the Helvetian Crisis" },
    { id: "Caes-BG-2", label: "2.5–15 — The Helvetian Movement and First Contact" },
    { id: "Caes-BG-3", label: "15–29 — Pursuit and Germanic Threat" },
    { id: "Caes-BG-4", label: "29–54 — The Final Battle and Victory" },
  ],
};

export const TEXT_PLATO_APOLOGY: Text = {
  id: "Plato-Apology-1",
  corpusId: "ANCIENT_GREEK",
  title: "Ἀπολογία",
  canonicalRef: "Apology",
  author: "Plato",
  language: "grc",
  direction: "ltr",
  level: "B1",
  period: '4th century BCE',
  genre: 'philosophical dialogue',
  corpusType: 'classical',
  tags: ['Socrates', 'philosophy', 'trial'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 68,
  sectionsPreview: [
    { id: "Plato-Apol-1", label: "17a–24b — Introduction and Defense Against Old Accusers" },
    { id: "Plato-Apol-2", label: "20e–24b — The Oracle and Socratic Mission" },
    { id: "Plato-Apol-3", label: "24c–28a — Response to the Charges" },
    { id: "Plato-Apol-4", label: "28d–35d — The Purpose and Value of the Examined Life" },
    { id: "Plato-Apol-5", label: "38b–42a — The Verdict and Socrates' Final Words" },
  ],
};

// ─── Septuagint (LXX) Texts ─────────────────────────────────────────────────
export const TEXT_LXX_GENESIS: Text = {
  id: "LXX-Gen-1",
  corpusId: "LXX",
  title: "Γένεσις",
  canonicalRef: "Genesis 1",
  author: "Moses",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '3rd century BCE',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Torah', 'creation'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 30,
  sectionsPreview: [
    { id: "LXX-Gen-1-1", label: "Genesis 1:1–13" },
    { id: "LXX-Gen-1-2", label: "Genesis 1:14–31" },
  ],
};

export const TEXT_LXX_PSALM_1: Text = {
  id: "LXX-Ps-1",
  corpusId: "LXX",
  title: "Ψαλμὸς Α′",
  canonicalRef: "Psalm 1",
  author: "David",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '3rd–2nd century BCE',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Psalms', 'wisdom'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "LXX-Ps-1-1", label: "Psalm 1" },
  ],
};

export const TEXT_LXX_PSALM_33: Text = {
  id: "LXX-Ps-33",
  corpusId: "LXX",
  title: "Ψαλμὸς ΛΓ′",
  canonicalRef: "Psalm 33 (LXX)",
  author: "David",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '3rd–2nd century BCE',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Psalms', 'praise'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 10,
  sectionsPreview: [
    { id: "LXX-Ps-33-1", label: "Psalm 33 (LXX)" },
  ],
};

export const TEXT_LXX_EXODUS_12: Text = {
  id: "LXX-Exod-12",
  corpusId: "LXX",
  title: "Ἔξοδος",
  canonicalRef: "Exodus 12:1–20",
  author: "Moses",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: '3rd century BCE',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Torah', 'Passover'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 17,
  sectionsPreview: [
    { id: "LXX-Exod-12-1", label: "Exodus 12:1–20" },
  ],
};

export const TEXT_LXX_ISAIAH_6: Text = {
  id: "LXX-Isa-6",
  corpusId: "LXX",
  title: "Ἠσαΐας",
  canonicalRef: "Isaiah 6:1–9",
  author: "Isaiah",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: '3rd–2nd century BCE',
  genre: 'prophetic',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Prophets', 'vision'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "LXX-Isa-6-1", label: "Isaiah 6:1–9" },
  ],
};

export const TEXT_LXX_PROVERBS: Text = {
  id: "LXX-Prov-1",
  corpusId: "LXX",
  title: "Παροιμίαι",
  canonicalRef: "Proverbs 1:1–9",
  author: "Solomon",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: '3rd–2nd century BCE',
  genre: 'wisdom literature',
  corpusType: 'biblical',
  tags: ['Septuagint', 'wisdom', 'didactic'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "LXX-Prov-1-1", label: "Proverbs 1:1–9" },
  ],
};

export const TEXT_LXX_PSALM_50: Text = {
  id: "LXX-Ps-50",
  corpusId: "LXX",
  title: "Ψαλμὸς Ν′",
  canonicalRef: "Psalm 50 (LXX)",
  author: "David",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '3rd–2nd century BCE',
  genre: 'poetry',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Psalms', 'penitential'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 11,
  sectionsPreview: [
    { id: "LXX-Ps-50-1", label: "Psalm 50 (LXX)" },
  ],
};

export const TEXT_LXX_JONAH: Text = {
  id: "LXX-Jonah-1",
  corpusId: "LXX",
  title: "Ἰωνᾶς",
  canonicalRef: "Jonah 1:1–12",
  author: "Jonah",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '3rd–2nd century BCE',
  genre: 'prophetic narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Twelve Prophets', 'narrative'],
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 11,
  sectionsPreview: [
    { id: "LXX-Jonah-1-1", label: "Jonah 1:1–12" },
  ],
};

// ─── Patristic Texts ─────────────────────────────────────────────────────────
export const TEXT_1_CLEMENT: Text = {
  id: "1Clem-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Κλήμεντος πρὸς Κορινθίους",
  canonicalRef: "1 Clement 1–2",
  author: "Clement of Rome",
  language: "grc-koine",
  direction: "ltr",
  level: "B2",
  period: 'c. 96 CE',
  genre: 'epistle',
  corpusType: 'patristic',
  tags: ['Apostolic Fathers', 'Rome', 'church order'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 5,
  sectionsPreview: [
    { id: "1Clem-1", label: "1 Clement 1–2" },
  ],
};

export const TEXT_DIDACHE: Text = {
  id: "Did-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Διδαχὴ τῶν Δώδεκα Ἀποστόλων",
  canonicalRef: "Didache 1–4",
  author: "The Twelve Apostles",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  period: '1st–2nd century CE',
  genre: 'catechetical',
  corpusType: 'patristic',
  tags: ['Apostolic Fathers', 'ethics', 'liturgy'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 12,
  sectionsPreview: [
    { id: "Did-1", label: "Didache 1–2" },
    { id: "Did-2", label: "Didache 3–4" },
  ],
};

export const TEXT_ATHANASIUS_INCARNATION: Text = {
  id: "Athan-Inc-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Περὶ τῆς Ἐνανθρωπήσεως τοῦ Λόγου",
  canonicalRef: "On the Incarnation 1–2",
  author: "Athanasius of Alexandria",
  language: "grc-koine",
  direction: "ltr",
  level: "C1",
  period: 'c. 318 CE',
  genre: 'theological treatise',
  corpusType: 'patristic',
  tags: ['Christology', 'Alexandria', 'apologetics'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "Athan-Inc-1", label: "On the Incarnation 1–2" },
  ],
};

export const TEXT_CHRYSOSTOM_HOMILY: Text = {
  id: "Chrys-Jn-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Ὁμιλία Α′ εἰς τὸ κατὰ Ἰωάννην",
  canonicalRef: "Homily 1 on John",
  author: "John Chrysostom",
  language: "grc-koine",
  direction: "ltr",
  level: "C1",
  period: 'c. 390 CE',
  genre: 'homily',
  corpusType: 'patristic',
  tags: ['preaching', 'Antioch', 'exegesis'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "Chrys-Jn-1", label: "Homily 1 on John" },
  ],
};

export const TEXT_HERMAS: Text = {
  id: "Hermas-Vis-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Ποιμὴν τοῦ Ἑρμᾶ",
  canonicalRef: "Vision 1.1–3",
  author: "Hermas",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: '2nd century CE',
  genre: 'apocalyptic',
  corpusType: 'patristic',
  tags: ['Apostolic Fathers', 'vision', 'ethics'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 3,
  sectionsPreview: [
    { id: "Hermas-Vis-1", label: "Vision 1.1–3" },
  ],
};

export const TEXT_BASIL: Text = {
  id: "Basil-Hex-1",
  corpusId: "PATRISTIC_GREEK",
  title: "Ὁμιλία Α′ τῆς Ἑξαημέρου",
  canonicalRef: "Hexaemeron 1.1",
  author: "Basil the Great",
  language: "grc-koine",
  direction: "ltr",
  level: "C1",
  period: 'c. 370 CE',
  genre: 'theological treatise',
  corpusType: 'patristic',
  tags: ['Cappadocian', 'Holy Spirit', 'theology'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 4,
  sectionsPreview: [
    { id: "Basil-Hex-1", label: "Hexaemeron 1.1" },
  ],
};


// ─── Patristic additions ──────────────────────────────────────────────────────

export const TEXT_IGNATIUS: Text = {
  id: "Ign-Eph",
  corpusId: "PATRISTIC_GREEK",
  title: "Πρὸς Ἐφεσίους",
  canonicalRef: "Ignatius to the Ephesians",
  author: "Ignatius of Antioch",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: 'c. 107 CE',
  genre: 'epistle',
  corpusType: 'patristic',
  tags: ['Apostolic Fathers', 'martyrdom', 'ecclesiology'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Ign-Eph-1", label: "Proemium — Opening salutation and exhortation" },
  ],
};

export const TEXT_JUSTIN_MARTYR: Text = {
  id: "Justin-Apol",
  corpusId: "PATRISTIC_GREEK",
  title: "Ἀπολογία Α′",
  canonicalRef: "First Apology 1–3",
  author: "Justin Martyr",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: 'c. 155 CE',
  genre: 'apologetics',
  corpusType: 'patristic',
  tags: ['apologetics', 'Rome', 'philosophy'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 7,
  sectionsPreview: [
    { id: "Justin-Apol-1", label: "Chapters 1–3 — Address and defence" },
  ],
};

export const TEXT_POLYCARP: Text = {
  id: "Polyc-Phil",
  corpusId: "PATRISTIC_GREEK",
  title: "Πρὸς Φιλιππησίους",
  canonicalRef: "Polycarp to the Philippians",
  author: "Polycarp of Smyrna",
  language: "grc-koine",
  direction: "ltr",
  level: "B1",
  period: 'c. 110 CE',
  genre: 'epistle',
  corpusType: 'patristic',
  tags: ['Apostolic Fathers', 'pastoral', 'Smyrna'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Polyc-Phil-1", label: "Chapter 1–2 — Faith, hope, and love" },
  ],
};

// ─── Latin classics (A2–B2) ───────────────────────────────────────────────────

export const TEXT_HORACE_ODES: Text = {
  id: "Hor-Carm",
  corpusId: "LATIN_CLASSIC",
  title: "Carmina",
  canonicalRef: "Odes I.1, I.9, I.11",
  author: "Quintus Horatius Flaccus",
  language: "lat",
  direction: "ltr",
  level: "B2",
  period: '1st century BCE',
  genre: 'lyric poetry',
  corpusType: 'classical',
  tags: ['Augustan', 'Horace', 'philosophy'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 22,
  sectionsPreview: [
    { id: "Hor-1-1", label: "Odes I.1 — Maecenas atavis" },
    { id: "Hor-1-9", label: "Odes I.9 — Vides ut alta" },
    { id: "Hor-1-11", label: "Odes I.11 — Tu ne quaesieris (Carpe diem)" },
  ],
};

export const TEXT_LIVY: Text = {
  id: "Livy-AUC",
  corpusId: "LATIN_CLASSIC",
  title: "Ab Urbe Condita",
  canonicalRef: "Praefatio & Book I",
  author: "Titus Livius",
  language: "lat",
  direction: "ltr",
  level: "B1",
  period: '1st century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Roman Republic', 'history', 'foundation'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 12,
  sectionsPreview: [
    { id: "Livy-Praef", label: "Praefatio — Preface" },
    { id: "Livy-1-1", label: "I.1 — The origins of Rome" },
  ],
};

export const TEXT_SALLUST: Text = {
  id: "Sall-Cat",
  corpusId: "LATIN_CLASSIC",
  title: "Bellum Catilinae",
  canonicalRef: "Chapters 1–3",
  author: "Gaius Sallustius Crispus",
  language: "lat",
  direction: "ltr",
  level: "B1",
  period: '1st century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Roman Republic', 'Catiline', 'politics'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 10,
  sectionsPreview: [
    { id: "Sall-Cat-1", label: "Chapters 1–3 — On the nature of man and glory" },
  ],
};

export const TEXT_TACITUS: Text = {
  id: "Tac-Ann",
  corpusId: "LATIN_CLASSIC",
  title: "Annales",
  canonicalRef: "Annals I.1–3",
  author: "Publius Cornelius Tacitus",
  language: "lat",
  direction: "ltr",
  level: "C1",
  period: '1st–2nd century CE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Roman Empire', 'Germania', 'ethnography'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Tac-Ann-1", label: "I.1–3 — From kings to Augustus" },
  ],
};

// ─── Ancient Greek classics (B1–C1) ──────────────────────────────────────────

export const TEXT_HERODOTUS: Text = {
  id: "Hdt-Hist",
  corpusId: "ANCIENT_GREEK",
  title: "Ἱστορίαι",
  canonicalRef: "Histories I.1–5",
  author: "Herodotus of Halicarnassus",
  language: "grc-class",
  direction: "ltr",
  level: "B1",
  period: '5th century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Histories', 'Persian Wars', 'ethnography'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 10,
  sectionsPreview: [
    { id: "Hdt-1-1", label: "I.1–5 — Proem and the mythic origins of the Persian Wars" },
  ],
};

export const TEXT_THUCYDIDES: Text = {
  id: "Thuc-Hist",
  corpusId: "ANCIENT_GREEK",
  title: "Ἱστορία τοῦ Πελοποννησιακοῦ Πολέμου",
  canonicalRef: "I.1–3",
  author: "Thucydides",
  language: "grc-class",
  direction: "ltr",
  level: "C1",
  period: '5th century BCE',
  genre: 'historical prose',
  corpusType: 'classical',
  tags: ['Peloponnesian War', 'Athens', 'politics'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Thuc-1-1", label: "I.1–3 — Introduction: the greatest war" },
  ],
};

export const TEXT_SOPHOCLES: Text = {
  id: "Soph-Ant",
  corpusId: "ANCIENT_GREEK",
  title: "Ἀντιγόνη",
  canonicalRef: "Antigone 1–99",
  author: "Sophocles",
  language: "grc-class",
  direction: "ltr",
  level: "C1",
  period: '5th century BCE',
  genre: 'tragedy',
  corpusType: 'classical',
  tags: ['drama', 'Oedipus', 'Athens'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 10,
  sectionsPreview: [
    { id: "Soph-Ant-1", label: "Lines 1–99 — Antigone and Ismene; Creon's edict" },
  ],
};

export const TEXT_PLUTARCH: Text = {
  id: "Plut-Alex",
  corpusId: "ANCIENT_GREEK",
  title: "Ἀλέξανδρος",
  canonicalRef: "Life of Alexander 1–4",
  author: "Plutarch",
  language: "grc-class",
  direction: "ltr",
  level: "B2",
  period: '1st–2nd century CE',
  genre: 'biography',
  corpusType: 'classical',
  tags: ['Lives', 'ethics', 'comparative'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 8,
  sectionsPreview: [
    { id: "Plut-Alex-1", label: "Chapters 1–4 — On biography and the battle of Issus" },
  ],
};

export const TEXT_LUCIAN: Text = {
  id: "Lucian-Char",
  corpusId: "ANCIENT_GREEK",
  title: "Χάρων ἢ Ἐπισκοποῦντες",
  canonicalRef: "Charon 1–8",
  author: "Lucian of Samosata",
  language: "grc-class",
  direction: "ltr",
  level: "B2",
  period: '2nd century CE',
  genre: 'satirical prose',
  corpusType: 'classical',
  tags: ['satire', 'humor', 'philosophy'],
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt',
  isComplete: false,
  isSample: true,
  sentenceCount: 9,
  sectionsPreview: [
    { id: "Lucian-Char-1", label: "Sections 1–8 — Charon surveys the world of the living" },
  ],
};

export const JOHN_1_1: TextSection = {
  id: "Jn-1-1",
  textId: "Jn-1",
  sequence: 1,
  label: "John 1",
  sentences: [
    {
      id: "Jn-1-1-1",
      translation:
        "In the beginning was the Word, and the Word was with God, and the Word was God.",
      tokens: [
        {
          id: "jn1",
          surface: "Ἐν",
          normalized: "εν",
          lemma: "ἐν",
          gloss: "in, with, by",
          morphology: { partOfSpeech: "preposition" },
          transliteration: "En",
          punctBefore: "",
          punctAfter: " ",
          head: 1, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn2",
          surface: "ἀρχῇ",
          normalized: "αρχη",
          lemma: "ἀρχή",
          gloss: "beginning, origin, first cause",
          morphology: {
            partOfSpeech: "noun",
            case: "dative",
            number: "singular",
            gender: "feminine",
          },
          transliteration: "archē",
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn3",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: {
            partOfSpeech: "verb",
            tense: "imperfect",
            voice: "active",
            mood: "indicative",
            person: "third",
            number: "singular",
          },
          transliteration: "ēn",
          punctBefore: "",
          punctAfter: " ",
          head: -1, deprel: "root", treebankSource: "PROIEL",
        },
        {
          id: "jn4",
          surface: "ὁ",
          normalized: "ο",
          lemma: "ὁ",
          gloss: "the",
          morphology: {
            partOfSpeech: "article",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "ho",
          punctBefore: "",
          punctAfter: " ",
          head: 4, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn5",
          surface: "λόγος",
          normalized: "λογος",
          lemma: "λόγος",
          gloss: "word, reason, speech",
          morphology: {
            partOfSpeech: "noun",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "logos",
          punctBefore: "",
          punctAfter: ", ",
          head: 2, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn6",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and, also",
          morphology: { partOfSpeech: "conjunction" },
          transliteration: "kai",
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn7",
          surface: "ὁ",
          normalized: "ο",
          lemma: "ὁ",
          gloss: "the",
          morphology: {
            partOfSpeech: "article",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "ho",
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn8",
          surface: "λόγος",
          normalized: "λογος",
          lemma: "λόγος",
          gloss: "word, reason, speech",
          morphology: {
            partOfSpeech: "noun",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "logos",
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "conj", treebankSource: "PROIEL",
        },
        {
          id: "jn9",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: {
            partOfSpeech: "verb",
            tense: "imperfect",
            voice: "active",
            mood: "indicative",
            person: "third",
            number: "singular",
          },
          transliteration: "ēn",
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "cop", treebankSource: "PROIEL",
        },
        {
          id: "jn10",
          surface: "πρὸς",
          normalized: "προς",
          lemma: "πρός",
          gloss: "with, toward",
          morphology: { partOfSpeech: "preposition" },
          transliteration: "pros",
          punctBefore: "",
          punctAfter: " ",
          head: 11, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn11",
          surface: "τὸν",
          normalized: "τον",
          lemma: "ὁ",
          gloss: "the",
          morphology: {
            partOfSpeech: "article",
            case: "accusative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "ton",
          punctBefore: "",
          punctAfter: " ",
          head: 11, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn12",
          surface: "θεόν",
          normalized: "θεον",
          lemma: "θεός",
          gloss: "God, deity",
          morphology: {
            partOfSpeech: "noun",
            case: "accusative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "theon",
          punctBefore: "",
          punctAfter: ", ",
          head: 7, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn13",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and, also",
          morphology: { partOfSpeech: "conjunction" },
          transliteration: "kai",
          punctBefore: "",
          punctAfter: " ",
          head: 16, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn14",
          surface: "θεὸς",
          normalized: "θεος",
          lemma: "θεός",
          gloss: "God, deity",
          morphology: {
            partOfSpeech: "noun",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "theos",
          punctBefore: "",
          punctAfter: " ",
          head: 16, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn15",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: {
            partOfSpeech: "verb",
            tense: "imperfect",
            voice: "active",
            mood: "indicative",
            person: "third",
            number: "singular",
          },
          transliteration: "ēn",
          punctBefore: "",
          punctAfter: " ",
          head: 16, deprel: "cop", treebankSource: "PROIEL",
        },
        {
          id: "jn16",
          surface: "ὁ",
          normalized: "ο",
          lemma: "ὁ",
          gloss: "the",
          morphology: {
            partOfSpeech: "article",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "ho",
          punctBefore: "",
          punctAfter: " ",
          head: 16, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn17",
          surface: "λόγος",
          normalized: "λογος",
          lemma: "λόγος",
          gloss: "word, reason, speech",
          morphology: {
            partOfSpeech: "noun",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          transliteration: "logos",
          punctBefore: "",
          punctAfter: ".",
          head: 2, deprel: "conj", treebankSource: "PROIEL",
        },
      ],
    },
    {
      id: "Jn-1-1-2",
      translation: "He was with God in the beginning.",
      tokens: [
        {
          id: "jn18",
          surface: "οὗτος",
          normalized: "ουτοϲ",
          lemma: "οὗτος",
          gloss: "this",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 1, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn19",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: {
            partOfSpeech: "verb",
            tense: "imperfect",
            voice: "active",
            mood: "indicative",
            person: "third",
            number: "singular",
          },
          punctBefore: "",
          punctAfter: " ",
          head: -1, deprel: "root", treebankSource: "PROIEL",
        },
        {
          id: "jn20",
          surface: "ἐν",
          normalized: "εν",
          lemma: "ἐν",
          gloss: "in",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn21",
          surface: "ἀρχῇ",
          normalized: "αρχη",
          lemma: "ἀρχή",
          gloss: "beginning",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 1, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn22",
          surface: "πρὸς",
          normalized: "προϲ",
          lemma: "πρός",
          gloss: "with",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 5, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn23",
          surface: "τὸν",
          normalized: "τον",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 5, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn24",
          surface: "θεόν",
          normalized: "θεον",
          lemma: "θεός",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
          head: 1, deprel: "obl", treebankSource: "PROIEL",
        },
      ],
    },
    {
      id: "Jn-1-1-3",
      translation:
        "Through him all things were made; without him nothing was made that has been made.",
      tokens: [
        {
          id: "jn25",
          surface: "πάντα",
          normalized: "παντα",
          lemma: "πᾶς",
          gloss: "all",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn26",
          surface: "δι’",
          normalized: "δι",
          lemma: "διά",
          gloss: "through",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn27",
          surface: "αὐτοῦ",
          normalized: "αυτου",
          lemma: "αὐτός",
          gloss: "him",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn28",
          surface: "ἐγένετο",
          normalized: "εγενετο",
          lemma: "γίνομαι",
          gloss: "were made",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: ", ",
          head: -1, deprel: "root", treebankSource: "PROIEL",
        },
        {
          id: "jn29",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn30",
          surface: "χωρὶς",
          normalized: "χωριϲ",
          lemma: "χωρίς",
          gloss: "without",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 6, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn31",
          surface: "αὐτοῦ",
          normalized: "αυτου",
          lemma: "αὐτός",
          gloss: "him",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn32",
          surface: "ἐγένετο",
          normalized: "εγενετο",
          lemma: "γίνομαι",
          gloss: "was made",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "conj", treebankSource: "PROIEL",
        },
        {
          id: "jn33",
          surface: "οὐδὲ",
          normalized: "ουδε",
          lemma: "οὐδέ",
          gloss: "not even",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "advmod", treebankSource: "PROIEL",
        },
        {
          id: "jn34",
          surface: "ἕν",
          normalized: "εν",
          lemma: "εἷς",
          gloss: "one",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn35",
          surface: "ὃ",
          normalized: "ο",
          lemma: "ὅς",
          gloss: "which",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 11, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn36",
          surface: "γέγονεν",
          normalized: "γεγονεν",
          lemma: "γίνομαι",
          gloss: "has been made",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: ".",
          head: 9, deprel: "acl:relcl", treebankSource: "PROIEL",
        },
      ],
    },
    {
      id: "Jn-1-1-4",
      translation:
        "In him was life, and that life was the light of all mankind.",
      tokens: [
        {
          id: "jn37",
          surface: "ἐν",
          normalized: "εν",
          lemma: "ἐν",
          gloss: "in",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 1, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn38",
          surface: "αὐτῷ",
          normalized: "αυτω",
          lemma: "αὐτός",
          gloss: "him",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn39",
          surface: "ζωὴ",
          normalized: "ζωη",
          lemma: "ζωή",
          gloss: "life",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn40",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: ", ",
          head: -1, deprel: "root", treebankSource: "PROIEL",
        },
        {
          id: "jn41",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
          head: 9, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn42",
          surface: "ἡ",
          normalized: "η",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 6, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn43",
          surface: "ζωὴ",
          normalized: "ζωη",
          lemma: "ζωή",
          gloss: "life",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 9, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn44",
          surface: "ἦν",
          normalized: "ην",
          lemma: "εἰμί",
          gloss: "was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
          head: 9, deprel: "cop", treebankSource: "PROIEL",
        },
        {
          id: "jn45",
          surface: "τὸ",
          normalized: "το",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 9, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn46",
          surface: "φῶς",
          normalized: "φωϲ",
          lemma: "φῶς",
          gloss: "light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "conj", treebankSource: "PROIEL",
        },
        {
          id: "jn47",
          surface: "τῶν",
          normalized: "των",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 11, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn48",
          surface: "ἀνθρώπων",
          normalized: "ανθρωπων",
          lemma: "ἄνθρωπος",
          gloss: "men",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
          head: 9, deprel: "nmod", treebankSource: "PROIEL",
        },
      ],
    },
    {
      id: "Jn-1-1-5",
      translation:
        "The light shines in the darkness, and the darkness has not overcome it.",
      tokens: [
        {
          id: "jn49",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
          head: 6, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn50",
          surface: "τὸ",
          normalized: "το",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn51",
          surface: "φῶς",
          normalized: "φωϲ",
          lemma: "φῶς",
          gloss: "light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 6, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn52",
          surface: "ἐν",
          normalized: "εν",
          lemma: "ἐν",
          gloss: "in",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 5, deprel: "case", treebankSource: "PROIEL",
        },
        {
          id: "jn53",
          surface: "τῇ",
          normalized: "τη",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 5, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn54",
          surface: "σκοτίᾳ",
          normalized: "σκοτια",
          lemma: "σκοτία",
          gloss: "darkness",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 6, deprel: "obl", treebankSource: "PROIEL",
        },
        {
          id: "jn55",
          surface: "φαίνει",
          normalized: "φαινει",
          lemma: "φαίνω",
          gloss: "shines",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: ", ",
          head: -1, deprel: "root", treebankSource: "PROIEL",
        },
        {
          id: "jn56",
          surface: "καὶ",
          normalized: "και",
          lemma: "καί",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
          head: 12, deprel: "cc", treebankSource: "PROIEL",
        },
        {
          id: "jn57",
          surface: "ἡ",
          normalized: "η",
          lemma: "ὁ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: " ",
          head: 9, deprel: "det", treebankSource: "PROIEL",
        },
        {
          id: "jn58",
          surface: "σκοτία",
          normalized: "σκοτια",
          lemma: "σκοτία",
          gloss: "darkness",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 12, deprel: "nsubj", treebankSource: "PROIEL",
        },
        {
          id: "jn59",
          surface: "αὐτὸ",
          normalized: "αυτο",
          lemma: "αὐτός",
          gloss: "it",
          morphology: { partOfSpeech: "pronoun" },
          punctBefore: "",
          punctAfter: " ",
          head: 12, deprel: "obj", treebankSource: "PROIEL",
        },
        {
          id: "jn60",
          surface: "οὐ",
          normalized: "ου",
          lemma: "οὐ",
          gloss: "not",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
          head: 12, deprel: "advmod", treebankSource: "PROIEL",
        },
        {
          id: "jn61",
          surface: "κατέλαβεν",
          normalized: "κατελαβεν",
          lemma: "καταλαμβάνω",
          gloss: "overcome",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: ".",
          head: 6, deprel: "conj", treebankSource: "PROIEL",
        },
      ],
    },
  ],
};

export const ANABASIS_1_1: TextSection = {
  id: "Anab-1-1",
  textId: "Anab-1",
  sequence: 1,
  label: "Book 1, Chapter 1",
  sentences: [
    {
      id: "anab-1",
      translation: "Darius and Parysatis had two sons born to them; the elder was Artaxerxes, and the younger was Cyrus.",
      tokens: [
        { id: "an1", surface: "Δαρείου", normalized: "δαρειου", lemma: "Δαρεῖος", gloss: "of Darius", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "Dareiou", punctBefore: "", punctAfter: " " },
        { id: "an2", surface: "καὶ", normalized: "και", lemma: "καί", gloss: "and", morphology: { partOfSpeech: "conjunction" }, transliteration: "kai", punctBefore: "", punctAfter: " " },
        { id: "an3", surface: "Παρυσάτιδος", normalized: "παρυσατιδος", lemma: "Παρύσατις", gloss: "of Parysatis", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "Parysatidos", punctBefore: "", punctAfter: " " },
        { id: "an4", surface: "γίγνονται", normalized: "γιγνονται", lemma: "γίγνομαι", gloss: "are born, come to be", morphology: { partOfSpeech: "verb", tense: "present", voice: "middle", mood: "indicative", person: "third", number: "plural" }, transliteration: "gigontai", punctBefore: "", punctAfter: " " },
        { id: "an5", surface: "παῖδες", normalized: "παιδες", lemma: "παῖς", gloss: "sons, children", morphology: { partOfSpeech: "noun", case: "nominative", number: "plural", gender: "masculine" }, transliteration: "paides", punctBefore: "", punctAfter: " " },
        { id: "an6", surface: "δύο", normalized: "δυο", lemma: "δύο", gloss: "two", morphology: { partOfSpeech: "numeral", case: "nominative" }, transliteration: "dyo", punctBefore: "", punctAfter: ", " },
        { id: "an7", surface: "πρεσβύτερος", normalized: "πρεσβυτερος", lemma: "πρέσβυς", gloss: "older, elder", morphology: { partOfSpeech: "adjective", case: "nominative", number: "singular", gender: "masculine", degree: "comparative" }, transliteration: "presbyteros", punctBefore: "", punctAfter: " " },
        { id: "an8", surface: "μὲν", normalized: "μεν", lemma: "μέν", gloss: "on the one hand", morphology: { partOfSpeech: "particle" }, transliteration: "men", punctBefore: "", punctAfter: " " },
        { id: "an9", surface: "Ἀρταξέρξης", normalized: "αρταξερξης", lemma: "Ἀρταξέρξης", gloss: "Artaxerxes", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "Artaxerxēs", punctBefore: "", punctAfter: ", " },
        { id: "an10", surface: "νεώτερος", normalized: "νεωτερος", lemma: "νέος", gloss: "younger", morphology: { partOfSpeech: "adjective", case: "nominative", number: "singular", gender: "masculine", degree: "comparative" }, transliteration: "neōteros", punctBefore: "", punctAfter: " " },
        { id: "an11", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "but, and", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "an12", surface: "Κῦρος", normalized: "κυρος", lemma: "Κῦρος", gloss: "Cyrus", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "Kyros", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "anab-2",
      translation: "When Darius was ill and suspected the end of his life was near, he wished both his sons to be present.",
      tokens: [
        { id: "an13", surface: "ἐπεὶ", normalized: "επει", lemma: "ἐπεί", gloss: "when, since", morphology: { partOfSpeech: "conjunction" }, transliteration: "epei", punctBefore: "", punctAfter: " " },
        { id: "an14", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "but, now", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "an15", surface: "ἠσθένει", normalized: "ησθενει", lemma: "ἀσθενέω", gloss: "was ill", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "ēsthenei", punctBefore: "", punctAfter: " " },
        { id: "an16", surface: "Δαρεῖος", normalized: "δαρειος", lemma: "Δαρεῖος", gloss: "Darius", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "Dareios", punctBefore: "", punctAfter: " " },
        { id: "an17", surface: "καὶ", normalized: "και", lemma: "καί", gloss: "and", morphology: { partOfSpeech: "conjunction" }, transliteration: "kai", punctBefore: "", punctAfter: " " },
        { id: "an18", surface: "ὑπώπτευε", normalized: "υπωπτευε", lemma: "ὑποπτεύω", gloss: "suspected", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "hypōpteve", punctBefore: "", punctAfter: " " },
        { id: "an19", surface: "τελευτὴν", normalized: "τελευτην", lemma: "τελευτή", gloss: "the end, death", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "feminine" }, transliteration: "teleutēn", punctBefore: "", punctAfter: " " },
        { id: "an20", surface: "τοῦ", normalized: "του", lemma: "ὁ", gloss: "the", morphology: { partOfSpeech: "article", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "tou", punctBefore: "", punctAfter: " " },
        { id: "an21", surface: "βίου", normalized: "βιου", lemma: "βίος", gloss: "life", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "biou", punctBefore: "", punctAfter: ", " },
        { id: "an22", surface: "ἐβούλετο", normalized: "εβουλετο", lemma: "βούλομαι", gloss: "he wished", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "middle", mood: "indicative", person: "third", number: "singular" }, transliteration: "ebouleto", punctBefore: "", punctAfter: " " },
        { id: "an23", surface: "τὼ", normalized: "τω", lemma: "ὁ", gloss: "both, the two", morphology: { partOfSpeech: "article", case: "accusative", number: "dual", gender: "masculine" }, transliteration: "tō", punctBefore: "", punctAfter: " " },
        { id: "an24", surface: "παῖδε", normalized: "παιδε", lemma: "παῖς", gloss: "sons", morphology: { partOfSpeech: "noun", case: "accusative", number: "dual", gender: "masculine" }, transliteration: "paide", punctBefore: "", punctAfter: " " },
        { id: "an25", surface: "ἀμφοτέρω", normalized: "αμφοτερω", lemma: "ἀμφότερος", gloss: "both", morphology: { partOfSpeech: "adjective", case: "accusative", number: "dual", gender: "masculine" }, transliteration: "amphoterō", punctBefore: "", punctAfter: " " },
        { id: "an26", surface: "παρεῖναι", normalized: "παρειναι", lemma: "πάρειμι", gloss: "to be present", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "infinitive" }, transliteration: "pareinai", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "anab-3",
      translation: "The elder, Artaxerxes, was present; but Cyrus he summoned from the province over which he had made him satrap.",
      tokens: [
        { id: "an27", surface: "ὁ", normalized: "ο", lemma: "ὁ", gloss: "the", morphology: { partOfSpeech: "article", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "ho", punctBefore: "", punctAfter: " " },
        { id: "an28", surface: "μὲν", normalized: "μεν", lemma: "μέν", gloss: "on the one hand", morphology: { partOfSpeech: "particle" }, transliteration: "men", punctBefore: "", punctAfter: " " },
        { id: "an29", surface: "οὖν", normalized: "ουν", lemma: "οὖν", gloss: "therefore, then", morphology: { partOfSpeech: "particle" }, transliteration: "oun", punctBefore: "", punctAfter: " " },
        { id: "an30", surface: "πρεσβύτερος", normalized: "πρεσβυτερος", lemma: "πρέσβυς", gloss: "the elder", morphology: { partOfSpeech: "adjective", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "presbyteros", punctBefore: "", punctAfter: " " },
        { id: "an31", surface: "Ἀρταξέρξης", normalized: "αρταξερξης", lemma: "Ἀρταξέρξης", gloss: "Artaxerxes", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "Artaxerxēs", punctBefore: "", punctAfter: " " },
        { id: "an32", surface: "παρῆν", normalized: "παρην", lemma: "πάρειμι", gloss: "was present", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "parēn", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "anab-4",
      translation: "Cyrus he summoned from the province over which he had made him satrap.",
      tokens: [
        { id: "an33", surface: "Κῦρον", normalized: "κυρον", lemma: "Κῦρος", gloss: "Cyrus", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "Kyron", punctBefore: "", punctAfter: " " },
        { id: "an34", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "but, and", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "an35", surface: "μεταπέμπεται", normalized: "μεταπεμπεται", lemma: "μεταπέμπω", gloss: "sends for, summons", morphology: { partOfSpeech: "verb", tense: "present", voice: "middle", mood: "indicative", person: "third", number: "singular" }, transliteration: "metapempetai", punctBefore: "", punctAfter: " " },
        { id: "an36", surface: "ἀπὸ", normalized: "απο", lemma: "ἀπό", gloss: "from", morphology: { partOfSpeech: "preposition" }, transliteration: "apo", punctBefore: "", punctAfter: " " },
        { id: "an37", surface: "τῆς", normalized: "της", lemma: "ὁ", gloss: "the", morphology: { partOfSpeech: "article", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "tēs", punctBefore: "", punctAfter: " " },
        { id: "an38", surface: "ἀρχῆς", normalized: "αρχης", lemma: "ἀρχή", gloss: "province, rule", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "archēs", punctBefore: "", punctAfter: " " },
        { id: "an39", surface: "ἧς", normalized: "ης", lemma: "ὅς", gloss: "which", morphology: { partOfSpeech: "pronoun", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "hēs", punctBefore: "", punctAfter: " " },
        { id: "an40", surface: "αὐτὸν", normalized: "αυτον", lemma: "αὐτός", gloss: "him", morphology: { partOfSpeech: "pronoun", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "auton", punctBefore: "", punctAfter: " " },
        { id: "an41", surface: "σατράπην", normalized: "σατραπην", lemma: "σατράπης", gloss: "satrap, governor", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "satrapēn", punctBefore: "", punctAfter: " " },
        { id: "an42", surface: "ἐποίησε", normalized: "εποιησε", lemma: "ποιέω", gloss: "had made, appointed", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "epoiēse", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "anab-5",
      translation: "When Cyrus arrived, he accused him before his father, saying that he was plotting against his brother.",
      tokens: [
        { id: "an43", surface: "ὡς", normalized: "ως", lemma: "ὡς", gloss: "when", morphology: { partOfSpeech: "conjunction" }, transliteration: "hōs", punctBefore: "", punctAfter: " " },
        { id: "an44", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "and, but", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "an45", surface: "ἀφίκετο", normalized: "αφικετο", lemma: "ἀφικνέομαι", gloss: "arrived, came", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "middle", mood: "indicative", person: "third", number: "singular" }, transliteration: "aphiketo", punctBefore: "", punctAfter: ", " },
        { id: "an46", surface: "κατηγόρει", normalized: "κατηγορει", lemma: "κατηγορέω", gloss: "accused", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "katēgorei", punctBefore: "", punctAfter: " " },
        { id: "an47", surface: "αὐτοῦ", normalized: "αυτου", lemma: "αὐτός", gloss: "of him", morphology: { partOfSpeech: "pronoun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "autou", punctBefore: "", punctAfter: " " },
        { id: "an48", surface: "Τισσαφέρνης", normalized: "τισσαφερνης", lemma: "Τισσαφέρνης", gloss: "Tissaphernes", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "Tissaphernēs", punctBefore: "", punctAfter: " " },
        { id: "an49", surface: "ὡς", normalized: "ως", lemma: "ὡς", gloss: "that", morphology: { partOfSpeech: "conjunction" }, transliteration: "hōs", punctBefore: "", punctAfter: " " },
        { id: "an50", surface: "βουλεύοι", normalized: "βουλευοι", lemma: "βουλεύω", gloss: "was plotting", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "optative", person: "third", number: "singular" }, transliteration: "bouleuoi", punctBefore: "", punctAfter: " " },
        { id: "an51", surface: "ἐπὶ", normalized: "επι", lemma: "ἐπί", gloss: "against", morphology: { partOfSpeech: "preposition" }, transliteration: "epi", punctBefore: "", punctAfter: " " },
        { id: "an52", surface: "τῷ", normalized: "τω", lemma: "ὁ", gloss: "the", morphology: { partOfSpeech: "article", case: "dative", number: "singular", gender: "masculine" }, transliteration: "tō", punctBefore: "", punctAfter: " " },
        { id: "an53", surface: "ἀδελφῷ", normalized: "αδελφω", lemma: "ἀδελφός", gloss: "brother", morphology: { partOfSpeech: "noun", case: "dative", number: "singular", gender: "masculine" }, transliteration: "adelphō", punctBefore: "", punctAfter: "." },
      ],
    },
  ],
};

export const ILIAD_1_1: TextSection = {
  id: "Iliad-1-1",
  textId: "Iliad-1",
  sequence: 1,
  label: "Book 1, Lines 1-10",
  sentences: [
    {
      id: "il-1",
      translation: "Sing, O goddess, the anger of Achilles son of Peleus, that brought countless ills upon the Achaeans.",
      tokens: [
        { id: "il1", surface: "Μῆνιν", normalized: "μηνιν", lemma: "μῆνις", gloss: "wrath, anger", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "feminine" }, transliteration: "Mēnin", punctBefore: "", punctAfter: " " },
        { id: "il2", surface: "ἄειδε", normalized: "αειδε", lemma: "ἀείδω", gloss: "sing!", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "imperative", person: "second", number: "singular" }, transliteration: "aeide", punctBefore: "", punctAfter: ", " },
        { id: "il3", surface: "θεά", normalized: "θεα", lemma: "θεά", gloss: "goddess", morphology: { partOfSpeech: "noun", case: "vocative", number: "singular", gender: "feminine" }, transliteration: "thea", punctBefore: "", punctAfter: ", " },
        { id: "il4", surface: "Πηληϊάδεω", normalized: "πηληιαδεω", lemma: "Πηληϊάδης", gloss: "son of Peleus", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "Pēlēiadeō", punctBefore: "", punctAfter: " " },
        { id: "il5", surface: "Ἀχιλῆος", normalized: "αχιληος", lemma: "Ἀχιλλεύς", gloss: "of Achilles", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "Achilēos", punctBefore: "", punctAfter: "," },
      ],
    },
    {
      id: "il-2",
      translation: "the accursed wrath that brought countless ills upon the Achaeans",
      tokens: [
        { id: "il6", surface: "οὐλομένην", normalized: "ουλομενην", lemma: "ὀλλύμι", gloss: "accursed, destructive", morphology: { partOfSpeech: "verb", tense: "present", voice: "middle", mood: "participle", case: "accusative", number: "singular", gender: "feminine" }, transliteration: "ouloménēn", punctBefore: "", punctAfter: ", " },
        { id: "il7", surface: "ἣ", normalized: "η", lemma: "ὅς", gloss: "which, that", morphology: { partOfSpeech: "pronoun", case: "nominative", number: "singular", gender: "feminine" }, transliteration: "hē", punctBefore: "", punctAfter: " " },
        { id: "il8", surface: "μυρί'", normalized: "μυρια", lemma: "μυρίος", gloss: "countless, innumerable", morphology: { partOfSpeech: "adjective", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "myri'", punctBefore: "", punctAfter: " " },
        { id: "il9", surface: "Ἀχαιοῖς", normalized: "αχαιοις", lemma: "Ἀχαιός", gloss: "upon the Achaeans", morphology: { partOfSpeech: "noun", case: "dative", number: "plural", gender: "masculine" }, transliteration: "Achaiois", punctBefore: "", punctAfter: " " },
        { id: "il10", surface: "ἄλγε'", normalized: "αλγεα", lemma: "ἄλγος", gloss: "pains, ills", morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "alge'", punctBefore: "", punctAfter: " " },
        { id: "il11", surface: "ἔθηκε", normalized: "εθηκε", lemma: "τίθημι", gloss: "caused, brought", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "ethēke", punctBefore: "", punctAfter: "," },
      ],
    },
    {
      id: "il-3",
      translation: "and sent the souls of many brave heroes to Hades",
      tokens: [
        { id: "il12", surface: "πολλὰς", normalized: "πολλας", lemma: "πολύς", gloss: "many", morphology: { partOfSpeech: "adjective", case: "accusative", number: "plural", gender: "feminine" }, transliteration: "pollas", punctBefore: "", punctAfter: " " },
        { id: "il13", surface: "δ'", normalized: "δε", lemma: "δέ", gloss: "but, and", morphology: { partOfSpeech: "particle" }, transliteration: "d'", punctBefore: "", punctAfter: " " },
        { id: "il14", surface: "ἰφθίμους", normalized: "ιφθιμους", lemma: "ἴφθιμος", gloss: "mighty, brave", morphology: { partOfSpeech: "adjective", case: "accusative", number: "plural", gender: "feminine" }, transliteration: "iphthimous", punctBefore: "", punctAfter: " " },
        { id: "il15", surface: "ψυχὰς", normalized: "ψυχας", lemma: "ψυχή", gloss: "souls", morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "feminine" }, transliteration: "psychas", punctBefore: "", punctAfter: " " },
        { id: "il16", surface: "Ἄϊδι", normalized: "αιδι", lemma: "Ἀΐδης", gloss: "to Hades", morphology: { partOfSpeech: "noun", case: "dative", number: "singular", gender: "masculine" }, transliteration: "Aidi", punctBefore: "", punctAfter: " " },
        { id: "il17", surface: "προΐαψεν", normalized: "προιαψεν", lemma: "προΐαπτω", gloss: "sent forth", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "proiapsen", punctBefore: "", punctAfter: " " },
        { id: "il18", surface: "ἡρώων", normalized: "ηρωων", lemma: "ἥρως", gloss: "of heroes", morphology: { partOfSpeech: "noun", case: "genitive", number: "plural", gender: "masculine" }, transliteration: "hērōōn", punctBefore: "", punctAfter: "," },
      ],
    },
    {
      id: "il-4",
      translation: "and made their bodies prey for dogs and all the birds — and the plan of Zeus was fulfilled —",
      tokens: [
        { id: "il19", surface: "αὐτοὺς", normalized: "αυτους", lemma: "αὐτός", gloss: "themselves, their bodies", morphology: { partOfSpeech: "pronoun", case: "accusative", number: "plural", gender: "masculine" }, transliteration: "autous", punctBefore: "", punctAfter: " " },
        { id: "il20", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "but, and", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "il21", surface: "ἑλώρια", normalized: "ελωρια", lemma: "ἑλώριον", gloss: "prey, spoil", morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "helōria", punctBefore: "", punctAfter: " " },
        { id: "il22", surface: "τεῦχε", normalized: "τευχε", lemma: "τεύχω", gloss: "made, caused to be", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "teuche", punctBefore: "", punctAfter: " " },
        { id: "il23", surface: "κύνεσσιν", normalized: "κυνεσσιν", lemma: "κύων", gloss: "for dogs", morphology: { partOfSpeech: "noun", case: "dative", number: "plural", gender: "masculine" }, transliteration: "kynessin", punctBefore: "", punctAfter: " " },
        { id: "il24", surface: "οἰωνοῖσί", normalized: "οιωνοισι", lemma: "οἰωνός", gloss: "to birds", morphology: { partOfSpeech: "noun", case: "dative", number: "plural", gender: "masculine" }, transliteration: "oiōnoisi", punctBefore: "", punctAfter: " " },
        { id: "il25", surface: "τε", normalized: "τε", lemma: "τε", gloss: "and", morphology: { partOfSpeech: "particle" }, transliteration: "te", punctBefore: "", punctAfter: " " },
        { id: "il26", surface: "πᾶσι", normalized: "πασι", lemma: "πᾶς", gloss: "all", morphology: { partOfSpeech: "adjective", case: "dative", number: "plural", gender: "masculine" }, transliteration: "pasi", punctBefore: "", punctAfter: "," },
      ],
    },
    {
      id: "il-5",
      translation: "from when first the two parted in strife — Atreus' son, lord of men, and godlike Achilles.",
      tokens: [
        { id: "il27", surface: "ἐξ", normalized: "εξ", lemma: "ἐκ", gloss: "from", morphology: { partOfSpeech: "preposition" }, transliteration: "ex", punctBefore: "", punctAfter: " " },
        { id: "il28", surface: "οὗ", normalized: "ου", lemma: "ὅς", gloss: "when, from which time", morphology: { partOfSpeech: "pronoun", case: "genitive", number: "singular", gender: "masculine" }, transliteration: "hou", punctBefore: "", punctAfter: " " },
        { id: "il29", surface: "δὴ", normalized: "δη", lemma: "δή", gloss: "truly, then", morphology: { partOfSpeech: "particle" }, transliteration: "dē", punctBefore: "", punctAfter: " " },
        { id: "il30", surface: "τὰ", normalized: "τα", lemma: "ὁ", gloss: "these, the", morphology: { partOfSpeech: "article", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "ta", punctBefore: "", punctAfter: " " },
        { id: "il31", surface: "πρῶτα", normalized: "πρωτα", lemma: "πρῶτος", gloss: "first", morphology: { partOfSpeech: "adjective", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "prōta", punctBefore: "", punctAfter: " " },
        { id: "il32", surface: "διαστήτην", normalized: "διαστητην", lemma: "διΐστημι", gloss: "parted, stood apart", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "dual" }, transliteration: "diastatēn", punctBefore: "", punctAfter: " " },
        { id: "il33", surface: "ἐρίσαντε", normalized: "εριοαντε", lemma: "ἐρίζω", gloss: "having quarreled", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "participle", case: "nominative", number: "dual" }, transliteration: "erisante", punctBefore: "", punctAfter: "." },
      ],
    },
  ],
};

export const ODYSSEY_1_1: TextSection = {
  id: "Odyssey-1-1",
  textId: "Odyssey-1",
  sequence: 1,
  label: "Book 1, Lines 1-10",
  sentences: [
    {
      id: "od-1",
      translation: "Tell me, O Muse, of the man of many devices, who wandered far and wide after he had sacked the sacred city of Troy.",
      tokens: [
        { id: "od1", surface: "Ἄνδρα", normalized: "ανδρα", lemma: "ἀνήρ", gloss: "the man", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "Andra", punctBefore: "", punctAfter: " " },
        { id: "od2", surface: "μοι", normalized: "μοι", lemma: "ἐγώ", gloss: "to me", morphology: { partOfSpeech: "pronoun", case: "dative", number: "singular" }, transliteration: "moi", punctBefore: "", punctAfter: " " },
        { id: "od3", surface: "ἔννεπε", normalized: "εννεπε", lemma: "ἐνέπω", gloss: "tell of, relate", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "imperative", person: "second", number: "singular" }, transliteration: "ennepe", punctBefore: "", punctAfter: ", " },
        { id: "od4", surface: "Μοῦσα", normalized: "μουσα", lemma: "Μοῦσα", gloss: "Muse", morphology: { partOfSpeech: "noun", case: "vocative", number: "singular", gender: "feminine" }, transliteration: "Mousa", punctBefore: "", punctAfter: ", " },
        { id: "od5", surface: "πολύτροπον", normalized: "πολυτροπον", lemma: "πολύτροπος", gloss: "of many devices", morphology: { partOfSpeech: "adjective", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "polytropon", punctBefore: "", punctAfter: ", " },
        { id: "od6", surface: "ὃς", normalized: "ος", lemma: "ὅς", gloss: "who", morphology: { partOfSpeech: "pronoun", case: "nominative", number: "singular", gender: "masculine" }, transliteration: "hos", punctBefore: "", punctAfter: " " },
        { id: "od7", surface: "μάλα", normalized: "μαλα", lemma: "μάλα", gloss: "very, much", morphology: { partOfSpeech: "adverb" }, transliteration: "mala", punctBefore: "", punctAfter: " " },
        { id: "od8", surface: "πολλὰ", normalized: "πολλα", lemma: "πολύς", gloss: "many things", morphology: { partOfSpeech: "adjective", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "polla", punctBefore: "", punctAfter: " " },
        { id: "od9", surface: "πλάγχθη", normalized: "πλαγχθη", lemma: "πλάζω", gloss: "wandered, strayed", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "passive", mood: "indicative", person: "third", number: "singular" }, transliteration: "planchthē", punctBefore: "", punctAfter: ", " },
      ],
    },
    {
      id: "od-2",
      translation: "He saw the cities of many peoples and learned their ways.",
      tokens: [
        { id: "od10", surface: "ἐπεὶ", normalized: "επει", lemma: "ἐπεί", gloss: "after, when", morphology: { partOfSpeech: "conjunction" }, transliteration: "epei", punctBefore: "", punctAfter: " " },
        { id: "od11", surface: "Τροίης", normalized: "τροιης", lemma: "Τροίη", gloss: "of Troy", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "Troiēs", punctBefore: "", punctAfter: " " },
        { id: "od12", surface: "ἱερὸν", normalized: "ιερον", lemma: "ἱερός", gloss: "sacred", morphology: { partOfSpeech: "adjective", case: "accusative", number: "singular", gender: "neuter" }, transliteration: "hieron", punctBefore: "", punctAfter: " " },
        { id: "od13", surface: "πτολίεθρον", normalized: "πτολιεθρον", lemma: "πτολίεθρον", gloss: "city, citadel", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "neuter" }, transliteration: "ptoliethron", punctBefore: "", punctAfter: " " },
        { id: "od14", surface: "ἔπερσεν", normalized: "επερσεν", lemma: "πέρθω", gloss: "sacked, destroyed", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "epersen", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "od-3",
      translation: "He saw the cities of many peoples and learned their ways.",
      tokens: [
        { id: "od15", surface: "πολλῶν", normalized: "πολλων", lemma: "πολύς", gloss: "of many", morphology: { partOfSpeech: "adjective", case: "genitive", number: "plural", gender: "masculine" }, transliteration: "pollōn", punctBefore: "", punctAfter: " " },
        { id: "od16", surface: "δ'", normalized: "δε", lemma: "δέ", gloss: "and", morphology: { partOfSpeech: "particle" }, transliteration: "d'", punctBefore: "", punctAfter: " " },
        { id: "od17", surface: "ἀνθρώπων", normalized: "ανθρωπων", lemma: "ἄνθρωπος", gloss: "peoples, men", morphology: { partOfSpeech: "noun", case: "genitive", number: "plural", gender: "masculine" }, transliteration: "anthrōpōn", punctBefore: "", punctAfter: " " },
        { id: "od18", surface: "ἴδεν", normalized: "ιδεν", lemma: "εἶδον", gloss: "he saw", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "iden", punctBefore: "", punctAfter: " " },
        { id: "od19", surface: "ἄστεα", normalized: "αστεα", lemma: "ἄστυ", gloss: "cities", morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "neuter" }, transliteration: "astea", punctBefore: "", punctAfter: " " },
        { id: "od20", surface: "καὶ", normalized: "και", lemma: "καί", gloss: "and", morphology: { partOfSpeech: "conjunction" }, transliteration: "kai", punctBefore: "", punctAfter: " " },
        { id: "od21", surface: "νόον", normalized: "νοον", lemma: "νόος", gloss: "the mind, ways", morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "masculine" }, transliteration: "noon", punctBefore: "", punctAfter: " " },
        { id: "od22", surface: "ἔγνω", normalized: "εγνω", lemma: "γιγνώσκω", gloss: "learned, knew", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "egnō", punctBefore: "", punctAfter: ", " },
      ],
    },
  ],
};

export const AESOP_1_1: TextSection = {
  id: "Aesop-1-1",
  textId: "Aesop-1",
  sequence: 1,
  label: "The Fox and the Grapes",
  sentences: [
    {
      id: "aes-1",
      translation: "A hungry fox saw some grapes hanging from a vine that was trained on a tree.",
      tokens: [
        { id: "ae1", surface: "ἀλώπηξ", normalized: "αλωπηξ", lemma: "ἀλώπηξ", gloss: "a fox", morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "feminine" }, transliteration: "alōpēx", punctBefore: "", punctAfter: " " },
        { id: "ae2", surface: "λιμώττουσα", normalized: "λιμωττουσα", lemma: "λιμώττω", gloss: "being hungry", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "participle", case: "nominative", number: "singular", gender: "feminine" }, transliteration: "limōttousa", punctBefore: "", punctAfter: " " },
        { id: "ae3", surface: "βότρυς", normalized: "βοτρυς", lemma: "βότρυς", gloss: "grapes, a bunch of grapes", morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "masculine" }, transliteration: "botrys", punctBefore: "", punctAfter: " " },
        { id: "ae4", surface: "ἀπὸ", normalized: "απο", lemma: "ἀπό", gloss: "from", morphology: { partOfSpeech: "preposition" }, transliteration: "apo", punctBefore: "", punctAfter: " " },
        { id: "ae5", surface: "ἀμπέλου", normalized: "αμπελου", lemma: "ἄμπελος", gloss: "a vine", morphology: { partOfSpeech: "noun", case: "genitive", number: "singular", gender: "feminine" }, transliteration: "ampelou", punctBefore: "", punctAfter: " " },
        { id: "ae6", surface: "κρεμαμένους", normalized: "κρεμαμενους", lemma: "κρεμάννυμι", gloss: "hanging", morphology: { partOfSpeech: "verb", tense: "present", voice: "middle", mood: "participle", case: "accusative", number: "plural", gender: "masculine" }, transliteration: "kremamenous", punctBefore: "", punctAfter: " " },
        { id: "ae7", surface: "εἶδε", normalized: "ειδε", lemma: "ὁράω", gloss: "saw", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "eide", punctBefore: "", punctAfter: "." },
      ],
    },
    {
      id: "aes-2",
      translation: "She tried to reach them but could not, and went away saying, 'They are sour.'",
      tokens: [
        { id: "ae8", surface: "ἐπειρᾶτο", normalized: "επειρατο", lemma: "πειράω", gloss: "she tried", morphology: { partOfSpeech: "verb", tense: "imperfect", voice: "middle", mood: "indicative", person: "third", number: "singular" }, transliteration: "epeirato", punctBefore: "", punctAfter: " " },
        { id: "ae9", surface: "δὲ", normalized: "δε", lemma: "δέ", gloss: "and, but", morphology: { partOfSpeech: "particle" }, transliteration: "de", punctBefore: "", punctAfter: " " },
        { id: "ae10", surface: "λαβεῖν", normalized: "λαβειν", lemma: "λαμβάνω", gloss: "to take, to reach", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "infinitive" }, transliteration: "labein", punctBefore: "", punctAfter: " " },
        { id: "ae11", surface: "αὐτούς", normalized: "αυτους", lemma: "αὐτός", gloss: "them", morphology: { partOfSpeech: "pronoun", case: "accusative", number: "plural", gender: "masculine" }, transliteration: "autous", punctBefore: "", punctAfter: ", " },
        { id: "ae12", surface: "οὐκ", normalized: "ουκ", lemma: "οὐ", gloss: "not", morphology: { partOfSpeech: "particle" }, transliteration: "ouk", punctBefore: "", punctAfter: " " },
        { id: "ae13", surface: "ἠδυνήθη", normalized: "ηδυνηθη", lemma: "δύναμαι", gloss: "was able, could", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "passive", mood: "indicative", person: "third", number: "singular" }, transliteration: "ēdynēthē", punctBefore: "", punctAfter: ", " },
        { id: "ae14", surface: "καὶ", normalized: "και", lemma: "καί", gloss: "and", morphology: { partOfSpeech: "conjunction" }, transliteration: "kai", punctBefore: "", punctAfter: " " },
        { id: "ae15", surface: "ἀπιοῦσα", normalized: "απιουσα", lemma: "ἄπειμι", gloss: "going away", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "participle", case: "nominative", number: "singular", gender: "feminine" }, transliteration: "apiousa", punctBefore: "", punctAfter: " " },
        { id: "ae16", surface: "εἶπεν", normalized: "ειπεν", lemma: "λέγω", gloss: "said", morphology: { partOfSpeech: "verb", tense: "aorist", voice: "active", mood: "indicative", person: "third", number: "singular" }, transliteration: "eipen", punctBefore: "", punctAfter: ", " },
        { id: "ae17", surface: "ὄμφακές", normalized: "ομφακες", lemma: "ὄμφαξ", gloss: "sour, unripe", morphology: { partOfSpeech: "adjective", case: "nominative", number: "plural", gender: "masculine" }, transliteration: "omphakes", punctBefore: "", punctAfter: " " },
        { id: "ae18", surface: "εἰσι", normalized: "εισι", lemma: "εἰμί", gloss: "they are", morphology: { partOfSpeech: "verb", tense: "present", voice: "active", mood: "indicative", person: "third", number: "plural" }, transliteration: "eisi", punctBefore: "", punctAfter: "." },
      ],
    },
  ],
};

export const AENEID_1_1: TextSection = {
  id: "Aen-1-1",
  textId: "Aeneid-1",
  sequence: 1,
  label: "Book 1",
  sentences: [
    {
      id: "aen1",
      translation:
        "I sing of arms and the man, who first from the coasts of Troy...",
      tokens: [
        {
          id: "a1",
          surface: "Arma",
          normalized: "arma",
          lemma: "arma",
          gloss: "arms, weapons",
          morphology: {
            partOfSpeech: "noun",
            case: "accusative",
            number: "plural",
            gender: "neuter",
          },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "obj", treebankSource: "PLDT",
        },
        {
          id: "a2",
          surface: "virumque",
          normalized: "virumque",
          lemma: "vir",
          gloss: "man, hero",
          morphology: {
            partOfSpeech: "noun",
            case: "accusative",
            number: "singular",
            gender: "masculine",
          },
          punctBefore: "",
          punctAfter: " ",
          head: 0, deprel: "conj", treebankSource: "PLDT",
        },
        {
          id: "a3",
          surface: "cano",
          normalized: "cano",
          lemma: "cano",
          gloss: "I sing",
          morphology: {
            partOfSpeech: "verb",
            person: "first",
            number: "singular",
            tense: "present",
            voice: "active",
            mood: "indicative",
          },
          punctBefore: "",
          punctAfter: ", ",
          head: -1, deprel: "root", treebankSource: "PLDT",
        },
        {
          id: "a4",
          surface: "Troiae",
          normalized: "troiae",
          lemma: "Troia",
          gloss: "Troy",
          morphology: {
            partOfSpeech: "proper noun",
            case: "genitive",
            number: "singular",
            gender: "feminine",
          },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "nmod", treebankSource: "PLDT",
        },
        {
          id: "a5",
          surface: "qui",
          normalized: "qui",
          lemma: "qui",
          gloss: "who",
          morphology: {
            partOfSpeech: "relative pronoun",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          punctBefore: "",
          punctAfter: " ",
          head: 1, deprel: "nsubj", treebankSource: "PLDT",
        },
        {
          id: "a6",
          surface: "primus",
          normalized: "primus",
          lemma: "primus",
          gloss: "first",
          morphology: {
            partOfSpeech: "adjective",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          punctBefore: "",
          punctAfter: " ",
          head: 4, deprel: "amod", treebankSource: "PLDT",
        },
        {
          id: "a7",
          surface: "ab",
          normalized: "ab",
          lemma: "ab",
          gloss: "from",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "case", treebankSource: "PLDT",
        },
        {
          id: "a8",
          surface: "oris",
          normalized: "oris",
          lemma: "ora",
          gloss: "coast, shore",
          morphology: {
            partOfSpeech: "noun",
            case: "ablative",
            number: "plural",
            gender: "feminine",
          },
          punctBefore: "",
          punctAfter: ".",
          head: 1, deprel: "obl", treebankSource: "PLDT",
        },
      ],
    },
    {
      id: "aen2",
      translation: "driven by fate, came to Italy and the Lavinian shores.",
      tokens: [
        {
          id: "a9",
          surface: "Italiam",
          normalized: "italiam",
          lemma: "Italia",
          gloss: "Italy",
          morphology: {
            partOfSpeech: "proper noun",
            case: "accusative",
            number: "singular",
            gender: "feminine",
          },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a10",
          surface: "fato",
          normalized: "fato",
          lemma: "fatum",
          gloss: "fate",
          morphology: {
            partOfSpeech: "noun",
            case: "ablative",
            number: "singular",
            gender: "neuter",
          },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a11",
          surface: "profugus",
          normalized: "profugus",
          lemma: "profugus",
          gloss: "exiled, fugitive",
          morphology: {
            partOfSpeech: "adjective",
            case: "nominative",
            number: "singular",
            gender: "masculine",
          },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a12",
          surface: "Laviniaque",
          normalized: "laviniaque",
          lemma: "Lavinius",
          gloss: "Lavinian",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a13",
          surface: "venit",
          normalized: "venit",
          lemma: "venio",
          gloss: "came",
          morphology: {
            partOfSpeech: "verb",
            tense: "perfect",
            number: "singular",
            person: "third",
          },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a14",
          surface: "litora",
          normalized: "litora",
          lemma: "litus",
          gloss: "shore",
          morphology: {
            partOfSpeech: "noun",
            case: "accusative",
            number: "plural",
            gender: "neuter",
          },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
    {
      id: "aen3",
      translation: "O Muse, recall to me the causes — by what divine will harmed, or what grieving, the queen of the gods drove a man remarkable for piety to endure so many misfortunes.",
      tokens: [
        {
          id: "a15",
          surface: "Musa",
          normalized: "musa",
          lemma: "Musa",
          gloss: "Muse",
          morphology: { partOfSpeech: "noun", case: "vocative", number: "singular", gender: "feminine" },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a16",
          surface: "mihi",
          normalized: "mihi",
          lemma: "ego",
          gloss: "to me",
          morphology: { partOfSpeech: "pronoun", case: "dative", number: "singular", person: "first" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a17",
          surface: "causas",
          normalized: "causas",
          lemma: "causa",
          gloss: "causes, reasons",
          morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "feminine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a18",
          surface: "memora",
          normalized: "memora",
          lemma: "memoro",
          gloss: "recall, tell",
          morphology: { partOfSpeech: "verb", mood: "imperative", tense: "present", voice: "active" },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a19",
          surface: "quō",
          normalized: "quo",
          lemma: "qui",
          gloss: "by what",
          morphology: { partOfSpeech: "pronoun", case: "ablative", number: "singular", gender: "neuter" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a20",
          surface: "numine",
          normalized: "numine",
          lemma: "numen",
          gloss: "divine will",
          morphology: { partOfSpeech: "noun", case: "ablative", number: "singular", gender: "neuter" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a21",
          surface: "laesō",
          normalized: "laeso",
          lemma: "laedo",
          gloss: "having been harmed",
          morphology: { partOfSpeech: "verb", case: "ablative", number: "singular", gender: "neuter", tense: "perfect" },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a22",
          surface: "quidve",
          normalized: "quidve",
          lemma: "quis",
          gloss: "or what",
          morphology: { partOfSpeech: "pronoun", case: "nominative", number: "singular", gender: "neuter" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a23",
          surface: "dolens",
          normalized: "dolens",
          lemma: "doleo",
          gloss: "grieving",
          morphology: { partOfSpeech: "verb", tense: "present", voice: "active" },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a24",
          surface: "rēgīna",
          normalized: "regina",
          lemma: "regina",
          gloss: "queen",
          morphology: { partOfSpeech: "noun", case: "nominative", number: "singular", gender: "feminine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a25",
          surface: "deum",
          normalized: "deum",
          lemma: "deus",
          gloss: "of the gods",
          morphology: { partOfSpeech: "noun", case: "genitive", number: "plural", gender: "masculine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a26",
          surface: "tot",
          normalized: "tot",
          lemma: "tot",
          gloss: "so many",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a27",
          surface: "volvere",
          normalized: "volvere",
          lemma: "volvo",
          gloss: "to undergo, to roll",
          morphology: { partOfSpeech: "verb", tense: "present", voice: "active" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a28",
          surface: "cāsūs",
          normalized: "casus",
          lemma: "casus",
          gloss: "misfortunes",
          morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "masculine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a29",
          surface: "īnsignem",
          normalized: "insignem",
          lemma: "insignis",
          gloss: "remarkable",
          morphology: { partOfSpeech: "adjective", case: "accusative", number: "singular", gender: "masculine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a30",
          surface: "pietāte",
          normalized: "pietate",
          lemma: "pietas",
          gloss: "piety, devotion",
          morphology: { partOfSpeech: "noun", case: "ablative", number: "singular", gender: "feminine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a31",
          surface: "virum",
          normalized: "virum",
          lemma: "vir",
          gloss: "man",
          morphology: { partOfSpeech: "noun", case: "accusative", number: "singular", gender: "masculine" },
          punctBefore: "",
          punctAfter: ", ",
        },
        {
          id: "a32",
          surface: "tot",
          normalized: "tot",
          lemma: "tot",
          gloss: "so many",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a33",
          surface: "adīre",
          normalized: "adire",
          lemma: "adeo",
          gloss: "to approach, to face",
          morphology: { partOfSpeech: "verb", tense: "present", voice: "active" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a34",
          surface: "labōrēs",
          normalized: "labores",
          lemma: "labor",
          gloss: "hardships, labors",
          morphology: { partOfSpeech: "noun", case: "accusative", number: "plural", gender: "masculine" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "a35",
          surface: "impulerit",
          normalized: "impulerit",
          lemma: "impello",
          gloss: "drove, impelled",
          morphology: { partOfSpeech: "verb", tense: "perfect", voice: "active", mood: "subjunctive", person: "third", number: "singular" },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
  ],
};

export const PSALM_23_1: TextSection = {
  id: "Ps-23-1",
  textId: "Ps-23",
  sequence: 1,
  label: "Psalm 23",
  sentences: [
    {
      id: "p23-1",
      translation: "The Lord is my shepherd; I shall not want.",
      tokens: [
        {
          id: "p1",
          surface: "יְהוָה",
          normalized: "יהוה",
          lemma: "יְהוָה",
          gloss: "the Lord",
          morphology: { partOfSpeech: "proper noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p2",
          surface: "רֹעִ֫י",
          normalized: "רעי",
          lemma: "רָעָה",
          gloss: "my shepherd",
          morphology: { partOfSpeech: "verb", tense: "participle" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p3",
          surface: "לֹא",
          normalized: "לא",
          lemma: "לֹא",
          gloss: "not",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p4",
          surface: "אֶחְסָֽר",
          normalized: "אחסר",
          lemma: "חָסֵר",
          gloss: "I will want",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: "׃",
        },
      ],
    },
    {
      id: "p23-2",
      translation: "He makes me lie down in green pastures; He leads me beside quiet waters.",
      tokens: [
        {
          id: "p5",
          surface: "נָאוֹת",
          normalized: "נאות",
          lemma: "נָוָה",
          gloss: "pastures",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p6",
          surface: "דֶּשֶׁא",
          normalized: "דשא",
          lemma: "דֶּשֶׁא",
          gloss: "green",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p7",
          surface: "יַרְבִּיצֵנִי",
          normalized: "ירבצני",
          lemma: "רָבַץ",
          gloss: "he makes me lie down",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p8",
          surface: "עַל",
          normalized: "על",
          lemma: "עַל",
          gloss: "upon, beside",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p9",
          surface: "מֵי",
          normalized: "מי",
          lemma: "מַיִם",
          gloss: "waters",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p10",
          surface: "מְנוּחוֹת",
          normalized: "מנוחות",
          lemma: "מְנוּחָה",
          gloss: "rest, quiet",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "p11",
          surface: "יְנַהֲלֵנִי",
          normalized: "ינהלני",
          lemma: "נָהַל",
          gloss: "he leads me",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: "׃",
        },
      ],
    },
  ],
};

export const GENESIS_1: TextSection = {
  id: "Gen-1",
  textId: "Gen",
  sequence: 1,
  label: "Genesis 1",
  sentences: [
    {
      id: "g-1",
      translation: "In the beginning God created the heavens and the earth.",
      tokens: [
        {
          id: "g1",
          surface: "בְּ",
          normalized: "ב",
          lemma: "בְּ",
          gloss: "in",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: "",
          head: 1, deprel: "case", treebankSource: "BHSA",
        },
        {
          id: "g2",
          surface: "רֵאשִׁית",
          normalized: "ראשית",
          lemma: "רֵאשִׁית",
          gloss: "beginning",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "obl", treebankSource: "BHSA",
        },
        {
          id: "g3",
          surface: "בָּרָא",
          normalized: "ברא",
          lemma: "בָּרָא",
          gloss: "created",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
          head: -1, deprel: "root", treebankSource: "BHSA",
        },
        {
          id: "g4",
          surface: "אֱלֹהִים",
          normalized: "אלהים",
          lemma: "אֱלֹהִים",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "nsubj", treebankSource: "BHSA",
        },
        {
          id: "g4b",
          surface: "אֵת",
          normalized: "את",
          lemma: "אֵת",
          gloss: "(direct object marker)",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
          head: 5, deprel: "case", treebankSource: "BHSA",
        },
        {
          id: "g4c",
          surface: "הַשָּׁמַיִם",
          normalized: "השמים",
          lemma: "שָׁמַיִם",
          gloss: "heavens",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "obj", treebankSource: "BHSA",
        },
        {
          id: "g4d",
          surface: "וְאֵת",
          normalized: "ואת",
          lemma: "אֵת",
          gloss: "and (direct object marker)",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
          head: 7, deprel: "cc", treebankSource: "BHSA",
        },
        {
          id: "g4e",
          surface: "הָאָרֶץ",
          normalized: "הארץ",
          lemma: "אֶרֶץ",
          gloss: "earth",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
          head: 5, deprel: "conj", treebankSource: "BHSA",
        },
      ],
    },
    {
      id: "g-2",
      translation: "Now the earth was formless and empty, and darkness was over the face of the deep.",
      tokens: [
        {
          id: "g5",
          surface: "וְ",
          normalized: "ו",
          lemma: "וְ",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: "",
          head: 3, deprel: "cc", treebankSource: "BHSA",
        },
        {
          id: "g6",
          surface: "הָ",
          normalized: "ה",
          lemma: "הַ",
          gloss: "the",
          morphology: { partOfSpeech: "article" },
          punctBefore: "",
          punctAfter: "",
          head: 2, deprel: "det", treebankSource: "BHSA",
        },
        {
          id: "g7",
          surface: "אָרֶץ",
          normalized: "ארץ",
          lemma: "אֶרֶץ",
          gloss: "earth",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "nsubj", treebankSource: "BHSA",
        },
        {
          id: "g8",
          surface: "הָיְתָה",
          normalized: "היתה",
          lemma: "הָיָה",
          gloss: "was",
          morphology: { partOfSpeech: "verb" },
          punctBefore: "",
          punctAfter: " ",
          head: -1, deprel: "root", treebankSource: "BHSA",
        },
        {
          id: "g9",
          surface: "תֹהוּ",
          normalized: "תהו",
          lemma: "תֹּהוּ",
          gloss: "formless",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 3, deprel: "xcomp", treebankSource: "BHSA",
        },
        {
          id: "g10",
          surface: "וָ",
          normalized: "ו",
          lemma: "וְ",
          gloss: "and",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: "",
          head: 6, deprel: "cc", treebankSource: "BHSA",
        },
        {
          id: "g11",
          surface: "בֹהוּ",
          normalized: "בהו",
          lemma: "בֹּהוּ",
          gloss: "empty",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
          head: 4, deprel: "conj", treebankSource: "BHSA",
        },
      ],
    },
    {
      id: "g-3",
      translation: "And God said, 'Let there be light,' and there was light.",
      tokens: [
        {
          id: "g12",
          surface: "וַיֹּאמֶר",
          normalized: "ויאמר",
          lemma: "אָמַר",
          gloss: "and he said",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
          head: -1, deprel: "root", treebankSource: "BHSA",
        },
        {
          id: "g13",
          surface: "אֱלֹהִים",
          normalized: "אלהים",
          lemma: "אֱלֹהִים",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 0, deprel: "nsubj", treebankSource: "BHSA",
        },
        {
          id: "g14",
          surface: "יְהִי",
          normalized: "יהי",
          lemma: "הָיָה",
          gloss: "let there be",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
          head: 0, deprel: "ccomp", treebankSource: "BHSA",
        },
        {
          id: "g15",
          surface: "אוֹר",
          normalized: "אור",
          lemma: "אוֹר",
          gloss: "light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
          head: 2, deprel: "nsubj", treebankSource: "BHSA",
        },
        {
          id: "g16",
          surface: "וַיְהִי",
          normalized: "ויהי",
          lemma: "הָיָה",
          gloss: "and there was",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
          head: 0, deprel: "conj", treebankSource: "BHSA",
        },
        {
          id: "g17",
          surface: "אוֹר",
          normalized: "אור",
          lemma: "אוֹר",
          gloss: "light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
          head: 4, deprel: "nsubj", treebankSource: "BHSA",
        },
      ],
    },
    {
      id: "g-4",
      translation: "God saw that the light was good, and He separated the light from the darkness.",
      tokens: [
        {
          id: "g18",
          surface: "וַיַּרְא",
          normalized: "וירא",
          lemma: "רָאָה",
          gloss: "and he saw",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g19",
          surface: "אֱלֹהִים",
          normalized: "אלהים",
          lemma: "אֱלֹהִים",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g20",
          surface: "אֶת",
          normalized: "את",
          lemma: "אֵת",
          gloss: "(object marker)",
          morphology: { partOfSpeech: "particle" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g21",
          surface: "הָאוֹר",
          normalized: "האור",
          lemma: "אוֹר",
          gloss: "the light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g22",
          surface: "כִּי",
          normalized: "כי",
          lemma: "כִּי",
          gloss: "that",
          morphology: { partOfSpeech: "conjunction" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g23",
          surface: "טוֹב",
          normalized: "טוב",
          lemma: "טוֹב",
          gloss: "good",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g24",
          surface: "וַיַּבְדֵּל",
          normalized: "ויבדל",
          lemma: "בָּדַל",
          gloss: "and he separated",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g25",
          surface: "אֱלֹהִים",
          normalized: "אלהים",
          lemma: "אֱלֹהִים",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g26",
          surface: "בֵּין",
          normalized: "בין",
          lemma: "בֵּין",
          gloss: "between",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g27",
          surface: "הָאוֹר",
          normalized: "האור",
          lemma: "אוֹר",
          gloss: "the light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g28",
          surface: "וּבֵין",
          normalized: "ובין",
          lemma: "בֵּין",
          gloss: "and between",
          morphology: { partOfSpeech: "preposition" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g29",
          surface: "הַחֹשֶׁךְ",
          normalized: "החשך",
          lemma: "חֹשֶׁךְ",
          gloss: "the darkness",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
    {
      id: "g-5",
      translation: "God called the light 'day,' and the darkness He called 'night.' And there was evening and there was morning, the first day.",
      tokens: [
        {
          id: "g30",
          surface: "וַיִּקְרָא",
          normalized: "ויקרא",
          lemma: "קָרָא",
          gloss: "and he called",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g31",
          surface: "אֱלֹהִים",
          normalized: "אלהים",
          lemma: "אֱלֹהִים",
          gloss: "God",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g32",
          surface: "לָאוֹר",
          normalized: "לאור",
          lemma: "אוֹר",
          gloss: "to the light",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g33",
          surface: "יוֹם",
          normalized: "יום",
          lemma: "יוֹם",
          gloss: "day",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g34",
          surface: "וְלַחֹשֶׁךְ",
          normalized: "ולחשך",
          lemma: "חֹשֶׁךְ",
          gloss: "and to the darkness",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g35",
          surface: "קָרָא",
          normalized: "קרא",
          lemma: "קָרָא",
          gloss: "he called",
          morphology: { partOfSpeech: "verb", tense: "perfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g36",
          surface: "לָיְלָה",
          normalized: "לילה",
          lemma: "לַיְלָה",
          gloss: "night",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g37",
          surface: "וַיְהִי",
          normalized: "ויהי",
          lemma: "הָיָה",
          gloss: "and there was",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g38",
          surface: "עֶרֶב",
          normalized: "ערב",
          lemma: "עֶרֶב",
          gloss: "evening",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g39",
          surface: "וַיְהִי",
          normalized: "ויהי",
          lemma: "הָיָה",
          gloss: "and there was",
          morphology: { partOfSpeech: "verb", tense: "imperfect" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g40",
          surface: "בֹקֶר",
          normalized: "בקר",
          lemma: "בֹּקֶר",
          gloss: "morning",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g41",
          surface: "יוֹם",
          normalized: "יום",
          lemma: "יוֹם",
          gloss: "day",
          morphology: { partOfSpeech: "noun" },
          punctBefore: "",
          punctAfter: " ",
        },
        {
          id: "g42",
          surface: "אֶחָד",
          normalized: "אחד",
          lemma: "אֶחָד",
          gloss: "one",
          morphology: { partOfSpeech: "adjective" },
          punctBefore: "",
          punctAfter: ".",
        },
      ],
    },
  ],
};

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

type SplitPart = 1 | 2;

const SECTION_PREVIEW_OVERRIDES: Record<string, { id: string; label: string }[]> = {};

const SECTION_SPLITS: Record<string, { base: TextSection; part: SplitPart; label: string }> = {
  "Cop-Jn-1-1": { base: COPTIC_JOHN_1_1, part: 1, label: "John 1 (Part 1)" },
  "Cop-Jn-1-2": { base: COPTIC_JOHN_1_1, part: 2, label: "John 1 (Part 2)" },
  "Arc-Gen-1-1": { base: ARAMAIC_GENESIS_1_1, part: 1, label: "Genesis 1 (Part 1)" },
  "Arc-Gen-1-2": { base: ARAMAIC_GENESIS_1_1, part: 2, label: "Genesis 1 (Part 2)" },
  "San-Gita-1-1": { base: SANSKRIT_GITA_1_1, part: 1, label: "Chapter 1 (Part 1)" },
  "San-Gita-1-2": { base: SANSKRIT_GITA_1_1, part: 2, label: "Chapter 1 (Part 2)" },
  "Egy-Ptah-1-1": { base: EGYPTIAN_PTAHHOTEP_1_1, part: 1, label: "Maxim 1 (Part 1)" },
  "Egy-Ptah-1-2": { base: EGYPTIAN_PTAHHOTEP_1_1, part: 2, label: "Maxim 1 (Part 2)" },
};

const splitTextSection = (base: TextSection, id: string, label: string, part: SplitPart): TextSection => {
  let sentences: TextSection['sentences'];

  if (base.sentences.length > 1) {
    const midpoint = Math.max(1, Math.ceil(base.sentences.length / 2));
    sentences = part === 1 ? base.sentences.slice(0, midpoint) : base.sentences.slice(midpoint);
  } else {
    const sentence = base.sentences[0];
    const midpoint = Math.max(1, Math.ceil(sentence.tokens.length / 2));
    const tokens = part === 1 ? sentence.tokens.slice(0, midpoint) : sentence.tokens.slice(midpoint);
    sentences = [
      {
        ...sentence,
        id: `${sentence.id}-part-${part}`,
        tokens,
      },
    ];
  }

  return {
    ...base,
    id,
    label,
    sequence: part,
    sentences,
  };
};

const enhanceText = (text: Text): Text => {
  const sectionsPreview = SECTION_PREVIEW_OVERRIDES[text.id] || text.sectionsPreview;
  // Derive sentenceCount from the actual sections so the displayed count can never
  // drift from the real content (e.g. a text declaring 110 but loading only 26).
  const derived = (sectionsPreview || []).reduce(
    (sum, p) => sum + (CorpusDB.getSection(p.id)?.sentences.length ?? 0),
    0
  );
  return {
    ...text,
    sectionsPreview,
    sentenceCount: derived || text.sentenceCount,
  };
};

import { getMockTexts, getMockSections } from "./mockTexts.js";
import { ALL_EXPANDED_SECTIONS } from "./corpus/expanded-sections.js";
import { ALL_TREEBANK_SECTIONS } from "./corpus/treebank-sections.js";
import { CICERO_CATILINA_1, CICERO_CATILINA_2, CICERO_CATILINA_3, CICERO_CATILINA_4 } from "./corpus/cicero-catilina.js";
import { OVID_METAMORPHOSES_1, OVID_METAMORPHOSES_2, OVID_METAMORPHOSES_3, OVID_METAMORPHOSES_4 } from "./corpus/ovid-metamorphoses.js";
import { CAESAR_BELLUM_GALLICUM_1, CAESAR_BELLUM_GALLICUM_2, CAESAR_BELLUM_GALLICUM_3, CAESAR_BELLUM_GALLICUM_4 } from "./corpus/caesar-bellum-gallicum.js";
import { PLATO_APOLOGY_1, PLATO_APOLOGY_2, PLATO_APOLOGY_3, PLATO_APOLOGY_4, PLATO_APOLOGY_5 } from "./corpus/plato-apology.js";
import { LXX_GENESIS_1_1, LXX_GENESIS_1_2, LXX_PSALM_1_1, LXX_PSALM_33_1, LXX_EXODUS_12_1, LXX_ISAIAH_6_1, LXX_PROVERBS_1_1, LXX_PSALM_50_1, LXX_JONAH_1_1 } from "./corpus/lxx-septuagint.js";
import { CLEMENT_1, DIDACHE_1, DIDACHE_2, ATHANASIUS_INCARNATION_1, CHRYSOSTOM_HOMILY_1, HERMAS_VISION_1, BASIL_HEXAEMERON_1, IGNATIUS_EPHESIANS_1, JUSTIN_MARTYR_APOLOGY_1, POLYCARP_PHILIPPIANS_1 } from "./corpus/patristics.js";
import { ALL_GREEK_MINI_STORIES, GRC_MINI_1, GRC_MINI_2, GRC_MINI_3, GRC_MINI_4, GRC_MINI_5 } from "./corpus/greek-mini-stories.js";
import { ALL_GREEK_MINI_STORIES_2, GRC_MINI_6, GRC_MINI_7, GRC_MINI_8, GRC_MINI_9, GRC_MINI_10 } from "./corpus/greek-mini-stories-2.js";
import { ALL_LATIN_BEGINNER_SECTIONS, LAT_VULGATE_JOHN_1, LAT_DISTICHA_CATONIS } from "./corpus/latin-beginner.js";
import { ALL_LATIN_MINI_STORIES, LAT_MINI_1, LAT_MINI_2, LAT_MINI_3, LAT_MINI_4, LAT_MINI_5 } from "./corpus/latin-mini-stories.js";
import { ALL_LATIN_MINI_STORIES_2, LAT_MINI_6, LAT_MINI_7, LAT_MINI_8, LAT_MINI_9, LAT_MINI_10 } from "./corpus/latin-mini-stories-2.js";
import {
  ALL_MULTILANG_MINI_STORIES,
  HEB_MINI_1, HEB_MINI_2, ARC_MINI_1, SYR_MINI_1, COP_MINI_1, SAN_MINI_1
} from "./corpus/multilang-mini-stories.js";
import { ALL_HEBREW_BEGINNER_SECTIONS, HEB_JONAH_1, HEB_JONAH_2, HEB_JONAH_3, HEB_JONAH_4, HEB_PSALM_91 } from "./corpus/hebrew-beginner.js";
import { ALL_HEBREW_EXTENDED_SECTIONS, HEB_GENESIS_1, HEB_GENESIS_2, HEB_GENESIS_3, HEB_PSALM_23 } from "./corpus/hebrew-extended.js";
import { ALL_GREEK_MARK_SECTIONS, GRC_MARK_1A, GRC_MARK_1B } from "./corpus/greek-mark.js";
import { TEXT_MATTHEW_FULL, TEXT_MARK_FULL, TEXT_LUKE_FULL } from "./corpus/synoptic-gospels-full.js";
import { ALL_NT_FULL_TEXTS } from "./corpus/nt-full.js";
import { ALL_PESHITTA_FULL_TEXTS } from "./corpus/peshitta-full.js";
import { ALL_LATIN_FATHERS_FULL_TEXTS } from "./corpus/latin-fathers-full.js";
import { ALL_LXX_FULL_TEXTS } from "./corpus/lxx-full.js";
import { ALL_GREEK_CLASSICS_FULL_TEXTS } from "./corpus/greek-classics-full.js";
import { ALL_LATIN_CLASSICS_FULL_TEXTS } from "./corpus/latin-classics-full.js";
import { ALL_PATRISTICS_FULL_TEXTS } from "./corpus/patristics-full.js";
import { ALL_HEBREW_BIBLE_FULL_TEXTS } from "./corpus/hebrew-bible-full.js";
import { ALL_ANE_FULL_TEXTS } from "./corpus/ane-full.js";
import { ALL_LATIN_CLASSICS_SECTIONS, LAT_HORACE_ODES_1_1, LAT_HORACE_ODES_1_9, LAT_HORACE_ODES_1_11, LAT_LIVY_PRAEF, LAT_LIVY_1_1, LAT_SALLUST_CAT, LAT_TACITUS_ANN } from "./corpus/latin-classics.js";
import { ALL_GREEK_CLASSICS_SECTIONS, GRC_HERODOTUS_1, GRC_THUCYDIDES_1, GRC_SOPHOCLES_ANT, GRC_PLUTARCH_ALEX, GRC_LUCIAN_CHARON } from "./corpus/greek-classics.js";
import { ALL_GREEK_NT_EXTENDED_SECTIONS } from "./corpus/greek-nt-extended.js";
import { ALL_GREEK_CLASSICS_EXTENDED_SECTIONS } from "./corpus/greek-classics-extended.js";
import { ALL_LATIN_EXTENDED_SECTIONS } from "./corpus/latin-extended.js";
import { TEXT_VOCAB_GRC, TEXT_VOCAB_GRC_KOINE, TEXT_VOCAB_LAT, GRC_VOCAB_SECTION, GRC_KOINE_VOCAB_SECTION, LAT_VOCAB_SECTION, TEXT_VOCAB_HEB, HEB_VOCAB_SECTION, TEXT_VOCAB_SYR, SYR_VOCAB_SECTION, TEXT_VOCAB_COP, COP_VOCAB_SECTION, TEXT_VOCAB_ARC, ARC_VOCAB_SECTION, TEXT_VOCAB_AKK, AKK_VOCAB_SECTION, TEXT_VOCAB_HIT, HIT_VOCAB_SECTION, TEXT_VOCAB_UGA, UGA_VOCAB_SECTION, TEXT_VOCAB_SAN, SAN_VOCAB_SECTION, TEXT_VOCAB_EGY, EGY_VOCAB_SECTION } from "./corpus/vocabulary-texts.js";
import { ALL_HEBREW_EXTENDED_2_SECTIONS } from "./corpus/hebrew-extended-2.js";
import { ALL_SYRIAC_EXTENDED_SECTIONS } from "./corpus/syriac-extended.js";
import { ALL_COPTIC_EXTENDED_SECTIONS } from "./corpus/coptic-extended.js";
import { ALL_ARAMAIC_EXTENDED_SECTIONS } from "./corpus/aramaic-extended.js";
import { ALL_AKKADIAN_EXTENDED_SECTIONS } from "./corpus/akkadian-extended.js";
import { ALL_HITTITE_EXTENDED_SECTIONS } from "./corpus/hittite-extended.js";
import { ALL_UGARITIC_EXTENDED_SECTIONS } from "./corpus/ugaritic-extended.js";
import { ALL_SANSKRIT_EXTENDED_SECTIONS } from "./corpus/sanskrit-extended.js";
import { ALL_EGYPTIAN_EXTENDED_SECTIONS } from "./corpus/egyptian-extended.js";

// Module-level caches — corpus data is static at runtime
let _textsCache: ReturnType<typeof enhanceText>[] | null = null;
let _textByIdCache: Map<string, ReturnType<typeof enhanceText>> | null = null;
let _lemmaIndexCache: Map<string, Array<{ sentence: any; sectionId: string; textId: string }>> | null = null;


function getAllEnhancedTexts() {
  if (!_textsCache) {
    _textsCache = [
      TEXT_MATTHEW_FULL,
      TEXT_MARK_FULL,
      TEXT_LUKE_FULL,
      TEXT_JOHN_FULL,
      ...ALL_NT_FULL_TEXTS,
      ...ALL_PESHITTA_FULL_TEXTS,
      ...ALL_LATIN_FATHERS_FULL_TEXTS,
      ...ALL_LXX_FULL_TEXTS,
      ...ALL_GREEK_CLASSICS_FULL_TEXTS,
      ...ALL_LATIN_CLASSICS_FULL_TEXTS,
      ...ALL_PATRISTICS_FULL_TEXTS,
      ...ALL_HEBREW_BIBLE_FULL_TEXTS,
      ...ALL_ANE_FULL_TEXTS,
      TEXT_GENESIS,
      TEXT_AENEID_1,
      TEXT_PSALM_23,
      TEXT_SYRIAC_JOHN,
      TEXT_COPTIC_JOHN,
      TEXT_ARAMAIC_GENESIS,
      TEXT_AKKADIAN_GILGAMESH,
      TEXT_AKKADIAN_GILGAMESH_FULL,
      TEXT_HAMMURABI_CODE,
      TEXT_SANSKRIT_GITA,
      TEXT_HITTITE_ANNALS,
      TEXT_EGYPTIAN_PTAHHOTEP,
      TEXT_UGARITIC_BAAL,
      TEXT_ANABASIS,
      TEXT_ILIAD,
      TEXT_ODYSSEY,
      TEXT_AESOP,
      TEXT_LXX_GENESIS,
      TEXT_LXX_PSALM_1,
      TEXT_LXX_PSALM_33,
      TEXT_LXX_EXODUS_12,
      TEXT_LXX_ISAIAH_6,
      TEXT_LXX_PROVERBS,
      TEXT_LXX_PSALM_50,
      TEXT_LXX_JONAH,
      TEXT_1_CLEMENT,
      TEXT_DIDACHE,
      TEXT_ATHANASIUS_INCARNATION,
      TEXT_CHRYSOSTOM_HOMILY,
      TEXT_HERMAS,
      TEXT_BASIL,
      // Beginner texts
      TEXT_GRC_MINI_STORIES,
      TEXT_LAT_MINI_STORIES,
      TEXT_LAT_VG_JOHN,
      TEXT_LAT_CATO,
      TEXT_HEB_MINI_STORIES,
      TEXT_ARC_MINI_STORIES,
      TEXT_SYR_MINI_STORIES,
      TEXT_COP_MINI_STORIES,
      TEXT_SAN_MINI_STORIES,
      TEXT_HEB_GENESIS,
      TEXT_HEB_PS23,
      TEXT_HEB_JONAH,
      TEXT_HEB_PS91,
      TEXT_HEB_RUTH,
      // Patristics additions
      TEXT_IGNATIUS,
      TEXT_JUSTIN_MARTYR,
      TEXT_POLYCARP,
      // Latin classics
      TEXT_HORACE_ODES,
      TEXT_LIVY,
      TEXT_SALLUST,
      TEXT_TACITUS,
      // Ancient Greek classics
      TEXT_HERODOTUS,
      TEXT_THUCYDIDES,
      TEXT_SOPHOCLES,
      TEXT_PLUTARCH,
      TEXT_LUCIAN,
      // Classical authors (curated multi-section readings)
      TEXT_CAESAR_BG,
      TEXT_CICERO_CATILINA,
      TEXT_OVID_METAMORPHOSES,
      TEXT_PLATO_APOLOGY,
      // Greco-Roman extended
      TEXT_VOCAB_GRC,
      TEXT_VOCAB_GRC_KOINE,
      TEXT_VOCAB_LAT,
      TEXT_VOCAB_HEB,
      TEXT_VOCAB_SYR,
      TEXT_VOCAB_COP,
      TEXT_VOCAB_ARC,
      TEXT_VOCAB_AKK,
      TEXT_VOCAB_HIT,
      TEXT_VOCAB_UGA,
      TEXT_VOCAB_SAN,
      TEXT_VOCAB_EGY,
      ...(typeof import.meta !== 'undefined' && import.meta.env?.DEV ? getMockTexts() : [])
    ].map(enhanceText);
  }
  return _textsCache;
}

function getTextByIdMap() {
  if (!_textByIdCache) {
    _textByIdCache = new Map(getAllEnhancedTexts().map(t => [t.id, t]));
  }
  return _textByIdCache;
}

function getLemmaIndex() {
  if (_lemmaIndexCache) return _lemmaIndexCache;
  const index = new Map<string, Array<{ sentence: any; sectionId: string; textId: string }>>();
  const allSections = [
    JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1, SYRIAC_JOHN_1_1,
    COPTIC_JOHN_1_1, ARAMAIC_GENESIS_1_1, AKKADIAN_GILGAMESH_1_1,
    SANSKRIT_GITA_1_1, HITTITE_ANNALS_1_1, EGYPTIAN_PTAHHOTEP_1_1,
    ANABASIS_1_1, ILIAD_1_1, ODYSSEY_1_1, AESOP_1_1,
    CICERO_CATILINA_1, CICERO_CATILINA_2, CICERO_CATILINA_3, CICERO_CATILINA_4,
    OVID_METAMORPHOSES_1, OVID_METAMORPHOSES_2, OVID_METAMORPHOSES_3, OVID_METAMORPHOSES_4,
    CAESAR_BELLUM_GALLICUM_1, CAESAR_BELLUM_GALLICUM_2, CAESAR_BELLUM_GALLICUM_3, CAESAR_BELLUM_GALLICUM_4,
    PLATO_APOLOGY_1, PLATO_APOLOGY_2, PLATO_APOLOGY_3, PLATO_APOLOGY_4, PLATO_APOLOGY_5,
    LXX_GENESIS_1_1, LXX_GENESIS_1_2, LXX_PSALM_1_1, LXX_PSALM_33_1, LXX_EXODUS_12_1, LXX_ISAIAH_6_1, LXX_PROVERBS_1_1, LXX_PSALM_50_1, LXX_JONAH_1_1,
    CLEMENT_1, DIDACHE_1, DIDACHE_2, ATHANASIUS_INCARNATION_1, CHRYSOSTOM_HOMILY_1, HERMAS_VISION_1, BASIL_HEXAEMERON_1,
    ...ALL_EXPANDED_SECTIONS,
    ...ALL_TREEBANK_SECTIONS,
    ...ALL_GREEK_MINI_STORIES,
    ...ALL_GREEK_MINI_STORIES_2,
    ...ALL_GREEK_MARK_SECTIONS,
    ...ALL_LATIN_MINI_STORIES,
    ...ALL_LATIN_MINI_STORIES_2,
    ...ALL_MULTILANG_MINI_STORIES,
    ...ALL_LATIN_BEGINNER_SECTIONS,
    ...ALL_HEBREW_EXTENDED_SECTIONS,
    ...ALL_HEBREW_BEGINNER_SECTIONS,
    ...ALL_LATIN_CLASSICS_SECTIONS,
    ...ALL_GREEK_CLASSICS_SECTIONS,
    ...ALL_GREEK_NT_EXTENDED_SECTIONS,
    ...ALL_GREEK_CLASSICS_EXTENDED_SECTIONS,
    ...ALL_LATIN_EXTENDED_SECTIONS,
    ...ALL_HEBREW_EXTENDED_2_SECTIONS,
    ...ALL_SYRIAC_EXTENDED_SECTIONS,
    ...ALL_COPTIC_EXTENDED_SECTIONS,
    ...ALL_ARAMAIC_EXTENDED_SECTIONS,
    ...ALL_AKKADIAN_EXTENDED_SECTIONS,
    ...ALL_HITTITE_EXTENDED_SECTIONS,
    ...ALL_UGARITIC_EXTENDED_SECTIONS,
    ...ALL_SANSKRIT_EXTENDED_SECTIONS,
    ...ALL_EGYPTIAN_EXTENDED_SECTIONS,
    GRC_VOCAB_SECTION,
    GRC_KOINE_VOCAB_SECTION,
    LAT_VOCAB_SECTION,
    HEB_VOCAB_SECTION,
    SYR_VOCAB_SECTION,
    COP_VOCAB_SECTION,
    ARC_VOCAB_SECTION,
    AKK_VOCAB_SECTION,
    HIT_VOCAB_SECTION,
    UGA_VOCAB_SECTION,
    SAN_VOCAB_SECTION,
    EGY_VOCAB_SECTION,
    ...(import.meta.env.DEV ? getMockSections() : [])
  ];
  for (const section of allSections) {
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        if (!token.lemma) continue;
        const entry = { sentence, sectionId: section.id, textId: (section as any).textId };
        const existing = index.get(token.lemma);
        if (existing) existing.push(entry);
        else index.set(token.lemma, [entry]);
      }
    }
  }
  _lemmaIndexCache = index;
  return index;
}

export const CorpusDB = {
  getTexts: () => getAllEnhancedTexts(),
  getTextsByLanguage: (langId: string) => getAllEnhancedTexts().filter((t) => t.language === langId),
  getText: (id: string) => getTextByIdMap().get(id),
  getSection: (sectionId: string) => {
    const split = SECTION_SPLITS[sectionId];
    if (split) return splitTextSection(split.base, sectionId, split.label, split.part);

    if (sectionId === "Jn-1-1") return JOHN_1_1;
    if (sectionId === "Gen-1") return GENESIS_1;
    if (sectionId === "Aen-1-1") return AENEID_1_1;
    if (sectionId === "Ps-23-1") return PSALM_23_1;
    if (sectionId === "Syr-Jn-1-1") return SYRIAC_JOHN_1_1;
    if (sectionId === "Syr-Jn-1-2") return SYRIAC_JOHN_1_2;
    if (sectionId === "Syr-Jn-1-3") return SYRIAC_JOHN_1_3;
    if (sectionId === "Cop-Jn-1-1") return COPTIC_JOHN_1_1;
    if (sectionId === "Arc-Gen-1-1") return ARAMAIC_GENESIS_1_1;
    if (sectionId === "Akk-Gilg-1-1") return AKKADIAN_GILGAMESH_1_1;
    if (sectionId === "Akk-Gilg-1-2") return AKKADIAN_GILGAMESH_1_2;
    if (sectionId === "Akk-Gilg-1-3") return AKKADIAN_GILGAMESH_1_3;
    if (sectionId === "San-Gita-1-1") return SANSKRIT_GITA_1_1;
    if (sectionId === "Hit-Annals-1-1") return HITTITE_ANNALS_1_1;
    if (sectionId === "Hit-Annals-1-2") return HITTITE_ANNALS_1_2;
    if (sectionId === "Hit-Annals-1-3") return HITTITE_ANNALS_1_3;
    if (sectionId === "Egy-Ptah-1-1") return EGYPTIAN_PTAHHOTEP_1_1;
    if (sectionId === "Uga-Baal-1-1") return UGARITIC_BAAL_1_1;
    if (sectionId === "Uga-Baal-1-2") return UGARITIC_BAAL_1_2;
    if (sectionId === "LXX-Gen-1-1") return LXX_GENESIS_1_1;
    if (sectionId === "LXX-Gen-1-2") return LXX_GENESIS_1_2;
    if (sectionId === "LXX-Ps-1-1") return LXX_PSALM_1_1;
    if (sectionId === "LXX-Ps-33-1") return LXX_PSALM_33_1;
    if (sectionId === "LXX-Exod-12-1") return LXX_EXODUS_12_1;
    if (sectionId === "LXX-Isa-6-1") return LXX_ISAIAH_6_1;
    if (sectionId === "LXX-Prov-1-1") return LXX_PROVERBS_1_1;
    if (sectionId === "LXX-Ps-50-1") return LXX_PSALM_50_1;
    if (sectionId === "LXX-Jonah-1-1") return LXX_JONAH_1_1;
    if (sectionId === "1Clem-1") return CLEMENT_1;
    if (sectionId === "Did-1") return DIDACHE_1;
    if (sectionId === "Did-2") return DIDACHE_2;
    if (sectionId === "Athan-Inc-1") return ATHANASIUS_INCARNATION_1;
    if (sectionId === "Chrys-Jn-1") return CHRYSOSTOM_HOMILY_1;
    if (sectionId === "Hermas-Vis-1") return HERMAS_VISION_1;
    if (sectionId === "Basil-Hex-1") return BASIL_HEXAEMERON_1;
    if (sectionId === "Anab-1-1") return ANABASIS_1_1;
    if (sectionId === "Iliad-1-1") return ILIAD_1_1;
    if (sectionId === "Odyssey-1-1") return ODYSSEY_1_1;
    if (sectionId === "Aesop-1-1") return AESOP_1_1;
    if (sectionId === "Cic-Cat-1") return CICERO_CATILINA_1;
    if (sectionId === "Cic-Cat-2") return CICERO_CATILINA_2;
    if (sectionId === "Cic-Cat-3") return CICERO_CATILINA_3;
    if (sectionId === "Cic-Cat-4") return CICERO_CATILINA_4;
    if (sectionId === "Ovid-Met-1") return OVID_METAMORPHOSES_1;
    if (sectionId === "Ovid-Met-2") return OVID_METAMORPHOSES_2;
    if (sectionId === "Ovid-Met-3") return OVID_METAMORPHOSES_3;
    if (sectionId === "Ovid-Met-4") return OVID_METAMORPHOSES_4;
    if (sectionId === "Caes-BG-1") return CAESAR_BELLUM_GALLICUM_1;
    if (sectionId === "Caes-BG-2") return CAESAR_BELLUM_GALLICUM_2;
    if (sectionId === "Caes-BG-3") return CAESAR_BELLUM_GALLICUM_3;
    if (sectionId === "Caes-BG-4") return CAESAR_BELLUM_GALLICUM_4;
    if (sectionId === "Plato-Apol-1") return PLATO_APOLOGY_1;
    if (sectionId === "Plato-Apol-2") return PLATO_APOLOGY_2;
    if (sectionId === "Plato-Apol-3") return PLATO_APOLOGY_3;
    if (sectionId === "Plato-Apol-4") return PLATO_APOLOGY_4;
    if (sectionId === "Plato-Apol-5") return PLATO_APOLOGY_5;


    // Beginner sections
    if (sectionId === "GrcMini-1") return GRC_MINI_1;
    if (sectionId === "GrcMini-2") return GRC_MINI_2;
    if (sectionId === "GrcMini-3") return GRC_MINI_3;
    if (sectionId === "GrcMini-4") return GRC_MINI_4;
    if (sectionId === "GrcMini-5") return GRC_MINI_5;
    if (sectionId === "GrcMini-6") return GRC_MINI_6;
    if (sectionId === "GrcMini-7") return GRC_MINI_7;
    if (sectionId === "GrcMini-8") return GRC_MINI_8;
    if (sectionId === "GrcMini-9") return GRC_MINI_9;
    if (sectionId === "GrcMini-10") return GRC_MINI_10;
    if (sectionId === "GrcMk-1a") return GRC_MARK_1A;
    if (sectionId === "GrcMk-1b") return GRC_MARK_1B;
    if (sectionId === "LatMini-1") return LAT_MINI_1;
    if (sectionId === "LatMini-2") return LAT_MINI_2;
    if (sectionId === "LatMini-3") return LAT_MINI_3;
    if (sectionId === "LatMini-4") return LAT_MINI_4;
    if (sectionId === "LatMini-5") return LAT_MINI_5;
    if (sectionId === "LatMini-6") return LAT_MINI_6;
    if (sectionId === "LatMini-7") return LAT_MINI_7;
    if (sectionId === "LatMini-8") return LAT_MINI_8;
    if (sectionId === "LatMini-9") return LAT_MINI_9;
    if (sectionId === "LatMini-10") return LAT_MINI_10;
    if (sectionId === "HebMini-1") return HEB_MINI_1;
    if (sectionId === "HebMini-2") return HEB_MINI_2;
    if (sectionId === "ArcMini-1") return ARC_MINI_1;
    if (sectionId === "SyrMini-1") return SYR_MINI_1;
    if (sectionId === "CopMini-1") return COP_MINI_1;
    if (sectionId === "SanMini-1") return SAN_MINI_1;
    if (sectionId === "Lat-Vg-Jn-1") return LAT_VULGATE_JOHN_1;
    if (sectionId === "Lat-Cat-1") return LAT_DISTICHA_CATONIS;
    if (sectionId === "Heb-Gen-1") return HEB_GENESIS_1;
    if (sectionId === "Heb-Gen-2") return HEB_GENESIS_2;
    if (sectionId === "Heb-Gen-3") return HEB_GENESIS_3;
    if (sectionId === "Heb-Ps-23") return HEB_PSALM_23;
    if (sectionId === "Heb-Jon-1") return HEB_JONAH_1;
    if (sectionId === "Heb-Jon-2") return HEB_JONAH_2;
    if (sectionId === "Heb-Jon-3") return HEB_JONAH_3;
    if (sectionId === "Heb-Jon-4") return HEB_JONAH_4;
    if (sectionId === "Heb-Ps-91") return HEB_PSALM_91;
    // Patristics additions
    if (sectionId === "Ign-Eph-1") return IGNATIUS_EPHESIANS_1;
    if (sectionId === "Justin-Apol-1") return JUSTIN_MARTYR_APOLOGY_1;
    if (sectionId === "Polyc-Phil-1") return POLYCARP_PHILIPPIANS_1;
    // Latin classics
    if (sectionId === "Hor-1-1") return LAT_HORACE_ODES_1_1;
    if (sectionId === "Hor-1-9") return LAT_HORACE_ODES_1_9;
    if (sectionId === "Hor-1-11") return LAT_HORACE_ODES_1_11;
    if (sectionId === "Livy-Praef") return LAT_LIVY_PRAEF;
    if (sectionId === "Livy-1-1") return LAT_LIVY_1_1;
    if (sectionId === "Sall-Cat-1") return LAT_SALLUST_CAT;
    if (sectionId === "Tac-Ann-1") return LAT_TACITUS_ANN;
    // Ancient Greek classics
    if (sectionId === "Hdt-1-1") return GRC_HERODOTUS_1;
    if (sectionId === "Thuc-1-1") return GRC_THUCYDIDES_1;
    if (sectionId === "Soph-Ant-1") return GRC_SOPHOCLES_ANT;
    if (sectionId === "Plut-Alex-1") return GRC_PLUTARCH_ALEX;
    if (sectionId === "Lucian-Char-1") return GRC_LUCIAN_CHARON;

    // Expanded sections
    const expandedMatch = ALL_EXPANDED_SECTIONS.find(s => s.id === sectionId);
    if (expandedMatch) return expandedMatch;
    const treebankMatch = ALL_TREEBANK_SECTIONS.find(s => s.id === sectionId);
    if (treebankMatch) return treebankMatch;
    const greekNtMatch = ALL_GREEK_NT_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (greekNtMatch) return greekNtMatch;
    const greekClassicsExtMatch = ALL_GREEK_CLASSICS_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (greekClassicsExtMatch) return greekClassicsExtMatch;
    const latinExtMatch = ALL_LATIN_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (latinExtMatch) return latinExtMatch;
    const hebrewExt2Match = ALL_HEBREW_EXTENDED_2_SECTIONS.find(s => s.id === sectionId);
    if (hebrewExt2Match) return hebrewExt2Match;
    const syriacExtMatch = ALL_SYRIAC_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (syriacExtMatch) return syriacExtMatch;
    const copticExtMatch = ALL_COPTIC_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (copticExtMatch) return copticExtMatch;
    const aramaicExtMatch = ALL_ARAMAIC_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (aramaicExtMatch) return aramaicExtMatch;
    if (sectionId === "grc-voc-1") return GRC_VOCAB_SECTION;
    if (sectionId === "grc-koine-voc-1") return GRC_KOINE_VOCAB_SECTION;
    if (sectionId === "lat-voc-1") return LAT_VOCAB_SECTION;
    if (sectionId === "heb-voc-1") return HEB_VOCAB_SECTION;
    if (sectionId === "syr-voc-1") return SYR_VOCAB_SECTION;
    if (sectionId === "cop-voc-1") return COP_VOCAB_SECTION;
    if (sectionId === "arc-voc-1") return ARC_VOCAB_SECTION;
    const akkExtMatch = ALL_AKKADIAN_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (akkExtMatch) return akkExtMatch;
    const hitExtMatch = ALL_HITTITE_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (hitExtMatch) return hitExtMatch;
    const ugaExtMatch = ALL_UGARITIC_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (ugaExtMatch) return ugaExtMatch;
    if (sectionId === "akk-voc-1") return AKK_VOCAB_SECTION;
    if (sectionId === "hit-voc-1") return HIT_VOCAB_SECTION;
    if (sectionId === "uga-voc-1") return UGA_VOCAB_SECTION;
    const sanskritExtMatch = ALL_SANSKRIT_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (sanskritExtMatch) return sanskritExtMatch;
    const egyptianExtMatch = ALL_EGYPTIAN_EXTENDED_SECTIONS.find(s => s.id === sectionId);
    if (egyptianExtMatch) return egyptianExtMatch;
    if (sectionId === "san-voc-1") return SAN_VOCAB_SECTION;
    if (sectionId === "egy-voc-1") return EGY_VOCAB_SECTION;
    
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      const mockMatch = getMockSections().find(s => s.id === sectionId);
      if (mockMatch) return mockMatch;
    }
    
    return null;
  },
  getCorpusOverview: (corpusId: string) => {
    if (corpusId === "SBLGNT") return GREEK_CORPUS;
    if (corpusId === "OSHB") return HEBREW_CORPUS;
    if (corpusId === "LATIN_CLASSIC") return LATIN_CORPUS;
    if (corpusId === "SYRIAC_PESHITTA") return SYRIAC_CORPUS;
    if (corpusId === "COPTIC_SAHIDIC") return COPTIC_CORPUS;
    if (corpusId === "ARAMAIC_TARGUM") return ARAMAIC_CORPUS;
    if (corpusId === "AKKADIAN_GILGAMESH") return AKKADIAN_CORPUS;
    if (corpusId === "SANSKRIT_MAHABHARATA") return SANSKRIT_CORPUS;
    if (corpusId === "HITTITE_ANNALS") return HITTITE_CORPUS;
    if (corpusId === "EGYPTIAN_TEXTS") return EGYPTIAN_CORPUS;
    if (corpusId === "UGARITIC_BAAL") return UGARITIC_CORPUS;
    if (corpusId === "ANCIENT_GREEK") return ANCIENT_GREEK_CORPUS;
    if (corpusId === "LXX") return LXX_CORPUS;
    if (corpusId === "PATRISTIC_GREEK") return PATRISTIC_CORPUS;
    return null;
  },
  findSentencesWithLemma: (
    lemma: string,
    currentSentenceId?: string,
    max: number = 3,
  ) => {
    const index = getLemmaIndex();
    const entries = index.get(lemma);
    if (!entries) return [];
    const results: any[] = [];
    for (const entry of entries) {
      if (entry.sentence.id === currentSentenceId) continue;
      results.push(entry);
      if (results.length >= max) break;
    }
    return results;
  },

  searchCorpus: (
    query: string,
    opts: {
      languageId?: string;
      morphology?: Partial<Record<string, string>>;
      limit?: number;
    } = {},
  ): Array<{
    textId: string;
    textTitle: string;
    textLanguage: string;
    sectionId: string;
    sentence: any;
    tokenIdx: number;
  }> => {
    const { languageId, morphology, limit = 60 } = opts;
    const q = query.trim().toLowerCase();
    const hasMorphFilter = morphology && Object.values(morphology).some(Boolean);
    if (!q && !hasMorphFilter) return [];

    const allSections = [
      JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1, SYRIAC_JOHN_1_1,
      COPTIC_JOHN_1_1, ARAMAIC_GENESIS_1_1, AKKADIAN_GILGAMESH_1_1,
      SANSKRIT_GITA_1_1, HITTITE_ANNALS_1_1, EGYPTIAN_PTAHHOTEP_1_1,
      ANABASIS_1_1, ILIAD_1_1, ODYSSEY_1_1, AESOP_1_1,
      LXX_GENESIS_1_1, LXX_GENESIS_1_2, LXX_PSALM_1_1, LXX_PSALM_33_1, LXX_EXODUS_12_1, LXX_ISAIAH_6_1, LXX_PROVERBS_1_1, LXX_PSALM_50_1, LXX_JONAH_1_1,
      CLEMENT_1, DIDACHE_1, DIDACHE_2, ATHANASIUS_INCARNATION_1, CHRYSOSTOM_HOMILY_1, HERMAS_VISION_1, BASIL_HEXAEMERON_1,
      ...ALL_EXPANDED_SECTIONS,
    ];

    const textMap = getTextByIdMap();
    const hits: Array<{
      textId: string;
      textTitle: string;
      textLanguage: string;
      sectionId: string;
      sentence: any;
      tokenIdx: number;
    }> = [];

    for (const section of allSections) {
      const text = textMap.get((section as any).textId);
      if (!text) continue;
      if (languageId && text.language !== languageId) continue;

      for (const sentence of section.sentences) {
        for (let i = 0; i < sentence.tokens.length; i++) {
          const token = sentence.tokens[i];
          if (q) {
            const lq = q;
            const matchesText =
              token.lemma?.toLowerCase() === lq ||
              token.surface?.toLowerCase().includes(lq) ||
              token.normalized?.toLowerCase().includes(lq) ||
              token.gloss?.toLowerCase().includes(lq);
            if (!matchesText) continue;
          }
          if (hasMorphFilter && token.morphology) {
            const morph = token.morphology as unknown as Record<string, string>;
            const morphOk = Object.entries(morphology!).every(
              ([k, v]) => !v || morph[k]?.toLowerCase() === v.toLowerCase(),
            );
            if (!morphOk) continue;
          }
          hits.push({
            textId: (section as any).textId,
            textTitle: text.title,
            textLanguage: text.language,
            sectionId: section.id,
            sentence,
            tokenIdx: i,
          });
          if (hits.length >= limit) return hits;
        }
      }
    }
    return hits;
  },
};
