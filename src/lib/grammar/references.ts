export interface TagExplanation {
  tag: string;
  short: string;
  long?: string;
  category: string;
}

export interface GrammarReferenceEntry {
  tag: string;
  explanation: string;
  category: string;
}

type TagMap = Record<string, TagExplanation>;

const EXPLANATIONS: TagMap = {
  // ── Parts of Speech ──
  noun: { tag: 'noun', short: 'Names a person, place, thing, or idea', category: 'partOfSpeech' },
  verb: {
    tag: 'verb',
    short: 'Describes an action, occurrence, or state',
    category: 'partOfSpeech',
  },
  adjective: { tag: 'adjective', short: 'Describes or modifies a noun', category: 'partOfSpeech' },
  adverb: {
    tag: 'adverb',
    short: 'Modifies a verb, adjective, or another adverb',
    category: 'partOfSpeech',
  },
  pronoun: {
    tag: 'pronoun',
    short: 'Stands in for a noun or noun phrase',
    category: 'partOfSpeech',
  },
  preposition: {
    tag: 'preposition',
    short: 'Shows relationship between a noun and another word',
    category: 'partOfSpeech',
  },
  conjunction: {
    tag: 'conjunction',
    short: 'Connects words, phrases, or clauses',
    category: 'partOfSpeech',
  },
  particle: {
    tag: 'particle',
    short: 'Uninflected word with a grammatical function',
    category: 'partOfSpeech',
  },
  article: {
    tag: 'article',
    short: 'Defines a noun as definite or indefinite',
    category: 'partOfSpeech',
  },
  interjection: {
    tag: 'interjection',
    short: 'Exclamatory word expressing emotion',
    category: 'partOfSpeech',
  },
  numeral: { tag: 'numeral', short: 'A word representing a number', category: 'partOfSpeech' },

  // ── Cases ──
  nominative: {
    tag: 'nominative',
    short: 'Subject case',
    category: 'case',
    long: 'The nominative case marks the subject of a finite verb or the predicate nominative.',
  },
  genitive: {
    tag: 'genitive',
    short: 'Possession, origin, or relationship',
    category: 'case',
    long: 'The genitive case expresses possession, origin, separation, or a defining relationship between nouns.',
  },
  dative: {
    tag: 'dative',
    short: 'Indirect object or instrument',
    category: 'case',
    long: 'The dative case marks the indirect object, the instrument of an action, or a location in time or space.',
  },
  accusative: {
    tag: 'accusative',
    short: 'Direct object case',
    category: 'case',
    long: 'The accusative case marks the direct object of a transitive verb or the object of certain prepositions.',
  },
  vocative: { tag: 'vocative', short: 'Case for direct address', category: 'case' },
  ablative: {
    tag: 'ablative',
    short: 'Separation, source, or means',
    category: 'case',
    long: 'The ablative case expresses separation, source, cause, means, or the agent of a passive verb.',
  },
  locative: { tag: 'locative', short: 'Location in space or time', category: 'case' },
  instrumental: {
    tag: 'instrumental',
    short: 'Means or instrument of an action',
    category: 'case',
  },

  // ── Numbers ──
  singular: { tag: 'singular', short: 'One item', category: 'number' },
  plural: { tag: 'plural', short: 'More than one item', category: 'number' },
  dual: { tag: 'dual', short: 'Two items (paired)', category: 'number' },

  // ── Genders ──
  masculine: { tag: 'masculine', short: 'Masculine grammatical gender', category: 'gender' },
  feminine: { tag: 'feminine', short: 'Feminine grammatical gender', category: 'gender' },
  neuter: { tag: 'neuter', short: 'Neuter grammatical gender', category: 'gender' },
  common: { tag: 'common', short: 'Common gender (masculine or feminine)', category: 'gender' },

  // ── Tenses ──
  present: {
    tag: 'present',
    short: 'Ongoing action (imperfective aspect)',
    category: 'tense',
    long: 'The present tense expresses an ongoing or incomplete action, or a state in the present time.',
  },
  imperfect: {
    tag: 'imperfect',
    short: 'Ongoing past action',
    category: 'tense',
    long: 'The imperfect tense expresses a continuous or repeated action in the past.',
  },
  future: { tag: 'future', short: 'Action that will happen', category: 'tense' },
  aorist: {
    tag: 'aorist',
    short: 'Simple, undefined past action (perfective aspect)',
    category: 'tense',
    long: 'The aorist tense expresses a simple, completed action without reference to duration or repetition.',
  },
  perfect: {
    tag: 'perfect',
    short: 'Completed action with present relevance',
    category: 'tense',
    long: 'The perfect tense expresses a completed action whose effects continue into the present.',
  },
  pluperfect: {
    tag: 'pluperfect',
    short: 'Past action completed before another past event',
    category: 'tense',
  },
  futurePerfect: {
    tag: 'futurePerfect',
    short: 'Future action completed before another future event',
    category: 'tense',
  },

  // ── Voices ──
  active: { tag: 'active', short: 'Subject performs the action', category: 'voice' },
  passive: {
    tag: 'passive',
    short: 'Subject receives the action',
    category: 'voice',
    long: 'In the passive voice, the subject is the recipient of the action rather than the performer.',
  },
  middle: {
    tag: 'middle',
    short: 'Subject participates in or benefits from the action',
    category: 'voice',
    long: 'The middle voice indicates that the subject performs an action that affects itself or is done for its own benefit.',
  },
  medioPassive: {
    tag: 'medioPassive',
    short: 'Middle or passive meaning (context-dependent)',
    category: 'voice',
  },

  // ── Moods ──
  indicative: {
    tag: 'indicative',
    short: 'Factual statement or question',
    category: 'mood',
    long: 'The indicative mood presents an action or state as a fact, used for statements and questions.',
  },
  subjunctive: {
    tag: 'subjunctive',
    short: 'Potential, hypothetical, or wished action',
    category: 'mood',
    long: 'The subjunctive mood expresses potential, hypothetical, or desired actions, often in dependent clauses.',
  },
  imperative: { tag: 'imperative', short: 'Command or request', category: 'mood' },
  optative: {
    tag: 'optative',
    short: 'Wish or potential action',
    category: 'mood',
    long: 'The optative mood expresses a wish, possibility, or a hypothetical scenario, common in Classical Greek.',
  },
  infinitive: { tag: 'infinitive', short: 'Uninflected verbal noun', category: 'mood' },
  participle: {
    tag: 'participle',
    short: 'Verbal adjective',
    category: 'mood',
    long: 'A participle is a verbal form that functions as an adjective, retaining verbal features like tense and voice.',
  },

  // ── Persons ──
  first: { tag: 'first', short: 'First person (I / we)', category: 'person' },
  second: { tag: 'second', short: 'Second person (you)', category: 'person' },
  third: { tag: 'third', short: 'Third person (he / she / it / they)', category: 'person' },

  // ── Degrees ──
  positive: { tag: 'positive', short: 'Base degree of an adjective or adverb', category: 'degree' },
  comparative: { tag: 'comparative', short: 'Comparison between two items', category: 'degree' },
  superlative: { tag: 'superlative', short: 'Highest degree of comparison', category: 'degree' },

  // ── Aspects ──
  perfective: {
    tag: 'perfective',
    short: 'Completed action viewed as a whole',
    category: 'tense',
    long: 'The perfective aspect presents an action as a completed whole, without reference to its internal structure.',
  },
  imperfective: {
    tag: 'imperfective',
    short: 'Ongoing or repeated action',
    category: 'tense',
    long: 'The imperfective aspect presents an action as ongoing, repeated, or in progress, without focus on completion.',
  },
  stative: {
    tag: 'stative',
    short: 'State or condition',
    category: 'tense',
    long: 'The stative aspect expresses a state or condition resulting from a completed action.',
  },

  // ── Verbal Stems (Semitic) ──
  qal: {
    tag: 'qal',
    short: 'Simple active stem of a Hebrew verb',
    category: 'stem',
    long: 'Qal (קַל) is the simplest and most common verbal stem in Biblical Hebrew, expressing the basic meaning of the root.',
  },
  paal: {
    tag: 'paal',
    short: 'Simple active stem (equivalent to Qal)',
    category: 'stem',
  },
  niphal: { tag: 'niphal', short: 'Passive or reflexive stem', category: 'stem' },
  piel: { tag: 'piel', short: 'Intensive active stem', category: 'stem' },
  pual: { tag: 'pual', short: 'Intensive passive stem', category: 'stem' },
  hiphil: { tag: 'hiphil', short: 'Causative active stem', category: 'stem' },
  hophal: { tag: 'hophal', short: 'Causative passive stem', category: 'stem' },
  hithpael: { tag: 'hithpael', short: 'Reflexive or reciprocal stem', category: 'stem' },
  hitpael: {
    tag: 'hitpael',
    short: 'Reflexive or reciprocal stem (alternate spelling)',
    category: 'stem',
  },

  // ── Declensions ──
  '1st': { tag: '1st', short: 'First declension / conjugation', category: 'stem' },
  '2nd': { tag: '2nd', short: 'Second declension / conjugation', category: 'stem' },
  '3rd': { tag: '3rd', short: 'Third declension / conjugation', category: 'stem' },
  '4th': { tag: '4th', short: 'Fourth declension / conjugation', category: 'stem' },
  '5th': { tag: '5th', short: 'Fifth declension', category: 'stem' },
  '1st-2nd': {
    tag: '1st-2nd',
    short: 'First/second declension pattern (e.g. Latin bonus-a-um)',
    category: 'stem',
  },
  '3rd-3rd': {
    tag: '3rd-3rd',
    short: 'Third declension (both stems)',
    category: 'stem',
  },

  // ── States (Semitic) ──
  absolute: { tag: 'absolute', short: 'Unbound (absolute) state of a noun', category: 'state' },
  construct: {
    tag: 'construct',
    short: 'Bound (construct) state for possession',
    category: 'state',
    long: 'The construct state is a noun form linked to a following genitive noun to express possession or a close relationship.',
  },
  emphatic: { tag: 'emphatic', short: 'Emphatic or determined state', category: 'state' },
  determined: { tag: 'determined', short: 'Determined / definite state', category: 'state' },
};

