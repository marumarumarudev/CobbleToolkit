import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { parseJsonWithFallbacks } from "../src/utils/parseJson.js";
import { parseCobblemonZip } from "../src/utils/spawnParser.js";
import { parseSpeciesAndSpawnFromZip } from "../src/utils/speciesSpawnParser.js";
import { parseLootFromZip } from "../src/utils/lootParser.js";
import { parseRctTrainersFromZip } from "../src/utils/rctTrainerParser.js";
import { ARCHIVE_LIMITS, checkArchiveBudget, createArchiveSession, loadArchive, readArchiveText, ProcessingBudgetError } from "../src/utils/archiveProcessing.js";

test("archive sessions reuse one validated ZIP and require the original owner", async (t) => {
  const file = await archive({ "data/example/species/test.json": '{"name":"ditto"}' });
  const loader = t.mock.method(JSZip, "loadAsync");
  const archiveSession = await createArchiveSession(file);
  const zip = await loadArchive(file, { archiveSession });
  assert.strictEqual(await loadArchive(file, { archiveSession }), zip);
  assert.equal(loader.mock.callCount(), 1);
  await parseSpeciesAndSpawnFromZip(file, { archiveSession });
  await parseLootFromZip(file, { archiveSession });
  assert.equal(loader.mock.callCount(), 1);
  await assert.rejects(loadArchive(Buffer.from(file), { archiveSession }), /different file/);
  for (const fake of [{}, { owner: file, zip }, Object.create(Object.getPrototypeOf(archiveSession)), null]) {
    await assert.rejects(loadArchive(file, { archiveSession: fake }), /Invalid archive session/);
  }
});

test("archive sessions still check cancellation on creation and reuse", async () => {
  const file = await archive({ "data/example/species/test.json": '{"name":"ditto"}' });
  const archiveSession = await createArchiveSession(file);
  const controller = new AbortController();
  controller.abort();
  const options = { signal: controller.signal, archiveSession };
  await assert.rejects(loadArchive(file, options), { name: "AbortError" });
  await assert.rejects(createArchiveSession(file, options), { name: "AbortError" });
  await assert.rejects(parseSpeciesAndSpawnFromZip(file, options), { name: "AbortError" });
  await assert.rejects(parseLootFromZip(file, options), { name: "AbortError" });
  await assert.rejects(createArchiveSession({ size: 128 * 1024 ** 2 + 1 }), ProcessingBudgetError);
});

test("streamed text preserves split UTF-8 and BOM at the exact byte limit", async () => {
  const text = "\uFEFF" + "a".repeat(16380) + "😀" + "b".repeat(ARCHIVE_LIMITS.json - 16387);
  assert.equal(Buffer.byteLength(text), ARCHIVE_LIMITS.json);
  const zip = await loadArchive(await archive({ "test.json": text }));
  assert.equal(await readArchiveText(zip.files["test.json"]), text);
});

test("forged ZIP sizes hit the actual byte limit before full inflation", async (t) => {
  const zip = new JSZip();
  zip.file("data/example/species/bomb.json", " ".repeat(40 * 1024 ** 2), { createFolders: false });
  const file = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const central = file.indexOf(Buffer.from([80, 75, 1, 2]));
  assert.ok(central >= 0);
  file.writeUInt32LE(1, central + 24);
  const loaded = await loadArchive(file);
  const entry = Object.values(loaded.files)[0];
  const original = entry.internalStream.bind(entry);
  let stream;
  let emitted = 0;
  t.mock.method(entry, "internalStream", (...args) => {
    stream = original(...args);
    stream.on("data", (chunk) => { emitted += chunk.byteLength; });
    return stream;
  });
  await assert.rejects(readArchiveText(entry), { name: "ProcessingBudgetError", message: "JSON entry exceeds 10 MiB" });
  assert.ok(emitted > ARCHIVE_LIMITS.json);
  assert.ok(emitted < 40 * 1024 ** 2);
  assert.equal(stream._worker.isFinished, true);
  for (const parse of [parseSpeciesAndSpawnFromZip, parseLootFromZip]) {
    await assert.rejects(parse(file), ProcessingBudgetError);
  }
  // Unrelated entries are not inflated by a scanner that does not read them.
  assert.deepEqual(await parseCobblemonZip(file), []);
});

