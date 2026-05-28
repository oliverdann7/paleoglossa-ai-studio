import { Text, Corpus, SourceAttribution } from "../types/corpus.js";

export const ATTRIBUTIONS: Record<string, SourceAttribution> = {
  "sblgnt-text": {
    id: "sblgnt-text",
    sourceName: "SBL Greek New Testament",
    sourceUrl: "https://sblgnt.com",
    dataType: "text",
    licenseName: "SBLGNT License",
    licenseUrl: "https://sblgnt.com/license/",
    attributionText:
      "The SBL Greek New Testament, edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software.",
    requiresAttribution: true,
    allowsCommercialUse: false,
    allowsModification: false,
    shareAlike: false,
  },
  "morphgnt-parsing": {
    id: "morphgnt-parsing",
    sourceName: "MorphGNT",
    sourceUrl: "https://github.com/morphgnt/sblgnt",
    dataType: "morphology",
    licenseName: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    attributionText: "Morphological parsing by MorphGNT.",
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
  },
  "oshb-text-morph": {
    id: "oshb-text-morph",
    sourceName: "Open Scriptures Hebrew Bible",
    sourceUrl: "https://github.com/openscriptures/morphhb",
    dataType: "text",
    licenseName: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "OSHB text and morphology provided by Open Scriptures.",
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes: "Includes WLC text.",
  },
  "perseus-texts": {
    id: "perseus-texts",
    sourceName: "Perseus Digital Library",
    sourceUrl: "http://www.perseus.tufts.edu/",
    dataType: "text",
    licenseName: "CC BY-SA 3.0",
    attributionText: "Text provided by Perseus Digital Library.",
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
  },
  "project-gutenberg": {
    id: "project-gutenberg",
    sourceName: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/",
    dataType: "text",
    licenseName: "Public Domain",
    attributionText: "Text provided by Project Gutenberg.",
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },
  "lxx-text": {
    id: "lxx-text",
    sourceName: "Septuagint (LXX)",
    sourceUrl: "https://www.academic-bible.com/en/online-bibles/septuagint-lxx/",
    dataType: "text",
    licenseName: "Public Domain",
    attributionText: "Septuagint text (Rahlfs-Hanhart). Public Domain.",
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },
  "patristic-texts": {
    id: "patristic-texts",
    sourceName: "Patristic Greek Texts",
    sourceUrl: "",
    dataType: "text",
    licenseName: "Public Domain",
    attributionText: "Patristic Greek texts are in the Public Domain.",
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },
};

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

export const TEXT_JOHN_1: Text = {
  id: "Jn-1",
  corpusId: "SBLGNT",
  title: "ΚΑΤΑ ΙΩΑΝΝΗΝ",
  canonicalRef: "John 1",
  author: "John",
  language: "grc-koine",
  direction: "ltr",
  level: "A1",
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 18,
  sectionsPreview: [
    { id: "Jn-1-1", label: "John 1:1-5" },
    { id: "Jn-1-2", label: "John 1:6-18" },
  ],
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 918,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 110,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 14,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 16,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 15,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 16,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 22,
  corpusType: 'classical',
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 16,
  corpusType: 'inscription',
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 21,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 14,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 11,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 9,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 110,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 27,
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
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 35,
  sectionsPreview: [
    { id: "GrcMini-1", label: "A man at the marketplace" },
    { id: "GrcMini-2", label: "The teacher and the student" },
    { id: "GrcMini-3", label: "The fisherman" },
    { id: "GrcMini-4", label: "The traveler" },
    { id: "GrcMini-5", label: "The shepherd" },
  ],
};

