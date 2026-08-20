/**
 * Detects which CobbleToolkit tools a datapack zip/jar has data for.
 * A pack only needs to match ONE kind to be accepted — most real packs
 * won't have data for every tool (an RCT trainer pack has no spawn pools,
 * a vanilla spawn pack has no trainers), so this is an OR across kinds
 * rather than a single all-or-nothing check.
 */

const KIND_CHECKS = {
  spawn: (paths) => paths.some((p) => p.includes("/spawn_pool_world/")),

  species: (paths) =>
    paths.some((p) =>
      /^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(p)
    ),

  rctTrainer: (paths) =>
    paths.some(
      (p) =>
        /^data\/rctmod\/trainers\/.+\.json$/.test(p) ||
        /^data\/[^/]+\/loot_table\/trainers\/.+\.json$/.test(p)
    ),
};

const KIND_LABELS = {
  spawn: "Spawn Scanner",
  species: "Species & Loot",
  rctTrainer: "RCT Trainer Scanner",
};

function normalizePath(rawPath) {
  const normalized = rawPath.replace(/\\/g, "/");
  const dataIndex = normalized.indexOf("data/");
  return dataIndex === -1 ? normalized : normalized.slice(dataIndex);
}

/**
 * @param {File} file
 * @returns {Promise<{ valid: boolean, kinds: string[], labels: string[], reason?: string }>}
 */
export async function validateFileStructure(file) {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file, {
      checkCRC32: false,
      streamFiles: true,
    });

    const filePaths = Object.keys(zip.files).map(normalizePath);

    const kinds = Object.entries(KIND_CHECKS)
      .filter(([, check]) => check(filePaths))
      .map(([kind]) => kind);

    if (kinds.length === 0) {
      return {
        valid: false,
        kinds: [],
        labels: [],
        reason:
          "File doesn't contain data any tool here reads. Needs at least one of: spawn_pool_world/, species/ (or species_additions/), or rctmod trainers/loot_table data.",
      };
    }

    return {
      valid: true,
      kinds,
      labels: kinds.map((k) => KIND_LABELS[k]),
    };
  } catch (err) {
    console.error("Error validating file structure:", err);
    return {
      valid: false,
      kinds: [],
      labels: [],
      reason: `Failed to validate file: ${err.message}`,
    };
  }
}
