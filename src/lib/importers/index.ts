import { SblgntAdapter } from './adapters/sblgnt';
import { OshbAdapter } from './adapters/oshb';
import { StepBibleAdapter } from './adapters/stepbible';
import { OglAdapter } from './adapters/ogl';
import { LatinCorpusAdapter } from './adapters/latin';
import { ContentSourceAdapter } from './types';

export const adapters: Record<string, ContentSourceAdapter> = {
  [SblgntAdapter.id]: SblgntAdapter,
  [OshbAdapter.id]: OshbAdapter,
  [StepBibleAdapter.id]: StepBibleAdapter,
  [OglAdapter.id]: OglAdapter,
  [LatinCorpusAdapter.id]: LatinCorpusAdapter
};

export function getAdapter(id: string): ContentSourceAdapter | undefined {
  return adapters[id];
}
