import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { CorpusDB } from '../../corpus.js';
import { HEBREW_LEGACY_LEMMAS } from '../../../lib/vocabulary/hebrewLegacyLemmas.js';
import { normalizeLemma } from '../../../lib/vocabulary/identity.js';

/**
 * A word met in a bundled Hebrew sample must be the same vocabulary item as in
 * the served Hebrew Bible. Both name it by its pointed dictionary form.
 */
describe('bundled Biblical Hebrew lemmas', () => {
  const tokensOf = (textId: string) =>
    (CorpusDB.getText(textId)?.sectionsPreview ?? []).flatMap(
      (preview) => CorpusDB.getSection(preview.id)?.sentences.flatMap((s) => s.tokens) ?? []
    );
  const bundled = CorpusDB.getTextsByLanguage('hbo').filter((t) => !t.remoteSections);

  it('uses no lemma that has been replaced by its dictionary form', () => {
    const legacy = new Set(Object.keys(HEBREW_LEGACY_LEMMAS).map((l) => l.normalize('NFC')));
    const stale = bundled.flatMap((text) =>
      tokensOf(text.id)
        .filter((token) => legacy.has((token.lemma ?? '').normalize('NFC')))
        .map((token) => `${text.id}: ${token.lemma}`)
    );
    expect(stale).toEqual([]);
  });

  it('shares its lemmas with the served text the sample is taken from', () => {
    const profile = JSON.parse(
      readFileSync('public/corpus-data/lemma-profiles/hbo.json', 'utf-8')
    ) as { lemmas: string[] };
    const served = new Set(profile.lemmas);
    for (const textId of ['Heb-Genesis', 'Heb-Jonah', 'Heb-Ruth']) {
      const tokens = tokensOf(textId).filter((token) => token.lemma);
      expect(tokens.length, textId).toBeGreaterThan(100);
      const shared = tokens.filter((token) => served.has(normalizeLemma(token.lemma, 'hbo')));
      // Was 57–68% while the samples named verbs by unpointed root.
      expect(shared.length / tokens.length, textId).toBeGreaterThan(0.95);
    }
  });
});
