import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

/**
 * Smoke journey: Library → Reader → mark word as Seen
 *
 * Uses demo mode (localStorage flag) to bypass Firebase auth.
 * All corpus texts are served from static data, so no live backend required
 * beyond the Express dev server.
 */
test('library → reader → mark word', async ({ page }) => {
  // Enable demo mode before any navigation so AuthGuard lets us through
  await enableDemoMode(page);

  // ── Step 1: Library loads ────────────────────────────────────────────────
  await page.goto('/app/library');

  // The "Curated Library" tab is active by default; wait for a clickable text card
  const firstTextCard = page
    .locator('div.cursor-pointer')
    .filter({ hasText: /.+/ })
    .first();

  await expect(firstTextCard).toBeVisible({ timeout: 10_000 });

  // ── Step 2: Navigate to Reader ───────────────────────────────────────────
  await firstTextCard.click();

  await expect(page).toHaveURL(/\/app\/reader\//, { timeout: 10_000 });

  // ── Step 3: Word tokens render ───────────────────────────────────────────
  // ReadingPane renders word tokens as <bdi> inside <span>s
  const firstWord = page.locator('bdi').first();
  await expect(firstWord).toBeVisible({ timeout: 10_000 });

  // ── Step 4: Click a word → LexDrawer opens ──────────────────────────────
  // Clicking the <bdi> propagates to the parent <span onClick>
  await firstWord.click();

  // The LexDrawer panel shows "Your Knowledge" when a word is selected
  const lexDrawer = page.getByTestId('lex-drawer');
  await expect(lexDrawer.getByText('Your Knowledge')).toBeVisible({ timeout: 10_000 });

  // ── Step 5: Mark word as Seen ────────────────────────────────────────────
  // State buttons render their label text
  const seenButton = page.getByTestId('state-button-SEEN');
  await expect(seenButton).toBeVisible({ timeout: 10_000 });
  await seenButton.click();

  // After marking, the button should become visually active (scale-105 class applied)
  await page.waitForSelector('[data-testid="state-button-SEEN"].scale-105', { timeout: 10_000 });
});

