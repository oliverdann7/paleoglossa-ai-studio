import {
  ContentSourceAdapter,
  NormalizedMorphology,
  NormalizedSection,
  NormalizedSentence,
  NormalizedText,
  NormalizedToken,
  ImportValidationResult,
} from '../types.js';
import { validateImport } from '../validate.js';

// ── Book index (canonical OT order) ──────────────────────────────────────────

const OT_BOOKS: { title: string; shortId: string; file: string }[] = [
  { title: 'Genesis', shortId: 'Gen', file: 'Gen' },
  { title: 'Exodus', shortId: 'Exod', file: 'Exod' },
  { title: 'Leviticus', shortId: 'Lev', file: 'Lev' },
  { title: 'Numbers', shortId: 'Num', file: 'Num' },
  { title: 'Deuteronomy', shortId: 'Deut', file: 'Deut' },
  { title: 'Joshua', shortId: 'Josh', file: 'Josh' },
  { title: 'Judges', shortId: 'Judg', file: 'Judg' },
  { title: 'Ruth', shortId: 'Ruth', file: 'Ruth' },
  { title: '1 Samuel', shortId: '1Sam', file: '1Sam' },
  { title: '2 Samuel', shortId: '2Sam', file: '2Sam' },
  { title: '1 Kings', shortId: '1Kgs', file: '1Kgs' },
  { title: '2 Kings', shortId: '2Kgs', file: '2Kgs' },
  { title: '1 Chronicles', shortId: '1Chr', file: '1Chr' },
  { title: '2 Chronicles', shortId: '2Chr', file: '2Chr' },
  { title: 'Ezra', shortId: 'Ezra', file: 'Ezra' },
  { title: 'Nehemiah', shortId: 'Neh', file: 'Neh' },
  { title: 'Esther', shortId: 'Esth', file: 'Esth' },
  { title: 'Job', shortId: 'Job', file: 'Job' },
  { title: 'Psalms', shortId: 'Ps', file: 'Ps' },
  { title: 'Proverbs', shortId: 'Prov', file: 'Prov' },
  { title: 'Ecclesiastes', shortId: 'Eccl', file: 'Eccl' },
  { title: 'Song of Solomon', shortId: 'Song', file: 'Song' },
  { title: 'Isaiah', shortId: 'Isa', file: 'Isa' },
  { title: 'Jeremiah', shortId: 'Jer', file: 'Jer' },
  { title: 'Lamentations', shortId: 'Lam', file: 'Lam' },
  { title: 'Ezekiel', shortId: 'Ezek', file: 'Ezek' },
  { title: 'Daniel', shortId: 'Dan', file: 'Dan' },
  { title: 'Hosea', shortId: 'Hos', file: 'Hos' },
  { title: 'Joel', shortId: 'Joel', file: 'Joel' },
  { title: 'Amos', shortId: 'Amos', file: 'Amos' },
  { title: 'Obadiah', shortId: 'Obad', file: 'Obad' },
  { title: 'Jonah', shortId: 'Jonah', file: 'Jonah' },
  { title: 'Micah', shortId: 'Mic', file: 'Mic' },
  { title: 'Nahum', shortId: 'Nah', file: 'Nah' },
  { title: 'Habakkuk', shortId: 'Hab', file: 'Hab' },
  { title: 'Zephaniah', shortId: 'Zeph', file: 'Zeph' },
  { title: 'Haggai', shortId: 'Hag', file: 'Hag' },
  { title: 'Zechariah', shortId: 'Zech', file: 'Zech' },
  { title: 'Malachi', shortId: 'Mal', file: 'Mal' },
];

const OSHB_BASE = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc';

// ── Morphology parsing ────────────────────────────────────────────────────────
// OSHB morph code: [H|A][POS][...] where POS-specific codes follow
// Compound codes use '/' separating prefixes: e.g. "HC/Vqp3ms"
// We parse the rightmost (base word) segment for core morphology.

const POS_LABELS: Record<string, string> = {
  N: 'noun',
  V: 'verb',
  A: 'adjective',
  P: 'pronoun',
  R: 'preposition',
  C: 'conjunction',
  D: 'adverb',
  T: 'particle',
  I: 'interjection',
};

const VERB_STEM_LABELS: Record<string, string> = {
  q: 'Qal',
  N: 'Niphal',
  p: 'Piel',
  P: 'Pual',
  h: 'Hiphil',
  H: 'Hophal',
  t: 'Hithpael',
  D: 'Poel',
  o: 'Polel',
  O: 'Polal',
  r: 'Hithpolel',
  m: 'Pealal',
  z: 'Qal passive',
  u: 'Hophal',
};

const VERB_CONJ_LABELS: Record<string, string> = {
  p: 'perfect',
  i: 'imperfect',
  w: 'wayyiqtol',
  j: 'jussive',
  c: 'cohortative',
  v: 'imperative',
  r: 'participle active',
  s: 'participle passive',
  a: 'infinitive absolute',
  n: 'infinitive construct',
};

