import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { TreebankSentence, TreebankSidecar } from '../../src/lib/treebank/types.js';

/**
 * Lazy in-memory index of treebank sidecars. Sidecars live in
 * `src/data/treebanks/*.json` and are loaded on first lookup.
 *
 * Memory shape: one big map keyed by `${textId}_${sentenceIndex}` so
 * that callers can answer "do we have a treebank for this sentence?"
 * with a single hash lookup, independent of how many sidecars are
 * installed.
 */

let cache: Map<string, TreebankSentence> | null = null;

function treebankDir(): string {
  return process.env.TREEBANK_DIR || join(process.cwd(), 'src', 'data', 'treebanks');
}

function buildIndex(): Map<string, TreebankSentence> {
  const map = new Map<string, TreebankSentence>();
  const dir = treebankDir();
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    // Directory missing is non-fatal — just means no treebank sidecars
    // are installed. The route falls back to Firestore AI annotations.
    return map;
  }

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = readFileSync(join(dir, file), 'utf-8');
      const sidecar = JSON.parse(raw) as TreebankSidecar;
      if (sidecar.schemaVersion !== 1) {
        console.warn(`[treebankIndex] Skipping ${file}: unsupported schemaVersion`);
        continue;
      }
      for (const [key, sentence] of Object.entries(sidecar.sentences)) {
        map.set(key, sentence);
      }
    } catch (e) {
      console.warn(`[treebankIndex] Failed to load ${file}:`, (e as Error).message);
    }
  }
  return map;
}

export function getTreebankSentence(
  textId: string,
  sentenceIndex: number
): TreebankSentence | null {
  if (!cache) cache = buildIndex();
  return cache.get(`${textId}_${sentenceIndex}`) ?? null;
}

/**
 * Clears the in-memory cache. Used by tests to load fresh sidecars
 * between cases; never called in production.
 */
export function _resetTreebankIndexForTests(): void {
  cache = null;
}
