import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

/**
 * SRS review session tests
 *
 * The review queue in demo mode reads from the 'paleoglossa_knowledge'
 * localStorage key. We seed a LEARNING-state word with nextReview in the
 * past so the queue is non-empty, then exercise the full card flip cycle.
 */

const KNOWLEDGE_KEY = 'paleoglossa_knowledge';

/** Seed one LEARNING word that is due for review right now. */
async function seedDueWord(page: any, languageId = 'grc') {
  await page.addInitScript(
    ({ key, langId }: { key: string; langId: string }) => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString();
      const map: Record<string, object> = {
        λόγος: {
          state: 'LEARNING',
          languageId: langId,
          userGloss: 'word, reason',
          srs: { nextReview: yesterday, interval: 1, ease: 2.5, step: 1 },
          contexts: ['ἐν ἀρχῇ ἦν ὁ λόγος'],
        },
      };
      localStorage.setItem(key, JSON.stringify(map));
    },
    { key: KNOWLEDGE_KEY, langId: languageId }
  );
}

test.describe('SRS review session', () => {
  test('review page loads and shows due count in demo mode', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);

    await page.goto('/app/review');

    // The page heading contains "review" or "flashcard"
    await expect(page.getByText(/review/i).first()).toBeVisible({ timeout: 10_000 });

    // Start button is enabled and shows the card count
    const startButton = page.getByRole('button').filter({ hasText: /start review/i }).first();
    await expect(startButton).toBeVisible({ timeout: 10_000 });
    await expect(startButton).toBeEnabled();
  });

  test('review card flip cycle — show answer then rate', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);

    await page.goto('/app/review');

    // Start the session
    const startButton = page.getByRole('button').filter({ hasText: /start review/i }).first();
    await expect(startButton).toBeEnabled({ timeout: 10_000 });
    await startButton.click();

    // A card face is shown (the word prompt is visible)
    const cardFace = page.locator('bdi, [data-testid="card-front"]').first();
    await expect(cardFace).toBeVisible({ timeout: 10_000 });

    // "Show Answer" button is present before reveal
    const showAnswerBtn = page.getByRole('button').filter({ hasText: /show answer/i }).first();
    await expect(showAnswerBtn).toBeVisible({ timeout: 10_000 });
    await showAnswerBtn.click();

    // After reveal, rating buttons appear (Easy / Good / Hard / Again or similar)
    const ratingButtons = page.getByRole('button').filter({ hasText: /easy|good|hard|again/i });
    await expect(ratingButtons.first()).toBeVisible({ timeout: 10_000 });
  });

  test('completing a review card advances to next or shows finished screen', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);

    await page.goto('/app/review');

    const startButton = page.getByRole('button').filter({ hasText: /start review/i }).first();
    await expect(startButton).toBeEnabled({ timeout: 10_000 });
    await startButton.click();

    // Show answer
    const showAnswerBtn = page.getByRole('button').filter({ hasText: /show answer/i }).first();
    await expect(showAnswerBtn).toBeVisible({ timeout: 10_000 });
    await showAnswerBtn.click();

    // Click the first rating button (e.g. "Easy" or "Good")
    const firstRatingBtn = page.getByRole('button').filter({ hasText: /easy|good/i }).first();
    await expect(firstRatingBtn).toBeVisible({ timeout: 10_000 });
    await firstRatingBtn.click();

    // After rating the only card, should show either another card or the finished screen
    const finishedOrNextCard = page.getByText(/session complete|great work|all caught up|show answer/i);
    await expect(finishedOrNextCard.first()).toBeVisible({ timeout: 10_000 });
  });

  test('empty queue shows "all caught up" without crashing', async ({ page }) => {
    await enableDemoMode(page);
    // No words seeded — queue is empty

    await page.goto('/app/review');

    const caughtUp = page.getByRole('button').filter({ hasText: /all caught up/i });
    await expect(caughtUp).toBeVisible({ timeout: 10_000 });
    await expect(caughtUp).toBeDisabled();
  });
});
