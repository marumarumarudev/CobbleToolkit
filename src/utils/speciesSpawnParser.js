import JSZip from "jszip";

/**
 * Parses species/*.json and spawn_pool_world/*.json inside a Cobblemon datapack zip
 * and returns a unified array of Pokémon species + spawn info.
 */
export async function parseSpeciesAndSpawnFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const files = Object.keys(zip.files);

  const results = [];

  const speciesMap = new Map(); // name → species data
  const spawnMap = new Map(); // name → array of spawn entries

  // 1. Parse all species JSON
  for (const path of files) {
    if (!path.match(/^data\/[^/]+\/species\/.+\.json$/)) continue;

    try {
      const content = await zip.files[path].async("string");
      const json = JSON.parse(content);
      const name = (json.name || "").toLowerCase();
      if (name) speciesMap.set(name, json);
    } catch (err) {
      console.warn(`⚠️ Failed to parse species file: ${path}`, err);
    }
  }

  // 2. Parse all spawn_pool JSON
  for (const path of files) {
    if (!path.match(/^data\/[^/]+\/spawn_pool_world\/.+\.json$/)) continue;

    try {
      const content = await zip.files[path].async("string");
      const json = JSON.parse(content);

      for (const entry of json.spawns || []) {
        const name = (
          entry.pokemon ||
          entry.species ||
          entry.id ||
          ""
        ).toLowerCase();
        if (!name) continue;

        const condition = entry.condition || {};
        const anticondition = entry.anticondition || {};

        const spawnEntry = {
          bucket: entry.bucket || "unknown",
          context: entry.context || "",
          level: entry.level || "",
          weight: entry.weight || "",
          biomes: condition.biomes || [],
          dimensions: condition.dimensions || [],
          canSeeSky: condition.canSeeSky ?? null,
          timeRange: condition.timeRange || "",
          moonPhase: condition.moonPhase || "",
          isRaining: condition.isRaining ?? null,
          lightLevel:
            condition.minSkyLight || condition.maxSkyLight
              ? `${condition.minSkyLight ?? 0}-${condition.maxSkyLight ?? 15}`
              : "",
          structures: condition.structures || [],
          neededNearbyBlocks: condition.neededNearbyBlocks || [],
          antiBiomes: anticondition.biomes || [],
          antiStructures: anticondition.structures || [],
        };

        if (!spawnMap.has(name)) spawnMap.set(name, []);
        spawnMap.get(name).push(spawnEntry);
      }
    } catch (err) {
      console.warn(`⚠️ Failed to parse spawn_pool file: ${path}`, err);
    }
  }

  // 3. Merge species and spawn data
  for (const [name, speciesData] of speciesMap.entries()) {
    results.push({
      name,
      nationalDex: speciesData.nationalPokedexNumber,
      types: [speciesData.primaryType, speciesData.secondaryType].filter(
        Boolean
      ),
      stats: speciesData.baseStats,
      abilities: speciesData.abilities,
      evolutions: speciesData.evolutions || [],
      moves: speciesData.moves || [],
      eggGroups: speciesData.eggGroups || [],
      baseFriendship: speciesData.baseFriendship,
      baseExperience: speciesData.baseExperienceYield,
      evYield: speciesData.evYield || {},
      spawnData: spawnMap.get(name) || [],
      sourceFile: file.name,
    });
  }

  return results;
}
