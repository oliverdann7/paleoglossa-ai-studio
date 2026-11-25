import { db } from '../firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { WordState } from '../constants/wordStates.js';
import { UNKNOWN_LANGUAGE, parseVocabKey, vocabKey } from '../vocabulary/identity.js';

// ─── Catalog ────────────────────────────────────────────────────────────────

export interface AchievementDef {
  id: string;
  /** Scholarly name (Greek/Latin). */
  name: string;
  /** Transliteration shown beneath the name. */
  transliteration: string;
  /** Description shown after unlocking. */
  description: string;
  /** Teaser shown to locked users. */
  hint: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'nyktophilos',
    name: 'Φιλόνυκτος',
    transliteration: 'Nyktophilos',
    description: 'Reviewed your cards after midnight — a true scholar who keeps the lamp burning.',
    hint: 'Reviewed late at night…',
  },
  {
    id: 'polyglottos',
    name: 'Πολύγλωσσος',
    transliteration: 'Polyglottos',
    description: 'Marked 50 words as known in each of 5 different ancient languages.',
    hint: 'Many tongues, one mind…',
  },
  {
    id: 'philoponos',
    name: 'Φιλόπονος',
    transliteration: 'Philoponos',
    description: 'Read for 60 minutes in a single session — a lover of toil.',
    hint: 'Long hours at the desk…',
  },
  {
    id: 'mnemon',
    name: 'Μνήμων',
    transliteration: 'Mnemon',
    description: 'Maintained a 10-day reading streak — one who remembers.',
    hint: 'A habit forged in repetition…',
  },
  {
    id: 'akribologos',
    name: 'Ἀκριβολόγος',
    transliteration: 'Akribologos',
    description: 'Scored 100% accuracy on a review session of 10 or more cards.',
    hint: 'Perfect recall in a long session…',
  },
  {
    id: 'primus_calami',
    name: 'Primus Calami',
    transliteration: 'Primus Calami',
    description: 'Imported your first text — the first stroke of the pen.',
    hint: 'Brought a new text into the library…',
  },
  {
    id: 'codex_mille',
    name: 'Codex Mille',
    transliteration: 'Codex Mille',
    description: 'Reached 1,000 total known words — the thousand-word codex.',
    hint: 'A great store of remembered words…',
  },
  {
    id: 'palimpsestus',
    name: 'Palimpsestus',
    transliteration: 'Palimpsestus',
    description: 'Reviewed the same word 5 or more times — perseverance leaves its mark.',
    hint: 'Worn smooth by repeated study…',
  },
  {
    id: 'bibliophilos',
    name: 'Βιβλιόφιλος',
    transliteration: 'Bibliophilos',
    description: 'Read 5 different texts — a true lover of books.',
    hint: 'Many volumes, many worlds…',
  },
];

// ─── Firestore helpers ───────────────────────────────────────────────────────

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string; // ISO date string
}

function achievementsCol(userId: string) {
  return collection(db, 'users', userId, 'achievements');
}

export async function getUnlocked(userId: string): Promise<UnlockedAchievement[]> {
  const snap = await getDocs(achievementsCol(userId));
  return snap.docs.map((d) => ({ id: d.id, unlockedAt: d.data().unlockedAt as string }));
}

// Achievements never re-lock, so one confirmed unlock per page load is enough.
// Without this, a learner past a threshold (1,000 known words, a 10-day
// streak) would pay a Firestore read on every later trigger.
const knownUnlocked = new Map<string, Set<string>>();

function rememberUnlocked(userId: string, id: string): void {
  let ids = knownUnlocked.get(userId);
  if (!ids) {
    ids = new Set();
    knownUnlocked.set(userId, ids);
  }
  ids.add(id);
}

async function isUnlocked(userId: string, id: string): Promise<boolean> {
  if (knownUnlocked.get(userId)?.has(id)) return true;
  const ref = doc(db, 'users', userId, 'achievements', id);
  const snap = await getDoc(ref);
  if (snap.exists()) rememberUnlocked(userId, id);
  return snap.exists();
}

async function unlock(userId: string, id: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'achievements', id);
  await setDoc(ref, { unlockedAt: new Date().toISOString() });
  rememberUnlocked(userId, id);
}

// ─── Trigger context types ───────────────────────────────────────────────────

export type AchievementTrigger =
  | 'review_session'
  | 'word_known'
  | 'import_text'
  | 'read_session'
  | 'streak_updated'
  | 'word_reviewed';

export interface ReviewSessionContext {
  accuracy: number;
  cardCount: number;
  hour: number;
}

export interface WordKnownContext {
  totalKnown: number;
  languageCount: number;
}

