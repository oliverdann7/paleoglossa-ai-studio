import { z } from 'zod';

const TokenSchema = z.object({
  text: z.string().min(1),
  lemma: z.string().nullable(),
  normalized: z.string().nullable(),
  type: z.enum(['word', 'punctuation', 'number', 'whitespace']),
  transliteration: z.string().nullable(),
  gloss: z.string().nullable(),
  pos: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
});

const SentenceSchema = z.object({
  tokens: z.array(TokenSchema).min(1),
  translation: z.string().nullable(),
});

const AnalysisSchema = z.object({
  sentences: z.array(SentenceSchema).min(1),
});

export type ValidatedToken = {
  text: string;
  lemma: string | null;
  normalized: string | null;
  type: 'word' | 'punctuation' | 'number' | 'whitespace';
  transliteration: string | null;
  gloss: string | null;
  pos: string | null;
  confidence: number | null;
};
export type ValidatedSentence = { tokens: ValidatedToken[]; translation: string | null };
export type ValidatedAnalysis = { sentences: ValidatedSentence[] };

export function parseAndValidateAIResponse(jsonString: string): {
  data: ValidatedAnalysis | null;
  warnings: string[];
} {
  const warnings: string[] = [];
  let cleaned = jsonString.trim();

  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```\s*$/i, '');

  // Strip any leading/trailing non-JSON content:
  // Try to find the first `{` and last `}`
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    warnings.push('No valid JSON object found in response');
    return { data: null, warnings };
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  // Attempt direct parse
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try repairing common issues
    const repaired = repairJSON(cleaned);
    if (!repaired) {
      warnings.push('Unable to repair malformed JSON');
      return { data: null, warnings };
    }
    warnings.push('AI output required JSON repair');
    try {
      parsed = JSON.parse(repaired);
    } catch {
      warnings.push('JSON repair failed');
      return { data: null, warnings };
    }
  }

  // Validate with Zod
  const result = AnalysisSchema.safeParse(parsed);
  if (!result.success) {
    warnings.push('AI response failed schema validation');
    // Try partial recovery: accept whatever sentences pass validation
    if (Array.isArray(parsed.sentences)) {
      const validSentences = parsed.sentences.filter(
        (s: any) => SentenceSchema.safeParse(s).success
      );
      if (validSentences.length > 0) {
        warnings.push(
          `Only ${validSentences.length}/${parsed.sentences.length} sentences passed validation`
        );
        return { data: { sentences: validSentences }, warnings };
      }
    }
    return { data: null, warnings };
  }

  return { data: result.data, warnings };
}

function repairJSON(text: string): string | null {
  let repaired = text;

  // Escape unescaped control characters (common issue with AI output)
  repaired = repaired
    .split('')
    .filter((c) => {
      const code = c.charCodeAt(0);
      return code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
    })
    .join('');

  // Replace single quotes with double quotes (only outside of string values)
  // This is tricky — let's just try a simple approach: replace ' with " in keys
  repaired = repaired.replace(/'/g, '"');

  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // Remove trailing commas before closing brace/bracket in objects
  repaired = repaired.replace(/,\s*}/g, '}');
  repaired = repaired.replace(/,\s*]/g, ']');

  // Ensure property keys are double-quoted (handle unquoted keys from AI)
  repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

  return repaired;
}
