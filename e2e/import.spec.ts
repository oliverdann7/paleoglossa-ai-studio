import { test, expect, type Page } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

const IMPORTS_KEY = 'paleoglossa_imports';
const KNOWLEDGE_KEY = 'paleoglossa_knowledge';

const storedImports = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), IMPORTS_KEY);

/** Seed imports once; a reload must not wipe what the test has changed since. */
async function seedImports(page: Page, imports: object[]) {
  await page.addInitScript(
    ({ key, value }) => {
      if (!sessionStorage.getItem('seeded-imports')) {
        localStorage.setItem(key, JSON.stringify(value));
        sessionStorage.setItem('seeded-imports', '1');
      }
    },
    { key: IMPORTS_KEY, value: imports }
  );
}

const word = (text: string, lemma: string, confidence: number) => ({
  text,
  lemma,
  normalized: text.toLowerCase(),
  type: 'word',
  gloss: 'gloss',
  pos: 'noun',
  confidence,
});
const space = { text: ' ', lemma: ' ', normalized: ' ', type: 'whitespace' };

const baseImport = {
  userId: 'anonymous',
  languageId: 'lat',
  sourceType: 'paste',
  visibility: 'private',
  stats: { totalWords: 4, uniqueWords: 3, knownWords: 0, newWords: 3, learningWords: 0 },
};

test.beforeEach(async ({ page }) => {
  await enableDemoMode(page);
  await page.addInitScript(() => {
    localStorage.setItem('tutorialCompleted', 'true');
    localStorage.setItem('paleoglossa_cookie_consent', 'declined');
  });
});

test('a pasted text is saved, says honestly how far it got, and opens in the reader', async ({
  page,
}) => {
  await page.goto('/app/import');
  await page
    .locator('textarea')
    .first()
    .fill('Gallia est omnis divisa in partes tres. Quarum unam incolunt Belgae.');
  await page.getByRole('button', { name: /Analyze & Import/i }).click();

  const result = page.getByTestId('import-result');
  await expect(result).toBeVisible({ timeout: 60_000 });
  // Whatever the analysis managed, the screen must agree with the stored record.
  const [stored] = await storedImports(page);
  const analyzed = stored.analysisStatus === 'analyzed';
  await expect(result).toHaveAttribute('data-phase', analyzed ? 'analyzed' : 'unanalyzed');
  if (!analyzed) {
    await expect(result).toContainText('Saved, but not analyzed');
    await expect(page.getByTestId('import-result-retry')).toBeVisible();
  }

  await page.getByRole('button', { name: /Open in Reader/i }).click();
  await expect(page).toHaveURL(new RegExp(`/app/reader/${stored.id}`));
  // Eleven words; the spaces between them are not words.
  await expect(page.getByTestId('word-token')).toHaveCount(11, { timeout: 15_000 });
});

test('uncertain words are marked, and correcting a lemma applies to the whole text and is kept', async ({
  page,
}) => {
  await seedImports(page, [
    {
      ...baseImport,
      id: 'imp_1700000000001',
      title: 'Partes',
      rawContent: 'partes tres. partes unam.',
      status: 'complete',
      analysisStatus: 'analyzed',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      sentences: [
        { tokens: [word('partes', 'partes', 0.4), space, word('tres.', 'tres', 0.95)] },
        { tokens: [word('partes', 'partes', 0.4), space, word('unam.', 'unus', 0.9)] },
      ],
    },
  ]);
  // The learner was already learning this word under the lemma the analysis gave it.
  await page.addInitScript((key) => {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(
      key,
      JSON.stringify({
        'lat:partes': {
          state: 'LEARNING',
          lemma: 'partes',
          languageId: 'lat',
          addedAt: '2026-11-01T00:00:00.000Z',
        },
      })
    );
  }, KNOWLEDGE_KEY);
  await page.goto('/app/reader/imp_1700000000001');

  const tokens = page.getByTestId('word-token');
  await expect(tokens).toHaveCount(4, { timeout: 15_000 });
  await expect(page.locator('[data-testid="word-token"][data-uncertain]')).toHaveCount(2);

  await tokens.first().click();
  await expect(page.getByTestId('lemma-uncertain')).toBeVisible();
  await page.getByTestId('lemma-correction-open').click();
  await page.getByTestId('lemma-correction-input').fill('pars');
  await page.getByTestId('lemma-correction-input').press('Enter');

  // Both occurrences are corrected, in the text and in storage.
  await expect(page.locator('[data-testid="word-token"][data-uncertain]')).toHaveCount(0);
  await expect(page.getByTestId('lemma-corrected')).toBeVisible();
  const [stored] = await storedImports(page);
  const lemmas = stored.sentences.map((s: any) => [s.tokens[0].lemma, s.tokens[0].corrected]);
  expect(lemmas).toEqual([
    ['pars', true],
    ['pars', true],
  ]);
  expect(stored.sentences[0].tokens[2].lemma).toBe('tres');
  // What they knew of the word is now kept under the corrected lemma.
  const knowledge = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
    KNOWLEDGE_KEY
  );
  expect(knowledge['lat:pars']?.state).toBe('LEARNING');

  // The correction survives a reload.
  await page.reload();
  await expect(page.getByTestId('word-token')).toHaveCount(4, { timeout: 15_000 });
  await expect(page.locator('[data-testid="word-token"][data-uncertain]')).toHaveCount(0);
  await page.getByTestId('word-token').first().click();
  await expect(page.getByTestId('lemma-corrected')).toBeVisible();
});

test('an import whose analysis never finished can be retried from the history', async ({
  page,
}) => {
  await seedImports(page, [
    {
      ...baseImport,
      id: 'imp_1700000000002',
      title: 'Interrupted',
      rawContent: 'Gallia est omnis divisa in partes tres.',
      status: 'processing',
      analysisStatus: 'needs_ai',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      sentences: [],
    },
  ]);
  await page.goto('/app/import');
  await page.getByTestId('import-history-toggle').click();

  const row = page.getByTestId('import-history-row');
  await expect(row).toHaveAttribute('data-phase', 'stalled');
  await expect(row).toContainText('Analysis did not finish');
  await expect(row.getByTestId('import-open')).toHaveCount(0);

  await row.getByTestId('import-retry').click();
  // With or without the AI service, the text ends up readable.
  await expect(row).toHaveAttribute('data-phase', /^(analyzed|unanalyzed)$/, { timeout: 60_000 });
  const [stored] = await storedImports(page);
  expect(stored.status).not.toBe('processing');
  expect(stored.sentences.length).toBeGreaterThan(0);

  await row.getByTestId('import-open').click();
  await expect(page).toHaveURL(/\/app\/reader\/imp_1700000000002/);
  await expect(page.getByTestId('word-token')).toHaveCount(7, { timeout: 15_000 });
});
