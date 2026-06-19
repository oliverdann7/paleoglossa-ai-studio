import { useCallback, useSyncExternalStore } from 'react';

/**
 * One-time discoverability for the Beginner Hub (roadmap § 11, 1.6).
 *
 * The Beginner Hub curriculum already exists but is easy to miss. This tracks a
 * tiny per-device flag so the Dashboard can show a one-time "Your Beginner Hub
 * is ready" card and the sidebar can highlight the nav item for the first week —
 * both stop the moment the learner dismisses the card or the window lapses.
 *
 * Kept as a module-level external store (mirroring `useBeginnerProgress`) so the
 * Dashboard card and the Navbar highlight stay in sync without prop-drilling.
 */

const STORAGE_KEY = 'paleoglossa_beginner_hub_discovery';
export const HIGHLIGHT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface BeginnerHubDiscoveryState {
  /** Epoch ms when the card was first shown; null until the beginner sees it. */
  firstSeen: number | null;
  /** True once the learner dismisses the card (or clicks through). */
  dismissed: boolean;
}

const DEFAULT_STATE: BeginnerHubDiscoveryState = { firstSeen: null, dismissed: false };

let state: BeginnerHubDiscoveryState = loadFromStorage();
const listeners = new Set<() => void>();

function loadFromStorage(): BeginnerHubDiscoveryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // non-fatal: discoverability is best-effort
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): BeginnerHubDiscoveryState {
  return state;
}

/**
 * Record that an eligible learner has had the chance to see the hub — starts the
 * highlight window. Idempotent: only the first call sets `firstSeen`.
 */
export function markBeginnerHubSeen(now: number = Date.now()): void {
  if (state.firstSeen != null) return;
  state = { ...state, firstSeen: now };
  persist();
  emit();
}

/** Permanently stop showing the card and the nav highlight. */
export function dismissBeginnerHubDiscovery(): void {
  if (state.dismissed) return;
  state = { ...state, dismissed: true };
  persist();
  emit();
}

// ── Pure selectors (exported for tests) ──────────────────────────────────────

/** The one-time Dashboard card shows until the learner dismisses it. */
export function selectShowCard(s: BeginnerHubDiscoveryState): boolean {
  return !s.dismissed;
}

/**
 * The sidebar highlight shows only after the card has been activated
 * (`firstSeen` set) and only within the 7-day window, never once dismissed.
 */
export function selectHighlightNav(
  s: BeginnerHubDiscoveryState,
  now: number = Date.now()
): boolean {
  if (s.dismissed || s.firstSeen == null) return false;
  return now - s.firstSeen < HIGHLIGHT_WINDOW_MS;
}

export interface BeginnerHubDiscovery {
  /** Whether the one-time Dashboard card should render (caller adds eligibility). */
  showCard: boolean;
  /** Whether the sidebar nav item should be highlighted. */
  highlightNav: boolean;
  /** Start the highlight window (call when the card first renders). */
  markSeen: (now?: number) => void;
  /** Dismiss the card + highlight permanently. */
  dismiss: () => void;
}

export function useBeginnerHubDiscovery(): BeginnerHubDiscovery {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const dismiss = useCallback(() => dismissBeginnerHubDiscovery(), []);
  return {
    showCard: selectShowCard(snap),
    highlightNav: selectHighlightNav(snap),
    markSeen: markBeginnerHubSeen,
    dismiss,
  };
}
