import { CorpusDB } from '../src/data/corpus.js';
import fs from 'fs';
import path from 'path';

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

// Reporting
const reportsDir = 'reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// JSON Report
const jsonReport = {
  generatedAt: new Date().toISOString(),
  metrics: langMetrics,
};
fs.writeFileSync(path.join(reportsDir, 'corpus-quality.json'), JSON.stringify(jsonReport, null, 2));

// Markdown Report
let mdReport = `# Corpus Quality Report\n\nGenerated at: ${jsonReport.generatedAt}\n\n`;
mdReport += `## Summary\n\n| Language | Texts | Tokens | Gloss % | POS % | Morph % |\n|---|---|---|---|---|---|\n`;
Object.entries(langMetrics).forEach(([lang, m]) => {
  mdReport += `| ${lang} | ${m.texts} | ${m.tokens} | ${m.tokens ? Math.round((m.tokensWithGloss / m.tokens) * 100) : 0}% | ${m.tokens ? Math.round((m.tokensWithPos / m.tokens) * 100) : 0}% | ${m.tokens ? Math.round((m.tokensWithMorphBeyondPos / m.tokens) * 100) : 0}% |\n`;
});
mdReport += `\n## Top missing POS lemmas\n\n`;
Object.entries(langMetrics).forEach(([lang, m]) => {
  const sorted = Object.entries(m.missingLemmas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  mdReport += `### ${lang}\n${sorted.map(([l, c]) => `- ${l} (${c})`).join('\n')}\n\n`;
});
fs.writeFileSync(path.join(reportsDir, 'corpus-quality.md'), mdReport);

console.log('Reports saved to reports/');

// Check mode
if (process.argv.includes('--check')) {
  let hasFailure = false;
  Object.entries(langMetrics).forEach(([lang, m]) => {
    if (m.tokens === 0) {
      console.error(`Language ${lang} has 0 tokens.`);
      hasFailure = true;
    }
    // Thresholds: minimal sanity check (e.g., > 0% if tokens > 0)
    // Add real thresholds here later if needed
  });
  if (hasFailure) process.exit(1);
}
