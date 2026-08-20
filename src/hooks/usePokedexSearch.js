"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const LIST_STORE = "pokedexListCache";

// Bumped from "pokedexDetailCache" → busts all previously cached entries
// that stored raw PokeAPI stat names ("special-attack") instead of the
// normalised Cobblemon format ("special_attack"). Any Pokémon looked up
// after this change will be re-fetched once and cached correctly.
const DETAIL_STORE = "pokedexDetailCache_v2";

const EGG_GROUP_DISPLAY_NAMES = {
  monster:       "Monster",
  water1:        "Water 1",
  bug:           "Bug",
  flying:        "Flying",
  ground:        "Field",
  fairy:         "Fairy",
  plant:         "Grass",
  humanshape:    "Human-Like",
  water3:        "Water 3",
  mineral:       "Mineral",
  indeterminate: "Amorphous",
  water2:        "Water 2",
  ditto:         "Ditto",
  dragon:        "Dragon",
  "no-eggs":     "Undiscovered",
};

/**
 * Normalize a PokeAPI stat name to the format used by Cobblemon /
 * baitSeasoningData (underscores, British spelling).
 *
 * PokeAPI:   "special-attack", "special-defense"  (hyphens, American)
 * Cobblemon: "special_attack", "special_defence"  (underscores, British)
 *
 * Without this, EV_YIELD_BERRIES.find(b => b.stat === ev.stat) never
 * matches Sp.Atk / Sp.Def Pokémon, so the berry picker falls back to
 * the egg-group berry and recommends the wrong one entirely (e.g. Kelpsey
 * instead of Hondew for Bloodmoon Ursaluna which yields 3 Sp.Atk EVs).
 */
const STAT_NAME_MAP = {
  "special-attack":  "special_attack",
  "special-defense": "special_defence", // American → British
  "special-defence": "special_defence", // future-proof
  hp:       "hp",
  attack:   "attack",
  defense:  "defence",                  // American → British
  defence:  "defence",
  speed:    "speed",
};

