import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

async function uploadPack(page, duplicateRewards = false) {
  const zip = new JSZip();
  for (let i = 0; i < 35; i++) {
    const id = String(i).padStart(2, '0');
    zip.file(`data/rctmod/trainers/mobile_${id}.json`, JSON.stringify({
      name: { literal: `Mobile Trainer ${id}` }, team: [{ species: 'bulbasaur', level: 12 }],
    }));
    zip.file(`data/example/species/mobilemon${id}.json`, JSON.stringify({
      name: `Mobilemon${id}`, primaryType: 'grass',
      drops: { entries: [{ item: 'minecraft:honey_bottle', quantityRange: '1-3', percentage: 0 }] },
    }));
  }
  zip.file('data/rctmod/loot_table/trainers/single/mobile_34.json', JSON.stringify({
    pools: [{ rolls: 2, entries: Array.from({ length: 180 }, (_, i) => ({
      type: 'minecraft:item', name: `example:very_long_reward_identifier_${i}`, weight: 1,
      conditions: [
        { condition: 'minecraft:random_chance', chance: 0.25 },
        { condition: 'rctmod:level_range', range: { min: 10, max: 80 } },
        { condition: 'rctmod:defeat_count', comparator: '>=', count: 3 },
      ],
    })) }],
  }));
  if (duplicateRewards) {
    zip.file('data/rctmod/loot_table/trainers/single/mobile_34.json', JSON.stringify({
      pools: [{ rolls: 2, entries: [
        { type: 'minecraft:item', name: 'example:other_reward', weight: 1 },
        ...Array.from({ length: 180 }, (_, i) => ({
          type: 'minecraft:item', name: 'example:shared_reward', weight: 1,
          conditions: [{ condition: 'rctmod:defeat_count', comparator: '>=', count: 100 + i }],
        })),
      ] }],
    }));
  }
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'mobile-details.zip', mimeType: 'application/zip',
    buffer: await zip.generateAsync({ type: 'nodebuffer' }),
  });
}

test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://localhost:4173') return route.continue();
    return route.abort();
  });
});

for (const kind of ['trainer', 'species']) {
  test(`${kind} explicit mobile detail and Back preserve query, selection, roster position and focus`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(kind === 'trainer' ? 'trainer-scanner/' : 'species-loot/');
    await uploadPack(page);
    const query = kind === 'trainer' ? 'Mobile Trainer' : 'mobilemon';
    const name = kind === 'trainer' ? 'Mobile Trainer 34' : 'Mobilemon34';
    const search = page.getByRole('textbox', { name: kind === 'trainer' ? 'Search trainer, species, or loot item' : 'Search species, type, or loot item' });
    await search.fill(query);
    const list = page.getByRole('region', { name: kind === 'trainer' ? 'Trainer results' : 'Species results' });
    const trigger = list.getByRole('button', { name: new RegExp(name, 'i') });
    await trigger.scrollIntoViewIfNeeded();
    const before = await list.evaluate(el => el.scrollTop);
    expect(before).toBeGreaterThan(0);
    await trigger.focus();
    await trigger.press('Enter');
    await expect(list).not.toBeVisible();
    await expect(page.getByRole('heading', { name, exact: true })).toBeFocused();
    const back = page.getByRole('button', { name: 'Back to results', exact: true });
    await expect(back).toBeVisible();
    await back.click();
    await expect(search).toHaveValue(query);
    await expect(trigger).toHaveAttribute('aria-pressed', 'true');
    await expect(trigger).toBeFocused();
    expect(await list.evaluate(el => el.scrollTop)).toBeCloseTo(before, 0);
    const clear = page.getByRole('button', { name: `Clear ${kind} search` });
    const box = await clear.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await clear.click();
    await expect(search).toHaveValue('');
    await expect(search).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('desktop preserves simultaneous roster and selected detail', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('trainer-scanner/');
  await uploadPack(page);
  const list = page.getByRole('region', { name: 'Trainer results' });
  await list.getByRole('button', { name: /Mobile Trainer 34/ }).click();
  await expect(list).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mobile Trainer 34', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to results', exact: true })).not.toBeVisible();
});

