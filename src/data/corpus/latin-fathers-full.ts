/**
 * Latin Church Fathers — public-domain editions (The Latin Library), served
 * whole via the ingestion pipeline. Ship `partial`: full text with dictionary
 * glosses where the bundled Latin lexicon covers a form; remaining meanings
 * come from the app's on-click AI, and morphology awaits a commercially-
 * licensed Latin treebank.
 *
 * Only these metadata records are bundled. The section data lives in the
 * file-served corpus (`public/corpus-data/<textId>.json`, emitted by
 * `scripts/corpus/ingest/run-manifest.ts --emit-local`) and is fetched by the
 * Reader through `corpusService` — see `remoteSections` on the Text type.
 * Generated from the served JSON; counts locked by validation.test.ts.
 */
import type { Text } from '../../types/corpus.js';


export const TEXT_AUGUSTINE_CONFESSIONES: Text = {
  id: 'lat-augustine-confessiones-full',
  corpusId: 'LATIN_CLASSIC',
  title: 'Confessiones',
  canonicalRef: 'Confessiones I–13',
  author: 'Augustine of Hippo',
  language: 'lat',
  direction: 'ltr',
  level: 'B2',
  period: '397–400 CE',
  genre: 'autobiography',
  corpusType: 'patristic',
  tags: ['Church Fathers', 'Christian Latin'],
  sourceAttributionId: 'public-domain-edition',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 3994,
  wordCount: 79268,
  remoteSections: true,
  sectionsPreview: [
    { id: 'lat-augustine-confessiones-full-1', label: 'Confessiones — Liber 1' },
    { id: 'lat-augustine-confessiones-full-2', label: 'Confessiones — Liber 2' },
    { id: 'lat-augustine-confessiones-full-3', label: 'Confessiones — Liber 3' },
    { id: 'lat-augustine-confessiones-full-4', label: 'Confessiones — Liber 4' },
    { id: 'lat-augustine-confessiones-full-5', label: 'Confessiones — Liber 5' },
    { id: 'lat-augustine-confessiones-full-6', label: 'Confessiones — Liber 6' },
    { id: 'lat-augustine-confessiones-full-7', label: 'Confessiones — Liber 7' },
    { id: 'lat-augustine-confessiones-full-8', label: 'Confessiones — Liber 8' },
    { id: 'lat-augustine-confessiones-full-9', label: 'Confessiones — Liber 9' },
    { id: 'lat-augustine-confessiones-full-10', label: 'Confessiones — Liber 10' },
    { id: 'lat-augustine-confessiones-full-11', label: 'Confessiones — Liber 11' },
    { id: 'lat-augustine-confessiones-full-12', label: 'Confessiones — Liber 12' },
    { id: 'lat-augustine-confessiones-full-13', label: 'Confessiones — Liber 13' },
  ],
};

export const TEXT_TERTULLIAN_APOLOGETICUM: Text = {
  id: 'lat-tertullian-apologeticum-full',
  corpusId: 'LATIN_CLASSIC',
  title: 'Apologeticum',
  canonicalRef: 'Apologeticum',
  author: 'Tertullian',
  language: 'lat',
  direction: 'ltr',
  level: 'B2',
  period: 'c. 197 CE',
  genre: 'apologetics',
  corpusType: 'patristic',
  tags: ['Church Fathers', 'Christian Latin'],
  sourceAttributionId: 'public-domain-edition',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 1431,
  wordCount: 20554,
  remoteSections: true,
  sectionsPreview: [
    { id: 'lat-tertullian-apologeticum-full-1', label: 'Apologeticum' },
  ],
};

export const TEXT_JEROME_VITA_PAULI: Text = {
  id: 'lat-jerome-vita-pauli-full',
  corpusId: 'LATIN_CLASSIC',
  title: 'Vita S. Pauli Primi Eremitae',
  canonicalRef: 'Vita S. Pauli Primi Eremitae',
  author: 'Jerome',
  language: 'lat',
  direction: 'ltr',
  level: 'B1',
  period: 'c. 375 CE',
  genre: 'hagiography',
  corpusType: 'patristic',
  tags: ['Church Fathers', 'Christian Latin'],
  sourceAttributionId: 'public-domain-edition',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 163,
  wordCount: 2455,
  remoteSections: true,
  sectionsPreview: [
    { id: 'lat-jerome-vita-pauli-full-1', label: 'Vita S. Pauli' },
  ],
};

export const TEXT_JEROME_VITA_MALCHI: Text = {
  id: 'lat-jerome-vita-malchi-full',
  corpusId: 'LATIN_CLASSIC',
  title: 'Vita Malchi Monachi Captivi',
  canonicalRef: 'Vita Malchi Monachi Captivi',
  author: 'Jerome',
  language: 'lat',
  direction: 'ltr',
  level: 'B1',
  period: 'c. 391 CE',
  genre: 'hagiography',
  corpusType: 'patristic',
  tags: ['Church Fathers', 'Christian Latin'],
  sourceAttributionId: 'public-domain-edition',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 174,
  wordCount: 2034,
  remoteSections: true,
  sectionsPreview: [
    { id: 'lat-jerome-vita-malchi-full-1', label: 'Vita Malchi' },
  ],
};

export const ALL_LATIN_FATHERS_FULL_TEXTS: Text[] = [
  TEXT_AUGUSTINE_CONFESSIONES,
  TEXT_TERTULLIAN_APOLOGETICUM,
  TEXT_JEROME_VITA_PAULI,
  TEXT_JEROME_VITA_MALCHI,
];
