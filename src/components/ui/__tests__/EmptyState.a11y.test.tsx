import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

/**
 * First accessibility coverage in the repo. EmptyState is rendered across many
 * empty surfaces (Library, Manuscripts, Notebooks…); these assert the basic
 * semantics a screen reader relies on — a real heading and an actionable,
 * accessibly-named control.
 */
describe('EmptyState accessibility', () => {
  it('exposes its heading as a real heading element with an accessible name', () => {
    render(<EmptyState heading="No manuscripts yet" description="Add one to begin." />);
    const heading = screen.getByRole('heading', { name: 'No manuscripts yet' });
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<EmptyState heading="Empty" description="Nothing here yet." />);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('keeps an action control reachable with an accessible name', () => {
    render(
      <EmptyState
        heading="Empty"
        action={<button type="button">Add your first manuscript</button>}
      />
    );
    const button = screen.getByRole('button', { name: 'Add your first manuscript' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});
