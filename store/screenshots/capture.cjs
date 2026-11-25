/**
 * Captures the store screenshots from the running app.
 *
 *   npm run dev                      # in another terminal (http://localhost:3000)
 *   node store/screenshots/capture.cjs
 *
 * Every image is the real app UI, driven through its own controls in guest
 * ("Try Demo") mode: a text is opened from the curated library, words are
 * marked with the reader's own buttons, and the review card is the one the app
 * then schedules. Nothing is mocked or drawn.
 *
 * Two things are deliberately kept out of frame, because a signed-in user of
 * the store build never sees them: the guest "Demo mode" banner is hidden, and
 * the web cookie notice is answered before the first screen. First-run coach
 * marks are dismissed with their own close buttons.
 *
 * The app is rendered by headless Chromium at each device's logical size and
 * pixel ratio, not on a device, so there is no status bar and WebKit-specific
 * rendering is not shown. Screens that need server keys or an account (AI
 * tutor, AI explanations, text-to-speech) are not captured here — take those
 * on a device from a signed-in production build if you want them.
 */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TEXT_ID = 'grc-homer-iliad-full';
const OUT = process.env.OUT_DIR || __dirname; // OUT_DIR: write somewhere else for a trial run

// name → logical viewport × device pixel ratio = the exact store pixel size.
const DEVICES = [
  { dir: 'ios-6.7', width: 430, height: 932, scale: 3 }, // 1290 × 2796
  { dir: 'ios-6.5', width: 414, height: 896, scale: 3 }, // 1242 × 2688
  { dir: 'ipad-13', width: 1032, height: 1376, scale: 2 }, // 2064 × 2752
  { dir: 'ipad-12.9', width: 1024, height: 1366, scale: 2 }, // 2048 × 2732
  { dir: 'android', width: 360, height: 800, scale: 3 }, // 1080 × 2400
];

const HIDE_GUEST_BANNER = '[data-testid="demo-mode-banner"] { display: none !important; }';

async function settle(page, ms = 1200) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(ms);
}

/** Close any first-run coach mark using its own close button. */
async function dismissCoachMarks(page) {
  for (let i = 0; i < 4; i += 1) {
    const close = page.locator('[data-testid="tutorial-close"]:visible').first();
    if (!(await close.count())) return;
    await close.click();
    await page.waitForTimeout(300);
  }
}

async function open(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  await dismissCoachMarks(page);
}

async function closeDrawer(page) {
  const drawer = page.locator('[data-testid="lex-drawer"]');
  if (await drawer.count()) {
    await page.getByRole('button', { name: 'Close word analysis' }).first().click();
    await drawer.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  }
}

async function captureDevice(browser, device) {
  const dir = path.join(OUT, device.dir);
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.scale,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
  });
  // The web cookie notice is not part of the native apps.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('paleoglossa_cookie_consent', 'declined');
    } catch {
      /* ignore */
    }
  });
  const page = await context.newPage();
  const shot = async (name) => {
    await page.addStyleTag({ content: HIDE_GUEST_BANNER });
    await page.waitForTimeout(250);
    // JPEG keeps the 30 full-resolution images small enough to live in git;
    // both stores accept it.
    await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 92 });
    console.log(`${device.dir}/${name}.jpg  ${device.width * device.scale}×${device.height * device.scale}`);
  };

  // Enter the app the way a guest does.
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  await page.getByRole('button', { name: /demo/i }).first().click();
  await page.waitForURL(/\/app\//, { timeout: 30000 });
  await settle(page);

  // 04 — Library
  await open(page, '/app/library');
  await shot('04-library');

  // 01 — Reader
  await open(page, `/app/reader/${TEXT_ID}`);
  const tokens = page.locator('[data-testid="word-token"]');
  await tokens.first().waitFor({ timeout: 30000 });
  await dismissCoachMarks(page);
  await shot('01-reader');

  // Save the meaning of the opening words and mark them Learning with the
  // reader's own buttons, so the review queue below is the app's real schedule.
  for (const index of [5, 6, 8, 13, 4]) {
    await tokens.nth(index).click();
    await page.locator('[data-testid="lex-drawer"]').waitFor({ timeout: 10000 });
    // A review card needs a meaning: keep the dictionary's, as a learner would.
    await page.locator('[data-testid="save-as-translation"]').first().click({ timeout: 10000 });
    await page.waitForTimeout(400);
    await page.locator('[data-testid="state-button-LEARNING"]').first().click();
    await page.waitForTimeout(700);
    await closeDrawer(page); // marking may already have closed it
  }

  // 02 — Word analysis (Μῆνιν, the first word of the Iliad)
  await tokens.nth(4).click();
  const drawer = page.locator('[data-testid="lex-drawer"]');
  await drawer.waitFor({ timeout: 10000 });
  await settle(page, 1500);
  await shot('02-word');
  await closeDrawer(page);
  await settle(page, 1500); // let the vocabulary write land

  // 03 — Review
  await open(page, '/app/review');
  const start = page.locator('[data-testid="review-start"]').first();
  if (await start.count()) {
    await start.click();
    await settle(page, 1200);
    await dismissCoachMarks(page);
    // Turn the card over so the answer and the rating buttons are in frame.
    const reveal = page.getByRole('button', { name: /show answer/i }).first();
    if (await reveal.count()) {
      await reveal.click();
      await settle(page, 800);
    }
  }
  await shot('03-review');

  // 05 — Pronunciation Lab
  await open(page, '/app/audio-lab');
  await shot('05-audio');

  // 06 — Language overview
  await open(page, '/app/language/grc');
  await shot('06-language');

  await context.close();
}

(async () => {
  const only = process.argv[2];
  // CHROMIUM_PATH lets you point at a system browser when the project's
  // Playwright has not downloaded its own (`npx playwright install chromium`).
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );
  try {
    for (const device of DEVICES) {
      if (only && device.dir !== only) continue;
      await captureDevice(browser, device);
    }
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
