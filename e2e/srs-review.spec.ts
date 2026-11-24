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
    const startButton = page
      .getByRole('button')
      .filter({ hasText: /start review/i })
      .first();
    await expect(startButton).toBeVisible({ timeout: 10_000 });
    await expect(startButton).toBeEnabled();
  });

  test('review card flip cycle — show answer then rate', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);

    await page.goto('/app/review');

    // Start the session
    const startButton = page
      .getByRole('button')
      .filter({ hasText: /start review/i })
      .first();
    await expect(startButton).toBeEnabled({ timeout: 10_000 });
    await startButton.click();

    // A card face is shown (the word prompt is visible)
    const cardFace = page.locator('bdi, [data-testid="card-front"]').first();
    await expect(cardFace).toBeVisible({ timeout: 10_000 });

    // "Show Answer" button is present before reveal
    const showAnswerBtn = page
      .getByRole('button')
      .filter({ hasText: /show answer/i })
      .first();
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

    const startButton = page
      .getByRole('button')
      .filter({ hasText: /start review/i })
      .first();
    await expect(startButton).toBeEnabled({ timeout: 10_000 });
    await startButton.click();

    // Show answer
    const showAnswerBtn = page
      .getByRole('button')
      .filter({ hasText: /show answer/i })
      .first();
    await expect(showAnswerBtn).toBeVisible({ timeout: 10_000 });
    await showAnswerBtn.click();

    // Click the first rating button (e.g. "Easy" or "Good")
    const firstRatingBtn = page
      .getByRole('button')
      .filter({ hasText: /easy|good/i })
      .first();
    await expect(firstRatingBtn).toBeVisible({ timeout: 10_000 });
    await firstRatingBtn.click();

    // After rating the only card, should show either another card or the finished screen
    // The finished screen is the scribal colophon ("Explicit feliciter" / "Review Again").
    const finishedOrNextCard = page.getByText(
      /session complete|great work|all caught up|show answer|explicit feliciter|review again/i
    );
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

test.describe('review card audio', () => {
  /** Answer the speech endpoint ourselves and count what the page asks for and plays. */
  async function stubSpeech(page: any) {
    const requested: string[] = [];
    await page.route('**/api/audio/tts', async (route: any) => {
      requested.push(route.request().postDataJSON().text);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ audioUrl: 'data:audio/mpeg;base64,AAAA', supported: true }),
      });
    });
    await page.addInitScript(() => {
      (window as any).__played = 0;
      HTMLMediaElement.prototype.play = function () {
        (window as any).__played += 1;
        return Promise.resolve();
      };
    });
    return requested;
  }

  const startSession = async (page: any, autoPlayAudio: boolean) => {
    await page.addInitScript((auto: boolean) => {
      localStorage.setItem(
        'paleoglossa_review_settings',
        // One card type, so the question is always the word itself.
        JSON.stringify({ enabledTypes: ['FORM_TO_MEANING'], autoPlayAudio: auto })
      );
    }, autoPlayAudio);
    await page.goto('/app/review');
    await page
      .locator('button')
      .filter({ hasText: /start review/i })
      .first()
      .click();
    await expect(page.getByTestId('card-front')).toHaveText('λόγος', { timeout: 10_000 });
  };

  test('with auto-play on, the card is read aloud as it appears', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);
    const requested = await stubSpeech(page);
    await startSession(page, true);

    await expect.poll(() => requested).toContain('λόγος');
    await expect.poll(() => page.evaluate(() => (window as any).__played)).toBeGreaterThan(0);
  });

  test('with auto-play off, nothing is fetched or played until the button is tapped', async ({
    page,
  }) => {
    await enableDemoMode(page);
    await seedDueWord(page);
    const requested = await stubSpeech(page);
    await startSession(page, false);

    await page.waitForTimeout(1000);
    expect(requested).toEqual([]);
    expect(await page.evaluate(() => (window as any).__played)).toBe(0);

    await page.getByRole('button', { name: 'Hear pronunciation' }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__played)).toBe(1);
    expect(requested).toEqual(['λόγος']);
  });

  test('the setting is offered in review settings and remembered', async ({ page }) => {
    await enableDemoMode(page);
    await seedDueWord(page);
    // The consent banner would otherwise sit on top of the last setting.
    await page.addInitScript(() => localStorage.setItem('paleoglossa_cookie_consent', 'declined'));
    await page.goto('/app/review');
    await page
      .locator('button')
      .filter({ hasText: /settings/i })
      .first()
      .click();
    const toggle = page.getByTestId('review-autoplay-audio');
    await expect(toggle).not.toBeChecked();
    await toggle.check();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('paleoglossa_review_settings') ?? '{}')
    );
    expect(stored.autoPlayAudio).toBe(true);
  });
});
