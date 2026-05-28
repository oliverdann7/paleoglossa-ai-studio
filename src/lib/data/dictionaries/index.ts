/**
 * Compact static dictionaries — one lemma → one English gloss.
 *
 * Each language file exports a Record<string, string> keyed by lemma.
 * Files are eagerly imported here (they're just string maps, small enough).
 * The unified lookup function tries exact match, then lowercase, then
 * accent-stripped, then (for Hebrew) consonantal form.
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
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function stripHebrewVowels(s: string): string {
  return s.replace(/[֑-ְׇ-ֽֿׁׂ]/g, '');
}

/**
 * Look up a lemma in the static dictionaries. Returns the gloss string
 * or null if no entry exists. Tries exact → lowercase → diacritic-stripped
 * → (Hebrew) consonantal.
 */
export function staticLookup(lemma: string, languageId: string): string | null {
  const dict = LANG_DICTS[languageId];
  if (!dict) return null;

  // 1. Exact
  if (dict[lemma] !== undefined) return dict[lemma];

  // 2. Lowercase
  const lower = lemma.toLowerCase();
  if (lower !== lemma && dict[lower] !== undefined) return dict[lower];

  // 3. Diacritic-stripped
  const stripped = stripDiacritics(lemma).toLowerCase();
  if (stripped !== lower) {
    for (const key of Object.keys(dict)) {
      if (stripDiacritics(key).toLowerCase() === stripped) return dict[key];
    }
  }

  // 4. Hebrew consonantal fallback
  if (languageId === 'hbo') {
    const consonantal = stripHebrewVowels(lemma);
    if (consonantal !== lemma) {
      for (const key of Object.keys(dict)) {
        if (stripHebrewVowels(key) === consonantal) return dict[key];
      }
    }
  }

  return null;
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
