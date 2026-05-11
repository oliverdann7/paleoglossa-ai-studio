import { CorpusDB, ATTRIBUTIONS } from '../../data/corpus';
import { Token } from '../../types/corpus';
import { InflectedForm, LemmaEntry } from '../../types/modules';
import { getGlobalDictionary } from '../data/dictionary';
import { LemmaService } from './lemmaService';

export type NormalizedMorphology = Record<string, string> & {
  partOfSpeech?: string;
  raw?: string;
};

export interface TokenAnalysis {
  tokenId: string;
  surface: string;
  normalized?: string;
  lemma: string;
  gloss: string;
  languageId: string;
  morphology: NormalizedMorphology;
  rawMorphology?: unknown;
  source?: string;
  confidence?: number;
}

export interface LemmaInfo {
  lemma: string;
  languageId: string;
  gloss: string;
  partOfSpeech?: string;
  forms: InflectedForm[];
  source?: string;
}

export interface FormattedMorphology {
  compact: string;
  expanded: { label: string; value: string }[];
  source?: string;
  confidence?: number;
  missing: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  partOfSpeech: 'Part of speech',
  person: 'Person',
  tense: 'Tense',
  voice: 'Voice',
  mood: 'Mood',
  case: 'Case',
  number: 'Number',
  gender: 'Gender',
  degree: 'Degree',
  state: 'State',
  stem: 'Stem',
  root: 'Root',
  aspect: 'Aspect',
  conjugation: 'Conjugation',
  pattern: 'Pattern',
  binyan: 'Binyan',
  construct: 'Construct',
  emphatic: 'Emphatic',
  status: 'Status',
  determinative: 'Determinative',
  logogram: 'Logogram',
  signType: 'Sign type',
  raw: 'Raw parsing',
};

const LANGUAGE_FIELDS: Record<string, string[]> = {
  'grc-koine': ['partOfSpeech', 'case', 'number', 'gender', 'person', 'tense', 'voice', 'mood', 'degree'],
  grc: ['partOfSpeech', 'case', 'number', 'gender', 'person', 'tense', 'voice', 'mood', 'degree'],
  hbo: ['partOfSpeech', 'stem', 'binyan', 'state', 'person', 'tense', 'voice', 'mood', 'number', 'gender'],
  lat: ['partOfSpeech', 'case', 'number', 'gender', 'person', 'tense', 'voice', 'mood', 'degree'],
  syr: ['partOfSpeech', 'stem', 'state', 'person', 'tense', 'number', 'gender'],
  cop: ['partOfSpeech', 'person', 'tense', 'number', 'gender', 'state'],
  akk: ['partOfSpeech', 'case', 'number', 'gender', 'state', 'stem', 'person', 'tense'],
  hit: ['partOfSpeech', 'case', 'number', 'gender', 'person', 'tense', 'voice', 'mood', 'determinative', 'logogram'],
  uga: ['partOfSpeech', 'case', 'number', 'gender', 'state', 'stem', 'person', 'tense'],
  egy: ['partOfSpeech', 'signType', 'state', 'person', 'number', 'gender'],
};

const COMPACT_FIELDS = ['partOfSpeech', 'case', 'number', 'gender', 'person', 'tense', 'voice', 'mood', 'stem', 'state'];

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanValue(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined;
  return String(value).trim();
}

function getCorpusSource(languageId: string) {
  const corpus = CorpusDB.getTexts()
    .map(text => CorpusDB.getCorpusOverview(text.corpusId))
    .find(c => c?.language === languageId);
  if (!corpus?.sourceAttributionId) return undefined;
  return ATTRIBUTIONS[corpus.sourceAttributionId]?.sourceName;
}

function getTokenSource(textId: string) {
  const text = CorpusDB.getTexts().find(t => t.id === textId);
  if (!text) return undefined;
  const corpus = CorpusDB.getCorpusOverview(text.corpusId);
  if (!corpus?.sourceAttributionId) return undefined;
  return ATTRIBUTIONS[corpus.sourceAttributionId]?.sourceName;
}

