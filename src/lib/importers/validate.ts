import { NormalizedText, NormalizedSection, ImportValidationResult } from './types.js';

export function validateImport(normalized: {
  text: NormalizedText;
  sections: NormalizedSection[];
}): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    sectionCount: 0,
    tokenCount: 0,
  };

  // Guard against a malformed payload before destructuring — a null text or a
  // non-array sections field should fail cleanly, not throw.
  if (!normalized || typeof normalized !== 'object' || !normalized.text) {
    result.errors.push('Import payload is missing its text.');
    result.isValid = false;
    return result;
  }
  if (!Array.isArray(normalized.sections)) {
    result.errors.push('Import payload sections must be an array.');
    result.isValid = false;
    return result;
  }

  const { text, sections } = normalized;
  result.sectionCount = sections.length;

  if (!text.id) {
    result.errors.push('Missing text ID.');
    result.isValid = false;
  }
  if (!text.corpusId) {
    result.errors.push('Missing corpusId.');
    result.isValid = false;
  }
  if (text.direction && text.direction !== 'ltr' && text.direction !== 'rtl') {
    result.warnings.push(`Unknown text direction "${text.direction}"; expected "ltr" or "rtl".`);
  }

  if (sections.length === 0) {
    result.warnings.push('No sections found in this text.');
  }

  // Duplicate IDs silently corrupt reading state (progress keyed by id), so
  // surface them as errors.
  const seenSectionIds = new Set<string>();
  const seenSentenceIds = new Set<string>();
  const seenTokenIds = new Set<string>();
  const flagDuplicate = (set: Set<string>, id: string, kind: string): void => {
    if (!id) return;
    if (set.has(id)) {
      result.errors.push(`Duplicate ${kind} ID "${id}".`);
      result.isValid = false;
    } else {
      set.add(id);
    }
  };

  let totalTokens = 0;
  sections.forEach((section, sIdx) => {
    flagDuplicate(seenSectionIds, section.id, 'section');
    if (!section.id) {
      result.errors.push(`Section at index ${sIdx} is missing an ID.`);
      result.isValid = false;
    }

    if (!section.sentences || section.sentences.length === 0) {
      result.warnings.push(`Section ${section.id || sIdx} has no sentences.`);
    } else {
      section.sentences.forEach((sentence, sntIdx) => {
        if (!sentence.id) {
          result.errors.push(
            `Sentence at index ${sntIdx} in section ${section.id} is missing an ID.`
          );
          result.isValid = false;
        }
        flagDuplicate(seenSentenceIds, sentence.id, 'sentence');
        if (!sentence.tokens || sentence.tokens.length === 0) {
          result.warnings.push(`Sentence ${sentence.id} has no tokens.`);
        } else {
          sentence.tokens.forEach((token, tIdx) => {
            totalTokens++;
            if (!token.id || !token.surface) {
              result.errors.push(`Invalid token at index ${tIdx} in sentence ${sentence.id}.`);
              result.isValid = false;
            }
            flagDuplicate(seenTokenIds, token.id, 'token');
          });
        }
      });
    }
  });

  result.tokenCount = totalTokens;

  return result;
}
