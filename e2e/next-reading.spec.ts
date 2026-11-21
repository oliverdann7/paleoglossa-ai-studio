import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

test.beforeEach(async ({ page }) => {
  await enableDemoMode(page);
  await page.addInitScript(() => localStorage.setItem('tutorialCompleted', 'true'));
});

test('finishing a text on a pathway offers the next step, and opens it', async ({ page }) => {
  // Psalm 23: six verses, on the Biblical Hebrew path between Ruth and Genesis.
  await page.goto('/app/reader/Heb-Ps23');
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });

  const card = page.getByTestId('next-reading');
  await expect(card).toBeVisible({ timeout: 10_000 });
  // The suggestion leads onward along the path, with the destination named.
  await expect(card).toContainText('Read Genesis');
  await expect(card).not.toContainText('100 Most Common');

  await page.getByTestId('next-reading-open').click();
  await expect(page).toHaveURL(/\/app\/reader\/hbo-genesis-full/);
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });
});

test('finishing a text off the pathway still offers something to read in that language', async ({
  page,
}) => {
  await page.goto('/app/reader/grc-koine-3-john-full');
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });

  const card = page.getByTestId('next-reading');
  await expect(card).toBeVisible({ timeout: 10_000 });
  await expect(card).toContainText('More by John');
  await page.getByTestId('next-reading-open').click();
  await expect(page).toHaveURL(/\/app\/reader\/grc-koine-/);
});

test('dashboard shows the pathway for the active language and lets the learner pick a goal', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('paleoglossa_active_language', 'lat'));
  await page.goto('/app');

  const card = page.getByTestId('pathway-card');
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card).toContainText('Classical Latin');

  await page.getByTestId('pathway-goal').selectOption({ label: 'Read Caesar' });
  await expect(card.getByRole('heading')).toHaveText('Read Caesar');
  await expect(card).toContainText('De Bello Gallico');

  // The choice is remembered.
  await page.reload();
  await expect(page.getByTestId('pathway-card').getByRole('heading')).toHaveText('Read Caesar');

  await page.getByTestId('pathway-continue').click();
  await expect(page).toHaveURL(/\/app\/reader\/lat-vocab/);
});
