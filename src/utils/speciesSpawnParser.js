import { loadArchive, readArchiveText, createProcessingContext, rethrowProcessingError } from "./archiveProcessing.js";
import { parseJsonWithFallbacks } from "./parseJson.js";
import { indexDatapackArchive } from "./archivePaths.js";
import { mergeSpeciesJson } from "../lib/speciesLootMerge.js";

const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function formIdentity(form) {
  if (typeof form?.name === "string" && form.name.trim()) {
    return `name:${form.name.trim().toLowerCase()}`;
  }
  if (Array.isArray(form?.aspects) && form.aspects.length > 0 &&
      form.aspects.every((aspect) => typeof aspect === "string" && aspect.trim())) {
    return `aspects:${JSON.stringify(form.aspects.map((aspect) => aspect.trim().toLowerCase()).sort())}`;
  }
  return null;
}

async function mergeDocument(base, patch, processing) {
  await processing.checkpoint();
  processing.row();
  const merged = mergeSpeciesJson(base, patch);
  merged.ridingSources = [...(base?.ridingSources || []), ...(patch.ridingSources || [])];
  if (Array.isArray(patch.forms)) {
    merged.forms = [...(base?.forms || [])];
    const indices = new Map();
    for (const [index, form] of merged.forms.entries()) {
      await processing.checkpoint();
      processing.row();
      const identity = formIdentity(form);
      // Preserve findIndex's first-match behavior for duplicate base forms.
      if (identity !== null && !indices.has(identity)) indices.set(identity, index);
    }
    for (const form of patch.forms) {
      await processing.checkpoint();
      processing.row();
      const identity = formIdentity(form);
      const index = identity === null ? undefined : indices.get(identity);
      if (index === undefined) {
        if (identity !== null) indices.set(identity, merged.forms.length);
        merged.forms.push(form);
      } else {
        merged.forms[index] = await mergeDocument(merged.forms[index], form, processing);
      }
    }
  }
  return merged;
}

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
export async function parseSpeciesAndSpawnFromZip(file, options = {}) {
  const { onDiagnostic = () => {} } = options;
  const processing = createProcessingContext(options);
  const mergeProcessing = createProcessingContext(options);
  try {
    const zip = indexDatapackArchive(await loadArchive(file, options), options);
    const files = Object.keys(zip.files);
    const documents = new Map();
    // Resolve bases before additions regardless of ZIP insertion order.
    const ordered = [
      ...files.filter((path) => /\/species\//.test(path)),
      ...files.filter((path) => /\/species_additions\//.test(path)),
    ];
    for (const path of ordered) {
      await processing.checkpoint();
      if (!/^data\/[^/]+\/(species|species_additions)\/.+\.json$/.test(path)) continue;
      try {
        const isAddition = path.includes("/species_additions/");
        const content = await readArchiveText(zip.files[path], options);
        const json = parseJsonWithFallbacks(content, path, {
          ...options, extractFallback: isAddition ? undefined : extractSpeciesFallback,
        });
        if (!json) continue;
        const identity = isAddition ? json.target : json.name;
        if (typeof identity !== "string" || !identity.trim()) {
          onDiagnostic({ path, code: "invalid-structure", message: "Missing valid species identity." });
          continue;
        }
        const name = identity.split(":").pop().toLowerCase().trim();
        const provenance = { sourceFile: file.name, path };
        json.ridingSources = owns(json, "riding") ? [provenance] : [];
        if (Array.isArray(json.forms)) {
          const forms = [];
          for (const form of json.forms) {
            await mergeProcessing.checkpoint();
            mergeProcessing.row();
            forms.push(form && ({ ...form,
              ridingSources: owns(form, "riding") ? [provenance] : [],
            }));
          }
          json.forms = forms;
        }
        const previous = documents.get(name);
        documents.set(name, {
          path, isAddition: isAddition && (!previous || previous.isAddition),
          json: isAddition ? await mergeDocument(previous?.json, { ...json, name }, mergeProcessing) : json,
        });
      } catch (err) {
        rethrowProcessingError(err);
        onDiagnostic({ path, code: "processing-error", message: err.message });
      }
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const { path, json, isAddition } of documents.values()) {
      await processing.checkpoint();
      try {
        if (json && json.name) {
          const baseName = (json.name || "").toLowerCase().trim();

          const buildEntry = (displayName, specObj, fallback) => {
            const name = (displayName || "").toLowerCase().trim();

            const primaryType =
              specObj.primaryType ?? fallback?.primaryType;
            const secondaryType =
              specObj.secondaryType ?? fallback?.secondaryType;
            const baseStats =
              specObj.baseStats ?? fallback?.baseStats;

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
              stats: baseStats == null ? null : Object.fromEntries(
                ["hp", "attack", "defence", "special_attack", "special_defence", "speed"]
                  .filter((key) => !isAddition || owns(baseStats, key))
                  .map((key) => [key, parseInt(baseStats[key], 10) || 0]),
              ),
              evYield,
              moves: movesArr,
              sourceFile: file.name,
              isAddition,
              speciesFields: Object.entries({
                nationalDex: ["nationalPokedexNumber"], types: ["primaryType", "secondaryType"],
                stats: ["baseStats"], evYield: ["evYield"], moves: ["moves"], riding: ["riding"],
              }).filter(([, keys]) => keys.some((key) => owns(specObj, key) || (fallback && owns(fallback, key))))
                .map(([field]) => field),
              riding: owns(specObj, "riding") ? specObj.riding : (fallback?.riding ?? null),
              ridingSources: owns(specObj, "riding") ? specObj.ridingSources : (fallback?.ridingSources || []),
              mountDataVersion: 1,
            };
          };

          const baseEntry = buildEntry(baseName, json, null);
          if (baseEntry.name) {
            processing.row();
            results.push(baseEntry);
            successCount++;
          } else {
            skippedCount++;
            logWarn(`Skipping ${path} - invalid base species name`);
          }

          if (Array.isArray(json.forms)) {
            for (const form of json.forms) {
              await processing.checkpoint();
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
                  processing.row();
                  results.push(formEntry);
                  successCount++;
                } else {
                  skippedCount++;
                  logWarn(`Skipping form for ${path} - invalid form name`);
                }
              } catch (formErr) {
                rethrowProcessingError(formErr);
                onDiagnostic({ path, code: "invalid-form", message: formErr.message });
                errorCount++;
                logWarn(`Failed to process form for ${path}`, formErr);
              }
            }
          }
        } else {
          errorCount++;
          if (json) onDiagnostic({ path, code: "invalid-structure", message: "Missing valid species identity." });
          logWarn(`Skipping ${path} - no valid data extracted`);
        }
      } catch (err) {
        rethrowProcessingError(err);
        onDiagnostic({ path: typeof path === "string" ? path : file.name, code: "processing-error", message: err.message });
        errorCount++;
        logWarn(`Failed to parse species file: ${path}`, err);
      }
    }

    logInfo(
      `Parsing complete: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`,
    );
    return results;
  } catch (err) {
    rethrowProcessingError(err);
    onDiagnostic({ path: typeof path === "string" ? path : file.name, code: "processing-error", message: err.message });
    console.error(`Failed to process zip file ${file.name}:`, err);
    throw new Error(`Failed to process zip file: ${err.message}`);
  }
}
