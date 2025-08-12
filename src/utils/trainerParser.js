import JSZip from "jszip";

export async function parseTrainersFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const results = [];

  // Look for trainer files in various possible locations
  const trainerFiles = Object.keys(zip.files).filter((path) =>
    path.match(/^data\/[^/]+\/trainers\/[^/]+\.json$/)
  );

  for (const path of trainerFiles) {
    try {
      const zipEntry = zip.files[path];
      if (!zipEntry || zipEntry._data.uncompressedSize === 0) continue;

      let jsonStr = await zipEntry.async("string");
      if (jsonStr.charCodeAt(0) === 0xfeff) jsonStr = jsonStr.slice(1);

      const data = JSON.parse(jsonStr);

      // Extract trainer info
      const trainer = {
        name:
          data.name?.literal ||
          data.identity ||
          path.split("/").pop().replace(".json", ""),
        identity:
          data.identity ||
          data.name?.literal ||
          path.split("/").pop().replace(".json", ""),
        namespace: path.split("/")[1],
        ai: data.ai || {},
        battleFormat: data.battleFormat || "UNKNOWN",
        battleRules: data.battleRules || {},
        bag: data.bag || [],
        team: (data.team || []).map((pokemon, index) => ({
          index: index + 1,
          species: pokemon.species || "unknown",
          gender: pokemon.gender || "UNKNOWN",
          level: pokemon.level || 1,
          nature: pokemon.nature || "hardy",
          ability: pokemon.ability || "unknown",
          moveset: pokemon.moveset || [],
          ivs: pokemon.ivs || {},
          evs: pokemon.evs || {},
          heldItem: pokemon.heldItem || [],
          gimmicks: pokemon.gimmicks || {},
          aspects: pokemon.aspects || [],
          shiny: pokemon.shiny || false,
        })),
        sourceFile: path,
      };

      // Calculate some useful stats
      trainer.teamSize = trainer.team.length;
      trainer.averageLevel =
        trainer.team.length > 0
          ? Math.round(
              trainer.team.reduce((sum, p) => sum + p.level, 0) /
                trainer.team.length
            )
          : 0;

      trainer.maxLevel =
        trainer.team.length > 0
          ? Math.max(...trainer.team.map((p) => p.level))
          : 0;

      // Calculate total EVs for each Pokémon
      trainer.team.forEach((pokemon) => {
        const totalEVs = Object.values(pokemon.evs).reduce(
          (sum, ev) => sum + (ev || 0),
          0
        );
        pokemon.totalEVs = totalEVs;
        pokemon.evSpread = Object.entries(pokemon.evs)
          .filter(([_, ev]) => ev > 0)
          .sort(([_, a], [__, b]) => b - a)
          .map(([stat, ev]) => `${ev} ${stat.toUpperCase()}`)
          .join(", ");
      });

      results.push(trainer);
    } catch (err) {
      console.warn(`⚠️ Failed to parse trainer ${path}: ${err.message}`);
    }
  }

  return results;
}
