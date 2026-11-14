import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

const tag = '#cobblemon:is_arid';
const longTag = `#example:${'long_biome_identifier_'.repeat(12)}`;

async function loadSpawns(page) {
  const zip = new JSZip();
  zip.file('data/example/spawn_pool_world/details.json', JSON.stringify({
    spawns: [{
      id: 'hidden-field-needle', pokemon: 'ditto', type: 'pokemon',
      bucket: 'common', level: '5-10', weight: 10,
      condition: { biomes: [tag, longTag] },
    }],
  }));
  await page.goto('spawn-scanner/');
  await expect(page.getByText('No datapack loaded yet', { exact: true })).toBeVisible();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'spawn-details.zip', mimeType: 'application/zip',
    buffer: await zip.generateAsync({ type: 'nodebuffer' }),
  });
  await expect(page.getByRole('table')).toContainText('Ditto');
}

function biomeTrigger(page, name = tag) {
  return page.getByRole('table').getByRole('button', { name, exact: true });
}

function details(page, name = tag) {
  return page.getByRole('dialog', { name, exact: true });
}

async function expectViewportBounds(page, panel) {
  await expect(panel).toBeVisible();
  await expect.poll(async () => {
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    return !!box && box.x >= 8 && box.y >= 8 &&
      box.x + box.width <= viewport.width - 8 + 1 &&
      box.y + box.height <= viewport.height - 8 + 1;
  }).toBe(true);
  await expect.poll(() => page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
  )).toBeLessThanOrEqual(1);
}

test('biome buttons open with Enter and Space; Escape and close restore the initiating focus', async ({ page }) => {
  await loadSpawns(page);
  const trigger = biomeTrigger(page);
  await expect(trigger).toHaveJSProperty('tagName', 'BUTTON');
  await trigger.focus();
  await trigger.press('Enter');
  const panel = details(page);
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toHaveAttribute('aria-controls', await panel.getAttribute('id'));
  await expect(panel).toContainText('#cobblemon:is_badlands');
  const close = panel.getByRole('button', { name: 'Close biome details', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await trigger.press('Space');
  await expect(panel).toBeVisible();
  await close.click();
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('pointer-opened long biome details stay bounded at 320px and after a short-window resize', async ({ page, hasTouch }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await loadSpawns(page);
  const trigger = biomeTrigger(page, longTag);
  await trigger.scrollIntoViewIfNeeded();
  if (hasTouch) await trigger.tap();
  else await trigger.click();
  const panel = details(page, longTag);
  await expectViewportBounds(page, panel);
  await expect(panel).toContainText('No entries found for this tag');
  await page.setViewportSize({ width: 320, height: 320 });
  await expectViewportBounds(page, panel);
  const close = panel.getByRole('button', { name: 'Close biome details', exact: true });
  await expect(close).toBeInViewport();
  await close.click();
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('clear search has a 44px target and restores rows without changing the column selection', async ({ page }) => {
  await loadSpawns(page);
  await page.getByLabel('Column view').selectOption('essentials');
  const search = page.getByRole('textbox', { name: 'Search spawn data' });
  await search.fill('no-such-spawn');
  await expect(page.getByText('No matching spawns', { exact: true })).toBeVisible();
  const clear = page.getByRole('button', { name: 'Clear search', exact: true });
  const box = await clear.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await clear.click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('table')).toContainText('Ditto');
  await expect(page.getByLabel('Column view')).toHaveValue('essentials');
});

test('initial narrow Essentials retains full-field search and explicit All fields through resizing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await loadSpawns(page);
  const view = page.getByLabel('Column view');
  await expect(view).toHaveValue('essentials');
  await expect(page.getByRole('columnheader', { name: 'Spawn ID', exact: true })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search spawn data' }).fill('hidden-field-needle');
  await expect(page.getByText('1 of 1 spawn entries', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Ditto');
  await view.selectOption('all');
  await expect(page.getByRole('columnheader', { name: 'Spawn ID', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(view).toHaveValue('all');
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(view).toHaveValue('all');
});

test('dismissal falls back to search after the biome trigger is filtered out', async ({ page }) => {
  await loadSpawns(page);
  await biomeTrigger(page).click();
  const search = page.getByRole('textbox', { name: 'Search spawn data' });
  await search.fill('no-such-spawn');
  await expect(page.getByText('No matching spawns', { exact: true })).toBeVisible();
  await details(page).getByRole('button', { name: 'Close biome details', exact: true }).click();
  await expect(search).toBeFocused();
});

test('initial wide All fields and explicit Essentials are not overwritten on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadSpawns(page);
  const view = page.getByLabel('Column view');
  await expect(view).toHaveValue('all');
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(view).toHaveValue('all');
  await view.selectOption('essentials');
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(view).toHaveValue('essentials');
});
