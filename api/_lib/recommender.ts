/**
 * Server-side recommender glue.
 *
 * - Builds a TextVocabProfile for every curated corpus text once at first use
 *   (~87 texts; in-memory, no Firestore round-trip).
 * - Reads the user's vocabulary via the Admin SDK and derives their known-lemma
 *   set, with a short-TTL per-user cache (matches the in-memory pattern used
 *   elsewhere in this API, e.g. lexicalCache and audio TTS cache).
 * - Joins the two and returns enriched, display-ready picks.
 */

import { CorpusDB } from '../../src/data/corpus.js';
import { normalizeLemmaKey } from '../../src/lib/utils/lemmaUtils.js';
import { WordState } from '../../src/lib/constants/wordStates.js';
import { buildProfileFromSentences } from '../../src/lib/recommender/textProfiles.js';
import {
  recommendNext,
  scoreText,
  type LearnerState,
  type TextVocabProfile,
  type ScoredText,
} from '../../src/lib/recommender/score.js';
import { getAdminDb } from './firebaseAdmin.js';

interface CorpusTextLike {
  id: string;
  title: string;
  author?: string;
  language: string;
  level?: string;
  genre?: string;
  sectionsPreview?: { id: string; label: string }[];
}

// ── Corpus profile cache ─────────────────────────────────────────────────────

let _profileCache: TextVocabProfile[] | null = null;
let _textIndex: Map<string, CorpusTextLike> | null = null;

function buildAllProfiles(): {
  profiles: TextVocabProfile[];
  texts: Map<string, CorpusTextLike>;
} {
  const profiles: TextVocabProfile[] = [];
  const texts = new Map<string, CorpusTextLike>();
  const all = CorpusDB.getTexts() as CorpusTextLike[];

  for (const text of all) {
    texts.set(text.id, text);
    const sentences: Array<{ tokens: any[] }> = [];
    for (const ref of text.sectionsPreview ?? []) {
      const section = CorpusDB.getSection(ref.id);
      if (section?.sentences) sentences.push(...section.sentences);
    }
    if (sentences.length === 0) continue; // metadata-only text — skip until imported
    profiles.push(
      buildProfileFromSentences(text.id, sentences, {
        cefrLevel: text.level,
        languageId: text.language,
      })
    );
  }

  return { profiles, texts };
}

export function getProfileCache(): {
  profiles: TextVocabProfile[];
  texts: Map<string, CorpusTextLike>;
} {
  if (_profileCache && _textIndex) {
    return { profiles: _profileCache, texts: _textIndex };
  }
  const built = buildAllProfiles();
  _profileCache = built.profiles;
  _textIndex = built.texts;
  return built;
}

/** For tests / future content updates — drop the cache so it rebuilds. */
export function invalidateProfileCache(): void {
  _profileCache = null;
  _textIndex = null;
}

// ── Known-lemma cache ────────────────────────────────────────────────────────

interface KnownLemmasResult {
  known: Set<string>;
  learning: Set<string>;
}

const KNOWN_LEMMA_TTL_MS = 5 * 60_000;
const _knownCache = new Map<string, { at: number; value: KnownLemmasResult }>();

/**
 * "Known" means status KNOWN or FAMILIAR — both states already render as
 * transparent in the reader (see STATE_COLORS), so the user effectively reads
 * past them without looking up. LEARNING is tracked separately so we can later
 * surface it as "partial credit" for new-word cost estimation.
 */
function statusCounts(state: unknown): { known: boolean; learning: boolean } {
  switch (state) {
    case WordState.KNOWN:
    case WordState.FAMILIAR:
      return { known: true, learning: false };
    case WordState.LEARNING:
      return { known: false, learning: true };
    default:
      return { known: false, learning: false };
  }
}

