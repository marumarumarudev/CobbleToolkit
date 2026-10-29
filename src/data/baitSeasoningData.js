// Bait Seasoning data for Poké Snacks — aligned to Cobblemon 1.8.x
// spawn_bait_effects (gitlab cable-mc/cobblemon).
// A Poké Snack has a FIXED base recipe (3 Milk, 2 Honey Bottle, 1 Vivichoke,
// 3 Hearty Grains) — only the 3 seasoning slots are variable, and their
// effects stack.

export const MC_ITEM_GALLERY_VERSION = "1.21.6";
export function mcItemGalleryUrl(mcItemId) {
  return `https://mcitemgallery.com/images/${MC_ITEM_GALLERY_VERSION}/${mcItemId}.png`;
}

export const SEASONING_CATEGORY = {
  TYPE: "type",
  EGG_GROUP: "eggGroup",
  RARITY: "rarity",
  SHINY: "shiny",
  HIDDEN_ABILITY: "hiddenAbility",
  EV_YIELD: "evYield",
  GENDER: "gender",
  BITE_SPEED: "biteSpeed",
  LEVEL: "level",
  ALPHA: "alpha",
  MARK: "mark",
  SIZE: "size",
  DROPS: "drops",
  FRIENDSHIP: "friendship",
  OTHER: "other",
};

export const TYPE_BERRIES = [
  { id: "occa-berry",   name: "Occa Berry",   type: "Fire",     iconSlug: "occa-berry"   },
  { id: "passho-berry", name: "Passho Berry", type: "Water",    iconSlug: "passho-berry" },
  { id: "wacan-berry",  name: "Wacan Berry",  type: "Electric", iconSlug: "wacan-berry"  },
  { id: "rindo-berry",  name: "Rindo Berry",  type: "Grass",    iconSlug: "rindo-berry"  },
  { id: "yache-berry",  name: "Yache Berry",  type: "Ice",      iconSlug: "yache-berry"  },
  { id: "chople-berry", name: "Chople Berry", type: "Fighting", iconSlug: "chople-berry" },
  { id: "kebia-berry",  name: "Kebia Berry",  type: "Poison",   iconSlug: "kebia-berry"  },
  { id: "shuca-berry",  name: "Shuca Berry",  type: "Ground",   iconSlug: "shuca-berry"  },
  { id: "coba-berry",   name: "Coba Berry",   type: "Flying",   iconSlug: "coba-berry"   },
  { id: "payapa-berry", name: "Payapa Berry", type: "Psychic",  iconSlug: "payapa-berry" },
  { id: "tanga-berry",  name: "Tanga Berry",  type: "Bug",      iconSlug: "tanga-berry"  },
  { id: "charti-berry", name: "Charti Berry", type: "Rock",     iconSlug: "charti-berry" },
  { id: "kasib-berry",  name: "Kasib Berry",  type: "Ghost",    iconSlug: "kasib-berry"  },
  { id: "haban-berry",  name: "Haban Berry",  type: "Dragon",   iconSlug: "haban-berry"  },
  { id: "colbur-berry", name: "Colbur Berry", type: "Dark",     iconSlug: "colbur-berry" },
  { id: "babiri-berry", name: "Babiri Berry", type: "Steel",    iconSlug: "babiri-berry" },
  { id: "chilan-berry", name: "Chilan Berry", type: "Normal",   iconSlug: "chilan-berry" },
  { id: "roseli-berry", name: "Roseli Berry", type: "Fairy",    iconSlug: "roseli-berry" },
].map((b) => ({
  ...b,
  category: SEASONING_CATEGORY.TYPE,
  multiplier: 10,
  effect: `Attracts type: ${b.type} (10x spawn weight)`,
}));

