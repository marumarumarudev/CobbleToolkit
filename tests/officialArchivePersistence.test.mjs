import { before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB } from 'fake-indexeddb';
import getStorage from '../src/utils/indexedDBStorage.js';
import { TOOL_DATA_STORES, SCANNER_NAMES } from '../src/utils/toolDataStores.js';

let storage;
const meta = (id, source = 'official-cobblemon') => ({ id, source, contentHash: 'same', allowRepairs: false, name: 'same.jar', uploadedAt: 1, officialVersion: '1.7.3', officialVersionId: 'kF7CvxTo' });
const put = async (id) => { const snapshot = await storage.getOfficialArchiveSnapshot(); return storage.replaceOfficialArchive(meta(id), new Blob([id]), { expectedOfficialId: snapshot.id, expectedOfficialRevision: snapshot.revision }); };
before(async () => { globalThis.indexedDB = indexedDB; globalThis.window = { indexedDB }; storage = getStorage(); await storage.ensureInitialized(); });
beforeEach(async () => storage.purgeSharedFiles());

test('replacement preserves manual archives and results even with identical names and hashes', async () => {
  await storage.persistSharedArchive(meta('manual', undefined), new Blob(['manual']));
  // Deliberately omit source for a normal upload.
  await storage.purgeSharedFiles();
  const manual = meta('manual'); delete manual.source;
  await storage.persistSharedArchive(manual, new Blob(['manual']));
  await put('old');
  for (const { store } of TOOL_DATA_STORES) await storage.saveData(store, [{ sharedFileId: 'old', name: 'same.jar' }, { sharedFileId: 'manual', name: 'same.jar' }, { name: 'same.jar', legacy: true }]);
  for (const scanner of SCANNER_NAMES) { await storage.markFileProcessed(scanner, 'old'); await storage.markFileProcessed(scanner, 'manual'); }
  await put('new');
  const files = await storage.loadSharedArchives();
  assert.deepEqual(files.map(f => f.id), ['manual', 'new']);
  assert.equal(await files[0].file.text(), 'manual');
  for (const { store } of TOOL_DATA_STORES) assert.deepEqual(await storage.loadData(store), [{ sharedFileId: 'manual', name: 'same.jar' }, { name: 'same.jar', legacy: true }]);
  for (const scanner of SCANNER_NAMES) assert.deepEqual([...await storage.getProcessedFiles(scanner)], ['manual']);
});

test('manual upload does not reconnect to managed hash, in either order', async () => {
  await put('official');
  const manual = meta('manual'); delete manual.source;
  await storage.persistSharedArchive(manual, new Blob(['manual']));
  const files = await storage.loadSharedArchives();
  assert.deepEqual(files.map(f => f.id), ['official', 'manual']);
  assert.equal(await files[0].file.text(), 'official');
  await storage.persistSharedArchive({ ...manual, id: 'duplicate' }, new Blob(['manual']));
  assert.equal((await storage.loadSharedArchives()).length, 2);
});

test('quota/write failure rolls back old blob, data, tracking, and revision', async () => {
  await put('old');
  await storage.saveData('spawnReports', [{ sharedFileId: 'old' }]);
  await storage.markFileProcessed('spawnScanner', 'old');
  const snapshot = await storage.getOfficialArchiveSnapshot();
  const original = storage.db.transaction;
  storage.db.transaction = function (...args) {
    const tx = original.apply(this, args); const objectStore = tx.objectStore;
    tx.objectStore = function (name) { const store = objectStore.call(this, name); if (name === 'archiveBlobs') store.put = () => { throw new DOMException('Full', 'QuotaExceededError'); }; return store; };
    return tx;
  };
  try { await assert.rejects(put('new'), { name: 'QuotaExceededError' }); } finally { storage.db.transaction = original; }
  assert.deepEqual(await storage.getOfficialArchiveSnapshot(), snapshot);
  assert.equal(await (await storage.loadSharedArchives())[0].file.text(), 'old');
  assert.deepEqual(await storage.loadData('spawnReports'), [{ sharedFileId: 'old' }]);
  assert.equal((await storage.getProcessedFiles('spawnScanner')).has('old'), true);
});

test('stale snapshot, empty clear, and canceled operations cannot restore a slot', async () => {
  const snapshot = await storage.getOfficialArchiveSnapshot();
  await storage.purgeSharedFiles();
  await assert.rejects(storage.replaceOfficialArchive(meta('stale'), new Blob(['x']), { expectedOfficialId: snapshot.id, expectedOfficialRevision: snapshot.revision }), /changed/i);
  const fresh = await storage.getOfficialArchiveSnapshot();
  await assert.rejects(storage.replaceOfficialArchive(meta('canceled'), new Blob(['x']), { expectedOfficialId: fresh.id, expectedOfficialRevision: fresh.revision, isCurrent: () => false }), { name: 'AbortError' });
  assert.deepEqual(await storage.loadSharedArchives(), []);
});

test('concurrent replacements compare revisions inside their transaction', async () => {
  const s = await storage.getOfficialArchiveSnapshot();
  const results = await Promise.allSettled(['a', 'b'].map(id => storage.replaceOfficialArchive(meta(id), new Blob([id]), { expectedOfficialId: s.id, expectedOfficialRevision: s.revision })));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await storage.loadSharedArchives()).length, 1);
});

test('storage budget excludes replaced archive and rejects oversize with rollback', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(Blob.prototype, 'size');
  Object.defineProperty(Blob.prototype, 'size', { ...descriptor, get() { return descriptor.get.call(this) * 1024 ** 2; } });
  try {
    await storage.persistSharedArchive({ ...meta('manual'), source: undefined }, new Blob(['x'.repeat(512)]));
    const s = await storage.getOfficialArchiveSnapshot();
    await storage.replaceOfficialArchive(meta('old'), new Blob(['x'.repeat(512)]), { expectedOfficialId: s.id, expectedOfficialRevision: s.revision });
    const next = await storage.getOfficialArchiveSnapshot();
    await storage.replaceOfficialArchive(meta('new'), new Blob(['x'.repeat(512)]), { expectedOfficialId: next.id, expectedOfficialRevision: next.revision });
    await assert.rejects(storage.replaceOfficialArchive(meta('huge'), new Blob(['x'.repeat(513)]), { expectedOfficialId: 'new', expectedOfficialRevision: (await storage.getOfficialArchiveSnapshot()).revision }), /512/);
    assert.deepEqual((await storage.loadSharedArchives()).map(f => f.id), ['manual', 'new']);
  } finally { Object.defineProperty(Blob.prototype, 'size', descriptor); }
});
