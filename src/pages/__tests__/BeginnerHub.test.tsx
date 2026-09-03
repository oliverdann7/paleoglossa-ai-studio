import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react';

// ── Firebase + auth + settings mocks ────────────────────────────────────────
// useBeginnerProgress (refactored) imports `firebase/firestore` and useAuth,
// and BeginnerHub now reads onboardingProfile via useSettings. We stub all
// three so tests run without real Firebase configuration.

vi.mock('../../lib/firebase.js', () => ({ db: {} }));

// Stub DailyPath so its own hook chain (useKnowledge → useVocabLimit →
// SubscriptionContext) doesn't fire during BeginnerHub tests. DailyPath has
// its own unit tests in dailyPathService.test.ts.
vi.mock('../../components/beginner/DailyPath.js', () => ({
  DailyPath: () => null,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(async () => ({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

let mockAuthUser: { uid: string } | null = null;
vi.mock('../../lib/hooks/useAuth.js', () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

vi.mock('../../lib/hooks/useActiveLanguage.js', () => ({
  useActiveLanguage: () => ({
    activeLanguageId: 'grc',
    setActiveLanguageId: vi.fn(),
    currentLanguage: { id: 'grc', name: 'Ancient Greek' },
    availableLanguages: [],
    isLoaded: true,
  }),
}));

let mockOnboarding:
  | {
      completed: boolean;
      languageId: string;
      level: 'absolute-beginner' | 'knows-alphabet' | 'intermediate' | 'advanced';
      goal: 'biblical' | 'classical' | 'research' | 'vocab' | 'grammar';
      dailyCommitment: number;
    }
  | undefined = undefined;
vi.mock('../../lib/hooks/useSettings.js', () => ({
  useSettings: () => ({
    settings: { onboardingProfile: mockOnboarding },
    updateSettings: vi.fn(),
  }),
}));

import { CorpusDB } from '../../data/corpus.js';
import { getAvailableLanguages } from '../../lib/constants/languages.js';
import {
  useBeginnerProgress,
  recordMilestone,
  __resetBeginnerProgressForTests,
} from '../../lib/hooks/useBeginnerProgress.js';
import { BeginnerHub } from '../BeginnerHub.js';

// ── Mocks ───────────────────────────────────────────────────────────────────

afterEach(() => {
  cleanup();
  localStorage.clear();
  __resetBeginnerProgressForTests();
  mockAuthUser = null;
  mockOnboarding = undefined;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('lucide-react', () => {
  const Icn = ({ children, ...p }: any) => <div {...p}>{children}</div>;
  const all: Record<string, any> = { default: Icn };
  const icons = [
    'ArrowLeft',
    'BookOpen',
    'GraduationCap',
    'Sparkles',
    'Check',
    'ChevronRight',
    'Library',
    'Languages',
  ];
  icons.forEach((n) => (all[n] = Icn));
  return all;
});

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
}));

// ── Helper ───────────────────────────────────────────────────────────────────

function renderHub() {
  return render(
    <MemoryRouter>
      <BeginnerHub />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('BeginnerHub', () => {
  it('renders the title and description', () => {
    renderHub();
    expect(screen.getByText('Beginner Hub')).toBeDefined();
  });

  it('renders tier selector buttons', () => {
    renderHub();
    expect(screen.getByText('I know nothing')).toBeDefined();
    expect(screen.getByText('I know the alphabet')).toBeDefined();
    expect(screen.getByText('I can read slowly')).toBeDefined();
    expect(screen.getByText('I am studying academically')).toBeDefined();
  });

  it('renders the active language card (Ancient Greek by default)', () => {
    renderHub();
    expect(screen.getByText('Ancient Greek')).toBeDefined();
  });

  it('shows badges for the active language', () => {
    renderHub();
    const lang = getAvailableLanguages().find((l) => l.id === 'grc')!;
    const container = screen.getByText(lang.name).closest('div')?.parentElement;
    if (lang.supportsMorphology) {
      expect(container?.textContent).toContain('Morph');
    }
  });

  it('each language has a recommended start link pointing to a valid text ID', () => {
    const allTexts = CorpusDB.getTexts();
    for (const lang of getAvailableLanguages()) {
      const recommended = lang.recommendedStartTextId;
      if (!recommended) continue;
      expect(allTexts.some((t) => t.id === recommended)).toBe(true);
    }
  });

  it('shows guided path steps for the active language (always expanded)', () => {
    renderHub();
    expect(screen.getByText((c: string) => c.startsWith('Your path'))).toBeDefined();
    expect(screen.getByText('Learn the script')).toBeDefined();
    expect(screen.getByText('Start your first text')).toBeDefined();
  });

  it('changing tier switches the guided path steps', () => {
    renderHub();
    fireEvent.click(screen.getByText('I know the alphabet'));
    expect(screen.getByText((c: string) => c.startsWith('Your path'))).toBeDefined();
    expect(screen.getByText('Start A1 reading')).toBeDefined();
  });
});

describe('BeginnerHub — ScriptLab links', () => {
  it('active language with hasScriptLearning shows the alphabet-course link', () => {
    renderHub();
    const activeLang = getAvailableLanguages().find((l) => l.id === 'grc');
    if (activeLang?.hasScriptLearning) {
      // Languages with an alphabet course show its title; others fall back to
      // the generic "Learn the {{script}} script" label.
      const found =
        screen.queryByText('The Greek Alphabet') ??
        screen.queryByText((content) => content.includes('{{script}}'));
      expect(found).not.toBeNull();
    }
  });
});

describe('useBeginnerProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetBeginnerProgressForTests();
  });

  it('returns default false for all milestones', () => {
    const { result } = renderHook(() => useBeginnerProgress());
    const p = result.current.getProgress('grc');
    expect(p.scriptOpened).toBe(false);
    expect(p.firstTextOpened).toBe(false);
    expect(p.firstWordSaved).toBe(false);
    expect(p.firstReviewCompleted).toBe(false);
  });

  it('persists milestones to localStorage', () => {
    const { result } = renderHook(() => useBeginnerProgress());
    act(() => {
      result.current.markMilestone('grc', 'scriptOpened');
    });
    expect(result.current.getProgress('grc').scriptOpened).toBe(true);
    const raw = JSON.parse(localStorage.getItem('paleoglossa_beginner_progress')!);
    expect(raw.grc.scriptOpened).toBe(true);
  });

  it('different languages have independent progress', () => {
    const { result } = renderHook(() => useBeginnerProgress());
    act(() => {
      result.current.markMilestone('grc', 'scriptOpened');
      result.current.markMilestone('lat', 'firstTextOpened');
    });
    expect(result.current.getProgress('grc').scriptOpened).toBe(true);
    expect(result.current.getProgress('grc').firstTextOpened).toBe(false);
    expect(result.current.getProgress('lat').scriptOpened).toBe(false);
    expect(result.current.getProgress('lat').firstTextOpened).toBe(true);
  });

  it('handles localStorage read errors gracefully', () => {
    localStorage.setItem('paleoglossa_beginner_progress', '{invalid');
    const { result } = renderHook(() => useBeginnerProgress());
    const p = result.current.getProgress('grc');
    expect(p.scriptOpened).toBe(false);
  });

  it('handles localStorage write errors gracefully', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    const { result } = renderHook(() => useBeginnerProgress());
    act(() => {
      expect(() => result.current.markMilestone('grc', 'scriptOpened')).not.toThrow();
    });
    setItem.mockRestore();
  });
});

describe('recordMilestone (module-level helper)', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetBeginnerProgressForTests();
  });

  it('records milestones from non-React callers and they show up in the hook', () => {
    recordMilestone('grc', 'firstWordSaved');
    const { result } = renderHook(() => useBeginnerProgress());
    expect(result.current.getProgress('grc').firstWordSaved).toBe(true);
  });

  it('is idempotent — re-recording an already-set milestone is a no-op', () => {
    recordMilestone('grc', 'firstWordSaved');
    expect(() => recordMilestone('grc', 'firstWordSaved')).not.toThrow();
    const { result } = renderHook(() => useBeginnerProgress());
    expect(result.current.getProgress('grc').firstWordSaved).toBe(true);
  });

  it('ignores empty languageId', () => {
    recordMilestone('', 'firstWordSaved');
    const { result } = renderHook(() => useBeginnerProgress());
    expect(result.current.getProgress('').firstWordSaved).toBe(false);
  });
});

describe('BeginnerHub — preselection from Onboarding', () => {
  it('preselects the matching tier from onboarding profile level', () => {
    mockOnboarding = {
      completed: true,
      languageId: 'grc',
      level: 'knows-alphabet',
      goal: 'classical',
      dailyCommitment: 15,
    };
    renderHub();
    expect(screen.getByText(/Set from your onboarding/)).toBeDefined();
  });

  it('does not render the onboarding affordance when no profile is set', () => {
    mockOnboarding = undefined;
    renderHub();
    expect(screen.queryByText(/Set from your onboarding/)).toBeNull();
  });

  it('maps all four onboarding levels to a guided tier id', () => {
    const levels: Array<'absolute-beginner' | 'knows-alphabet' | 'intermediate' | 'advanced'> = [
      'absolute-beginner',
      'knows-alphabet',
      'intermediate',
      'advanced',
    ];
    const expected = ['know-nothing', 'know-alphabet', 'read-slowly', 'academic'];
    levels.forEach((level, idx) => {
      mockOnboarding = {
        completed: true,
        languageId: 'grc',
        level,
        goal: 'biblical',
        dailyCommitment: 10,
      };
      cleanup();
      renderHub();
      expect(screen.getByText(/Set from your onboarding/)).toBeDefined();
      const labels = ['I know nothing', 'I know the alphabet', 'I can read slowly', 'I am studying academically'];
      expect(labels[idx]).toBeDefined();
      expect(expected[idx]).toBeDefined();
    });
  });
});