export interface ReadSessionContext {
  minutes: number;
  textsRead: number;
}

export interface StreakContext {
  streak: number;
}

export interface WordReviewedContext {
  /** How many times this word has been reviewed (encounter count). */
  reviewCount: number;
}

export type AchievementContext =
  | ReviewSessionContext
  | WordKnownContext
  | ReadSessionContext
  | StreakContext
  | WordReviewedContext
  | Record<string, never>;

// ─── Context helpers ─────────────────────────────────────────────────────────

/** Polyglottos: this many known words in a language make it count. */
export const POLYGLOT_WORDS_PER_LANGUAGE = 50;

interface KnownEntry {
  state?: unknown;
  languageId?: string;
}

/**
 * Context for `word_known`, counted over the whole vocabulary (every
 * language), not the active language's stats.
 *
 * `newlyKnown` are words being marked known right now: the caller's map is
 * still the one from before the change, so they are added here.
 */
export function wordKnownContext(
  knowledge: Record<string, KnownEntry | undefined>,
  newlyKnown: { lemma: string; languageId?: string | null }[] = []
): WordKnownContext {
  const perLanguage = new Map<string, number>();
  const counted = new Set<string>();
  let totalKnown = 0;

  const add = (key: string, languageId: string) => {
    if (counted.has(key)) return;
    counted.add(key);
    totalKnown++;
    perLanguage.set(languageId, (perLanguage.get(languageId) ?? 0) + 1);
  };

  for (const [key, info] of Object.entries(knowledge)) {
    if (info?.state !== WordState.KNOWN) continue;
    add(key, info.languageId || parseVocabKey(key).languageId);
  }
  for (const word of newlyKnown) {
    add(vocabKey(word.lemma, word.languageId), word.languageId || UNKNOWN_LANGUAGE);
  }

  let languageCount = 0;
  for (const [languageId, count] of perLanguage) {
    if (languageId !== UNKNOWN_LANGUAGE && count >= POLYGLOT_WORDS_PER_LANGUAGE) languageCount++;
  }
  return { totalKnown, languageCount };
}

/**
 * How many different texts the learner has read to the end. `alsoFinished`
 * is the text finished just now, whose saved progress may not be written yet.
 */
export function countTextsRead(
  progress: { textId: string; completed?: boolean; lastPosition?: number }[],
  alsoFinished?: string | null
): number {
  const finished = new Set<string>();
  for (const p of progress) {
    if (p.textId && (p.completed || (p.lastPosition ?? 0) >= 95)) finished.add(p.textId);
  }
  if (alsoFinished) finished.add(alsoFinished);
  return finished.size;
}

// ─── checkAndUnlock ──────────────────────────────────────────────────────────

/**
 * Fire-and-forget: call without await in hot paths.
 * Returns the list of newly unlocked achievement ids.
 */
export async function checkAndUnlock(
  userId: string,
  trigger: AchievementTrigger,
  context: AchievementContext = {}
): Promise<string[]> {
  if (!userId) return [];

  const candidates: string[] = [];

  switch (trigger) {
    case 'review_session': {
      const ctx = context as ReviewSessionContext;
      if (ctx.hour >= 0 && ctx.hour < 4) candidates.push('nyktophilos');
      if (ctx.accuracy === 100 && ctx.cardCount >= 10) candidates.push('akribologos');
      break;
    }
    case 'word_known': {
      const ctx = context as WordKnownContext;
      if (ctx.totalKnown >= 1000) candidates.push('codex_mille');
      if (ctx.languageCount >= 5) candidates.push('polyglottos');
      break;
    }
    case 'import_text': {
      candidates.push('primus_calami');
      break;
    }
    case 'read_session': {
      const ctx = context as ReadSessionContext;
      if (ctx.minutes >= 60) candidates.push('philoponos');
      if (ctx.textsRead >= 5) candidates.push('bibliophilos');
      break;
    }
    case 'streak_updated': {
      const ctx = context as StreakContext;
      if (ctx.streak >= 10) candidates.push('mnemon');
      break;
    }
    case 'word_reviewed': {
      const ctx = context as WordReviewedContext;
      if (ctx.reviewCount >= 5) candidates.push('palimpsestus');
      break;
    }
  }

  const newlyUnlocked: string[] = [];
  for (const id of candidates) {
    try {
      const already = await isUnlocked(userId, id);
      if (!already) {
        await unlock(userId, id);
        newlyUnlocked.push(id);
      }
    } catch {
      // Non-critical — silently ignore Firestore errors for achievements.
    }
  }
  return newlyUnlocked;
}
