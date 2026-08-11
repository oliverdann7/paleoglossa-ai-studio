import {
  calculateCorpusQuality,
  createEmptyMetrics,
  accumulateSection,
  pct,
  type CorpusQualityMetrics,
} from '../src/lib/corpus-quality/calculateCorpusQuality.js';
import { isJunkToken } from './corpus/ingest/clean.js';
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
  /** Editorial noise (apparatus sigla, bare verse numbers, …) per ingest/clean.ts rules. */
  junkTokens: number;
}

function auditServedCorpus(dir: string): ServedLanguageReport[] {
  if (!fs.existsSync(dir)) return [];
  const byLanguage = new Map<string, CorpusQualityMetrics>();
  const junkByLanguage = new Map<string, number>();

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
    let junk = junkByLanguage.get(language) ?? 0;
    for (const section of record.sections ?? []) {
      accumulateSection(metrics, section);
      for (const sentence of section.sentences ?? []) {
        for (const token of sentence.tokens ?? []) {
          if (isJunkToken(token.surface ?? '', language)) junk++;
        }
      }
    }
    junkByLanguage.set(language, junk);
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
      junkTokens: junkByLanguage.get(language) ?? 0,
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

mdReport += `\n## Served corpus (full works in public/corpus-data)\n\n| Language | Texts | Sentences | Tokens | Gloss % | Lemma % | POS % | Morph % | Translation % | Junk |\n|---|---|---|---|---|---|---|---|---|---|\n`;
for (const lang of servedReports) {
  mdReport += `| ${lang.language} | ${lang.metrics.texts} | ${lang.metrics.sentences} | ${lang.metrics.tokens} | ${lang.glossCoverage}% | ${lang.lemmaCoverage}% | ${lang.posCoverage}% | ${lang.morphCoverage}% | ${lang.translationCoverage}% | ${lang.junkTokens} |\n`;
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
  // The served corpus was junk-scrubbed in 2026-08 (clean-served-corpus.ts);
  // any junk token in a new emit is a pipeline regression.
  for (const lang of servedReports) {
    if (lang.junkTokens > 0) {
      console.error(
        `Served corpus regression: language ${lang.language} has ${lang.junkTokens} junk tokens (apparatus/verse-number noise). Run scripts/corpus/clean-served-corpus.ts.`
      );
      hasFailure = true;
    }
  }
  if (hasFailure) process.exit(1);
}
