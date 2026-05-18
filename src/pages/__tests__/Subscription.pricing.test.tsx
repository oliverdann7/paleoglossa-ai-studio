import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RootProviders } from '../../lib/contexts/RootProviders';
import { Subscription } from '../Subscription';
import '../../lib/i18n';

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null, onAuthStateChanged: () => () => {} },
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: any, cb: any) => {
    cb(null);
    return () => {};
  },
  getAuth: () => ({ currentUser: null }),
  GoogleAuthProvider: class {},
}));

vi.mock('firebase/firestore', () => ({
  getDoc: () => Promise.resolve({ exists: () => false }),
  getDocs: () => Promise.resolve({ docs: [] }),
  doc: () => ({}),
  collection: () => ({}),
  setDoc: () => Promise.resolve(),
  serverTimestamp: () => new Date().toISOString(),
}));

describe('Subscription page under /pricing', () => {
  it('renders without throwing provider errors', async () => {
    render(
      <RootProviders>
        <MemoryRouter initialEntries={['/pricing']}>
          <Subscription />
        </MemoryRouter>
      </RootProviders>
    );

    expect(await screen.findByText(/Master classical languages/i)).toBeDefined();
  });
});
