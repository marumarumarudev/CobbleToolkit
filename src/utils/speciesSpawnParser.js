import JSZip from "jszip";

/**
 * Parses species/*.json inside a Cobblemon datapack zip
 * and returns a list of Pokémon with dex, types, stats, EVs, moves, and source.
 */
export async function parseSpeciesAndSpawnFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const files = Object.keys(zip.files);

  const results = [];

  for (const path of files) {
    if (!path.match(/^data\/[^/]+\/species\/.+\.json$/)) continue;

    try {
      const content = await zip.files[path].async("string");
      const json = JSON.parse(content);

      results.push({
        name: json.name?.toLowerCase() || "",
        nationalDex: json.nationalPokedexNumber,
        types: [json.primaryType, json.secondaryType].filter(Boolean),
        stats: json.baseStats,
        evYield: json.evYield || {},
        moves: json.moves || [],
        sourceFile: file.name,
      });
    } catch (err) {
      console.warn(`⚠️ Failed to parse species file: ${path}`, err);
    }
  }

  return results;
}
