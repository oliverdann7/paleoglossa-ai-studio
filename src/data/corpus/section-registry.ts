import { TextSection } from '../../types/corpus.js';

import { JOHN_1_1 } from './koine-greek-core.js';
import { ANABASIS_1_1, ILIAD_1_1, ODYSSEY_1_1, AESOP_1_1 } from './ancient-greek-core.js';
import { AENEID_1_1 } from './latin-core.js';
import { PSALM_23_1, GENESIS_1 } from './hebrew-core.js';
import {
  SYRIAC_JOHN_1_1, SYRIAC_JOHN_1_2, SYRIAC_JOHN_1_3,
  COPTIC_JOHN_1_1,
  ARAMAIC_GENESIS_1_1,
  AKKADIAN_GILGAMESH_1_1, AKKADIAN_GILGAMESH_1_2, AKKADIAN_GILGAMESH_1_3,
  SANSKRIT_GITA_1_1,
  HITTITE_ANNALS_1_1, HITTITE_ANNALS_1_2, HITTITE_ANNALS_1_3,
  EGYPTIAN_PTAHHOTEP_1_1,
  UGARITIC_BAAL_1_1, UGARITIC_BAAL_1_2,
} from './multilingual-core.js';

import { ALL_EXPANDED_SECTIONS } from './expanded-sections.js';
import { ALL_TREEBANK_SECTIONS, TREEBANK_GRC_JN1, TREEBANK_LAT_CAES1 } from './treebank-sections.js';
import { CICERO_CATILINA_1, CICERO_CATILINA_2, CICERO_CATILINA_3, CICERO_CATILINA_4 } from './cicero-catilina.js';
import { OVID_METAMORPHOSES_1, OVID_METAMORPHOSES_2, OVID_METAMORPHOSES_3, OVID_METAMORPHOSES_4 } from './ovid-metamorphoses.js';
import { CAESAR_BELLUM_GALLICUM_1, CAESAR_BELLUM_GALLICUM_2, CAESAR_BELLUM_GALLICUM_3, CAESAR_BELLUM_GALLICUM_4 } from './caesar-bellum-gallicum.js';
import { PLATO_APOLOGY_1, PLATO_APOLOGY_2, PLATO_APOLOGY_3, PLATO_APOLOGY_4, PLATO_APOLOGY_5 } from './plato-apology.js';
import { LXX_GENESIS_1_1, LXX_GENESIS_1_2, LXX_PSALM_1_1, LXX_PSALM_33_1, LXX_EXODUS_12_1, LXX_ISAIAH_6_1, LXX_PROVERBS_1_1, LXX_PSALM_50_1, LXX_JONAH_1_1 } from './lxx-septuagint.js';
import { CLEMENT_1, DIDACHE_1, DIDACHE_2, ATHANASIUS_INCARNATION_1, CHRYSOSTOM_HOMILY_1, HERMAS_VISION_1, BASIL_HEXAEMERON_1, IGNATIUS_EPHESIANS_1, JUSTIN_MARTYR_APOLOGY_1, POLYCARP_PHILIPPIANS_1 } from './patristics.js';
import { ALL_GREEK_MINI_STORIES, GRC_MINI_1, GRC_MINI_2, GRC_MINI_3, GRC_MINI_4, GRC_MINI_5 } from './greek-mini-stories.js';
import { ALL_LATIN_BEGINNER_SECTIONS, LAT_VULGATE_JOHN_1, LAT_DISTICHA_CATONIS } from './latin-beginner.js';
import { ALL_LATIN_MINI_STORIES, LAT_MINI_1, LAT_MINI_2, LAT_MINI_3, LAT_MINI_4, LAT_MINI_5 } from './latin-mini-stories.js';
import { ALL_HEBREW_BEGINNER_SECTIONS, HEB_JONAH_1, HEB_JONAH_2, HEB_JONAH_3, HEB_JONAH_4, HEB_PSALM_91 } from './hebrew-beginner.js';
import { ALL_HEBREW_EXTENDED_SECTIONS, HEB_GENESIS_1, HEB_GENESIS_2, HEB_GENESIS_3, HEB_PSALM_23 } from './hebrew-extended.js';
import { ALL_GREEK_MARK_SECTIONS, GRC_MARK_1A, GRC_MARK_1B } from './greek-mark.js';
import { ALL_LATIN_CLASSICS_SECTIONS, LAT_HORACE_ODES_1_1, LAT_HORACE_ODES_1_9, LAT_HORACE_ODES_1_11, LAT_LIVY_PRAEF, LAT_LIVY_1_1, LAT_SALLUST_CAT, LAT_TACITUS_ANN } from './latin-classics.js';
import { ALL_GREEK_CLASSICS_SECTIONS, GRC_HERODOTUS_1, GRC_THUCYDIDES_1, GRC_SOPHOCLES_ANT, GRC_PLUTARCH_ALEX, GRC_LUCIAN_CHARON } from './greek-classics.js';
import { ALL_GREEK_NT_EXTENDED_SECTIONS } from './greek-nt-extended.js';
import { ALL_GREEK_CLASSICS_EXTENDED_SECTIONS } from './greek-classics-extended.js';
import { ALL_LATIN_EXTENDED_SECTIONS } from './latin-extended.js';
import { GRC_VOCAB_SECTION, GRC_KOINE_VOCAB_SECTION, LAT_VOCAB_SECTION, HEB_VOCAB_SECTION, SYR_VOCAB_SECTION, COP_VOCAB_SECTION, ARC_VOCAB_SECTION, AKK_VOCAB_SECTION, HIT_VOCAB_SECTION, UGA_VOCAB_SECTION, SAN_VOCAB_SECTION, EGY_VOCAB_SECTION } from './vocabulary-texts.js';
import { ALL_HEBREW_EXTENDED_2_SECTIONS } from './hebrew-extended-2.js';
import { ALL_SYRIAC_EXTENDED_SECTIONS } from './syriac-extended.js';
import { ALL_COPTIC_EXTENDED_SECTIONS } from './coptic-extended.js';
import { ALL_ARAMAIC_EXTENDED_SECTIONS } from './aramaic-extended.js';
import { ALL_AKKADIAN_EXTENDED_SECTIONS } from './akkadian-extended.js';
import { ALL_HITTITE_EXTENDED_SECTIONS } from './hittite-extended.js';
import { ALL_UGARITIC_EXTENDED_SECTIONS } from './ugaritic-extended.js';
import { ALL_SANSKRIT_EXTENDED_SECTIONS } from './sanskrit-extended.js';
import { ALL_EGYPTIAN_EXTENDED_SECTIONS } from './egyptian-extended.js';
type SplitPart = 1 | 2;

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

