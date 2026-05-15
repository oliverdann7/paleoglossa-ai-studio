export enum WordState {
  NEW = 'NEW',
  SEEN = 'SEEN',
  LEARNING = 'LEARNING',
  FAMILIAR = 'FAMILIAR',
  KNOWN = 'KNOWN',
  IGNORED = 'IGNORED'
}

export const STATE_COLORS: Record<WordState, { bg: string, border: string, text: string }> = {
  [WordState.NEW]: { bg: '#DCE7F5', border: '#BDD0EC', text: '#1E3D6E' },
  [WordState.SEEN]: { bg: '#F5F3EF', border: '#E7E2D8', text: '#1E3D6E' },
  [WordState.LEARNING]: { bg: '#FEF0D8', border: '#EED080', text: '#78350F' },
  [WordState.FAMILIAR]: { bg: '#FAE8C8', border: '#F1DAB0', text: '#78350F' },
  [WordState.KNOWN]: { bg: 'transparent', border: 'transparent', text: 'inherit' },
  [WordState.IGNORED]: { bg: '#E0DAC8', border: '#C0B7A0', text: '#71717a' }
};

export const STATE_LABELS: Record<WordState, string> = {
  [WordState.NEW]: 'New',
  [WordState.SEEN]: 'Seen',
  [WordState.LEARNING]: 'Learning',
  [WordState.FAMILIAR]: 'Familiar',
  [WordState.KNOWN]: 'Known',
  [WordState.IGNORED]: 'Ignored'
};

const VALID_STATES = new Set<string>(Object.values(WordState));

// Maps legacy/display string values (lowercased) to canonical WordState.
// Covers old display names, old enum variants, and old numeric values.
const LEGACY_STATE_MAP: Record<string, WordState> = {
  // Old display labels (capitalized names)
  'new': WordState.NEW,
  'seen': WordState.SEEN,
  'seen once': WordState.SEEN,
  'seenonce': WordState.SEEN,
  'learning': WordState.LEARNING,
  'familiar': WordState.FAMILIAR,
  'known': WordState.KNOWN,
  'ignored': WordState.IGNORED,
  // Old numeric values (stored as numbers or numeric strings)
  '0': WordState.NEW,
  '1': WordState.SEEN,
  '2': WordState.LEARNING,
  '3': WordState.KNOWN,
  '4': WordState.FAMILIAR,
  '5': WordState.IGNORED,
};

/**
 * Converts any legacy, invalid, null, or undefined word state value into a
 * valid WordState enum member. Falls back to WordState.NEW for anything
 * unrecognised so STATE_COLORS is always safe to index.
 */
export function normalizeWordState(value: unknown): WordState {
  if (value == null) return WordState.NEW;

  // Already a valid enum string value
  if (VALID_STATES.has(value as string)) return value as WordState;

  // Numeric values stored as actual numbers (legacy format)
  if (typeof value === 'number') {
    const mapped = LEGACY_STATE_MAP[String(value)];
    return mapped ?? WordState.NEW;
  }

  // String lookup — case-insensitive
  const lower = String(value).toLowerCase().trim();
  return LEGACY_STATE_MAP[lower] ?? WordState.NEW;
}

/**
 * Safe accessor for STATE_COLORS. Always returns a valid color object even
 * when `state` is a legacy, null, or otherwise invalid value.
 */
export function safeStateColors(state: unknown): { bg: string; border: string; text: string } {
  return STATE_COLORS[normalizeWordState(state)];
}

/**
 * Safe accessor for STATE_LABELS. Always returns a valid label string.
 */
export function safeStateLabel(state: unknown): string {
  return STATE_LABELS[normalizeWordState(state)];
}
