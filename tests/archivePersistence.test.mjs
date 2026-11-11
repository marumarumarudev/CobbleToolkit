import { before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import getStorage from "../src/utils/indexedDBStorage.js";

let storage;
const metadata = (id, contentHash = id, allowRepairs = false) => ({
  id, contentHash, allowRepairs, name: "pack.zip", size: 3, uploadedAt: 1,
});
before(async () => {
  globalThis.indexedDB = indexedDB;
  globalThis.window = { indexedDB };
  storage = getStorage();
  await storage.ensureInitialized();
});
beforeEach(async () => { await storage.purgeSharedFiles(); });

test("blob survives reopening and hash/policy dedup retains ID and caches", async () => {
  await storage.persistSharedArchive(metadata("a"), new Blob(["one"]));
  await storage.markFileProcessed("spawnScanner", "a");
  storage.db.close();
  storage.isInitialized = false;
  const files = await storage.persistSharedArchive(metadata("b", "a"), new Blob(["one"]));
  assert.deepEqual(files.map(({ id }) => id), ["a"]);
  assert.equal((await storage.getProcessedFiles("spawnScanner")).has("a"), true);
  const loaded = await storage.loadSharedArchives();
  assert.equal(await loaded[0].file.text(), "one");
  assert.equal(loaded[0].name, "pack.zip");
  await storage.persistSharedArchive(metadata("c", "different"), new Blob(["two"]));
  await storage.persistSharedArchive(metadata("d", "a", true), new Blob(["one"]));
  assert.equal((await storage.loadSharedArchives()).length, 3);
});

test("legacy metadata remains unavailable and is never guessed by filename", async () => {
  await storage.appendSharedFile({ id: "legacy", name: "pack.zip" });
  assert.equal((await storage.loadSharedArchives())[0].file, null);
  await assert.rejects(storage.persistSharedArchive({ ...metadata("new"), reconnectId: "legacy" }, new Blob(["one"])), /unverified/);
  await storage.persistSharedArchive(metadata("new"), new Blob(["one"]));
  assert.deepEqual((await storage.loadSharedArchives()).map(({ id }) => id), ["legacy", "new"]);
});

test("concurrent uploads serialize without losing metadata", async () => {
  await Promise.all(["a", "b"].map((id) => storage.persistSharedArchive(metadata(id), new Blob([id]))));
  assert.equal((await storage.loadSharedArchives()).length, 2);
});

test("quota failure rolls back blob and metadata together", async () => {
  const original = storage.db.transaction;
  storage.db.transaction = function (...args) {
    const tx = original.apply(this, args);
    const objectStore = tx.objectStore;
    tx.objectStore = function (name) {
      const store = objectStore.call(this, name);
      if (name === "sharedFiles") store.put = () => { throw new DOMException("Storage full", "QuotaExceededError"); };
      return store;
    };
    return tx;
  };
  try {
    await assert.rejects(storage.persistSharedArchive(metadata("a"), new Blob(["one"])), { name: "QuotaExceededError" });
  } finally {
    storage.db.transaction = original;
  }
  assert.deepEqual(await storage.loadSharedArchives(), []);
  const rows = await new Promise((resolve) => {
    const request = storage.db.transaction("archiveBlobs").objectStore("archiveBlobs").getAll();
    request.onsuccess = () => resolve(request.result);
  });
  assert.deepEqual(rows, []);
});

test("archive limits include existing stored blobs and allow exact boundaries", async () => {
  const large = new Blob([new Uint8Array(128 * 1024 * 1024)]);
  await assert.rejects(storage.persistSharedArchive(metadata("oversize"), new Blob([large, "x"])), { name: "ArchiveLimitError" });
  await storage.persistSharedArchive(metadata("a"), large);
  await storage.persistSharedArchive(metadata("b"), large);
  await assert.rejects(storage.persistSharedArchive(metadata("c"), new Blob(["x"])), { name: "ArchiveLimitError" });
  assert.equal((await storage.loadSharedArchives()).length, 2);
  await storage.persistSharedArchive(metadata("duplicate", "a"), large);
});

test("single purge and clear remove blobs atomically with metadata", async () => {
  await storage.persistSharedArchive(metadata("a"), new Blob(["one"]));
  await storage.persistSharedArchive(metadata("b"), new Blob(["two"]));
  await storage.purgeSharedFiles("a");
  assert.deepEqual((await storage.loadSharedArchives()).map(({ id }) => id), ["b"]);
  await storage.purgeSharedFiles();
  assert.deepEqual(await storage.loadSharedArchives(), []);
  const tx = storage.db.transaction("archiveBlobs");
  const request = tx.objectStore("archiveBlobs").count();
  await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onabort = reject; });
  assert.equal(request.result, 0);
});
