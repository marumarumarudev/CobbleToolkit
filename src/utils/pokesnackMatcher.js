import {
  TYPE_BERRIES,
  EGG_GROUP_BERRIES,
  RARITY_SHINY_BERRIES,
  EV_YIELD_BERRIES,
} from "@/data/baitSeasoningData";

// Cobblemon rarity buckets, roughly ordered common -> ultra rare.
// Used only to decide whether a rarity booster is "worth it" for a target
// (a Common mon doesn't need +10 tiers, but a legendary/mythical does).
const HIGH_RARITY_CATEGORIES = ["legendary", "mythical", "ultra-beast"];

/**
 * Build the recommended seasoning combo for a target Pokémon.
 *
 * Returns 3 conceptual slots, each an array of 1+ alternative berries
 * (almost always 1, but the type slot holds 2 for dual-type Pokémon —
 * either berry works on its own, so they're presented as a "Berry1 /
 * Berry2" choice rather than forcing just the first type through):
 *   Slot 1 — Enchanted Golden Apple (always — best value rarity/shiny booster)
 *   Slot 2 — EV-yield berry, falling back to egg-group berry if no EV match
 *   Slot 3 — Type berry(ies) — both, if the species has two types
 *
 * @param {Object} target
 * @param {string[]} target.types - e.g. ["Fire", "Flying"]
 * @param {string[]} target.eggGroups - e.g. ["Dragon", "Monster"] or ["Undiscovered"]
 * @param {{stat: string, amount: number}[]} target.evYield - from PokeAPI's
 *   effort values, sorted highest first, e.g. [{stat:"speed", amount:2}]
 * @returns {{ primary: {items: object[], reason: string}[], alternates: {label: string, combo: object[]}[], notes: string[] }}
 */
export function buildBestCombo(target) {
  const { types = [], eggGroups = [], evYield = [] } = target;
  const notes = [];

  const typeMatches = TYPE_BERRIES.filter((b) => types.includes(b.type));
  const eggGroupMatches = EGG_GROUP_BERRIES.filter((b) =>
    b.eggGroups.some((g) => eggGroups.includes(g))
  );
  // Match against the highest EV yield stat first (most species only yield
  // one stat anyway; stronger/evolved species can yield two or three).
  const evBerry = evYield.length
    ? EV_YIELD_BERRIES.find((b) => b.stat === evYield[0].stat)
    : null;

  const isUndiscovered =
    eggGroups.length === 1 && eggGroups[0] === "Undiscovered";
  if (isUndiscovered) {
    notes.push(
      "This Pokémon is in the Undiscovered egg group (most legendaries/mythicals/babies) — no seasoning attracts that group directly."
    );
  }

  const enchantedGA = RARITY_SHINY_BERRIES.find(
    (b) => b.id === "enchanted-golden-apple"
  );
  const goldenApple = RARITY_SHINY_BERRIES.find((b) => b.id === "golden-apple");
  const starf = RARITY_SHINY_BERRIES.find((b) => b.id === "starf-berry");

  const primary = [];

  // Slot 1: Enchanted Golden Apple, always.
  primary.push({
    items: [enchantedGA],
    reason:
      "Always included — strictly the best value rarity/shiny booster (0 bite time, +10 rarity tiers, 10x shiny).",
  });

  // Slot 2: EV-yield berry, falling back to egg-group berry if the species
  // has no tracked EV yield or no matching berry for it.
  if (evBerry) {
    primary.push({
      items: [evBerry],
      reason: `Matches this species' EV yield (${evYield[0]?.amount} ${evBerry.statLabel}) — ranked above egg group since it doubles as useful stat-training info.`,
    });
  } else if (eggGroupMatches.length > 0) {
    primary.push({
      items: eggGroupMatches.slice(0, 2),
      reason: `Matches its ${eggGroupMatches
        .slice(0, 2)
        .map((b) => b.eggGroups.join("/"))
        .join(", ")} egg group — used here since no EV yield berry matched.`,
    });
  }

  // Slot 3: type berry(ies) — both, if dual-typed, shown as alternatives
  // for the same slot rather than picking only the first.
  if (typeMatches.length > 0) {
    primary.push({
      items: typeMatches.slice(0, 2),
      reason:
        typeMatches.length > 1
          ? `Matches both of its types (${typeMatches
              .slice(0, 2)
              .map((b) => b.type)
              .join(" / ")}) — either berry gives 10x spawn weight on its own, use whichever you have.`
          : `Matches its ${typeMatches[0].type} type — 10x spawn weight for that type.`,
    });
  }

  if (primary.length < 3) {
    notes.push(
      `Only found ${primary.length} matching seasoning slot${primary.length === 1 ? "" : "s"} for this Pokémon — it may have an unusual type, an Undiscovered egg group, and no tracked EV yield, leaving fewer slots to fill.`
    );
  }

  const alternates = [];

  // Alternate: egg-group-focused build, for when species accuracy matters
  // more than the EV/rarity value picks in the primary combo.
  const eggGroupCombo = [
    typeMatches[0],
    eggGroupMatches[0],
    enchantedGA,
  ].filter(Boolean);
  if (eggGroupMatches[0] && eggGroupCombo.length) {
    alternates.push({
      label: "Egg-group-focused build",
      combo: eggGroupCombo,
      note: "Swaps the EV berry back out for the egg-group berry — better if you want the tightest species match and don't care about EV training.",
    });
  }

  // Alternate: cheaper shiny-only build for players without an Enchanted
  // Golden Apple yet (still Netherite-tier crafting effort).
  const starfCombo = [...typeMatches.slice(0, 1), evBerry || eggGroupMatches[0], starf].filter(
    Boolean
  );
  if (starfCombo.length) {
    alternates.push({
      label: "Cheaper shiny-only build",
      combo: starfCombo,
      note: "Starf Berry only boosts shiny odds (5x, no rarity bump) but it's much easier to get than an Enchanted Golden Apple — a good stand-in until you can craft one.",
    });
  }

  // Alternate: budget build (no golden apple of any kind)
  const budgetCombo = [
    ...typeMatches.slice(0, 1),
    evBerry || eggGroupMatches[0],
    goldenApple,
  ].filter(Boolean);
  if (budgetCombo.length) {
    alternates.push({
      label: "Budget build",
      combo: budgetCombo,
      note: "Regular Golden Apple only bumps rarity by 1 tier and 2x shiny instead of 10, but it's far cheaper to make than an Enchanted one.",
    });
  }

  if (typeMatches.length === 0) {
    notes.push(
      "No type-resist berry matches this Pokémon's type(s) directly in the standard 18-type list — double check the type spelling, or this may be a custom/added type from a datapack."
    );
  }
  if (eggGroupMatches.length === 0 && !isUndiscovered) {
    notes.push(
      "No egg-group berry matches this Pokémon's egg group(s) — verify the egg group name against Cobblemon's list."
    );
  }
  if (!evBerry && evYield.length === 0) {
    notes.push(
      "No EV yield data found for this species — slot 2 falls back to an egg-group berry instead."
    );
  }

  return { primary, alternates, notes };
}

export function isHighRaritySpecies(rarityLabel) {
  if (!rarityLabel) return false;
  return HIGH_RARITY_CATEGORIES.includes(rarityLabel.toLowerCase());
}
