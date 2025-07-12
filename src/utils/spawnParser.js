import JSZip from "jszip";

/**
 * Parses a Cobblemon spawn .zip file and returns Pokémon spawn data.
 */
export async function parseCobblemonZip(file) {
  const zip = await JSZip.loadAsync(file);

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
        const zipEntry = zip.files[fileName];

        if (!zipEntry || zipEntry._data.uncompressedSize === 0) {
          console.warn(`⚠️ Skipping empty or missing file: ${fileName}`);
          continue;
        }

        const content = await zipEntry.async("string");

        // Ensure it is valid JSON
        let json;
        try {
          json = JSON.parse(content);
        } catch (parseErr) {
          console.warn(`⚠️ Skipping invalid JSON in: ${fileName}`);
          continue;
        }

        for (const entry of json.spawns || []) {
          const condition = entry.condition || {};
          const anticondition = entry.anticondition || {};

          results.push({
            pokemon: String(
              entry.pokemon || entry.species || entry.id || "Unknown"
            ),
            bucket: String(entry.bucket || "Unknown"),
            level: String(entry.level ?? ""),
            weight: String(entry.weight ?? ""),
            context: String(entry.context || "none"),
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
            lightLevel:
              condition.minSkyLight != null && condition.maxSkyLight != null
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
      } catch (err) {
        console.error(`❌ Failed to process ${fileName}`, err);
      }
    }
  }

  return results;
}
