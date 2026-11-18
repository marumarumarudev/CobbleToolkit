import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOfficialArchiveController } from '../src/utils/officialArchiveController.js';
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const tick = () => new Promise(r => setTimeout(r, 0));

test('superseded download cannot commit or overwrite newer progress', async () => {
  const a = deferred(); const states = []; const commits = [];
  const controller = createOfficialArchiveController({ download: async (r, o) => { if(r.version === 'A') { await a.promise; o.onProgress({ receivedBytes: 99 }); } return r; }, prepare: async file => ({ file }), commit: async data => commits.push(data.file.version), onState: s => states.push(s) });
  const first = controller.load({ version: 'A' });
  await tick();
  assert.equal(await controller.load({ version: 'B' }), true);
  a.resolve();
  assert.equal(await first, false);
  assert.deepEqual(commits, ['B']);
  assert.equal(states.at(-1).version, 'B');
  assert.equal(states.at(-1).status, 'success');
});

test('cancel during preparation prevents committing and preserves idle state', async () => {
  const preparation = deferred(); let commits = 0; let state;
  const controller = createOfficialArchiveController({ download: async () => 'file', prepare: async () => preparation.promise, commit: async () => { commits++; }, onState: s => { state = s; } });
  const pending = controller.load({ version: 'A' });
  await tick(); controller.cancel(); preparation.resolve({ file: 'file' });
  assert.equal(await pending, false); assert.equal(commits, 0); assert.equal(state.status, 'idle');
});

test('queued commit receives a guard that becomes false when canceled', async () => {
  const queued = deferred(); let changed = false;
  const controller = createOfficialArchiveController({ download: async () => 'file', prepare: async file => ({file}), commit: async (_, { isCurrent }) => { await queued.promise; if(isCurrent()) changed = true; else throw new DOMException('Canceled', 'AbortError'); }, onState: () => {} });
  const pending = controller.load({ version: 'A' }); await tick(); controller.cancel(); queued.resolve();
  assert.equal(await pending, false); assert.equal(changed, false);
});

test('download and validation failures expose errors without committing', async () => {
  for (const stage of ['download', 'prepare', 'commit']) {
    let state; const controller = createOfficialArchiveController({ download: async () => 'file', prepare: async file => ({ file }), commit: async () => {}, [stage]: async () => { throw new Error('Storage or download failed'); }, onState: s => { state = s; } });
    assert.equal(await controller.load({ version: 'A' }), false);
    assert.equal(state.status, 'error'); assert.match(state.error, /failed/);
  }
});
