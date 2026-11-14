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

test('tool switches animate only the title and active marker', async ({ page, isMobile }) => {
  await page.goto('spawn-scanner/');
  const surface = page.locator('.page-transition');
  const title = page.locator('[data-route-title]');
  await expect(title).toHaveCount(1);
  await expect(title).toHaveCSS('animation-name', 'tool-title-enter');
  await expect(title).toHaveCSS('animation-duration', '0.16s');
  await expect(title).toHaveCSS('transform', 'none');
  await expect(surface).toHaveCSS('animation-name', 'none');
  await expect(surface.locator('header.dex-console')).toHaveCSS('animation-name', 'none');
  const marker = page.locator('.tool-nav-link[aria-current="page"] .tool-nav-marker');
  await expect(marker).toHaveCount(1);
  await expect(marker).toHaveCSS('animation-name', isMobile ? 'none' : 'tool-select');

  // Finished animations may disappear from getAnimations() after a repaint.
  // Observe new playback rather than retaining those browser-owned objects.
  await title.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map(animation => animation.finished));
    element.dataset.replays = '0';
    element.addEventListener('animationstart', () => {
      element.dataset.replays = String(Number(element.dataset.replays) + 1);
    });
  });
  await page.getByRole('combobox', { name: 'Page theme', exact: true }).selectOption('light');
  await expect(title).toHaveAttribute('data-replays', '0');

  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  const switchTo = async (name) => {
    if (isMobile) await nav.getByRole('button', { name: /Open navigation menu/ }).click();
    await nav.getByRole('link', { name, exact: !isMobile }).filter({ visible: true }).click();
  };
  await switchTo(/Species & Loot/);
  await expect(page).toHaveURL(/species-loot\/?$/);
  await expect(title).toContainText('Species & Loot');
  await switchTo(/RCT Trainer Scanner/);
  await expect(title).toContainText('RCT Trainer Scanner');
  await page.goBack();
  await expect(title).toContainText('Species & Loot');
  await page.goForward();
  await expect(title).toContainText('RCT Trainer Scanner');
  if (isMobile) await expect(nav.getByRole('button', { name: /Open navigation menu/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(surface).toHaveCSS('opacity', '1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(title).toHaveCSS('animation-name', 'none');
  await expect(marker).toHaveCSS('animation-name', 'none');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect(page.getByRole('button', { name: 'Upload shared files', exact: true })).toHaveCSS('transition-property', /background-color/);
});

test('reduced motion before entry leaves the tool immediately readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('trainer-scanner/');
  await expect(page.locator('[data-route-title]')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.page-transition')).toHaveCSS('opacity', '1');
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
