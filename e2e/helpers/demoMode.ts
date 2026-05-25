import { Page } from '@playwright/test';

export async function enableDemoMode(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('paleoglossa_demo_mode', 'true');
  });
}
