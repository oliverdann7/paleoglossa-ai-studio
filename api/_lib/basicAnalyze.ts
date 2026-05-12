export interface BasicToken {
  text: string;
  lemma: string;
  normalized: string;
  type: 'word' | 'punctuation' | 'number' | 'whitespace';
  transliteration: string | null;
  gloss: string | null;
  pos: string | null;
  confidence: number | null;
}

export interface BasicSentence {
  tokens: BasicToken[];
  translation: string | null;
}

export interface BasicAnalysis {
  sentences: BasicSentence[];
}

function classifyToken(text: string): 'word' | 'punctuation' | 'number' | 'whitespace' {
  if (/^\s+$/.test(text)) return 'whitespace';
  if (/^[,;:!?(){}«»–—‒'""''.]+$/.test(text)) return 'punctuation';
  if (/^[0-9]+([.,][0-9]+)?$/.test(text)) return 'number';
  return 'word';
}

function cleanTokenText(text: string): string {
  return text.replace(/[,;:!?(){}«»–—‒'""''.!?]+/g, '').trim();
}

function isSentenceBoundary(text: string): boolean {
  return /[.?!]+$/.test(text.trim());
}

export function basicAnalyze(rawText: string): BasicAnalysis {
  const rawSentences: string[] = [];
  let current = '';

  const chars = [...rawText];
  for (let i = 0; i < chars.length; i++) {
    current += chars[i];
    if (isSentenceBoundary(current)) {
      const nextChar = chars[i + 1];
      if (!nextChar || nextChar === ' ' || nextChar === '\n' || /[\p{Ps}]/u.test(nextChar)) {
        rawSentences.push(current.trim());
        current = '';
      }
    }
  }
  if (current.trim()) {
    rawSentences.push(current.trim());
  }

  if (rawSentences.length === 0 && rawText.trim()) {
    rawSentences.push(rawText.trim());
  }

  const sentences: BasicSentence[] = rawSentences
    .filter(s => s.length > 0)
    .map(sentenceText => {
      const tokenTexts = sentenceText.split(/([\s]+)/).filter(t => t.length > 0);
      const tokens: BasicToken[] = tokenTexts.map(tokenText => {
        const type = classifyToken(tokenText);
        const cleaned = cleanTokenText(tokenText);
        const lower = cleaned.toLowerCase();

        return {
          text: tokenText,
          lemma: type === 'word' && cleaned ? lower : cleaned || tokenText,
          normalized: type === 'word' && cleaned ? lower : cleaned || tokenText,
          type,
          transliteration: null,
          gloss: null,
          pos: null,
          confidence: null,
        };
      });

      return {
        tokens,
        translation: null,
      };
    });

  return { sentences };
}
