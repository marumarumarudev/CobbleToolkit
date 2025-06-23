import JSZip from "jszip";

/**
 * Parses a Cobblemon spawn .zip file and returns Pokémon spawn data.
 */
export async function parseCobblemonZip(file) {
  const zip = await JSZip.loadAsync(file);
  const results = [];

  const namespaces = Object.keys(zip.files)
    .filter(
      (name) => name.startsWith("data/") && name.includes("/spawn_pool_world/")
    )
    .map((name) => name.split("/")[1]);

  const uniqueNamespaces = [...new Set(namespaces)];

  for (const namespace of uniqueNamespaces) {
    const folderPath = `data/${namespace}/spawn_pool_world/`;

    const jsonFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith(folderPath) && name.endsWith(".json")
    );

    for (const fileName of jsonFiles) {
      try {
        const content = await zip.files[fileName].async("string");
        const json = JSON.parse(content);

        for (const entry of json.spawns || []) {
          const condition = entry.condition || {};

          results.push({
            pokemon: String(
              entry.pokemon || entry.species || entry.id || "Unknown"
            ),
            bucket: String(entry.bucket || "Unknown"),
            level: String(entry.level ?? ""),
            weight: String(entry.weight ?? ""),
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
            neededNearbyBlocks: Array.isArray(condition.neededNearbyBlocks)
              ? condition.neededNearbyBlocks.join(", ")
              : "",
          });
        }
      } catch (err) {
        console.error(`❌ Failed to parse ${fileName}`, err);
      }
    }
  }

  return results;
}