const PERSON_LABELS: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };
const GENDER_LABELS: Record<string, string> = { m: 'masculine', f: 'feminine', b: 'common' };
const NUMBER_LABELS: Record<string, string> = { s: 'singular', p: 'plural', d: 'dual' };
const STATE_LABELS: Record<string, string> = {
  a: 'absolute',
  c: 'construct',
  d: 'determinate',
};
const NOUN_GENDER_LABELS: Record<string, string> = {
  m: 'masculine',
  f: 'feminine',
  b: 'common',
};

function parseMorphCode(rawMorph: string): NormalizedMorphology {
  // For compound codes like "HC/Td/Ncbsa", use the rightmost segment as the base
  const segments = rawMorph.split('/');
  const base = segments[segments.length - 1];

  // Strip language indicator (H = Hebrew, A = Aramaic)
  const lang = base[0];
  const code = lang === 'H' || lang === 'A' ? base.slice(1) : base;

  if (!code) return { partOfSpeech: 'unknown' };

  const pos = code[0];
  const result: NormalizedMorphology = {
    partOfSpeech: POS_LABELS[pos] ?? pos,
  };

  if (pos === 'V' && code.length >= 2) {
    // Verb: V[stem][conj][person][gender][number]
    const stem = code[1];
    const conj = code[2];
    const person = code[3];
    const gender = code[4];
    const number = code[5];

    if (stem && VERB_STEM_LABELS[stem]) result.stem = VERB_STEM_LABELS[stem];
    if (conj && VERB_CONJ_LABELS[conj]) result.mood = VERB_CONJ_LABELS[conj];
    if (person && PERSON_LABELS[person]) result.person = PERSON_LABELS[person];
    if (gender && GENDER_LABELS[gender]) result.gender = GENDER_LABELS[gender];
    if (number && NUMBER_LABELS[number]) result.number = NUMBER_LABELS[number];
  } else if (pos === 'N' && code.length >= 2) {
    // Noun: N[type][gender][number][state]
    const gender = code[2];
    const number = code[3];
    const state = code[4];

    if (gender && NOUN_GENDER_LABELS[gender]) result.gender = NOUN_GENDER_LABELS[gender];
    if (number && NUMBER_LABELS[number]) result.number = NUMBER_LABELS[number];
    if (state && STATE_LABELS[state]) result.state = STATE_LABELS[state];
  } else if (pos === 'A' && code.length >= 2) {
    // Adjective: A[type][gender][number][state]
    const gender = code[2];
    const number = code[3];
    const state = code[4];

    if (gender && NOUN_GENDER_LABELS[gender]) result.gender = NOUN_GENDER_LABELS[gender];
    if (number && NUMBER_LABELS[number]) result.number = NUMBER_LABELS[number];
    if (state && STATE_LABELS[state]) result.state = STATE_LABELS[state];
  }

  return result;
}

