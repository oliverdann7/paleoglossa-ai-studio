import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { buildAllProfiles, PROFILE_DIR } from './build-lemma-profiles.js';

/**
 * The committed lemma profiles must describe the served corpus as it is. When
 * this fails, run: npx tsx scripts/corpus/build-lemma-profiles.ts
 */
describe('served lemma profiles', () => {
  const expected = buildAllProfiles();

  it('exist for every served language', () => {
    expect(expected.size).toBeGreaterThan(0);
    for (const language of expected.keys()) {
      expect(existsSync(join(PROFILE_DIR, `${language}.json`)), language).toBe(true);
    }
  });

  it('match the served JSON', () => {
    for (const [language, profile] of expected) {
      const committed = JSON.parse(readFileSync(join(PROFILE_DIR, `${language}.json`), 'utf-8'));
      // Compared as strings: a deep diff of 45,000 lemmas is unreadable.
      expect(JSON.stringify(committed) === JSON.stringify(profile), language).toBe(true);
    }
  }, 60_000);
});
