import { readFileSync } from 'fs';
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

test('a learner with vocabulary is offered a text within reach, with their coverage of it', async ({
  page,
}) => {
  // Know the 1,500 commonest Koine lemmas of the served corpus.
  const profile = JSON.parse(
    readFileSync('public/corpus-data/lemma-profiles/grc-koine.json', 'utf-8')
  ) as { lemmas: string[]; texts: Record<string, { counts: number[] }> };
  const totals = new Array<number>(profile.lemmas.length).fill(0);
  for (const { counts } of Object.values(profile.texts)) {
    for (let i = 0; i + 1 < counts.length; i += 2) totals[counts[i]] += counts[i + 1];
  }
  const known = profile.lemmas
    .map((lemma, at) => ({ lemma, total: totals[at] }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 1500);
  await page.addInitScript(
    (lemmas: string[]) => {
      const map: Record<string, object> = {};
      for (const lemma of lemmas) {
        map[`grc-koine:${lemma}`] = {
          state: 'KNOWN',
          lemma,
          languageId: 'grc-koine',
          addedAt: '2026-01-01T00:00:00.000Z',
        };
      }
      localStorage.setItem('paleoglossa_knowledge', JSON.stringify(map));
    },
    known.map((k) => k.lemma)
  );

  await page.goto('/app/reader/grc-koine-3-john-full');
  await expect(page.getByTestId('word-token').first()).toBeVisible({ timeout: 15_000 });

  const coverage = page.getByTestId('next-reading-coverage');
  await expect(coverage).toBeVisible({ timeout: 15_000 });
  const percent = Number((await coverage.textContent())?.match(/(\d+)%/)?.[1]);
  expect(percent).toBeGreaterThanOrEqual(85);
  expect(percent).toBeLessThanOrEqual(98);
  await expect(page.getByTestId('next-reading')).toContainText('Within reach');
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
