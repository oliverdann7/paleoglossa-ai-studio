import { test, expect } from '@playwright/test';
import { enableDemoMode } from './helpers/demoMode';

/**
 * Auth flow tests
 *
 * Covers:
 * 1. Protected routes redirect to /auth when not authenticated
 * 2. Auth page renders core sign-in UI elements
 * 3. Demo mode bypasses auth guard and loads the app
 */

test.describe('auth flows', () => {
  test('protected route redirects to /auth without session', async ({ page }) => {
    // Navigate directly to a protected page with no session
    await page.goto('/app/library');

    // Should redirect to /auth (or /) because AuthGuard blocks unauthenticated access
    await expect(page).toHaveURL(/\/(auth|$)/, { timeout: 10_000 });
  });

  test('auth page renders sign-in form', async ({ page }) => {
    await page.goto('/auth');

    // Email and password inputs are present
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });

    // At least one submit / sign-in button
    const submitButton = page
      .getByRole('button')
      .filter({ hasText: /sign in|log in|continue/i })
      .first();
    await expect(submitButton).toBeVisible({ timeout: 10_000 });
  });

  test('auth page has "continue as guest" option', async ({ page }) => {
    await page.goto('/auth');

    const guestButton = page
      .getByRole('button')
      .filter({ hasText: /guest|demo|try/i })
      .first();
    await expect(guestButton).toBeVisible({ timeout: 10_000 });
  });

  test('demo mode bypasses auth guard and loads library', async ({ page }) => {
    await enableDemoMode(page);

    await page.goto('/app/library');

    // Should stay on /app/library, not redirect
    await expect(page).toHaveURL(/\/app\/library/, { timeout: 10_000 });

    // Page content is rendered (not a blank auth redirect)
    await expect(page.getByText(/library|texts|ancient/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('demo mode allows navigation to all main sections', async ({ page }) => {
    await enableDemoMode(page);

    const routes = ['/app/library', '/app/review', '/app/grammar', '/app/statistics'];

    for (const route of routes) {
      await page.goto(route);
      // Should stay on the route (not redirect to /auth)
      await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/')), { timeout: 10_000 });
    }
  });
});
