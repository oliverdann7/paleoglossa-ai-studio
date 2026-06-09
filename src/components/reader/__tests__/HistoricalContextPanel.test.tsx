import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import type { HistoricalContext } from '../../../lib/services/historicalContextService.js';

// i18n: return the fallback string so assertions read naturally (repo pattern).
// `t`/`i18n` are defined once so their identity is stable across renders — the
// real react-i18next memoizes them, and the panel's effect depends on `t`.
vi.mock('react-i18next', () => {
  const t = (_key: string, fallback?: string) => fallback || _key;
  const i18n = { language: 'en', changeLanguage: vi.fn() };
  return { useTranslation: () => ({ t, i18n }) };
});

const fetchHistoricalContext = vi.fn();
vi.mock('../../../lib/services/historicalContextService.js', () => ({
  fetchHistoricalContext: (...args: unknown[]) => fetchHistoricalContext(...args),
}));

import { HistoricalContextPanel } from '../HistoricalContextPanel';

const sample: HistoricalContext = {
  geography: 'Set along the Ionian coast.',
  period: 'Composed in the 8th century BC.',
  keyFigures: 'Achilles, Hector.',
  culturalBackground: 'Archaic Greek heroic society.',
  literaryContext: 'Foundational epic of the Western canon.',
};

const baseProps = {
  textId: 'iliad-1',
  title: 'Iliad, Book 1',
  languageId: 'grc',
  onClose: vi.fn(),
};

beforeEach(() => {
  fetchHistoricalContext.mockReset();
  baseProps.onClose = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe('HistoricalContextPanel accessibility & behavior', () => {
  it('renders as a labelled modal dialog', async () => {
    fetchHistoricalContext.mockResolvedValue(sample);
    render(<HistoricalContextPanel {...baseProps} />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // aria-labelledby must point to a real heading element.
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const heading = document.getElementById(labelId as string);
    expect(heading?.tagName).toBe('H2');
    expect(heading).toHaveTextContent('Historical Context');
  });

  it('closes on Escape', async () => {
    fetchHistoricalContext.mockResolvedValue(sample);
    render(<HistoricalContextPanel {...baseProps} />);
    await screen.findByRole('dialog');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a Retry control on error and refetches when pressed', async () => {
    fetchHistoricalContext.mockRejectedValueOnce(new Error('network'));
    render(<HistoricalContextPanel {...baseProps} />);

    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(fetchHistoricalContext).toHaveBeenCalledTimes(1);

    fetchHistoricalContext.mockResolvedValueOnce(sample);
    fireEvent.click(retry);

    await waitFor(() => expect(fetchHistoricalContext).toHaveBeenCalledTimes(2));
    // The default-open "period" section content should now be visible.
    expect(await screen.findByText('Composed in the 8th century BC.')).toBeInTheDocument();
  });

  it('applies dir="rtl" for right-to-left languages', async () => {
    fetchHistoricalContext.mockResolvedValue(sample);
    render(<HistoricalContextPanel {...baseProps} languageId="hbo" isRtl />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'rtl');
  });

  it('defaults to dir="ltr"', async () => {
    fetchHistoricalContext.mockResolvedValue(sample);
    render(<HistoricalContextPanel {...baseProps} />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'ltr');
  });
});
