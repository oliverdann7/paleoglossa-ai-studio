/**
 * What to read after finishing a text.
 *
 * Order of preference:
 *   1. the next unfinished step on the learner's pathway, when the text just
 *      finished is on it (or the learner has chosen a goal);
 *   2. a text already begun in the same language — finish what was started;
 *   3. the closest match by level, author and genre.
 *
 * Pure: takes plain metadata, returns a suggestion with the reason for it.
 */
import { getPathway, pathwayPosition } from './pathways.js';

export interface ReadingCandidate {
  id: string;
  title: string;
  language: string;
  author?: string;
  level?: string;
  genre?: string;
  sentenceCount?: number;
}

export type NextReadingReason = 'pathway' | 'resume' | 'sameAuthor' | 'nextLevel' | 'sameLevel';

export interface NextReading {
  text: ReadingCandidate;
  reason: NextReadingReason;
  /** For 'pathway': why the step sits where it does, and the destination. */
  why?: string;
  goal?: string;
}

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelIndex = (level?: string) => {
  const at = LEVELS.indexOf((level ?? '').toUpperCase());
  return at < 0 ? null : at;
};

export interface NextReadingOptions {
  /** Texts read to the end. */
  finished?: ReadonlySet<string>;
  /** Texts begun but not finished. */
  started?: ReadonlySet<string>;
  /** The learner's chosen pathway destination for this language. */
  goalTextId?: string | null;
}

export function pickNextReading(
  current: ReadingCandidate,
  candidates: ReadingCandidate[],
  options: NextReadingOptions = {}
): NextReading | null {
  // The text on screen counts as finished: this runs at its end.
  const finished = new Set(options.finished ?? []);
  finished.add(current.id);
  const started = options.started ?? new Set<string>();
  const byId = new Map(candidates.map((c) => [c.id, c]));

  const pathway = getPathway(current.language);
  const onPath = pathway?.steps.some((s) => s.textId === current.id) ?? false;
  if (pathway && (onPath || options.goalTextId)) {
    const at = pathway.steps.findIndex((s) => s.textId === current.id);
    // Whoever has just read a text on the path has passed everything before it,
    // read or not: the suggestion must lead onward.
    const passed = new Set(finished);
    pathway.steps.slice(0, Math.max(0, at)).forEach((s) => passed.add(s.textId));
    const position = pathwayPosition(current.language, passed, options.goalTextId);
    // Past the chosen destination, carry on along the rest of the path.
    const step = position?.next ?? pathway.steps.find((s, i) => i > at && !passed.has(s.textId));
    const text = step && byId.get(step.textId);
    if (step && text) {
      return {
        text,
        reason: 'pathway',
        why: step.why,
        goal: position?.next ? position.goal.goal : undefined,
      };
    }
  }

  const pool = candidates.filter(
    (c) => c.language === current.language && c.id !== current.id && !finished.has(c.id)
  );
  if (pool.length === 0) return null;

  const currentLevel = levelIndex(current.level);
  const scored = pool.map((text) => {
    let score = 0;
    let reason: NextReadingReason = 'sameLevel';
    const level = levelIndex(text.level);
    if (currentLevel !== null && level !== null) {
      const step = level - currentLevel;
      // Same level or one step up is the target; further away falls off fast.
      score += step === 0 ? 30 : step === 1 ? 26 : step === -1 ? 10 : step === 2 ? 6 : 0;
      if (step === 1) reason = 'nextLevel';
    }
    if (text.author && text.author === current.author) {
      score += 12;
      reason = 'sameAuthor';
    }
    if (text.genre && text.genre === current.genre) score += 6;
    if (started.has(text.id)) {
      score += 40;
      reason = 'resume';
    }
    return { text, score, reason };
  });

  // Ties go to the shorter text, then to a stable order.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      (a.text.sentenceCount ?? Infinity) - (b.text.sentenceCount ?? Infinity) ||
      a.text.id.localeCompare(b.text.id)
  );
  const best = scored[0];
  return { text: best.text, reason: best.reason };
}
