import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { createHash } from 'node:crypto';

async function jar(version, id, pokemon) {
  const zip = new JSZip();
  zip.file('data/cobblemon/spawn_pool_world/test.json', JSON.stringify({ spawns: [{ id: pokemon, pokemon, type: 'pokemon', bucket: 'common', level: '5-10', weight: 10 }] }));
  zip.file('data/cobblemon/species/test.json', JSON.stringify({ name: pokemon, nationalPokedexNumber: 132, primaryType: 'normal', baseStats: { hp: 48, attack: 48, defence: 48, special_attack: 48, special_defence: 48, speed: 48 }, drops: { entries: [{ item: 'minecraft:stick', quantityRange: 1, percentage: 50 }] } }));
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer, release: { version, versionId: id, loader: 'fabric', filename: `Cobblemon-${version}.jar`, url: `https://cdn.modrinth.com/data/MdwFAVRL/versions/${id}/Cobblemon-${version}.jar`, size: buffer.length, sha512: createHash('sha512').update(buffer).digest('hex'), sourceUrl: `https://modrinth.com/mod/cobblemon/version/${id}` } };
}
const a = await jar('1.7.0', 'Test0001', 'ditto');
const b = await jar('1.7.1', 'Test0002', 'eevee');
const manual = await jar('9.9.9', 'Test0003', 'pikachu');

async function open(page) {
  const dialog = page.getByRole('dialog', { name: 'Shared Files' });
  if (!await dialog.isVisible()) {
    let trigger = page.getByTitle('Upload shared files').filter({ visible: true });
    if (!await trigger.count()) { await page.getByRole('button', { name: /menu/i }).click(); trigger = page.getByTitle('Upload shared files').filter({ visible: true }); }
    await trigger.click();
  }
  return dialog;
}
async function load(page, version) {
  const dialog = await open(page);
  await dialog.getByLabel('Official Cobblemon version').selectOption(version);
  await dialog.getByRole('button', { name: 'Load version', exact: true }).click();
  await expect(dialog.getByText(`Active: Cobblemon ${version}`, { exact: true })).toBeVisible();
}
async function readStore(page, name) {
  return page.evaluate(name => new Promise((resolve, reject) => {
    const request = indexedDB.open('CobblemonData');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { const db = request.result; const tx = db.transaction(name); const get = tx.objectStore(name).get('main'); tx.oncomplete = () => { resolve(get.result?.data ?? []); db.close(); }; tx.onabort = () => reject(tx.error); };
  }), name);
}

test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/data/officialCobblemon.json')) return route.fulfill({ json: { projectId: 'MdwFAVRL', releases: [a.release, b.release] } });
    const file = [a, b].find(file => file.release.url === url.href);
    if (file) return route.fulfill({ body: file.buffer, contentType: 'application/java-archive', headers: { 'access-control-allow-origin': '*' } });
    if (url.origin === 'http://localhost:4173') return route.continue();
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
});

test('explicit load, replacement, scans, and reload preserve user uploads', async ({ page }) => {
  let downloads = 0;
  page.on('request', r => { if (r.url().includes('cdn.modrinth.com')) downloads++; });
  await page.goto('spawn-scanner/');
  const dialog = await open(page);
  await expect(dialog.getByLabel('Official Cobblemon version')).toBeVisible();
  expect(downloads).toBe(0);
  await dialog.getByLabel('Archive files').setInputFiles({ name: 'user-pack.zip', mimeType: 'application/zip', buffer: manual.buffer });
  await expect(dialog.getByRole('button', { name: 'Remove user-pack.zip', exact: true })).toBeVisible();
  await load(page, '1.7.0');
  const old = (await readStore(page, 'sharedFiles')).find(f => f.source === 'official-cobblemon').id;
  await expect.poll(async () => (await readStore(page, 'spawnReports')).length).toBe(2);
  await load(page, '1.7.1');
  await expect.poll(async () => (await readStore(page, 'spawnReports')).length).toBe(2);
  expect((await readStore(page, 'spawnReports')).some(r => r.sharedFileId === old)).toBe(false);
  expect((await readStore(page, 'sharedFiles')).map(f => f.name)).toEqual(['user-pack.zip', b.release.filename]);
  await dialog.getByRole('button', { name: 'Close shared files' }).click();
  await page.goto('species-loot/');
  await expect.poll(async () => (await readStore(page, 'speciesData')).length).toBe(2);
  await page.reload();
  await open(page);
  await expect(page.getByText('Active: Cobblemon 1.7.1', { exact: true })).toBeVisible();
  expect(downloads).toBe(2);
});