function normalizeStatName(pokeApiName) {
  return STAT_NAME_MAP[pokeApiName] ?? pokeApiName.replace(/-/g, "_");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function spriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Defined outside the component so it's a stable reference and doesn't
// need to be listed as a useCallback dependency (fixes the ESLint warning
// "NON_SPAWNABLE_FORM_PATTERN has a missing dependency").
const NON_SPAWNABLE_FORM_PATTERN = /-(mega|gmax|primal|totem|eternamax)(-[xy])?$/i;

export function usePokedexSearch() {
  const [allNames, setAllNames]     = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]   = useState(null);
  const detailCache       = useRef(new Map());
  const detailStoreLoaded = useRef(false);

  // ── Pokédex name list (cached in IDB) ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadList() {
      let storage = null;
      try {
        const { default: getStorage } = await import("@/utils/indexedDBStorage");
        storage = getStorage();
        const cached = await storage.loadData(LIST_STORE);
        if (Array.isArray(cached) && cached.length > 0) {
          if (!cancelled) { setAllNames(cached); setListLoading(false); }
          return;
        }
      } catch {
        // Cache read failed — fall through to live fetch
      }

      try {
        const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=2000`);
        if (!res.ok) throw new Error(`PokeAPI list request failed (${res.status})`);
        const data = await res.json();
        const names = data.results.map((p) => p.name);
        if (!cancelled) setAllNames(names);
        if (storage) {
          try { await storage.saveData(LIST_STORE, names); }
          catch (e) { console.warn("Couldn't persist Pokédex list cache:", e.message); }
        }
      } catch (err) {
        if (!cancelled) setListError(err.message || "Failed to load Pokédex list");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    loadList();
    return () => { cancelled = true; };
  }, []);

  // ── Detail cache (IDB → in-memory Map) ────────────────────────────────────
  const ensureDetailStoreLoaded = useCallback(async () => {
    if (detailStoreLoaded.current) return;
    detailStoreLoaded.current = true;
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();
      const cached = await storage.loadData(DETAIL_STORE);
      if (cached && typeof cached === "object" && !Array.isArray(cached)) {
        Object.entries(cached).forEach(([name, detail]) => {
          detailCache.current.set(name, detail);
        });
      }
    } catch {
      // Non-fatal — cache starts empty this session
    }
  }, []); // no deps — detailCache/detailStoreLoaded are refs, stable forever

  const persistDetailCache = useCallback(async () => {
    try {
      const { default: getStorage } = await import("@/utils/indexedDBStorage");
      const storage = getStorage();
      await storage.saveData(DETAIL_STORE, Object.fromEntries(detailCache.current));
    } catch {
      // Non-fatal
    }
  }, []); // no deps — detailCache is a ref

  // ── Search (NON_SPAWNABLE_FORM_PATTERN is module-level, not a dep) ────────
  const searchNames = useCallback(
    (query, limit = 20) => {
      if (!query || query.trim().length === 0) return [];
      const q = query.trim().toLowerCase();
      return allNames
        .filter((n) => n.includes(q) && !NON_SPAWNABLE_FORM_PATTERN.test(n))
        .sort((a, b) => {
          const aStarts = a.startsWith(q) ? 0 : 1;
          const bStarts = b.startsWith(q) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          return a.localeCompare(b);
        })
        .slice(0, limit);
    },
    [allNames] // NON_SPAWNABLE_FORM_PATTERN is stable (module-level const) — not needed here
  );

  // ── Detail fetch ──────────────────────────────────────────────────────────
  const fetchDetail = useCallback(
    async (name) => {
      await ensureDetailStoreLoaded();

      if (detailCache.current.has(name)) {
        return detailCache.current.get(name);
      }

      const pokemonRes = await fetch(`${POKEAPI_BASE}/pokemon/${name}`);
      if (!pokemonRes.ok) throw new Error(`Couldn't find "${name}" in the Pokédex`);
      const pokemon = await pokemonRes.json();

      // Species endpoint requires the base slug, not form-suffixed names
      const speciesRes = await fetch(`${POKEAPI_BASE}/pokemon-species/${pokemon.species.name}`);
      if (!speciesRes.ok) throw new Error(`Couldn't find "${name}" in the Pokédex`);
      const species = await speciesRes.json();

      const genderRate = species.gender_rate;
      const genderRatio =
        genderRate === -1
          ? { genderless: true }
          : { female: genderRate / 8, male: 1 - genderRate / 8 };

      // Normalize stat names before storing — this is the core fix.
      // PokeAPI returns "special-attack" / "special-defense" (hyphens, American).
      // baitSeasoningData expects "special_attack" / "special_defence" (underscores, British).
      // Mismatch caused EV_YIELD_BERRIES.find() to always return undefined for
      // Sp.Atk/Sp.Def Pokémon, recommending the wrong berry silently.
      const evYield = pokemon.stats
        .filter((s) => s.effort > 0)
        .map((s) => ({
          stat:   normalizeStatName(s.stat.name),
          amount: s.effort,
        }))
        .sort((a, b) => b.amount - a.amount);

      const result = {
        id:          pokemon.id,
        name:        capitalize(pokemon.name.replace(/-/g, " ")),
        slug:        pokemon.name,
        sprite:      pokemon.sprites?.other?.["official-artwork"]?.front_default || spriteUrl(pokemon.id),
        types:       pokemon.types.map((t) => capitalize(t.type.name)),
        eggGroups:   species.egg_groups.map(
          (g) => EGG_GROUP_DISPLAY_NAMES[g.name] || capitalize(g.name)
        ),
        isLegendary: species.is_legendary,
        isMythical:  species.is_mythical,
        isHighRarity: species.is_legendary || species.is_mythical,
        genderRatio,
        habitat:     species.habitat?.name ? capitalize(species.habitat.name) : null,
        evYield,
      };

      detailCache.current.set(name, result);
      persistDetailCache(); // fire-and-forget

      return result;
    },
    [ensureDetailStoreLoaded, persistDetailCache]
  );

  return { listLoading, listError, searchNames, fetchDetail, totalCount: allNames.length };
}
