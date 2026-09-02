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

function extractLootFallback(content) {
  const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/);
  if (!nameMatch) return null;

  const fallbackJson = {
    name: nameMatch[1],
    drops: { entries: [] },
  };

  try {
    const dropsMatch = content.match(
      /"drops"\s*:\s*\{[^}]*"entries"\s*:\s*\[(.*?)\]/s,
    );
    if (dropsMatch) {
      const dropMatches = dropsMatch[1].match(/\{[^}]*\}/g);
      if (dropMatches) {
        fallbackJson.drops.entries = dropMatches.map((dropStr) => {
          const itemMatch = dropStr.match(/"item"\s*:\s*"([^"]+)"/);
          const quantityMatch = dropStr.match(/"quantityRange"\s*:\s*(\d+)/);
          const chanceMatch = dropStr.match(/"percentage"\s*:\s*(\d+)/);
          return {
            item: itemMatch ? itemMatch[1] : "unknown_item",
            quantityRange: quantityMatch ? parseInt(quantityMatch[1], 10) : 1,
            percentage: chanceMatch ? parseInt(chanceMatch[1], 10) : undefined,
          };
        });
      }
    }
  } catch {
    // ignore drop extraction errors
  }

  return fallbackJson;
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
      return /^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(rel);
    });

    for (const path of speciesFiles) {
      try {
        const zipEntry = zip.files[path];
        if (!zipEntry || zipEntry._data?.uncompressedSize === 0) continue;

        const jsonStr = await zipEntry.async("string");
        const data = parseJsonWithFallbacks(jsonStr, path, {
          extractFallback: extractLootFallback,
        });

        if (data && (data.name || data.target)) {
          const displayName =
            data.name || (data.target ? data.target.split(":").pop() : null);
          const baseDrops = (data?.drops?.entries || []).map((entry) => ({
            item: entry.item || "unknown_item",
            quantity: entry.quantityRange || 1,
            chance: entry.percentage,
          }));

          const pushEntry = (pokemonName, drops) => {
            results.push({
              name: pokemonName || "unknown_pokemon",
              namespace: path.split("/")[1],
              pokedexNumber: data.nationalPokedexNumber ?? null,
              drops,
            });
            successCount++;
          };

          if (baseDrops.length > 0) {
            pushEntry(displayName, baseDrops);
          }

          if (Array.isArray(data.forms)) {
            const baseName = (displayName || "").toLowerCase().trim();
            for (const form of data.forms) {
              try {
                const formDrops = (form?.drops?.entries || []).map((entry) => ({
                  item: entry.item || "unknown_item",
                  quantity: entry.quantityRange || 1,
                  chance: entry.percentage,
                }));
                if (formDrops.length === 0) continue;

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
                const formName = `${adjective} ${baseName}`.trim();
                pushEntry(formName, formDrops);
              } catch (formErr) {
                errorCount++;
                logWarn(`Failed to process form drops for ${path}`, formErr);
              }
            }
          }

          if (
            baseDrops.length === 0 &&
            (!Array.isArray(data.forms) ||
              data.forms.every(
                (f) => !f?.drops?.entries || f.drops.entries.length === 0,
              ))
          ) {
            errorCount++;
            logWarn(`Skipping ${path} - no valid drops found`);
          }
        } else {
          errorCount++;
          logWarn(`Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        errorCount++;
        logWarn(`Failed to parse ${path}: ${err.message}`);
      }
    }

    logInfo(
      `Loot parsing complete: ${successCount} successful, ${errorCount} failed`,
    );
    return results;
  } catch (err) {
    console.error(`Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