/** Strip morpheme-boundary slashes from Hebrew text (e.g. "וְ/הָ/אָ֗רֶץ" → "וְהָאָ֗רֶץ"). */
function stripSlashes(text: string): string {
  return text.replace(/\//g, '');
}

/**
 * Extract the canonical lemma (Strong's number) from OSHB lemma attribute.
 * Examples: "b/7225" → "7225", "1254 a" → "1254a", "430" → "430"
 */
function extractLemma(rawLemma: string): string {
  const parts = rawLemma.split('/');
  const base = parts[parts.length - 1].trim();
  return base.replace(/\s+/g, '').replace(/[ab]$/, ''); // strip trailing variant letters for key
}

// ── XML parsing via regex (avoids namespace issues with DOMParser) ─────────────

interface ParsedToken {
  surface: string;
  normalized: string;
  lemma: string;
  morphCode: string;
  maqqef: boolean; // true if immediately followed by maqqef
  sofPasuq: boolean; // true if immediately preceded by sof-pasuq
}

function parseVerseContent(verseXml: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  // Match <w> elements and <seg> elements interleaved
  // Using a state machine over the verse content
  const pattern = /<w([^>]*)>([^<]*)<\/w>|<seg\s+type="([^"]+)"[^>]*>([^<]*)<\/seg>/g;

  let match: RegExpExecArray | null;
  let pendingMaqqef = false;

  while ((match = pattern.exec(verseXml)) !== null) {
    const wAttrs = match[1]; // <w> attributes string
    const wText = match[2]; // <w> text content
    const segType = match[3]; // <seg type="...">
    const segText = match[4]; // <seg> text content

    if (wAttrs !== undefined) {
      // It's a <w> element
      const lemmaMatch = /lemma="([^"]*)"/.exec(wAttrs);
      const morphMatch = /morph="([^"]*)"/.exec(wAttrs);
      const rawLemma = lemmaMatch ? lemmaMatch[1] : '';
      const morphCode = morphMatch ? morphMatch[1] : '';
      const surface = stripSlashes(wText.trim());

      if (surface) {
        const token: ParsedToken = {
          surface,
          normalized: surface,
          lemma: extractLemma(rawLemma),
          morphCode,
          maqqef: pendingMaqqef,
          sofPasuq: false,
        };
        tokens.push(token);
        pendingMaqqef = false;
      }
    } else if (segType) {
      // It's a <seg> element
      const type = segType.replace('x-', '');
      if (type === 'maqqef') {
        // Set maqqef flag on the most recent token (it joins to next word)
        if (tokens.length > 0) {
          tokens[tokens.length - 1].maqqef = true;
        }
        pendingMaqqef = true;
      } else if (type === 'sof-pasuq' && segText?.trim()) {
        // End of verse marker — attach to last token
        if (tokens.length > 0) {
          tokens[tokens.length - 1].sofPasuq = true;
        }
      }
    }
  }
  return tokens;
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export const OshbAdapter: ContentSourceAdapter = {
  id: 'oshb',
  label: 'Open Scriptures Hebrew Bible (OSHB)',
  language: 'hbo',
  corpusType: 'mixed',
  license: 'CC BY 4.0',
  canFetch: true,
  canImportFile: true,

  async fetchIndex() {
    return OT_BOOKS.map((b) => ({
      id: b.shortId,
      title: `${b.title} (OSHB)`,
      ref: b.file,
    }));
  },

  async fetchText(ref: string) {
    const url = `${OSHB_BASE}/${ref}.xml`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSHB fetch failed for "${ref}": HTTP ${response.status}`);
    }
    return response.text();
  },

  async normalize(raw: string, metadata: any) {
    const bookId: string = metadata?.id ?? 'hbo';
    const textId = `oshb-${bookId}`;
    const textTitle: string = metadata?.title ?? 'OSHB Text';

    const sections: NormalizedSection[] = [];
    let tokenSeq = 0;
    let sectionSeq = 0;

    // Match chapters: <chapter osisID="Book.N">...</chapter>
    const chapterPattern = /<chapter\s+osisID="([^"]+)">([\s\S]*?)<\/chapter>/g;
    let chapterMatch: RegExpExecArray | null;

    while ((chapterMatch = chapterPattern.exec(raw)) !== null) {
      const chapterId = chapterMatch[1]; // e.g. "Gen.1"
      const chapterContent = chapterMatch[2];
      const chapterNum = parseInt(chapterId.split('.')[1] ?? '1', 10);

      sectionSeq += 1;
      const section: NormalizedSection = {
        id: `${textId}-ch${chapterNum}`,
        textId,
        sequence: sectionSeq,
        label: `Chapter ${chapterNum}`,
        sentences: [],
      };

      // Match verses within this chapter
      const versePattern = /<verse\s+osisID="([^"]+)">([\s\S]*?)<\/verse>/g;
      let verseMatch: RegExpExecArray | null;

      while ((verseMatch = versePattern.exec(chapterContent)) !== null) {
        const verseOsisId = verseMatch[1]; // e.g. "Gen.1.1"
        const verseContent = verseMatch[2];
        const parts = verseOsisId.split('.');
        const verseNum = parseInt(parts[2] ?? '1', 10);

        const parsedTokens = parseVerseContent(verseContent);
        if (parsedTokens.length === 0) continue;

        const sentence: NormalizedSentence = {
          id: `${textId}-${chapterNum}:${verseNum}`,
          tokens: parsedTokens.map((pt) => {
            tokenSeq += 1;

            // Determine punctAfter:
            // - Maqqef: attach next word with Hebrew dash (no space)
            // - Sof-pasuq: verse-ending ׃ + space
            // - Normal word: just a space
            let punctAfter = ' ';
            if (pt.maqqef) punctAfter = '־'; // Hebrew maqqef, no space
            if (pt.sofPasuq) punctAfter = '׃ '; // sof-pasuq + space

            const token: NormalizedToken = {
              id: `${textId}-t${tokenSeq}`,
              surface: pt.surface,
              normalized: pt.normalized,
              lemma: pt.lemma,
              // OSHB has no English glosses; the AI word-explanation panel fills these on demand.
              gloss: '',
              morphology: parseMorphCode(pt.morphCode),
              punctBefore: '',
              punctAfter,
            };
            return token;
          }),
        };

        section.sentences.push(sentence);
      }

      if (section.sentences.length > 0) {
        sections.push(section);
      }
    }

    const normalizedText: NormalizedText = {
      id: textId,
      corpusId: 'OSHB',
      title: textTitle,
      language: 'hbo',
      direction: 'rtl',
      hasMorphology: true,
      hasTranslation: false,
      sectionsPreview: sections.map((s) => ({ id: s.id, label: s.label })),
    };

    return { text: normalizedText, sections };
  },

  validate(normalized: {
    text: NormalizedText;
    sections: NormalizedSection[];
  }): ImportValidationResult {
    return validateImport(normalized);
  },
};
