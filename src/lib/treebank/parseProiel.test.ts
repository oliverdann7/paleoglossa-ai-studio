import { describe, it, expect } from 'vitest';
import { parseProielXml } from './parseProiel';

const ILIAD_1_1 = `<?xml version="1.0" encoding="UTF-8"?>
<proiel>
  <source id="iliad">
    <div>
      <sentence id="100" citation-part="Hom. Il. 1.1-2" status="reviewed">
        <token id="10" form="μῆνιν" lemma="μῆνις" part-of-speech="Nb" morphology="-s---fa-" head-id="11" relation="obj"/>
        <token id="11" form="ἄειδε" lemma="ἀείδω" part-of-speech="V-" morphology="2spia----" relation="pred"/>
        <token id="12" form="θεὰ" lemma="θεά" part-of-speech="Nb" morphology="-s---fv-" head-id="11" relation="voc"/>
      </sentence>
      <sentence id="101" citation-part="Hom. Il. 1.3">
        <token id="20" form="πολλὰς" lemma="πολύς" head-id="21" relation="atr"/>
        <token id="21" form="ψυχάς" lemma="ψυχή" relation="obj"/>
      </sentence>
    </div>
  </source>
</proiel>`;

describe('parseProielXml', () => {
  it('parses two sentences from a minimal PROIEL document', () => {
    const sentences = parseProielXml(ILIAD_1_1);
    expect(sentences).toHaveLength(2);
  });

  it('extracts source, citation, and source-internal id per sentence', () => {
    const [first, second] = parseProielXml(ILIAD_1_1);
    expect(first.source).toBe('proiel');
    expect(first.sourceSentenceId).toBe('100');
    expect(first.citation).toBe('Hom. Il. 1.1-2');
    expect(second.sourceSentenceId).toBe('101');
    expect(second.citation).toBe('Hom. Il. 1.3');
  });

  it('remaps PROIEL token ids to 0-based indexes', () => {
    const [first] = parseProielXml(ILIAD_1_1);
    expect(first.tokens.map((t) => t.index)).toEqual([0, 1, 2]);
    expect(first.tokens.map((t) => t.surface)).toEqual(['μῆνιν', 'ἄειδε', 'θεὰ']);
  });

  it('rewrites head pointers through the id→index map', () => {
    const [first] = parseProielXml(ILIAD_1_1);
    // μῆνιν.head-id=11 → ἄειδε (index 1)
    expect(first.tokens[0].head).toBe(1);
    // ἄειδε has no head-id → root (-1)
    expect(first.tokens[1].head).toBe(-1);
    // θεὰ.head-id=11 → ἄειδε (index 1)
    expect(first.tokens[2].head).toBe(1);
  });

  it('preserves morphology and falls back surface→lemma when lemma missing', () => {
    const [first] = parseProielXml(ILIAD_1_1);
    expect(first.tokens[0].morphology).toBe('-s---fa-');
    expect(first.tokens[0].lemma).toBe('μῆνις');

    const xml = `<proiel><sentence id="1"><token id="1" form="foo"/></sentence></proiel>`;
    const [s] = parseProielXml(xml);
    expect(s.tokens[0].lemma).toBe('foo');
  });

  it('defaults relation to "dep" when PROIEL omits it', () => {
    const xml = `<proiel><sentence id="1"><token id="1" form="x" lemma="x"/></sentence></proiel>`;
    const [s] = parseProielXml(xml);
    expect(s.tokens[0].relation).toBe('dep');
  });

  it('skips sentences that have no tokens', () => {
    const xml = `<proiel>
      <sentence id="1"></sentence>
      <sentence id="2"><token id="1" form="x" lemma="x"/></sentence>
    </proiel>`;
    const sentences = parseProielXml(xml);
    expect(sentences).toHaveLength(1);
    expect(sentences[0].sourceSentenceId).toBe('2');
  });

  it('decodes the standard XML entities in attribute values', () => {
    const xml = `<proiel><sentence id="1"><token id="1" form="a&amp;b" lemma="a&apos;b"/></sentence></proiel>`;
    const [s] = parseProielXml(xml);
    expect(s.tokens[0].surface).toBe('a&b');
    expect(s.tokens[0].lemma).toBe("a'b");
  });

  it('drops head references to tokens that do not exist in the sentence', () => {
    const xml = `<proiel><sentence id="1">
      <token id="1" form="x" head-id="999" relation="obj"/>
    </sentence></proiel>`;
    const [s] = parseProielXml(xml);
    expect(s.tokens[0].head).toBe(-1);
  });
});
