import { before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import getStorage from "../src/utils/indexedDBStorage.js";
import { createScannerCoordinator } from "../src/utils/scannerCoordinator.js";
import {
  ARCHIVE_UNAVAILABLE_MESSAGE,
  restoreSharedFiles,
  getUnavailableArchives,
  storageFailureMessage,
} from "../src/utils/archiveAvailability.js";

let storage;
const stores = ["sharedFiles", "spawnReports", "speciesData", "lootReports", "trainerReports", "processedFilesTracking"];
const file = (id) => ({ id, name: "pack.zip", size: 100, uploadedAt: 1 });
const update = (storeName, id) => ({
  storeName,
  merge: (current) => [...current, { sharedFileId: id, name: "pack.zip", value: id }],
});
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

before(async () => {
  globalThis.indexedDB = indexedDB;
  globalThis.window = { indexedDB };
  storage = getStorage();
  await storage.ensureInitialized();
});
beforeEach(async () => {
  await Promise.all(stores.map((name) => storage.clearStore(name)));
  await storage.saveData("sharedFiles", [file("a"), file("b")]);
});

test("reload retains cached results but identifies archives an unscanned tool needs", async () => {
  await storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true);
  const restored = restoreSharedFiles(await storage.loadData("sharedFiles"));
  assert.equal(restored.every((entry) => entry.file === null), true);
  const spawnProcessed = await storage.getProcessedFiles("spawnScanner");
  assert.deepEqual(getUnavailableArchives(restored, spawnProcessed).map(({ id }) => id), ["b"]);
  const trainerProcessed = await storage.getProcessedFiles("rctTrainerScanner");
  assert.deepEqual(getUnavailableArchives(restored, trainerProcessed).map(({ id }) => id), ["a", "b"]);
  assert.equal((await storage.loadData("spawnReports")).length, 1);
  assert.deepEqual([...await storage.getProcessedFiles("rctTrainerScanner")], []);
  assert.match(ARCHIVE_UNAVAILABLE_MESSAGE, /Archive unavailable.*re-upload/);
});

test("restoring metadata preserves only locally available archives by ID", () => {
  const archive = new Blob(["archive"]);
  const restored = restoreSharedFiles([file("a"), file("b")], [{ ...file("b"), file: archive }]);
  assert.equal(restored[0].file, null);
  assert.equal(restored[1].file.size, archive.size);
    assert.equal(restored[1].file.name, "pack.zip");
  assert.deepEqual(getUnavailableArchives(restored, new Set()).map(({ id }) => id), ["a"]);
  assert.deepEqual(getUnavailableArchives(restored, new Set(["a"])), []);
});

test("quota failure keeps metadata unchanged and provides actionable copy", async () => {
  const db = storage.db;
  const transaction = db.transaction;
  db.transaction = function (...args) {
    const tx = transaction.apply(this, args);
    const objectStore = tx.objectStore;
    tx.objectStore = function (name) {
      const store = objectStore.call(this, name);
      if (name === "sharedFiles") {
        store.put = () => { throw new DOMException("Quota exhausted", "QuotaExceededError"); };
      }
      return store;
    };
    return tx;
  };
  try {
    await assert.rejects(storage.appendSharedFile(file("c")), (error) => {
      assert.equal(error.name, "QuotaExceededError");
      const message = storageFailureMessage(error, 'save "pack.zip"');
      assert.match(message, /Browser storage is full/);
      assert.match(message, /Remove unneeded files and cached results/);
      assert.match(message, /try again/);
      return true;
    });
  } finally {
    db.transaction = transaction;
  }
  assert.deepEqual((await storage.loadData("sharedFiles")).map(({ id }) => id), ["a", "b"]);
});

test("non-quota failure does not claim browser storage is full", () => {
  assert.doesNotMatch(storageFailureMessage(new Error("write failed"), "save file"), /storage is full/);
});

test("queue serializes concurrent additions and recovers after rejection", async () => {
  const coordinator = createScannerCoordinator();
  const gate = deferred();
  let current = [];
  const add = (id) => coordinator.enqueue(async () => {
    if (id === "a") await gate.promise;
    const next = [...current, id];
    await Promise.resolve();
    current = next;
  });
  const a = add("a");
  const b = add("b");
  gate.resolve();
  await Promise.all([a, b]);
  assert.deepEqual(current, ["a", "b"]);
  await assert.rejects(coordinator.enqueue(() => { throw new Error("failed mutation"); }));
  await add("c");
  assert.deepEqual(current, ["a", "b", "c"]);
});

test("warning-only reports survive reload with diagnostics and processed tracking", async () => {
  const diagnostics = {
    total: 1, repairCount: 0, skipCount: 1, omittedCount: 0,
    entries: [{ path: "data/example/spawn_pool_world/broken.json", code: "invalid-json", message: "JSON parsing and all repairs failed." }],
  };
  await storage.commitScannerFile("spawnScanner", "a", [{
    storeName: "spawnReports",
    merge: (current) => [{ id: "warning-report", sharedFileId: "a", name: "pack.zip", data: [], diagnostics }, ...current],
  }], () => true);
  const reports = await storage.loadData("spawnReports");
  assert.deepEqual(reports[0].diagnostics, diagnostics);
  assert.deepEqual(reports[0].data, []);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), true);
});

