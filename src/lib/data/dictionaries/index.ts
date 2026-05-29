/**
 * Compact static dictionaries — one lemma → one English gloss.
 *
 * Each language file exports a Record<string, string> keyed by lemma.
 * Files are eagerly imported here (they're just string maps, small enough).
 * The unified lookup function tries exact match, then lowercase, then
 * accent-stripped (in either direction), then (for Hebrew) consonantal.
 */

import { GRC_DICTIONARY } from './grc.js';
import { LAT_DICTIONARY } from './lat.js';
import { HBO_DICTIONARY } from './hbo.js';
import { SYR_DICTIONARY } from './syr.js';
import { COP_DICTIONARY } from './cop.js';
import { ARC_DICTIONARY } from './arc.js';
import { AKK_DICTIONARY } from './akk.js';
import { SAN_DICTIONARY } from './san.js';
import { EGY_DICTIONARY } from './egy.js';
import { HIT_DICTIONARY } from './hit.js';
import { UGA_DICTIONARY } from './uga.js';

const LANG_DICTS: Record<string, Record<string, string>> = {
  grc: GRC_DICTIONARY,
  'grc-koine': GRC_DICTIONARY,
  'grc-class': GRC_DICTIONARY,
  lat: LAT_DICTIONARY,
  'lat-class': LAT_DICTIONARY,
  'lat-med': LAT_DICTIONARY,
  hbo: HBO_DICTIONARY,
  syr: SYR_DICTIONARY,
  cop: COP_DICTIONARY,
  arc: ARC_DICTIONARY,
  akk: AKK_DICTIONARY,
  san: SAN_DICTIONARY,
  egy: EGY_DICTIONARY,
  hit: HIT_DICTIONARY,
  uga: UGA_DICTIONARY,
};

function stripDiacritics(s: string): string {
  // NFD + combining-mark strip, then normalize variant apostrophes & elision
  // marks to a single ASCII form so "ἀλλ᾽", "ἀλλ’", and "αλλ'" all collapse.
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ᾽᾿ʹ]/g, "'");
}

function stripHebrewVowels(s: string): string {
  // Strip Hebrew points U+0591–U+05BD and U+05BF–U+05C7 (vowels, dagesh,
  // cantillation, shin/sin dots, qamats-qatan, paseq). Preserve U+05BE
  // (maqaf) so we can still split maqaf-linked phrases. Also drop any
  // whitespace left over from paseq U+05C0.
  return s
    .replace(/[֑-ֽ]/g, '')
    .replace(/[ֿ-ׇ]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Look up a lemma in the static dictionaries. Returns the gloss string
 * or null if no entry exists. Tries exact → lowercase → diacritic-stripped
 * (both directions) → (Hebrew) consonantal → maqaf-split.
 */
export function staticLookup(lemma: string, languageId: string): string | null {
  const dict = LANG_DICTS[languageId];
  if (!dict) return null;

  // 1. Exact
  if (dict[lemma] !== undefined) return dict[lemma];

  // 2. Lowercase
  const lower = lemma.toLowerCase();
  if (lower !== lemma && dict[lower] !== undefined) return dict[lower];

  // 3. Diacritic-stripped — always run, in either direction.
  // The corpus often holds bare-form lemmas (e.g. "και") while dict keys
  // are polytonic ("καί"); we also still want to match when the lemma
  // itself carries diacritics but a stripped key does not.
  const stripped = stripDiacritics(lemma).toLowerCase();
  const idx = getStrippedIndex(languageId);
  const hit = idx.get(stripped);
  if (hit !== undefined) return dict[hit];

  // 4. Hebrew consonantal fallback
  if (languageId === 'hbo') {
    const consonantal = stripHebrewVowels(lemma);
    const hIdx = getHebrewConsonantalIndex();
    const hHit = hIdx.get(consonantal);
    if (hHit !== undefined) return dict[hHit];

    // 4b. Maqaf-linked tokens like "אֶל-יוֹנָה" or "וַֽיְהִי־עֶ֥רֶב":
    // try each part separately and join the resulting glosses.
    if (/[-־]/.test(consonantal)) {
      const parts = consonantal.split(/[-־]+/).filter(Boolean);
      if (parts.length > 1) {
        const glosses: string[] = [];
        for (const part of parts) {
          const partHit = hIdx.get(part);
          if (partHit !== undefined) glosses.push(dict[partHit]);
          else glosses.push('?');
        }
        if (glosses.some((g) => g !== '?')) return glosses.join(' • ');
      }
    }
  }

  return null;
}

// Per-language indexes of dict keys by their diacritic-stripped lowercase form,
// built lazily on first lookup. This lets us match bare-form lemmas in the
// corpus against polytonic / vocalized dictionary keys cheaply.
const STRIPPED_INDEXES: Record<string, Map<string, string>> = {};
const HEBREW_CONSONANTAL_INDEX: Map<string, string> = new Map();
let hebrewIndexBuilt = false;

function getStrippedIndex(languageId: string): Map<string, string> {
  if (STRIPPED_INDEXES[languageId]) return STRIPPED_INDEXES[languageId];
  const dict = LANG_DICTS[languageId];
  const idx = new Map<string, string>();
  if (dict) {
    for (const key of Object.keys(dict)) {
      const stripped = stripDiacritics(key).toLowerCase();
      // First key wins — preserves the most canonical form already listed.
      if (!idx.has(stripped)) idx.set(stripped, key);
    }
  }
  STRIPPED_INDEXES[languageId] = idx;
  return idx;
}

function getHebrewConsonantalIndex(): Map<string, string> {
  if (hebrewIndexBuilt) return HEBREW_CONSONANTAL_INDEX;
  const dict = LANG_DICTS['hbo'];
  if (dict) {
    for (const key of Object.keys(dict)) {
      const consonantal = stripHebrewVowels(key);
      if (!HEBREW_CONSONANTAL_INDEX.has(consonantal)) {
        HEBREW_CONSONANTAL_INDEX.set(consonantal, key);
      }
    }
  }
  hebrewIndexBuilt = true;
  return HEBREW_CONSONANTAL_INDEX;
}

export function getStaticDictSize(languageId: string): number {
  return Object.keys(LANG_DICTS[languageId] || {}).length;
}

export function getAllStaticDictSizes(): Record<string, number> {
  const sizes: Record<string, number> = {};
  for (const [lang, dict] of Object.entries(LANG_DICTS)) {
    sizes[lang] = Object.keys(dict).length;
  }
  return sizes;
}
