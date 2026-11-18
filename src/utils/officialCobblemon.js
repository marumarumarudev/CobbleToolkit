import { MAX_ARCHIVE_BYTES } from './archiveLimits.js';

export const OFFICIAL_PROJECT_ID = 'MdwFAVRL';
export const OFFICIAL_SOURCE = 'official-cobblemon';

export function validateOfficialRelease(release) {
  if (!release || !/^\d+\.\d+\.\d+$/.test(release.version) || !/^[a-zA-Z0-9]{8}$/.test(release.versionId) || release.loader !== 'fabric') {
    throw new Error('Invalid official release metadata');
  }
  const url = new URL(release.url);
  const prefix = `/data/${OFFICIAL_PROJECT_ID}/versions/${release.versionId}/`;
  if (url.protocol !== 'https:' || url.host !== 'cdn.modrinth.com' || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(prefix) || !url.pathname.endsWith('.jar')) {
    throw new Error('Invalid official download URL');
  }
  if (!/^[^/\\]+\.jar$/.test(release.filename) || !Number.isSafeInteger(release.size) || release.size <= 0 || release.size > MAX_ARCHIVE_BYTES || !/^[a-f0-9]{128}$/.test(release.sha512)) {
    throw new Error('Invalid official archive size, filename or checksum');
  }
  if (release.sourceUrl !== `https://modrinth.com/mod/cobblemon/version/${release.versionId}`) throw new Error('Invalid official source link');
  return release;
}

export function selectOfficialReleases(versions, requested) {
  return [...new Set(requested)].map(version => {
    const matches = versions.filter(entry => entry.project_id === OFFICIAL_PROJECT_ID && entry.version_type === 'release' && entry.loaders.includes('fabric') && entry.version_number.replace(/F$/, '') === version);
    if (matches.length !== 1) throw new Error(`${matches.length ? 'Ambiguous' : 'Missing'} stable Fabric release: ${version}`);
    const entry = matches[0];
    const files = entry.files.filter(file => file.primary && file.filename.endsWith('.jar'));
    if (files.length !== 1) throw new Error(`Ambiguous primary JAR: ${version}`);
    const file = files[0];
    return validateOfficialRelease({ version, versionId: entry.id, loader: 'fabric', filename: file.filename, url: file.url, size: file.size, sha512: file.hashes.sha512, sourceUrl: `https://modrinth.com/mod/cobblemon/version/${entry.id}` });
  });
}

export async function downloadOfficialArchive(release, { signal, onProgress = () => {}, fetchImpl = fetch } = {}) {
  validateOfficialRelease(release);
  signal?.throwIfAborted();
  const response = await fetchImpl(release.url, { signal, credentials: 'omit', redirect: 'error' });
  if (!response.ok) throw new Error(`Official download failed (HTTP ${response.status}). Try again or upload the JAR manually.`);
  if (!response.body) throw new Error('Official download has no readable body');
  const reader = response.body.getReader();
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', abort, { once: true });
  let receivedBytes = 0;
  const chunks = [];
  try {
    signal?.throwIfAborted();
    onProgress({ receivedBytes, totalBytes: release.size });
    for (;;) {
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > release.size || receivedBytes > MAX_ARCHIVE_BYTES) throw new Error('Official download exceeds expected archive size');
      chunks.push(value);
      onProgress({ receivedBytes, totalBytes: release.size });
    }
    if (receivedBytes !== release.size) throw new Error('Official download is incomplete (size mismatch)');
    const file = new File(chunks, release.filename, { type: 'application/java-archive' });
    chunks.length = 0;
    const hash = await crypto.subtle.digest('SHA-512', await file.arrayBuffer());
    signal?.throwIfAborted();
    const actual = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
    if (actual !== release.sha512) throw new Error('Official archive checksum does not match Modrinth. Nothing was replaced.');
    return file;
  } finally {
    signal?.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
