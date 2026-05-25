import { CorpusDB } from '../src/data/corpus.js';
import fs from 'fs';

// Helper to check if a value is meaningful
const isMeaningful = (val: any) => val !== undefined && val !== null && val !== '' && val !== 'unknown';

// Metrics collector
interface Metrics {
  texts: number;
  sections: number;
  sentences: number;
  tokens: number;
  tokensWithGloss: number;
  tokensWithPos: number;
  tokensWithLemma: number;
  tokensWithMorphBeyondPos: number;
  unknownPosTokens: number;
  missingLemmas: Record<string, number>;
}

const emptyMetrics = (): Metrics => ({
  texts: 0,
  sections: 0,
  sentences: 0,
  tokens: 0,
  tokensWithGloss: 0,
  tokensWithPos: 0,
  tokensWithLemma: 0,
  tokensWithMorphBeyondPos: 0,
  unknownPosTokens: 0,
  missingLemmas: {},
});

const allTexts = CorpusDB.getTexts();
const languages = Array.from(new Set(allTexts.map(t => t.language)));
const langMetrics: Record<string, Metrics> = {};
languages.forEach(l => langMetrics[l] = emptyMetrics());

allTexts.forEach(text => {
  const metrics = langMetrics[text.language];
  metrics.texts++;
  
  text.sectionsPreview?.forEach(preview => {
    const section = CorpusDB.getSection(preview.id);
    if (!section) return;
    metrics.sections++;
    
    section.sentences.forEach(sentence => {
      metrics.sentences++;
      sentence.tokens.forEach(token => {
        if (!token.surface && !token.lemma) return;
        metrics.tokens++;
        
        if (isMeaningful(token.gloss)) metrics.tokensWithGloss++;
        if (isMeaningful(token.lemma)) metrics.tokensWithLemma++;
        
        const hasPos = isMeaningful(token.morphology?.partOfSpeech);
        if (hasPos) {
          metrics.tokensWithPos++;
        } else {
          metrics.unknownPosTokens++;
          const lemma = token.lemma || token.surface;
          metrics.missingLemmas[lemma] = (metrics.missingLemmas[lemma] || 0) + 1;
        }

        // Check for morphology beyond just partOfSpeech
        const morphKeys = Object.keys(token.morphology || {});
        if (morphKeys.length > 1 || (morphKeys.length === 1 && morphKeys[0] !== 'partOfSpeech')) {
          metrics.tokensWithMorphBeyondPos++;
        }
      });
    });
  });
});

// Print top 5 missing lemmas per language
console.log('\nTop 5 missing POS lemmas:');
Object.entries(langMetrics).forEach(([lang, m]) => {
  const sorted = Object.entries(m.missingLemmas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(`${lang}:`, sorted.map(([l, c]) => `${l} (${c})`).join(', '));
});

// Update console.table
console.table(Object.entries(langMetrics).map(([lang, m]) => ({
  Language: lang,
  Texts: m.texts,
  Sentences: m.sentences,
  Tokens: m.tokens,
  'Unknown POS': m.unknownPosTokens,
  'Gloss %': m.tokens ? Math.round((m.tokensWithGloss / m.tokens) * 100) : 0,
  'POS %': m.tokens ? Math.round((m.tokensWithPos / m.tokens) * 100) : 0,
  'Morph %': m.tokens ? Math.round((m.tokensWithMorphBeyondPos / m.tokens) * 100) : 0,
})));

fs.writeFileSync('reports/corpus-quality.json', JSON.stringify(langMetrics, null, 2));
console.log('Report saved to reports/corpus-quality.json');
