import { MorphologyService } from './morphologyService';

export function runMorphologyServiceTests() {
  console.log('--- Morphology Service Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ ${message}`);
      failed++;
    }
  }

  const greek = MorphologyService.getTokenAnalysis('jn2');
  assert(!!greek, 'Greek token analysis resolves');
  assert(greek?.languageId === 'grc-koine', 'Greek token has language id');
  assert(greek?.morphology.case === 'dative', 'Greek morphology preserves case');
  assert(greek?.morphology.number === 'singular', 'Greek morphology preserves number');

  const hebrew = MorphologyService.getTokenAnalysis('g3');
  assert(!!hebrew, 'Hebrew token analysis resolves');
  assert(hebrew?.languageId === 'hbo', 'Hebrew token has language id');
  assert(hebrew?.morphology.partOfSpeech === 'verb', 'Hebrew morphology preserves part of speech');

  const latin = MorphologyService.getTokenAnalysis('a1');
  assert(!!latin, 'Latin token analysis resolves');
  assert(latin?.languageId === 'lat', 'Latin token has language id');
  assert(latin?.morphology.case === 'accusative', 'Latin morphology preserves case');

  const compact = MorphologyService.formatMorphologyForDisplay('grc', greek?.morphology);
  assert(compact.compact.includes('noun'), 'Greek compact morphology includes POS');
  assert(compact.expanded.length > 0, 'Greek expanded morphology has rows');
  assert(!compact.missing, 'Greek morphology is not missing');

  const raw = MorphologyService.normalizeMorphology('V-PAI-3S');
  assert(raw.raw === 'V-PAI-3S', 'Raw morphology strings are preserved');

  const missing = MorphologyService.formatMorphologyForDisplay('uga', null);
  assert(missing.missing, 'Missing morphology fails gracefully');
  assert(missing.compact === 'Morphology unavailable', 'Missing morphology has fallback compact label');

  const lemma = MorphologyService.getLemmaInfo('λόγος', 'grc-koine');
  assert(!!lemma, 'Lemma info resolves from dictionary');
  assert(lemma?.gloss !== '', 'Lemma info includes gloss');

  console.log(`--- Results: ${passed} passed, ${failed} failed ---`);
  return { passed, failed };
}
