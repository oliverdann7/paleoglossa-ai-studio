/**
 * Pure structural validator for TextSection / Sentence / Token data.
 *
 * The TypeScript types in src/types/corpus.ts catch most shape errors at
 * compile time, but anything that lands at runtime — bulk-imported JSON,
 * Firestore-loaded sidecars, future user-imported texts — needs the same
 * invariants enforced explicitly. This module is the single place to do
 * that; both the bulk importer and the CI corpus test call into it.
 */

import type { Sentence, TextSection, Token } from '../../types/corpus.js';

export interface SectionValidationIssue {
  /** JSON-path-like locator: section.sentences[2].tokens[5] */
  path: string;
  message: string;
}

function pushIssue(issues: SectionValidationIssue[], path: string, message: string) {
  issues.push({ path, message });
}

function validateToken(token: unknown, path: string, issues: SectionValidationIssue[]): void {
  if (!token || typeof token !== 'object') {
    pushIssue(issues, path, 'token must be an object');
    return;
  }
  const t = token as Partial<Token>;
  if (typeof t.id !== 'string' || !t.id) pushIssue(issues, `${path}.id`, 'required string');
  if (typeof t.surface !== 'string' || !t.surface)
    pushIssue(issues, `${path}.surface`, 'required string');
  if (typeof t.normalized !== 'string')
    pushIssue(issues, `${path}.normalized`, 'required string');
  if (typeof t.lemma !== 'string') pushIssue(issues, `${path}.lemma`, 'required string');
  if (typeof t.gloss !== 'string') pushIssue(issues, `${path}.gloss`, 'required string');
  if (typeof t.punctBefore !== 'string')
    pushIssue(issues, `${path}.punctBefore`, 'required string');
  if (typeof t.punctAfter !== 'string')
    pushIssue(issues, `${path}.punctAfter`, 'required string');
  if (!t.morphology || typeof t.morphology !== 'object') {
    pushIssue(issues, `${path}.morphology`, 'required object');
  } else if (typeof t.morphology.partOfSpeech !== 'string') {
    pushIssue(issues, `${path}.morphology.partOfSpeech`, 'required string');
  }
  if (t.head !== undefined && typeof t.head !== 'number') {
    pushIssue(issues, `${path}.head`, 'must be number when present');
  }
}

function validateSentence(
  sentence: unknown,
  path: string,
  issues: SectionValidationIssue[]
): void {
  if (!sentence || typeof sentence !== 'object') {
    pushIssue(issues, path, 'sentence must be an object');
    return;
  }
  const s = sentence as Partial<Sentence>;
  if (typeof s.id !== 'string' || !s.id) pushIssue(issues, `${path}.id`, 'required string');
  if (!Array.isArray(s.tokens)) {
    pushIssue(issues, `${path}.tokens`, 'required array');
    return;
  }
  if (s.tokens.length === 0) {
    pushIssue(issues, `${path}.tokens`, 'must contain at least one token');
  }
  s.tokens.forEach((tok, i) => validateToken(tok, `${path}.tokens[${i}]`, issues));
  if (s.translation !== undefined && typeof s.translation !== 'string') {
    pushIssue(issues, `${path}.translation`, 'must be string when present');
  }
}

/**
 * Validate a single TextSection. Returns the list of structural issues
 * found; an empty array means the section conforms to the schema.
 */
export function validateSection(
  section: unknown,
  path = '$'
): SectionValidationIssue[] {
  const issues: SectionValidationIssue[] = [];
  if (!section || typeof section !== 'object') {
    pushIssue(issues, path, 'section must be an object');
    return issues;
  }
  const sec = section as Partial<TextSection>;
  if (typeof sec.id !== 'string' || !sec.id) pushIssue(issues, `${path}.id`, 'required string');
  if (typeof sec.textId !== 'string' || !sec.textId)
    pushIssue(issues, `${path}.textId`, 'required string');
  if (typeof sec.sequence !== 'number')
    pushIssue(issues, `${path}.sequence`, 'required number');
  if (typeof sec.label !== 'string' || !sec.label)
    pushIssue(issues, `${path}.label`, 'required string');
  if (!Array.isArray(sec.sentences)) {
    pushIssue(issues, `${path}.sentences`, 'required array');
    return issues;
  }
  if (sec.sentences.length === 0) {
    pushIssue(issues, `${path}.sentences`, 'must contain at least one sentence');
  }
  const seenSentenceIds = new Set<string>();
  sec.sentences.forEach((snt, i) => {
    const sp = `${path}.sentences[${i}]`;
    validateSentence(snt, sp, issues);
    const sid = (snt as Sentence)?.id;
    if (typeof sid === 'string') {
      if (seenSentenceIds.has(sid)) pushIssue(issues, sp, `duplicate sentence id "${sid}"`);
      seenSentenceIds.add(sid);
    }
  });
  return issues;
}

/**
 * Convenience wrapper: returns true if the section validates cleanly,
 * false otherwise. Use in assertions where you don't care about the
 * specific issues.
 */
export function isValidSection(section: unknown): boolean {
  return validateSection(section).length === 0;
}
