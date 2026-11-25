// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k }),
}));
vi.mock('../../lib/platform.js', () => ({ isCapacitor: () => true }));
let signedIn = true;
vi.mock('../../lib/hooks/useAuth.js', () => ({
  useAuth: () => ({ user: signedIn ? { uid: 'u1' } : null }),
}));
const apiFetch = vi.fn();
vi.mock('../../lib/services/apiFetch.js', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

afterEach(cleanup);

import { AiConsentDialog } from '../AiConsentDialog.js';
import { ReportAiContentButton } from '../ReportAiContentButton.js';
import { ensureAiConsent, getAiConsent } from '../../lib/services/aiConsent.js';

describe('AiConsentDialog', () => {
  beforeEach(() => localStorage.clear());

  it('appears on the first AI request and records the answer', async () => {
    render(
      <MemoryRouter>
        <AiConsentDialog />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('ai-consent-dialog')).toBeNull();

    let settled: Promise<void>;
    act(() => {
      settled = ensureAiConsent();
    });
    expect(await screen.findByTestId('ai-consent-dialog')).toBeTruthy();
    expect(screen.getByText(/Google Gemini/)).toBeTruthy();

    fireEvent.click(screen.getByTestId('ai-consent-allow'));
    await settled!;
    expect(getAiConsent()).toBe('granted');
    expect(screen.queryByTestId('ai-consent-dialog')).toBeNull();
  });
});

describe('ReportAiContentButton', () => {
  beforeEach(() => apiFetch.mockReset());

  it('sends the answer, its prompt and the chosen reason', async () => {
    apiFetch.mockResolvedValue({ ok: true });
    render(
      <ReportAiContentButton surface="tutor" content="bad answer" prompt="my question" languageId="grc" />
    );
    fireEvent.click(screen.getByTestId('ai-report-button'));
    fireEvent.click(screen.getByText('Offensive or harmful'));

    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(apiFetch).toHaveBeenCalledWith('/api/reports/ai-content', {
      method: 'POST',
      skipAuth: false,
      body: {
        surface: 'tutor',
        reason: 'offensive',
        content: 'bad answer',
        prompt: 'my question',
        languageId: 'grc',
      },
    });
  });

  it('still sends for a guest, without requiring sign-in', async () => {
    signedIn = false;
    apiFetch.mockResolvedValue({ ok: true });
    render(<ReportAiContentButton surface="explanation" content="odd gloss" />);
    fireEvent.click(screen.getByTestId('ai-report-button'));
    fireEvent.click(screen.getByText('Wrong or misleading'));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(apiFetch.mock.calls[0][1]).toMatchObject({ skipAuth: true });
    signedIn = true;
  });
});
