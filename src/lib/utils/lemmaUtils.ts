/**
 * Accent-insensitive lemma skeleton, for search and dictionary matching.
 *
 * NOT a vocabulary identity: it ignores the language, so it collides across
 * languages that share a script. Anything that reads or writes the user's
 * vocabulary must use `vocabKey` / `vocabDocId` from `lib/vocabulary/identity`.
 */
export { legacyLemmaKey as normalizeLemmaKey } from '../vocabulary/identity.js';