test("streamed extraction aborts during delivery and removes its signal listener", async (t) => {
  const zip = await loadArchive(await archive({ "test.json": "a".repeat(100000) }));
  const entry = zip.files["test.json"];
  const controller = new AbortController();
  const remove = t.mock.method(controller.signal, "removeEventListener");
  const original = entry.internalStream.bind(entry);
  let stream;
  t.mock.method(entry, "internalStream", (...args) => {
    stream = original(...args);
    stream.on("data", () => controller.abort());
    return stream;
  });
  await assert.rejects(readArchiveText(entry, { signal: controller.signal }), { name: "AbortError" });
  assert.equal(stream._worker.isFinished, true);
  assert.equal(remove.mock.callCount(), 1);
  await assert.rejects(readArchiveText(entry, { signal: controller.signal }), { name: "AbortError" });
});

test("actual archive bytes are shared across entries without double-charging session rereads", async (t) => {
  const chunk = new Uint8Array(1024 ** 2);
  const entry = (chunks, final = chunk) => ({
    _data: { uncompressedSize: 1 },
    internalStream() {
      const handlers = {};
      let paused = false;
      return {
        on(event, callback) { handlers[event] = callback; return this; },
        pause() { paused = true; },
        resume() {
          for (let i = 0; i < chunks && !paused; i++) handlers.data(i === chunks - 1 ? final : chunk);
          if (!paused) handlers.end();
        },
      };
    },
  });
  // Small reusable chunks exercise the real 512 MiB threshold without storing
  // a giant ZIP or retaining all its decoded entries simultaneously.
  const entries = Array.from({ length: 51 }, () => entry(10));
  entries.push(entry(2), entry(1, new Uint8Array(1)));
  t.mock.method(JSZip, "loadAsync", async () => ({ files: Object.fromEntries(entries.map((value, i) => [`${i}.json`, value])) }));
  const file = new Uint8Array();
  const archiveSession = await createArchiveSession(file);
  const zip = await loadArchive(file, { archiveSession });
  await readArchiveText(zip.files["0.json"]);
  await readArchiveText(zip.files["0.json"]);
  for (let i = 1; i <= 51; i++) await readArchiveText(zip.files[`${i}.json`]);
  await assert.rejects(readArchiveText(zip.files["52.json"]), {
    name: "ProcessingBudgetError", message: "Archive exceeds 512 MiB uncompressed",
  });
  await assert.rejects(readArchiveText(zip.files["0.json"]), ProcessingBudgetError);
});

test("stream errors reject and pause-only helpers stop without private cancellation", async () => {
  for (const abort of [false, true]) {
    const controller = new AbortController();
    const handlers = {};
    let paused = false;
    const error = new Error("broken stream");
    const stream = {
      on(event, callback) { handlers[event] = callback; return this; },
      pause() { paused = true; },
      resume() {
        if (abort) controller.abort();
        else handlers.error(error);
        handlers.end();
      },
    };
    const entry = { internalStream: () => stream };
    await assert.rejects(readArchiveText(entry, { signal: controller.signal }),
      abort ? { name: "AbortError" } : (observed) => observed === error);
    assert.equal(paused, true);
  }
});

// Synthetic edge cases, not verified upstream 1.8 fixtures.
async function archive(files) {
  const zip = new JSZip();
  for (const [path, value] of Object.entries(files)) zip.file(path, value);
  return zip.generateAsync({ type: "nodebuffer" });
}
test("trainer-only archives are a successful spawn no-op, not a scan failure", async () => {
  const file = await archive({ "data/rctmod/trainers/fixture.json": JSON.stringify({ team: [{ species: "ditto" }] }) });
  const notices = [];
  assert.deepEqual(await parseCobblemonZip(file, { onDiagnostic: (notice) => notices.push(notice) }), []);
  assert.deepEqual(notices, []);
  await assert.rejects(parseCobblemonZip(Buffer.from("not a ZIP")));
  await assert.rejects(parseCobblemonZip(await archive({})), /archive is empty/i);
});

