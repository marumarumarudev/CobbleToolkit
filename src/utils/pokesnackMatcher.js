import {
  TYPE_BERRIES,
  EV_YIELD_BERRIES,
  RARITY_SHINY_BERRIES,
  EGG_GROUP_BERRIES,
  OTHER_BERRIES,
} from "@/data/baitSeasoningData";

export const RARITY_BUCKETS = [
  { id: "common", label: "Common" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare" },
  { id: "ultra-rare", label: "Ultra Rare" },
];

export const GOALS = [
  {
    id: "balanced",
    label: "Balanced",
    description: "A sensible mix of accuracy and rarity boost.",
  },
  {
    id: "efficient",
    label: "Efficient",
    description: "Cheapest ingredients that still get the job done.",
  },
  {
    id: "shiny",
    label: "Max Shiny",
    description: "Push shiny odds as high as possible.",
  },
  {
    id: "hidden-ability",
    label: "Hidden Ability",
    description: "Prioritize a shot at the hidden ability.",
  },
  {
    id: "alpha",
    label: "Alpha",
    description: "Hopo Berry — 2% chance to lure an Alpha (Cobblemon 1.8).",
  },
  {
    id: "marks",
    label: "Marks",
    description: "Micle Berry — boost mark chance on the lure.",
  },
  {
    id: "size-up",
    label: "Size XL",
    description: "Jaboca Berry — modify size by +50%.",
  },
  {
    id: "size-down",
    label: "Size XS",
    description: "Rowap Berry — modify size by −50%.",
  },
];

const findBerry = (id) => RARITY_SHINY_BERRIES.find((b) => b.id === id);
const GOLDEN_CARROT = findBerry("golden-carrot");
const GOLDEN_APPLE = findBerry("golden-apple");
const ENCHANTED_GOLDEN_APPLE = findBerry("enchanted-golden-apple");
const STARF_BERRY = findBerry("starf-berry");
const ENIGMA_BERRY = OTHER_BERRIES.find((b) => b.id === "enigma-berry");
const HOPO_BERRY = OTHER_BERRIES.find((b) => b.id === "hopo-berry");
const MICLE_BERRY = OTHER_BERRIES.find((b) => b.id === "micle-berry");
const JABOCA_BERRY = OTHER_BERRIES.find((b) => b.id === "jaboca-berry");
const ROWAP_BERRY = OTHER_BERRIES.find((b) => b.id === "rowap-berry");
const EGGANT_BERRY = EGG_GROUP_BERRIES.find((b) => b.id === "eggant-berry");

const MAX_RECOMMENDATIONS = 3;

function pickRarityAndShiny(bucket, goal) {
  if (goal === "shiny") {
    switch (bucket) {
      case "common":
        return [
          {
            seasoning: STARF_BERRY,
            reason:
              "Common targets don't need a rarity push, so this skips straight to Starf Berry — 5x shiny chance without wasting a rarity booster.",
          },
        ];
      case "uncommon":
        return [
          {
            seasoning: STARF_BERRY,
            reason: "Shiny-focused pick — 5x shiny chance, no rarity cost.",
          },
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Optional: Golden Apple stacks +1 rarity and another 2x shiny on top of Starf. Skip if you want to save the ingredient.",
          },
        ];
      case "rare":
        return [
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Golden Apple for +1 rarity tier plus 2x shiny — solid shiny path at Rare.",
          },
          {
            seasoning: STARF_BERRY,
            reason: "Stack Starf for another 5x shiny multiplier.",
          },
        ];
      case "ultra-rare":
        return [
          {
            seasoning: ENCHANTED_GOLDEN_APPLE,
            reason:
              "Ultra Rare + max shiny: Enchanted Golden Apple is +10 tiers and 10x shiny in one slot.",
          },
        ];
      default:
        return [];
    }
  }

  if (goal === "efficient") {
    switch (bucket) {
      case "common":
        return [];
      case "uncommon":
      case "rare":
        return [
          {
            seasoning: GOLDEN_CARROT,
            reason:
              "Cheapest real rarity boost — +1 tier for one Golden Carrot.",
          },
        ];
      case "ultra-rare":
        return [
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Ultra Rare still needs a push, but a plain Golden Apple is cheaper than Enchanted.",
          },
        ];
      default:
        return [];
    }
  }

  // balanced, hidden-ability, alpha, marks, size-* share the same rarity ladder
  switch (bucket) {
    case "common":
      return [];
    case "uncommon":
      return [
        {
          seasoning: GOLDEN_CARROT,
          reason:
            "Uncommon target — a Golden Carrot's +1 rarity tier is enough on its own.",
        },
      ];
    case "rare":
      return [
        {
          seasoning: GOLDEN_APPLE,
          reason:
            "Rare target — Golden Apple gives +1 tier and a 2x shiny bonus.",
        },
      ];
    case "ultra-rare":
      return [
        {
          seasoning: ENCHANTED_GOLDEN_APPLE,
          reason:
            "Ultra Rare targets justify Enchanted Golden Apple — +10 tiers and 10x shiny.",
        },
      ];
    default:
      return [];
  }
}

