import JSZip from "jszip";

export async function parseLootFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const results = [];

  const speciesFiles = Object.keys(zip.files).filter((path) =>
    path.match(/^data\/[^/]+\/species\/[^/]+\/[^/]+\.json$/)
  );

  for (const path of speciesFiles) {
    try {
      const zipEntry = zip.files[path];
      if (!zipEntry || zipEntry._data.uncompressedSize === 0) continue;

      let jsonStr = await zipEntry.async("string");
      if (jsonStr.charCodeAt(0) === 0xfeff) jsonStr = jsonStr.slice(1);

      const data = JSON.parse(jsonStr);

      const drops = (data?.drops?.entries || []).map((entry) => ({
        item: entry.item,
        quantity: entry.quantityRange || null,
        chance: entry.percentage ?? null,
      }));

      if (drops.length === 0) continue;

      results.push({
        name: data.name || path.split("/").pop().replace(".json", ""),
        namespace: path.split("/")[1],
        pokedexNumber: data.nationalPokedexNumber ?? null,
        drops,
      });
    } catch (err) {
      console.warn(`⚠️ Failed to parse ${path}: ${err.message}`);
    }
  }

  return results;
}
