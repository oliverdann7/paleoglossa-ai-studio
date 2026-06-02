import { describe, it, expect } from 'vitest';
import {
  listLocalCorpus,
  getLocalText,
  getLocalSection,
} from '../_lib/localCorpus.js';
import { validateTextAnnotations } from '../../src/data/corpus/validation.js';

/**
 * The file-served local corpus (api/_data/corpus/*.json) is how full works
 * completed by the ingestion pipeline reach the app without bundle bloat or
 * Firestore credentials. These tests assert the committed data is actually
 * complete and matches the shape the Reader consumes via /api/corpus/*.
 */

describe('local (file-served) corpus', () => {
  it('lists the completed full-text works', () => {
    const ids = new Set(listLocalCorpus().map((t) => t.id));
    expect(ids.has('grc-koine-mark-full')).toBe(true);
    expect(ids.has('hbo-genesis-full')).toBe(true);
  });

  it('language filter narrows the list', () => {
    const grc = listLocalCorpus('grc-koine').map((t) => t.id);
    expect(grc).toContain('grc-koine-mark-full');
    expect(grc).not.toContain('hbo-genesis-full');
  });

  for (const id of ['grc-koine-mark-full', 'hbo-genesis-full']) {
    describe(id, () => {
      const text = getLocalText(id);

      it('is served as a complete, non-sample text with sections', () => {
        expect(text).toBeTruthy();
        expect(text!.sourceStatus).toBe('complete');
        expect(text!.isSample ?? false).toBe(false);
        expect((text!.sectionsPreview ?? []).length).toBeGreaterThan(0);
        expect(text!.sentenceCount ?? 0).toBeGreaterThan(0);
      });

      it('every previewed section resolves with Reader-shaped tokens', () => {
        for (const p of text!.sectionsPreview ?? []) {
          const section = getLocalSection(id, p.id);
          expect(section, `${id}/${p.id}`).toBeTruthy();
          expect(section!.sentences.length).toBeGreaterThan(0);
          const tok = section!.sentences[0].tokens[0];
          expect(tok.surface).toBeTruthy();
          expect(tok.lemma).toBeTruthy();
          expect(tok.gloss).toBeTruthy();
          expect(tok.morphology.partOfSpeech).toBeTruthy();
        }
      });

      it('passes the completeness gate (no POS/gloss/lemma gaps)', () => {
        const sections = (text!.sectionsPreview ?? [])
          .map((p) => getLocalSection(id, p.id))
          .filter((s): s is NonNullable<typeof s> => !!s);
        expect(validateTextAnnotations({ id }, sections)).toEqual([]);
      });
    });
  }
});
