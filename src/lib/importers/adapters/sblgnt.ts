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

// ── Book index ────────────────────────────────────────────────────────────────
// MorphGNT internal book numbers (01-27) map to human title + GitHub file prefix.
// Data URL: https://raw.githubusercontent.com/morphgnt/sblgnt/master/{prefix}-morphgnt.txt

const NT_BOOKS: { num: string; title: string; shortId: string; filePrefix: string }[] = [
  { num: '01', title: 'Matthew', shortId: 'Mt', filePrefix: '61-Mt' },
  { num: '02', title: 'Mark', shortId: 'Mk', filePrefix: '62-Mk' },
  { num: '03', title: 'Luke', shortId: 'Lk', filePrefix: '63-Lk' },
  { num: '04', title: 'John', shortId: 'Jn', filePrefix: '64-Jn' },
  { num: '05', title: 'Acts', shortId: 'Ac', filePrefix: '65-Ac' },
  { num: '06', title: 'Romans', shortId: 'Ro', filePrefix: '66-Ro' },
  { num: '07', title: '1 Corinthians', shortId: '1Co', filePrefix: '67-1Co' },
  { num: '08', title: '2 Corinthians', shortId: '2Co', filePrefix: '68-2Co' },
  { num: '09', title: 'Galatians', shortId: 'Ga', filePrefix: '69-Ga' },
  { num: '10', title: 'Ephesians', shortId: 'Eph', filePrefix: '70-Eph' },
  { num: '11', title: 'Philippians', shortId: 'Php', filePrefix: '71-Php' },
  { num: '12', title: 'Colossians', shortId: 'Col', filePrefix: '72-Col' },
  { num: '13', title: '1 Thessalonians', shortId: '1Th', filePrefix: '73-1Th' },
  { num: '14', title: '2 Thessalonians', shortId: '2Th', filePrefix: '74-2Th' },
  { num: '15', title: '1 Timothy', shortId: '1Ti', filePrefix: '75-1Ti' },
  { num: '16', title: '2 Timothy', shortId: '2Ti', filePrefix: '76-2Ti' },
  { num: '17', title: 'Titus', shortId: 'Tit', filePrefix: '77-Tit' },
  { num: '18', title: 'Philemon', shortId: 'Phm', filePrefix: '78-Phm' },
  { num: '19', title: 'Hebrews', shortId: 'Heb', filePrefix: '79-Heb' },
  { num: '20', title: 'James', shortId: 'Jas', filePrefix: '80-Jas' },
  { num: '21', title: '1 Peter', shortId: '1Pe', filePrefix: '81-1Pe' },
  { num: '22', title: '2 Peter', shortId: '2Pe', filePrefix: '82-2Pe' },
  { num: '23', title: '1 John', shortId: '1Jn', filePrefix: '83-1Jn' },
  { num: '24', title: '2 John', shortId: '2Jn', filePrefix: '84-2Jn' },
  { num: '25', title: '3 John', shortId: '3Jn', filePrefix: '85-3Jn' },
  { num: '26', title: 'Jude', shortId: 'Jud', filePrefix: '86-Jud' },
  { num: '27', title: 'Revelation', shortId: 'Re', filePrefix: '87-Re' },
];

const PREFIX_TO_BOOK = new Map(NT_BOOKS.map((b) => [b.filePrefix, b]));

// ── Morphology tables ─────────────────────────────────────────────────────────
// MorphGNT parsing code: 8-char string — [person][tense][voice][mood][case][gender][number][degree]
// '-' means the field does not apply to this word class.

const POS_LABELS: Record<string, string> = {
  'N-': 'noun',
  'V-': 'verb',
  RA: 'article',
  RD: 'demonstrative pronoun',
  RI: 'interrogative/indefinite pronoun',
  RN: 'negative pronoun',
  RP: 'personal pronoun',
  RR: 'relative pronoun',
  'C-': 'conjunction',
  'X-': 'particle',
  'D-': 'adverb',
  'P-': 'preposition',
  'A-': 'adjective',
  'I-': 'interjection',
};

const PERSON_LABELS: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };
const TENSE_LABELS: Record<string, string> = {
  P: 'present', I: 'imperfect', F: 'future',
  A: 'aorist', X: 'perfect', Y: 'pluperfect',
};
const VOICE_LABELS: Record<string, string> = { A: 'active', M: 'middle', P: 'passive' };
const MOOD_LABELS: Record<string, string> = {
  I: 'indicative', D: 'imperative', S: 'subjunctive',
  O: 'optative', N: 'infinitive', P: 'participle',
};
const CASE_LABELS: Record<string, string> = {
  N: 'nominative', G: 'genitive', D: 'dative', A: 'accusative', V: 'vocative',
};
const GENDER_LABELS: Record<string, string> = { M: 'masculine', F: 'feminine', N: 'neuter' };
const NUMBER_LABELS: Record<string, string> = { S: 'singular', P: 'plural' };
const DEGREE_LABELS: Record<string, string> = { C: 'comparative', S: 'superlative' };

