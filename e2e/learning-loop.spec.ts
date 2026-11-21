import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

test('core learning loop', async ({ page }) => {
  await enableDemoMode(page);

  // 1. Library loads at least one curated text.
  await page.goto('/app/library');
  const textCard = page.getByTestId('text-card').first();
  await expect(textCard).toBeVisible({ timeout: 10_000 });

  // 2. User opens a text in Reader.
  await textCard.click();
  await expect(page).toHaveURL(/\/app\/reader\//);

  // 3. Word tokens render.
  const wordTokens = page.getByTestId('word-token');
  await expect(wordTokens.first()).toBeVisible({ timeout: 10_000 });

  // 4. Clicking a word opens Word Analysis (LexDrawer).
  await wordTokens.first().click();
  const lexDrawer = page.getByTestId('lex-drawer');
  await expect(lexDrawer).toBeVisible();

  // 5. Meaning/morphology/source-trust area is visible when available.
  await expect(lexDrawer.getByText(/meaning/i)).toBeVisible();

  // 6. User can save or update a gloss.
  const glossInput = page.getByTestId('gloss-input');
  await expect(glossInput).toBeVisible();
  await glossInput.click();
  await glossInput.fill('Test Gloss');
  await page.waitForTimeout(1000);
  await expect(glossInput).toHaveValue('Test Gloss');

  // 7. User can mark word state as Seen/Known/Learning.
  const learningButton = page.getByTestId('state-button-LEARNING');
  await learningButton.click();
  // A successful save closes the drawer; reopen the word to see the saved state
  // (and that the gloss was kept).
  await expect(learningButton).toBeHidden({ timeout: 10_000 });
  await wordTokens.first().click();
  await expect(glossInput).toHaveValue('Test Gloss');
  await page.waitForSelector('[data-testid="state-button-LEARNING"].scale-105', {
    timeout: 10_000,
  });

  // 8. Review page shows a meaningful empty state or due-review state without crashing.
  await page.goto('/app/review');
  //    Scope to <main>: the nav also says "Review", which made a bare text
  //    match ambiguous. The word just marked Learning is due immediately.
  const main = page.locator('main#main-content');
  await expect(
    main
      .getByRole('button')
      .filter({ hasText: /start review/i })
      .first()
  ).toBeVisible({ timeout: 10_000 });

  // 9. Statistics page loads and shows progress UI without crashing.
  await page.goto('/app/statistics');
  await expect(main.getByText('Progress Analytics')).toBeVisible({ timeout: 10_000 });
});
