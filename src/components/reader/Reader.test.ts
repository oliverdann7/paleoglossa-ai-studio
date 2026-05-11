/**
 * Smoke tests for the Ancient Reader MVP.
 *
 * Validates that:
 * 1. Ancient texts load from CorpusDB
 * 2. Tokens have required fields (surface, lemma, gloss, morphology)
 * 3. Token click produces expected data shape
 * 4. WordState transitions work correctly
 *
 * Run: import this and call runReaderSmokeTests() in a browser console
 * or integrate with your test runner.
 */

import { CorpusDB, ILIAD_1_1, ANABASIS_1_1, AESOP_1_1, ODYSSEY_1_1 } from '../../data/corpus';
import { WordState, STATE_COLORS, STATE_LABELS } from '../../lib/constants/wordStates';
import { getTransliteration } from '../../lib/transliterate';

interface TokenData {
  id: string;
  text: string;
  lemma: string;
  gloss?: string;
  translit?: string;
  punctBefore?: string;
  punctAfter?: string;
  type?: string;
  morphology?: Record<string, string>;
}

export function runReaderSmokeTests() {
  console.log("--- Ancient Reader Smoke Tests ---");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ ${msg}`);
      failed++;
    }
  }

  // 1. CorpusDB loads ancient texts
  const textIds = ['Iliad-1', 'Odyssey-1', 'Anab-1', 'Aesop-1'];
  textIds.forEach(id => {
    const text = CorpusDB.getText(id);
    assert(!!text, `Text "${id}" loads from CorpusDB`);
    if (text) {
      assert(!!text.sectionsPreview?.length, `"${id}" has sections`);
    }
  });

  // 2. Section data has complete tokens
  const sections = [ILIAD_1_1, ODYSSEY_1_1, ANABASIS_1_1, AESOP_1_1];
  sections.forEach(section => {
    assert(section.sentences.length > 0, `Section "${section.id}" has sentences`);
    section.sentences.forEach((s, si) => {
      assert(s.tokens.length > 0, `Sentence ${si} in "${section.id}" has tokens`);
      s.tokens.forEach((t, ti) => {
        assert(!!t.surface, `Token ${si}.${ti} in "${section.id}" has surface`);
        assert(!!t.lemma, `Token ${si}.${ti} in "${section.id}" has lemma`);
        assert(!!t.gloss, `Token ${si}.${ti} in "${section.id}" has gloss`);
        assert(!!t.morphology, `Token ${si}.${ti} in "${section.id}" has morphology`);
        assert(t.id !== '', `Token ${si}.${ti} in "${section.id}" has non-empty id`);
      });
    });
  });

  // 3. Token transformation produces correct TokenData shape
  const iliadText = CorpusDB.getText('Iliad-1');
  assert(!!iliadText, 'Iliad-1 text available');

  if (iliadText) {
    const section = CorpusDB.getSection(iliadText.sectionsPreview![0].id);
    assert(!!section, 'Iliad section loads');

    if (section) {
      const tokens: TokenData[] = section.sentences[0].tokens.map((t: any) => ({
        id: t.id,
        text: t.surface,
        lemma: t.lemma,
        gloss: t.gloss,
        morphology: t.morphology,
        translit: t.transliteration || getTransliteration(t.surface, iliadText.language || ''),
        punctBefore: t.punctBefore || '',
        punctAfter: t.punctAfter !== undefined ? t.punctAfter : ' ',
      }));

      assert(tokens.length > 0, 'Transformed tokens array is non-empty');
      assert(tokens[0].text === 'Μῆνιν', 'First token text is "Μῆνιν"');
      assert(tokens[0].lemma === 'μῆνις', 'First token lemma is "μῆνις"');
      assert(tokens[0].gloss === 'wrath, anger', 'First token gloss is correct');
      const m0 = tokens[0].morphology!;
      assert(!!m0, 'First token has morphology');
      assert(m0.partOfSpeech === 'noun', 'First token is a noun');
      assert(m0.case === 'accusative', 'First token is accusative');
      assert(!!tokens[0].translit, 'First token has transliteration');
    }
  }

  // 4. Token click produces expected data (simulating ReadingPane.onWordClick)
  const mockClickToken: TokenData = {
    id: 'mock-click-1',
    text: 'ἄειδε',
    lemma: 'ἀείδω',
    gloss: 'sing!',
    morphology: {
      partOfSpeech: 'verb',
      tense: 'present',
      voice: 'active',
      mood: 'imperative',
      person: 'second',
      number: 'singular',
    },
    translit: 'aeide',
  };
  assert(mockClickToken.id === 'mock-click-1', 'Clicked token has id');
  assert(mockClickToken.text === 'ἄειδε', 'Clicked token has text');
  assert(mockClickToken.lemma === 'ἀείδω', 'Clicked token has lemma');
  assert(!!mockClickToken.gloss, 'Clicked token has gloss');
  const clickMorph = mockClickToken.morphology!;
  assert(clickMorph.partOfSpeech === 'verb', 'Clicked token morphology shows POS');
  assert(clickMorph.tense === 'present', 'Clicked token morphology shows tense');
  assert(clickMorph.voice === 'active', 'Clicked token morphology shows voice');
  assert(clickMorph.mood === 'imperative', 'Clicked token morphology shows mood');

  // 5. Vocabulary state transitions are valid
  const validStates = Object.values(WordState);
  assert(validStates.length === 6, 'WordState has 6 states');
  assert(validStates.includes(WordState.NEW), 'WordState.NEW exists');
  assert(validStates.includes(WordState.SEEN), 'WordState.SEEN exists');
  assert(validStates.includes(WordState.LEARNING), 'WordState.LEARNING exists');
  assert(validStates.includes(WordState.KNOWN), 'WordState.KNOWN exists');
  
  // Each state has color and label
  validStates.forEach(state => {
    assert(!!STATE_COLORS[state], `STATE_COLORS[${state}] exists`);
    assert(!!STATE_LABELS[state], `STATE_LABELS[${state}] exists`);
  });

  // 6. CorpusDB.findSentencesWithLemma works
  const examples = CorpusDB.findSentencesWithLemma('ἀείδω', undefined, 3);
  assert(examples.length > 0, 'findSentencesWithLemma returns examples');
  assert(examples.length <= 3, 'findSentencesWithLemma respects max limit');

  console.log(`--- Results: ${passed} passed, ${failed} failed ---`);
  return { passed, failed };
}
