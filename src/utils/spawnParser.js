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

                // Only add valid entries
                if (entry.pokemon || entry.species || entry.id) {
                  results.push({
                    pokemon: String(
                      entry.pokemon || entry.species || entry.id || "Unknown"
                    ),
                    bucket: String(entry.bucket || "Unknown"),
                    level: String(entry.level ?? ""),
                    weight: String(entry.weight ?? ""),
                    context: String(entry.context || "none"),
                    presets: Array.isArray(entry.presets)
                      ? entry.presets.join(", ")
                      : "",
                    biomes: Array.isArray(condition.biomes)
                      ? condition.biomes.join(", ")
                      : "",
                    dimensions: Array.isArray(condition.dimensions)
                      ? condition.dimensions.join(", ")
                      : "",
                    canSeeSky: String(condition.canSeeSky ?? ""),
                    moonPhase: String(condition.moonPhase ?? ""),
                    isRaining: String(condition.isRaining ?? ""),
                    structures: Array.isArray(condition.structures)
                      ? condition.structures.join(", ")
                      : "",
                    neededNearbyBlocks: Array.isArray(
                      condition.neededNearbyBlocks
                    )
                      ? condition.neededNearbyBlocks.join(", ")
                      : "",
                    lightLevel:
                      condition.minSkyLight != null &&
                      condition.maxSkyLight != null
                        ? `${condition.minSkyLight}-${condition.maxSkyLight}`
                        : condition.minSkyLight != null
                        ? `${condition.minSkyLight}+`
                        : condition.maxSkyLight != null
                        ? `0-${condition.maxSkyLight}`
                        : "",
                    timeRange: condition.timeRange ?? "",
                    antiBiomes: Array.isArray(anticondition.biomes)
                      ? anticondition.biomes.join(", ")
                      : "",
                    antiStructures: Array.isArray(anticondition.structures)
                      ? anticondition.structures.join(", ")
                      : "",
                  });
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
