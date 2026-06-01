/**
 * Shared types for the corpus ingestion pipeline
 * (scripts/corpus/ingest/*). The pipeline turns a raw work into fully
 * annotated, Firestore-ready data WITHOUT touching the bundled corpus.
 *
 * Stages:
 *   segment → annotate → glossFill → assemble → pushFirestore
 *
 * The canonical wire shapes (`Text`, `TextSection`, `Sentence`, `Token`) come
 * from src/types/corpus.ts; we re-export the ones the pipeline produces so the
 * scripts stay type-checked against the same contract the Reader consumes.
 */

import type { Sentence, Text, TextSection, Token } from '../../../src/types/corpus.js';

export type { Sentence, Text, TextSection, Token };

/**
 * A pipeline-internal text: canonical `Text` metadata plus the resolved
 * sections it owns. `assemble()` produces this; `pushFirestore()` writes it.
 */
export interface IngestedText {
  text: Text;
  sections: TextSection[];
}

/**
 * One row of token-level annotation from an external scholarly source
 * (treebank / morphology TSV). Keyed positionally to a sentence so we never
 * rely on ambiguous surface-form matching when a form repeats in a sentence.
 */
export interface TokenAnnotation {
  /** Sentence id this token belongs to (e.g. "MAT-1-1"). */
  sentenceId: string;
  /** 0-based index of the token within the sentence. */
  index: number;
  surface: string;
  lemma?: string;
  gloss?: string;
  transliteration?: string;
  /** Morphology bag; MUST carry a real partOfSpeech for "complete" status. */
  morphology?: Record<string, string>;
  /** Trailing punctuation/whitespace that follows the surface, if known. */
  after?: string;
}

/** A sentence before tokenisation: raw source string + optional translation. */
export interface RawSentenceInput {
  id: string;
  src: string;
  translation?: string;
}

/** A section before tokenisation. */
export interface RawSectionInput {
  id: string;
  sequence: number;
  label: string;
  sentences: RawSentenceInput[];
  nextSectionId?: string;
  previousSectionId?: string;
}

/** The full description of a work to ingest, before annotation/gloss-fill. */
export interface WorkInput {
  textId: string;
  language: string;
  /** Metadata merged into the emitted `Text` (title, author, genre, …). */
  meta: Partial<Text> & { title: string };
  sections: RawSectionInput[];
}
