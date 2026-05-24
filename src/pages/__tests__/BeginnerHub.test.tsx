import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react';
import { CorpusDB } from '../../data/corpus.js';
import { getAvailableLanguages } from '../../lib/constants/languages.js';
import { useBeginnerProgress } from '../../lib/hooks/useBeginnerProgress.js';
import { BeginnerHub } from '../BeginnerHub.js';

// ── Mocks ───────────────────────────────────────────────────────────────────

afterEach(() => {
  cleanup();
  localStorage.clear();
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
    expect(screen.getByText('Choose a language')).toBeDefined();
  });

  it('renders tier selector buttons', () => {
    renderHub();
    expect(screen.getByText('I know nothing')).toBeDefined();
    expect(screen.getByText('I know the alphabet')).toBeDefined();
    expect(screen.getByText('I can read slowly')).toBeDefined();
    expect(screen.getByText('I am studying academically')).toBeDefined();
  });

  it('renders language cards from CorpusDB', () => {
    renderHub();
    const languages = getAvailableLanguages();
    for (const lang of languages) {
      expect(screen.getByText(lang.name)).toBeDefined();
    }
  });

  it('shows Script badge only for languages with hasScriptLearning', () => {
    renderHub();
    const scriptLangs = getAvailableLanguages().filter((l) => l.hasScriptLearning);
    const noScriptLangs = getAvailableLanguages().filter((l) => !l.hasScriptLearning);
    for (const lang of scriptLangs) {
      expect(screen.getByText(lang.name).closest('button')?.parentElement?.textContent).toContain(
        'Script'
      );
    }
    for (const lang of noScriptLangs) {
      const content = screen.getByText(lang.name).closest('button')?.parentElement?.textContent;
      if (content) expect(content).not.toContain('Script');
    }
  });

  it('shows Morph badge only for languages with supportsMorphology', () => {
    renderHub();
    const morphLangs = getAvailableLanguages().filter((l) => l.supportsMorphology);
    const noMorphLangs = getAvailableLanguages().filter((l) => !l.supportsMorphology);
    for (const lang of morphLangs) {
      expect(screen.getByText(lang.name).closest('button')?.parentElement?.textContent).toContain(
        'Morph'
      );
    }
    for (const lang of noMorphLangs) {
      const content = screen.getByText(lang.name).closest('button')?.parentElement?.textContent;
      if (content) expect(content).not.toContain('Morph');
    }
  });

  it('shows Dict badge for languages with dictionary entries', () => {
    renderHub();
    const hasDict = getAvailableLanguages().filter(
      (l) => l.dictionaryHints && l.dictionaryHints.dictionaries.length > 0
    );
    const noDict = getAvailableLanguages().filter(
      (l) => !l.dictionaryHints || l.dictionaryHints.dictionaries.length === 0
    );
    for (const lang of hasDict) {
      expect(screen.getByText(lang.name).closest('button')?.parentElement?.textContent).toContain(
        'Dict'
      );
    }
    for (const lang of noDict) {
      const content = screen.getByText(lang.name).closest('button')?.parentElement?.textContent;
      if (content) expect(content).not.toContain('Dict');
    }
  });

  it('each language card has a recommended start link pointing to a valid text ID', () => {
    const allTexts = CorpusDB.getTexts();
    for (const lang of getAvailableLanguages()) {
      const recommended = lang.recommendedStartTextId;
      if (!recommended) continue;
      expect(allTexts.some((t) => t.id === recommended)).toBe(true);
    }
  });

  it('expanding a language card shows guided path steps', () => {
    renderHub();
    const firstLang = getAvailableLanguages()[0];
    const card = screen.getByText(firstLang.name).closest('button');
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(screen.getByText((c: string) => c.startsWith('Your path'))).toBeDefined();
    expect(screen.getByText('Learn the script')).toBeDefined();
    expect(screen.getByText('Start your first text')).toBeDefined();
  });

  it('changing tier switches the guided path steps', () => {
    renderHub();
    const firstLang = getAvailableLanguages()[0];
    const card = screen.getByText(firstLang.name).closest('button');
    fireEvent.click(card!);
    fireEvent.click(screen.getByText('I know the alphabet'));
    fireEvent.click(card!);
    expect(screen.getByText((c: string) => c.startsWith('Your path'))).toBeDefined();
    expect(screen.getByText('Start A1 reading')).toBeDefined();
  });
});

describe('BeginnerHub — ScriptLab links', () => {
  it('languages with hasScriptLearning show a ScriptLab link when expanded', () => {
    renderHub();
    const scriptLangs = getAvailableLanguages().filter((l) => l.hasScriptLearning);
    for (const lang of scriptLangs) {
      const card = screen.getByText(lang.name).closest('button');
      fireEvent.click(card!);
      const found = screen.queryByText((content) => content.includes('{{script}}'));
      expect(found).not.toBeNull();
      fireEvent.click(card!);
    }
  });
});

describe('useBeginnerProgress', () => {
  beforeEach(() => {
    localStorage.clear();
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
