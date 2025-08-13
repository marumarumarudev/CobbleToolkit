import JSZip from "jszip";

export async function parseCobblemonZip(file) {
  // Add timeout protection for Chrome
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(new Error("File processing timeout - file may be corrupted")),
      30000
    ); // 30 second timeout
  });

  const processingPromise = async () => {
    // Use a more memory-efficient approach for Chrome
    const zip = await JSZip.loadAsync(file, {
      // Limit memory usage by processing files individually
      checkCRC32: false,
      // Use streaming for large files
      streamFiles: true,
    });

    if (Object.keys(zip.files).length === 0) {
      throw new Error("The archive is empty.");
    }

    const hasSpawnData = Object.keys(zip.files).some((name) =>
      name.includes("/spawn_pool_world/")
    );
    if (!hasSpawnData) {
      throw new Error("No spawn_pool_world folder found.");
    }

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
          try {
            const zipEntry = zip.files[fileName];

            if (!zipEntry || zipEntry._data.uncompressedSize === 0) {
              console.warn(`⚠️ Skipping empty or missing file: ${fileName}`);
              continue;
            }

            // Check file size to avoid processing extremely large files
            if (zipEntry._data.uncompressedSize > 10 * 1024 * 1024) {
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
              content = await zipEntry.async("string");
            } catch (contentErr) {
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
              console.warn(
                `⚠️ Skipping empty or invalid content in: ${fileName}`
              );
              continue;
            }

            // Ensure it is valid JSON
            let json;
            try {
              json = JSON.parse(content);
            } catch (parseErr) {
              // Try to fix common JSON formatting issues
              try {
                // Fix common indentation and formatting issues
                let fixedContent = content
                  // Remove trailing commas before closing brackets/braces
                  .replace(/,(\s*[}\]])/g, "$1")
                  // Fix missing quotes around property names
                  .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
                  // Fix single quotes to double quotes
                  .replace(/'/g, '"')
                  // Remove comments (simple line comments)
                  .replace(/\/\/.*$/gm, "")
                  // Remove trailing commas in arrays
                  .replace(/,(\s*\])/g, "$1")
                  // Fix common spacing issues
                  .replace(/\s+/g, " ")
                  .trim();

                // Try to parse the fixed content
                json = JSON.parse(fixedContent);
                console.log(`✅ Fixed JSON formatting for ${fileName}`);
              } catch (fixErr) {
                // Try more aggressive JSON repair
                try {
                  let repairedContent = content
                    // Fix missing opening braces/brackets
                    .replace(/^([^{]*?)(\w+\s*:)/, "{$1$2")
                    .replace(/(\w+\s*:)([^}]*?)$/, "$1$2}")
                    // Fix missing quotes around string values
                    .replace(
                      /:\s*([a-zA-Z_][a-zA-Z0-9_]*)(\s*[,}])/g,
                      ':"$1"$2'
                    )
                    // Fix boolean and null values
                    .replace(/:\s*(true|false|null)(\s*[,}])/g, ":$1$2")
                    // Fix numeric values
                    .replace(/:\s*(\d+\.?\d*)(\s*[,}])/g, ":$1$2")
                    // Remove any remaining problematic characters
                    .replace(/[^\x20-\x7E]/g, "")
                    .trim();

                  // Try to parse the repaired content
                  json = JSON.parse(repairedContent);
                  console.log(`✅ Repaired JSON structure for ${fileName}`);
                } catch (repairErr) {
                  console.warn(
                    `⚠️ Skipping invalid JSON in: ${fileName}`,
                    parseErr
                  );
                  continue;
                }
              }
            }

            // Validate JSON structure before processing
            if (
              !json ||
              typeof json !== "object" ||
              !Array.isArray(json.spawns)
            ) {
              console.warn(
                `⚠️ Skipping file with invalid spawn structure: ${fileName}`
              );
              continue;
            }

            // Process spawns with additional validation
            for (const entry of json.spawns) {
              try {
                // Validate entry structure
                if (!entry || typeof entry !== "object") {
                  continue; // Skip invalid entries
                }

                const condition = entry.condition || {};
                const anticondition = entry.anticondition || {};
                const weightMultiplier = entry.weightMultiplier || null;

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

                // Only add valid entries
                if (entry.pokemon || entry.species || entry.id) {
                  const spawnData = {
                    pokemon: String(
                      entry.pokemon || entry.species || entry.id || "Unknown"
                    ),
                    bucket: String(entry.bucket || "Unknown"),
                    level: String(entry.level ?? ""),
                    weight: String(entry.weight ?? ""),
                    context: String(entry.context || "none"),
                    presets: formatArrayValue(entry.presets),

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

                  results.push(spawnData);
                }
              } catch (entryErr) {
                // Skip individual invalid entries without stopping the whole process
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

            // Force garbage collection hint for Chrome
            if (typeof window !== "undefined" && window.gc) {
              try {
                window.gc();
              } catch (e) {
                // gc() might not be available
              }
            }
          } catch (err) {
            console.error(`❌ Failed to process ${fileName}`, err);
            // Continue with next file instead of stopping
            continue;
          }
        }

        // Small delay between batches to allow garbage collection
        if (i + batchSize < jsonFiles.length) {
          await new Promise((resolve) => setTimeout(resolve, 20)); // Increased delay
        }
      }
    }

    // Clear zip object to free memory
    zip.files = null;

    return results;
  };

  // Race between processing and timeout
  return Promise.race([processingPromise(), timeoutPromise]);
}
