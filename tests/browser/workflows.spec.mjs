import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';

const paths = JSON.parse(await readFile(new URL('../fixtures/archive-paths.json', import.meta.url), 'utf8'));
const ironNames = ['iron-boulder', 'iron-bundle', 'iron-crown', 'iron-hands', 'iron-jugulis', 'iron-leaves', 'iron-moth', 'iron-thorns', 'iron-treads', 'iron-valiant'];
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1sAAAAASUVORK5CYII=', 'base64');
async function archive(extra = {}, name = 'browser-pack.zip') {
  const zip = new JSZip();
  for (const [path, value] of Object.entries({ ...paths, ...extra })) {
    zip.file(path, typeof value === 'string' ? value : JSON.stringify(value), { date: new Date('2025-01-01T00:00:00Z') });
  }
  return { name, mimeType: 'application/zip', buffer: await zip.generateAsync({ type: 'nodebuffer' }) };
}

// A deny-by-default context route also covers new tabs, images, scripts and frames.
// No route ever fetches an external upstream.
test.beforeEach(async ({ context }) => {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://localhost:4173') return route.continue();
    if (url.hostname === 'pokeapi.co') {
      const name = url.pathname.split('/').filter(Boolean).at(-1);
      if (url.pathname.endsWith('/pokemon')) return route.fulfill({ json: { results: ['ditto', 'bulbasaur', ...ironNames].map(name => ({ name })) } });
      if (url.pathname.includes('/pokemon-species/')) return route.fulfill({ json: {
        gender_rate: name === 'ditto' ? -1 : 1, egg_groups: [{ name: name === 'ditto' ? 'ditto' : 'monster' }],
        is_legendary: false, is_mythical: false, habitat: { name: 'grassland' },
      } });
      return route.fulfill({ json: {
        id: name === 'ditto' ? 132 : 1, name, species: { name }, sprites: {},
        types: (name === 'ditto' ? ['normal'] : ['grass', 'poison']).map(name => ({ type: { name } })), 
        stats: [{ stat: { name: 'hp' }, effort: 1 }],
      } });
    }
    if (url.hostname === 'www.youtube-nocookie.com') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Offline video stub</title><button>Play stub</button>' });
    if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: pixel });
    return route.fulfill({ status: 200, contentType: 'text/plain', body: '' });
  });
});

async function openFiles(page) {
  const dialog = page.getByRole('dialog', { name: 'Shared Files' });
  if (!await dialog.isVisible()) {
    let trigger = page.getByTitle('Upload shared files').filter({ visible: true });
    if (!await trigger.count()) {
      await page.getByRole('button', { name: /menu/i }).click();
      trigger = page.getByTitle('Upload shared files').filter({ visible: true });
    }
    await trigger.click();
  }
  await expect(dialog).toBeVisible();
  return dialog;
}
async function upload(page, file) {
  const dialog = await openFiles(page);
  await expect(dialog.getByRole('checkbox', { name: /Allow compatibility/ })).not.toBeChecked();
  await dialog.getByLabel('Archive files').setInputFiles(file);
  await expect(dialog.getByRole('button', { name: `Remove ${file.name}`, exact: true }).first()).toBeVisible();
  return dialog;
}
async function closeFiles(page) {
  await page.getByRole('button', { name: 'Close shared files' }).click();
}
async function clearFiles(page) {
  const dialog = await openFiles(page);
  page.once('dialog', dialog => dialog.accept());
  await dialog.getByRole('button', { name: 'Clear All Files & Data' }).click();
  await expect(dialog.getByText('No shared files uploaded')).toBeVisible();
}
async function selectSpecies(page, name) {
  const combo = page.getByRole('combobox', { name: 'Species' });
  await expect(combo).toBeEnabled();
  await combo.fill(name);
  await expect(page.getByRole('option', { name, exact: true })).toBeVisible();
  await combo.press('ArrowDown');
  const active = await combo.getAttribute('aria-activedescendant');
  await expect(page.locator(`[id="${active}"]`)).toHaveAttribute('aria-selected', 'true');
  await combo.press('Enter');
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
}
async function noOverflow(page) {
  await expect.poll(() => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth)).toBeLessThanOrEqual(1);
}

