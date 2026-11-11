import { loadArchive, readArchiveText, createProcessingContext, rethrowProcessingError } from "./archiveProcessing.js";
import { parseJsonWithFallbacks } from "./parseJson.js";
import { indexDatapackArchive } from "./archivePaths.js";

export async function parseCobblemonZip(file, { signal, onDiagnostic = () => {}, allowRepair = true } = {}) {
  const options = { signal, onDiagnostic, allowRepair };
  const processing = createProcessingContext(options);
  const zip = indexDatapackArchive(await loadArchive(file, options), options);
    if (Object.keys(zip.files).length === 0) {
      throw new Error("The archive is empty.");
    }

    const hasSpawnData = Object.keys(zip.files).some((name) =>
      /^data\/[^/]+\/spawn_pool_world\/.+\.json$/.test(name)
    );
    // Shared uploads may be trainer-only or species-only. Absence of this
    // tool's data is a successful no-op, not a malformed archive.
    if (!hasSpawnData) return [];

    const results = [];

    const namespaces = Object.keys(zip.files)
      .filter(
        (name) =>
          name.startsWith("data/") && name.includes("/spawn_pool_world/")
      )
      .map((name) => name.split("/")[1]);

    const uniqueNamespaces = [...new Set(namespaces)];

    // Process files in smaller batches to avoid memory issues
    const batchSize = 5; // Reduced batch size for better memory management

    for (const namespace of uniqueNamespaces) {
      const folderPath = `data/${namespace}/spawn_pool_world/`;

      const jsonFiles = Object.keys(zip.files).filter(
        (name) => name.startsWith(folderPath) && name.endsWith(".json")
      );

      // Process files in batches to manage memory
      for (let i = 0; i < jsonFiles.length; i += batchSize) {
        const batch = jsonFiles.slice(i, i + batchSize);

        // Process batch with small delays to allow garbage collection
        for (const fileName of batch) {
          await processing.checkpoint();
          try {
            const zipEntry = zip.files[fileName];

            if (!zipEntry || zipEntry._data.uncompressedSize === 0) {
              onDiagnostic({ path: fileName, code: "empty-file", message: "File is empty or missing." });
              console.warn(`⚠️ Skipping empty or missing file: ${fileName}`);
              continue;
            }

            // Check file size to avoid processing extremely large files
            if (zipEntry._data.uncompressedSize > 10 * 1024 * 1024) {
              onDiagnostic({ path: fileName, code: "oversized-file", message: "File exceeds the 10 MB limit." });
              // 10MB limit
              console.warn(
                `⚠️ Skipping very large file: ${fileName} (${Math.round(
                  zipEntry._data.uncompressedSize / 1024 / 1024
                )}MB)`
              );
              continue;
            }

            let content;
            try {
              content = await readArchiveText(zipEntry, options);
            } catch (contentErr) {
                rethrowProcessingError(contentErr);
              onDiagnostic({ path: fileName, code: "unreadable-file", message: "File content could not be read." });
              console.warn(
                `⚠️ Failed to read file content: ${fileName}`,
                contentErr
              );
              continue;
            }

            // Validate content before JSON parsing
            if (
              !content ||
              typeof content !== "string" ||
              content.trim().length === 0
            ) {
              onDiagnostic({ path: fileName, code: "empty-file", message: "File content is empty or invalid." });
              console.warn(
                `⚠️ Skipping empty or invalid content in: ${fileName}`
              );
              continue;
            }

            let json = parseJsonWithFallbacks(content, fileName, options);
            if (!json) continue;

            // Validate JSON structure before processing
            if (
              !json ||
              typeof json !== "object" ||
              !Array.isArray(json.spawns)
            ) {
              onDiagnostic({ path: fileName, code: "invalid-structure", message: "Expected an object with a spawns array." });
              console.warn(
                `⚠️ Skipping file with invalid spawn structure: ${fileName}`
              );
              continue;
            }

            // Process spawns with additional validation
            for (const entry of json.spawns) {
              await processing.checkpoint();
              try {
                // Validate entry structure
                if (!entry || typeof entry !== "object") {
                  onDiagnostic({ path: fileName, code: "invalid-entry", message: "Spawn entry is null or not an object." });
                  continue; // Skip invalid entries
                }

                const condition = entry.condition || {};
                const anticondition = entry.anticondition || {};
                const weightMultiplier = entry.weightMultiplier || null;
                const weightMultipliers = Array.isArray(entry.weightMultipliers)
                  ? entry.weightMultipliers
                  : weightMultiplier
                  ? [weightMultiplier]
                  : [];

                // Helper function to format array values
                const formatArrayValue = (value) => {
                  if (Array.isArray(value)) {
                    return value.length > 0 ? value.join(", ") : "";
                  }
                  return "";
                };

                // Helper function to format single values
                const formatSingleValue = (value) => {
                  if (value === null || value === undefined || value === "") {
                    return "";
                  }
                  return String(value);
                };

                // Helper function to format light level
                const formatLightLevel = (condition) => {
                  if (
                    condition.minSkyLight != null &&
                    condition.maxSkyLight != null
                  ) {
                    return `${condition.minSkyLight}-${condition.maxSkyLight}`;
                  } else if (condition.minSkyLight != null) {
                    return `${condition.minSkyLight}+`;
                  } else if (condition.maxSkyLight != null) {
                    return `0-${condition.maxSkyLight}`;
                  } else if (
                    condition.minLight != null &&
                    condition.maxLight != null
                  ) {
                    return `${condition.minLight}-${condition.maxLight}`;
                  } else if (condition.minLight != null) {
                    return `${condition.minLight}+`;
                  } else if (condition.maxLight != null) {
                    return `0-${condition.maxLight}`;
                  }
                  return "";
                };

                // Cobblemon 1.8+ herds live under spawn_pool_world/herds/ with
                // type "pokemon-herd" and a herdablePokemon[] list instead of a
                // single top-level pokemon. Expand each member into a row so
                // search/filters still work. Solo entries stay one row.
                const herdMembers = Array.isArray(entry.herdablePokemon)
                  ? entry.herdablePokemon
                  : null;
                const units = [];
                if (entry.type === "pokemon-herd" || herdMembers) {
                  if (!herdMembers?.length) onDiagnostic({ path: fileName, code: "invalid-herd", message: "Herd has no valid member list." });
                  for (const member of herdMembers || []) {
                    await processing.checkpoint();
                    if (!member || typeof (member.pokemon || member.species) !== "string" || !(member.pokemon || member.species).trim()) {
                      onDiagnostic({ path: fileName, code: "invalid-member", message: "Herd member has no species." });
                      continue;
                    }
                    units.push({
                      pokemon:
                        member.pokemon ||
                        member.species,
                      level:
                        member.levelRange ??
                        entry.levelRange ??
                        entry.level ??
                        "",
                      weight: member.weight ?? entry.weight ?? "",
                      spawnType: entry.type || "pokemon-herd",
                      maxHerdSize: entry.maxHerdSize ?? "",
                      isLeader: member.isLeader ?? "",
                      isFollower: member.isFollower ?? "",
                      herdLevelRange: entry.levelRange ?? "",
                      memberMaxTimes: member.maxTimes ?? "",
                      levelRangeOffset: member.levelRangeOffset ?? "",
                      entryWeight: entry.weight ?? "",
                    });
                  }
                } else if (entry.pokemon || entry.species) {
                  units.push({
                    pokemon: entry.pokemon || entry.species || "Unknown",
                    level: entry.level ?? entry.levelRange ?? "",
                    weight: entry.weight ?? "",
                    spawnType: entry.type || "pokemon",
                    maxHerdSize: entry.maxHerdSize ?? "",
                    isLeader: "",
                    isFollower: "",
                    herdLevelRange: "",
                    memberMaxTimes: "",
                    levelRangeOffset: "",
                    entryWeight: entry.weight ?? "",
                  });
                }

                if (!units.length && entry.type !== "pokemon-herd" && !herdMembers) {
                  onDiagnostic({ path: fileName, code: "invalid-entry", message: "Spawn has no species." });
                }
                for (const unit of units) {
                  await processing.checkpoint();
                  const spawnData = {
                    pokemon: String(unit.pokemon),
                    bucket: String(entry.bucket || "Unknown"),
                    level: String(unit.level ?? ""),
                    weight: String(unit.weight ?? ""),
                    // Support both old 'context' and new 'spawnablePositionType' fields
                    spawnablePositionType: String(
                      entry.spawnablePositionType || entry.context || "none"
                    ),
                    presets: formatArrayValue(entry.presets),
                    // Preserve plural weight multipliers for UI rendering/search
                    weightMultipliers: weightMultipliers,

                    // 1.8 herd / entry metadata
                    spawnType: String(unit.spawnType || ""),
                    maxHerdSize: formatSingleValue(unit.maxHerdSize),
                    isLeader: formatSingleValue(unit.isLeader),
                    isFollower: formatSingleValue(unit.isFollower),
                    herdLevelRange: formatSingleValue(unit.herdLevelRange),
                    memberMaxTimes: formatSingleValue(unit.memberMaxTimes),
                    levelRangeOffset: formatSingleValue(unit.levelRangeOffset),
                    herdWeight: formatSingleValue(unit.entryWeight),
                    spawnId: formatSingleValue(entry.id),

                    // Condition fields
                    biomes: formatArrayValue(condition.biomes),
                    dimensions: formatArrayValue(condition.dimensions),
                    structures: formatArrayValue(condition.structures),
                    neededNearbyBlocks: formatArrayValue(
                      condition.neededNearbyBlocks
                    ),
                    neededBaseBlocks: formatArrayValue(
                      condition.neededBaseBlocks
                    ),
                    labels: formatArrayValue(condition.labels),
                    markers: formatArrayValue(condition.markers),
                    isPokeSnack: formatSingleValue(condition.isPokeSnack),

                    // Boolean condition fields
                    canSeeSky: formatSingleValue(condition.canSeeSky),
                    isRaining: formatSingleValue(condition.isRaining),
                    isThundering: formatSingleValue(condition.isThundering),
                    isSlimeChunk: formatSingleValue(condition.isSlimeChunk),
                    fluidIsSource: formatSingleValue(condition.fluidIsSource),

                    // Numeric condition fields
                    moonPhase: formatSingleValue(condition.moonPhase),
                    minX: formatSingleValue(condition.minX),
                    minY: formatSingleValue(condition.minY),
                    minZ: formatSingleValue(condition.minZ),
                    maxX: formatSingleValue(condition.maxX),
                    maxY: formatSingleValue(condition.maxY),
                    maxZ: formatSingleValue(condition.maxZ),
                    minLight: formatSingleValue(condition.minLight),
                    maxLight: formatSingleValue(condition.maxLight),
                    minSkyLight: formatSingleValue(condition.minSkyLight),
                    maxSkyLight: formatSingleValue(condition.maxSkyLight),
                    minWidth: formatSingleValue(condition.minWidth),
                    maxWidth: formatSingleValue(condition.maxWidth),
                    minHeight: formatSingleValue(condition.minHeight),
                    maxHeight: formatSingleValue(condition.maxHeight),
                    minDepth: formatSingleValue(condition.minDepth),
                    maxDepth: formatSingleValue(condition.maxDepth),
                    minLureLevel: formatSingleValue(condition.minLureLevel),
                    maxLureLevel: formatSingleValue(condition.maxLureLevel),

                    // String condition fields
                    timeRange: formatSingleValue(condition.timeRange),
                    fluidBlock: formatSingleValue(condition.fluidBlock),
                    bobber: formatSingleValue(condition.bobber),
                    bait: formatSingleValue(condition.bait),
                    labelMode: formatSingleValue(condition.labelMode),

                    // Light level (computed field)
                    lightLevel: formatLightLevel(condition),

                    // Anticondition fields
                    antiBiomes: formatArrayValue(anticondition.biomes),
                    antiStructures: formatArrayValue(anticondition.structures),
                    antiDimensions: formatArrayValue(anticondition.dimensions),
                    antiNeededNearbyBlocks: formatArrayValue(
                      anticondition.neededNearbyBlocks
                    ),
                    antiNeededBaseBlocks: formatArrayValue(
                      anticondition.neededBaseBlocks
                    ),
                    antiLabels: formatArrayValue(anticondition.labels),

                    // Boolean anticondition fields
                    antiCanSeeSky: formatSingleValue(anticondition.canSeeSky),
                    antiIsRaining: formatSingleValue(anticondition.isRaining),
                    antiIsThundering: formatSingleValue(
                      anticondition.isThundering
                    ),
                    antiIsSlimeChunk: formatSingleValue(
                      anticondition.isSlimeChunk
                    ),
                    antiFluidIsSource: formatSingleValue(
                      anticondition.fluidIsSource
                    ),

                    // Numeric anticondition fields
                    antiMoonPhase: formatSingleValue(anticondition.moonPhase),
                    antiMinX: formatSingleValue(anticondition.minX),
                    antiMinY: formatSingleValue(anticondition.minY),
                    antiMinZ: formatSingleValue(anticondition.minZ),
                    antiMaxX: formatSingleValue(anticondition.maxX),
                    antiMaxY: formatSingleValue(anticondition.maxY),
                    antiMaxZ: formatSingleValue(anticondition.maxZ),
                    antiMinLight: formatSingleValue(anticondition.minLight),
                    antiMaxLight: formatSingleValue(anticondition.maxLight),
                    antiMinSkyLight: formatSingleValue(
                      anticondition.minSkyLight
                    ),
                    antiMaxSkyLight: formatSingleValue(
                      anticondition.maxSkyLight
                    ),
                    antiMinWidth: formatSingleValue(anticondition.minWidth),
                    antiMaxWidth: formatSingleValue(anticondition.maxWidth),
                    antiMinHeight: formatSingleValue(anticondition.minHeight),
                    antiMaxHeight: formatSingleValue(anticondition.maxHeight),
                    antiMinDepth: formatSingleValue(anticondition.minDepth),
                    antiMaxDepth: formatSingleValue(anticondition.maxDepth),
                    antiMinLureLevel: formatSingleValue(
                      anticondition.minLureLevel
                    ),
                    antiMaxLureLevel: formatSingleValue(
                      anticondition.maxLureLevel
                    ),

                    // String anticondition fields
                    antiTimeRange: formatSingleValue(anticondition.timeRange),
                    antiFluidBlock: formatSingleValue(anticondition.fluidBlock),
                    antiBobber: formatSingleValue(anticondition.bobber),
                    antiBait: formatSingleValue(anticondition.bait),
                    antiLabelMode: formatSingleValue(anticondition.labelMode),

                    // Weight multiplier fields
                    weightMultiplierMultiplier:
                      weightMultiplier && weightMultiplier.multiplier
                        ? String(weightMultiplier.multiplier)
                        : "",
                    weightMultiplierBiomes:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(weightMultiplier.condition.biomes)
                        : "",
                    weightMultiplierDimensions:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(
                            weightMultiplier.condition.dimensions
                          )
                        : "",
                    weightMultiplierStructures:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(
                            weightMultiplier.condition.structures
                          )
                        : "",
                    weightMultiplierNeededNearbyBlocks:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(
                            weightMultiplier.condition.neededNearbyBlocks
                          )
                        : "",
                    weightMultiplierNeededBaseBlocks:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(
                            weightMultiplier.condition.neededBaseBlocks
                          )
                        : "",
                    weightMultiplierLabels:
                      weightMultiplier && weightMultiplier.condition
                        ? formatArrayValue(weightMultiplier.condition.labels)
                        : "",

                    // Boolean weight multiplier fields
                    weightMultiplierCanSeeSky:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.canSeeSky
                          )
                        : "",
                    weightMultiplierIsRaining:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.isRaining
                          )
                        : "",
                    weightMultiplierIsThundering:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.isThundering
                          )
                        : "",
                    weightMultiplierIsSlimeChunk:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.isSlimeChunk
                          )
                        : "",
                    weightMultiplierFluidIsSource:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.fluidIsSource
                          )
                        : "",

                    // Numeric weight multiplier fields
                    weightMultiplierMoonPhase:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.moonPhase
                          )
                        : "",
                    weightMultiplierMinX:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minX)
                        : "",
                    weightMultiplierMinY:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minY)
                        : "",
                    weightMultiplierMinZ:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minZ)
                        : "",
                    weightMultiplierMaxX:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxX)
                        : "",
                    weightMultiplierMaxY:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxY)
                        : "",
                    weightMultiplierMaxZ:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxZ)
                        : "",
                    weightMultiplierMinLight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minLight)
                        : "",
                    weightMultiplierMaxLight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxLight)
                        : "",
                    weightMultiplierMinSkyLight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.minSkyLight
                          )
                        : "",
                    weightMultiplierMaxSkyLight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.maxSkyLight
                          )
                        : "",
                    weightMultiplierMinWidth:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minWidth)
                        : "",
                    weightMultiplierMaxWidth:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxWidth)
                        : "",
                    weightMultiplierMinHeight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.minHeight
                          )
                        : "",
                    weightMultiplierMaxHeight:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.maxHeight
                          )
                        : "",
                    weightMultiplierMinDepth:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.minDepth)
                        : "",
                    weightMultiplierMaxDepth:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.maxDepth)
                        : "",
                    weightMultiplierMinLureLevel:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.minLureLevel
                          )
                        : "",
                    weightMultiplierMaxLureLevel:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.maxLureLevel
                          )
                        : "",

                    // String weight multiplier fields
                    weightMultiplierTimeRange:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.timeRange
                          )
                        : "",
                    weightMultiplierFluidBlock:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.fluidBlock
                          )
                        : "",
                    weightMultiplierBobber:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.bobber)
                        : "",
                    weightMultiplierBait:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(weightMultiplier.condition.bait)
                        : "",
                    weightMultiplierLabelMode:
                      weightMultiplier && weightMultiplier.condition
                        ? formatSingleValue(
                            weightMultiplier.condition.labelMode
                          )
                        : "",
                  };

                  processing.row();
                  results.push(spawnData);
                }              // ends for (const unit of units)
              } catch (entryErr) {
                rethrowProcessingError(entryErr);
                onDiagnostic({ path: fileName, code: "entry-error", message: "Spawn entry could not be processed." });
                console.warn(
                  `⚠️ Skipping invalid spawn entry in ${fileName}:`,
                  entryErr
                );
                continue;
              }
            }

            // Clear the content to free memory
            content = null;
            json = null;

          } catch (err) {
                rethrowProcessingError(err);
            onDiagnostic({ path: fileName, code: "file-error", message: "File could not be processed." });
            console.error(`❌ Failed to process ${fileName}`, err);
            // Continue with next file instead of stopping
            continue;
          }
        }

        await processing.checkpoint();
      }
    }

    // Clear zip object to free memory
    zip.files = null;

    return results;
}
