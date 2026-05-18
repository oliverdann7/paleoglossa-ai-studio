import { NormalizedText, NormalizedSection, ImportValidationResult } from './types.js';

export function validateImport(normalized: {
  text: NormalizedText;
  sections: NormalizedSection[];
}): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    sectionCount: normalized.sections.length,
    tokenCount: 0,
  };

  const { text, sections } = normalized;

  if (!text.id) {
    result.errors.push('Missing text ID.');
    result.isValid = false;
  }
  if (!text.corpusId) {
    result.errors.push('Missing corpusId.');
    result.isValid = false;
  }

  if (sections.length === 0) {
    result.warnings.push('No sections found in this text.');
  }

  let totalTokens = 0;
  sections.forEach((section, sIdx) => {
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
        if (!sentence.tokens || sentence.tokens.length === 0) {
          result.warnings.push(`Sentence ${sentence.id} has no tokens.`);
        } else {
          sentence.tokens.forEach((token, tIdx) => {
            totalTokens++;
            if (!token.id || !token.surface) {
              result.errors.push(`Invalid token at index ${tIdx} in sentence ${sentence.id}.`);
              result.isValid = false;
            }
          });
        }
      });
    }
  });

  result.tokenCount = totalTokens;

  return result;
}
