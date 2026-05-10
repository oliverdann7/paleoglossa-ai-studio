import { ImportedSentence } from '../../types/firestore';

export class TextAnalysisService {
  static async analyzeText(languageId: string, rawText: string): Promise<ImportedSentence[]> {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId, rawText }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze text');
    }
    
    const data = await response.json();
    return data.sentences;
  }

  static async extractFromImage(languageId: string, imageBase64: string, mimeType: string): Promise<string> {
    const response = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId, imageBase64, mimeType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract text from image');
    }
    
    const data = await response.json();
    return data.text;
  }

  static async translateSentence(languageId: string, sentence: string): Promise<string> {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId, tokens: [sentence] }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to translate sentence');
    }
    
    const data = await response.json();
    return data.text;
  }

  static async explainWord(languageId: string, word: string, lemma: string): Promise<string> {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId, word, lemma, type: 'word' }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to explain word');
    }
    
    const data = await response.json();
    return data.explanation;
  }

  static async explainPhrase(languageId: string, phrase: string): Promise<string> {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageId, phrase, type: 'phrase' }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to explain phrase');
    }
    
    const data = await response.json();
    return data.explanation;
  }

  static async scrapeUrl(url: string): Promise<string> {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape URL');
    }
    
    const data = await response.json();
    return data.text;
  }
}