export function getGrammarReference(tag: string): TagExplanation | null {
  const normalized = tag.toLowerCase().trim();
  return EXPLANATIONS[normalized] || null;
}

export function listGrammarReferences(category?: string): TagExplanation[] {
  const all = Object.values(EXPLANATIONS);
  if (!category) return all;
  return all.filter((e) => e.category === category);
}

export function getGrammarReferencesForLanguage(languageId: string): TagExplanation[] {
  const entries = Object.values(EXPLANATIONS);
  const languageCategories = getLanguageCategories(languageId);
  return entries.filter((e) => languageCategories.includes(e.category));
}

export function formatGrammarEntry(tag: string): GrammarReferenceEntry | null {
  const explanation = getGrammarReference(tag);
  if (!explanation) return null;
  return {
    tag: explanation.tag,
    explanation: explanation.long || explanation.short,
    category: explanation.category,
  };
}

function getLanguageCategories(languageId: string): string[] {
  const base = ['partOfSpeech', 'person', 'number'];
  switch (languageId) {
    case 'grc':
    case 'grc-koine':
      return [...base, 'case', 'gender', 'tense', 'voice', 'mood', 'degree'];
    case 'lat':
      return [...base, 'case', 'gender', 'tense', 'voice', 'mood', 'degree'];
    case 'hbo':
      return [...base, 'gender', 'state', 'stem', 'tense', 'voice'];
    case 'syr':
    case 'arc':
      return [...base, 'gender', 'state'];
    case 'san':
      return [...base, 'case', 'gender', 'tense', 'voice', 'mood'];
    default:
      return [...base, 'case', 'gender', 'tense', 'voice', 'mood'];
  }
}