export class MorphologyService {
  static normalizeMorphology(rawMorphology: unknown): NormalizedMorphology {
    if (!rawMorphology) return {};

    if (typeof rawMorphology === 'string') {
      return rawMorphology.trim() ? { raw: rawMorphology.trim() } : {};
    }

    if (typeof rawMorphology !== 'object') return { raw: String(rawMorphology) };

    const raw = rawMorphology as Record<string, unknown>;
    const normalized: NormalizedMorphology = {};

    Object.entries(raw).forEach(([key, value]) => {
      const cleaned = cleanValue(value);
      if (!cleaned) return;

      const normalizedKey = key === 'pos' ? 'partOfSpeech' : key;
      normalized[normalizedKey] = cleaned;
    });

    return normalized;
  }

  static formatMorphologyForDisplay(
    languageId: string,
    morphology: unknown,
    options?: { source?: string; confidence?: number },
  ): FormattedMorphology {
    const normalized = this.normalizeMorphology(morphology);
    const preferredFields = LANGUAGE_FIELDS[languageId] || LANGUAGE_FIELDS.grc;
    const orderedKeys = [
      ...preferredFields,
      ...Object.keys(normalized).filter(key => !preferredFields.includes(key)),
    ];

    const expanded = orderedKeys
      .filter(key => key in normalized && normalized[key])
      .map(key => ({
        label: FIELD_LABELS[key] || titleCase(key),
        value: titleCase(String(normalized[key])),
      }));

    const compact = COMPACT_FIELDS
      .filter(key => normalized[key])
      .map(key => String(normalized[key]))
      .join(' · ');

    return {
      compact: compact || 'Morphology unavailable',
      expanded,
      source: options?.source,
      confidence: options?.confidence,
      missing: expanded.length === 0,
    };
  }

  static getTokenAnalysis(tokenId: string): TokenAnalysis | null {
    for (const text of CorpusDB.getTexts()) {
      for (const preview of text.sectionsPreview || []) {
        const section = CorpusDB.getSection(preview.id);
        if (!section) continue;

        for (const sentence of section.sentences) {
          const token = sentence.tokens.find(t => t.id === tokenId) as (Token & { confidence?: number; aiGenerated?: boolean }) | undefined;
          if (!token) continue;

          return {
            tokenId: token.id,
            surface: token.surface,
            normalized: token.normalized,
            lemma: token.lemma,
            gloss: token.gloss,
            languageId: text.language,
            morphology: this.normalizeMorphology(token.morphology),
            rawMorphology: token.morphology,
            source: getTokenSource(text.id),
            confidence: token.confidence ?? (token.aiGenerated ? 0.7 : 1),
          };
        }
      }
    }

    return null;
  }

  static getLemmaInfo(lemmaId: string, languageId?: string): LemmaInfo | null {
    const dict = getGlobalDictionary();
    const entry = dict[lemmaId];
    if (!entry) return null;

    const morphology = this.normalizeMorphology(entry.morphology);
    return {
      lemma: entry.lemma || lemmaId,
      languageId: languageId || entry.language || 'unknown',
      gloss: entry.gloss || 'Definition unavailable',
      partOfSpeech: morphology.partOfSpeech,
      forms: [],
      source: entry._source || getCorpusSource(languageId || entry.language || 'unknown'),
    };
  }

  static async getParadigm(languageId: string, lemmaOrForm: string): Promise<InflectedForm[]> {
    const remoteForms = await LemmaService.getParadigm(lemmaOrForm, languageId);
    if (remoteForms.length > 0) return remoteForms;

    const forms = new Map<string, InflectedForm>();
    CorpusDB.getTexts()
      .filter(text => text.language === languageId)
      .forEach(text => {
        text.sectionsPreview?.forEach(preview => {
          const section = CorpusDB.getSection(preview.id);
          section?.sentences.forEach(sentence => {
            sentence.tokens.forEach(token => {
              if (token.lemma !== lemmaOrForm && token.surface !== lemmaOrForm && token.normalized !== lemmaOrForm) return;
              const features = this.normalizeMorphology(token.morphology);
              const key = `${token.surface}:${JSON.stringify(features)}`;
              const current = forms.get(key);
              forms.set(key, {
                surface: token.surface,
                features,
                frequency: (current?.frequency || 0) + 1,
              });
            });
          });
        });
      });

    return Array.from(forms.values()).sort((a, b) => b.frequency - a.frequency);
  }

  static async getLemmaEntry(lemma: string, languageId: string): Promise<LemmaEntry | null> {
    return LemmaService.getLemma(lemma, languageId);
  }
}