test('trainer-only shared pack does not show a failed spawn scan or discard valid rows', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('spawn-scanner/');
  await upload(page, await archive());
  await closeFiles(page);
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  const originalRows = await table.getByRole('row').allTextContents();
  const zip = new JSZip();
  zip.file('data/rctmod/trainers/fixture.json', JSON.stringify({ team: [{ species: 'ditto', level: 5 }] }));
  await upload(page, { name: 'trainers-only.zip', mimeType: 'application/zip', buffer: await zip.generateAsync({ type: 'nodebuffer' }) });
  await closeFiles(page);
  await expect.poll(() => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('CobblemonData');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('processedFilesTracking', 'readonly');
      const record = tx.objectStore('processedFilesTracking').get('spawnScanner');
      tx.oncomplete = () => { resolve(record.result?.processedFiles?.length ?? 0); db.close(); };
      tx.onabort = () => { reject(tx.error); db.close(); };
    };
  }))).toBe(2);
  await expect(page.getByRole('heading', { name: 'Scan could not finish', exact: true })).toHaveCount(0);
  await expect(table.getByRole('row')).toHaveText(originalRows);
  const notice = page.getByText('No data for this tool in "trainers-only.zip". Other scanners can still use it.', { exact: true });
  await expect(notice).toBeVisible();
  expect(await notice.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return element === hit || element.contains(hit);
  })).toBe(true);
  expect(errors).toEqual([]);
});

