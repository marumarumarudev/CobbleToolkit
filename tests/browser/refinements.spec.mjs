import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => new URL(route.request().url()).origin === 'http://localhost:4173'
    ? route.continue()
    : route.fulfill({ json: { results: [{ name: 'bulbasaur' }] } }));
});

test('skip link moves keyboard focus past persistent navigation', async ({ page }) => {
  await page.goto('spawn-scanner/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content', exact: true });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('mobile theme selection remains visible and narrow layouts retain all controls', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1280, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('spawn-scanner/');
    const picker = page.getByRole('combobox', { name: 'Page theme', exact: true });
    const textWidth = await picker.evaluate(el => {
      const style = getComputedStyle(el);
      return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    });
    expect(textWidth).toBeGreaterThanOrEqual(70);
    await picker.selectOption('light');
    await expect(picker).toHaveValue('light');
    await expect(page.getByRole('button', { name: 'Upload shared files', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('Space opens the archive picker without its scrolling default', async ({ page }) => {
  await page.goto('spawn-scanner/');
  const dropzone = page.getByRole('button').filter({ hasText: 'Drop your datapack here' });
  await expect(dropzone).toBeVisible();
  await dropzone.focus();
  const before = await page.evaluate(() => scrollY);
  const chooser = page.waitForEvent('filechooser');
  const prevented = await dropzone.evaluate(el => {
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  });
  await chooser;
  expect(prevented).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test('Kitchen clear search is a comfortable touch target', async ({ page }) => {
  await page.goto('campfire-kitchen/');
  const search = page.getByRole('combobox', { name: 'Species', exact: true });
  await expect(search).toBeEnabled();
  await search.fill('bulb');
  const clear = page.getByRole('button', { name: 'Clear species search' });
  const bounds = await clear.boundingBox();
  expect(bounds.width).toBeGreaterThanOrEqual(44);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await clear.click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
});

test('storage explanations share one balanced desktop row and stack on mobile', async ({ page }) => {
  await page.goto('./');
  const panel = page.locator('details.dex-support-panel');
  await panel.locator(':scope > summary').click();
  for (const width of [320, 768, 1280, 1567, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const headings = await Promise.all(['Your packs stay here', 'Repair only when needed', 'Saved is not backed up'].map(name =>
      panel.getByRole('heading', { name, exact: true }).boundingBox()));
    if (width >= 1024) {
      expect(Math.abs(headings[0].y - headings[1].y)).toBeLessThanOrEqual(1);
      expect(Math.abs(headings[1].y - headings[2].y)).toBeLessThanOrEqual(1);
      expect(headings[1].x).toBeGreaterThan(headings[0].x + headings[0].width);
      expect(headings[2].x).toBeGreaterThan(headings[1].x + headings[1].width);
    } else {
      expect(headings[1].y).toBeGreaterThan(headings[0].y);
      expect(headings[2].y).toBeGreaterThan(headings[1].y);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('expanded technical storage uses both desktop columns without stretching mobile text', async ({ page }, testInfo) => {
  await page.goto('./');
  const panel = page.locator('details.dex-support-panel');
  await panel.locator(':scope > summary').click();
  const technical = panel.locator('details');
  await technical.locator('summary').click();
  const paragraphs = technical.locator('p');
  await expect(paragraphs).toHaveCount(4);
  for (const width of [320, 768, 1280, 1567, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const first = await paragraphs.nth(0).boundingBox();
    const secondColumn = await paragraphs.nth(2).boundingBox();
    if (width >= 1024) {
      expect(Math.abs(first.y - secondColumn.y)).toBeLessThanOrEqual(1);
      expect(secondColumn.x).toBeGreaterThan(first.x + first.width);
      const panelBounds = await panel.boundingBox();
      expect(first.width).toBeGreaterThan(panelBounds.width * 0.4);
      expect(panelBounds.height).toBeLessThan(600);
    } else {
      expect(secondColumn.y).toBeGreaterThan(first.y + first.height);
      expect(Math.abs(first.x - secondColumn.x)).toBeLessThanOrEqual(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    if (width === 1280 || width === 320) {
      if (width === 1280) {
        await panel.evaluate(element => window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 160,
          behavior: 'instant',
        }));
      }
      await panel.screenshot({ path: testInfo.outputPath(`storage-panel-${width}.png`) });
    }
  }
});

test('homepage explains storage plainly while retaining technical detail', async ({ page }) => {
  await page.goto('./');
  await page.getByText('Your packs, privacy & storage', { exact: true }).click();
  await expect(page.getByText(/Saved packs can disappear if you clear site data/)).toBeVisible();
  await page.getByText('Technical storage details', { exact: true }).click();
  await expect(page.getByText(/IndexedDB \(v7\)/)).toBeVisible();
  await expect(page.getByText(/SHA-256/)).toBeVisible();
});
