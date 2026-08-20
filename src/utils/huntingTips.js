// General Poké Snack effectiveness tips — mechanics confirmed across the
// official Cobblemon wiki and community wikis, not placement folklore.
export const GENERAL_SNACK_TIPS = [
  {
    title: "Match the biome first",
    body: "A Poké Snack can only pull Pokémon that already exist in that biome's spawn table — seasoning changes the odds, it doesn't invent new spawns. If your target isn't native to where you're standing, no combo will summon it there. Use your Spawn Scanner tool to confirm the biomes it's actually configured to spawn in.",
  },
  {
    title: "Give it open space",
    body: "Place the snack on flat, open ground with plenty of clear room around it. Cramped or covered spots (small caves, tight builds) suppress spawns even with a perfect seasoning combo.",
  },
  {
    title: "Run multiple snacks",
    body: "Each Poké Snack spawns independently, so placing several in the same open area multiplies your effective spawn attempts per tick instead of waiting on one.",
  },
  {
    title: "Be patient",
    body: "Snacks tick on the server's spawn cycle, so it can take several real-time minutes between bites — this is normal, not a bug.",
  },
  {
    title: "9 bites per snack",
    body: "Each snack supports 9 spawn events before it's fully consumed. Budget your seasoning ingredients accordingly if you're setting up a dedicated hunting spot.",
  },
  {
    title: "Stay in range",
    body: "Spawns can happen while you're away, but staying nearby means you don't miss the encounter window once a Pokémon takes a bite.",
  },
];

/**
 * Species-specific tips. Deliberately avoids inventing biome/location
 * claims — those come from the user's own datapack via Spawn Scanner.
 */
export function buildSpeciesTips(target) {
  const tips = [];
  const { name, isHighRarity, eggGroups = [], genderRatio } = target;

  tips.push({
    title: "Confirm its spawn biome",
    body: `Run ${name || "this Pokémon"}'s species file through your Spawn Scanner tool first — that gives you the exact biomes, time of day, and weather conditions your server actually has configured, which is more reliable than any general guide.`,
  });

  if (isHighRarity) {
    tips.push({
      title: "Rare/legendary spawns need the rarity boost",
      body: "Legendaries and mythicals usually sit in the lowest-weight spawn bucket, so skipping the Enchanted Golden Apple (or at least a regular Golden Apple) makes the type/egg-group berries do a lot more work for a lot less payoff. It's worth the crafting cost here.",
    });
  }

  if (eggGroups.includes("Undiscovered")) {
    tips.push({
      title: "No egg-group berry helps here",
      body: "This species is in the Undiscovered egg group, so lean entirely on type-matching berries and rarity boosters — egg-group seasoning won't do anything for it.",
    });
  }

  if (genderRatio && (genderRatio.female === 0 || genderRatio.male === 0)) {
    tips.push({
      title: "Genderless or single-gender species",
      body: "Kee Berry / Maranga Berry (gender bias) won't do anything useful here since this species doesn't have the gender you'd be biasing toward — skip that seasoning slot for something else.",
    });
  }

  tips.push({
    title: "Bring backup catching gear",
    body: "Once the seasoning increases your odds, the bottleneck becomes catching before it flees or the snack despawns — stock the right Poké Balls and any status/weaken tools before you start.",
  });

  return tips;
}