export async function getKnownLemmas(
  userId: string,
  languageId?: string
): Promise<KnownLemmasResult> {
  const cacheKey = `${userId}::${languageId ?? '*'}`;
  const cached = _knownCache.get(cacheKey);
  if (cached && Date.now() - cached.at < KNOWN_LEMMA_TTL_MS) return cached.value;

  const db = getAdminDb();
  if (!db) {
    const empty = { known: new Set<string>(), learning: new Set<string>() };
    _knownCache.set(cacheKey, { at: Date.now(), value: empty });
    return empty;
  }

  const known = new Set<string>();
  const learning = new Set<string>();

  let query: FirebaseFirestore.Query = db.collection('users').doc(userId).collection('vocabulary');
  if (languageId) query = query.where('languageId', '==', languageId);

  const snap = await query.get();
  snap.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const role = statusCounts(data.status);
    if (!role.known && !role.learning) return;
    const lemmaSource =
      (typeof data.lemma === 'string' && data.lemma) ||
      (typeof data.normalizedTerm === 'string' && data.normalizedTerm) ||
      (typeof data.term === 'string' && data.term) ||
      '';
    const key = normalizeLemmaKey(String(lemmaSource));
    if (!key) return;
    if (role.known) known.add(key);
    else if (role.learning) learning.add(key);
  });

  const value = { known, learning };
  _knownCache.set(cacheKey, { at: Date.now(), value });
  return value;
}

export function invalidateKnownLemmas(userId: string): void {
  for (const key of _knownCache.keys()) {
    if (key.startsWith(`${userId}::`)) _knownCache.delete(key);
  }
}

// ── Read-text set ────────────────────────────────────────────────────────────

async function getReadTextIds(userId: string): Promise<Set<string>> {
  const db = getAdminDb();
  if (!db) return new Set();
  try {
    const snap = await db.collection('users').doc(userId).collection('readingProgress').get();
    const out = new Set<string>();
    snap.forEach((doc) => {
      const data = doc.data() as { completed?: boolean; lastPosition?: number; textId?: string };
      const finished = data.completed === true || (data.lastPosition ?? 0) >= 95;
      if (finished) out.add(data.textId ?? doc.id);
    });
    return out;
  } catch {
    return new Set();
  }
}

// ── Public entry point ───────────────────────────────────────────────────────

export interface EnrichedRecommendation extends ScoredText {
  title: string;
  author?: string;
  language: string;
  level?: string;
  genre?: string;
  sectionId?: string;
  /** Human-readable phrase, e.g. "You'll understand about 93% of this". */
  comprehensionLabel: string;
  /** Human-readable phrase, e.g. "~12 new words". */
  newLemmasLabel: string;
}

function phraseComprehension(c: number): string {
  return `You'll understand about ${Math.round(c * 100)}% of this`;
}

function phraseNewLemmas(n: number): string {
  if (n === 0) return 'No new words';
  if (n === 1) return '1 new word';
  return `~${n} new words`;
}

export async function getRecommendations(
  userId: string,
  options: { limit?: number; languageId?: string } = {}
): Promise<EnrichedRecommendation[]> {
  const { profiles, texts } = getProfileCache();
  const { known, learning } = await getKnownLemmas(userId, options.languageId);
  const readTextIds = await getReadTextIds(userId);

  const learner: LearnerState = {
    knownLemmas: known,
    learningLemmas: learning,
    languageId: options.languageId,
  };
  const ranked = recommendNext(profiles, learner, {
    readTextIds,
    limit: options.limit ?? 6,
    languageId: options.languageId,
  });

  return ranked.map((r) => {
    const t = texts.get(r.textId);
    return {
      ...r,
      title: t?.title ?? r.textId,
      author: t?.author,
      language: t?.language ?? '',
      level: t?.level,
      genre: t?.genre,
      sectionId: t?.sectionsPreview?.[0]?.id,
      comprehensionLabel: phraseComprehension(r.comprehension),
      newLemmasLabel: phraseNewLemmas(r.newLemmas),
    };
  });
}

// ── Top lemmas for onboarding cold-start ─────────────────────────────────────

const _topLemmaCache = new Map<string, { at: number; value: string[] }>();
const TOP_LEMMA_TTL_MS = 60 * 60_000;

export function getTopLemmasForLanguage(languageId: string, limit = 50): string[] {
  const key = `${languageId}::${limit}`;
  const cached = _topLemmaCache.get(key);
  if (cached && Date.now() - cached.at < TOP_LEMMA_TTL_MS) return cached.value;

  const { profiles } = getProfileCache();
  const totals: Record<string, number> = {};
  for (const p of profiles) {
    if (p.languageId !== languageId) continue;
    for (const [lemma, count] of Object.entries(p.lemmaCounts)) {
      totals[lemma] = (totals[lemma] ?? 0) + count;
    }
  }
  const top = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([lemma]) => lemma);

  _topLemmaCache.set(key, { at: Date.now(), value: top });
  return top;
}

// Re-export for the route file's convenience.
export { scoreText };
