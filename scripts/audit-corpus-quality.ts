import { calculateCorpusQuality } from '../src/lib/corpus-quality/calculateCorpusQuality.js';
import fs from 'fs';
import path from 'path';

const report = calculateCorpusQuality();

// Reporting
const reportsDir = 'reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// JSON Report
fs.writeFileSync(path.join(reportsDir, 'corpus-quality.json'), JSON.stringify(report, null, 2));

// Markdown Report
let mdReport = `# Corpus Quality Report\n\nGenerated at: ${report.generatedAt}\n\n`;
mdReport += `## Summary\n\n| Language | Texts | Tokens | Gloss % | POS % | Lemma % | Morph % | Status |\n|---|---|---|---|---|---|---|---|\n`;
for (const lang of report.languages) {
  mdReport += `| ${lang.language} | ${lang.metrics.texts} | ${lang.metrics.tokens} | ${lang.glossCoverage}% | ${lang.posCoverage}% | ${lang.lemmaCoverage}% | ${lang.morphCoverage}% | ${lang.status} |\n`;
}

mdReport += `\n## Top missing POS lemmas\n\n`;
for (const lang of report.languages) {
  const top = lang.topMissingLemmas.slice(0, 5);
  if (top.length > 0) {
    mdReport += `### ${lang.language}\n${top.map((l) => `- ${l.lemma} (${l.count})`).join('\n')}\n\n`;
  }
}
fs.writeFileSync(path.join(reportsDir, 'corpus-quality.md'), mdReport);

console.log('Reports saved to reports/');

// Check mode
if (process.argv.includes('--check')) {
  let hasFailure = false;
  for (const lang of report.languages) {
    if (lang.metrics.tokens === 0) {
      console.error(`Language ${lang.language} has 0 tokens.`);
      hasFailure = true;
    }
  }
  if (hasFailure) process.exit(1);
}
