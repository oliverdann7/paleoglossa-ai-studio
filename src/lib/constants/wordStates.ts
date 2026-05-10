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
