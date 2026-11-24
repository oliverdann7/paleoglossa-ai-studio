/**
 * Lemma profiles for the served corpus.
 *
 * Reads every served text in public/corpus-data and writes one file per
 * language to public/corpus-data/lemma-profiles/<language>.json: the distinct
 * vocabulary keys of each text with their token counts. The app uses them to
 * measure how much of a served text a learner already knows without fetching
 * the text itself (src/lib/reading/coverage.ts).
 *
 * Run after anything that changes served tokens or lemmas (ingestion,
 * clean-served-corpus, lemmatize-served). `lemmaProfiles.test.ts` fails when
 * the profiles no longer match the served JSON.
 *
 * Usage: npx tsx scripts/corpus/build-lemma-profiles.ts
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  buildLemmaProfile,
  countLemmas,
  type LemmaProfileFile,
} from '../../src/lib/reading/coverage.js';

export const CORPUS_DIR = 'public/corpus-data';
export const PROFILE_DIR = join(CORPUS_DIR, 'lemma-profiles');

interface ServedRecord {
  text: { id: string; language: string };
  sections: { sentences: { tokens: { lemma?: string; surface?: string }[] }[] }[];
}

/** Profiles for every served text, grouped by language. */
export function buildAllProfiles(dir = CORPUS_DIR): Map<string, LemmaProfileFile> {
  const byLanguage = new Map<string, [string, Map<string, number>][]>();
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file === 'index.json') continue;
    const record = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as ServedRecord;
    const { id, language } = record.text;
    const tokens = record.sections.flatMap((s) => s.sentences.flatMap((sent) => sent.tokens));
    const list = byLanguage.get(language) ?? [];
    list.push([id, countLemmas(tokens, language)]);
    byLanguage.set(language, list);
  }
  return new Map(
    [...byLanguage].map(([language, texts]) => [language, buildLemmaProfile(language, texts)])
  );
}

function main() {
  rmSync(PROFILE_DIR, { recursive: true, force: true });
  mkdirSync(PROFILE_DIR, { recursive: true });
  for (const [language, profile] of buildAllProfiles()) {
    const json = JSON.stringify(profile);
    writeFileSync(join(PROFILE_DIR, `${language}.json`), json);
    console.log(
      `${language.padEnd(10)} ${String(Object.keys(profile.texts).length).padStart(3)} texts  ` +
        `${String(profile.lemmas.length).padStart(6)} lemmas  ${(json.length / 1024).toFixed(0)} KB`
    );
  }
}

if (process.argv[1]?.endsWith('build-lemma-profiles.ts')) main();
