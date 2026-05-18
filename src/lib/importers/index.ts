import { SblgntAdapter } from './adapters/sblgnt.js';
import { OshbAdapter } from './adapters/oshb.js';
import { StepBibleAdapter } from './adapters/stepbible.js';
import { OglAdapter } from './adapters/ogl.js';
import { LatinCorpusAdapter } from './adapters/latin.js';
import { ContentSourceAdapter } from './types.js';

export const adapters: Record<string, ContentSourceAdapter> = {
  [SblgntAdapter.id]: SblgntAdapter,
  [OshbAdapter.id]: OshbAdapter,
  [StepBibleAdapter.id]: StepBibleAdapter,
  [OglAdapter.id]: OglAdapter,
  [LatinCorpusAdapter.id]: LatinCorpusAdapter,
};

export function getAdapter(id: string): ContentSourceAdapter | undefined {
  return adapters[id];
}
