import JSZip from "jszip";
import { parseJsonWithFallbacks } from "@/utils/parseJson";

const DEBUG =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

function logWarn(...args) {
  if (DEBUG) console.warn(...args);
}

function logInfo(...args) {
  if (DEBUG) console.log(...args);
}

function extractSpeciesFallback(content) {
  const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/);
  const dexMatch = content.match(/"nationalPokedexNumber"\s*:\s*(\d+)/);
  const primaryTypeMatch = content.match(/"primaryType"\s*:\s*"([^"]+)"/);
  const secondaryTypeMatch = content.match(/"secondaryType"\s*:\s*"([^"]+)"/);

  if (!nameMatch) return null;

  const fallbackJson = {
    name: nameMatch[1],
    nationalPokedexNumber: dexMatch ? parseInt(dexMatch[1], 10) : null,
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

  const hpMatch = content.match(/"hp"\s*:\s*(\d+)/);
  const atkMatch = content.match(/"attack"\s*:\s*(\d+)/);
  const defMatch = content.match(/"defence"\s*:\s*(\d+)/);
  const spaMatch = content.match(/"special_attack"\s*:\s*(\d+)/);
  const spdMatch = content.match(/"special_defence"\s*:\s*(\d+)/);
  const speMatch = content.match(/"speed"\s*:\s*(\d+)/);

  if (hpMatch) fallbackJson.baseStats.hp = parseInt(hpMatch[1], 10);
  if (atkMatch) fallbackJson.baseStats.attack = parseInt(atkMatch[1], 10);
  if (defMatch) fallbackJson.baseStats.defence = parseInt(defMatch[1], 10);
  if (spaMatch)
    fallbackJson.baseStats.special_attack = parseInt(spaMatch[1], 10);
  if (spdMatch)
    fallbackJson.baseStats.special_defence = parseInt(spdMatch[1], 10);
  if (speMatch) fallbackJson.baseStats.speed = parseInt(speMatch[1], 10);

  try {
    const movesMatch = content.match(/"moves"\s*:\s*\[(.*?)\]/s);
    if (movesMatch) {
      const moveMatches = movesMatch[1].match(/"([^"]+)"/g);
      if (moveMatches) {
        fallbackJson.moves = moveMatches.map((m) => m.replace(/"/g, ""));
      }
    }
  } catch {
    // ignore
  }

  return fallbackJson;
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
        const json = parseJsonWithFallbacks(content, path, {
          extractFallback: extractSpeciesFallback,
        });

        if (json && json.name) {
          const baseName = (json.name || "").toLowerCase().trim();

          const buildEntry = (displayName, specObj, fallback) => {
            const name = (displayName || "").toLowerCase().trim();

            const primaryType =
              specObj.primaryType ?? fallback?.primaryType;
            const secondaryType =
              specObj.secondaryType ?? fallback?.secondaryType;
            const baseStats =
              specObj.baseStats ?? fallback?.baseStats ?? {};

            // Prefer form's own evYield; fall back to root only when missing
            const evYield =
              specObj.evYield != null
                ? specObj.evYield
                : (fallback?.evYield ?? {});

            const movesArr = Array.isArray(specObj.moves)
              ? specObj.moves
              : Array.isArray(fallback?.moves)
                ? fallback.moves
                : [];

            return {
              name,
              nationalDex: parseInt(json.nationalPokedexNumber, 10) || null,
              types: [primaryType, secondaryType]
                .filter(Boolean)
                .map((t) => t.trim()),
              stats: {
                hp: parseInt(baseStats?.hp, 10) || 0,
                attack: parseInt(baseStats?.attack, 10) || 0,
                defence: parseInt(baseStats?.defence, 10) || 0,
                special_attack: parseInt(baseStats?.special_attack, 10) || 0,
                special_defence: parseInt(baseStats?.special_defence, 10) || 0,
                speed: parseInt(baseStats?.speed, 10) || 0,
              },
              evYield,
              moves: movesArr,
              sourceFile: file.name,
            };
          };

          const baseEntry = buildEntry(baseName, json, null);
          if (baseEntry.name) {
            results.push(baseEntry);
            successCount++;
          } else {
            skippedCount++;
            logWarn(`Skipping ${path} - invalid base species name`);
          }

          if (Array.isArray(json.forms)) {
            for (const form of json.forms) {
              try {
                const lowerAspects = (form.aspects || []).map((a) =>
                  (a || "").toLowerCase(),
                );
                const lowerLabels = (form.labels || []).map((l) =>
                  (l || "").toLowerCase(),
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

                const formDisplayName = `${adjective} ${baseName}`.trim();
                const formEntry = buildEntry(formDisplayName, form, json);

                if (formEntry.name) {
                  results.push(formEntry);
                  successCount++;
                } else {
                  skippedCount++;
                  logWarn(`Skipping form for ${path} - invalid form name`);
                }
              } catch (formErr) {
                errorCount++;
                logWarn(`Failed to process form for ${path}`, formErr);
              }
            }
          }
        } else {
          errorCount++;
          logWarn(`Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        errorCount++;
        logWarn(`Failed to parse species file: ${path}`, err);
      }
    }

    logInfo(
      `Parsing complete: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`,
    );
    return results;
  } catch (err) {
    console.error(`Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
