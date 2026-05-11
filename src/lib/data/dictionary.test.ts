import {
  findDictionaryEntry,
  getDictionaryEntries,
  searchDictionaryEntries,
} from './dictionary';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

export function runDictionaryTests() {
  const entries = getDictionaryEntries();
  assert(entries.length > 0, 'Dictionary index contains corpus-derived entries');

  const logos = findDictionaryEntry('λόγος', 'grc-koine');
  assert(!!logos, 'Lemma lookup resolves a Koine Greek dictionary entry');
  assert(logos?.shortGloss && logos.shortGloss !== 'Definition unavailable', 'Entry includes a short gloss');
  assert((logos?.corpusExamples.length || 0) > 0, 'Entry includes corpus examples');
  assert((logos?.dictionaries.length || 0) > 0, 'Entry includes source/license metadata');

  const surfaceResults = searchDictionaryEntries('Ἐν', 'grc-koine');
  assert(surfaceResults.some(entry => entry.lemma === 'ἐν'), 'Surface-form search maps to lemma entries');

  const filtered = searchDictionaryEntries('created', 'hbo');
  assert(filtered.every(entry => entry.languageId === 'hbo'), 'Language filter restricts dictionary search');
}
