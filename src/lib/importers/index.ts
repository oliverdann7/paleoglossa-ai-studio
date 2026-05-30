import { SblgntAdapter } from './adapters/sblgnt.js';
import { OshbAdapter } from './adapters/oshb.js';
import { StepBibleAdapter } from './adapters/stepbible.js';
import { OglAdapter } from './adapters/ogl.js';
import { LatinCorpusAdapter } from './adapters/latin.js';
import { ContentSourceAdapter } from './types.js';

// Production adapters — fully implemented end-to-end.
export const adapters: Record<string, ContentSourceAdapter> = {
  [SblgntAdapter.id]: SblgntAdapter,
  [OshbAdapter.id]: OshbAdapter,
  [LatinCorpusAdapter.id]: LatinCorpusAdapter,
};

// Planned adapters — exported for type-checking and registry tests, but not
// surfaced in the import UI until their fetch/normalize pipelines are written.
// See `src/lib/importers/adapters/{ogl,stepbible}.ts`.
export const plannedAdapters: Record<string, ContentSourceAdapter> = {
  [OglAdapter.id]: OglAdapter,
  [StepBibleAdapter.id]: StepBibleAdapter,
};

export function getAdapter(id: string): ContentSourceAdapter | undefined {
  return adapters[id] ?? plannedAdapters[id];
}
