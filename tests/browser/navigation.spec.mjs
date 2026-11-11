import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('**/*', (route) => new URL(route.request().url()).origin === 'http://localhost:4173'
    ? route.continue()
    : route.fulfill({ contentType: 'application/json', body: '{}' }));
});

test('navigation exposes current module, shared files, and responsive menu controls', async ({ page, isMobile }) => {
  await page.goto('spawn-scanner/');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  const upload = nav.getByRole('button', { name: 'Upload shared files', exact: true });
  await expect(upload).toBeVisible();
  await upload.click();
  await expect(page.getByRole('dialog', { name: 'Shared Files' })).toBeVisible();
  await page.getByRole('button', { name: 'Close shared files' }).click();
  await expect(upload).toBeFocused();

  const toggle = nav.getByRole('button', { name: /navigation menu/ });
  if (isMobile) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: /Spawn Scanner/ }).filter({ visible: true })).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await nav.getByRole('link', { name: /Species & Loot/ }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/species-loot\/?$/);
  if (isMobile) {
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
  }
  await expect(nav.getByRole('link', { name: /Species & Loot/ }).filter({ visible: true })).toHaveAttribute('aria-current', 'page');
  if (isMobile) {
    await page.keyboard.press('Escape');
    await toggle.click();

    // A pointer outside the non-modal disclosure dismisses it.
    await page.locator('main').dispatchEvent('pointerdown');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test('tablet navigation resizes cleanly and recognizes the kitchen alias', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('pokesnack-maker/');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  const toggle = nav.getByRole('button', { name: /navigation menu/ });
  await toggle.click();
  await expect(nav.getByRole('link', { name: /Campfire Kitchen/ }).filter({ visible: true })).toHaveAttribute('aria-current', 'page');
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(nav.getByRole('link', { name: /Campfire Kitchen/ }).filter({ visible: true })).toHaveAttribute('aria-current', 'page');
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('button', { name: 'Upload shared files', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