test('network, checksum, and invalid archive failures keep previous version', async ({ page }) => {
  await page.goto('spawn-scanner/'); await load(page, '1.7.0');
  await page.route(b.release.url, route => route.fulfill({ status: 503, body: '' }));
  const dialog = await open(page);
  await dialog.getByLabel('Official Cobblemon version').selectOption('1.7.1');
  await dialog.getByRole('button', { name: 'Load version', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('503');
  await expect(dialog.getByText('Active: Cobblemon 1.7.0', { exact: true })).toBeVisible();
  await page.route(b.release.url, route => route.fulfill({ body: Buffer.alloc(b.buffer.length), contentType: 'application/java-archive' }));
  await dialog.getByRole('button', { name: 'Load version', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('checksum');
  expect((await readStore(page, 'sharedFiles')).map(f => f.name)).toEqual([a.release.filename]);
});

test('cancel and clear all prevent a delayed download from restoring data', async ({ page }) => {
  await page.goto('spawn-scanner/'); await load(page, '1.7.0');
  let release; const pending = new Promise(resolve => { release = resolve; });
  await page.route(b.release.url, async route => { await pending; await route.fulfill({ body: b.buffer }).catch(() => {}); });
  const dialog = await open(page);
  await dialog.getByLabel('Official Cobblemon version').selectOption('1.7.1');
  await dialog.getByRole('button', { name: 'Load version', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel download' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel download' }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByLabel('Official Cobblemon version')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await open(page);
  await expect(dialog.getByText('Active: Cobblemon 1.7.0', { exact: true })).toBeVisible();
  await dialog.getByLabel('Official Cobblemon version').selectOption('1.7.1');
  await dialog.getByRole('button', { name: 'Load version', exact: true }).click();
  page.once('dialog', d => d.accept());
  await dialog.getByRole('button', { name: 'Clear All Files & Data' }).click();
  release();
  await expect(dialog.getByText('No shared files uploaded')).toBeVisible();
  expect(await readStore(page, 'sharedFiles')).toEqual([]);
});

test('other tabs observe replacement and removal', async ({ page, context }) => {
  await page.goto('spawn-scanner/'); await load(page, '1.7.0');
  const second = await context.newPage(); await second.goto('spawn-scanner/'); await open(second);
  await expect(second.getByText('Active: Cobblemon 1.7.0', { exact: true })).toBeVisible();
  await load(page, '1.7.1');
  await expect(second.getByText('Active: Cobblemon 1.7.1', { exact: true })).toBeVisible();
  await second.getByRole('button', { name: 'Remove official version', exact: true }).click();
  await expect(page.getByText('No official version loaded', { exact: true })).toBeVisible();
});

test('keyboard controls stay in the dialog and fit small screens', async ({ page }, testInfo) => {
  await page.goto('spawn-scanner/'); const dialog = await open(page);
  await expect(dialog.getByLabel('Official Cobblemon version')).toBeVisible();
  await dialog.getByLabel('Official Cobblemon version').selectOption('1.7.0');
  const contrast = await dialog.getByRole('button', { name: 'Load version', exact: true }).evaluate(node => {
    const style = getComputedStyle(node);
    const luminance = value => {
      const rgb = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const text = luminance(style.color); const background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  for (let i = 0; i < 16; i++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true); }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await dialog.getByLabel('Official Cobblemon version').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('official-picker.png') });
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
});
