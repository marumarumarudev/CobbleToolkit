import { checkArchiveBudget } from "./archiveProcessing.js";
// ZIPs may contain a wrapper folder or Windows separators. Only an exact
// `data` path segment starts a datapack root (not the suffix of `metadata`).
export function normalizeDatapackPath(rawPath) {
  const path = rawPath.replace(/\\/g, "/");
  const segments = path.split("/");
  const dataIndex = segments.indexOf("data");
  return dataIndex === -1 ? path : segments.slice(dataIndex).join("/");
}

// Keep the original JSZip entries for extraction; never reopen entries using
// a canonical path that may not exist in the original ZIP. Ambiguous packs
// must not silently pick one of two files mapping to the same datapack path.
export function indexDatapackArchive(zip, options = {}) {
  checkArchiveBudget(zip, options);
  const files = Object.create(null);
  const originals = new Map();
  for (const [originalPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const path = normalizeDatapackPath(originalPath);
    if (Object.hasOwn(files, path)) {
      throw new Error(`Ambiguous archive path "${path}": "${originals.get(path)}" and "${originalPath}"`);
    }
    files[path] = entry;
    originals.set(path, originalPath);
  }
  return { files };
}
