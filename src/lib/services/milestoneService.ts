/**
 * Known-word milestone laurels (roadmap § 11, 3.5).
 *
 * Fires a one-time celebration when a learner's per-language known-word count
 * crosses a milestone threshold (50 / 100 / 500 / 1000). Each milestone is
 * celebrated at most once per language; the highest celebrated milestone is
 * persisted in localStorage so reloads and re-crossings stay silent.
 */

export const KNOWN_WORD_MILESTONES = [50, 100, 500, 1000] as const;

const STORAGE_KEY = 'paleoglossa_known_milestones';

/** Map of languageId → highest milestone already celebrated for that language. */
type MilestoneStore = Record<string, number>;

function readStore(): MilestoneStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as MilestoneStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: MilestoneStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Best-effort: a full/disabled localStorage just means the laurel may
    // re-fire later. Never let a celebration break a vocab save.
  }
}

/**
 * Pure milestone resolution. Given the new known-word count and the highest
 * milestone already celebrated, return the highest newly-reached milestone, or
 * `null` if none was crossed. Jumping past several thresholds at once (e.g. a
 * bulk known-words import) yields only the highest — one laurel, not a flood.
 */
export function nextReachedMilestone(newCount: number, lastCelebrated: number): number | null {
  let reached: number | null = null;
  for (const milestone of KNOWN_WORD_MILESTONES) {
    if (newCount >= milestone && milestone > lastCelebrated) {
      reached = milestone;
    }
  }
  return reached;
}

/**
 * Stateful check: records and returns the milestone just reached for a language,
 * or `null`. Persists so each milestone celebrates exactly once per language.
 */
export function checkKnownWordMilestone(languageId: string, newCount: number): number | null {
  if (!languageId) return null;
  const store = readStore();
  const lastCelebrated = store[languageId] ?? 0;
  const reached = nextReachedMilestone(newCount, lastCelebrated);
  if (reached !== null) {
    store[languageId] = reached;
    writeStore(store);
  }
  return reached;
}

/** Test/utility helper: clear all recorded milestones. */
export function resetKnownWordMilestones(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
