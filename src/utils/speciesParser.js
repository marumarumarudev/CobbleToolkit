import JSZip from "jszip";

export async function parseSpeciesFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const results = [];

  const speciesFiles = Object.keys(zip.files).filter((path) =>
    path.match(/^data\/[^/]+\/species\/[^/]+\/[^/]+\.json$/)
  );

  for (const path of speciesFiles) {
    try {
      if (!file || file.size === 0) {
        throw new Error("Uploaded file is empty.");
      }

      const zipEntry = zip.files[path];
      if (zipEntry._data.uncompressedSize === 0) {
        console.warn(`⚠️ Skipping empty species file: ${path}`);
        continue;
      }

      let jsonStr = await zip.files[path].async("string");

      // Remove BOM if present
      if (jsonStr.charCodeAt(0) === 0xfeff) {
        jsonStr = jsonStr.slice(1);
        jsonStr = jsonStr.replace(/\u0009/g, "  ");
      }

      const data = JSON.parse(jsonStr);

      const drops = (data?.drops?.entries || []).map((entry) => ({
        item: entry.item,
        quantity: entry.quantityRange || null,
        chance: entry.percentage ?? null,
      }));

      const baseStats = data.baseStats || {};
      const evYield = data.evYield || {};

      results.push({
        name: data.name || path.split("/").pop().replace(".json", ""),
        namespace: path.split("/")[1],
        filePath: path,
        types: [data.primaryType, data.secondaryType].filter(Boolean),
        pokedexNumber: data.nationalPokedexNumber ?? null,
        abilities: data.abilities || [],
        eggGroups: data.eggGroups || [],
        isShoulderMountable: data.shoulderMountable ?? false,
        experienceGroup: data.experienceGroup || null,
        baseExperienceYield: data.baseExperienceYield ?? null,
        catchRate: data.catchRate ?? "—",
        height: data.height ?? null,
        weight: data.weight ?? null,
        baseStats,
        evYield,
        preEvolution: data.preEvolution || null,
        evolutions: (data.evolutions || []).map((evo) => ({
          to: evo.result,
          method: evo.variant,
          movesRequired: evo.learnableMoves || [],
          requirements: evo.requirements || [],
        })),
        moves: {
          levelUp: (data.moves || [])
            .filter((m) => /^\d+:/.test(m))
            .map((m) => m.replace(/^\d+:/, "")),
          egg: (data.moves || [])
            .filter((m) => m.startsWith("egg:"))
            .map((m) => m.replace("egg:", "")),
          tm: (data.moves || [])
            .filter((m) => m.startsWith("tm:"))
            .map((m) => m.replace("tm:", "")),
          tutor: (data.moves || [])
            .filter((m) => m.startsWith("tutor:"))
            .map((m) => m.replace("tutor:", "")),
        },
        drops,
      });
    } catch (err) {
      console.error(`❌ Failed to parse ${path}`);
      console.error(err?.message || err || "Unknown error");
    }
  }

  return results;
}