test('compact item drops expose full values, full table and return to the filtered item list', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('species-loot/');
  await uploadPack(page);
  await page.getByRole('radio', { name: 'Item drops', exact: true }).click();
  const browser = page.getByRole('region', { name: 'Item drop browser' });
  const search = browser.getByRole('searchbox', { name: 'Search item drops' });
  await search.fill('honey');
  await browser.getByRole('combobox', { name: 'Source pack' }).selectOption({ label: 'mobile-details.zip (report 1)' });
  await expect(browser.getByRole('status')).toContainText('35 of 35');
  await expect(browser.getByRole('table')).not.toBeVisible();
  const details = browser.getByRole('button', { name: /Drop details for/ }).first();
  await details.click();
  const full = browser.getByRole('region', { name: 'Selected drop details' });
  await expect(full).toContainText('1-3');
  await expect(full).toContainText('0%');
  await expect(full).toContainText('mobile-details.zip');
  await full.getByRole('button', { name: /Mobilemon/i }).click();
  await expect(page.getByRole('heading', { name: /Mobilemon/i })).toBeFocused();
  await page.getByRole('button', { name: 'Back to results', exact: true }).click();
  await expect(search).toHaveValue('honey');
  await expect(full.getByRole('button', { name: /Mobilemon/i })).toBeFocused();
  await browser.getByRole('button', { name: 'Full table', exact: true }).click();
  await expect(browser.getByRole('table')).toBeVisible();
  await expect(browser.getByRole('table')).toContainText('Quantity');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('large reward lists keep fixed virtual summaries and expose full details outside the scrolling rows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('trainer-scanner/');
  await uploadPack(page);
  await page.getByRole('region', { name: 'Trainer results' }).getByRole('button', { name: /Mobile Trainer 34/ }).click();
  await page.getByRole('radio', { name: /^Loot/ }).click();
  await page.getByRole('button', { name: 'Expand all', exact: true }).click();
  const list = page.getByRole('region', { name: 'Reward summaries' });
  await expect(list).toBeVisible();
  const summaries = list.getByRole('button', { name: /Reward details for/ });
  expect(await summaries.count()).toBeLessThan(180);
  await summaries.first().click();
  const detail = page.getByRole('region', { name: 'Selected reward details' });
  await expect(detail).toBeVisible();
  await expect(detail.getByRole('heading')).toBeFocused();
  await expect(detail).toContainText('example:very_long_reward_identifier_0');
  await expect(detail).toContainText('Rolls 2');
  await expect(detail).toContainText('Level 10–80');
  await expect(detail).toContainText('Defeat count >= 3');
  expect(await detail.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await list.evaluate(el => [...el.querySelectorAll('*')].filter(child => /auto|scroll/.test(getComputedStyle(child).overflowY)).length)).toBe(0);
  await detail.getByRole('button', { name: 'Back to reward list' }).click();
  await expect(summaries.first()).toBeFocused();
});

async function openReviewRewards(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('trainer-scanner/');
  await uploadPack(page, true);
  await page.getByRole('region', { name: 'Trainer results' }).getByRole('button', { name: /Mobile Trainer 34/ }).click();
  await page.getByRole('radio', { name: /^Loot/ }).click();
  await page.getByRole('button', { name: 'Expand all', exact: true }).click();
  return page.getByRole('region', { name: 'Reward summaries' });
}

async function openReviewItems(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('species-loot/');
  await uploadPack(page);
  await page.getByRole('radio', { name: 'Item drops', exact: true }).click();
  return page.getByRole('region', { name: 'Item drop browser' });
}

test('review: reward search retains typing focus after opening a detail', async ({ page }) => {
  const list = await openReviewRewards(page);
  await list.getByRole('button', { name: 'Reward details for example:shared_reward', exact: true }).first().click();
  const search = page.getByRole('textbox', { name: 'Search possible drops' });
  await search.fill('shared');
  await expect(page.getByRole('status').filter({ hasText: '180 of 181' })).toBeVisible();
  await expect(search).toBeFocused();
  await search.pressSequentially(' reward', { delay: 40 });
  await expect(search).toHaveValue('shared reward');
  await expect(search).toBeFocused();
});

test('review: identical rewards retain original condition identity through filtering', async ({ page }) => {
  const list = await openReviewRewards(page);
  await list.getByRole('button', { name: 'Reward details for example:shared_reward', exact: true }).first().click();
  const detail = page.getByRole('region', { name: 'Selected reward details' });
  await expect(detail).toContainText('Defeat count >= 100');
  await page.getByRole('textbox', { name: 'Search possible drops' }).fill('shared');
  await expect(page.getByRole('status').filter({ hasText: '180 of 181' })).toBeVisible();
  await expect(detail).toContainText('Defeat count >= 100');
  await expect(detail).not.toContainText('Defeat count >= 101');
});

