import { ImportService, ImportedText } from './importService';
import { CorpusDB } from '../../data/corpus';

export interface LibraryFilter {
  language?: string;
  level?: string;
  genre?: string;
  minKnownPercent?: number;
  maxKnownPercent?: number;
  source?: 'corpus' | 'import' | 'public';
  search?: string;
}

export interface LibraryText {
  id: string;
  title: string;
  author?: string;
  language: string;
  level: string;
  tags?: string[];
  totalWords: number;
  percentKnown?: number;
  percentLearning?: number;
  isImported?: boolean;
  isPublic?: boolean;
  sourceType: 'corpus' | 'import' | 'public';
  rawTextReference?: any; // To keep the original text object
  addedAt?: string;
}

export class LibraryService {
  static async getLibrary(userId: string | null, filters?: LibraryFilter, getWordInfo?: (lemma: string) => any): Promise<LibraryText[]> {
    const rawTexts: LibraryText[] = [];

    // 1. Built-in Corpus
    if (!filters?.source || filters.source === 'corpus') {
      const builtIn = CorpusDB.getTexts();
      builtIn.forEach(t => {
        rawTexts.push({
          id: t.id,
          title: t.title,
          author: t.author || 'Ancient Text',
          language: t.language || 'grc',
          level: t.level || (t.id === "Jn-1" ? "A1" : t.id === "Gen" ? "A2" : "B1"),
          tags: ["Scripture"],
          totalWords: 0, // Will calculate below
          sourceType: 'corpus',
          rawTextReference: t
        });
      });
    }

    // 2. User Imports
    if ((!filters?.source || filters.source === 'import') && userId) {
      const userImports = await ImportService.getImports(userId);
      userImports.forEach(t => {
        rawTexts.push({
          id: t.id || 'unknown',
          title: t.title,
          author: 'Your Import',
          language: t.languageId || 'grc',
          level: 'Varies',
          tags: [],
          totalWords: t.stats?.totalWords || 0,
          sourceType: 'import',
          rawTextReference: t,
          addedAt: typeof t.createdAt === 'string' ? t.createdAt : undefined
        });
      });
    }

    // 3. Public/Shared
    if ((!filters?.source || filters.source === 'public') && userId) {
       // Query 'imports' anywhere with visibility == 'public'
       try {
         // Because we don't have a collection group setup explicitly, we'll assume we can't easily query this without indexes. 
         // So for now, we'll mock public or handle if someone has built indexes.
       } catch (e) {
         console.warn("Public query failed, likely missing index", e);
       }
    }

    // Process Word Counts & Percentages if getWordInfo provided
    if (getWordInfo) {
      rawTexts.forEach(tx => {
        let totalWords = tx.totalWords;
        let knownCount = 0;
        let learningCount = 0;

        if (tx.sourceType === 'corpus') {
            const t = tx.rawTextReference;
            const sections = t.sectionsPreview?.map((p: any) => CorpusDB.getSection(p.id)).filter(Boolean) || [];
            const allTokens = sections.flatMap((s: any) => s?.sentences.flatMap((sent: any) => sent.tokens) || []);
            totalWords = allTokens.length;
            tx.totalWords = totalWords;
            allTokens.forEach((tok: any) => {
                const info = getWordInfo(tok.lemma);
                if (info.state === 'KNOWN') knownCount++;
                else if (info.state !== 'NEW') learningCount++;
            });
        } else if (tx.sourceType === 'import') {
            const t = tx.rawTextReference as ImportedText;
            const tokens = t.sentences?.flatMap((s: any) => s.tokens).filter((tok: any) => tok.type === 'word') || [];
            if (tokens.length > 0) {
              totalWords = tokens.length;
              tx.totalWords = totalWords;
              tokens.forEach((tok: any) => {
                const info = getWordInfo(tok.lemma || tok.text);
                if (info.state === 'KNOWN') knownCount++;
                else if (info.state !== 'NEW' && info.state !== 'IGNORED') learningCount++;
              });
            } else {
               // Fallback estimating based on spaces
               const content = t.rawContent || "";
               const words = content.split(/\s+/).filter(Boolean);
               totalWords = words.length;
               tx.totalWords = totalWords;
               words.forEach((w: string) => {
                  const info = getWordInfo(w.toLowerCase());
                  if (info.state === 'KNOWN') knownCount++;
                  else if (info.state !== 'NEW' && info.state !== 'IGNORED') learningCount++;
               });
            }
        }

        if (totalWords > 0) {
           tx.percentKnown = Math.round((knownCount / totalWords) * 100);
           tx.percentLearning = Math.round((learningCount / totalWords) * 100);
        } else {
           tx.percentKnown = 0;
           tx.percentLearning = 0;
        }
      });
    }

    // Apply client side filters
    let result = rawTexts;
    if (filters?.language && filters.language !== 'All') {
       const langMap: Record<string, string> = {
        "Ancient Greek": "grc",
        "Koine Greek": "grc-koine",
        "Biblical Hebrew": "hbo",
        "Classical Latin": "lat",
        Syriac: "syr",
        Coptic: "cop",
        Aramaic: "arc",
        Akkadian: "akk",
        Sanskrit: "san",
        "Egyptian Hieroglyphs": "egy",
        "Hittite": "hit",
      };
      const code = langMap[filters.language] || filters.language;
      result = result.filter(t => t.language === code);
    }

    if (filters?.search) {
       const q = filters.search.toLowerCase();
       result = result.filter(t => t.title.toLowerCase().includes(q) || t.author?.toLowerCase().includes(q));
    }

    if (filters?.minKnownPercent !== undefined) {
      result = result.filter(t => (t.percentKnown || 0) >= filters.minKnownPercent!);
    }

    if (filters?.maxKnownPercent !== undefined) {
      result = result.filter(t => (t.percentKnown || 0) <= filters.maxKnownPercent!);
    }

    return result;
  }
}
