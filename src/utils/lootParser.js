import { loadArchive, readArchiveText, createProcessingContext, rethrowProcessingError } from "./archiveProcessing.js";
import { parseJsonWithFallbacks } from "./parseJson.js";
import { indexDatapackArchive } from "./archivePaths.js";

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

export async function parseLootFromZip(file, options = {}) {
  const { onDiagnostic = () => {} } = options;
  const processing = createProcessingContext(options);
  const buildDrops = async (entries) => {
    const drops = [];
    for (const entry of entries) {
      await processing.checkpoint();
      processing.row();
      drops.push({ item: entry.item || "unknown_item", quantity: entry.quantityRange || 1, chance: entry.percentage });
    }
    return drops;
  };
  try {
    const zip = indexDatapackArchive(await loadArchive(file, options), options);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    const speciesFiles = Object.keys(zip.files).filter((path) =>
      /^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(path),
    );

    for (const path of speciesFiles) {
      await processing.checkpoint();
      try {
        const zipEntry = zip.files[path];
        if (!zipEntry) continue;

        const jsonStr = await readArchiveText(zipEntry, options);
        const data = parseJsonWithFallbacks(jsonStr, path, {
          ...options,
          extractFallback: extractLootFallback,
        });

        if (data && (data.name || data.target)) {
          const displayName =
            data.name || (data.target ? data.target.split(":").pop() : null);
          const baseDrops = await buildDrops(data?.drops?.entries || []);

          const pushEntry = (pokemonName, drops) => {
            processing.row();
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
              await processing.checkpoint();
              try {
                const formDrops = await buildDrops(form?.drops?.entries || []);
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
                rethrowProcessingError(formErr);
                onDiagnostic({ path, code: "invalid-form", message: formErr.message });
                errorCount++;
                logWarn(`Failed to process form drops for ${path}`, formErr);
              }
            }
          }


        } else {
          errorCount++;
          if (data) onDiagnostic({ path, code: "invalid-structure", message: "Missing valid species identity." });
          logWarn(`Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        rethrowProcessingError(err);
        onDiagnostic({ path: typeof path === "string" ? path : file.name, code: "processing-error", message: err.message });
        errorCount++;
        logWarn(`Failed to parse ${path}: ${err.message}`);
      }
    }

    logInfo(
      `Loot parsing complete: ${successCount} successful, ${errorCount} failed`,
    );
    return results;
  } catch (err) {
        rethrowProcessingError(err);
        onDiagnostic({ path: typeof path === "string" ? path : file.name, code: "processing-error", message: err.message });
    console.error(`Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
