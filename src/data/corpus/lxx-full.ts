/**
 * Full Septuagint books (PD Rahlfs text, dictionary/AI-cache glosses — partial until
 * a commercially-usable parse fills morphology).
 *
 * Only these metadata records are bundled — the section data lives in the
 * file-served corpus (`public/corpus-data/<textId>.json`, emitted by
 * `scripts/corpus/ingest/run-manifest.ts --emit-local`) and is fetched by the
 * Reader through `corpusService` (`remoteSections` on the Text type).
 * Generated from the served JSON; counts locked by validation.test.ts.
 */
import type { Text } from '../../types/corpus.js';


export const TEXT_LXX_GENESIS: Text = {
  id: 'grc-lxx-genesis-full',
  corpusId: 'LXX',
  title: 'Γένεσις',
  canonicalRef: 'Γένεσις',
  author: 'Moses',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'A2',
  period: '3rd century BCE',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Torah'],
  sourceAttributionId: 'lxx-text',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 1569,
  wordCount: 32314,
  remoteSections: true,
  sectionsPreview: [
    { id: 'grc-lxx-genesis-full-1', label: 'Γένεσις' },
  ],
};

export const TEXT_LXX_EXODUS: Text = {
  id: 'grc-lxx-exodus-full',
  corpusId: 'LXX',
  title: 'Ἔξοδος',
  canonicalRef: 'Ἔξοδος',
  author: 'Moses',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'B1',
  period: '3rd century BCE',
  genre: 'narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Torah'],
  sourceAttributionId: 'lxx-text',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 977,
  wordCount: 24508,
  remoteSections: true,
  sectionsPreview: [
    { id: 'grc-lxx-exodus-full-1', label: 'Ἔξοδος' },
  ],
};

export const TEXT_LXX_ISAIAH: Text = {
  id: 'grc-lxx-isaiah-full',
  corpusId: 'LXX',
  title: 'Ἠσαΐας',
  canonicalRef: 'Ἠσαΐας',
  author: 'Isaiah',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'B1',
  period: '3rd–2nd century BCE',
  genre: 'prophetic',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Prophets'],
  sourceAttributionId: 'lxx-text',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 2271,
  wordCount: 35539,
  remoteSections: true,
  sectionsPreview: [
    { id: 'grc-lxx-isaiah-full-1', label: 'Ἠσαΐας' },
  ],
};

export const TEXT_LXX_PROVERBS: Text = {
  id: 'grc-lxx-proverbs-full',
  corpusId: 'LXX',
  title: 'Παροιμίαι',
  canonicalRef: 'Παροιμίαι',
  author: 'Solomon',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'B1',
  period: '3rd–2nd century BCE',
  genre: 'wisdom literature',
  corpusType: 'biblical',
  tags: ['Septuagint', 'wisdom'],
  sourceAttributionId: 'lxx-text',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 925,
  wordCount: 12224,
  remoteSections: true,
  sectionsPreview: [
    { id: 'grc-lxx-proverbs-full-1', label: 'Παροιμίαι' },
  ],
};

export const TEXT_LXX_JONAH: Text = {
  id: 'grc-lxx-jonah-full',
  corpusId: 'LXX',
  title: 'Ἰωνᾶς',
  canonicalRef: 'Ἰωνᾶς',
  author: 'Jonah',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'A2',
  period: '3rd–2nd century BCE',
  genre: 'prophetic narrative',
  corpusType: 'biblical',
  tags: ['Septuagint', 'Twelve Prophets'],
  sourceAttributionId: 'lxx-text',
  hasMorphology: false,
  hasTranslation: false,
  hasTransliteration: false,
  sourceStatus: 'partial',
  isComplete: false,
  isSample: false,
  sentenceCount: 82,
  wordCount: 1290,
  remoteSections: true,
  sectionsPreview: [
    { id: 'grc-lxx-jonah-full-1', label: 'Ἰωνᾶς' },
  ],
};

export const ALL_LXX_FULL_TEXTS: Text[] = [
  TEXT_LXX_GENESIS,
  TEXT_LXX_EXODUS,
  TEXT_LXX_ISAIAH,
  TEXT_LXX_PROVERBS,
  TEXT_LXX_JONAH,
];
