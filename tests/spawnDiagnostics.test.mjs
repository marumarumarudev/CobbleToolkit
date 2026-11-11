import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { parseCobblemonZip } from "../src/utils/spawnParser.js";
import { createParseDiagnostics } from "../src/utils/parseDiagnostics.js";

async function archive(files) {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) {
    zip.file(`data/example/spawn_pool_world/${name}.json`, content);
  }
  return zip.generateAsync({ type: "nodebuffer" });
}

const valid = { spawns: [{ id: "fixture", pokemon: "ditto", bucket: "common", level: "5", weight: 1 }] };

test("strict JSON produces the same rows without diagnostics", async () => {
  const file = await archive({ valid: JSON.stringify(valid) });
  const collector = createParseDiagnostics();
  const observed = await parseCobblemonZip(file, { onDiagnostic: collector.record });
  assert.deepEqual(observed, await parseCobblemonZip(file));
  assert.equal(observed.length, 1);
  assert.equal(collector.snapshot().total, 0);
});

test("legacy formatting repair preserves output but now reports its path", async (t) => {
  t.mock.method(console, "log", () => {});
  const file = await archive({ repaired: JSON.stringify(valid).replace(/}$/, ",}") });
  const collector = createParseDiagnostics();
  const rows = await parseCobblemonZip(file, { onDiagnostic: collector.record });
  assert.deepEqual(rows, await parseCobblemonZip(await archive({ repaired: JSON.stringify(valid) })));
  const diagnostics = collector.snapshot();
  assert.equal(diagnostics.total, 1);
  assert.equal(diagnostics.repairCount, 1);
  assert.equal(diagnostics.skipCount, 0);
  assert.equal(diagnostics.entries[0].code, "repaired-json");
  assert.equal(diagnostics.entries[0].path, "data/example/spawn_pool_world/repaired.json");
});

test("mixed valid and skipped content retains good rows and reports every skip category", async (t) => {
  t.mock.method(console, "warn", () => {});
  const file = await archive({
    valid: JSON.stringify(valid),
    broken: "not JSON at all",
    structure: "{}",
    entry: '{"spawns":[null]}',
    empty: "",
  });
  const collector = createParseDiagnostics();
  const rows = await parseCobblemonZip(file, { onDiagnostic: collector.record });
  assert.equal(rows.length, 1);
  const diagnostics = collector.snapshot();
  assert.equal(diagnostics.total, 4);
  assert.equal(diagnostics.skipCount, 4);
  assert.deepEqual(diagnostics.entries.map(({ code }) => code).sort(),
    ["empty-file", "invalid-entry", "invalid-json", "invalid-structure"]);
});

test("zero-row malformed archive still has diagnostics for a persisted warning report", async (t) => {
  t.mock.method(console, "warn", () => {});
  const collector = createParseDiagnostics();
  const rows = await parseCobblemonZip(await archive({ broken: "not JSON" }), { onDiagnostic: collector.record });
  assert.deepEqual(rows, []);
  assert.equal(collector.snapshot().total, 1);
});

test("diagnostic retention is bounded while counts and snapshots remain complete", () => {
  const collector = createParseDiagnostics(2);
  collector.record({ path: "one.json", code: "repaired-json", message: "Repair used." });
  collector.record({ path: "two.json", code: "invalid-json", message: "Skipped." });
  const before = collector.snapshot();
  collector.record({ path: "three.json", code: "invalid-json", message: "Skipped." });
  const after = collector.snapshot();
  assert.equal(after.total, 3);
  assert.equal(after.entries.length, 2);
  assert.equal(after.omittedCount, 1);
  assert.equal(after.repairCount, 1);
  assert.equal(after.skipCount, 2);
  assert.equal(before.total, 2);
  after.entries[0].path = "changed";
  assert.equal(collector.snapshot().entries[0].path, "one.json");
});
