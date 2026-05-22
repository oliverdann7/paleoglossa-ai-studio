#!/usr/bin/env node
/**
 * Build script — download STEPBible TBESH (Hebrew) and TBESG (Greek)
 * lexicons, parse the Tab-separated records, and write compact JSON to
 * public/lexicons/ for the runtime stepBibleService to lazy-load.
 *
 * Source: https://github.com/STEPBible/STEPBible-Data
 * Licence: CC BY 4.0 (attribute STEPBible.org)
 *
 * Run with: `node scripts/build-stepbible.mjs`
 *
 * Output:
 *   public/lexicons/stepbible-hebrew.json
 *   public/lexicons/stepbible-greek.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public/lexicons');

const SOURCES = [
  {
    name: 'greek',
    url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Greek%20-%20STEPBible.org%20CC%20BY.txt',
    strongsPrefix: 'G',
    languageId: 'grc',
  },
  {
    name: 'hebrew',
    url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew%20-%20STEPBible.org%20CC%20BY.txt',
    strongsPrefix: 'H',
    languageId: 'hbo',
  },
];

function stripHtml(s) {
  return s
    .replace(/<ref[^>]*>.*?<\/ref>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const HEBREW_DIACRITICS = /[֑-ׇ]/g;
const GREEK_DIACRITICS = /[̀-ͯ]/g;

function normalizeHebrew(s) {
  return s
    .replace(/[​-‏﻿]/g, '')
    .normalize('NFD')
    .replace(HEBREW_DIACRITICS, '')
    .normalize('NFC');
}

function normalizeGreek(s) {
  return s
    .replace(/[​-‏﻿]/g, '')
    .normalize('NFD')
    .replace(GREEK_DIACRITICS, '')
    .normalize('NFC')
    .toLowerCase();
}

/** Parse one TBESG/TBESH file and return entries keyed by normalized lemma. */
function parseTbe(text, source) {
  const lines = text.split('\n');
  // Match lines beginning with eStrong + tab. Lines that start with G####/H####
  // and contain at least 6 tabs are lexical entries.
  const prefix = source.strongsPrefix;
  const lemmaRe = new RegExp(`^${prefix}\\d{4}\\t`);
  const entries = [];
  for (const rawLine of lines) {
    if (!lemmaRe.test(rawLine)) continue;
    const fields = rawLine.split('\t');
    if (fields.length < 8) continue;
    const [eStrong, , uStrong, lemmaField, translit, morphCode, gloss, definitionHtml] = fields;
    const lemma = (lemmaField || '').split(',')[0].trim();
    if (!lemma) continue;
    const definition = stripHtml(definitionHtml || '');
    const cleanGloss = stripHtml(gloss || '');
    if (!cleanGloss && !definition) continue;
    entries.push({
      eStrong: eStrong.trim(),
      uStrong: (uStrong || '').trim(),
      lemma,
      transliteration: (translit || '').trim(),
      morphCode: (morphCode || '').trim(),
      gloss: cleanGloss,
      definition,
    });
  }

  // Group by normalized lemma. Multiple Strong's can share a lemma; keep all.
  const normalize = source.languageId === 'hbo' ? normalizeHebrew : normalizeGreek;
  const grouped = new Map();
  for (const e of entries) {
    const key = normalize(e.lemma);
    if (!key) continue;
    const arr = grouped.get(key);
    if (arr) arr.push(e);
    else grouped.set(key, [e]);
  }
  return Object.fromEntries(grouped);
}

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  for (const source of SOURCES) {
    console.log(`Fetching ${source.name}…`);
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
    }
    const text = await response.text();
    console.log(`  ${text.length.toLocaleString()} bytes downloaded`);
    const grouped = parseTbe(text, source);
    const lemmaCount = Object.keys(grouped).length;
    const entryCount = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
    const outPath = path.join(PUBLIC_DIR, `stepbible-${source.name}.json`);
    await fs.writeFile(outPath, JSON.stringify(grouped), 'utf8');
    const stats = await fs.stat(outPath);
    console.log(
      `  ${source.name}: ${lemmaCount.toLocaleString()} unique lemmas, ${entryCount.toLocaleString()} entries, ${(stats.size / 1024).toFixed(0)} KB → ${outPath}`
    );
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
