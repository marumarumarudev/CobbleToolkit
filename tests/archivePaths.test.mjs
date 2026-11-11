import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { MAX_ARCHIVE_BYTES } from "../src/utils/archiveLimits.js";
import { normalizeDatapackPath, indexDatapackArchive } from "../src/utils/archivePaths.js";
import { validateFileStructure } from "../src/utils/fileValidation.js";
import { parseCobblemonZip } from "../src/utils/spawnParser.js";
import { parseSpeciesAndSpawnFromZip } from "../src/utils/speciesSpawnParser.js";
import { parseLootFromZip } from "../src/utils/lootParser.js";
import { parseRctTrainersFromZip } from "../src/utils/rctTrainerParser.js";

// Synthetic regression fixtures for the schemas already accepted by our code,
// not an assertion of complete upstream Cobblemon 1.8 schema compatibility.
const fixtures = JSON.parse(await readFile(new URL("./fixtures/archive-paths.json", import.meta.url), "utf8"));
async function archive(entries, transform = (path) => path) {
  const zip = new JSZip();
  for (const [path, value] of Object.entries(entries)) {
    zip.file(transform(path), JSON.stringify(value), { createFolders: false });
  }
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  buffer.name = "fixture.zip";
  return buffer;
}

async function scanAll(file) {
  return {
    validation: await validateFileStructure(file),
    spawn: await parseCobblemonZip(file),
    species: await parseSpeciesAndSpawnFromZip(file),
    loot: await parseLootFromZip(file),
    trainers: await parseRctTrainersFromZip(file),
  };
}

test("normalization strips wrappers only at an exact data segment", () => {
  assert.equal(normalizeDatapackPath("wrapper/data/example/species/ditto.json"), "data/example/species/ditto.json");
  assert.equal(normalizeDatapackPath("wrapper\\data\\example\\species\\ditto.json"), "data/example/species/ditto.json");
  assert.equal(normalizeDatapackPath("metadata/example/species/ditto.json"), "metadata/example/species/ditto.json");
});

test("index retains the original entry and skips directory records", () => {
  const entry = { dir: false, async: () => "content" };
  const zip = { files: { "wrapper/data/": { dir: true }, "wrapper/data/example/species/ditto.json": entry } };
  const index = indexDatapackArchive(zip);
  assert.equal(index.files["data/example/species/ditto.json"], entry);
  assert.equal(Object.keys(index.files).length, 1);
  assert.equal(zip.files["wrapper/data/example/species/ditto.json"], entry);
});

test("root, wrapped, and Windows-separated archives produce identical scanner data", async () => {
  const baseline = await scanAll(await archive(fixtures));
  assert.deepEqual(baseline.validation.kinds, ["spawn", "species", "rctTrainer"]);
  assert.equal(baseline.spawn.length, 3);
  assert.deepEqual(baseline.spawn.map((row) => row.pokemon).sort(), ["ditto", "dubwool", "wooloo"]);
  assert.equal(baseline.spawn.filter((row) => row.spawnType === "pokemon-herd").length, 2);
  assert.equal(baseline.species[0].name, "ditto");
  assert.equal(baseline.loot[0].namespace, "example");
  assert.equal(baseline.trainers[0].loot.linkStatus, "single");
  assert.ok(baseline.trainers[0].loot.items.some((item) => item.item === "minecraft:stick"));
  for (const transform of [
    (path) => `pack-release/${path}`,
    (path) => `outer/inner/${path}`.replaceAll("/", "\\"),
  ]) {
    assert.deepEqual(await scanAll(await archive(fixtures, transform)), baseline);
  }
});

test("validation rejects directory-only, non-JSON, and lookalike data roots", async () => {
  const directories = new JSZip();
  directories.folder("data/example/spawn_pool_world/herds");
  assert.equal((await validateFileStructure(await directories.generateAsync({ type: "nodebuffer" }))).valid, false);
  assert.equal((await validateFileStructure(await archive({ "data/example/spawn_pool_world/readme.txt": "not spawn JSON" }))).valid, false);
  assert.equal((await validateFileStructure(await archive(fixtures, (path) => path.replace(/^data\//, "metadata/")))).valid, false);
});

test("trainer validation agrees with parser namespaces and nesting", async () => {
  for (const namespace of ["rctmod", "example"]) {
    const file = await archive({ [`data/${namespace}/trainers/test.json`]: { team: [{ species: "ditto" }] } });
    assert.deepEqual((await validateFileStructure(file)).kinds, ["rctTrainer"]);
    assert.equal((await parseRctTrainersFromZip(file)).length, 1);
    const nested = await archive({ [`data/${namespace}/trainers/nested/test.json`]: { team: [] } });
    assert.equal((await validateFileStructure(nested)).valid, false);
    assert.deepEqual(await parseRctTrainersFromZip(nested), []);
  }
  const lootOnly = await archive({ "data/example/loot_table/trainers/test.json": { pools: [] } });
  assert.deepEqual((await validateFileStructure(lootOnly)).kinds, ["rctTrainer"]);
  assert.equal((await validateFileStructure({ size: MAX_ARCHIVE_BYTES + 1 })).valid, false);
});

test("validation accepts the old compressed cap and the new exact boundary", async () => {
  const file = await archive({ "data/example/species/ditto.json": { name: "Ditto" } });
  for (const size of [128 * 1024 ** 2, 128 * 1024 ** 2 + 1, MAX_ARCHIVE_BYTES]) {
    Object.defineProperty(file, "size", { value: size, configurable: true });
    assert.equal((await validateFileStructure(file)).valid, true);
  }
  Object.defineProperty(file, "size", { value: MAX_ARCHIVE_BYTES + 1 });
  const result = await validateFileStructure(file);
  assert.equal(result.valid, false);
  assert.match(result.reason, /512 MiB/);
});

test("ambiguous normalized paths are rejected by validation and every parser", async () => {
  const entries = {
    "data/example/species/ditto.json": { name: "Ditto" },
    "wrapper/data/example/species/ditto.json": { name: "Other" },
  };
  const file = await archive(entries);
  const validation = await validateFileStructure(file);
  assert.equal(validation.valid, false);
  assert.match(validation.reason, /Ambiguous archive path/);
  for (const parse of [parseCobblemonZip, parseSpeciesAndSpawnFromZip, parseLootFromZip, parseRctTrainersFromZip]) {
    await assert.rejects(parse(file), /Ambiguous archive path/);
  }
});
