import type { SourceAttribution } from '../types/corpus.js';

/**
 * Source/license registry — the single source of truth for where every text
 * (and its morphology/gloss layers) comes from and what its license permits.
 *
 * Extracted out of `corpus.ts` so the corpus data file stays small and so the
 * maintainer-only ingestion pipeline (`scripts/corpus/ingest/*`) can import the
 * registry and the {@link isCommercialSafe} gate WITHOUT pulling the entire
 * 5000-line bundled corpus into its import graph.
 *
 * Paleoglossa is a commercial product (Stripe billing), so the hard line for
 * what may be ingested is: the source must permit commercial use AND
 * modification. Non-commercial (CC BY-NC*) and no-derivatives (…-ND) sources
 * are blocked by the gate. Share-alike (…-SA) is permitted — the repo already
 * ships BY-SA sources (Perseus, MorphGNT) commercially — but carries an
 * obligation to keep the data shareable; the gate warns rather than blocks.
 */
export const ATTRIBUTIONS: Record<string, SourceAttribution> = {
  'sblgnt-text': {
    id: 'sblgnt-text',
    sourceName: 'SBL Greek New Testament',
    sourceUrl: 'https://sblgnt.com',
    dataType: 'text',
    licenseName: 'SBLGNT License',
    licenseUrl: 'https://sblgnt.com/license/',
    attributionText:
      'The SBL Greek New Testament, edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software.',
    requiresAttribution: true,
    allowsCommercialUse: false,
    allowsModification: false,
    shareAlike: false,
  },
  'morphgnt-parsing': {
    id: 'morphgnt-parsing',
    sourceName: 'MorphGNT',
    sourceUrl: 'https://github.com/morphgnt/sblgnt',
    dataType: 'morphology',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    attributionText: 'Morphological parsing by MorphGNT.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
  },
  'oshb-text-morph': {
    id: 'oshb-text-morph',
    sourceName: 'Open Scriptures Hebrew Bible',
    sourceUrl: 'https://github.com/openscriptures/morphhb',
    dataType: 'text',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText: 'OSHB text and morphology provided by Open Scriptures.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes: 'Includes WLC text.',
  },
  'perseus-texts': {
    id: 'perseus-texts',
    sourceName: 'Perseus Digital Library',
    sourceUrl: 'http://www.perseus.tufts.edu/',
    dataType: 'text',
    licenseName: 'CC BY-SA 3.0',
    attributionText: 'Text provided by Perseus Digital Library.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
  },
  'project-gutenberg': {
    id: 'project-gutenberg',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/',
    dataType: 'text',
    licenseName: 'Public Domain',
    attributionText: 'Text provided by Project Gutenberg.',
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },
  'lxx-text': {
    id: 'lxx-text',
    sourceName: 'Septuagint (LXX)',
    sourceUrl: 'https://www.academic-bible.com/en/online-bibles/septuagint-lxx/',
    dataType: 'text',
    licenseName: 'Public Domain',
    attributionText: 'Septuagint text (Rahlfs-Hanhart). Public Domain.',
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },
  'patristic-texts': {
    id: 'patristic-texts',
    sourceName: 'Patristic Greek Texts',
    sourceUrl: '',
    dataType: 'text',
    licenseName: 'Public Domain',
    attributionText: 'Patristic Greek texts are in the Public Domain.',
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
  },

  // ─── Ingestion-pipeline sources (full-text corpus expansion) ────────────────

  'macula-greek': {
    id: 'macula-greek',
    sourceName: 'Macula Greek (Clear Bible)',
    sourceUrl: 'https://github.com/Clear-Bible/macula-greek',
    dataType: 'morphology',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText:
      'Greek New Testament text, lemmas, glosses, and morphology from the Macula Greek project (Clear Bible), based on Nestle 1904.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes:
      'Single TSV carries surface+lemma+gloss+full morphology → fully complete with no AI. Used by sources/macula.ts.',
  },
  'macula-hebrew': {
    id: 'macula-hebrew',
    sourceName: 'Macula Hebrew (Clear Bible)',
    sourceUrl: 'https://github.com/Clear-Bible/macula-hebrew',
    dataType: 'morphology',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText:
      'Hebrew Bible text, lemmas, glosses, and morphology from the Macula Hebrew project (Clear Bible), based on the Westminster Leningrad Codex.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes:
      'Covers Biblical Hebrew (hbo) and the Biblical Aramaic portions (arc: Daniel/Ezra). Used by sources/macula-hebrew.ts.',
  },
  gretil: {
    id: 'gretil',
    sourceName: 'GRETIL — Göttingen Register of Electronic Texts in Indian Languages',
    sourceUrl: 'http://gretil.sub.uni-goettingen.de/',
    dataType: 'text',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText:
      'Sanskrit texts from GRETIL (Göttingen Register of Electronic Texts in Indian Languages); Zenodo mirror licensed CC BY 4.0.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes:
      'Text-only — lemma/POS/gloss filled by the pipeline (AI gloss-fill); promote to complete only after human review of the gloss cache.',
  },
  'digital-syriac-corpus': {
    id: 'digital-syriac-corpus',
    sourceName: 'Digital Syriac Corpus',
    sourceUrl: 'https://syriaccorpus.org/',
    dataType: 'text',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText:
      'Syriac texts from the Digital Syriac Corpus; TEI editions licensed CC BY 4.0, underlying texts public domain.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes: 'TEI XML source — parsed by sources/tei.ts; glosses filled by the pipeline.',
  },
  'coptic-scriptorium': {
    id: 'coptic-scriptorium',
    sourceName: 'Coptic SCRIPTORIUM',
    sourceUrl: 'https://copticscriptorium.org/',
    dataType: 'text',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText: 'Coptic texts from Coptic SCRIPTORIUM.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
    notes:
      'MIXED licensing: most corpora are CC BY 4.0 but some are CC BY-SA and certain NT material is separately licensed. Verify the per-corpus license before ingesting; shareAlike=true here is the conservative default.',
  },
  'public-domain-edition': {
    id: 'public-domain-edition',
    sourceName: 'Public-domain scholarly edition',
    sourceUrl: '',
    dataType: 'text',
    licenseName: 'Public Domain',
    attributionText:
      "Text from a public-domain scholarly edition (pre-1929 or otherwise out of copyright). Record the specific edition in the manifest entry's notes.",
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes:
      'Generic bucket for PD editions of classical Greek/Latin, Egyptian, Hittite, Ugaritic, and Akkadian works. The TEXT is PD; modern transliterations/editions may not be — confirm per work.',
  },

  // ─── Recorded-but-blocked sources (commercial gate fails) ───────────────────
  // Kept in the registry so the manifest can reference them and explain WHY a
  // famous corpus is not ingested, rather than silently omitting it.

  proiel: {
    id: 'proiel',
    sourceName: 'PROIEL Treebank',
    sourceUrl: 'https://proiel.github.io/',
    dataType: 'morphology',
    licenseName: 'CC BY-NC-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    attributionText: 'Morphology/syntax from the PROIEL treebank.',
    requiresAttribution: true,
    allowsCommercialUse: false,
    allowsModification: true,
    shareAlike: true,
    notes:
      'BLOCKED for the paid product: non-commercial license. Usable only behind a non-commercial mode (--allow-noncommercial).',
  },
  oracc: {
    id: 'oracc',
    sourceName: 'ORACC — Open Richly Annotated Cuneiform Corpus',
    sourceUrl: 'https://oracc.museum.upenn.edu/',
    dataType: 'text',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    attributionText: 'Akkadian transliterations and lemmatization from ORACC.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true,
    notes:
      'Share-alike: commercially usable but the derived data must remain shareable. Treat as case-by-case before ingesting.',
  },
};

/** Look up a source attribution by id. */
export function getAttribution(id: string | undefined): SourceAttribution | undefined {
  if (!id) return undefined;
  return ATTRIBUTIONS[id];
}

/**
 * The hard commercial gate: a source may be ingested into the paid product only
 * if it permits BOTH commercial use AND modification. Share-alike does NOT fail
 * this gate (it is an obligation, surfaced separately as a warning).
 */
export function isCommercialSafe(attr: SourceAttribution | undefined): boolean {
  return !!attr && attr.allowsCommercialUse && attr.allowsModification;
}