test('spawn field terminal preserves full search across column views and resets hidden filters', async ({ page }) => {
  await page.goto('spawn-scanner/');
  await expect(page.getByText('No datapack loaded yet', { exact: true })).toBeVisible();
  await upload(page, await archive());
  await closeFiles(page);
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  const originalCount = await table.getByRole('columnheader').count();
  await expect(page.getByLabel('Column view')).toHaveValue('all');
  await page.getByLabel('Column view').selectOption('essentials');
  await expect.poll(() => table.getByRole('columnheader').count()).toBeLessThan(originalCount);
  await page.getByRole('textbox', { name: 'Search spawn data' }).fill('fixture-solo');
  await expect(table).toContainText('Ditto');
  await expect(table).not.toContainText('Wooloo');
  await expect(page.getByText('1 of 3 spawn entries', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByLabel('Search field', { exact: true }).selectOption('pokemon');
  await expect(page.getByText('No matching spawns', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: 'Show all spawns' }).click();
  await expect(page.getByText('3 of 3 spawn entries', { exact: true })).toBeVisible();
  await expect(page.getByText('Active filters: None', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Column view')).toHaveValue('essentials');
  await page.getByLabel('Column view').selectOption('all');
  await expect(table.getByRole('columnheader')).toHaveCount(originalCount);
  await page.getByRole('textbox', { name: 'Search spawn data' }).fill('ditto');
  await expect(page.getByText('1 of 3 spawn entries', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByText('3 of 3 spawn entries', { exact: true })).toBeVisible();
  await noOverflow(page);
});

test('item drops search spans species and preserves quantities, chances, sources and mode state', async ({ page }) => {
  await page.goto('species-loot/');
  await upload(page, await archive({
    'data/example/species/bulbasaur.json': {
      name: 'Bulbasaur', nationalPokedexNumber: 1, primaryType: 'grass',
      drops: { entries: [
        { item: 'minecraft:honey_bottle', quantityRange: '1-3', percentage: 0 },
        { item: 'minecraft:stick', quantityRange: 2 },
      ] },
    },
  }));
  await closeFiles(page);
  await page.getByRole('radio', { name: 'Item drops', exact: true }).click();
  const browser = page.getByRole('region', { name: 'Item drop browser' });
  const table = browser.getByRole('table');
  await expect(browser.getByRole('status')).toContainText('3 of 3 drop entries matched');
  await expect(table).toContainText('Not specified');
  const search = page.getByRole('searchbox', { name: 'Search item drops' });
  await search.fill('honey bottle');
  await expect(browser.getByRole('status')).toContainText('1 of 3 drop entries matched');
  await expect(table).toContainText('1-3');
  await expect(table).toContainText('0%');
  await table.getByRole('button', { name: 'Bulbasaur', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bulbasaur', exact: true })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Species detail view' }).getByRole('radio', { name: /Loot Table/ })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: 'Item drops', exact: true }).click();
  await expect(search).toHaveValue('honey bottle');
  const source = browser.getByRole('combobox', { name: 'Source pack' });
  await source.selectOption({ label: 'browser-pack.zip (report 1)' });
  const selectedSource = await source.inputValue();
  const zip = new JSZip();
  zip.file('data/example/species/ditto.json', JSON.stringify({ name: 'Ditto', drops: { entries: [{ item: 'minecraft:honey_bottle', quantityRange: 1, percentage: 25 }] } }));
  await upload(page, { name: 'extra-drops.zip', mimeType: 'application/zip', buffer: await zip.generateAsync({ type: 'nodebuffer' }) });
  await closeFiles(page);
  await expect(browser.getByRole('status')).toContainText('1 of 4 drop entries matched');
  await expect(source).toHaveValue(selectedSource);
  await expect(table).not.toContainText('25%');
  await source.selectOption('');
  await expect(browser.getByRole('status')).toContainText('2 of 4 drop entries matched');
  await expect(table).toContainText('25%');
  await search.fill('missing_item');
  await expect(browser.getByRole('heading', { name: 'No matching item drops' })).toBeVisible();
  await browser.getByRole('button', { name: 'Clear filters' }).click();
  await expect(browser.getByRole('status')).toContainText('4 of 4 drop entries matched');
  await noOverflow(page);
});

test('species mount stats show additions, custom modes, forms and survive reload', async ({ page }) => {
  await page.goto('species-loot/');
  await upload(page, await archive({
    'data/example/species_additions/charizard.json': {
      target: 'cobblemon:charizard',
      riding: { behaviours: {
        AIR: { key: 'cobblemon:air/bird', stats: { SPEED: '95-115', ACCELERATION: 0 } },
        CUSTOM: { stats: { GLIDE_EFFICIENCY: '3-7' } },
      }, seats: [{ offset: { x: 0, y: 0, z: 0 } }] },
      forms: [{ name: 'Mega', riding: { behaviours: { AIR: { stats: { SPEED: '120-140' } } } } }],
    },
  }));
  await closeFiles(page);
  const search = page.getByRole('textbox', { name: 'Search species, type, or loot item' });
  await search.fill('charizard');
  await page.getByRole('button', { name: 'charizard Charizard —', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mount stats', exact: true })).toBeVisible();
  const air = page.getByRole('region', { name: 'AIR mount stats' });
  await expect(air).toContainText('95-115');
  await expect(air).toContainText('0');
  await expect(page.getByRole('region', { name: 'CUSTOM mount stats' })).toContainText('3-7');
  await expect(page.getByText('Base stats are not included in the loaded data.')).toBeVisible();
  await page.getByText('Mount data sources', { exact: true }).click();
  await expect(page.getByText(/browser-pack.zip · data\/example\/species_additions\/charizard.json/)).toBeVisible();
  await page.getByRole('button', { name: 'mega charizard Mega Charizard —', exact: true }).click();
  await expect(air).toContainText('120-140');
  // Simulate pre-mount cached results while keeping the original archive bytes.
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('CobblemonData');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['speciesData', 'processedFilesTracking'], 'readwrite');
      const store = tx.objectStore('speciesData');
      const cached = store.get('main');
      cached.onsuccess = () => {
        const record = cached.result;
        record.data = record.data.map((entry) => {
                  delete entry.riding;
                  delete entry.ridingSources;
                  delete entry.mountDataVersion;
                  return entry;
                });
        store.put(record);
      };
      tx.objectStore('processedFilesTracking').delete('speciesLootScanner-mounts-v1');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  }));
  await page.reload();
  await search.fill('charizard');
  await page.getByRole('button', { name: 'charizard Charizard —', exact: true }).click();
  await expect(air).toContainText('95-115');
  await noOverflow(page);
});

test('archive bytes persist across reload and scan in another tool', async ({ page }) => {
  await page.goto('spawn-scanner/');
  await upload(page, await archive());
  await closeFiles(page);
  await expect(page.getByRole('table')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('table')).toBeVisible();
  await page.goto('species-loot/');
  await expect(page.getByRole('heading', { name: 'Ditto', exact: true })).toBeVisible();
  await expect(page.getByText('browser-pack.zip', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Loot Table 1', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText('stick');
  await expect(page.getByText(/Archive unavailable/)).toHaveCount(0);
  await openFiles(page);
  await expect(page.getByRole('dialog').getByText(/· Strict JSON$/)).toBeVisible();
});

test('identical content reconnects once; different same-name content stays separate', async ({ page }) => {
  await page.goto('spawn-scanner/');
  const file = await archive();
  await upload(page, file);
  await page.reload();
  const dialog = await upload(page, file);
  await expect(dialog.getByRole('button', { name: `Remove ${file.name}`, exact: true })).toHaveCount(1);
  await dialog.getByLabel('Archive files').setInputFiles(await archive({ 'different.txt': 'different content' }));
  await expect(dialog.getByRole('button', { name: `Remove ${file.name}`, exact: true })).toHaveCount(2);
});

test('two tabs synchronize additions, reports, removal and clear without reload', async ({ page, context }) => {
  await page.goto('spawn-scanner/');
  const other = await context.newPage();
  await other.goto('spawn-scanner/');
  await upload(page, await archive());
  await closeFiles(page);
  await expect(other.getByRole('table')).toBeVisible();
  const otherDialog = await openFiles(other);
  await expect(otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true })).toHaveCount(1);
  await otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true }).click();
  await expect(otherDialog.getByText('No shared files uploaded')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await upload(page, await archive());
  await closeFiles(page);
  await expect(otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true })).toHaveCount(1);
  await closeFiles(other);
  await expect(other.getByRole('table')).toBeVisible();
  await clearFiles(page);
  await expect(other.getByRole('table')).toHaveCount(0);
  await openFiles(other);
  await expect(otherDialog.getByText('No shared files uploaded')).toBeVisible();
});

