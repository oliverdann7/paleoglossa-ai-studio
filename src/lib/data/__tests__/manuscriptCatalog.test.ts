import { describe, it, expect } from 'vitest';
import { CURATED_MANUSCRIPTS } from '../manuscriptCatalog';
import { getAvailableLanguages } from '../languages';

/**
 * The curated manuscript catalog is seeded content surfaced read-only in the
 * Manuscripts lab. These guard against malformed or unattributed entries
 * landing silently (broken IIIF links, unknown languages, id collisions).
 */
describe('curated manuscript catalog', () => {
  const validLanguageIds = new Set(getAvailableLanguages().map((l) => l.id));

  it('is non-empty', () => {
    expect(CURATED_MANUSCRIPTS.length).toBeGreaterThan(0);
  });

  it('has unique ids', () => {
    const ids = CURATED_MANUSCRIPTS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry is well-formed and attributed', () => {
    for (const m of CURATED_MANUSCRIPTS) {
      expect(m.id, m.title).toMatch(/^curated-/);
      expect(m.title.trim().length, m.id).toBeGreaterThan(0);
      expect(m.description.trim().length, m.id).toBeGreaterThan(0);
      expect(m.source.trim().length, m.id).toBeGreaterThan(0);
      expect(m.date.trim().length, m.id).toBeGreaterThan(0);
      expect(m.curated, m.id).toBe(true);
      expect(Array.isArray(m.tags), m.id).toBe(true);
      expect(m.tags.length, m.id).toBeGreaterThan(0);
      expect(validLanguageIds.has(m.languageId), `${m.id}: ${m.languageId}`).toBe(true);
    }
  });

  it('points at https IIIF manifests and cover images', () => {
    for (const m of CURATED_MANUSCRIPTS) {
      expect(m.iiifManifestUrl, m.id).toMatch(/^https:\/\//);
      expect(m.iiifManifestUrl, m.id).toMatch(/manifest\.json$/);
      expect(m.imageUrl, m.id).toMatch(/^https:\/\//);
    }
  });
});
