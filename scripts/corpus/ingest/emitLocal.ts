/**
 * Alternative sink to {@link pushToFirestore}: write an assembled text to the
 * file-served local corpus as a **static CDN asset** under `public/corpus-data/`,
 * fetched directly by the client (`corpusService`) — NOT through the serverless
 * API, which has a deploy size limit. Needs no credentials. One
 * `{ text, sections }` record per file, plus an `index.json` listing them.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { IngestedText } from './types.js';

export const LOCAL_CORPUS_DIR = 'public/corpus-data';

export interface EmitLocalResult {
  textId: string;
  sectionsWritten: number;
  path: string;
}

interface IndexItem {
  id: string;
  title: string;
  languageId: string;
  sourceStatus?: string;
  isSample: boolean;
  sentenceCount: number;
  sectionsPreview: { id: string; label: string }[];
  source: 'local';
}

/** Rebuild index.json from all per-text records in the dir. */
function rebuildIndex(dir: string): void {
  const items: IndexItem[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json') || file === 'index.json') continue;
    try {
      const { text } = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as IngestedText;
      items.push({
        id: text.id,
        title: text.title,
        languageId: (text as any).languageId || text.language,
        sourceStatus: text.sourceStatus,
        isSample: text.isSample ?? false,
        sentenceCount: text.sentenceCount ?? 0,
        sectionsPreview: text.sectionsPreview ?? [],
        source: 'local',
      });
    } catch {
      // skip malformed
    }
  }
  items.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(join(dir, 'index.json'), JSON.stringify(items), 'utf-8');
}

export function emitLocal(ingested: IngestedText, dir = LOCAL_CORPUS_DIR): EmitLocalResult {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${ingested.text.id}.json`);
  // No pretty-print: these files can be large (whole books) and are machine-read.
  writeFileSync(path, JSON.stringify({ text: ingested.text, sections: ingested.sections }), 'utf-8');
  if (existsSync(dir)) rebuildIndex(dir);
  return { textId: ingested.text.id, sectionsWritten: ingested.sections.length, path };
}
