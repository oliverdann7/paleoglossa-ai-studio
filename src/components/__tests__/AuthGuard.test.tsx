import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../AuthGuard';
import { AuthContext } from '../../lib/contexts/AuthContextInstance';

function renderWithAuth(authValue: any) {
  return render(
    <MemoryRouter initialEntries={['/app/library']}>
      <Routes>
        <Route
          path="/app/library"
          element={
            <AuthContext.Provider value={authValue}>
              <AuthGuard>
                <div>Protected Content</div>
              </AuthGuard>
            </AuthContext.Provider>
          }
        />
        <Route path="/auth/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while auth is loading', () => {
    const { container } = renderWithAuth({ user: null, loading: true, isDemoMode: false });
    expect(container.querySelector('.animate-spin')).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when user is authenticated', () => {
    renderWithAuth({
      user: { uid: '123', email: 'test@test.com' },
      loading: false,
      isDemoMode: false,
    });
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('renders children in demo mode without a user', () => {
    renderWithAuth({
      user: null,
      loading: false,
      isDemoMode: true,
    });
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('redirects to /auth/login when unauthenticated', () => {
    renderWithAuth({ user: null, loading: false, isDemoMode: false });
    expect(screen.getByText('Login Page')).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