test('blocked v6 storage upgrade shows recovery status and resumes when the old tab closes', async ({ page, context }) => {
  const legacy = await context.newPage();
  try {
    // A static same-origin document holds v6 without booting the app or
    // installing its cooperative versionchange connection-close handler.
    await legacy.goto('icon.svg');
    await legacy.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('CobblemonData', 6);
      request.onupgradeneeded = () => {
        for (const name of [
          'spawnReports', 'speciesData', 'trainerReports', 'lootReports',
          'spawnPoolData', 'userPreferences', 'sharedFiles',
          'processedFilesTracking', 'pokedexListCache',
          'pokedexDetailCache', 'pokedexDetailCache_v2',
        ]) {
          const store = request.result.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('toolType', 'toolType', { unique: false });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        window.legacyConnection = request.result;
        window.legacyConnection.onversionchange = () => { window.upgradeRequested = true; };
        resolve();
      };
    }));
    await page.goto('spawn-scanner/');
    const notice = page.getByRole('status').filter({ hasText: 'Close other CobbleToolkit tabs to finish upgrading browser storage.' });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('Saved data will be retained; this tab will continue automatically.');
    expect(await legacy.evaluate(() => window.legacyConnection.version)).toBe(6);
    await expect.poll(() => legacy.evaluate(() => Boolean(window.upgradeRequested))).toBe(true);
    await legacy.close();
    await expect(notice).toHaveCount(0);
    await upload(page, await archive());
    await closeFiles(page);
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('table')).toContainText('Ditto');
  } finally {
    if (!legacy.isClosed()) await legacy.close();
  }
});

test('storage-event fallback synchronizes tabs when BroadcastChannel is unavailable', async ({ page, context }) => {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', { configurable: true, value: undefined });
    window.sharedFileStorageSignals = [];
    window.addEventListener('storage', event => {
      if (event.key === 'cobbletoolkit:shared-files-signal' && event.newValue) {
        window.sharedFileStorageSignals.push(JSON.parse(event.newValue).type);
      }
    });
  });
  await page.goto('spawn-scanner/');
  const other = await context.newPage();
  await other.goto('spawn-scanner/');
  expect(await page.evaluate(() => typeof BroadcastChannel)).toBe('undefined');
  expect(await other.evaluate(() => typeof BroadcastChannel)).toBe('undefined');
  const otherDialog = await openFiles(other);
  await expect(otherDialog.getByText('No shared files uploaded')).toBeVisible();
  await upload(page, await archive());
  await closeFiles(page);
  await expect(otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true })).toHaveCount(1);
  await expect(other.getByRole('table')).toBeVisible();
  await expect.poll(() => other.evaluate(() => window.sharedFileStorageSignals)).toContain('changed');
  await otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.sharedFileStorageSignals)).toContain('changed');
  await upload(page, await archive());
  await closeFiles(page);
  await expect(otherDialog.getByRole('button', { name: 'Remove browser-pack.zip', exact: true })).toHaveCount(1);
  await expect(other.getByRole('table')).toBeVisible();
  await clearFiles(page);
  await expect(otherDialog.getByText('No shared files uploaded')).toBeVisible();
  await expect(other.getByRole('table')).toHaveCount(0);
});

