import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import { downloadOfficialArchive, validateOfficialRelease, selectOfficialReleases } from '../src/utils/officialCobblemon.js';

const zip = new JSZip();
zip.file('data/cobblemon/species/test.json', '{"name":"Test"}');
const bytes = await zip.generateAsync({ type: 'uint8array' });
const release = { version: '1.7.3', versionId: 'kF7CvxTo', loader: 'fabric', filename: 'Cobblemon-fabric.jar', url: 'https://cdn.modrinth.com/data/MdwFAVRL/versions/kF7CvxTo/Cobblemon-fabric.jar', size: bytes.length, sha512: createHash('sha512').update(bytes).digest('hex'), sourceUrl: 'https://modrinth.com/mod/cobblemon/version/kF7CvxTo' };
const response = () => new Response(bytes);

test('verified stream returns exact named archive and monotonic progress', async () => {
  const progress = [];
  const file = await downloadOfficialArchive(release, { fetchImpl: async (url, options) => {
    assert.equal(url, release.url); assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error'); return response();
  }, onProgress: p => progress.push(p.receivedBytes) });
  assert.equal(file.name, release.filename);
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), bytes);
  assert.equal(progress.at(-1), bytes.length);
  assert.deepEqual(progress, [...progress].sort((a,b) => a-b));
});

test('rejects corrupt, truncated, oversized, and HTTP failure responses', async () => {
  await assert.rejects(downloadOfficialArchive({ ...release, sha512: '0'.repeat(128) }, { fetchImpl: async () => response() }), /hash|checksum/i);
  await assert.rejects(downloadOfficialArchive(release, { fetchImpl: async () => new Response(bytes.slice(1)) }), /size|incomplete/i);
  await assert.rejects(downloadOfficialArchive(release, { fetchImpl: async () => new Response(new Uint8Array(bytes.length + 1)) }), /size|exceed/i);
  await assert.rejects(downloadOfficialArchive(release, { fetchImpl: async () => new Response(null, { status: 503 }) }), /503/);
});

test('rejects unsafe catalog metadata before fetching', async () => {
  for (const patch of [{ url: 'https://evil.test/a.jar' }, { url: release.url.replace('MdwFAVRL', 'another') }, { sha512: 'bad' }, { size: 513 * 1024 ** 2 }, { size: -1 }, { sourceUrl: 'javascript:alert(1)' }, { filename: '../a.jar' }, { loader: 'neoforge' }]) {
    assert.throws(() => validateOfficialRelease({ ...release, ...patch }));
    await assert.rejects(downloadOfficialArchive({ ...release, ...patch }, { fetchImpl: () => { assert.fail('must not fetch invalid release'); } }));
  }
});

test('cancellation cancels a pending reader and rejects AbortError', async () => {
  const controller = new AbortController();
  let canceled = false;
  const pending = downloadOfficialArchive(release, { signal: controller.signal, fetchImpl: async () => new Response(new ReadableStream({ cancel() { canceled = true; } })) });
  await new Promise(resolve => setTimeout(resolve, 0));
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(canceled, true);
});

test('catalog selects requested stable Fabric builds, normalizes F suffix, rejects ambiguity/missing', () => {
  const version = { project_id: 'MdwFAVRL', id: release.versionId, version_number: '1.7.3F', version_type: 'release', loaders: ['fabric'], files: [{ primary: true, filename: release.filename, url: release.url, size: release.size, hashes: { sha512: release.sha512 } }] };
  assert.deepEqual(selectOfficialReleases([version], ['1.7.3']), [release]);
  assert.throws(() => selectOfficialReleases([version, version], ['1.7.3']), /ambiguous/i);
  assert.throws(() => selectOfficialReleases([{ ...version, version_type: 'beta' }], ['1.7.3']), /missing/i);
  assert.throws(() => selectOfficialReleases([version], ['1.8.0']), /missing/i);
});
