// Single source of truth for which IndexedDB stores hold data derived from
// uploaded datapack files, and how each store's entries link back to a
// shared file. New contributions use sharedFileId; the name matchers below
// are retained only for purging legacy cached entries without an ID.
//
// Add a new entry here whenever a tool starts caching parsed data keyed to
// an uploaded file, so nav-level remove/clear-all keeps covering it.

export const SCANNER_NAMES = [
  "spawnScanner",
  "speciesLootScanner",
  "speciesLootScanner-mounts-v1",
  "rctTrainerScanner",
];

export const TOOL_DATA_STORES = [
  { store: "spawnReports", matchesFile: (item, fileName) => item?.name === fileName },
  { store: "speciesData", matchesFile: (item, fileName) => item?.sourceFile === fileName },
  { store: "lootReports", matchesFile: (item, fileName) => item?.name === fileName },
  { store: "trainerReports", matchesFile: (item, fileName) => item?.name === fileName },
];
