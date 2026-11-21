import { test, expect, Page } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

const KNOWLEDGE_KEY = 'paleoglossa_knowledge';

type StoredEntry = { state?: string; lemma?: string; languageId?: string };

async function readKnowledge(page: Page): Promise<Record<string, StoredEntry>> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, StoredEntry>,
    KNOWLEDGE_KEY
  );
}

test('reader saves words under a language-scoped identity that survives a reload', async ({
  page,
}) => {
  await enableDemoMode(page);
  // A word saved by an older build: keyed by the bare lemma, no language in the key.
  await page.addInitScript((key) => {
    if (localStorage.getItem(key)) return; // only seed the very first load
    localStorage.setItem(
      key,
      JSON.stringify({ amo: { state: 'KNOWN', languageId: 'lat', addedAt: '2026-01-01' } })
    );
  }, KNOWLEDGE_KEY);

  await page.goto('/app/library');
  const textCard = page.getByTestId('text-card').first();
  await expect(textCard).toBeVisible({ timeout: 10_000 });
  await textCard.click();
  await expect(page).toHaveURL(/\/app\/reader\//);

  const firstWord = page.getByTestId('word-token').first();
  await expect(firstWord).toBeVisible({ timeout: 10_000 });
  await firstWord.click();
  await expect(page.getByTestId('lex-drawer')).toBeVisible();
  // Saving closes the drawer so reading continues; reopening shows the state.
  await page.getByTestId('state-button-LEARNING').click();
  await firstWord.click();
  await page.waitForSelector('[data-testid="state-button-LEARNING"].scale-105', {
    timeout: 10_000,
  });

  // Every stored entry — the new word and the re-keyed legacy one — is keyed
  // by "<language>:<lemma>" and carries the lemma it should be displayed as.
  await expect
    .poll(async () => Object.values(await readKnowledge(page)).some((e) => e.state === 'LEARNING'))
    .toBe(true);
  const knowledge = await readKnowledge(page);
  // An un-lemmatized word must not be stored under an empty lemma, where it
  // would share one entry with every other un-lemmatized word.
  expect(Object.keys(knowledge)).toHaveLength(2);
  for (const [key, entry] of Object.entries(knowledge)) {
    expect(key.endsWith(':'), key).toBe(false);
    expect(entry.languageId, key).toBeTruthy();
    expect(key.startsWith(`${entry.languageId}:`), key).toBe(true);
    expect(entry.lemma, key).toBeTruthy();
  }
  expect(knowledge['lat:amo']).toMatchObject({ state: 'KNOWN', lemma: 'amo' });
  expect(knowledge['amo']).toBeUndefined();

  // The saved state is still attached to the same word after a reload.
  await page.reload();
  const reloadedWord = page.getByTestId('word-token').first();
  await expect(reloadedWord).toBeVisible({ timeout: 10_000 });
  await reloadedWord.click();
  await page.waitForSelector('[data-testid="state-button-LEARNING"].scale-105', {
    timeout: 10_000,
  });
  expect(Object.keys(await readKnowledge(page)).sort()).toEqual(Object.keys(knowledge).sort());
});