test("reports and processed tracking commit together", async () => {
  const result = await storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true);
  assert.equal(result.spawnReports[0].sharedFileId, "a");
  assert.deepEqual(await storage.loadData("spawnReports"), result.spawnReports);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), true);
});

test("multi-store save failure rolls back all results and tracking", async () => {
  await assert.rejects(storage.commitScannerFile("speciesLootScanner", "a", [
    update("speciesData", "a"),
    { storeName: "lootReports", merge: () => { throw new Error("quota/save failure"); } },
  ], () => true), /quota\/save failure/);
  assert.deepEqual(await storage.loadData("speciesData"), []);
  assert.deepEqual(await storage.loadData("lootReports"), []);
  assert.equal((await storage.getProcessedFiles("speciesLootScanner")).has("a"), false);
  await storage.commitScannerFile("speciesLootScanner", "a", [update("speciesData", "a"), update("lootReports", "a")], () => true);
  assert.equal((await storage.getProcessedFiles("speciesLootScanner")).has("a"), true);
});

test("uncloneable results abort instead of marking processed", async () => {
  await assert.rejects(storage.commitScannerFile("spawnScanner", "a", [
    { storeName: "spawnReports", merge: () => [() => {}] },
  ], () => true));
  assert.deepEqual(await storage.loadData("spawnReports"), []);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), false);
});

test("generation invalidation rejects an in-flight parser's eventual commit", async () => {
  const coordinator = createScannerCoordinator();
  const generation = coordinator.getGeneration();
  const gate = deferred();
  const parse = async () => {
    await gate.promise;
    return coordinator.enqueue(() => storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")],
      () => generation === coordinator.getGeneration()));
  };
  const pending = parse();
  coordinator.invalidate();
  await coordinator.enqueue(() => storage.purgeSharedFiles("a"));
  gate.resolve();
  await assert.rejects(pending, { name: "AbortError" });
  assert.deepEqual(await storage.loadData("spawnReports"), []);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), false);
});

test("commit verifies current metadata even without a generation guard", async () => {
  await storage.purgeSharedFiles("a");
  await assert.rejects(storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true), { name: "AbortError" });
  assert.deepEqual(await storage.loadData("spawnReports"), []);
});

test("same filename contributions are independent and removal is atomic", async () => {
  await storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true);
  await storage.commitScannerFile("spawnScanner", "b", [update("spawnReports", "b")], () => true);
  const remaining = await storage.purgeSharedFiles("a");
  assert.deepEqual(remaining.map((item) => item.id), ["b"]);
  assert.deepEqual((await storage.loadData("spawnReports")).map((item) => item.sharedFileId), ["b"]);
  assert.deepEqual([...await storage.getProcessedFiles("spawnScanner")], ["b"]);
});

test("legacy cached reports still purge by filename", async () => {
  await storage.saveData("speciesData", [{ sourceFile: "pack.zip", name: "Ditto" }]);
  await storage.purgeSharedFiles("a");
  assert.deepEqual(await storage.loadData("speciesData"), []);
});

test("clear queued after a commit removes all results and tracking", async () => {
  const coordinator = createScannerCoordinator();
  await Promise.all([
    coordinator.enqueue(() => storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true)),
    coordinator.enqueue(() => storage.purgeSharedFiles()),
  ]);
  for (const name of stores) {
    if (name === "processedFilesTracking") continue;
    assert.deepEqual(await storage.loadData(name), []);
  }
  assert.deepEqual([...await storage.getProcessedFiles("spawnScanner")], []);
});

test("failed purge rolls back metadata, reports, and tracking", async () => {
  await storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true);
  // A malformed legacy species entry triggers the legacy matcher to throw.
  const { TOOL_DATA_STORES } = await import("../src/utils/toolDataStores.js");
  const descriptor = TOOL_DATA_STORES.find(({ store }) => store === "speciesData");
  const original = descriptor.matchesFile;
  descriptor.matchesFile = () => { throw new Error("purge failure"); };
  await storage.saveData("speciesData", [{ sourceFile: "pack.zip" }]);
  try {
    await assert.rejects(storage.purgeSharedFiles("a"), /purge failure/);
  } finally {
    descriptor.matchesFile = original;
  }
  assert.equal((await storage.loadData("sharedFiles")).length, 2);
  assert.equal((await storage.loadData("spawnReports")).length, 1);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), true);
});

test("concurrent duplicate commits do not duplicate contributions", async () => {
  await Promise.all([
    storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true),
    storage.commitScannerFile("spawnScanner", "a", [update("spawnReports", "a")], () => true),
  ]);
  assert.equal((await storage.loadData("spawnReports")).length, 1);
});

test("concurrent metadata appends preserve both additions", async () => {
  await Promise.all([storage.appendSharedFile(file("c")), storage.appendSharedFile(file("d"))]);
  assert.deepEqual((await storage.loadData("sharedFiles")).map((item) => item.id), ["a", "b", "c", "d"]);
});

test("metadata append uses persisted state rather than resurrecting removed files", async () => {
  await storage.purgeSharedFiles("a");
  await storage.appendSharedFile(file("c"));
  assert.deepEqual((await storage.loadData("sharedFiles")).map((item) => item.id), ["b", "c"]);
});

test("successful empty parse can be tracked without invented reports", async () => {
  assert.deepEqual(await storage.commitScannerFile("spawnScanner", "a", [], () => true), {});
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), true);
  assert.deepEqual(await storage.loadData("spawnReports"), []);
});
