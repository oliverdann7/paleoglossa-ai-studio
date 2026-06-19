import { describe, it, expect } from 'vitest';
import {
  selectShowCard,
  selectHighlightNav,
  HIGHLIGHT_WINDOW_MS,
  type BeginnerHubDiscoveryState,
} from '../useBeginnerHubDiscovery.js';

const NOW = 1_700_000_000_000;

describe('beginner hub discovery selectors (roadmap 1.6)', () => {
  it('shows the card until dismissed', () => {
    expect(selectShowCard({ firstSeen: null, dismissed: false })).toBe(true);
    expect(selectShowCard({ firstSeen: NOW, dismissed: false })).toBe(true);
    expect(selectShowCard({ firstSeen: NOW, dismissed: true })).toBe(false);
  });

  it('does not highlight the nav until the card has been seen', () => {
    const unseen: BeginnerHubDiscoveryState = { firstSeen: null, dismissed: false };
    expect(selectHighlightNav(unseen, NOW)).toBe(false);
  });

  it('highlights the nav within the 7-day window after first seen', () => {
    const seen: BeginnerHubDiscoveryState = { firstSeen: NOW, dismissed: false };
    expect(selectHighlightNav(seen, NOW)).toBe(true);
    expect(selectHighlightNav(seen, NOW + HIGHLIGHT_WINDOW_MS - 1)).toBe(true);
  });

  it('stops highlighting once the window lapses', () => {
    const seen: BeginnerHubDiscoveryState = { firstSeen: NOW, dismissed: false };
    expect(selectHighlightNav(seen, NOW + HIGHLIGHT_WINDOW_MS)).toBe(false);
    expect(selectHighlightNav(seen, NOW + HIGHLIGHT_WINDOW_MS + 1)).toBe(false);
  });

  it('never highlights once dismissed, even inside the window', () => {
    const dismissed: BeginnerHubDiscoveryState = { firstSeen: NOW, dismissed: true };
    expect(selectHighlightNav(dismissed, NOW)).toBe(false);
  });
});