test("strict parsing disables both repair and extraction", () => {
  const notices = [];
  const options = { allowRepair: false, onDiagnostic: (d) => notices.push(d), extractFallback: () => { throw new Error("must not run"); } };
  assert.equal(parseJsonWithFallbacks('{"name":"ditto",}', "strict", options), null);
  assert.equal(notices[0].code, "invalid-json");
  assert.deepEqual(parseJsonWithFallbacks('{"name":"ditto",}'), { name: "ditto" });
  notices.length = 0;
  assert.deepEqual(parseJsonWithFallbacks("broken", "fallback", { onDiagnostic: (d) => notices.push(d), extractFallback: () => ({ name: "ditto" }) }), { name: "ditto" });
  assert.equal(notices[0].code, "fallback-json");
});
test("all parsers propagate cancellation before archive loading", async () => {
  const controller = new AbortController();
  controller.abort();
  for (const parse of [parseCobblemonZip, parseSpeciesAndSpawnFromZip, parseLootFromZip, parseRctTrainersFromZip]) {
    await assert.rejects(parse(new Uint8Array(), { signal: controller.signal }), { name: "AbortError" });
  }
});
test("archive budgets apply to raw entries and compressed input", async () => {
  await assert.rejects(loadArchive({ size: 128 * 1024 ** 2 + 1 }), ProcessingBudgetError);
  assert.throws(() => checkArchiveBudget({ files: { huge: { name: "huge.json", _data: { uncompressedSize: 10 * 1024 ** 2 + 1 } } } }), ProcessingBudgetError);
  assert.throws(() => checkArchiveBudget({ files: Object.fromEntries(Array.from({ length: 50001 }, (_, i) => [i, { dir: true }])) }), ProcessingBudgetError);
  assert.throws(() => checkArchiveBudget({ files: { huge: { name: "huge.bin", _data: { uncompressedSize: 512 * 1024 ** 2 + 1 } } } }), ProcessingBudgetError);
});
test("malformed herds never fabricate species; mixed valid members survive", async () => {
  const notices = [];
  const file = await archive({ "data/example/spawn_pool_world/herds/test.json": JSON.stringify({ spawns: [
    { id: "not-a-species", type: "pokemon-herd" },
    { id: "also-not", type: "pokemon-herd", herdablePokemon: [] },
    { type: "pokemon-herd", herdablePokemon: [null, {}, { pokemon: "ditto", isLeader: false }] },
  ] }) });
  const rows = await parseCobblemonZip(file, { onDiagnostic: (d) => notices.push(d) });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].pokemon, "ditto");
  assert.equal(rows[0].isLeader, "false");
  assert.equal(notices.length, 4);
});
test("species without drops is normal; mixed failures retain good rows", async () => {
  const notices = [];
  const file = await archive({
    "data/example/species/good.json": '{"name":"ditto"}',
    "data/example/species/bad.json": "not json",
  });
  assert.equal((await parseSpeciesAndSpawnFromZip(file, { allowRepair: false })).length, 1);
  assert.deepEqual(await parseLootFromZip(file, { allowRepair: false, onDiagnostic: (d) => notices.push(d) }), []);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].code, "invalid-json");
});
test("cancellation during entry processing propagates", async () => {
  const controller = new AbortController();
  const file = await archive({ "data/example/spawn_pool_world/test.json": '{"spawns":[null,{"pokemon":"ditto"}]}' });
  await assert.rejects(parseCobblemonZip(file, { signal: controller.signal, onDiagnostic: () => controller.abort() }), { name: "AbortError" });
});

test("repair diagnostic callbacks cannot swallow cancellation or budget errors", () => {
  for (const error of [Object.assign(new Error("cancelled"), { name: "AbortError" }), new ProcessingBudgetError("test budget")]) {
    assert.throws(() => parseJsonWithFallbacks('{"name":"ditto",}', "repair", {
      onDiagnostic: () => { throw error; },
    }), (observed) => observed === error);
  }
});

