import JSZip from "jszip";

/**
 * Cleans JSON string by removing/replacing problematic characters
 */
function cleanJsonString(jsonString) {
  // Remove null bytes and other control characters
  let cleaned = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Fix common JSON issues
  cleaned = cleaned
    // Remove trailing commas before closing brackets/braces
    .replace(/,(\s*[}\]])/g, "$1")
    // Fix unescaped quotes in strings (basic fix)
    .replace(/(?<!\\)"(?=.*":)/g, '\\"')
    // Remove any BOM characters
    .replace(/^\uFEFF/, "")
    // Fix common escape sequence issues
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\")
    // Fix common line break issues in strings
    .replace(/\n(?=.*")/g, "\\n")
    .replace(/\r(?=.*")/g, "\\r")
    // Remove any remaining problematic characters
    .replace(/[\u2028\u2029]/g, "");

  return cleaned;
}

/**
 * Attempts to fix and parse JSON with multiple fallback strategies
 */
function parseJsonWithFallbacks(content, filePath) {
  // First try: direct parse
  try {
    return JSON.parse(content);
  } catch (err) {
    console.warn(
      `⚠️ Direct JSON parse failed for ${filePath}, trying to clean...`
    );
  }

  // Second try: clean and parse
  try {
    const cleaned = cleanJsonString(content);
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(
      `⚠️ Cleaned JSON parse failed for ${filePath}, trying aggressive cleaning...`
    );
  }

  // Third try: more aggressive cleaning for control character issues
  try {
    // Handle specific "bad control character" errors by removing all control chars
    let aggressiveCleaned = content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove all control characters
      .replace(/\\(?!["\\/bfnrt])/g, "\\\\") // Fix escape sequences
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/^\uFEFF/, ""); // Remove BOM

    return JSON.parse(aggressiveCleaned);
  } catch (err) {
    console.warn(
      `⚠️ Aggressive cleaning failed for ${filePath}, trying regex extraction...`
    );
  }

  // Fourth try: extract just the essential fields we need
  try {
    // Try to extract basic fields using regex as last resort
    const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/);

    if (nameMatch) {
      const fallbackJson = {
        name: nameMatch[1],
        drops: {
          entries: [],
        },
      };

      // Try to extract drops if possible
      try {
        const dropsMatch = content.match(
          /"drops"\s*:\s*\{[^}]*"entries"\s*:\s*\[(.*?)\]/s
        );
        if (dropsMatch) {
          const dropsContent = dropsMatch[1];
          // Extract individual drop entries (basic regex approach)
          const dropMatches = dropsContent.match(/\{[^}]*\}/g);
          if (dropMatches) {
            fallbackJson.drops.entries = dropMatches.map((dropStr) => {
              const itemMatch = dropStr.match(/"item"\s*:\s*"([^"]+)"/);
              const quantityMatch = dropStr.match(
                /"quantityRange"\s*:\s*(\d+)/
              );
              const chanceMatch = dropStr.match(/"percentage"\s*:\s*(\d+)/);

              return {
                item: itemMatch ? itemMatch[1] : "unknown_item",
                quantityRange: quantityMatch ? parseInt(quantityMatch[1]) : 1,
                percentage: chanceMatch ? parseInt(chanceMatch[1]) : 100,
              };
            });
          }
        }
      } catch (dropErr) {
        // Ignore drop extraction errors
      }

      console.warn(
        `⚠️ Using fallback parsing for ${filePath} - extracted basic info only`
      );
      return fallbackJson;
    }
  } catch (err) {
    console.warn(`⚠️ Fallback parsing also failed for ${filePath}`);
  }

  return null;
}

export async function parseLootFromZip(file) {
  try {
    const zip = await JSZip.loadAsync(file);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    const speciesFiles = Object.keys(zip.files).filter((rawPath) => {
      const normalized = rawPath.replace(/\\/g, "/");
      const dataIndex = normalized.indexOf("data/");
      if (dataIndex === -1) return false;
      const rel = normalized.slice(dataIndex);
      // Match any depth under species or species_additions
      return /^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(rel);
    });

    for (const path of speciesFiles) {
      try {
        const zipEntry = zip.files[path];
        if (!zipEntry || zipEntry._data.uncompressedSize === 0) continue;

        let jsonStr = await zipEntry.async("string");
        const data = parseJsonWithFallbacks(jsonStr, path);

        if (data && (data.name || data.target)) {
          const displayName =
            data.name || (data.target ? data.target.split(":").pop() : null);
          const baseDrops = (data?.drops?.entries || []).map((entry) => ({
            item: entry.item || "unknown_item",
            quantity: entry.quantityRange || 1,
            chance: entry.percentage ?? 100,
          }));

          // Helper to push a loot entry
          const pushEntry = (pokemonName, drops) => {
            results.push({
              name: pokemonName || "unknown_pokemon",
              namespace: path.split("/")[1],
              pokedexNumber: data.nationalPokedexNumber ?? null,
              drops,
            });
            successCount++;
          };

          // Push base species drops if present
          if (baseDrops.length > 0) {
            pushEntry(displayName, baseDrops);
          }

          // Also handle regional forms that define their own drops
          if (Array.isArray(data.forms)) {
            const baseName = (displayName || "").toLowerCase().trim();
            for (const form of data.forms) {
              try {
                const formDrops = (form?.drops?.entries || []).map((entry) => ({
                  item: entry.item || "unknown_item",
                  quantity: entry.quantityRange || 1,
                  chance: entry.percentage ?? 100,
                }));
                if (formDrops.length === 0) continue; // Only add forms that actually define drops

                const lowerAspects = (form.aspects || []).map((a) =>
                  (a || "").toLowerCase()
                );
                const lowerLabels = (form.labels || []).map((l) =>
                  (l || "").toLowerCase()
                );
                let adjective = (form.name || "").toLowerCase();
                if (
                  lowerAspects.includes("alolan") ||
                  lowerLabels.some((l) => l.includes("alolan"))
                ) {
                  adjective = "alolan";
                } else if (
                  lowerAspects.includes("galarian") ||
                  lowerLabels.some((l) => l.includes("galarian"))
                ) {
                  adjective = "galarian";
                }
                const formName = `${adjective} ${baseName}`.trim();

                pushEntry(formName, formDrops);
              } catch (formErr) {
                errorCount++;
                console.warn(
                  `⚠️ Failed to process form drops for ${path}`,
                  formErr
                );
              }
            }
          }

          if (
            baseDrops.length === 0 &&
            (!Array.isArray(data.forms) ||
              data.forms.every(
                (f) => !f?.drops?.entries || f.drops.entries.length === 0
              ))
          ) {
            errorCount++;
            console.warn(`⚠️ Skipping ${path} - no valid drops found`);
          }
        } else {
          errorCount++;
          console.warn(`⚠️ Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        errorCount++;
        console.warn(`⚠️ Failed to parse ${path}: ${err.message}`);
      }
    }

    console.log(
      `📊 Loot parsing complete: ${successCount} successful, ${errorCount} failed`
    );
    return results;
  } catch (err) {
    console.error(`❌ Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
