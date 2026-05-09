import { CorpusDB } from '../../data/corpus';
import * as tokenArrays from '../../data/tokens';

let _dictCache: Record<string, any> | null = null;

export const getGlobalDictionary = () => {
  if (_dictCache) return _dictCache;
  const dict: Record<string, any> = {};

  // Tokens from chapters
  for (const key of Object.keys(tokenArrays)) {
    const list = (tokenArrays as any)[key];
    if (Array.isArray(list)) {
      for (const t of list) {
        if (t.lemma) {
          dict[t.lemma] = { ...t, _source: 'chapter' };
        }
      }
    }
  }

  // Tokens from real texts
  for (const text of CorpusDB.getTexts()) {
    if (text.sectionsPreview) {
      for (const section of text.sectionsPreview) {
        const fullSection = CorpusDB.getSection(section.id);
        if (fullSection) {
          for (const sentence of fullSection.sentences) {
            for (const t of sentence.tokens) {
              if (t.lemma && !dict[t.lemma]) {
                dict[t.lemma] = { ...t, language: text.language, _source: 'text' };
              }
            }
          }
        }
      }
    }
  }

  _dictCache = dict;
  return dict;
};

export const getGlossForLemma = (lemma: string) => {
  const dict = getGlobalDictionary();
  return dict[lemma]?.gloss || "Definition unavailable";
};

export const getLangForLemma = (lemma: string) => {
  const dict = getGlobalDictionary();
  return dict[lemma]?.language || "Unknown";
};

export const getTokenInfo = (lemma: string) => {
  return getGlobalDictionary()[lemma];
};
