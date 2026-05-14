// ── Script and Language Identifiers ──

export type ScriptDirection = 'ltr' | 'rtl';

export type LanguageCode = string;

export type LanguageId = string;

// ── Core Linguistic Types ──
// These are base types for cross-context use.
// For specific domain models, see:
//   - src/types/corpus.ts        (Token, Sentence, TextSection, Text, Corpus)
//   - src/types/firestore.ts     (ImportedToken, ImportedSentence, VocabularyItem)
//   - src/types/modules.ts       (LemmaEntry, InflectedForm, GrammarConcept)
//   - src/lib/data/dictionary.ts (DictionaryEntry, LookupResult)

export interface LinguisticToken {
  id?: string;
  surface: string;
  normalized?: string;
  lemma?: string;
  gloss?: string;
  transliteration?: string;
  punctBefore?: string;
  punctAfter?: string;
  morphology?: Record<string, string>;
}

export interface GlossEntry {
  lemma: string;
  gloss: string;
  languageId: string;
  language?: string;
  partOfSpeech?: string;
  shortGloss?: string;
  fullDefinition?: string;
  source?: string;
}

export interface GrammarReference {
  concept: string;
  languageId: string;
  category?: string;
  subcategory?: string;
  description?: string;
  difficulty?: string;
}

export interface OccurrenceLocation {
  textId: string;
  textTitle?: string;
  sectionId?: string;
  sectionLabel?: string;
  sentenceId: string;
  tokenId?: string;
  surface?: string;
  lemma?: string;
  sentenceIndex?: number;
  tokenIndex?: number;
}

export interface TextChunk {
  id: string;
  textId: string;
  title?: string;
  language: string;
  languageId?: string;
  direction?: ScriptDirection;
  level?: string;
  sentenceCount?: number;
  metadata?: Record<string, unknown>;
}
