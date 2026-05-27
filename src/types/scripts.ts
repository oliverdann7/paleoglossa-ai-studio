export interface ScriptSign {
  id: string;
  unicode?: string;
  image?: string;
  transliteration: string;
  phonetic?: string;
  type:
    | 'uniliteral'
    | 'biliteral'
    | 'triliteral'
    | 'logogram'
    | 'determinative'
    | 'syllabic'
    | 'consonant'
    | 'vowel'
    | 'mater'
    | 'diacritic'
    | 'letter'
    | 'convention';
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
