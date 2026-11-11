import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import JSZip from "jszip";
import { parseCobblemonZip } from "../src/utils/spawnParser.js";

const root = new URL("./fixtures/upstream/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
const fixture = (name) => readFile(new URL(name, root));

async function parseFixtures(names) {
  const zip = new JSZip();
  for (const name of names) {
    const source = manifest.files.find((entry) => entry.file === name);
    assert.ok(source, `Missing attribution for ${name}`);
    zip.file(source.archivePath, await fixture(name));
  }
  const diagnostics = [];
  const rows = await parseCobblemonZip(await zip.generateAsync({ type: "nodebuffer" }), {
    allowRepair: false,
    onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
  });
  assert.deepEqual(diagnostics, []);
  return rows;
}

test("official 1.8.0 fixture bytes match pinned source hashes", async () => {
  assert.equal(manifest.commit, "b33536e8721c9419d664fee15aa9e35cbf1900a8");
  assert.equal(manifest.version, "1.8.0");
  for (const source of manifest.files) {
    const bytes = await fixture(source.file);
    assert.doesNotThrow(() => JSON.parse(bytes.toString("utf8")));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), source.gitBlobSha1);
    assert.ok(source.url.startsWith("https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/"));
    assert.ok(source.url.endsWith(`?ref=${manifest.commit}`));
  }
});

test("official Bulbasaur herd expands members in strict mode without losing metadata", async () => {
  const rows = await parseFixtures(["0001_bulbasaur_herd.json"]);
  assert.deepEqual(rows.map(({ pokemon, level, weight, memberMaxTimes, levelRangeOffset }) =>
    ({ pokemon, level, weight, memberMaxTimes, levelRangeOffset })), [
    { pokemon: "bulbasaur", level: "8-29", weight: "80", memberMaxTimes: "7", levelRangeOffset: "-3-3" },
    { pokemon: "ivysaur", level: "18-37", weight: "18", memberMaxTimes: "2", levelRangeOffset: "-2-4" },
    { pokemon: "venusaur", level: "33-48", weight: "2", memberMaxTimes: "1", levelRangeOffset: "-1-5" },
  ]);
  for (const row of rows) {
    assert.equal(row.spawnId, "bulbasaur-herd-1");
    assert.equal(row.spawnType, "pokemon-herd");
    assert.equal(row.maxHerdSize, "4");
    assert.equal(row.herdLevelRange, "5-53");
    assert.equal(row.herdWeight, "50");
    assert.equal(row.isLeader, "false");
    assert.equal(row.isFollower, "true");
    assert.equal(row.bucket, "ultra-rare");
    assert.equal(row.spawnablePositionType, "grounded");
    assert.equal(row.biomes, "#cobblemon:is_jungle");
    assert.equal(row.lightLevel, "8-15");
  }
});

test("official solo entries remain separate from herds and bait files", async () => {
  const solo = await parseFixtures(["0001_bulbasaur.json"]);
  assert.equal(solo.length, 2);
  assert.deepEqual(solo.map((row) => row.spawnId), ["bulbasaur-1", "bulbasaur-2"]);
  assert.deepEqual(solo.map((row) => row.isPokeSnack), ["", "true"]);
  for (const row of solo) {
    assert.equal(row.pokemon, "bulbasaur");
    assert.equal(row.level, "5-32");
    assert.equal(row.weight, "30");
    assert.equal(row.spawnType, "pokemon");
    assert.equal(row.herdLevelRange, "");
    assert.equal(row.isFollower, "");
  }
  const spawns = ["0001_bulbasaur.json", "0001_bulbasaur_herd.json"];
  const baseline = await parseFixtures(spawns);
  assert.equal(baseline.length, 5);
  assert.deepEqual(await parseFixtures([...spawns, "poke_bait.json", "sweet_heart.json"]), baseline);
});

test("official bait samples retain empty and nonempty effect definitions", async () => {
  assert.deepEqual(JSON.parse(await fixture("poke_bait.json")), {
    item: "cobblemon:poke_bait", effects: [],
  });
  assert.deepEqual(JSON.parse(await fixture("sweet_heart.json")), {
    item: "cobblemon:sweet_heart",
    effects: [{ type: "cobblemon:friendship", chance: 1, value: 35 }],
  });
});