function parseMorphCode(pos: string, code: string): NormalizedMorphology {
  const result: NormalizedMorphology = { partOfSpeech: POS_LABELS[pos] ?? pos };
  if (code.length < 8) return result;
  const [p, t, v, m, c, g, n, d] = code;
  if (p !== '-' && PERSON_LABELS[p]) result.person = PERSON_LABELS[p];
  if (t !== '-' && TENSE_LABELS[t]) result.tense = TENSE_LABELS[t];
  if (v !== '-' && VOICE_LABELS[v]) result.voice = VOICE_LABELS[v];
  if (m !== '-' && MOOD_LABELS[m]) result.mood = MOOD_LABELS[m];
  if (c !== '-' && CASE_LABELS[c]) result.case = CASE_LABELS[c];
  if (g !== '-' && GENDER_LABELS[g]) result.gender = GENDER_LABELS[g];
  if (n !== '-' && NUMBER_LABELS[n]) result.number = NUMBER_LABELS[n];
  if (d !== '-' && DEGREE_LABELS[d]) result.degree = DEGREE_LABELS[d];
  return result;
}

/**
 * Split trailing punctuation from the SBLGNT text field.
 * e.g. "Ἀβραάμ." → { surface: "Ἀβραάμ", punctAfter: ". " }
 */
function splitPunct(textRaw: string): { surface: string; punctAfter: string } {
  const m = textRaw.match(/([.,;·!?—:]+)$/u);
  if (!m) return { surface: textRaw, punctAfter: ' ' };
  return { surface: textRaw.slice(0, -m[1].length), punctAfter: m[1] + ' ' };
}

const MORPHGNT_BASE =
  'https://raw.githubusercontent.com/morphgnt/sblgnt/master';

// ── Adapter ───────────────────────────────────────────────────────────────────

export const SblgntAdapter: ContentSourceAdapter = {
  id: 'sblgnt-morphgnt',
  label: 'SBLGNT / MorphGNT (Greek NT)',
  language: 'grc',
  corpusType: 'mixed',
  license: 'CC BY-SA 3.0',
  canFetch: true,
  canImportFile: true,

  async fetchIndex() {
    return NT_BOOKS.map((b) => ({
      id: b.shortId,
      title: `${b.title} (SBLGNT)`,
      ref: b.filePrefix,
    }));
  },

  async fetchText(ref: string) {
    const url = `${MORPHGNT_BASE}/${ref}-morphgnt.txt`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MorphGNT fetch failed for "${ref}": HTTP ${response.status}`);
    }
    return response.text();
  },

  async normalize(raw: string, metadata: any) {
    const bookMeta = metadata?.ref ? PREFIX_TO_BOOK.get(metadata.ref) : null;
    const bookId: string = metadata?.id ?? bookMeta?.shortId ?? 'nt';
    const textId = `sblgnt-${bookId}`;
    const textTitle: string =
      metadata?.title ?? (bookMeta ? `${bookMeta.title} (SBLGNT)` : 'SBLGNT Text');

    const sections: NormalizedSection[] = [];
    let currentChapterKey = '';
    let currentVerseKey = '';
    let currentSection: NormalizedSection | null = null;
    let currentSentence: NormalizedSentence | null = null;
    let tokenSeq = 0;
    let sectionSeq = 0;

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 7 space-separated fields: verseRef pos parsing textRaw word norm lemma
      const fields = trimmed.split(/\s+/);
      if (fields.length < 7) continue;

      const verseRef = fields[0];
      if (!verseRef || verseRef.length < 6) continue;

      const pos = fields[1];
      const parsing = fields[2];
      const textRaw = fields[3];
      // fields[4] = word (clean form, not used — we derive surface from textRaw)
      const norm = fields[5];
      const lemma = fields[6];

      const cc = verseRef.slice(2, 4); // chapter (zero-padded)
      const vv = verseRef.slice(4, 6); // verse (zero-padded)
      const chapterKey = verseRef.slice(0, 4); // BBCC

      // ── New chapter ──
      if (chapterKey !== currentChapterKey) {
        if (currentSentence && currentSection) {
          currentSection.sentences.push(currentSentence);
          currentSentence = null;
        }
        if (currentSection) sections.push(currentSection);

        sectionSeq += 1;
        const chapterNum = parseInt(cc, 10);
        currentSection = {
          id: `${textId}-ch${chapterNum}`,
          textId,
          sequence: sectionSeq,
          label: `Chapter ${chapterNum}`,
          sentences: [],
        };
        currentChapterKey = chapterKey;
        currentVerseKey = '';
      }

      // ── New verse ──
      if (verseRef !== currentVerseKey) {
        if (currentSentence && currentSection) {
          currentSection.sentences.push(currentSentence);
        }
        const chapterNum = parseInt(cc, 10);
        const verseNum = parseInt(vv, 10);
        currentSentence = {
          id: `${textId}-${chapterNum}:${verseNum}`,
          tokens: [],
        };
        currentVerseKey = verseRef;
      }

      tokenSeq += 1;
      const { surface, punctAfter } = splitPunct(textRaw);

      const token: NormalizedToken = {
        id: `${textId}-t${tokenSeq}`,
        surface,
        normalized: norm,
        lemma,
        // MorphGNT has no English glosses. The AI word-explanation panel fills these on demand.
        gloss: '',
        morphology: parseMorphCode(pos, parsing),
        punctBefore: '',
        punctAfter,
      };

      currentSentence!.tokens.push(token);
    }

    // Flush last sentence and section
    if (currentSentence && currentSection) {
      currentSection.sentences.push(currentSentence);
    }
    if (currentSection) sections.push(currentSection);

    const normalizedText: NormalizedText = {
      id: textId,
      corpusId: 'SBLGNT',
      title: textTitle,
      language: 'grc',
      direction: 'ltr',
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
