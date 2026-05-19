import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FirebaseDebug } from '../FirebaseDebug.js';
import { useAuth } from '../../../lib/hooks/useAuth.js';

vi.mock('../../../lib/firebase.js', () => ({
  auth: { currentUser: null, onAuthStateChanged: () => () => {} },
  db: {},
  handleFirestoreError: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => ({ exists: () => false })),
  deleteDoc: vi.fn(),
}));

vi.mock('../../../lib/hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../lib/services/apiBaseUrl.js', () => ({
  getApiUrl: (path: string) => path,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: {
      uid: 'test-uid-12345',
      email: 'admin@test.com',
      emailVerified: true,
      isAnonymous: false,
      providerData: [{ providerId: 'google.com' }],
      getIdToken: () => Promise.resolve('mock-token'),
    },
    loading: false,
    isDemoMode: false,
  } as any);
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/firebase-debug']}>
      <Routes>
        <Route path="/admin/firebase-debug" element={<FirebaseDebug />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('FirebaseDebug', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Firebase Debug')).toBeDefined();
  });

  it('shows environment section', () => {
    renderPage();
    expect(screen.getByText('Environment')).toBeDefined();
  });

  it('shows Firebase config section', () => {
    renderPage();
    expect(screen.getByText('Firebase Client Config')).toBeDefined();
  });

  it('shows current user section', () => {
    renderPage();
    expect(screen.getByText('Current User')).toBeDefined();
  });

  it('shows client test section', () => {
    renderPage();
    expect(screen.getByText('Client Firestore Test')).toBeDefined();
  });

  it('shows server test section', () => {
    renderPage();
    expect(screen.getByText('Server Admin SDK Test')).toBeDefined();
  });

  it('shows test buttons', () => {
    renderPage();
    expect(screen.getByText('Run client Firestore test')).toBeDefined();
    expect(screen.getByText('Run server Admin SDK test')).toBeDefined();
  });

  it('does not expose full API keys', () => {
    renderPage();
    const body = document.body.textContent || '';
    const apiKeyPattern = /AIza[0-9A-Za-z_-]{33,}/g;
    expect(body.match(apiKeyPattern)).toBeNull();
  });

  it('does not expose full app IDs', () => {
    renderPage();
    const body = document.body.textContent || '';
    const appIdPattern = /1:\d+:[a-z0-9]+:[a-z0-9]{32,}/g;
    expect(body.match(appIdPattern)).toBeNull();
  });

  it('shows full diagnostics button', () => {
    renderPage();
    expect(screen.getByText('Run full diagnostics')).toBeDefined();
  });

  it('displays user email', () => {
    renderPage();
    expect(screen.getByText('admin@test.com')).toBeDefined();
  });

  it('displays user UID', () => {
    renderPage();
    expect(screen.getByText('test-uid-12345')).toBeDefined();
  });

  it('shows API base URL info row', () => {
    renderPage();
    expect(screen.getByText(/API Base URL/)).toBeDefined();
  });

  it('shows mode info row', () => {
    renderPage();
    expect(screen.getByText(/Mode/)).toBeDefined();
  });

  it('renders without crashing when no user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      isDemoMode: false,
    } as any);
    render(
      <MemoryRouter>
        <FirebaseDebug />
      </MemoryRouter>
    );
    expect(screen.getByText('Firebase Debug')).toBeDefined();
  });
});