/**
 * Goal-specific fixed slot (Alpha / Marks / Size / HA).
 */
function pickGoalSpecial(goal) {
  switch (goal) {
    case "hidden-ability":
      return ENIGMA_BERRY
        ? [
            {
              seasoning: ENIGMA_BERRY,
              reason:
                "Hidden Ability goal — Enigma Berry is the only seasoning that can roll HA (5%).",
              slotKind: "fixed",
            },
          ]
        : [];
    case "alpha":
      return HOPO_BERRY
        ? [
            {
              seasoning: HOPO_BERRY,
              reason:
                "Alpha goal (1.8) — Hopo Berry is the dedicated alpha lure (2% chance). Stack rarity boosters in the other slots if the species is rare.",
              slotKind: "fixed",
            },
          ]
        : [];
    case "marks":
      return MICLE_BERRY
        ? [
            {
              seasoning: MICLE_BERRY,
              reason:
                "Marks goal (1.8) — Micle Berry adds mark chance on the lure.",
              slotKind: "fixed",
            },
          ]
        : [];
    case "size-up":
      return JABOCA_BERRY
        ? [
            {
              seasoning: JABOCA_BERRY,
              reason:
                "Size XL goal (1.8) — Jaboca Berry modifies lure size by +50%.",
              slotKind: "fixed",
            },
          ]
        : [];
    case "size-down":
      return ROWAP_BERRY
        ? [
            {
              seasoning: ROWAP_BERRY,
              reason:
                "Size XS goal (1.8) — Rowap Berry modifies lure size by −50%.",
              slotKind: "fixed",
            },
          ]
        : [];
    default:
      return [];
  }
}

/**
 * Valid targeting berries for a species.
 * Priority: Ditto egg-group (Eggant) → EV yield → type → other egg groups.
 *
 * Egg-group baits ARE valid on Poké Snacks in Cobblemon 1.8 (same
 * spawn_bait_effects as fishing bait). Skipping them was wrong and hid
 * Eggant from every Ditto recommendation.
 */
