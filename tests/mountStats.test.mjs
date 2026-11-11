import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { parseSpeciesAndSpawnFromZip } from "../src/utils/speciesSpawnParser.js";
import { mergeSpeciesAndLoot } from "../src/lib/speciesLootMerge.js";

const basePath = "data/cobblemon/species/charizard.json";
const additionPath = "data/example/species_additions/ride.json";
const riding = { behaviours: { AIR: { key: "cobblemon:air/bird", stats: { SPEED: "95-115", ZERO: 0, UNKNOWN: { values: [false, null, "x"] } } }, LAND: { stats: { SPEED: 12 } } }, seats: [] };
const base = { name: "Charizard", nationalPokedexNumber: 6, primaryType: "fire", secondaryType: "flying", baseStats: { hp: 78, attack: 84, defence: 78, special_attack: 109, special_defence: 85, speed: 100 }, moves: ["1:ember"], riding };
async function parse(entries, name = "fixture.zip", options = {}) {
  const zip = new JSZip();
  for (const [path, json] of entries) zip.file(path, JSON.stringify(json));
  const file = await zip.generateAsync({ type: "nodebuffer" });
  file.name = name;
  return parseSpeciesAndSpawnFromZip(file, options);
}

test("addition-only targets preserve arbitrary riding and unknown base stats", async () => {
  const [mon] = await parse([[additionPath, { target: "cobblemon:charizard", riding }]]);
  assert.equal(mon.name, "charizard");
  assert.equal(mon.stats, null);
  assert.equal(mon.isAddition, true);
  assert.deepEqual(mon.riding, riding);
  assert.deepEqual(mon.ridingSources, [{ sourceFile: "fixture.zip", path: additionPath }]);
  assert.equal(mon.mountDataVersion, 1);
  assert.equal(mergeSpeciesAndLoot([mon])[0].hasSpeciesData, true);
});

test("bases precede additions regardless of archive ordering; overrides retain unknown values", async () => {
  const addition = { target: "cobblemon:charizard", riding: { behaviours: { AIR: { stats: { SPEED: 0, NEW: "2-4" } }, UNKNOWN_MODE: { custom: [1, false] } } } };
  const entries = [[basePath, base], [additionPath, addition]];
  const forward = await parse(entries);
  assert.deepEqual(await parse([...entries].reverse()), forward);
  const [mon] = forward;
  assert.deepEqual(mon.stats, base.baseStats);
  assert.deepEqual(mon.types, ["fire", "flying"]);
  assert.deepEqual(mon.moves, base.moves);
  assert.equal(mon.riding.behaviours.AIR.stats.SPEED, 0);
  assert.deepEqual(mon.riding.behaviours.AIR.stats.UNKNOWN, riding.behaviours.AIR.stats.UNKNOWN);
  assert.deepEqual(mon.riding.behaviours.LAND, riding.behaviours.LAND);
  assert.deepEqual(mon.riding.behaviours.UNKNOWN_MODE, { custom: [1, false] });
  assert.equal(mon.ridingSources.length, 2);
});

test("forms inherit root riding, override it, or explicitly clear it", async () => {
  const override = { custom: { zero: 0 } };
  const rows = await parse([[basePath, { ...base, forms: [{ name: "inherited" }, { name: "custom", riding: override }, { name: "cleared", riding: null }] }], [additionPath, { target: "cobblemon:charizard", riding: { seats: ["new"] } }]]);
  const byName = Object.fromEntries(rows.map((row) => [row.name, row]));
  assert.deepEqual(byName["inherited charizard"].riding, byName.charizard.riding);
  assert.deepEqual(byName["custom charizard"].riding, override);
  assert.equal(byName["cleared charizard"].riding, null);
  assert.equal(byName["cleared charizard"].ridingSources[0].path, basePath);
  assert.ok(rows.every((row) => row.mountDataVersion === 1));
});

test("no riding still carries the cache contract", async () => {
  const [mon] = await parse([[basePath, { name: "Charizard" }]]);
  assert.equal(mon.riding, null);
  assert.deepEqual(mon.ridingSources, []);
  assert.equal(mon.mountDataVersion, 1);
});

test("cross-archive additions retain base data in either input order and allow null", async () => {
  const bases = await parse([[basePath, base]], "base.zip");
  const additions = await parse([[additionPath, { target: "cobblemon:charizard", riding: null }]], "addon.zip");
  const merged = mergeSpeciesAndLoot([...bases, ...additions]);
  assert.deepEqual(mergeSpeciesAndLoot([...additions, ...bases]), merged);
  assert.deepEqual(merged[0].stats, base.baseStats);
  assert.deepEqual(merged[0].types, ["fire", "flying"]);
  assert.deepEqual(merged[0].moves, base.moves);
  assert.equal(merged[0].riding, null);
  assert.equal(merged[0].ridingSources[1].sourceFile, "addon.zip");
  assert.equal(merged[0].mountDataVersion, 1);
});

test("cross-archive HP-only additions preserve every omitted base stat", async () => {
  const bases = await parse([[basePath, base]], "base.zip");
  for (const hp of [120, 0]) {
    const additions = await parse([[additionPath, {
      target: "cobblemon:charizard", baseStats: { hp },
    }]], "addon.zip");
    assert.equal(additions[0].isAddition, true);
    assert.deepEqual(additions[0].stats, { hp });
    for (const entries of [[...bases, ...additions], [...additions, ...bases]]) {
      assert.deepEqual(mergeSpeciesAndLoot(entries)[0].stats, { ...base.baseStats, hp });
    }
  }
});

test("unnamed form patches match aspects rather than missing names", async () => {
  const rows = await parse([
    [basePath, { ...base, forms: [
      { aspects: ["alolan"], riding: { marker: "alolan" } },
      { aspects: ["galarian", "extra"], riding: { marker: "galarian", retained: true } },
      { riding: { marker: "unidentified base" } },
    ] }],
    [additionPath, { target: "cobblemon:charizard", forms: [
      { aspects: ["extra", "galarian"], riding: { marker: "patched" } },
      { riding: { marker: "unidentified addition" } },
    ] }],
  ]);
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.find((row) => row.name === "alolan charizard").riding, { marker: "alolan" });
  assert.deepEqual(rows.find((row) => row.name === "galarian charizard").riding,
    { marker: "patched", retained: true });
  assert.deepEqual(rows.slice(-2).map((row) => row.riding.marker),
    ["unidentified base", "unidentified addition"]);
});

test("named form patches retain name-based identity", async () => {
  const rows = await parse([
    [basePath, { ...base, forms: [{ name: "custom", riding: { retained: true } }] }],
    [additionPath, { target: "cobblemon:charizard", forms: [{ name: "custom", riding: { added: true } }] }],
  ]);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1].riding, { retained: true, added: true });
});

test("addition processing respects cancellation", async () => {
  const entries = [[additionPath, { target: "cobblemon:charizard", riding }]];
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(parse(entries, "fixture.zip", { signal: controller.signal }), { name: "AbortError" });
});
