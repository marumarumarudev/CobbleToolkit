/**
 * Campfire pot product modes that share bait seasonings.
 * Icon files: public/icons/items/{id}.png (see README.txt).
 */

export const COOKING_MODES = {
  snack: {
    id: "snack",
    label: "Poké Snack",
    shortLabel: "Snack",
    productName: "Poké Snack",
    blurb:
      "Place on the ground to attract wild Pokémon nearby. Seasonings stack in the three pot slots.",
    yieldNote: "1 snack · 8 bites",
    ingredients: [
      { id: "milk", name: "Milk (or Moomoo Milk)", emoji: "🥛", count: 3 },
      { id: "honey-bottle", name: "Honey Bottle", emoji: "🍯", count: 2 },
      { id: "vivichoke", name: "Vivichoke", emoji: "🌱", count: 1 },
      { id: "hearty-grains", name: "Hearty Grains", emoji: "🌾", count: 3 },
    ],
    grid: [
      { id: "milk", emoji: "🥛", name: "Milk" },
      { id: "milk", emoji: "🥛", name: "Milk" },
      { id: "milk", emoji: "🥛", name: "Milk" },
      { id: "honey-bottle", emoji: "🍯", name: "Honey Bottle" },
      { id: "vivichoke", emoji: "🌱", name: "Vivichoke" },
      { id: "honey-bottle", emoji: "🍯", name: "Honey Bottle" },
      { id: "hearty-grains", emoji: "🌾", name: "Hearty Grains" },
      { id: "hearty-grains", emoji: "🌾", name: "Hearty Grains" },
      { id: "hearty-grains", emoji: "🌾", name: "Hearty Grains" },
    ],
    tips: [
      "Needs a player nearby to spawn Pokémon.",
      "Uses the same seasonings as fishing bait. Effects stack across all 3 slots.",
    ],
  },
  bait: {
    id: "bait",
    label: "Fishing bait",
    shortLabel: "Bait",
    productName: "Poké Bait",
    blurb:
      "Attach to a Poké Rod. Seasonings change what you can reel in (type, rarity, alpha, etc.).",
    yieldNote: "4 bait per cook",
    ingredients: [
      { id: "honey-bottle", name: "Honey Bottle", emoji: "🍯", count: 1 },
      { id: "mushroom", name: "Brown or Red Mushroom", emoji: "🍄", count: 1 },
      { id: "wheat", name: "Wheat", emoji: "🌾", count: 1 },
    ],
    grid: [
      { id: "honey-bottle", emoji: "🍯", name: "Honey Bottle" },
      { id: "mushroom", emoji: "🍄", name: "Mushroom" },
      { id: "wheat", emoji: "🌾", name: "Wheat" },
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    tips: [
      "Use the bait on a Poké Rod to attach it.",
      "Seasonings that shorten bite time are more useful for fishing than for ground snacks.",
      "Makes 4 bait and uses the same 3 seasoning slots as snacks.",
    ],
  },
};

export const COOKING_MODE_TABS = [
  { id: "snack", label: "Poké Snack" },
  { id: "bait", label: "Fishing bait" },
];