export const EGG_GROUP_BERRIES = [
  { id: "rawst-berry",  name: "Rawst Berry",  eggGroups: ["Field"],                iconSlug: "rawst-berry"  },
  { id: "pecha-berry",  name: "Pecha Berry",  eggGroups: ["Water 3", "Bug"],       iconSlug: "pecha-berry"  },
  { id: "cheri-berry",  name: "Cheri Berry",  eggGroups: ["Grass", "Fairy"],       iconSlug: "cheri-berry"  },
  { id: "chesto-berry", name: "Chesto Berry", eggGroups: ["Human-Like", "Flying"], iconSlug: "chesto-berry" },
  { id: "aspear-berry", name: "Aspear Berry", eggGroups: ["Water 1", "Water 2"],   iconSlug: "aspear-berry" },
  { id: "persim-berry", name: "Persim Berry", eggGroups: ["Mineral", "Amorphous"], iconSlug: "persim-berry" },
  { id: "lum-berry",    name: "Lum Berry",    eggGroups: ["Dragon", "Monster"],    iconSlug: "lum-berry"    },
  // 1.8: Eggant is a real 10x Ditto egg-group bait (spawn_bait_effects/eggant_berry.json)
  { id: "eggant-berry", name: "Eggant Berry", eggGroups: ["Ditto"],                iconSlug: "eggant-berry" },
].map((b) => ({
  ...b,
  category: SEASONING_CATEGORY.EGG_GROUP,
  multiplier: 10,
  effect: `Attracts egg group: ${b.eggGroups.join(", ")} (10x spawn weight)`,
}));

export const RARITY_SHINY_BERRIES = [
  {
    id: "golden-apple",
    name: "Golden Apple",
    category: SEASONING_CATEGORY.RARITY,
    rarityTiers: 1,
    shinyMultiplier: 2,
    iconSlug: null,
    mcItemId: "golden_apple",
    emoji: "🍎",
    // bite_time 0.75 = 75% reduction; shiny_reroll value 1 → 2x total
    effect: "Reduces bite time by 75% · +1 rarity tier · 2x shiny chance",
  },
  {
    id: "enchanted-golden-apple",
    name: "Enchanted Golden Apple",
    category: SEASONING_CATEGORY.RARITY,
    rarityTiers: 10,
    shinyMultiplier: 10,
    iconSlug: null,
    mcItemId: "enchanted_golden_apple",
    emoji: "✨🍎",
    // bite_time 1.0 = 100%; shiny_reroll value 9 → 10x total
    effect: "Reduces bite time by 100% · +10 rarity tiers · 10x shiny chance",
  },
  {
    id: "golden-carrot",
    name: "Golden Carrot",
    category: SEASONING_CATEGORY.RARITY,
    rarityTiers: 1,
    shinyMultiplier: 1,
    iconSlug: null,
    mcItemId: "golden_carrot",
    emoji: "🥕",
    effect: "+1 rarity tier",
  },
  {
    id: "glistering-melon-slice",
    name: "Glistering Melon Slice",
    category: SEASONING_CATEGORY.RARITY,
    rarityTiers: 1,
    shinyMultiplier: 1,
    iconSlug: null,
    mcItemId: "glistering_melon_slice",
    emoji: "🍈",
    effect: "+1 rarity tier",
  },
  {
    id: "starf-berry",
    name: "Starf Berry",
    category: SEASONING_CATEGORY.SHINY,
    rarityTiers: 0,
    shinyMultiplier: 5,
    iconSlug: "starf-berry",
    effect: "5x shiny chance",
  },
];

// EV yield berries — `stat` must match normalized PokeAPI names used by usePokedexSearch
export const EV_YIELD_BERRIES = [
  { id: "pomeg-berry",  name: "Pomeg Berry",  stat: "hp",              statLabel: "HP",      iconSlug: "pomeg-berry"  },
  { id: "kelpsy-berry", name: "Kelpsy Berry", stat: "attack",          statLabel: "Attack",  iconSlug: "kelpsy-berry" },
  { id: "qualot-berry", name: "Qualot Berry", stat: "defence",         statLabel: "Defense", iconSlug: "qualot-berry" },
  { id: "hondew-berry", name: "Hondew Berry", stat: "special_attack",  statLabel: "Sp. Atk", iconSlug: "hondew-berry" },
  { id: "grepa-berry",  name: "Grepa Berry",  stat: "special_defence", statLabel: "Sp. Def", iconSlug: "grepa-berry"  },
  { id: "tamato-berry", name: "Tamato Berry", stat: "speed",           statLabel: "Speed",   iconSlug: "tamato-berry" },
].map((b) => ({
  ...b,
  category: SEASONING_CATEGORY.EV_YIELD,
  effect: `Attracts Pokémon that yield ${b.statLabel} EVs`,
}));

