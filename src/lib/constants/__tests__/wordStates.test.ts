import { describe, it, expect } from 'vitest';
import { WordState, STATE_COLORS, normalizeWordState, safeStateColors, safeStateLabel } from '../wordStates';

describe('normalizeWordState', () => {
  it('passes through valid enum values unchanged', () => {
    expect(normalizeWordState(WordState.NEW)).toBe(WordState.NEW);
    expect(normalizeWordState(WordState.SEEN)).toBe(WordState.SEEN);
    expect(normalizeWordState(WordState.LEARNING)).toBe(WordState.LEARNING);
    expect(normalizeWordState(WordState.FAMILIAR)).toBe(WordState.FAMILIAR);
    expect(normalizeWordState(WordState.KNOWN)).toBe(WordState.KNOWN);
    expect(normalizeWordState(WordState.IGNORED)).toBe(WordState.IGNORED);
  });

  it('normalizes legacy capitalized display labels', () => {
    expect(normalizeWordState('New')).toBe(WordState.NEW);
    expect(normalizeWordState('Seen Once')).toBe(WordState.SEEN);
    expect(normalizeWordState('Learning')).toBe(WordState.LEARNING);
    expect(normalizeWordState('Familiar')).toBe(WordState.FAMILIAR);
    expect(normalizeWordState('Known')).toBe(WordState.KNOWN);
    expect(normalizeWordState('Ignored')).toBe(WordState.IGNORED);
  });

  it('normalizes lowercase strings', () => {
    expect(normalizeWordState('new')).toBe(WordState.NEW);
    expect(normalizeWordState('seen')).toBe(WordState.SEEN);
    expect(normalizeWordState('learning')).toBe(WordState.LEARNING);
    expect(normalizeWordState('familiar')).toBe(WordState.FAMILIAR);
    expect(normalizeWordState('known')).toBe(WordState.KNOWN);
    expect(normalizeWordState('ignored')).toBe(WordState.IGNORED);
  });

  it('normalizes mixed-case strings', () => {
    expect(normalizeWordState('KNOWN')).toBe(WordState.KNOWN);
    expect(normalizeWordState('Known')).toBe(WordState.KNOWN);
    expect(normalizeWordState('kNoWn')).toBe(WordState.KNOWN);
  });

  it('normalizes legacy numeric values (number type)', () => {
    expect(normalizeWordState(0)).toBe(WordState.NEW);
    expect(normalizeWordState(1)).toBe(WordState.SEEN);
    expect(normalizeWordState(2)).toBe(WordState.LEARNING);
    expect(normalizeWordState(3)).toBe(WordState.KNOWN);
    expect(normalizeWordState(4)).toBe(WordState.FAMILIAR);
    expect(normalizeWordState(5)).toBe(WordState.IGNORED);
  });

  it('normalizes legacy numeric string values', () => {
    expect(normalizeWordState('0')).toBe(WordState.NEW);
    expect(normalizeWordState('3')).toBe(WordState.KNOWN);
  });

  it('falls back to NEW for null', () => {
    expect(normalizeWordState(null)).toBe(WordState.NEW);
  });

  it('falls back to NEW for undefined', () => {
    expect(normalizeWordState(undefined)).toBe(WordState.NEW);
  });

  it('falls back to NEW for unrecognised garbage strings', () => {
    expect(normalizeWordState('garbage')).toBe(WordState.NEW);
    expect(normalizeWordState('')).toBe(WordState.NEW);
    expect(normalizeWordState('invalid_state')).toBe(WordState.NEW);
  });

  it('falls back to NEW for unrecognised numeric values', () => {
    expect(normalizeWordState(99)).toBe(WordState.NEW);
    expect(normalizeWordState(-1)).toBe(WordState.NEW);
  });

  it('normalizes seenonce variant', () => {
    expect(normalizeWordState('seenonce')).toBe(WordState.SEEN);
    expect(normalizeWordState('SeenOnce')).toBe(WordState.SEEN);
  });
});

describe('safeStateColors', () => {
  it('returns a valid color object for all WordState values', () => {
    for (const state of Object.values(WordState)) {
      const colors = safeStateColors(state);
      expect(colors).toBeDefined();
      expect(typeof colors.bg).toBe('string');
      expect(typeof colors.border).toBe('string');
      expect(typeof colors.text).toBe('string');
    }
  });

  it('does not crash for null', () => {
    expect(() => safeStateColors(null)).not.toThrow();
    expect(safeStateColors(null)).toEqual(STATE_COLORS[WordState.NEW]);
  });

  it('does not crash for undefined', () => {
    expect(() => safeStateColors(undefined)).not.toThrow();
    expect(safeStateColors(undefined)).toEqual(STATE_COLORS[WordState.NEW]);
  });

  it('does not crash for legacy string values', () => {
    expect(() => safeStateColors('New')).not.toThrow();
    expect(() => safeStateColors('garbage')).not.toThrow();
    expect(safeStateColors('garbage')).toEqual(STATE_COLORS[WordState.NEW]);
  });
});

describe('safeStateLabel', () => {
  it('returns correct labels for valid states', () => {
    expect(safeStateLabel(WordState.NEW)).toBe('New');
    expect(safeStateLabel(WordState.KNOWN)).toBe('Known');
  });

  it('falls back to NEW label for invalid input', () => {
    expect(safeStateLabel(null)).toBe('New');
    expect(safeStateLabel(undefined)).toBe('New');
    expect(safeStateLabel('garbage')).toBe('New');
  });
});
