import {
  TYPE_BERRIES,
  EV_YIELD_BERRIES,
  RARITY_SHINY_BERRIES,
  OTHER_BERRIES,
} from "@/data/baitSeasoningData";

export const RARITY_BUCKETS = [
  { id: "common", label: "Common" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare" },
  { id: "ultra-rare", label: "Ultra Rare" },
];

export const GOALS = [
  { id: "balanced", label: "Balanced", description: "A sensible mix of accuracy and rarity boost." },
  { id: "efficient", label: "Efficient", description: "Cheapest ingredients that still get the job done." },
  { id: "shiny", label: "Max Shiny", description: "Push shiny odds as high as possible." },
  { id: "hidden-ability", label: "Hidden Ability", description: "Prioritize a shot at the hidden ability." },
];

const findBerry = (id) => RARITY_SHINY_BERRIES.find((b) => b.id === id);
const GOLDEN_CARROT = findBerry("golden-carrot");
const GOLDEN_APPLE = findBerry("golden-apple");
const ENCHANTED_GOLDEN_APPLE = findBerry("enchanted-golden-apple");
const STARF_BERRY = findBerry("starf-berry");
const ENIGMA_BERRY = OTHER_BERRIES.find((b) => b.id === "enigma-berry");

const MAX_RECOMMENDATIONS = 3;

/**
 * Choose the rarity/shiny seasoning(s) for a target rarity bucket + goal.
 * Returns an array (0-2 items) since a shiny-focused Uncommon pick can
 * reasonably use two slots (Starf + an optional small rarity bump).
 *
 * Rarity and shiny are separate concerns:
 * - Rarity boosters (Golden Carrot / Golden Apple / Enchanted Golden Apple)
 *   exist to push a Pokémon up the rarity ladder. Common targets never need
 *   one — there's no rarity gap to close — so none is used by default,
 *   regardless of goal, including "shiny".
 * - Starf Berry is shiny-only (5x, no rarity change) — it's the correct
 *   tool for "I want shiny odds" on a target that doesn't need a rarity
 *   push, i.e. Common or Uncommon.
 * - Enchanted Golden Apple is reserved for cases where BOTH a real rarity
 *   push and max shiny are actually warranted: Ultra Rare targets (rarity
 *   need alone justifies it), or an explicit "max everything" ask.
 */
function pickRarityAndShiny(bucket, goal) {
  if (goal === "shiny") {
    switch (bucket) {
      case "common":
        return [
          {
            seasoning: STARF_BERRY,
            reason:
              "Common targets don't need a rarity push, so this skips straight to Starf Berry — 5x shiny chance without wasting a rarity booster on a target that doesn't need one.",
          },
        ];
      case "uncommon":
        return [
          {
            seasoning: STARF_BERRY,
            reason:
              "Shiny-focused pick — 5x shiny chance, no rarity cost.",
          },
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Optional: Golden Apple stacks a small +1 rarity tier and another 2x shiny on top of the Starf Berry. Skip this slot if you'd rather save the ingredient — it's not required at Uncommon.",
          },
        ];
      case "rare":
        return [
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Rare target — Golden Apple gives a little rarity (+1 tier) alongside a real shiny bump (2x), without the crafting cost of an Enchanted Golden Apple.",
          },
        ];
      case "ultra-rare":
        return [
          {
            seasoning: ENCHANTED_GOLDEN_APPLE,
            reason:
              "Ultra Rare needs the rarity push regardless of goal, and you want shiny too — Enchanted Golden Apple is the only seasoning that maxes both at once (+10 tiers, 10x shiny).",
          },
        ];
      default:
        return [];
    }
  }

  if (goal === "efficient") {
    // One tier cheaper than the "balanced" default at the same bucket —
    // still a real rarity boost, just without paying for headroom you
    // may not need.
    switch (bucket) {
      case "common":
        return [];
      case "uncommon":
        return [
          {
            seasoning: GOLDEN_CARROT,
            reason:
              "Cheapest real rarity boost available — a flat +1 tier for one Golden Carrot, no shiny cost tacked on.",
          },
        ];
      case "rare":
        return [
          {
            seasoning: GOLDEN_CARROT,
            reason:
              "Even at Rare, a Golden Carrot's +1 tier is often enough — saves a Golden Apple for when you actually need the shiny bonus too.",
          },
        ];
      case "ultra-rare":
        return [
          {
            seasoning: GOLDEN_APPLE,
            reason:
              "Ultra Rare needs a real push, but the full Enchanted Golden Apple is expensive — a plain Golden Apple's +1 tier and 2x shiny is a cheaper middle ground.",
          },
        ];
      default:
        return [];
    }
  }

  // "balanced" (default) — also covers "hidden-ability", which doesn't
  // touch rarity/shiny choices, just adds Enigma Berry in its own slot.
  switch (bucket) {
    case "common":
      return [];
    case "uncommon":
      return [
        {
          seasoning: GOLDEN_CARROT,
          reason:
            "Uncommon target — a Golden Carrot's +1 rarity tier is enough on its own, no need to pay for shiny odds you didn't ask for.",
        },
      ];
    case "rare":
      return [
        {
          seasoning: GOLDEN_APPLE,
          reason:
            "Rare target benefits from a real boost — Golden Apple gives +1 tier and a 2x shiny bonus for a modest crafting cost.",
        },
      ];
    case "ultra-rare":
      return [
        {
          seasoning: ENCHANTED_GOLDEN_APPLE,
          reason:
            "Ultra Rare targets justify the full Enchanted Golden Apple — +10 rarity tiers and 10x shiny chance.",
        },
      ];
    default:
      return [];
  }
}


