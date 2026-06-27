import { db } from '../firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';

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
    description: 'Marked 50 words as known across 5 different ancient languages.',
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

async function isUnlocked(userId: string, id: string): Promise<boolean> {
  const ref = doc(db, 'users', userId, 'achievements', id);
  const snap = await getDoc(ref);
  return snap.exists();
}

async function unlock(userId: string, id: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'achievements', id);
  await setDoc(ref, { unlockedAt: new Date().toISOString() });
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
