import { writeFile } from 'node:fs/promises';
import { selectOfficialReleases, downloadOfficialArchive, OFFICIAL_PROJECT_ID } from '../src/utils/officialCobblemon.js';
import { validateFileStructure } from '../src/utils/fileValidation.js';
import { parseCobblemonZip } from '../src/utils/spawnParser.js';
import { parseSpeciesAndSpawnFromZip } from '../src/utils/speciesSpawnParser.js';
import { parseLootFromZip } from '../src/utils/lootParser.js';

// Explicit versions only. Verify original bytes and existing parsers before
// publishing metadata; a failing candidate leaves the current catalog intact.
const requested = process.argv.slice(2);
if (!requested.length || requested.some(v => !/^\d+\.\d+\.\d+$/.test(v))) throw new Error('Usage: npm run catalog:official -- 1.7.0 1.7.1 1.7.2 1.7.3 1.8.0');
const response = await fetch(`https://api.modrinth.com/v2/project/${OFFICIAL_PROJECT_ID}/version`, { headers: { 'User-Agent': 'CobbleToolkit/official-catalog-maintenance' }, signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Modrinth API: HTTP ${response.status}`);
const releases = selectOfficialReleases(await response.json(), requested);
const verification = [];
for (const release of releases) {
  console.log(`Verifying ${release.version}: ${release.size} bytes`);
  const file = await downloadOfficialArchive(release, { signal: AbortSignal.timeout(300_000) });
  // JSZip's Node reader takes bytes; browser File handling is tested in Playwright.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const structure = await validateFileStructure(bytes);
  if (!structure.valid || !structure.kinds.includes('spawn') || !structure.kinds.includes('species')) throw new Error(`${release.version}: ${structure.reason ?? 'Missing scanner data'}`);
  const diagnostics = [];
  const options = { allowRepair: false, onDiagnostic: d => diagnostics.push(d) };
  const spawns = await parseCobblemonZip(bytes, options);
  const species = await parseSpeciesAndSpawnFromZip(bytes, options);
  const loot = await parseLootFromZip(bytes, options);
  if (!spawns.length || !species.length) throw new Error(`${release.version}: empty spawn/species data`);
  const result = { version: release.version, spawns: spawns.length, species: species.length, loot: loot.length, diagnostics: diagnostics.length, diagnosticDetails: diagnostics };
  verification.push(result);
  console.log(JSON.stringify(result));
}
const catalog = { projectId: OFFICIAL_PROJECT_ID, checkedAt: new Date().toISOString(), releases, verification };
await writeFile(new URL('../public/data/officialCobblemon.json', import.meta.url), JSON.stringify(catalog, null, 2) + '\n');
console.log('Catalog verified and written. Review the metadata diff before publishing. No JARs saved.');
