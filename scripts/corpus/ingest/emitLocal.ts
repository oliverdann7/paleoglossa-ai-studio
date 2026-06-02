/**
 * Alternative sink to {@link pushToFirestore}: write an assembled text to the
 * file-served local corpus (`api/_data/corpus/<textId>.json`) that
 * `api/_lib/localCorpus.ts` serves. Needs no credentials, and the JSON is read
 * on the server on demand — so a completed full text reaches the Reader without
 * touching the eager `corpus` JS bundle. One `{ text, sections }` record per file.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { IngestedText } from './types.js';

export const LOCAL_CORPUS_DIR = 'api/_data/corpus';

export interface EmitLocalResult {
  textId: string;
  sectionsWritten: number;
  path: string;
}

export function emitLocal(ingested: IngestedText, dir = LOCAL_CORPUS_DIR): EmitLocalResult {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${ingested.text.id}.json`);
  // No pretty-print: these files can be large (whole Bible books) and are
  // machine-read only.
  writeFileSync(path, JSON.stringify({ text: ingested.text, sections: ingested.sections }), 'utf-8');
  return { textId: ingested.text.id, sectionsWritten: ingested.sections.length, path };
}