const allSections: TextSection[] = [
  // Core sections
  JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1,
  ANABASIS_1_1, ILIAD_1_1, ODYSSEY_1_1, AESOP_1_1,
  // Multilingual core
  SYRIAC_JOHN_1_1, SYRIAC_JOHN_1_2, SYRIAC_JOHN_1_3,
  COPTIC_JOHN_1_1,
  ARAMAIC_GENESIS_1_1,
  AKKADIAN_GILGAMESH_1_1, AKKADIAN_GILGAMESH_1_2, AKKADIAN_GILGAMESH_1_3,
  SANSKRIT_GITA_1_1,
  HITTITE_ANNALS_1_1, HITTITE_ANNALS_1_2, HITTITE_ANNALS_1_3,
  EGYPTIAN_PTAHHOTEP_1_1,
  UGARITIC_BAAL_1_1, UGARITIC_BAAL_1_2,
  // LXX
  LXX_GENESIS_1_1, LXX_GENESIS_1_2, LXX_PSALM_1_1, LXX_PSALM_33_1,
  LXX_EXODUS_12_1, LXX_ISAIAH_6_1, LXX_PROVERBS_1_1, LXX_PSALM_50_1, LXX_JONAH_1_1,
  // Patristics
  CLEMENT_1, DIDACHE_1, DIDACHE_2, ATHANASIUS_INCARNATION_1,
  CHRYSOSTOM_HOMILY_1, HERMAS_VISION_1, BASIL_HEXAEMERON_1,
  IGNATIUS_EPHESIANS_1, JUSTIN_MARTYR_APOLOGY_1, POLYCARP_PHILIPPIANS_1,
  // Latin works
  CICERO_CATILINA_1, CICERO_CATILINA_2, CICERO_CATILINA_3, CICERO_CATILINA_4,
  OVID_METAMORPHOSES_1, OVID_METAMORPHOSES_2, OVID_METAMORPHOSES_3, OVID_METAMORPHOSES_4,
  CAESAR_BELLUM_GALLICUM_1, CAESAR_BELLUM_GALLICUM_2, CAESAR_BELLUM_GALLICUM_3, CAESAR_BELLUM_GALLICUM_4,
  LAT_HORACE_ODES_1_1, LAT_HORACE_ODES_1_9, LAT_HORACE_ODES_1_11,
  LAT_LIVY_PRAEF, LAT_LIVY_1_1, LAT_SALLUST_CAT, LAT_TACITUS_ANN,
  // Greek works
  PLATO_APOLOGY_1, PLATO_APOLOGY_2, PLATO_APOLOGY_3, PLATO_APOLOGY_4, PLATO_APOLOGY_5,
  GRC_HERODOTUS_1, GRC_THUCYDIDES_1, GRC_SOPHOCLES_ANT, GRC_PLUTARCH_ALEX, GRC_LUCIAN_CHARON,
  // Treebanks
  TREEBANK_GRC_JN1, TREEBANK_LAT_CAES1,
  // Beginner sections
  GRC_MINI_1, GRC_MINI_2, GRC_MINI_3, GRC_MINI_4, GRC_MINI_5,
  GRC_MARK_1A, GRC_MARK_1B,
  LAT_MINI_1, LAT_MINI_2, LAT_MINI_3, LAT_MINI_4, LAT_MINI_5,
  LAT_VULGATE_JOHN_1, LAT_DISTICHA_CATONIS,
  HEB_GENESIS_1, HEB_GENESIS_2, HEB_GENESIS_3, HEB_PSALM_23,
  HEB_JONAH_1, HEB_JONAH_2, HEB_JONAH_3, HEB_JONAH_4, HEB_PSALM_91,
  // Vocabulary sections
  GRC_VOCAB_SECTION, GRC_KOINE_VOCAB_SECTION, LAT_VOCAB_SECTION,
  HEB_VOCAB_SECTION, SYR_VOCAB_SECTION, COP_VOCAB_SECTION,
  ARC_VOCAB_SECTION, AKK_VOCAB_SECTION, HIT_VOCAB_SECTION,
  UGA_VOCAB_SECTION, SAN_VOCAB_SECTION, EGY_VOCAB_SECTION,
  // Extended collections
  ...ALL_EXPANDED_SECTIONS,
  ...ALL_TREEBANK_SECTIONS,
  ...ALL_GREEK_MINI_STORIES,
  ...ALL_GREEK_MARK_SECTIONS,
  ...ALL_LATIN_MINI_STORIES,
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
];

export const sectionRegistry = new Map<string, TextSection>();
for (const section of allSections) {
  sectionRegistry.set(section.id, section);
}
for (const [id, split] of Object.entries(SECTION_SPLITS)) {
  sectionRegistry.set(id, splitTextSection(split.base, id, split.label, split.part));
}

export {
  JOHN_1_1,
  ANABASIS_1_1, ILIAD_1_1, ODYSSEY_1_1, AESOP_1_1,
  AENEID_1_1,
  GENESIS_1, PSALM_23_1,
  SYRIAC_JOHN_1_1, COPTIC_JOHN_1_1, ARAMAIC_GENESIS_1_1,
  AKKADIAN_GILGAMESH_1_1, SANSKRIT_GITA_1_1,
  HITTITE_ANNALS_1_1, EGYPTIAN_PTAHHOTEP_1_1,
};
