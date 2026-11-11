import { test, expect } from '@playwright/test';

const storageKey = 'cobbletoolkit-theme';
const themes = {
  retro: { background: 'rgb(16, 28, 27)', text: 'rgb(237, 245, 233)' },
  pokedex: { background: 'rgb(8, 27, 48)', text: 'rgb(237, 248, 255)' },
  rotom: { background: 'rgb(8, 29, 36)', text: 'rgb(236, 252, 255)' },
  dark: { background: 'rgb(16, 17, 19)', text: 'rgb(244, 244, 245)' },
  light: { background: 'rgb(243, 244, 246)', text: 'rgb(23, 34, 51)' },
};

// Keep optional external services out of these local UI checks.
test.beforeEach(async ({ context }) => {
  await context.route('**/*', (route) => new URL(route.request().url()).origin === 'http://localhost:4173'
    ? route.continue()
    : route.fulfill({ contentType: 'application/json', body: '{}' }));
});

async function expectTheme(page, theme) {
  await expect(page.getByRole('combobox', { name: 'Page theme', exact: true })).toHaveValue(theme);
  // Poll through hydration: the default dataset may be absent before mount.
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
  await expect(page.locator('body')).toHaveCSS('background-color', themes[theme].background);
  await expect(page.locator('body')).toHaveCSS('color', themes[theme].text);
}

async function tokenColors(locator, tokens) {
  return locator.evaluate((element, names) => {
    const probe = document.createElement('span');
    element.append(probe);
    try {
      return names.map((name) => {
        probe.style.color = `var(${name})`;
        return getComputedStyle(probe).color;
      });
    } finally {
      probe.remove();
    }
  }, tokens);
}

function contrastRatio(foreground, background) {
  const luminance = (color) => {
    const channels = color.match(/^rgb\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*\)$/);
    expect(channels, `Expected an opaque RGB color: ${color}`).not.toBeNull();
    const linear = channels.slice(1).map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

async function expectStoredTheme(page, theme) {
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(theme);
}

async function expectNoOverflow(page) {
  await expect.poll(() => page.evaluate(() => Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
  ) - window.innerWidth)).toBeLessThanOrEqual(1);
}

test('native theme select exposes all themes and defaults to retro', async ({ page }) => {
  await page.goto('./');
  const picker = page.getByRole('combobox', { name: 'Page theme', exact: true });
  await expect(picker).toBeVisible();
  expect(await picker.evaluate((element) => element.tagName)).toBe('SELECT');
  await expect(picker.locator('option')).toHaveCount(Object.keys(themes).length);
  expect(await picker.locator('option').evaluateAll((options) => options.map((option) => option.value)))
    .toEqual(Object.keys(themes));
  await expectTheme(page, 'retro');
  await expectNoOverflow(page);
});

for (const theme of Object.keys(themes)) {
  test(`${theme} applies real colors, persists reload and navigation, and fits both pages`, async ({ page }) => {
    await page.goto('./');
    await expectTheme(page, 'retro');
    await page.getByRole('combobox', { name: 'Page theme', exact: true }).selectOption(theme);
    await expectTheme(page, theme);
    await expectStoredTheme(page, theme);
    await expectNoOverflow(page);

    await page.reload();
    await expectTheme(page, theme);
    await expectStoredTheme(page, theme);
    await expectNoOverflow(page);

    const cta = page.locator('main').getByRole('link', { name: 'Open Spawn Scanner', exact: true });
    const [accentInk] = await tokenColors(cta, ['--color-accent-ink']);
    await expect(cta).toHaveCSS('color', accentInk);
    await cta.click();
    await expect(page).toHaveURL(/spawn-scanner\/?$/);
    await expectTheme(page, theme);

    const heading = page.locator('main h1');
    const description = page.locator('main header p').filter({
      hasText: 'Find spawns, compare weights, and check conditions in your datapack.',
    });

    const dataset = page.locator('dl[aria-label="Dataset overview"]');
    const summary = page.locator('main summary').filter({ hasText: 'About biome tags' });
    const [primary, secondary, screenStart, screenEnd] = await tokenColors(heading, [
      '--color-text-primary', '--color-text-secondary', '--screen-start', '--screen-end',
    ]);
    await expect(heading).toHaveCSS('color', primary);
    await expect(description).toHaveCSS('color', secondary);
    await expect(dataset).toHaveCSS('color', primary);
    await expect.poll(async () => [primary, secondary].includes(
      await summary.evaluate((element) => getComputedStyle(element).color),
    )).toBe(true);

    for (const [name, foreground] of [['heading', primary], ['description', secondary]]) {
      for (const [endpoint, background] of [['--screen-start', screenStart], ['--screen-end', screenEnd]]) {
        expect(contrastRatio(foreground, background), `${theme} ${name} contrast against ${endpoint}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }
    await expectStoredTheme(page, theme);
    await expectNoOverflow(page);

    await page.reload();
    await expectTheme(page, theme);
    await expectNoOverflow(page);
  });
}

test('invalid saved theme falls back to retro on mount and reload', async ({ page }) => {
  await page.goto('./');
  await expectTheme(page, 'retro');
  await page.evaluate((key) => localStorage.setItem(key, 'not-a-theme'), storageKey);
  await page.reload();
  await expectTheme(page, 'retro');
  await page.goto('spawn-scanner/');
  await expectTheme(page, 'retro');
});

test('storage events synchronize themes across pages and fall back for invalid or removed values', async ({ page, context }) => {
  await page.goto('./');
  await expectTheme(page, 'retro');
  const other = await context.newPage();
  await other.goto('spawn-scanner/');
  await expectTheme(other, 'retro');

  // Real same-origin tabs exercise browser-generated storage events.
  for (const theme of Object.keys(themes)) {
    await page.getByRole('combobox', { name: 'Page theme', exact: true }).selectOption(theme);
    await expectTheme(page, theme);
    await expectTheme(other, theme);
    await expectStoredTheme(other, theme);
  }

  await other.getByRole('combobox', { name: 'Page theme', exact: true }).selectOption('pokedex');
  await expectTheme(page, 'pokedex');
  await expectTheme(other, 'pokedex');

  await page.evaluate((key) => localStorage.setItem(key, 'not-a-theme'), storageKey);
  await expectTheme(other, 'retro');
  await page.evaluate((key) => localStorage.setItem(key, 'rotom'), storageKey);
  await expectTheme(other, 'rotom');
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await expectTheme(other, 'retro');

  await page.evaluate((key) => localStorage.setItem(key, 'dark'), storageKey);
  await expectTheme(other, 'dark');
  await page.evaluate(() => localStorage.clear());
  await expectTheme(other, 'retro');
  await expectNoOverflow(other);
});
