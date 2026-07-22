import {
  calculateCorpusQuality,
  createEmptyMetrics,
  accumulateSection,
  pct,
  type CorpusQualityMetrics,
} from '../src/lib/corpus-quality/calculateCorpusQuality.js';
import fs from 'fs';
import path from 'path';

const report = calculateCorpusQuality();

// ── Served corpus (public/corpus-data) ───────────────────────────────────────
// The full works completed by the ingestion pipeline are served as static JSON
// and never pass through CorpusDB, so calculateCorpusQuality() cannot see
// them. Measure them here with the same token metrics, plus sentence-level
// translation coverage (the served records carry none today — surfacing that
// gap is the point).
interface ServedLanguageReport {
  language: string;
  metrics: CorpusQualityMetrics;
  glossCoverage: number;
  posCoverage: number;
  lemmaCoverage: number;
  morphCoverage: number;
  translationCoverage: number;
}

function auditServedCorpus(dir: string): ServedLanguageReport[] {
  if (!fs.existsSync(dir)) return [];
  const byLanguage = new Map<string, CorpusQualityMetrics>();

  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file === 'index.json') continue;
    const record = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const language: string = record.text?.languageId || record.text?.language || 'unknown';
    let metrics = byLanguage.get(language);
    if (!metrics) {
      metrics = createEmptyMetrics();
      byLanguage.set(language, metrics);
    }
    metrics.texts++;
    for (const section of record.sections ?? []) {
      accumulateSection(metrics, section);
    }
  }

  return Array.from(byLanguage.entries())
    .map(([language, metrics]) => ({
      language,
      metrics,
      glossCoverage: pct(metrics.tokensWithGloss, metrics.tokens),
      posCoverage: pct(metrics.tokensWithPos, metrics.tokens),
      lemmaCoverage: pct(metrics.tokensWithLemma, metrics.tokens),
      morphCoverage: pct(metrics.tokensWithMorphBeyondPos, metrics.tokens),
      translationCoverage: pct(metrics.sentencesWithTranslation, metrics.sentences),
    }))
    .sort((a, b) => b.metrics.tokens - a.metrics.tokens);
}

const servedReports = auditServedCorpus('public/corpus-data');

// Reporting
const reportsDir = 'reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// JSON Report
fs.writeFileSync(
  path.join(reportsDir, 'corpus-quality.json'),
  JSON.stringify({ ...report, servedCorpus: servedReports }, null, 2)
);

// Markdown Report
let mdReport = `# Corpus Quality Report\n\nGenerated at: ${report.generatedAt}\n\n`;
mdReport += `## Summary (bundled corpus)\n\n| Language | Texts | Tokens | Gloss % | POS % | Lemma % | Morph % | Status |\n|---|---|---|---|---|---|---|---|\n`;
for (const lang of report.languages) {
  mdReport += `| ${lang.language} | ${lang.metrics.texts} | ${lang.metrics.tokens} | ${lang.glossCoverage}% | ${lang.posCoverage}% | ${lang.lemmaCoverage}% | ${lang.morphCoverage}% | ${lang.status} |\n`;
}

mdReport += `\n## Served corpus (full works in public/corpus-data)\n\n| Language | Texts | Sentences | Tokens | Gloss % | Lemma % | POS % | Morph % | Translation % |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const lang of servedReports) {
  mdReport += `| ${lang.language} | ${lang.metrics.texts} | ${lang.metrics.sentences} | ${lang.metrics.tokens} | ${lang.glossCoverage}% | ${lang.lemmaCoverage}% | ${lang.posCoverage}% | ${lang.morphCoverage}% | ${lang.translationCoverage}% |\n`;
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
