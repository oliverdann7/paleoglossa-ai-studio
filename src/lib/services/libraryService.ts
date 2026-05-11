import { ImportService, ImportedText } from './importService';
import { ATTRIBUTIONS, CorpusDB } from '../../data/corpus';

const corpusTokensCache = new Map<string, any[]>();

function getCorpusTokens(text: any) {
  const cached = corpusTokensCache.get(text.id);
  if (cached) return cached;

  const sections = text.sectionsPreview?.map((p: any) => CorpusDB.getSection(p.id)).filter(Boolean) || [];
  const tokens = sections.flatMap((s: any) => s?.sentences.flatMap((sent: any) => sent.tokens) || []);
  corpusTokensCache.set(text.id, tokens);
  return tokens;
}

export interface LibraryFilter {
  language?: string;
  level?: string;
  genre?: string;
  period?: string;
  corpusType?: string;
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
  date?: string;
  period?: string;
  genre?: string;
  corpusType?: string;
  corpusId?: string;
  corpusTitle?: string;
  licenseName?: string;
  sourceName?: string;
  sourceUrl?: string;
  isSample?: boolean;
  sourceStatus?: string;
  availableTools: {
    morphology: boolean;
    translation: boolean;
    audio: boolean;
    syntax: boolean;
  };
  sectionsPreview?: { id: string; label: string }[];
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

const DEFAULT_TEXT_METADATA: Record<string, Partial<LibraryText>> = {
  'Jn-1': { date: '1st c. CE', period: 'Hellenistic / Roman', genre: 'Gospel', corpusType: 'biblical' },
  Gen: { date: '1st millennium BCE', period: 'Iron Age', genre: 'Narrative', corpusType: 'biblical' },
  'Aeneid-1': { date: '29-19 BCE', period: 'Augustan', genre: 'Epic', corpusType: 'classical' },
  'Ps-23': { date: '1st millennium BCE', period: 'Iron Age', genre: 'Psalm', corpusType: 'biblical' },
  'Syr-Jn-1': { date: '5th c. CE', period: 'Late Antique', genre: 'Gospel', corpusType: 'biblical' },
  'Cop-Jn-1': { date: '4th-5th c. CE', period: 'Late Antique', genre: 'Gospel', corpusType: 'biblical' },
  'Arc-Gen-1': { date: 'Late Antique', period: 'Late Antique', genre: 'Targum', corpusType: 'biblical' },
  'Akk-Gilg-1': { date: '2nd millennium BCE', period: 'Bronze Age', genre: 'Epic', corpusType: 'classical' },
  'San-Gita-1': { date: '1st millennium BCE', period: 'Classical Sanskrit', genre: 'Philosophical dialogue', corpusType: 'classical' },
  'Hit-Annals-1': { date: '14th c. BCE', period: 'Late Bronze Age', genre: 'Royal annals', corpusType: 'inscription' },
  'Egy-Ptah-1': { date: 'Middle Kingdom tradition', period: 'Middle Egyptian', genre: 'Wisdom instruction', corpusType: 'classical' },
  'Anabasis-1': { date: '4th c. BCE', period: 'Classical', genre: 'History', corpusType: 'classical' },
  'Iliad-1': { date: '8th c. BCE', period: 'Archaic', genre: 'Epic', corpusType: 'classical' },
  'Odyssey-1': { date: '8th c. BCE', period: 'Archaic', genre: 'Epic', corpusType: 'classical' },
  'Aesop-1': { date: 'Classical tradition', period: 'Classical', genre: 'Fable', corpusType: 'classical' },
};

function inferMockMetadata(text: any): Partial<LibraryText> {
  const title = String(text.title || '').toLowerCase();
  if (text.language === 'grc-koine') return { date: '1st-2nd c. CE', period: 'Hellenistic / Roman', genre: title.includes('gospel') ? 'Gospel' : 'Early Christian', corpusType: title.includes('1 clement') || title.includes('didache') ? 'patristic' : 'biblical' };
  if (text.language === 'hbo') return { date: '1st millennium BCE', period: 'Iron Age', genre: 'Biblical prose/poetry', corpusType: 'biblical' };
  if (text.language === 'lat') return { date: '1st c. BCE-1st c. CE', period: 'Classical / Imperial', genre: title.includes('annals') ? 'History' : 'Classical literature', corpusType: 'classical' };
  if (text.language === 'syr' || text.language === 'cop') return { date: 'Late Antique', period: 'Late Antique', genre: 'Christian literature', corpusType: 'patristic' };
  if (text.language === 'arc') return { date: 'Late Antique', period: 'Late Antique', genre: title.includes('papyri') ? 'Documentary text' : 'Targum', corpusType: title.includes('papyri') ? 'manuscript' : 'biblical' };
  if (text.language === 'akk' || text.language === 'hit' || text.language === 'egy') return { date: '2nd-1st millennium BCE', period: 'Ancient Near Eastern', genre: title.includes('letter') ? 'Letter' : 'Royal / literary text', corpusType: title.includes('letter') || title.includes('laws') ? 'inscription' : 'classical' };
  if (text.language === 'san') return { date: '1st millennium BCE-1st millennium CE', period: 'Classical Sanskrit', genre: 'Classical literature', corpusType: 'classical' };
  return { genre: 'Text', period: 'Unspecified', corpusType: 'other' };
}

function getTextMetadata(text: any): Partial<LibraryText> {
  return {
    ...inferMockMetadata(text),
    ...DEFAULT_TEXT_METADATA[text.id],
    date: text.date || DEFAULT_TEXT_METADATA[text.id]?.date || inferMockMetadata(text).date,
    period: text.period || DEFAULT_TEXT_METADATA[text.id]?.period || inferMockMetadata(text).period,
    genre: text.genre || DEFAULT_TEXT_METADATA[text.id]?.genre || inferMockMetadata(text).genre,
    corpusType: text.corpusType || DEFAULT_TEXT_METADATA[text.id]?.corpusType || inferMockMetadata(text).corpusType,
  };
}

export class LibraryService {
  static async getLibrary(userId: string | null, filters?: LibraryFilter, getWordInfo?: (lemma: string) => any): Promise<LibraryText[]> {
    const rawTexts: LibraryText[] = [];

    // 1. Built-in Corpus
    if (!filters?.source || filters.source === 'corpus') {
      const builtIn = CorpusDB.getTexts();
      builtIn.forEach(t => {
        const corpus = CorpusDB.getCorpusOverview(t.corpusId);
        const attribution = t.sourceAttributionId
          ? ATTRIBUTIONS[t.sourceAttributionId]
          : corpus?.sourceAttributionId
            ? ATTRIBUTIONS[corpus.sourceAttributionId]
            : undefined;
        const metadata = getTextMetadata(t);
          rawTexts.push({
          id: t.id,
          title: t.title,
          author: t.author || 'Ancient Text',
          language: t.language || 'grc',
          level: t.level || (t.id === "Jn-1" ? "A1" : t.id === "Gen" ? "A2" : "B1"),
          date: metadata.date,
          period: metadata.period,
          genre: metadata.genre,
          corpusType: metadata.corpusType,
          corpusId: t.corpusId,
          corpusTitle: corpus?.title || t.corpusId,
          licenseName: attribution?.licenseName || corpus?.licenseSummary,
          sourceName: attribution?.sourceName || corpus?.title,
          sourceUrl: attribution?.sourceUrl,
          isSample: t.isSample,
          sourceStatus: t.sourceStatus,
          availableTools: {
            morphology: !!t.hasMorphology,
            translation: !!t.hasTranslation,
            audio: !!t.hasAudio,
            syntax: !!t.hasSyntax,
          },
          sectionsPreview: t.sectionsPreview,
          tags: [metadata.genre || "Text", metadata.corpusType || "other"],
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
          genre: 'User import',
          period: 'User supplied',
          corpusType: 'other',
          corpusTitle: 'Your Imports',
          licenseName: 'User supplied',
          sourceName: 'Private import',
          availableTools: {
            morphology: false,
            translation: false,
            audio: false,
            syntax: false,
          },
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
            const allTokens = getCorpusTokens(t);
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
       result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.author?.toLowerCase().includes(q) ||
        t.corpusTitle?.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q)
      );
    }

    if (filters?.period && filters.period !== 'all') {
      result = result.filter(t => t.period === filters.period);
    }

    if (filters?.genre && filters.genre !== 'all') {
      result = result.filter(t => t.genre === filters.genre);
    }

    if (filters?.corpusType && filters.corpusType !== 'all') {
      result = result.filter(t => t.corpusType === filters.corpusType);
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
