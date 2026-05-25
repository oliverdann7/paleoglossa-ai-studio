import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

test('mobile reader word analysis flow', async ({ page }) => {
  await enableDemoMode(page);

  // Set mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });

  // Navigate to library
  await page.goto('/app/library');
  const textCard = page.getByTestId('text-card').first();
  await expect(textCard).toBeVisible({ timeout: 10_000 });
  await textCard.click();
  await expect(page).toHaveURL(/\/app\/reader\//);

  // Word tokens render
  const wordTokens = page.getByTestId('word-token');
  await expect(wordTokens.first()).toBeVisible({ timeout: 10_000 });

  // Tap a word — LexDrawer opens as bottom sheet
  await wordTokens.first().click();
  const lexDrawer = page.getByTestId('lex-drawer');
  await expect(lexDrawer).toBeVisible();

  // The drawer has drag handle indicator
  const dragHandle = lexDrawer.locator('.rounded-full.bg-ink3\\/30');
  await expect(dragHandle).toBeVisible();

  // Meaning section is visible
  await expect(lexDrawer.getByText(/meaning/i)).toBeVisible();

  // Morphology section heading is visible
  await expect(lexDrawer.getByText('Morphology', { exact: true })).toBeVisible();

  // Mark word as Seen — drawer closes
  const seenButton = page.getByTestId('state-button-SEEN');
  await expect(seenButton).toBeVisible();
  await seenButton.click();
  await page.waitForTimeout(500);

  // After marking, word analysis is dismissed
  await expect(lexDrawer).not.toBeVisible();
});