test("nested loot and team row loops enforce the cumulative budget", async () => {
  const many = Array(500001).fill({});
  for (const [parse, files] of [
    [parseLootFromZip, { "data/example/species/test.json": JSON.stringify({ name: "ditto", drops: { entries: many } }) }],
    [parseRctTrainersFromZip, { "data/example/trainers/test.json": JSON.stringify({ team: many }) }],
    [parseRctTrainersFromZip, {
      "data/example/trainers/test.json": '{"team":[]}',
      "data/example/loot_table/trainers/single/test.json": JSON.stringify({ pools: [{ entries: many }] }),
    }],
  ]) {
    const diagnostics = [];
    await assert.rejects(parse(await archive(files), { onDiagnostic: (d) => diagnostics.push(d) }), { name: "ProcessingBudgetError", message: "Parser exceeds 500,000 rows" });
    assert.equal(diagnostics.length, 0);
  }
});

test("species form identity lookups grow linearly and preserve duplicate ordering", async (t) => {
  const forms = Array.from({ length: 2000 }, (_, i) => ({ name: `form${i}` }));
  const file = await archive({
    "data/example/species/base.json": JSON.stringify({ name: "ditto", forms: [
      { name: "duplicate", riding: { first: true } }, { name: "duplicate", riding: { second: true } },
    ] }),
    "data/example/species_additions/patch.json": JSON.stringify({ target: "ditto", forms: [
      ...forms, { name: "duplicate", riding: { patched: true } },
      { name: "form0", riding: { repeated: true } },
    ] }),
  });
  const trim = String.prototype.trim;
  let calls = 0;
  t.mock.method(String.prototype, "trim", function () {
    if (String(this).startsWith("form")) calls++;
    return trim.call(this);
  });
  const rows = await parseSpeciesAndSpawnFromZip(file);
  assert.ok(calls < forms.length * 20, `Expected linear lookups, got ${calls}`);
  assert.equal(rows.length, forms.length + 3);
  assert.deepEqual(rows[1].riding, { first: true, patched: true });
  assert.deepEqual(rows[2].riding, { second: true });
  assert.deepEqual(rows[3].riding, { repeated: true });
  assert.equal(rows.at(-1).name, "form1999 ditto");
});

test("species ingestion and merging budget invalid and repeatedly overwritten forms", async () => {
  for (const forms of [Array(500001).fill(null), Array(180000).fill({ name: "same" })]) {
    const notices = [];
    const file = await archive({
      "data/example/species_additions/patch.json": JSON.stringify({ target: "ditto", forms }),
    });
    await assert.rejects(parseSpeciesAndSpawnFromZip(file, { onDiagnostic: (d) => notices.push(d) }), ProcessingBudgetError);
    assert.deepEqual(notices, []);
  }
});

test("timer cancellation interrupts form merging before output", async (t) => {
  const forms = Array.from({ length: 20000 }, (_, i) => ({ name: `form${i}` }));
  const file = await archive({
    "data/example/species_additions/patch.json": JSON.stringify({ target: "ditto", forms }),
  });
  const controller = new AbortController();
  const trim = String.prototype.trim;
  let timer;
  t.mock.method(String.prototype, "trim", function () {
    // Form identity is evaluated during merging, after ingestion.
    if (String(this) === "form0" && timer === undefined) timer = setTimeout(() => controller.abort(), 0);
    return trim.call(this);
  });
  try {
    await assert.rejects(parseSpeciesAndSpawnFromZip(file, { signal: controller.signal }), { name: "AbortError" });
    assert.notEqual(timer, undefined);
  } finally {
    clearTimeout(timer);
  }
});

test("timer cancellation is observed while processing large row loops", async () => {
  const many = Array(20000).fill({});
  for (const [parse, path, value] of [
    [parseCobblemonZip, "spawn_pool_world/test", { spawns: many.map(() => ({ pokemon: "ditto" })) }],
    [parseSpeciesAndSpawnFromZip, "species/test", { name: "ditto", forms: many }],
    [parseLootFromZip, "species/test", { name: "ditto", drops: { entries: many } }],
    [parseRctTrainersFromZip, "trainers/test", { team: many }],
  ]) {
    const file = await archive({ [`data/example/${path}.json`]: JSON.stringify(value).replace(/}$/, ",}") });
    const controller = new AbortController();
    let timer;
    try {
      await assert.rejects(parse(file, {
        signal: controller.signal,
        onDiagnostic: () => { timer ??= setTimeout(() => controller.abort(), 0); },
      }), { name: "AbortError" });
    } finally {
      clearTimeout(timer);
    }
  }
});
