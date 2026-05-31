import { describe, it, expect } from 'vitest';
import { CorpusDB } from '../../corpus';

/**
 * Locks in the Caesar "De Bello Gallico" promotion: every previewed token is
 * fully annotated (the completeness gate), and the section-1 dependency
 * annotations that feed the Syntax viewer form valid single-rooted trees.
 */
describe('Caesar — De Bello Gallico (complete + treebank)', () => {
  const text = CorpusDB.getText('Caesar-BG-1');

  it('is registered and marked complete with morphology + syntax', () => {
    expect(text).toBeTruthy();
    expect(text!.sourceStatus).toBe('complete');
    expect(text!.isComplete).toBe(true);
    expect(text!.hasMorphology).toBe(true);
    expect(text!.hasSyntax).toBe(true);
    expect(text!.sectionsPreview!.length).toBe(4);
  });

  it('has no annotation gaps in any previewed token', () => {
    let tokens = 0;
    for (const preview of text!.sectionsPreview!) {
      const section = CorpusDB.getSection(preview.id);
      expect(section, preview.id).toBeTruthy();
      for (const sentence of section!.sentences) {
        for (const token of sentence.tokens) {
          tokens++;
          expect(token.morphology?.partOfSpeech, token.surface).toBeTruthy();
          expect(token.morphology?.partOfSpeech, token.surface).not.toBe('unknown');
          expect(token.gloss.trim(), token.surface).not.toBe('');
          expect(token.lemma.trim(), token.surface).not.toBe('');
        }
      }
    }
    expect(tokens).toBeGreaterThanOrEqual(48);
  });

  it('section 1 carries valid single-rooted dependency trees', () => {
    const section = CorpusDB.getSection('Caes-BG-1')!;
    const annotated = section.sentences.filter((s) =>
      s.tokens.some((t) => t.head != null || t.deprel != null)
    );
    // Several clean sentences are seeded for the Syntax viewer.
    expect(annotated.length).toBeGreaterThanOrEqual(3);

    for (const sentence of annotated) {
      const n = sentence.tokens.length;
      const roots = sentence.tokens.filter((t) => t.head === -1);
      expect(roots.length, `${sentence.id} root count`).toBe(1);
      for (const t of sentence.tokens) {
        expect(t.deprel, `${sentence.id} deprel`).toBeTruthy();
        expect(t.head, `${sentence.id} head`).not.toBeUndefined();
        // head points to a valid token index or the root sentinel
        expect(t.head === -1 || (t.head! >= 0 && t.head! < n), `${sentence.id} head range`).toBe(
          true
        );
        expect(t.head, `${sentence.id} no self-loop`).not.toBe(sentence.tokens.indexOf(t));
        expect(t.treebankSource, `${sentence.id} provenance`).toBeTruthy();
      }
    }
  });
});