/**
 * Build every valid "targeting" berry for a species — not just one. A dual
 * EV-yield species like Ursaluna (HP + Special Attack) or a dual-type
 * species like Iron Valiant (Fairy/Fighting) genuinely has multiple correct
 * answers here, not one "best" one.
 *
 * Priority order (strongest signal first): EV-yield berries, then type
 * berries. Egg-group berries are a fishing-bait concept, not a Pokésnack
 * seasoning, so they're never used here.
 *
 * @returns {{seasoning:object, reason:string, tier:number}[]} ranked,
 *   deduplicated by seasoning id — tier is lower-is-better for sorting.
 */
function buildTargetingCandidates(target) {
  const { types = [], evYield = [] } = target;
  const candidates = [];
  const seen = new Set();

  const add = (seasoning, reason, tier) => {
    if (!seasoning || seen.has(seasoning.id)) return;
    seen.add(seasoning.id);
    candidates.push({ seasoning, reason, tier });
  };

  // Tier 0: one EV berry per stat this species actually yields.
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

  // Tier 1: one type berry per type (dual-types get both, not just the
  // first-listed one).
  for (const type of types) {
    const berry = TYPE_BERRIES.find((b) => b.type === type);
    if (berry) {
      add(
        berry,
        types.length > 1
          ? `Matches its ${type} type (one of ${types.join("/")}) — 10x spawn weight for that type.`
          : `Matches its ${type} type — 10x spawn weight, the most direct way to narrow the pool to this species.`,
        1
      );
    }
  }

  return candidates;
}

/**
 * Build up to 3 recommended seasonings for a target species, rarity bucket,
 * and optional goal.
 *
 * @param {Object} target - from usePokedexSearch().fetchDetail()
 * @param {string} target.types
 * @param {{stat:string, amount:number}[]} target.evYield
 * @param {string} rarityBucket - "common" | "uncommon" | "rare" | "ultra-rare"
 * @param {string} goal - "balanced" | "efficient" | "shiny" | "hidden-ability"
 * @returns {{ recommendations: {seasoning: object, reason: string}[], notes: string[] }}
 */
export function recommendSeasonings(target, rarityBucket = "common", goal = "balanced") {
  const notes = [];
  const recommendations = [];

  // Hidden Ability goal always claims a slot first — it's the whole point
  // of picking that goal.
  if (goal === "hidden-ability") {
    recommendations.push({
      seasoning: ENIGMA_BERRY,
      reason:
        "Enigma Berry gives a 5% chance per catch to attract a Pokémon with its hidden ability — the only seasoning that targets this at all.",
      slotKind: "fixed",
    });
  }

  const rarityShinyPicks = pickRarityAndShiny(rarityBucket, goal);
  for (const pick of rarityShinyPicks) {
    if (recommendations.length < MAX_RECOMMENDATIONS) {
      recommendations.push({ ...pick, slotKind: "fixed" });
    }
  }
  if (rarityShinyPicks.length === 0 && rarityBucket === "common") {
    notes.push(
      "No rarity or shiny booster recommended for a Common target — it would just be wasted crafting materials. Use the freed-up slot(s) for species accuracy instead."
    );
  }

  // Targeting candidates are the swappable slots — a species with multiple
  // valid types/EV stats has multiple correct answers here, so rather than
  // silently dropping the ones that don't fit, the UI lets the person swap
  // between them per slot (see PokesnackMaker.jsx).
  const accuracyCandidates = buildTargetingCandidates(target);
  const remainingSlots = MAX_RECOMMENDATIONS - recommendations.length;
  const accuracyPicks = accuracyCandidates
    .slice(0, Math.max(0, remainingSlots))
    .map((pick) => ({ ...pick, slotKind: "targeting" }));
  recommendations.push(...accuracyPicks);

  if (accuracyCandidates.length === 0) {
    notes.push(
      "No type or EV-yield berry matched this species — double-check its data, or this may be a custom species from a datapack outside the standard Pokédex."
    );
  }
  if (recommendations.length === 0) {
    notes.push(
      "No confident recommendation could be built for this combination — try a different goal or double-check the species data."
    );
  }

  return {
    recommendations: recommendations.slice(0, MAX_RECOMMENDATIONS),
    notes,
    // Full ranked targeting pool (not just the ones that made the initial
    // cut) — lets the UI offer per-slot swapping between valid type/EV
    // options instead of just noting them as text.
    targetingPool: accuracyCandidates,
  };
}