test('clear during a gated archive scan cannot resurrect reports', async ({ page, context }) => {
  // Gate JSZip's FileReader, not a timer: clear occurs after parsing starts.
  await page.addInitScript(() => {
    const original = FileReader.prototype.readAsArrayBuffer;
    FileReader.prototype.readAsArrayBuffer = function (blob) {
      window.scanReadStarted = true;
      window.releaseScanRead = () => new Promise((resolve, reject) => {
        this.addEventListener('loadend', () => {
          window.scanReadReleased = true;
          if (this.error) reject(this.error);
          else resolve();
        }, { once: true });
        original.call(this, blob);
      });
    };
  });
  await page.goto('spawn-scanner/');
  const other = await context.newPage();
  await other.goto('campfire-kitchen/');
  await upload(other, await archive());
  await expect.poll(() => page.evaluate(() => Boolean(window.scanReadStarted))).toBe(true);
  await clearFiles(other);
  await page.evaluate(() => window.releaseScanRead());
  await expect.poll(() => page.evaluate(() => Boolean(window.scanReadReleased))).toBe(true);
  await expect(page.getByText('No datapack loaded yet', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('table')).toHaveCount(0);
  await openFiles(page);
  await expect(page.getByRole('dialog').getByText('No shared files uploaded')).toBeVisible();
});

test('spawn table exposes roles and keyboard sorting with contained overflow', async ({ page }) => {
  await page.goto('spawn-scanner/');
  await upload(page, await archive());
  await closeFiles(page);
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  const header = table.getByRole('columnheader', { name: 'Pokémon', exact: true });
  const button = header.getByRole('button');
  await button.focus();
  await button.press('Enter');
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  const ascending = await table.getByRole('row').allTextContents();
  await button.press('Enter');
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  await expect.poll(() => table.getByRole('row').allTextContents()).not.toEqual(ascending);
  await noOverflow(page);
});

test('Kitchen fuzzy species search keeps every Iron result and scrolls keyboard selection', async ({ page }) => {
  await page.goto('campfire-kitchen/');
  const combo = page.getByRole('combobox', { name: 'Species' });
  await expect(combo).toBeEnabled();
  await combo.fill('Iron');
  const list = page.getByRole('listbox');
  await expect(list.getByRole('option')).toHaveText(ironNames.map(name => name.replaceAll('-', ' ')));
  const valiant = list.getByRole('option', { name: 'iron valiant', exact: true });
  await expect(valiant).toBeAttached();
  await expect.poll(() => list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  for (let i = 0; i < ironNames.length; i++) await combo.press('ArrowDown');
  await expect(valiant).toHaveAttribute('aria-selected', 'true');
  await expect(combo).toHaveAttribute('aria-activedescendant', await valiant.getAttribute('id'));
  await expect.poll(() => valiant.evaluate(element => {
    const option = element.getBoundingClientRect();
    const viewport = element.parentElement.getBoundingClientRect();
    return element.parentElement.scrollTop > 0 && option.top >= viewport.top && option.bottom <= viewport.bottom;
  })).toBe(true);
  await combo.press('Enter');
  await expect(combo).toHaveValue('');
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
  for (const query of ['iron valiant', 'iron_valiant', 'ÍRON VALIANT', 'valiant iron', 'iron valant']) {
    await combo.fill(query);
    await expect(page.getByRole('option', { name: 'iron valiant', exact: true })).toBeVisible();
    await combo.press('ArrowDown');
    await combo.press('Enter');
    await expect(combo).toHaveValue('');
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('img', { name: 'Iron valiant', exact: true })).toBeVisible();
  }
});

async function fuzzySearchPack() {
  return archive({
    'data/example/spawn_pool_world/iron_valiant.json': {
      spawns: [{ id: 'fuzzy-iron-valiant', pokemon: 'iron_valiant', type: 'pokemon', bucket: 'common', level: '5-10', weight: 10 }],
    },
    'data/example/species/iron_valiant.json': {
      name: 'Iron Valiant', nationalPokedexNumber: 1006, primaryType: 'fairy',
      baseStats: { hp: 74, attack: 130, defence: 90, special_attack: 120, special_defence: 60, speed: 116 },
      drops: { entries: [{ item: 'minecraft:iron_ingot', quantityRange: 1, percentage: 100 }] },
    },
    'data/rctmod/trainers/fuzzy.json': {
      name: { literal: 'Élite Sentinel' }, team: [{ species: 'iron_valiant', level: 50 }],
    },
    'data/rctmod/loot_table/trainers/single/fuzzy.json': {
      pools: [{ rolls: 1, entries: [{ type: 'minecraft:loot_table', value: 'rctmod:generic/fuzzy' }] }],
    },
    'data/rctmod/loot_table/generic/fuzzy.json': {
      pools: [{ rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:iron_ingot', weight: 1 }] }],
    },
  }, 'fuzzy-search-pack.zip');
}

test('Spawn and Species searches normalize names, typos and loot item separators', async ({ page }) => {
  await page.goto('spawn-scanner/');
  await upload(page, await fuzzySearchPack());
  await closeFiles(page);
  const search = page.getByRole('textbox', { name: 'Search spawn data', exact: true });
  const rows = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows.filter({ hasText: /Iron[ _-]Valiant/i })).toHaveCount(1);
  for (const query of ['Iron', 'iron valiant', 'iron_valant', 'ÍRON VALIANT', 'valiant iron']) {
    await search.fill('zzzznomatch');
    await expect(rows).toHaveCount(0);
    await search.fill(query);
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText(/Iron[ _-]Valiant/i);
  }
  await page.goto('species-loot/');
  const speciesSearch = page.getByRole('textbox', { name: 'Search species, type, or loot item', exact: true });
  const result = page.getByRole('button', { name: /Iron Valiant/ });
  for (const query of ['Iron', 'iron valiant', 'iron_valant', 'iron ingot', 'ÍRON VALIANT', 'valiant iron']) {
    await speciesSearch.fill('zzzznomatch');
    await expect(result).toHaveCount(0);
    await speciesSearch.fill(query);
    await expect(result).toBeVisible();
    await expect(page.getByRole('button', { name: /Ditto/ })).toHaveCount(0);
    await result.click();
    await expect(page.getByRole('heading', { name: 'Iron Valiant', exact: true })).toBeVisible();
  }
});

test('Trainer searches normalize trainer names, team species and nested loot items', async ({ page }) => {
  await page.goto('trainer-scanner/');
  await upload(page, await fuzzySearchPack());
  await closeFiles(page);
  const search = page.getByRole('textbox', { name: 'Search trainer, species, or loot item', exact: true });
  const result = page.getByRole('button', { name: /Élite Sentinel/ });
  await expect(result).toBeVisible();
  for (const query of ['elite sentinel', 'SENTINEL ELITE', 'elite sentnel', 'Iron', 'iron valiant', 'iron_valant', 'iron ingot']) {
    await search.fill('zzzznomatch');
    await expect(result).toHaveCount(0);
    await search.fill(query);
    await expect(result).toBeVisible();
    await expect(page.getByRole('button', { name: /Fixture Trainer/ })).toHaveCount(0);
  }
  await result.click();
  await expect(page.getByRole('heading', { name: 'Élite Sentinel', exact: true })).toBeVisible();
  await page.getByRole('radio', { name: /^Loot/ }).click();
  const lootSearch = page.getByRole('textbox', { name: 'Search possible drops', exact: true });
  const item = page.getByText('minecraft:iron_ingot', { exact: true });
  for (const query of ['iron ingot', 'IRON_INGOT', 'íron ingot', 'ingot iron', 'iron ingt']) {
    await lootSearch.fill('zzzznomatch');
    await expect(item).toHaveCount(0);
    await lootSearch.fill(query);
    await expect(item).toBeVisible();
  }
});

test('trainer dossier separates duplicate IDs across packs and filters loot status without stale details', async ({ page }) => {
  await page.goto('trainer-scanner/');
  await upload(page, await archive());
  await closeFiles(page);
  await upload(page, await archive({
    'data/rctmod/trainers/fixture.json': { name: { literal: 'Alternate Trainer' }, team: [{ species: 'bulbasaur', level: 40 }] },
    'data/rctmod/trainers/novice.json': { name: { literal: 'Novice Trainer' }, team: [] },
    'data/rctmod/loot_table/generic/fixture.json': { pools: [{ rolls: 1, entries: [{ type: 'minecraft:loot_table', value: 'rctmod:generic/missing' }] }] },
  }, 'alternate-pack.zip'));
  await closeFiles(page);
  await expect(page.getByRole('status').filter({ hasText: '3 of 3 trainers' })).toBeVisible();
  await page.getByRole('button', { name: /Alternate Trainer/ }).click();
  await expect(page.getByRole('heading', { name: 'Alternate Trainer', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Source pack: alternate-pack.zip' })).toBeVisible();
  await page.getByRole('button', { name: /Fixture Trainer/ }).click();
  await expect(page.getByRole('heading', { name: 'Fixture Trainer', exact: true })).toBeVisible();
  const source = page.getByRole('combobox', { name: 'Trainer source pack' });
  await source.selectOption({ label: 'alternate-pack.zip' });
  await expect(page.getByRole('status').filter({ hasText: '2 of 3 trainers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fixture Trainer', exact: true })).toHaveCount(0);
  const loot = page.getByRole('combobox', { name: 'Trainer loot status' });
  await loot.selectOption('issues');
  await expect(page.getByRole('status').filter({ hasText: '1 of 3 trainers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alternate Trainer', exact: true })).toBeVisible();
  await loot.selectOption('none');
  await expect(page.getByRole('heading', { name: 'Novice Trainer', exact: true })).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search trainer, species, or loot item' });
  await search.fill('zzzznomatch');
  await expect(page.getByRole('status').filter({ hasText: '0 of 3 trainers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Novice Trainer', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset trainer filters' }).click();
  await expect(page.getByRole('status').filter({ hasText: '3 of 3 trainers' })).toBeVisible();
  await loot.selectOption('linked');
  await expect(page.getByRole('status').filter({ hasText: '2 of 3 trainers' })).toBeVisible();
  await noOverflow(page);
});

test('Kitchen combobox keyboard, radio arrows and saturated card/pot state', async ({ page }) => {
  await page.goto('campfire-kitchen/');
  const combo = page.getByRole('combobox', { name: 'Species' });
  await expect(combo).toBeEnabled();
  await combo.fill('dit');
  await expect(page.getByRole('listbox')).toBeVisible();
  await combo.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await selectSpecies(page, 'ditto');
  await expect(page.getByRole('img', { name: 'Ditto', exact: true })).toBeVisible();
  const product = page.getByRole('radiogroup', { name: 'Product', exact: true });
  const first = product.getByRole('radio').first();
  await first.focus();
  await first.press('ArrowRight');
  await expect(product.getByRole('radio').nth(1)).toBeChecked();
  await expect(product.getByRole('radio').nth(1)).toBeFocused();
  await page.getByRole('radiogroup', { name: 'Target rarity', exact: true }).getByRole('radio', { name: 'Common', exact: true }).click();
  // The previous rarity plan also has three cards. Wait for the Common
  // fixture plan itself, not just a count that can pass before the effect runs.
  const cards = page.locator('.seasoning-swap');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('p:first-child')).toHaveText(['Eggant Berry', 'Pomeg Berry', 'Chilan Berry']);
  for (let i = 0; i < 3; i++) {
    const name = await cards.nth(i).locator('p').first().innerText();
    const pot = page.getByRole('button', { name: `Seasoning ${i + 1}: ${name}`, exact: true });
    await expect(pot).toBeDisabled();
    await expect(cards.nth(i).locator('..')).not.toHaveAttribute('role', 'button');
    await expect(pot).toHaveAttribute('title', new RegExp(name));
  }
  await noOverflow(page);
});

test('Kitchen card and pot cycling stay synchronized without duplicate ingredients', async ({ page }) => {
  await page.goto('campfire-kitchen/');
  await selectSpecies(page, 'bulbasaur');
  await page.getByRole('radiogroup', { name: 'Target rarity', exact: true }).getByRole('radio', { name: 'Common', exact: true }).click();
  const cards = page.locator('.seasoning-swap');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('p:first-child')).toHaveText(['Pomeg Berry', 'Rindo Berry', 'Kebia Berry']);
  const pot = page.getByRole('button', { name: /^Cycle seasoning/ }).first();
  await expect(pot).toBeEnabled();
  const before = await pot.getAttribute('aria-label');
  const slot = Number(before.match(/seasoning (\d)/)[1]) - 1;
  const card = cards.nth(slot);
  const cardName = card.locator('p').first();
  const originalName = await cardName.innerText();
  await pot.click();
  await expect(cardName).not.toHaveText(originalName);
  await expect(page.getByRole('button', { name: before, exact: true })).toHaveCount(0);
  const name = await cardName.innerText();
  await expect(page.getByRole('button', { name: `Cycle seasoning ${slot + 1}: ${name}`, exact: true })).toBeEnabled();
  await card.locator('..').press('Enter');
  await expect(cardName).not.toHaveText(name);
  const nextName = await cardName.innerText();
  expect(nextName).not.toBe(name);
  await expect(page.getByRole('button', { name: `Cycle seasoning ${slot + 1}: ${nextName}`, exact: true })).toBeEnabled();
  const names = await cards.locator('p:first-child').allTextContents();
  expect(new Set(names).size).toBe(names.length);
  await noOverflow(page);
});

test('Kitchen recipe station updates ingredients and restores seasoning recommendations', async ({ page }) => {
  await page.goto('campfire-kitchen/');
  const recipe = page.getByRole('region', { name: 'Base recipe' });
  const pot = page.getByRole('region', { name: 'Campfire pot', exact: true });
  await expect(pot).toBeVisible();
  for (let slot = 1; slot <= 3; slot++) {
    await expect(pot.getByRole('button', { name: `Seasoning ${slot}: empty`, exact: true })).toBeDisabled();
  }
  await expect(recipe.getByRole('heading', { name: 'Poké Snack', exact: true })).toBeVisible();
  await expect(recipe.getByText('Milk (or Moomoo Milk)', { exact: true })).toBeVisible();
  await selectSpecies(page, 'bulbasaur');
  await page.getByRole('radiogroup', { name: 'Target rarity', exact: true }).getByRole('radio', { name: 'Common', exact: true }).click();
  const cards = page.locator('.seasoning-swap');
  await expect(cards.locator('p:first-child')).toHaveText(['Pomeg Berry', 'Rindo Berry', 'Kebia Berry']);
  await page.getByRole('button', { name: /^Cycle seasoning/ }).first().click();
  await expect(cards.locator('p:first-child')).not.toHaveText(['Pomeg Berry', 'Rindo Berry', 'Kebia Berry']);
  await page.getByRole('button', { name: 'Restore recommendations' }).click();
  await expect(cards.locator('p:first-child')).toHaveText(['Pomeg Berry', 'Rindo Berry', 'Kebia Berry']);
  const product = page.getByRole('radiogroup', { name: 'Product', exact: true });
  await product.getByRole('radio', { name: 'Fishing bait', exact: true }).click();
  await expect(recipe.getByRole('heading', { name: 'Poké Bait', exact: true })).toBeVisible();
  await expect(pot.getByText('Poké Bait', { exact: true })).toBeVisible();
  await expect(pot.getByText('4 bait per cook', { exact: true })).toBeVisible();
  await expect(recipe.getByText('Brown or Red Mushroom', { exact: true })).toBeVisible();
  await expect(recipe.getByText('Milk (or Moomoo Milk)', { exact: true })).toHaveCount(0);
  await expect(cards.locator('p:first-child')).toHaveText(['Pomeg Berry', 'Rindo Berry', 'Kebia Berry']);
  await expect(page.getByRole('radiogroup', { name: 'Target rarity', exact: true }).getByRole('radio', { name: 'Common', exact: true })).toBeChecked();
  await noOverflow(page);
});

test('Kitchen latest species request wins even when the first finishes last', async ({ page, context }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let started;
  const requested = new Promise(resolve => { started = resolve; });
  let finished;
  const completed = new Promise(resolve => { finished = resolve; });
  await context.route('https://pokeapi.co/api/v2/pokemon/ditto', async route => {
    started();
    await gate;
    await route.fulfill({ json: { id: 132, name: 'ditto', species: { name: 'ditto' }, sprites: {}, types: [{ type: { name: 'normal' } }], stats: [] } });
    finished();
  });
  await page.goto('campfire-kitchen/');
  try {
    await selectSpecies(page, 'ditto');
    await requested;
    await selectSpecies(page, 'bulbasaur');
    await expect(page.getByRole('img', { name: 'Bulbasaur', exact: true })).toBeVisible();
    const staleSpecies = page.waitForResponse('https://pokeapi.co/api/v2/pokemon-species/ditto');
    release();
    await completed;
    await (await staleSpecies).finished();
    // Flush response continuations and React's next render without a sleep.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect.poll(() => page.getByText('Loading species data…').count()).toBe(0);
    await expect(page.getByRole('img', { name: 'Bulbasaur', exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Ditto', exact: true })).toHaveCount(0);
    await noOverflow(page);
  } finally { release(); }
});

test('FAQ field guide links and keyboard disclosures expose current tool guidance', async ({ page }) => {
  await page.goto('faq/');
  await page.getByRole('navigation', { name: 'FAQ sections' }).getByRole('link', { name: '02 / Common questions' }).click();
  await expect(page).toHaveURL(/#common-questions$/);
  const disclosure = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Where do mount stats come from?' }) });
  await expect(disclosure).not.toHaveAttribute('open');
  await disclosure.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.locator('p')).toContainText('species_additions/');
  await expect(disclosure.locator('p')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(disclosure.locator('p')).toBeHidden();
  await page.getByRole('navigation', { name: 'FAQ sections' }).getByRole('link', { name: '03 / Feedback' }).click();
  await expect(page.getByRole('heading', { name: 'Questions & feedback' })).toBeVisible();
  await noOverflow(page);
});

test('FAQ defers YouTube until keyboard activation and focuses the stubbed frame', async ({ page }) => {
  const requests = [];
  page.on('request', request => { if (request.url().includes('youtube-nocookie.com')) requests.push(request.url()); });
  await page.goto('faq/');
  const button = page.getByRole('button', { name: 'Load YouTube player: datapack upload walkthrough' });
  await expect(button).toBeVisible();
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  expect(requests).toEqual([]);
  await button.focus();
  await button.press('Enter');
  const frame = page.locator('iframe[title="How to upload a datapack in CobbleToolkit"]');
  await expect(frame).toBeVisible();
  await expect(frame).toBeFocused();
  await expect(page.frameLocator('iframe[title="How to upload a datapack in CobbleToolkit"]').getByRole('button', { name: 'Play stub' })).toBeVisible();
  expect(requests).toHaveLength(1);
});