export const TEXT_GRC_MARK: Text = {
  id: "GrcMk",
  corpusId: "SBLGNT",
  title: "Κατὰ Μάρκον",
  canonicalRef: "Mark 1",
  author: "Mark",
  language: "grc-koine",
  direction: "ltr",
  level: "A2",
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: false,
  isSample: true,
  sentenceCount: 27,
  sectionsPreview: [
    { id: "GrcMk-1a", label: "Mark 1:1–13 — John the Baptist and the baptism of Jesus" },
    { id: "GrcMk-1b", label: "Mark 1:14–45 — The kingdom at hand; call of the disciples" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
  sentenceCount: 35,
  sectionsPreview: [
    { id: "LatMini-1", label: "Agricola et villa — The farmer and his estate" },
    { id: "LatMini-2", label: "Puer et magister — The boy and the teacher" },
    { id: "LatMini-3", label: "Piscator — The fisherman" },
    { id: "LatMini-4", label: "Viator — The traveler" },
    { id: "LatMini-5", label: "Pastor et oves — The shepherd and the sheep" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 42,
  sectionsPreview: [
    { id: "Heb-Gen-1", label: "Genesis 1 — In the beginning" },
    { id: "Heb-Gen-2", label: "Genesis 2 — The Garden of Eden" },
    { id: "Heb-Gen-3", label: "Genesis 3 — The Fall" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 30,
  corpusType: 'biblical',
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 7,
  sectionsPreview: [
    { id: "Cic-Cat-1", label: "In Catilinam 1" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Ovid-Met-1", label: "Metamorphoses Book 1" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Caes-BG-1", label: "De Bello Gallico Book 1" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 6,
  sectionsPreview: [
    { id: "Plato-Apol-1", label: "Apology" },
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'complete',
  isComplete: true,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
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
  hasMorphology: false,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 9,
  sectionsPreview: [
    { id: "Lucian-Char-1", label: "Sections 1–8 — Charon surveys the world of the living" },
  ],
};

import { getMockTexts, getMockSections } from "./mockTexts.js";
import { sectionRegistry, ILIAD_1_1, JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1, SYRIAC_JOHN_1_1, COPTIC_JOHN_1_1, ARAMAIC_GENESIS_1_1, AKKADIAN_GILGAMESH_1_1, SANSKRIT_GITA_1_1, HITTITE_ANNALS_1_1, EGYPTIAN_PTAHHOTEP_1_1, ANABASIS_1_1, ODYSSEY_1_1, AESOP_1_1 } from "./corpus/section-registry.js";
import { TEXT_VOCAB_GRC, TEXT_VOCAB_GRC_KOINE, TEXT_VOCAB_LAT, TEXT_VOCAB_HEB, TEXT_VOCAB_SYR, TEXT_VOCAB_COP, TEXT_VOCAB_ARC, TEXT_VOCAB_AKK, TEXT_VOCAB_HIT, TEXT_VOCAB_UGA, TEXT_VOCAB_SAN, TEXT_VOCAB_EGY } from "./corpus/vocabulary-texts.js";

export { ILIAD_1_1, JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1, SYRIAC_JOHN_1_1, COPTIC_JOHN_1_1, ARAMAIC_GENESIS_1_1, AKKADIAN_GILGAMESH_1_1, SANSKRIT_GITA_1_1, HITTITE_ANNALS_1_1, EGYPTIAN_PTAHHOTEP_1_1, ANABASIS_1_1, ODYSSEY_1_1, AESOP_1_1 };

// Module-level caches — corpus data is static at runtime
let _textsCache: ReturnType<typeof enhanceText>[] | null = null;
let _textByIdCache: Map<string, ReturnType<typeof enhanceText>> | null = null;
let _lemmaIndexCache: Map<string, Array<{ sentence: any; sectionId: string; textId: string }>> | null = null;

// ─── Treebank demo texts ──────────────────────────────────────────────────────

const TEXT_TREEBANK_GRC: Text = {
  id: 'grc-treebank-demo',
  corpusId: 'ANCIENT_GREEK',
  title: 'Treebank Demo: John 1:1 (PROIEL)',
  canonicalRef: 'John 1:1',
  author: 'New Testament',
  language: 'grc',
  direction: 'ltr',
  level: 'B1',
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt' as const,
  isComplete: false,
  isSample: true,
  sentenceCount: 1,
  sectionsPreview: [{ id: 'TB-grc-Jn1', label: 'John 1:1' }],
};

const TEXT_TREEBANK_LAT: Text = {
  id: 'lat-treebank-demo',
  corpusId: 'LATIN_CLASSIC',
  title: 'Treebank Demo: Caesar BG 1.1 (PLDT)',
  canonicalRef: 'Caesar BG 1.1',
  author: 'Julius Caesar',
  language: 'lat',
  direction: 'ltr',
  level: 'B1',
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sourceStatus: 'excerpt' as const,
  isComplete: false,
  isSample: true,
  sentenceCount: 1,
  sectionsPreview: [{ id: 'TB-lat-Caes1', label: 'BG 1.1' }],
};

const SECTION_PREVIEW_OVERRIDES: Record<string, { id: string; label: string }[]> = {};

const enhanceText = (text: Text): Text => ({
  ...text,
  sectionsPreview: SECTION_PREVIEW_OVERRIDES[text.id] || text.sectionsPreview,
});

function getAllEnhancedTexts() {
  if (!_textsCache) {
    _textsCache = [
      TEXT_JOHN_1,
      TEXT_JOHN_FULL,
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
      TEXT_TREEBANK_GRC,
      TEXT_TREEBANK_LAT,
      // Beginner texts
      TEXT_GRC_MINI_STORIES,
      TEXT_GRC_MARK,
      TEXT_LAT_MINI_STORIES,
      TEXT_LAT_VG_JOHN,
      TEXT_LAT_CATO,
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
      // Vocab texts
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
  const allSections = [...sectionRegistry.values(), ...(import.meta.env.DEV ? getMockSections() : [])];
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
  getText: (id: string) => getTextByIdMap().get(id),
  getSection: (sectionId: string) => {
    const section = sectionRegistry.get(sectionId);
    if (section) return section;
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

    const textMap = getTextByIdMap();
    const hits: Array<{
      textId: string;
      textTitle: string;
      textLanguage: string;
      sectionId: string;
      sentence: any;
      tokenIdx: number;
    }> = [];

    for (const section of sectionRegistry.values()) {
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
