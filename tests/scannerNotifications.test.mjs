import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScannerNotifications } from '../src/utils/scannerNotifications.js';

test('scan progress and outcome replace the same notification and cancellation removes it', () => {
  const calls = [];
  const toast = Object.assign((message, options) => calls.push(['message', message, options]), Object.fromEntries(['loading','success','error','remove'].map(method => [method, (...args) => calls.push([method, ...args])])));
  const notices = createScannerNotifications(toast, 'spawnScanner');
  notices.start('old.jar'); notices.success('Done'); notices.start('new.jar'); notices.error('Failed'); notices.clear();
  assert.equal(calls[0][0], 'loading');
  assert.match(calls[0][1], /old.jar/);
  assert.equal(calls[1][0], 'success');
  assert.equal(calls[3][0], 'error');
  assert.equal(new Set(calls.slice(0, 4).map(call => call[2].id)).size, 1);
  assert.deepEqual(calls[4], ['remove', 'scanner-spawnScanner']);
  const other = createScannerNotifications(toast, 'speciesLootScanner'); other.start('pack.jar');
  assert.notEqual(calls[5][2].id, calls[0][2].id);
});
