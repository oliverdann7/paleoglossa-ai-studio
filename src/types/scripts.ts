export interface ScriptSign {
  id: string;
  unicode?: string;
  image?: string;
  transliteration: string;
  phonetic?: string;
  type: 'uniliteral' | 'biliteral' | 'triliteral' | 'logogram' | 'determinative' | 'syllabic';
  exampleWord?: string;
  exampleGloss?: string;
  gardinerNumber?: string;
  cupboardNumber?: string;
  frequency?: number;
}

export interface ScriptLesson {
  langId: string;
  title: string;
  signs: ScriptSign[];
}