export const OTHER_BERRIES = [
  {
    id: "enigma-berry",
    name: "Enigma Berry",
    category: SEASONING_CATEGORY.HIDDEN_ABILITY,
    iconSlug: "enigma-berry",
    effect: "5% chance to attract a Pokémon with its Hidden Ability",
  },
  {
    id: "kee-berry",
    name: "Kee Berry",
    category: SEASONING_CATEGORY.GENDER,
    iconSlug: "kee-berry",
    effect: "25% chance to force female",
  },
  {
    id: "maranga-berry",
    name: "Maranga Berry",
    category: SEASONING_CATEGORY.GENDER,
    iconSlug: "maranga-berry",
    effect: "25% chance to force male",
  },
  {
    id: "leppa-berry",
    name: "Leppa Berry",
    category: SEASONING_CATEGORY.LEVEL,
    iconSlug: "leppa-berry",
    effect: "+5 spawn level",
  },
  // 1.8 CHANGE: Hopo no longer boosts level — alpha_chance 2%
  {
    id: "hopo-berry",
    name: "Hopo Berry",
    category: SEASONING_CATEGORY.ALPHA,
    iconSlug: "hopo-berry",
    effect: "2% chance to attract an Alpha Pokémon",
  },
  // 1.8: mark_chance value 5
  {
    id: "micle-berry",
    name: "Micle Berry",
    category: SEASONING_CATEGORY.MARK,
    iconSlug: "micle-berry",
    effect: "+5 mark chance on the lure",
  },
  // 1.8: size +50 / -50
  {
    id: "jaboca-berry",
    name: "Jaboca Berry",
    category: SEASONING_CATEGORY.SIZE,
    iconSlug: "jaboca-berry",
    effect: "Modify size by +50%",
  },
  {
    id: "rowap-berry",
    name: "Rowap Berry",
    category: SEASONING_CATEGORY.SIZE,
    iconSlug: "rowap-berry",
    effect: "Modify size by −50%",
  },
  // 1.8: drops_reroll (was bite/reel in older data)
  {
    id: "custap-berry",
    name: "Custap Berry",
    category: SEASONING_CATEGORY.DROPS,
    iconSlug: "custap-berry",
    effect: "1× drops reroll",
  },
  {
    id: "sweet-heart",
    name: "Sweet Heart",
    category: SEASONING_CATEGORY.FRIENDSHIP,
    iconSlug: null,
    mcItemId: null,
    emoji: "💛",
    effect: "+35 base friendship on lure",
  },
  // bite_time values are fractions reduced (0.25 = 25% faster bites)
  {
    id: "sweet-berries",
    name: "Sweet Berries",
    category: SEASONING_CATEGORY.BITE_SPEED,
    iconSlug: null,
    mcItemId: "sweet_berries",
    emoji: "🫐",
    effect: "Reduces bite time by 25%",
  },
  {
    id: "glow-berries",
    name: "Glow Berries",
    category: SEASONING_CATEGORY.BITE_SPEED,
    iconSlug: null,
    mcItemId: "glow_berries",
    emoji: "✨",
    effect: "Reduces bite time by 33%",
  },
  {
    id: "oran-berry",
    name: "Oran Berry",
    category: SEASONING_CATEGORY.BITE_SPEED,
    iconSlug: "oran-berry",
    effect: "Reduces bite time by 33%",
  },
  {
    id: "apple",
    name: "Apple",
    category: SEASONING_CATEGORY.BITE_SPEED,
    iconSlug: null,
    mcItemId: "apple",
    emoji: "🍎",
    effect: "Reduces bite time by 50%",
  },
  {
    id: "sitrus-berry",
    name: "Sitrus Berry",
    category: SEASONING_CATEGORY.BITE_SPEED,
    iconSlug: "sitrus-berry",
    effect: "Reduces bite time by 50%",
  },
];

export const ALL_SEASONINGS = [
  ...TYPE_BERRIES,
  ...EGG_GROUP_BERRIES,
  ...RARITY_SHINY_BERRIES,
  ...EV_YIELD_BERRIES,
  ...OTHER_BERRIES,
];

export const MAX_SEASONING_SLOTS = 3;

export const BASE_RECIPE = [
  { id: "milk",          name: "Milk (or Moomoo Milk)", mcItemId: "milk_bucket",  emoji: "🥛", slots: [0, 1, 2] },
  { id: "honey-bottle",  name: "Honey Bottle",         mcItemId: "honey_bottle", emoji: "🍯", slots: [3, 5]    },
  { id: "vivichoke",     name: "Vivichoke",            mcItemId: null,           emoji: "🌱", slots: [4]       },
  { id: "hearty-grains", name: "Hearty Grains",        mcItemId: null,           emoji: "🌾", slots: [6, 7, 8] },
];
