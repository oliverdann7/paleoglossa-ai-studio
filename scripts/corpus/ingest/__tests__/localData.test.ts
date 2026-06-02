import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * The completed full texts are served as static CDN assets under
 * public/corpus-data/ (fetched by corpusService, not the serverless API). These
 * tests assert the committed data is well-formed and matches the shape the
 * Reader consumes.
 */
const DIR = 'public/corpus-data';

describe('file-served local corpus (static assets)', () => {
  it('has an index listing completed texts', () => {
    const index = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf-8'));
    expect(Array.isArray(index)).toBe(true);
    const ids = new Set(index.map((t: any) => t.id));
    expect(ids.has('grc-koine-mark-full')).toBe(true);
    expect(ids.has('hbo-genesis-full')).toBe(true);
    for (const t of index) {
      expect(t.id).toBeTruthy();
      expect(t.languageId).toBeTruthy();
      expect(Array.isArray(t.sectionsPreview)).toBe(true);
      expect(t.source).toBe('local');
    }
  });

  it('every indexed text has a record with Reader-shaped, complete-enough tokens', () => {
    const index = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf-8'));
    for (const meta of index) {
      const file = join(DIR, `${meta.id}.json`);
      expect(existsSync(file), `${meta.id}.json missing`).toBe(true);
      const rec = JSON.parse(readFileSync(file, 'utf-8'));
      expect(rec.text.id).toBe(meta.id);
      expect(rec.sections.length).toBeGreaterThan(0);
      const tok = rec.sections[0].sentences[0].tokens[0];
      expect(tok.surface).toBeTruthy();
      // morphology is an object with partOfSpeech (may be 'unknown' for partial texts)
      expect(tok.morphology).toBeDefined();
    }
  });
});
