/**
 * Curated manuscript catalog.
 *
 * A small, hand-verified set of openly-digitised primary sources surfaced in
 * the Manuscripts lab so the page is useful out of the box (the per-user
 * Firestore collection starts empty). Every entry points at a live IIIF
 * Presentation manifest from the Biblioteca Apostolica Vaticana (DigiVatLib),
 * which the existing IIIF viewer renders for deep zoom and page navigation.
 *
 * Titles, dates and languages are taken verbatim from each manifest's
 * bibliographic metadata — no invented attributions. These entries are
 * read-only; users still create their own manuscripts alongside them.
 */

/** Shape mirrors the `Manuscript` record the Manuscripts page renders. */
export interface CuratedManuscript {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iiifManifestUrl: string;
  transcription: string;
  languageId: string;
  source: string;
  date: string;
  tags: string[];
  curated: true;
  createdAt: null;
  updatedAt: null;
}

const VAT_MANIFEST = (shelfmark: string) =>
  `https://digi.vatlib.it/iiif/MSS_${shelfmark}/manifest.json`;
const VAT_COVER = (shelfmark: string) =>
  `https://digi.vatlib.it/pub/digit/MSS_${shelfmark}/cover/cover.jpg`;

function vat(
  shelfmark: string,
  fields: Omit<
    CuratedManuscript,
    'id' | 'imageUrl' | 'iiifManifestUrl' | 'source' | 'curated' | 'createdAt' | 'updatedAt'
  >
): CuratedManuscript {
  return {
    id: `curated-${shelfmark.toLowerCase().replace(/\./g, '-')}`,
    imageUrl: VAT_COVER(shelfmark),
    iiifManifestUrl: VAT_MANIFEST(shelfmark),
    source: `Biblioteca Apostolica Vaticana, ${shelfmark}`,
    curated: true,
    createdAt: null,
    updatedAt: null,
    ...fields,
  };
}

export const CURATED_MANUSCRIPTS: CuratedManuscript[] = [
  vat('Vat.gr.1209', {
    title: 'Codex Vaticanus (B)',
    languageId: 'grc-koine',
    date: '4th century',
    description:
      'One of the oldest and most important complete manuscripts of the Greek Bible (Septuagint and New Testament), written in elegant biblical majuscule. Foundational witness for modern critical editions.',
    transcription: 'ΕΝ ΑΡΧΗ ΗΝ Ο ΛΟΓΟΣ ΚΑΙ Ο ΛΟΓΟΣ ΗΝ ΠΡΟΣ ΤΟΝ ΘΕΟΝ ΚΑΙ ΘΕΟΣ ΗΝ Ο ΛΟΓΟΣ',
    tags: ['Bible', 'Septuagint', 'New Testament', 'majuscule', '4th century'],
  }),
  vat('Vat.gr.1613', {
    title: 'Menologion of Basil II',
    languageId: 'grc',
    date: 'late 10th century',
    description:
      'A lavishly illuminated Byzantine menologion (calendar of saints) produced for Emperor Basil II, with some 430 miniatures by named court artists. A landmark of Macedonian-Renaissance manuscript painting.',
    transcription: '',
    tags: ['Byzantine', 'illuminated', 'menologion', 'hagiography'],
  }),
  vat('Vat.lat.3225', {
    title: 'Vergilius Vaticanus',
    languageId: 'lat',
    date: 'c. 400 CE',
    description:
      'One of the three surviving illustrated Vergil manuscripts from antiquity, preserving fragments of the Georgics and Aeneid in rustic capitals with fifty surviving miniatures.',
    transcription: 'ARMA VIRVMQVE CANO TROIAE QVI PRIMVS AB ORIS',
    tags: ['Vergil', 'Aeneid', 'Georgics', 'illustrated', 'rustic capitals'],
  }),
  vat('Pal.lat.1631', {
    title: 'Vergilius Palatinus',
    languageId: 'lat',
    date: 'c. 500 CE',
    description:
      'A late-antique copy of the complete works of Vergil (Eclogues, Georgics, Aeneid) in rustic capitals — one of the principal manuscript witnesses to the Vergilian text.',
    transcription: 'TITYRE TV PATVLAE RECVBANS SVB TEGMINE FAGI',
    tags: ['Vergil', 'Eclogues', 'Aeneid', 'rustic capitals', 'late antique'],
  }),
  vat('Vat.lat.3867', {
    title: 'Vergilius Romanus',
    languageId: 'lat',
    date: '5th–6th century',
    description:
      'A late-antique illustrated Vergil with full-page author portraits and bold rustic capitals, prized as much for its painting as for its text of the Eclogues, Georgics and Aeneid.',
    transcription: '',
    tags: ['Vergil', 'illustrated', 'author portrait', 'late antique'],
  }),
  vat('Vat.lat.3256', {
    title: 'Vergilius Augusteus',
    languageId: 'lat',
    date: '5th–6th century',
    description:
      'Fragmentary leaves of the Georgics written in monumental square capitals (capitalis quadrata) — among the very few surviving books copied in this formal display script.',
    transcription: '',
    tags: ['Vergil', 'Georgics', 'square capitals', 'fragment'],
  }),
  vat('Vat.ebr.448', {
    title: 'Hebrew Pentateuch (Vat. ebr. 448)',
    languageId: 'hbo',
    date: '11th–12th century',
    description:
      'A medieval Hebrew manuscript of the Torah (Pentateuch) with masoretic vocalisation and cantillation, copied in a square Sephardic-style hand.',
    transcription: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    tags: ['Torah', 'Pentateuch', 'masoretic', 'medieval'],
  }),
  vat('Vat.sir.162', {
    title: 'Chronicle of Zuqnin',
    languageId: 'syr',
    date: '9th century',
    description:
      'A West Syriac universal chronicle (also called the Chronicle of Pseudo-Dionysius of Tel-Mahre) running from Creation to the 8th century — a key source for late antique and early Islamic Near Eastern history.',
    transcription: '',
    tags: ['Syriac', 'chronicle', 'historiography', 'late antique'],
  }),
  vat('Vat.copt.9', {
    title: 'Coptic Tetraevangelium',
    languageId: 'cop',
    date: 'early 13th century',
    description:
      'A Coptic (Bohairic) manuscript of the four Gospels, representative of the medieval Egyptian Christian scribal tradition.',
    transcription: '',
    tags: ['Coptic', 'Bohairic', 'Gospels', 'New Testament'],
  }),
];
