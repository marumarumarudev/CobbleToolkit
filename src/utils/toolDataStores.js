// Single source of truth for which IndexedDB stores hold data derived from
// uploaded datapack files, and how each store's entries link back to a
// shared file (by name — the same value each tool already uses to dedupe).
//
// Add a new entry here whenever a tool starts caching parsed data keyed to
// an uploaded file, so nav-level remove/clear-all keeps covering it.

export const SCANNER_NAMES = [
  "spawnScanner",
  "speciesLootScanner",
  "rctTrainerScanner",
];

export const TOOL_DATA_STORES = [
  { store: "spawnReports", matchesFile: (item, fileName) => item?.name === fileName },
  { store: "speciesData", matchesFile: (item, fileName) => item?.sourceFile === fileName },
  { store: "lootReports", matchesFile: (item, fileName) => item?.name === fileName },
  { store: "trainerReports", matchesFile: (item, fileName) => item?.name === fileName },
];

// Event dispatched on window whenever the nav upload widget removes a file
// or clears all files, so any mounted tool can refresh its local state
// (which is loaded once into React state and won't otherwise notice an
// IndexedDB change made outside its own component).
export const SHARED_FILES_CHANGED_EVENT = "cobbletoolkit:shared-files-changed";