for (const kind of ['reward', 'item']) {
  test(`review: ${kind} Back restores offset and current trigger after virtual unmount`, async ({ page }) => {
    const browser = kind === 'reward' ? null : await openReviewItems(page);
    const list = kind === 'reward' ? await openReviewRewards(page) : browser.getByRole('region', { name: 'Compact item drops' });
    const trigger = list.getByRole('button', { name: kind === 'reward' ? 'Reward details for example:other_reward' : /Drop details for.*Mobilemon00/i }).first();
    await trigger.click();
    await list.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(trigger).toHaveCount(0);
    const detail = page.getByRole('region', { name: kind === 'reward' ? 'Selected reward details' : 'Selected drop details' });
    await detail.getByRole('button', { name: kind === 'reward' ? 'Back to reward list' : 'Back to item drops', exact: true }).click();
    await expect.poll(() => list.evaluate(el => el.scrollTop)).toBe(0);
    await expect(trigger).toBeFocused();
  });
}

for (const kind of ['trainer', 'species']) {
  test(`review: ${kind} breakpoint transitions preserve the focused pane and reconcile Back focus`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(kind === 'trainer' ? 'trainer-scanner/' : 'species-loot/');
    await uploadPack(page);
    const search = page.getByRole('textbox', { name: kind === 'trainer' ? 'Search trainer, species, or loot item' : 'Search species, type, or loot item' });
    const query = kind === 'trainer' ? 'Mobile Trainer' : 'mobilemon';
    await search.fill(query);
    const list = page.getByRole('region', { name: kind === 'trainer' ? 'Trainer results' : 'Species results' });
    await list.getByRole('button', { name: kind === 'trainer' ? /Mobile Trainer 34/ : /Mobilemon34/i }).click();
    const heading = page.getByRole('heading', { name: kind === 'trainer' ? 'Mobile Trainer 34' : 'Mobilemon34', exact: true });
    await heading.focus();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    const back = page.getByRole('button', { name: 'Back to results', exact: true });
    await back.focus();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(back).not.toBeVisible();
    await expect(heading).toBeFocused();
    await expect(list).toBeVisible();
    await expect(search).toHaveValue(query);
  });
}

for (const kind of ['trainer', 'species']) {
  for (const control of kind === 'trainer' ? ['search', 'filter', 'result'] : ['search', 'result']) {
    test(`review: ${kind} round trip preserves focused roster ${control}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(kind === 'trainer' ? 'trainer-scanner/' : 'species-loot/');
      await uploadPack(page);
      const search = page.getByRole('textbox', { name: kind === 'trainer' ? 'Search trainer, species, or loot item' : 'Search species, type, or loot item' });
      const query = kind === 'trainer' ? 'Mobile Trainer' : 'mobilemon';
      await search.fill(query);
      const list = page.getByRole('region', { name: kind === 'trainer' ? 'Trainer results' : 'Species results' });
      const selected = list.getByRole('button', { name: kind === 'trainer' ? /Mobile Trainer 34/ : /Mobilemon34/i });
      await selected.click();
      await expect(page.getByRole('button', { name: 'Back to results', exact: true })).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 900 });
      await list.evaluate(el => { el.scrollTop = 0; });
      const target = control === 'search' ? search : control === 'filter'
        ? page.getByRole('combobox', { name: 'Trainer source pack' })
        : list.getByRole('button', { name: kind === 'trainer' ? /Mobile Trainer 00/ : /Mobilemon00/i });
      await target.focus();
      const offset = await list.evaluate(el => el.scrollTop);
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(target).toBeVisible();
      await expect(target).toBeFocused();
      await expect(list).toBeVisible();
      await expect(search).toHaveValue(query);
      await expect(selected).toHaveAttribute('aria-pressed', 'true');
      expect(await list.evaluate(el => el.scrollTop)).toBeCloseTo(offset, 0);
      await expect(page.getByRole('button', { name: 'Back to results', exact: true })).not.toBeVisible();
    });
  }
}

test('review: excluded item details do not resurrect or steal focus when filters clear', async ({ page }) => {
  const browser = await openReviewItems(page);
  await browser.getByRole('button', { name: /Drop details for/ }).first().click();
  const search = browser.getByRole('searchbox', { name: 'Search item drops' });
  await search.fill('not_a_drop');
  await expect(browser.getByRole('heading', { name: 'No matching item drops' })).toBeVisible();
  await search.fill('');
  await expect(browser.getByRole('status')).toContainText('35 of 35');
  await expect(browser.getByRole('region', { name: 'Selected drop details' })).toHaveCount(0);
  await expect(search).toBeFocused();
});

test('review: compact virtual summaries remain bounded with enlarged root text', async ({ page }) => {
  const browser = await openReviewItems(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  const list = browser.getByRole('region', { name: 'Compact item drops' });
  const trigger = list.getByRole('button', { name: /Drop details for/ }).first();
  await expect.poll(() => trigger.evaluate(el => {
    const row = el.parentElement;
    return row.scrollHeight <= row.clientHeight;
  })).toBe(true);
  await trigger.click();
  await expect(browser.getByRole('region', { name: 'Selected drop details' })).toBeVisible();
});
