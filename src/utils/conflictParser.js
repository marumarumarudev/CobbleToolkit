import JSZip from "jszip";

export async function parseDatapackConflicts(fileList) {
  const zipMap = new Map();

  for (const file of fileList) {
    const zip = await JSZip.loadAsync(file);

    for (const path in zip.files) {
      if (
        zip.files[path].dir ||
        !path.startsWith("data/") ||
        !path.endsWith(".json")
      )
        continue;

      const parts = path.split("/");
      if (parts.length < 4) continue;

      const namespace = parts[1];
      const filename = parts.at(-1);
      const pokemon = filename.replace(".json", "");

      try {
        const contentStr = await zip.files[path].async("string");
        const json = JSON.parse(contentStr);

        const isSpawnPool = Array.isArray(json?.spawns);
        if (!isSpawnPool) continue;

        const spawns = json.spawns.map((s) => ({
          id: s.id || null,
          biomes: s.condition?.biomes || [],
          rarity: s.bucket || null,
          level: s.level || null,
          raw: s,
        }));

        if (!zipMap.has(pokemon)) zipMap.set(pokemon, []);
        zipMap.get(pokemon).push({
          namespace,
          file: file.name,
          path,
          spawns,
        });
      } catch {
        continue;
      }
    }
  }

  const results = [];

  for (const [pokemon, sources] of zipMap.entries()) {
    // Collect all IDs and count how many times each appears across datapacks
    const idCounts = {};
    sources.forEach((src) => {
      src.spawns.forEach((spawn) => {
        if (!spawn.id) return;
        idCounts[spawn.id] = (idCounts[spawn.id] || 0) + 1;
      });
    });

    const hasTrueConflict = Object.values(idCounts).some((count) => count > 1);

    if (hasTrueConflict) {
      results.push({
        pokemon,
        conflict: true,
        sources,
      });
    }
  }

  return results;
}
