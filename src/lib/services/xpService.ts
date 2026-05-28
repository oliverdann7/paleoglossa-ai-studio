import { db } from '../firebase.js';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

// ─── XP Configuration ───────────────────────────────────────────────────────

export interface XPLevel {
  name: string;
  threshold: number;
  icon: string;
}

export const XP_LEVELS: XPLevel[] = [
  { name: 'Novice', threshold: 0, icon: '📜' },
  { name: 'Apprentice', threshold: 500, icon: '📖' },
  { name: 'Scholar', threshold: 2000, icon: '🏛️' },
  { name: 'Philologist', threshold: 5000, icon: '🎓' },
  { name: 'Master', threshold: 15000, icon: '💎' },
];

export const XP_REWARDS = {
  wordRead: 1, // per word read
  reviewCard: 5, // per SRS card reviewed
  challengeBronze: 50,
  challengeSilver: 100,
  challengeGold: 200,
  textCompleted: 100,
  streakDay: 10, // per day of streak maintained
  grammarConceptMastered: 75,
} as const;

// ─── XP Data ────────────────────────────────────────────────────────────────

export interface XPData {
  totalXP: number;
  level: string;
  levelIndex: number;
}

const DEFAULT_XP: XPData = {
  totalXP: 0,
  level: 'Novice',
  levelIndex: 0,
};

// ─── Level Calculation ──────────────────────────────────────────────────────

export function getLevelForXP(xp: number): { name: string; index: number; icon: string } {
  let best = XP_LEVELS[0];
  let bestIdx = 0;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].threshold) {
      best = XP_LEVELS[i];
      bestIdx = i;
    }
  }
  return { name: best.name, index: bestIdx, icon: best.icon };
}

export function getNextLevel(currentIndex: number): XPLevel | null {
  return currentIndex < XP_LEVELS.length - 1 ? XP_LEVELS[currentIndex + 1] : null;
}

export function getProgressToNextLevel(totalXP: number, currentIndex: number): number {
  const next = getNextLevel(currentIndex);
  if (!next) return 1; // Max level — 100%
  const current = XP_LEVELS[currentIndex];
  const range = next.threshold - current.threshold;
  const progress = totalXP - current.threshold;
  return Math.min(1, Math.max(0, progress / range));
}

// ─── Firestore Operations ───────────────────────────────────────────────────

function xpDocRef(userId: string) {
  return doc(db, `users/${userId}`);
}

export const XPService = {
  async getXP(userId: string | null): Promise<XPData> {
    if (!userId) return DEFAULT_XP;
    try {
      const snap = await getDoc(xpDocRef(userId));
      if (!snap.exists()) return DEFAULT_XP;
      const data = snap.data();
      const totalXP = data.totalXP ?? 0;
      const level = getLevelForXP(totalXP);
      return { totalXP, level: level.name, levelIndex: level.index };
    } catch {
      return DEFAULT_XP;
    }
  },

  async awardXP(userId: string | null, amount: number): Promise<XPData | null> {
    if (!userId || amount <= 0) return null;
    try {
      const ref = xpDocRef(userId);
      await setDoc(ref, { totalXP: increment(amount) }, { merge: true });
      // Read back to get new total
      const snap = await getDoc(ref);
      const totalXP = snap.data()?.totalXP ?? amount;
      const level = getLevelForXP(totalXP);
      return { totalXP, level: level.name, levelIndex: level.index };
    } catch {
      return null;
    }
  },
};