function buildTargetingCandidates(target) {
  const {
    types = [],
    evYield = [],
    eggGroups = [],
    name = "",
  } = target || {};
  const candidates = [];
  const seen = new Set();

  const add = (seasoning, reason, tier) => {
    if (!seasoning || seen.has(seasoning.id)) return;
    seen.add(seasoning.id);
    candidates.push({ seasoning, reason, tier });
  };

  const groups = Array.isArray(eggGroups) ? eggGroups : [];
  const isDitto =
    String(name).toLowerCase() === "ditto" ||
    groups.some((g) => String(g).toLowerCase() === "ditto");

  // Tier -1: Ditto → Eggant is the correct 10x species filter
  if (isDitto && EGGANT_BERRY) {
    add(
      EGGANT_BERRY,
      "Ditto's egg group is unique — Eggant Berry is a 10× Ditto lure and the best accuracy seasoning for this species. Cobblemon 1.8+ only.",
      -1
    );
  }

  // Tier 0: EV-yield berries
  for (const ev of evYield) {
    const berry = EV_YIELD_BERRIES.find((b) => b.stat === ev.stat);
    if (berry) {
      add(
        berry,
        `Matches this species' EV yield (${ev.amount} ${berry.statLabel}) — narrows the pool to Pokémon that train the same stat.`,
        0
      );
    }
  }

  // Tier 1: type berries
  for (const type of types) {
    const berry = TYPE_BERRIES.find((b) => b.type === type);
    if (berry) {
      add(
        berry,
        types.length > 1
          ? `Matches its ${type} type (one of ${types.join("/")}) — 10× spawn weight for that type.`
          : `Matches its ${type} type — 10× spawn weight, a direct way to narrow the pool.`,
        1
      );
    }
  }

  // Tier 2: egg-group berries (Eggant already added for Ditto)
  for (const group of groups) {
    for (const berry of EGG_GROUP_BERRIES) {
      if (!berry.eggGroups?.includes(group)) continue;
      if (berry.id === "eggant-berry" && isDitto) continue;
      add(
        berry,
        `Matches egg group ${group} — 10× weight for that group (valid on Poké Snacks in 1.8).`,
        2
      );
    }
  }

  candidates.sort((a, b) => a.tier - b.tier);
  return candidates;
}

/**
 * @param {Object} target - from usePokedexSearch detail
 * @param {string} rarityBucket
 * @param {string} goal
 */
export function recommendSeasonings(
  target,
  rarityBucket = "common",
  goal = "balanced"
) {
  const notes = [];
  const recommendations = [];

  for (const pick of pickGoalSpecial(goal)) {
    if (recommendations.length >= MAX_RECOMMENDATIONS) break;
    recommendations.push(pick);
  }

  const rarityPicks = pickRarityAndShiny(rarityBucket, goal);
  for (const pick of rarityPicks) {
    if (recommendations.length >= MAX_RECOMMENDATIONS) break;
    if (recommendations.some((r) => r.seasoning?.id === pick.seasoning?.id)) {
      continue;
    }
    recommendations.push({ ...pick, slotKind: "fixed" });
  }

  if (
    rarityBucket === "common" &&
    goal !== "shiny" &&
    !["alpha", "marks", "size-up", "size-down", "hidden-ability"].includes(goal)
  ) {
    notes.push(
      "No rarity or shiny booster recommended for a Common target — use free slots for species accuracy instead."
    );
  }

  const accuracyCandidates = buildTargetingCandidates(target);
  const remainingSlots = MAX_RECOMMENDATIONS - recommendations.length;
  const accuracyPicks = accuracyCandidates
    .filter(
      (c) => !recommendations.some((r) => r.seasoning?.id === c.seasoning?.id)
    )
    .slice(0, Math.max(0, remainingSlots))
    .map((c) => ({
      seasoning: c.seasoning,
      reason: c.reason,
      slotKind: "targeting",
    }));
  recommendations.push(...accuracyPicks);

  if (accuracyCandidates.length === 0) {
    notes.push(
      "No type, EV-yield, or egg-group berry matched this species — double-check its data, or it may be a custom datapack species outside the standard Pokédex."
    );
  }

  if (recommendations.length === 0) {
    notes.push(
      "No confident recommendation could be built for this combination — try a different goal or double-check the species data."
    );
  }

  const name = String(target?.name || "").toLowerCase();
  if (name === "ditto" || target?.eggGroups?.includes?.("Ditto")) {
    notes.push(
      "Ditto tip: Eggant Berry is the 10× Ditto egg-group lure — keep it in a slot whenever accuracy matters. Cobblemon 1.8+ only!"
    );
  }

  return {
    recommendations: recommendations.slice(0, MAX_RECOMMENDATIONS),
    notes,
    targetingPool: accuracyCandidates,
  };
}
