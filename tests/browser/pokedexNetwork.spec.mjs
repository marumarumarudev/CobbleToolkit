import { test, expect } from '@playwright/test';

const api = 'https://pokeapi.co/api/v2/';
const list = `${api}pokemon?limit=2000`;
const pokemon = { id: 132, name: 'ditto', species: { name: 'ditto' }, sprites: {}, types: [], stats: [] };

test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://localhost:4173') return route.continue();
    if (url.href === list) return route.fulfill({ json: { results: [{ name: 'ditto' }] } });
    if (url.href === `${api}pokemon/ditto`) return route.fulfill({ json: pokemon });
    return route.fulfill({ json: { gender_rate: -1, egg_groups: [], is_legendary: false, is_mythical: false } });
  });
});

async function chooseDitto(page) {
  const search = page.getByRole('combobox', { name: 'Species', exact: true });
  await expect(search).toBeEnabled();
  await search.fill('ditto');
  await page.getByRole('option', { name: 'ditto', exact: true }).click();
}

for (const endpoint of ['pokemon/ditto', 'pokemon-species/ditto']) {
  for (const [status, message] of [
    [404, 'Couldn\'t find "ditto" in the Pokédex'],
    [429, 'PokeAPI rate limit reached. Please try again shortly.'],
    [503, 'PokeAPI request failed (HTTP 503). Please try again.'],
  ]) {
    test(`${endpoint} reports HTTP ${status} accurately`, async ({ page, context }) => {
      await context.route(`${api}${endpoint}`, route => route.fulfill({ status, json: {} }));
      await page.goto('campfire-kitchen/');
      await chooseDitto(page);
      await expect(page.getByText(message, { exact: true })).toBeVisible();
      await expect(page.getByText('Loading species', { exact: true })).toBeHidden();
    });
  }
}

for (const endpoint of ['pokemon?limit=2000', 'pokemon/ditto', 'pokemon-species/ditto']) {
  test(`${endpoint} times out and ends loading`, async ({ page, context }) => {
    await page.clock.install();
    await context.route(`${api}${endpoint}`, () => {});
    const requested = page.waitForRequest(`${api}${endpoint}`);
    await page.goto('campfire-kitchen/');
    if (endpoint !== 'pokemon?limit=2000') await chooseDitto(page);
    await requested;
    await page.clock.fastForward(15_001);
    await expect(page.getByText('PokeAPI request timed out. Please try again.', { exact: true })).toBeVisible();
    await expect(page.getByText('Loading species', { exact: true })).toBeHidden();
    await expect(page.getByPlaceholder('Loading Pokédex…')).toHaveCount(0);
  });
}

for (const fails of [false, true]) {
  test(`cached names remain usable during refresh and ${fails ? 'after failure' : 'update on success'}`, async ({ page, context }) => {
    await page.goto('campfire-kitchen/');
    await expect(page.getByRole('combobox', { name: 'Species', exact: true })).toBeEnabled();
    // Wait for persistence, not just the state update that precedes it.
    await expect.poll(() => page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('CobblemonData');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pokedexListCache')) { db.close(); resolve(false); return; }
        const tx = db.transaction('pokedexListCache');
        const cached = tx.objectStore('pokedexListCache').get('main');
        tx.oncomplete = () => { db.close(); resolve(cached.result?.data?.includes('ditto') ?? false); };
      };
    }))).toBe(true);
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await context.route(list, async route => {
      await gate;
      await route.fulfill(fails ? { status: 503, json: {} } : { json: { results: [{ name: 'ditto' }, { name: 'bulbasaur' }] } });
    });
    const requested = page.waitForRequest(list);
    await page.reload();
    await requested;
    await expect(page.getByRole('combobox', { name: 'Species', exact: true })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Species', exact: true }).fill('ditto');
    await expect(page.getByRole('option', { name: 'ditto', exact: true })).toBeVisible();
    const response = page.waitForResponse(list);
    release();
    await response;
    if (!fails) {
      await page.getByRole('combobox', { name: 'Species', exact: true }).fill('bulbasaur');
      await expect(page.getByRole('option', { name: 'bulbasaur', exact: true })).toBeVisible();
    }
    await expect(page.getByRole('combobox', { name: 'Species', exact: true })).toBeEnabled();
    await expect(page.getByText('Could not load species', { exact: true })).toBeHidden();
  });
}
