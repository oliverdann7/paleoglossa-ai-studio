import { test, expect, Page } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

type Stored = Record<
  string,
  { state?: string; lemma?: string; kind?: string; memberLemmas?: string[]; userGloss?: string }
>;
const readKnowledge = (page: Page): Promise<Stored> =>
  page.evaluate(() => JSON.parse(localStorage.getItem('paleoglossa_knowledge') ?? '{}'));

test.beforeEach(async ({ page }) => {
  await enableDemoMode(page);
  await page.addInitScript(() => {
    localStorage.setItem('tutorialCompleted', 'true');
    // The first-visit cookie banner sits where the phrase bar appears.
    localStorage.setItem('paleoglossa_cookie_consent', 'declined');
  });
  await page.goto('/app/reader/grc-koine-3-john-full');
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });
});

test('shift-click selects a run of words and saves it as one phrase', async ({ page }) => {
  const words = page.getByTestId('word-token');
  const first = (await words.nth(0).locator('bdi').first().innerText()).trim();
  const second = (await words.nth(1).locator('bdi').first().innerText()).trim();
  const third = (await words.nth(2).locator('bdi').first().innerText()).trim();

  await words.nth(0).click();
  await words.nth(2).click({ modifiers: ['Shift'] });

  const bar = page.getByTestId('phrase-bar');
  await expect(bar).toBeVisible();
  await expect(page.getByTestId('phrase-text')).toHaveText(`${first} ${second} ${third}`);
  await expect(page.locator('[data-phrase="selecting"]')).toHaveCount(3);

  await page.getByTestId('phrase-meaning').fill('the elder to Gaius');
  await page.getByTestId('phrase-save').click();
  await expect(bar).toBeHidden();

  await expect
    .poll(
      async () => Object.values(await readKnowledge(page)).filter((e) => e.kind === 'phrase').length
    )
    .toBe(1);
  const saved = Object.values(await readKnowledge(page)).find((e) => e.kind === 'phrase')!;
  expect(saved.lemma).toBe(`${first} ${second} ${third}`);
  expect(saved.state).toBe('LEARNING');
  expect(saved.memberLemmas).toHaveLength(3);
  expect(saved.userGloss).toBe('the elder to Gaius');

  // The saved phrase is marked in the text, and still is after a reload.
  await expect(page.locator('[data-phrase="saved"]')).toHaveCount(3);
  await page.reload();
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-phrase="saved"]')).toHaveCount(3);
});

test('the word menu starts a phrase without a keyboard, and Escape cancels', async ({ page }) => {
  const words = page.getByTestId('word-token');
  await words.nth(1).click({ button: 'right' });
  await page.getByTestId('start-phrase').click();

  const bar = page.getByTestId('phrase-bar');
  await expect(bar).toContainText('choose the last word');

  await words.nth(3).click();
  await expect(page.getByTestId('phrase-text')).toBeVisible();
  await expect(page.locator('[data-phrase="selecting"]')).toHaveCount(3);

  await page.keyboard.press('Escape');
  await expect(bar).toBeHidden();
  await expect(page.locator('[data-phrase="selecting"]')).toHaveCount(0);
  expect(Object.values(await readKnowledge(page)).some((e) => e.kind === 'phrase')).toBe(false);
});

test('a plain click still opens the word drawer', async ({ page }) => {
  await page.getByTestId('word-token').nth(1).click();
  await expect(page.getByTestId('lex-drawer')).toBeVisible();
  await expect(page.getByTestId('phrase-bar')).toHaveCount(0);
});
