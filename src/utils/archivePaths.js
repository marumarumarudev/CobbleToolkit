import { checkArchiveBudget } from "./archiveProcessing.js";
// ZIPs may contain wrapper folders or Windows separators. A datapack resource
// needs data/<namespace>/<type>/<file>; embedded dependency data/LICENSE and
// data/moves.json are not datapack roots and must keep their distinct paths.
export function normalizeDatapackPath(rawPath) {
  const path = rawPath.replace(/\\/g, "/");
  const segments = path.split("/");
  const dataIndex = segments.findIndex((segment, index) =>
      segment === "data" && segments.length >= index + 4 &&
      /^[a-z0-9_.-]+$/.test(segments[index + 1]) &&
      /^[a-z0-9_.-]+$/.test(segments[index + 2]) &&
      segments.slice(index + 3).every(Boolean)
    );
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
