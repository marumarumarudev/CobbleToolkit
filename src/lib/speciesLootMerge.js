// Objects merge recursively; arrays and scalar values (including null) replace.
export function mergeSpeciesJson(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const result = { ...(base && typeof base === "object" && !Array.isArray(base) ? base : {}) };
  for (const key of Object.keys(patch)) {
    Object.defineProperty(result, key, {
      value: mergeSpeciesJson(result[key], patch[key]),
      enumerable: true, configurable: true, writable: true,
    });
  }
  return result;
}

export function mergeSpeciesEntries(base, patch) {
  if (!base || !patch.isAddition) return patch;
  const result = { ...base };
  for (const field of patch.speciesFields || []) {
    result[field] = ["stats", "evYield", "riding"].includes(field)
      ? mergeSpeciesJson(base[field], patch[field]) : patch[field];
  }
  result.ridingSources = [...(base.ridingSources || []), ...(patch.ridingSources || [])];
  result.mountDataVersion = patch.mountDataVersion;
  result.speciesFields = [...new Set([...(base.speciesFields || []), ...(patch.speciesFields || [])])];
  return result;
}

/**
 * Joins parsed species entries (speciesSpawnParser) with parsed loot entries
 * (lootParser) by Pokémon name. Both parsers already lowercase/trim `name`,
 * so it's a safe join key — this file adds no new data shape, just an index.
 *
 * A species can exist with no loot drops (most do), and — much more rarely —
 * a loot entry could exist without a matching species record if the species
 * file itself failed to parse. Both cases are represented, never hidden.
 */
export function mergeSpeciesAndLoot(species = [], lootReports = []) {
  // lootReports matches the shape LootScanner already persists:
  // [{ id, name: fileName, data: [{ name, namespace, pokedexNumber, drops }] }]
  const flatLoot = lootReports.flatMap((report) =>
    Array.isArray(report?.data) ? report.data : []
  );

  const lootByName = new Map();
  for (const drop of flatLoot) {
    if (!drop?.name) continue;
    const key = drop.name.toLowerCase().trim();
    if (!lootByName.has(key)) lootByName.set(key, []);
    lootByName.get(key).push(...(drop.drops || []));
  }

  const speciesByName = new Map();
  for (const mon of [...species.filter((mon) => !mon?.isAddition), ...species.filter((mon) => mon?.isAddition)]) {
    if (!mon?.name) continue;
    const key = mon.name.toLowerCase().trim();
    speciesByName.set(key, mergeSpeciesEntries(speciesByName.get(key), mon));
  }

  const allNames = new Set([...speciesByName.keys(), ...lootByName.keys()]);

  const merged = Array.from(allNames).map((name) => {
    const spec = speciesByName.get(name);
    const drops = lootByName.get(name) || [];
    return {
      name,
      nationalDex: spec?.nationalDex ?? null,
      types: spec?.types ?? [],
      stats: spec?.stats ?? null,
      evYield: spec?.evYield ?? null,
      moves: spec?.moves ?? [],
      sourceFile: spec?.sourceFile ?? null,
      hasSpeciesData: Boolean(spec),
      riding: spec?.riding ?? null,
      ridingSources: spec?.ridingSources ?? [],
      mountDataVersion: spec?.mountDataVersion ?? null,
      drops,
      hasLootData: drops.length > 0,
    };
  });

  merged.sort((a, b) => {
    if (a.nationalDex == null && b.nationalDex == null) return a.name.localeCompare(b.name);
    if (a.nationalDex == null) return 1;
    if (b.nationalDex == null) return -1;
    return a.nationalDex - b.nationalDex;
  });

  return merged;
}
