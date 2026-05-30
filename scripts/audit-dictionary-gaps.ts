/**
 * Audit static-dictionary coverage of corpus lemmas.
 *
 * For each language, walks every corpus token, collects unique lemmas,
 * and reports which ones have NO entry in the static dictionary
 * (after the same exact → lowercase → diacritic-stripped → Hebrew-consonantal
 * fallbacks that staticLookup() uses at runtime).
 *
 * Output: reports/dictionary-gaps.md and reports/dictionary-gaps.json.
 */
import { CorpusDB } from '../src/data/corpus.js';
import { staticLookup, getAllStaticDictSizes } from '../src/lib/data/dictionaries/index.js';
import fs from 'fs';
import path from 'path';

interface LangGap {
  language: string;
  totalTokens: number;
  uniqueLemmas: number;
  uniqueCovered: number;
  uniqueMissing: number;
  tokensCovered: number;
  coveragePctTokens: number;
  coveragePctLemmas: number;
  topMissing: Array<{ lemma: string; count: number }>;
}

const counts: Record<string, Record<string, number>> = {};

for (const text of CorpusDB.getTexts()) {
  const lang = text.language;
  if (!counts[lang]) counts[lang] = {};
  for (const preview of text.sectionsPreview ?? []) {
    const section = CorpusDB.getSection(preview.id);
    if (!section) continue;
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        const lemma = (token.lemma || token.surface || '').trim();
        if (!lemma) continue;
        counts[lang][lemma] = (counts[lang][lemma] || 0) + 1;
      }
    }
  }
}

const results: LangGap[] = [];

for (const [language, lemmaCounts] of Object.entries(counts)) {
  let tokensCovered = 0;
  let uniqueCovered = 0;
  const missing: Array<{ lemma: string; count: number }> = [];

  for (const [lemma, count] of Object.entries(lemmaCounts)) {
    const gloss = staticLookup(lemma, language);
    if (gloss) {
      tokensCovered += count;
      uniqueCovered++;
    } else {
      missing.push({ lemma, count });
    }
  }

  missing.sort((a, b) => b.count - a.count);

  const totalTokens = Object.values(lemmaCounts).reduce((a, b) => a + b, 0);
  const uniqueLemmas = Object.keys(lemmaCounts).length;
  results.push({
    language,
    totalTokens,
    uniqueLemmas,
    uniqueCovered,
    uniqueMissing: missing.length,
    tokensCovered,
    coveragePctTokens: totalTokens ? Math.round((tokensCovered / totalTokens) * 100) : 0,
    coveragePctLemmas: uniqueLemmas ? Math.round((uniqueCovered / uniqueLemmas) * 100) : 0,
    topMissing: missing.slice(0, 50),
  });
}

results.sort((a, b) => b.totalTokens - a.totalTokens);

const dictSizes = getAllStaticDictSizes();
const reportsDir = 'reports';
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

fs.writeFileSync(
  path.join(reportsDir, 'dictionary-gaps.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), dictSizes, results }, null, 2)
);

let md = `# Static Dictionary Gap Audit\n\nGenerated: ${new Date().toISOString()}\n\n`;
md += `## Coverage Summary\n\n| Lang | Dict | Tokens | Unique lemmas | Token cov | Lemma cov |\n|---|---|---|---|---|---|\n`;
for (const r of results) {
  md += `| ${r.language} | ${dictSizes[r.language] ?? 0} | ${r.totalTokens} | ${r.uniqueLemmas} | ${r.coveragePctTokens}% | ${r.coveragePctLemmas}% |\n`;
}
md += `\n## Top 50 missing lemmas per language\n`;
for (const r of results) {
  if (r.topMissing.length === 0) continue;
  md += `\n### ${r.language} — ${r.uniqueMissing} missing (covers ${r.totalTokens - r.tokensCovered} tokens)\n`;
  for (const m of r.topMissing) md += `- \`${m.lemma}\` × ${m.count}\n`;
}

fs.writeFileSync(path.join(reportsDir, 'dictionary-gaps.md'), md);
console.log('Wrote reports/dictionary-gaps.md');
for (const r of results) {
  console.log(
    `  ${r.language.padEnd(10)} dict=${(dictSizes[r.language] ?? 0).toString().padStart(5)} tokens=${r.totalTokens.toString().padStart(6)} tokenCov=${r.coveragePctTokens}% lemmaCov=${r.coveragePctLemmas}%`
  );
}
