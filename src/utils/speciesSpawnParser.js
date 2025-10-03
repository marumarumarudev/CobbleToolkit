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
      `⚠️ Cleaned JSON parse failed for ${filePath}, trying to extract valid parts...`
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
    const dexMatch = content.match(/"nationalPokedexNumber"\s*:\s*(\d+)/);
    const primaryTypeMatch = content.match(/"primaryType"\s*:\s*"([^"]+)"/);
    const secondaryTypeMatch = content.match(/"secondaryType"\s*:\s*"([^"]+)"/);

    if (nameMatch) {
      const fallbackJson = {
        name: nameMatch[1],
        nationalPokedexNumber: dexMatch ? parseInt(dexMatch[1]) : null,
        primaryType: primaryTypeMatch ? primaryTypeMatch[1] : null,
        secondaryType: secondaryTypeMatch ? secondaryTypeMatch[1] : null,
        baseStats: {
          hp: 0,
          attack: 0,
          defence: 0,
          special_attack: 0,
          special_defence: 0,
          speed: 0,
        },
        evYield: {},
        moves: [],
      };

      // Try to extract stats
      const hpMatch = content.match(/"hp"\s*:\s*(\d+)/);
      const atkMatch = content.match(/"attack"\s*:\s*(\d+)/);
      const defMatch = content.match(/"defence"\s*:\s*(\d+)/);
      const spaMatch = content.match(/"special_attack"\s*:\s*(\d+)/);
      const spdMatch = content.match(/"special_defence"\s*:\s*(\d+)/);
      const speMatch = content.match(/"speed"\s*:\s*(\d+)/);

      if (hpMatch) fallbackJson.baseStats.hp = parseInt(hpMatch[1]);
      if (atkMatch) fallbackJson.baseStats.attack = parseInt(atkMatch[1]);
      if (defMatch) fallbackJson.baseStats.defence = parseInt(defMatch[1]);
      if (spaMatch)
        fallbackJson.baseStats.special_attack = parseInt(spaMatch[1]);
      if (spdMatch)
        fallbackJson.baseStats.special_defence = parseInt(spdMatch[1]);
      if (speMatch) fallbackJson.baseStats.speed = parseInt(speMatch[1]);

      // Try to extract moves if possible
      try {
        const movesMatch = content.match(/"moves"\s*:\s*\[(.*?)\]/s);
        if (movesMatch) {
          const movesContent = movesMatch[1];
          // Extract individual moves (basic regex approach)
          const moveMatches = movesContent.match(/"([^"]+)"/g);
          if (moveMatches) {
            fallbackJson.moves = moveMatches.map((m) => m.replace(/"/g, ""));
          }
        }
      } catch (moveErr) {
        // Ignore move extraction errors
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

/**
 * Parses species/*.json inside a Cobblemon datapack zip
 * and returns a list of Pokémon with dex, types, stats, EVs, moves, and source.
 */
export async function parseSpeciesAndSpawnFromZip(file) {
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const path of files) {
      if (!path.match(/^data\/[^/]+\/species\/.+\.json$/)) continue;

      try {
        const content = await zip.files[path].async("string");
        const json = parseJsonWithFallbacks(content, path);

        if (json && json.name) {
          // Helper to build a normalized species entry from a base or form object
          const buildEntry = (baseName, specObj, fallback) => {
            const name = (baseName || "").toLowerCase().trim();
            const primaryType = specObj.primaryType ?? fallback?.primaryType;
            const secondaryType =
              specObj.secondaryType ?? fallback?.secondaryType;
            const baseStats = specObj.baseStats ?? fallback?.baseStats ?? {};
            const movesArr = Array.isArray(specObj.moves)
              ? specObj.moves
              : Array.isArray(fallback?.moves)
              ? fallback.moves
              : [];

            return {
              name,
              nationalDex: parseInt(json.nationalPokedexNumber) || null,
              types: [primaryType, secondaryType]
                .filter(Boolean)
                .map((t) => t.trim()),
              stats: {
                hp: parseInt(baseStats?.hp) || 0,
                attack: parseInt(baseStats?.attack) || 0,
                defence: parseInt(baseStats?.defence) || 0,
                special_attack: parseInt(baseStats?.special_attack) || 0,
                special_defence: parseInt(baseStats?.special_defence) || 0,
                speed: parseInt(baseStats?.speed) || 0,
              },
              evYield: json.evYield || {},
              moves: movesArr,
              sourceFile: file.name,
            };
          };

          // Base species entry
          const baseName = (json.name || "").toLowerCase().trim();
          const baseEntry = buildEntry(baseName, json);
          if (baseEntry.name) {
            results.push(baseEntry);
            successCount++;
          } else {
            skippedCount++;
            console.warn(`⚠️ Skipping ${path} - invalid base species name`);
          }

          // Regional forms (e.g., Alolan, Galarian)
          if (Array.isArray(json.forms)) {
            for (const form of json.forms) {
              try {
                // Determine adjective (alolan/galarian/others) if available
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

                const formDisplayBase = `${adjective} ${baseName}`.trim();
                const formEntry = buildEntry(formDisplayBase, form, json);

                if (formEntry.name) {
                  results.push(formEntry);
                  successCount++;
                } else {
                  skippedCount++;
                  console.warn(
                    `⚠️ Skipping form for ${path} - invalid form name`
                  );
                }
              } catch (formErr) {
                errorCount++;
                console.warn(`⚠️ Failed to process form for ${path}`, formErr);
              }
            }
          }
        } else {
          errorCount++;
          console.warn(`⚠️ Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        errorCount++;
        console.warn(`⚠️ Failed to parse species file: ${path}`, err);
      }
    }

    console.log(
      `📊 Parsing complete: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`
    );
    return results;
  } catch (err) {
    console.error(`❌ Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
