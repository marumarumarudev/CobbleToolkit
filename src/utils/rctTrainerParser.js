import JSZip from "jszip";

// ─────────────────────────────────────────────────────────────────────────
// Path/id helpers
// ─────────────────────────────────────────────────────────────────────────
// A Minecraft-style loot table id like "rctmod:generic/rare/battle" maps to
// data/rctmod/loot_table/generic/rare/battle.json — this mirrors that.
function idToPath(id) {
  const [namespace, ...rest] = id.split(":");
  return `data/${namespace}/loot_table/${rest.join(":")}.json`;
}

function pathToId(path) {
  const m = path.match(/^data\/([^/]+)\/loot_table\/(.+)\.json$/);
  if (!m) return null;
  return `${m[1]}:${m[2]}`;
}

async function readJson(zip, path) {
  const entry = zip.files[path];
  if (!entry || entry.dir) return null;
  let text = await entry.async("string");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Loot table index — every file under any namespace's loot_table/, keyed
// by its resolved id ("namespace:path/without/extension").
// ─────────────────────────────────────────────────────────────────────────
async function buildLootTableIndex(zip) {
  const index = new Map();
  const paths = Object.keys(zip.files).filter((p) =>
    p.match(/^data\/[^/]+\/loot_table\/.+\.json$/)
  );
  for (const path of paths) {
    const id = pathToId(path);
    if (!id) continue;
    const data = await readJson(zip, path);
    if (data) index.set(id, data);
  }
  return index;
}

// ─────────────────────────────────────────────────────────────────────────
// Recursive loot table resolution
// ─────────────────────────────────────────────────────────────────────────
const MAX_DEPTH = 25; // safety net on top of the cycle guard below

function normalizeRolls(rolls) {
  if (rolls == null) return { min: 1, max: 1 };
  if (typeof rolls === "number") return { min: rolls, max: rolls };
  if (typeof rolls === "object" && "min" in rolls) {
    return { min: rolls.min, max: rolls.max ?? rolls.min };
  }
  return { min: 1, max: 1 };
}

function extractSetCount(functions) {
  if (!Array.isArray(functions)) return null;
  const fn = functions.find((f) => f.function === "minecraft:set_count");
  if (!fn) return null;
  const count = fn.count;
  if (typeof count === "number") return { min: count, max: count };
  if (count && typeof count === "object") {
    return { min: count.min ?? 1, max: count.max ?? count.min ?? 1 };
  }
  return null;
}

/**
 * Recursively resolve a loot table id into a flat list of leaf item drops,
 * each annotated with a theoretical weight/chance.
 *
 * Weight model (deliberately simplified — see README note below the
 * function for the full rationale):
 *   - Within a single pool, an entry's local share = its weight / that
 *     pool's total weight (empty entries count toward the total, so they
 *     correctly dilute everyone else's share).
 *   - A `minecraft:loot_table` entry doesn't stop there — it hands its
 *     resulting probability mass down into the referenced table. Since a
 *     loot table's pools *all* fire together (not exclusively, unlike
 *     entries within one pool), the mass is split evenly across however
 *     many pools that nested table has before being distributed among
 *     each pool's own entries the same way as above. This is what makes a
 *     3-pool "guaranteed bundle" entry with weight 5 split into ~1.67 per
 *     item instead of counting each item at the full weight of 5.
 *   - This repeats at whatever depth the nesting goes, multiplying shares
 *     down the chain, so a leaf several loot tables deep still gets a
 *     sensible weight.
 *   - The running `probability` (0-1) is only ever multiplied by local
 *     shares ≤1, so it's a true probability of that specific leaf being
 *     the one selected, conditioned on this whole root table firing.
 *     `theoreticalWeight` rescales that back into the same units as the
 *     root pool's raw weights (probability × that pool's total weight) so
 *     it reads naturally next to sibling entries' plain `weight` values,
 *     and `chancePercent` is just probability × 100.
 *
 * @param {string} id - loot table id to resolve
 * @param {Map} index - id -> parsed loot table JSON
 * @param {Object} ctx
 * @returns {{ items: object[], issues: object[] }}
 */
function resolveLootTable(id, index, ctx) {
  const {
    visited,
    sourcePath,
    inheritedConditions,
    depth = 0,
    probability = 1,
    rootPoolTotalWeight = null,
  } = ctx;

  if (depth > MAX_DEPTH) {
    return {
      items: [],
      issues: [{ type: "depth-limit", id, sourcePath: [...sourcePath, id] }],
    };
  }
  if (visited.has(id)) {
    return {
      items: [],
      issues: [{ type: "cycle", id, sourcePath: [...sourcePath, id] }],
    };
  }
  const table = index.get(id);
  if (!table) {
    return {
      items: [],
      issues: [{ type: "missing", id, sourcePath: [...sourcePath, id] }],
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(id);
  const nextSourcePath = [...sourcePath, id];

  const items = [];
  const issues = [];

  const pools = Array.isArray(table.pools) ? table.pools : [];
  pools.forEach((pool, poolIndex) => {
    const rolls = normalizeRolls(pool.rolls);
    const poolConditions = pool.conditions || [];
    const entries = Array.isArray(pool.entries) ? pool.entries : [];


    const poolTotalWeight =
      entries.reduce((sum, e) => sum + (e.weight ?? 1), 0) || 1;


    const thisPoolRootTotal = depth === 0 ? poolTotalWeight : rootPoolTotalWeight;

    for (const entry of entries) {
      const entryConditions = entry.conditions || [];
      const combinedConditions = [
        ...inheritedConditions,
        ...poolConditions,
        ...entryConditions,
      ];

      const entryWeight = entry.weight ?? 1;
      const localShare = entryWeight / poolTotalWeight;
      const entryProbability = probability * localShare;
      const theoreticalWeight = entryProbability * thisPoolRootTotal;
      const chancePercent = entryProbability * 100;

      if (entry.type === "minecraft:item") {
        items.push({
          item: entry.name,
          empty: false,
          weight: entryWeight,
          theoreticalWeight,
          poolTotalWeight: thisPoolRootTotal,
          chancePercent,
          rolls,
          poolIndex,
          conditions: combinedConditions,
          setCount: extractSetCount(entry.functions),
          functions: entry.functions || [],
          sourcePath: nextSourcePath,
          direct: nextSourcePath.length === 1,
        });
      } else if (entry.type === "minecraft:loot_table") {
        if (typeof entry.value === "string") {
          const nestedTable = index.get(entry.value);
          const numPoolsNested = nestedTable?.pools?.length || 1;
          const nested = resolveLootTable(entry.value, index, {
            visited: nextVisited,
            sourcePath: nextSourcePath,
            inheritedConditions: combinedConditions,
            depth: depth + 1,
            probability: entryProbability / numPoolsNested,
            rootPoolTotalWeight: thisPoolRootTotal,
          });
          items.push(...nested.items);
          issues.push(...nested.issues);
        } else if (entry.value && typeof entry.value === "object") {

          const inlineId = `${id}#inline-pool${poolIndex}`;
          const inlinePools = Array.isArray(entry.value.pools)
            ? entry.value.pools
            : [];
          const numPoolsNested = inlinePools.length || 1;
          const fakeIndex = new Map(index);
          fakeIndex.set(inlineId, { pools: inlinePools });
          const nested = resolveLootTable(inlineId, fakeIndex, {
            visited: nextVisited,
            sourcePath: nextSourcePath,
            inheritedConditions: combinedConditions,
            depth: depth + 1,
            probability: entryProbability / numPoolsNested,
            rootPoolTotalWeight: thisPoolRootTotal,
          });
          items.push(...nested.items);
          issues.push(...nested.issues);
        }
      } else if (entry.type === "minecraft:empty") {
        items.push({
          item: null,
          empty: true,
          weight: entryWeight,
          theoreticalWeight,
          poolTotalWeight: thisPoolRootTotal,
          chancePercent,
          rolls,
          poolIndex,
          conditions: combinedConditions,
          setCount: null,
          functions: [],
          sourcePath: nextSourcePath,
          direct: nextSourcePath.length === 1,
        });
      }
      // Unknown entry types are silently skipped rather than crashing —
      // this pack only uses item / loot_table / empty, but new entry types
      // shouldn't break parsing of the rest of the file.
    }
  });

  return { items, issues };
}

function resolveTrainerLoot(rootId, index) {
  if (!rootId) {
    return { status: "none", rootTableId: null, items: [], issues: [] };
  }
  const { items, issues } = resolveLootTable(rootId, index, {
    visited: new Set(),
    sourcePath: [],
    inheritedConditions: [],
    depth: 0,
    probability: 1,
    rootPoolTotalWeight: null,
  });
  return { status: "resolved", rootTableId: rootId, items, issues };
}

// ─────────────────────────────────────────────────────────────────────────
// Trainer -> loot table linkage
// ─────────────────────────────────────────────────────────────────────────
// The datapack has no explicit field tying a trainer to its loot table.
// Verified against the real pack: the convention is filename-based —
//   1. Exact match: trainers/single/<trainerId>  (named/unique trainers)
//   2. Longest matching trainers/groups/<name> where trainerId === name or
//      trainerId starts with "<name>_"  (numbered grunts/agents/etc, and
//      league members sharing one pool)
//   3. No match — trainer has no loot table in this pack.
function resolveLootLink(trainerId, namespace, index) {
  const singleId = `${namespace}:trainers/single/${trainerId}`;
  if (index.has(singleId)) {
    return { status: "single", rootTableId: singleId, groupMatch: null };
  }

  const groupPrefix = `${namespace}:trainers/groups/`;
  let bestMatch = null;
  for (const id of index.keys()) {
    if (!id.startsWith(groupPrefix)) continue;
    const groupName = id.slice(groupPrefix.length);
    const isMatch =
      trainerId === groupName || trainerId.startsWith(`${groupName}_`);
    if (isMatch && (!bestMatch || groupName.length > bestMatch.length)) {
      bestMatch = groupName;
    }
  }
  if (bestMatch) {
    return {
      status: "group",
      rootTableId: `${groupPrefix}${bestMatch}`,
      groupMatch: bestMatch,
    };
  }

  return { status: "none", rootTableId: null, groupMatch: null };
}

// ─────────────────────────────────────────────────────────────────────────
// Trainer parsing
// ─────────────────────────────────────────────────────────────────────────
export async function parseRctTrainersFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const lootIndex = await buildLootTableIndex(zip);

  const trainerPaths = Object.keys(zip.files).filter((p) =>
    p.match(/^data\/[^/]+\/trainers\/[^/]+\.json$/)
  );

  const results = [];

  for (const path of trainerPaths) {
    try {
      const data = await readJson(zip, path);
      if (!data) continue;

      const m = path.match(/^data\/([^/]+)\/trainers\/([^/]+)\.json$/);
      const namespace = m[1];
      const trainerId = m[2];

      const team = (data.team || []).map((mon, i) => {
        const evs = mon.evs || {};
        const totalEVs = Object.values(evs).reduce(
          (sum, v) => sum + (v || 0),
          0
        );
        return {
          index: i + 1,
          species: mon.species || "unknown",
          gender: mon.gender || "UNKNOWN",
          level: mon.level ?? 1,
          nature: mon.nature || "hardy",
          ability: mon.ability || null,
          moveset: mon.moveset || [],
          ivs: mon.ivs || {},
          evs,
          totalEVs,
          heldItem: mon.heldItem || [],
          gimmicks: mon.gimmicks || {},
          aspects: mon.aspects || [],
          shiny: Boolean(mon.shiny),
        };
      });

      const lootLink = resolveLootLink(trainerId, namespace, lootIndex);
      const loot = resolveTrainerLoot(lootLink.rootTableId, lootIndex);

      const levels = team.map((p) => p.level);

      results.push({
        id: trainerId,
        namespace,
        name: data.name?.literal || data.identity || trainerId,
        sourceFile: path,
        ai: data.ai || {},
        battleFormat: data.battleFormat || "UNKNOWN",
        battleRules: data.battleRules || {},
        bag: data.bag || [],
        team,
        teamSize: team.length,
        averageLevel: levels.length
          ? Math.round(levels.reduce((s, l) => s + l, 0) / levels.length)
          : 0,
        maxLevel: levels.length ? Math.max(...levels) : 0,
        loot: {
          ...loot,
          linkStatus: lootLink.status, // "single" | "group" | "none"
          groupMatch: lootLink.groupMatch,
        },
      });
    } catch (err) {
      console.warn(`Failed to parse trainer ${path}:`, err.message);
    }
  }

  return results;
}
