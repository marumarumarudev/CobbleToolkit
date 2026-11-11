import JSZip from "jszip";

export const ARCHIVE_LIMITS = Object.freeze({ compressed: 128 * 1024 ** 2, entries: 50000, uncompressed: 512 * 1024 ** 2, json: 10 * 1024 ** 2, rows: 500000 });
export class ProcessingBudgetError extends Error {
  constructor(message) { super(message); this.name = "ProcessingBudgetError"; }
}
export function checkAbort(signal) {
  if (signal?.aborted) {
    const error = new Error("Archive processing aborted");
    error.name = "AbortError";
    throw error;
  }
}
export function rethrowProcessingError(error) {
  if (error?.name === "AbortError" || error instanceof ProcessingBudgetError) throw error;
}
export function checkArchiveBudget(zip, { signal } = {}) {
  checkAbort(signal);
  const entries = Object.values(zip.files);
  if (entries.length > ARCHIVE_LIMITS.entries) throw new ProcessingBudgetError("Archive exceeds 50,000 entries");
  let total = 0;
  for (const entry of entries) {
    checkAbort(signal);
    const size = entry._data?.uncompressedSize ?? 0;
    total += size;
    if (/\.json$/i.test(entry.name || "") && size > ARCHIVE_LIMITS.json) throw new ProcessingBudgetError("JSON entry exceeds 10 MiB");
    if (total > ARCHIVE_LIMITS.uncompressed) throw new ProcessingBudgetError("Archive exceeds 512 MiB uncompressed");
  }
}
// Private fields authenticate sessions without a global archive cache. The raw
// ZIP and owner live only as long as the caller retains this session.
class ArchiveSession {
  #owner;
  #zip;
  constructor(owner, zip) {
    this.#owner = owner;
    this.#zip = zip;
    Object.freeze(this);
  }
  static getZip(session, file) {
    if (!session || typeof session !== "object" || !(#owner in session)) {
      throw new TypeError("Invalid archive session");
    }
    if (session.#owner !== file) throw new TypeError("Archive session belongs to a different file");
    return session.#zip;
  }
}
export async function createArchiveSession(file, options = {}) {
  const zip = await loadArchive(file, options);
  checkAbort(options.signal);
  return new ArchiveSession(file, zip);
}
const entryBudgets = new WeakMap();

export async function loadArchive(file, { signal, archiveSession } = {}) {
  checkAbort(signal);
  if (archiveSession !== undefined) {
    return ArchiveSession.getZip(archiveSession, file);
  }
  const size = file.size ?? file.byteLength ?? file.length;
  if (size > ARCHIVE_LIMITS.compressed) throw new ProcessingBudgetError("Archive exceeds 128 MiB compressed");
  const zip = await JSZip.loadAsync(file, { checkCRC32: false });
  checkAbort(signal);
  checkArchiveBudget(zip, { signal });
  const budget = { bytes: 0 };
  for (const entry of Object.values(zip.files)) {
    entryBudgets.set(entry, { budget, bytes: 0 });
  }
  return zip;
}
export function createProcessingContext({ signal } = {}) {
  let lastYield = performance.now();
  let rows = 0;
  return {
    async checkpoint() {
      checkAbort(signal);
      if (performance.now() - lastYield >= 8) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        checkAbort(signal);
        lastYield = performance.now();
      }
    },
    row() {
      checkAbort(signal);
      if (++rows > ARCHIVE_LIMITS.rows) throw new ProcessingBudgetError("Parser exceeds 500,000 rows");
    },
  };
}
export async function readArchiveText(entry, { signal } = {}) {
  checkAbort(signal);
  if (entry._data?.uncompressedSize > ARCHIVE_LIMITS.json) throw new ProcessingBudgetError("JSON entry exceeds 10 MiB");
  const stream = entry.internalStream("uint8array");
  const accounting = entryBudgets.get(entry);
  return new Promise((resolve, reject) => {
    const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
    let parts = [];
    let bytes = 0;
    let settled = false;
    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    const fail = (error) => {
      if (settled) return;
      settled = true;
      parts = [];
      cleanup();
      // Pause immediately, but defer private worker teardown until JSZip's
      // synchronous emit loop unwinds (cleanup replaces its listener arrays).
      // An active inflate call may finish; no further output is retained.
      stream.pause();
      const worker = stream._worker;
      if (typeof worker?.error === "function" && typeof worker.resume === "function") {
        queueMicrotask(() => {
          worker.error(error);
          // Paused workers defer errors until resumed, propagating upstream.
          worker.resume();
        });
      }
      reject(error);
    };
    const onAbort = () => {
      try { checkAbort(signal); } catch (error) { fail(error); }
    };
    stream.on("data", (chunk) => {
      if (settled) return;
      try {
        checkAbort(signal);
        bytes += chunk.byteLength;
        if (bytes > ARCHIVE_LIMITS.json) throw new ProcessingBudgetError("JSON entry exceeds 10 MiB");
        if (accounting && bytes > accounting.bytes) {
          // Charge each entry's high-water mark, not every reread by another
          // parser using the same archive session.
          accounting.budget.bytes += bytes - accounting.bytes;
          accounting.bytes = bytes;
        }
        if (accounting?.budget.bytes > ARCHIVE_LIMITS.uncompressed) {
          throw new ProcessingBudgetError("Archive exceeds 512 MiB uncompressed");
        }
        parts.push(decoder.decode(chunk, { stream: true }));
      } catch (error) {
        fail(error);
      }
    });
    stream.on("error", fail);
    stream.on("end", () => {
      if (settled) return;
      try {
        checkAbort(signal);
        parts.push(decoder.decode());
        const text = parts.join("");
        settled = true;
        parts = [];
        cleanup();
        resolve(text);
      } catch (error) {
        fail(error);
      }
    });
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
    else stream.resume();
  });
}
