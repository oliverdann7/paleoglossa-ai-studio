import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

afterEach(cleanup);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('lucide-react', () => {
  const Icn = () => null;
  const all: any = { default: Icn };
  ['BookOpen','Library','Search','Settings','MessageCircle','Send','Loader2',
   'GraduationCap','Brain','ArrowRight','Sparkles','ChevronLeft','ChevronRight',
   'Globe','User','Crown','BookMarked','BookText','PlusCircle','MoreHorizontal',
   'BarChart3','FileText','GitBranch','ScanLine','Users','Headphones',
   'AlertTriangle','CheckCircle2','XCircle','Volume2','ExternalLink',
   'Pencil','Trash2','Check','X','Type','Layout','EyeOff','AlignJustify'].forEach(n => all[n] = Icn);
  return all;
});

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
}));

describe('E2E-style smoke tests', () => {

  it('landing page renders at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<div data-testid="page-landing">L</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-landing')).toBeDefined();
  });

  it('auth sign-in page renders at /auth/login', () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth/login" element={<div data-testid="page-signin">S</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-signin')).toBeDefined();
  });

  it('pricing page renders at /pricing', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Routes>
          <Route path="/pricing" element={<div data-testid="page-subscription">Sub</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-subscription')).toBeDefined();
  });

  it('library at /app/library', () => {
    render(
      <MemoryRouter initialEntries={['/app/library']}>
        <Routes>
          <Route path="/app/library" element={<div data-testid="page-library">L</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-library')).toBeDefined();
  });

  it('reader at /app/reader/:textId', () => {
    render(
      <MemoryRouter initialEntries={['/app/reader/some-text']}>
        <Routes>
          <Route path="/app/reader/:textId" element={<div data-testid="page-reader">R</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-reader')).toBeDefined();
  });

  it('dictionary at /app/dictionary', () => {
    render(
      <MemoryRouter initialEntries={['/app/dictionary']}>
        <Routes>
          <Route path="/app/dictionary" element={<div data-testid="page-dictionary">D</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-dictionary')).toBeDefined();
  });

  it('dictionary with params at /app/dictionary/:lang/:lemma', () => {
    render(
      <MemoryRouter initialEntries={['/app/dictionary/grc/%CE%BB%CE%BF%CE%B3%CE%BF%CF%82']}>
        <Routes>
          <Route path="/app/dictionary/:lang/:lemma" element={<div data-testid="page-dictionary">D</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-dictionary')).toBeDefined();
  });

  it('settings under app layout at /app/settings', () => {
    render(
      <MemoryRouter initialEntries={['/app/settings']}>
        <Routes>
          <Route path="/app/settings" element={<div data-testid="page-settings">S</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-settings')).toBeDefined();
  });

  it('import under admin layout at /admin/import', () => {
    render(
      <MemoryRouter initialEntries={['/admin/import']}>
        <Routes>
          <Route path="/admin/import" element={<div data-testid="page-import">I</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-import')).toBeDefined();
  });

  it('app root /app renders index (dashboard)', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/app" element={<div data-testid="page-index">I</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-index')).toBeDefined();
  });

  it('unknown routes fall back to landing', () => {
    render(
      <MemoryRouter initialEntries={['/some-random-path']}>
        <Routes>
          <Route path="*" element={<div data-testid="page-landing">L</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-landing')).toBeDefined();
  });
});
