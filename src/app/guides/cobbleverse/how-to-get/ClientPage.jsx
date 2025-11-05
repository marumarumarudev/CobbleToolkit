"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState, useTransition, useMemo, useCallback } from "react";
import React from "react";
import { createPortal } from "react-dom";

function HowToGetPokemonPageInner() {
  const [activeTab, setActiveTab] = useState("mew_duo");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const initializedFromUrlRef = React.useRef(false);

  // Memoize pokemonData to prevent recreation on every render
  const pokemonData = useMemo(
    () => ({
      mew_duo: {
        title: "Mew Duo",
        series: "Kanto (Default)",
        levelCap: "80+",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(244,114,182,0.7)" }}
            >
              Mew
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Spawn Level: <b>Lvl 75</b>
              </li>
              <li>
                Craft the <b>Origin Fossil</b> to obtain Mew.
              </li>
              <li>
                To craft it, you need:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Ancient Origin Ball</b> — obtained by defeating{" "}
                    <b>Kanto Champion Blue</b> & <b>Johto Champion Lance</b>.
                  </li>
                  <li>
                    <b>Ancient DNA</b> — dropped once by{" "}
                    <b>Gym Leader Giovanni</b> OR found in a chest inside{" "}
                    <b>Mew's Temple</b> (Jungle biome).
                  </li>
                  <li>
                    <b>5 Fossils</b> — any kind of fossil works.
                  </li>
                </ul>
              </li>
              <li>
                Combine these items to craft the <b>Origin Fossil</b> and place
                it in <b>Mew's Altar</b> to summon Mew.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:mythical/mew</code>
            </p>

            <MewImageSlider />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(139,92,246,0.7)" }}
            >
              Mewtwo
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Obtain <b>Ancient DNA</b>:
                <ul className="list-disc list-inside ml-6">
                  <li>Defeat Gym Leader Giovanni (drops once), OR</li>
                  <li>Find Mew's Temple in Jungle biome.</li>
                </ul>
              </li>
              <li>
                To battle <b>Atena</b>, you need <b>Level 100</b> level cap. No
                region series requirement.
              </li>
              <li>
                Find <b>Team Rocket Tower</b> in the Badlands biome.
              </li>
              <li>
                On the top floor, mine beneath General Archer to reach Admin
                Atena.
              </li>
              <li>
                Defeat Atena to get a <b>Cloning Catalyst</b>.
              </li>
              <li>
                Rocket Tower variant with Meowth Balloon drops a{" "}
                <b>Radiant Cloning Catalyst</b> (guaranteed Shiny Mewtwo).
              </li>
              <li>
                Combine <b>Ancient DNA</b> + <b>Cloning Catalyst</b> in a Fossil
                Resurrection Machine to obtain Mewtwo.
              </li>
              <li>
                Hidden inside Radio Tower (enable <b>Johto datapack</b>) is the{" "}
                <b>Synthetic Matrix</b>, used to craft
                <b> Armored Mewtwo</b>.
              </li>
            </ul>

            {/* Shadow Mewtwo Note */}
            <p className="text-sm text-purple-300 italic">
              ⚠️ As of writing this guide, <b>Shadow Mewtwo</b> cannot be
              obtained through gameplay. You can only get it via command:{" "}
              <code>/pokegive mewtwo shadow=true</code>
            </p>

            {/* Base Stats Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-200 border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-gray-100">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">Form</th>
                    <th className="px-2 py-1 border border-gray-700">HP</th>
                    <th className="px-2 py-1 border border-gray-700">ATK</th>
                    <th className="px-2 py-1 border border-gray-700">DEF</th>
                    <th className="px-2 py-1 border border-gray-700">
                      Sp. ATK
                    </th>
                    <th className="px-2 py-1 border border-gray-700">
                      Sp. DEF
                    </th>
                    <th className="px-2 py-1 border border-gray-700">Speed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">Mewtwo</td>
                    <td>106</td>
                    <td>110</td>
                    <td>90</td>
                    <td>154</td>
                    <td>90</td>
                    <td>130</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">
                      Armored
                    </td>
                    <td>106</td>
                    <td>130</td>
                    <td>110</td>
                    <td>90</td>
                    <td>154</td>
                    <td>90</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">Shadow</td>
                    <td>106</td>
                    <td>132</td>
                    <td>72</td>
                    <td>184</td>
                    <td>72</td>
                    <td>130</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:team_rocket_tower</code>
            </p>
            <MewTwoImageSlider />
          </div>
        ),
      },
      weather_trio: {
        title: "Weather Trio",
        series: "Hoenn Datapack",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(59,130,246,0.7)" }}
            >
              Kyogre
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 60–70</b>
              </li>
              <li>
                Locate Kyogre's structure in <b>Deep Cold Ocean</b> biomes.
              </li>
              <li>
                Craft <b>Ocean Core</b> to summon Kyogre.
              </li>
              <li>
                Secrets inside the structure:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Blue Orb</b> found in a barrel inside the entrance dome.
                  </li>
                  <li>
                    <b>Water Spout TM</b> hidden in a barrel at the base of one
                    of the pillars.
                  </li>
                </ul>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:legendary/kyogre</code>
            </p>

            <KyogreImageSlider />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(220,38,38,0.7)" }}
            >
              Groudon
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 60–70</b>
              </li>
              <li>
                Locate Groudon's structure in <b>Deep Warm Ocean</b> (Terralith
                biome).
              </li>
              <li>
                Craft <b>Earth Core</b> to summon Groudon.
              </li>
              <li>
                Secrets inside the structure:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Hidden cave inside the mountain with a <b>lore book</b>,
                    free ores, and the <b>Heatstone</b> (enough for 1 spawn
                    item).
                  </li>
                  <li>
                    <b>Red Orb</b> located at the bottom of the crater (requires
                    fire resistance or draining lava).
                  </li>
                  <li>
                    Small lava pool with dripstone—inside a Netherite barrel
                    you'll find a <b>Precipice Blades TM</b> and a{" "}
                    <b>Nether Star</b>.
                  </li>
                  <li>Groudon's also has a raw megastone. (thanks azera)</li>
                </ul>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:legendary/groudon</code>
            </p>

            <GroudonImageSlider />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,197,94,0.7)" }}
            >
              Rayquaza
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                Head to the <b>Sky Pillar</b>. (Deep Ocean Biome)
              </li>
              <li>
                The <b>Emerald Emblem</b> to craft Rayquaza's spawn item is
                located in the room with the crafters, hidden behind the chest.
                There's a lever above you to see the barrel.
              </li>
            </ul>

            <p className="text-sm">
              You can also find a <b>Lvl 100 Shiny Rayquaza</b> when you enter
              the
              <b> End</b> for the first time. This replaces the Ender Dragon and
              can be disabled by deleting the{" "}
              <b>COBBLEVERSE - No Ender Dragon </b>
              datapack. The only way to respawn this is via commands:
              <code> /function cobbleverse:spawn_rayquaza</code>
            </p>

            <h4 className="font-medium">Secrets Inside Sky Pillar</h4>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>
                <b>Kyogre Chamber</b>: A hidden room with a{" "}
                <b>Shiny Kyogre plushie</b> and coins in the pond. Access it
                through a trapdoor. <u>Warning:</u> the chest is trapped!
              </li>
              <li>
                <b>Groudon Chamber</b>: A chest with{" "}
                <b>Fire Resistance Potion</b> under one of the blackstones.
              </li>
              <li>
                <b>Dragon Chamber</b>: A chest with a <b>TM</b> in the 1-block
                space under the floor.
              </li>
              <li>
                <b>Dragon Chamber Statue</b>: A chest with{" "}
                <b>Dragon's Breath</b> hidden in the dragon statue's mouth.
              </li>
              <li>
                <b>Sky Pillar Lantern</b> (left side as you walk in): Hidden
                chest containing <b>Dragonium-Z</b>. (thanks @₮ØⱤ₦₳ĐØ)
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:sky_pillar</code>
            </p>

            <RayquazaImageSlider />
          </div>
        ),
      },
      ash_pokemons: {
        title: "Ash's Pokemons",
        series: "Kanto (Default)",
        levelCap: "40+",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-blue-300 to-red-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(59,130,246,0.7)" }}
            >
              Ash's Greninja
            </h4>

            <ul className="list-disc list-inside space-y-1">
              <li>
                Requires <b>level cap 40+</b>.
              </li>
              <li>
                Find <b>Ash's House</b> in <b>Plains biomes</b>.
              </li>
              <li>
                <b>Ash's Cap</b> is found inside a drawer in <b>Ash's room</b>.
              </li>
              <li>
                Defeating <b>Ash</b> no longer drops the cap. Instead, he now
                has a chance to drop <b>Pika Cases</b>, various <b>TMs</b>, and
                the
                <b> Light Ball</b>.
              </li>
              <li>
                To obtain <b>Ash's Greninja</b>, right-click a Greninja while
                holding Ash's Cap in your main hand.
              </li>
            </ul>

            <h4 className="font-medium">Battle Bond Ability</h4>
            <p>
              Ash's Greninja has the unique ability <b>Battle Bond</b>:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>
                When Greninja directly causes another Pokémon to faint with a
                damaging move, it transforms into <b>Ash-Greninja</b> (Gen 7
                effect).
              </li>
              <li>After the battle, it reverts back to normal Greninja.</li>
              <li>
                In newer generations, Battle Bond instead gives stat boosts.
                Mega Showdown makes this depend on friendship:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Friendship 250+</b>: Gen 7 form-change effect.
                  </li>
                  <li>
                    <b>Friendship below 250</b>: Newer generation stat-boost
                    effect.
                  </li>
                </ul>
              </li>
            </ul>
            <p className="text-sm text-red-400">
              ⚠️ Giving Greninja Battle Bond via commands does not work
              properly.
            </p>

            <AshGreninjaImageSlider />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(250,204,21,0.8)" }}
            >
              Ash's Pikachu
            </h4>

            <ul className="list-disc list-inside space-y-1">
              <li>
                Requires <b>level cap 40+</b>.
              </li>
              <li>
                Obtain <b>Ash's Cap</b> from the drawer in <b>Ash's room</b>.
              </li>
              <li>
                Right-click a <b>Pikachu</b> with Ash's Cap in your main hand to
                obtain <b>Ash's Pikachu</b>.
              </li>
              <li>
                Requires <b>Friendship 200+</b>
              </li>
            </ul>

            <h4 className="font-medium">Ash's Pikachu Info</h4>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>No stat changes compared to a regular Pikachu.</li>
              <li>
                When holding <b>Pikashunium Z</b>, Ash's Pikachu can use{" "}
                <b>10,000,000 Volt Thunderbolt</b>.
              </li>
              <li>
                Ash's Pikachu <u>cannot</u> use <b>Catastropika</b> even with
                Pikanium Z.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:ash</code>
            </p>

            <AshPikachuImageSlider />
            <p className="text-xs opacity-50 italic">
              Big thanks to <strong>Mega Showdown Wiki</strong>
            </p>
          </div>
        ),
      },
      lugia: {
        title: "Lugia",
        series: "Johto Datapack",
        levelCap: "70+",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Requires <b>level cap 70+</b>. Enable the <b>Johto datapack</b>{" "}
                to access the Radio Tower.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                Find <b>Team Rocket Radio Tower</b> in Savanna biomes.
              </li>
              <li>
                At the top floor, defeat <b>Boss Giovanni</b> to obtain the{" "}
                <b>Silver Wing</b>.
              </li>
              <li>
                Use the Silver Wing at <b>Whirl Island</b> to spawn Lugia.
                <span className="block text-xs opacity-75">
                  Whirl Island structure generates in <b>Deep Cold Ocean</b>{" "}
                  biomes.
                </span>
              </li>
              <li>
                Secrets inside the tower:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Hidden <b>Corrupted Shards</b> to craft Shadow Soul Stone.
                  </li>
                </ul>
              </li>
              <li>
                Defeat <b>Admin Apollo</b> to obtain <b>Shadow Heart</b> and a{" "}
                <b>recipe</b> for crafting <b>Shadow Soul Stone</b>. (used to
                turn Lugia into Shadow Form).
              </li>
            </ul>

            {/* Base Stats Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-200 border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-gray-100">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">Form</th>
                    <th className="px-2 py-1 border border-gray-700">HP</th>
                    <th className="px-2 py-1 border border-gray-700">ATK</th>
                    <th className="px-2 py-1 border border-gray-700">DEF</th>
                    <th className="px-2 py-1 border border-gray-700">
                      Sp. ATK
                    </th>
                    <th className="px-2 py-1 border border-gray-700">
                      Sp. DEF
                    </th>
                    <th className="px-2 py-1 border border-gray-700">Speed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">Lugia</td>
                    <td>106</td>
                    <td>90</td>
                    <td>130</td>
                    <td>90</td>
                    <td>154</td>
                    <td>110</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">
                      Shadow Lugia
                    </td>
                    <td>106</td>
                    <td>130</td>
                    <td>90</td>
                    <td>154</td>
                    <td>90</td>
                    <td>110</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:rocket_radio_tower</code>{" "}
              or <code>/locate structure cobbleverse:whirl_island</code>
            </p>
            <LugiaImageSlider />
          </div>
        ),
      },
      hooh: {
        title: "Ho-oh",
        series: "Johto Datapack",
        levelCap: "60+",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Requires <b>level cap 60+</b>. Enable the <b>Johto datapack</b>{" "}
                to access the Burned Tower.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                Find the <b>Burned Tower</b> (commonly near Birch Forests).
              </li>
              <li>
                Defeat the <b>Old Sage</b> inside to obtain the{" "}
                <b>Rainbow Wing</b>.
              </li>
              <li>
                Side note: the <b>Legendary Beasts</b> (Raikou, Entei, Suicune)
                are <b>Ultra-Rare</b> spawns around the Burned Tower — use
                Pokénav to track them.
              </li>
              <li>
                Entei, Suicune, Raikou Spawn Level: <b>Lvl 60</b>
              </li>
              <li>
                Spawn multipliers: <b>Entei</b> 3× at <b>day</b>, <b>Raikou</b>{" "}
                3× when <b>thundering</b>, <b>Suicune</b> 3× when <b>raining</b>
                .
              </li>
              <li>
                Locate the <b>Bell Tower</b> (found in Forest biomes) and use
                the Rainbow Wing there to summon Ho-oh.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:burned_tower</code> or{" "}
              <code>/locate structure cobbleverse:bell_tower</code>
            </p>
            <HoohImageSlider />
          </div>
        ),
      },
      celebi: {
        title: "Celebi",
        series: "Johto Datapack",
        levelCap: "100+",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Spawn Level: <b>Lvl 30</b>
              </li>
              <li>
                Needs to have <b>Johto Datapack</b> enabled with{" "}
                <b>level cap 100+</b> (defeat the whole Johto League).
              </li>
              <li>
                <b>Celebi Shrine</b> generates in <b>Taiga biomes</b>.
              </li>
              <li>
                To summon Celebi, you need to defeat <b>Rival Red</b> which is
                standing around the shrine.
              </li>
              <li>
                Once defeated, Red drops <b>GS Ball</b>.
              </li>
              <li>
                Press the button while holding the <b>GS Ball</b> near the
                shrine to summon Celebi.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:celebi_shrine</code>
            </p>
            <CelebiImageSlider />
          </div>
        ),
      },
      deoxys: {
        title: "Deoxys",
        series: "Hoenn Datapack",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Spawn Level: <b>Lvl 60</b>
              </li>
              <li>
                Structure only generates when <b>Hoenn</b> is activated.
              </li>
              <li>
                Structure generates on <b>Small End Islands</b> biome.
              </li>
              <li>
                Travel to the <b>End</b> and locate the massive{" "}
                <b>Meteorite structures</b>.
              </li>
              <li>
                Dig within the <b>Mega Meteorite blocks</b> to uncover Deoxys'
                summon item and the hidden altar.
              </li>
              <li>
                Scattered across the End island are{" "}
                <b>Form-changing Meteorites</b> that allow Deoxys to switch
                between its <b>Normal, Attack, Defense,</b> and <b>Speed</b>{" "}
                forms.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:mythical/deoxys</code>
            </p>

            <DeoxysImageSlider />
          </div>
        ),
      },
      calyrex: {
        title: "Calyrex",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Calyrex Spawn Level: <b>Lvl 50–70</b>
              </li>
              <li>
                No series required — these structures can be found immediately
                in the world.
              </li>
              <li>
                <b>Crown Cemetery</b> generates in <b>Old Growth Pine Taiga</b>{" "}
                biome.
              </li>
              <li>
                <b>Crown Spire</b> generates in <b>Snowy Plains</b> biome.
              </li>
              <li>
                Find their respective <b>carrots</b> and throw it into:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    The <b>Coffin</b> for <b>Spectrier</b> — Spawn Level:{" "}
                    <b>Lvl 60</b>.
                  </li>
                  <li>
                    The <b>Trough</b> for <b>Glastrier</b> — Spawn Level:{" "}
                    <b>Lvl 60</b>.
                  </li>
                </ul>
              </li>
              <li>
                You'll receive <b>Calyrex</b> for each structure, allowing you
                to create both Rider forms.
              </li>
              <li>
                Locate <b>Calyrex's Crown</b> in a barrel:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Found within one of the surrounding <b>ice spires</b>{" "}
                    (Glastrier).
                  </li>
                  <li>
                    Found under a bed of <b>podzol with 3 blue mushrooms</b>{" "}
                    (Spectrier).
                  </li>
                </ul>
              </li>
              <li>
                Place the <b>Calyrex's Crown</b> atop the <b>Calyrex statue</b>{" "}
                to complete the ritual.
              </li>
              <li>
                Craft <b>Reins of Unity</b> to fuse Calyrex and
                Spectrier/Glastrier.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:crown_cemetery</code> for
              Spectrier, or{" "}
              <code>/locate structure cobbleverse:crown_spire</code> for
              Glastrier.
            </p>
            <CalyrexImageSlider />
          </div>
        ),
      },
      cosplay_pikachu: {
        title: "Cosplay Pikachu",
        series: "Special Forms",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                New <b>Cosplay Pikachu</b> forms now spawn naturally in the
                world.
              </li>
              <li>
                To obtain one, you must catch a newly spawned wild Pikachu.
              </li>
              <li>
                The <b>Pika Case</b> will <u>not</u> work on Pikachu already
                caught, unless you use commands:
                <p className="mt-1 text-sm bg-gray-900/50 p-2 rounded">
                  <code>/pokeedit 1 cosplay=cosplay</code>
                </p>
                (Put Pikachu in the first slot of your party before running it.)
              </li>
            </ul>

            <h4 className="font-medium">Spawn Locations</h4>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>
                <b>Rockstar Cosplay</b> — Badlands
              </li>
              <li>
                <b>PhD Cosplay</b> — Jungle
              </li>
              <li>
                <b>Libre Cosplay</b> — Savanna
              </li>
              <li>
                <b>Belle Cosplay</b> — Sunflower Plains
              </li>
              <li>
                <b>Popstar Cosplay</b> — Cherry Grove
              </li>
              <li>
                <b>Standard Cosplay</b> — Thunder Weather Forests
              </li>
            </ul>

            <CosplayPikachuImageSlider />
          </div>
        ),
      },
      tao_trio: {
        title: "Tao Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Kyurem</b>: Ice Spikes biome, <b>raining</b>. Spawn Level:{" "}
                <b>Lvl 66–78</b>.
              </li>
              <li>
                <b>Reshiram</b>: Mountain-tagged biomes, <b>clear</b> weather.
                Spawn Level: <b>Lvl 70–84</b>.
              </li>
              <li>
                <b>Zekrom</b>: Mountain-tagged biomes, <b>thundering</b>. Spawn
                Level: <b>Lvl 70–84</b>.
              </li>
              <li>
                Craft <b>DNA Splicer</b> to fuse Reshiram/Zekrom with Kyurem.
              </li>
            </ul>
            <TaoTrioImageSlider />
          </div>
        ),
      },
      legendary_birds_trio: {
        title: "Legendary Birds Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <p>
              For Kanto versions, visit the wiki:{" "}
              <a
                href="https://www.lumyverse.com/cobbleverse/exclusive-structures-in-cobbleverse/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-300 transition-colors"
              >
                COBBLEVERSE Wiki
              </a>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Dyna Tree</b> spawns when <b>Hoenn</b> is activated.
                Generates in <b>Sakura Grove</b> (<b>Terralith</b> biome). No
                level cap.
              </li>
              <li>
                Spawns <b>Galarian</b> Articuno, Zapdos, Moltres. Not
                guaranteed; this is the only place they can spawn.
              </li>
              <li>
                <b>Galarian Articuno</b>: <b>Nighttime</b>. Spawn Level:{" "}
                <b>Lvl 60</b>.
              </li>
              <li>
                <b>Galarian Zapdos</b>: <b>Thundering</b>. Spawn Level:{" "}
                <b>Lvl 60</b>.
              </li>
              <li>
                <b>Galarian Moltres</b>: <b>Daytime</b>. Spawn Level:{" "}
                <b>Lvl 60</b>.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:dyna_tree</code>
            </p>
            <LegendaryBirdsImageSlider />
          </div>
        ),
      },
      creation_trio: {
        title: "Creation Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Dialga</b>: Stony Peaks, Jagged Peaks, Frozen Peaks, Snowy
                Slopes — <b>nighttime</b> and <b>clear weather</b>. Spawn Level:{" "}
                <b>Lvl 70</b>.
              </li>
              <li>
                <b>Palkia</b>: Same locations — <b>daytime</b> and{" "}
                <b>raining</b>. Spawn Level: <b>Lvl 70</b>.
              </li>
              <li>
                <b>Giratina</b>: <b>Ancient Cities</b> only. Spawn Level:{" "}
                <b>Lvl 75–95</b>.
              </li>
            </ul>

            <h4 className="font-medium text-lg">Origin Forms</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Dialga Origin Form</b>: Give Dialga the{" "}
                <b>Adamant Crystal</b> as a held item.
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Adamant Crystal</b> can be found by brushing suspicious
                    sands in <b>Cold Ocean Ruins</b>.
                  </li>
                </ul>
              </li>
              <li>
                <b>Palkia Origin Form</b>: Give Palkia the <b>Lustrous Globe</b>{" "}
                as a held item.
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Lustrous Globe</b> can be found by brushing suspicious
                    sands in <b>Warm Ocean Ruins</b>.
                  </li>
                </ul>
              </li>
              <li>
                <b>Giratina Origin Form</b>: Give Giratina the{" "}
                <b>Griseous Core</b> as a held item.
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Griseous Core</b> is obtained by defeating
                    <b> Sinnoh Champion Camilla</b>.
                  </li>
                </ul>
              </li>
            </ul>

            <CreationTrioImageSlider />
          </div>
        ),
      },
      river_guardians: {
        title: "River Guardians",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Azelf, Mesprit, Uxie</b>: Spawn at <b>Beaches</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 40–65</b>
              </li>
            </ul>
            <RiverGuardiansImageSlider />
          </div>
        ),
      },
      aura_trio: {
        title: "Aura Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-blue-200 to-emerald-800 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(37,99,235,0.7)" }}
            >
              Xerneas
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Xerneas</b>: Spawns in <b>Floral Biomes</b> during{" "}
                <b>daytime</b>.
              </li>
            </ul>

            <XerneasImage />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(220,38,38,0.7)" }}
            >
              Yveltal
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Yveltal</b>: Spawns in <b>Dark Forests</b> during{" "}
                <b>nighttime</b>.
              </li>
            </ul>

            <YveltalImage />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,197,94,0.7)" }}
            >
              Zygarde
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                You can get <b>Zygarde Cells</b> by brushing suspicious sand in{" "}
                <b>Archaeological Sites</b>, looting <b>Chests</b>,{" "}
                <b>Wishing Weald Chests</b>, and barrels in <b>Observatories</b>
                .
              </li>
              <li>
                <b>Zygarde Cores</b> can be found in{" "}
                <b>Mossy Oubliette Ruins</b> and <b>Crumbling Arch Ruins</b>.
              </li>
              <li>
                To assemble Zygarde parts, you need a <b>Zygarde Cube</b> and a{" "}
                <b>Reassembly Unit</b>.
              </li>
              <li>
                You can also find a <b>Zygarde</b> naturally in{" "}
                <b>Dripstone Caves</b>. Its <b>10% Form</b> spawns at{" "}
                <b>Lvl 10–50</b>, and its <b>50% Form</b>
                can spawn at <b>Lvl 50–80</b>.
              </li>
            </ul>

            {/* Static banner image */}
            <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/guides/zygarde.png"
                alt="Where to get Zygarde"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                className="object-cover max-w-full"
              />
            </div>

            {/* Description block */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <h3 className="font-semibold text-lg">Reassembly Unit</h3>
              <p>
                The Reassembly Unit is a block used with the Zygarde Cube to
                create Zygarde. It functions somewhat similarly to a{" "}
                <b>Resurrection Machine</b>.
              </p>
              <h4 className="font-medium">How to Use</h4>
              <p>
                Right-click the Reassembly Unit with a <b>Zygarde Cube</b>{" "}
                containing a set number of Zygarde Cells and Cores. The result
                depends on how many are stored in the cube.
              </p>
              <p>
                When the cube has the correct number of Cells and Cores,
                right-click the Reassembly Unit again to begin the process. The
                fusion takes time to complete based on the form:
              </p>
              <table className="w-full text-sm text-gray-200 border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-gray-100">
                  <tr>
                    <th className="px-2 py-1 border border-gray-700">
                      Cell Count
                    </th>
                    <th className="px-2 py-1 border border-gray-700">
                      Core Count
                    </th>
                    <th className="px-2 py-1 border border-gray-700">Form %</th>
                    <th className="px-2 py-1 border border-gray-700">
                      Ability
                    </th>
                    <th className="px-2 py-1 border border-gray-700">
                      Wait Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">9</td>
                    <td className="px-2 py-1 border border-gray-700">1</td>
                    <td className="px-2 py-1 border border-gray-700">10%</td>
                    <td className="px-2 py-1 border border-gray-700">
                      Aura Break
                    </td>
                    <td className="px-2 py-1 border border-gray-700">2 min</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">49</td>
                    <td className="px-2 py-1 border border-gray-700">1</td>
                    <td className="px-2 py-1 border border-gray-700">50%</td>
                    <td className="px-2 py-1 border border-gray-700">
                      Aura Break
                    </td>
                    <td className="px-2 py-1 border border-gray-700">5 min</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-700">95</td>
                    <td className="px-2 py-1 border border-gray-700">5</td>
                    <td className="px-2 py-1 border border-gray-700">50%</td>
                    <td className="px-2 py-1 border border-gray-700">
                      Power Construct
                    </td>
                    <td className="px-2 py-1 border border-gray-700">10 min</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Once the process finishes, right-click the Reassembly Unit with
                any <b>Pokéball</b> to receive your Zygarde.
              </p>
              <p className="text-xs opacity-70 italic">
                Assembled Zygarde has a small chance of being shiny (1 in 4096).
              </p>
              <p className="text-xs opacity-50 italic">
                Credit: Mega Showdown Wiki
              </p>
            </div>

            <ZygardeImageSlider />
          </div>
        ),
      },
      kubfu: {
        title: "Kubfu",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Spawn Level: <b>Lvl 40–60</b>
              </li>
              <li>
                <b>Kubfu</b> spawns in <b>Cherry Groves</b>.
              </li>
              <li>
                To evolve Kubfu, you need one of these items:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Scroll of Darkness</b> — found by brushing suspicious
                    sands in <b>Desert Pyramids</b>. Evolves Kubfu to{" "}
                    <b>Urshifu Single Strike Form</b>.
                  </li>
                  <li>
                    <b>Scroll of Water</b> — found in <b>Warm Ocean Ruins</b> by
                    brushing suspicious sands. Evolves Kubfu to{" "}
                    <b>Urshifu Rapid Strike Form</b>.
                  </li>
                </ul>
              </li>
            </ul>
            <KubfuImageSlider />
          </div>
        ),
      },
      combat_trio: {
        title: "Combat Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Zacian</b> and <b>Zamazenta</b> spawn in <b>Forest Biomes</b>
                .
              </li>
              <li>
                Zacian, Zamazenta Spawn Level: <b>Lvl 65–80</b>
              </li>
              <li>
                <b>Eternatus</b> spawns in the <b>End dimension</b>.
              </li>
              <li>
                Eternatus Spawn Level: <b>Lvl 70–90</b>
              </li>
              <li>
                To Crown <b>Zamazenta</b>:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Brush up <b>Suspicious gravels</b> in <b>Sol Henge Ruins</b>{" "}
                    OR
                  </li>
                  <li>
                    Brush up <b>Suspicious sands</b> in{" "}
                    <b>Archaeological Sites</b>
                  </li>
                  <li>
                    Find the <b>Rusted Shield</b> to crown Zamazenta.
                  </li>
                </ul>
              </li>
              <li>
                To Crown <b>Zacian</b>:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Brush up <b>Suspicious graves</b> in <b>Luna Henge Ruins</b>{" "}
                    OR
                  </li>
                  <li>
                    Brush up <b>Suspicious sands</b> in{" "}
                    <b>Archaeological Sites</b>
                  </li>
                  <li>
                    Find the <b>Rusted Sword</b> to crown Zacian.
                  </li>
                </ul>
              </li>
              <li>
                For <b>Eternamax Eternatus</b>:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    Craft a <b>Star Core</b> and give it to Eternatus as a held
                    item.
                  </li>
                </ul>
              </li>
            </ul>
            <CombatTrioImageSlider />
          </div>
        ),
      },
      legendary_titans: {
        title: "Legendary Titans",
        series: "Mixed",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,211,238,0.7)" }}
            >
              Regice
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
              <li>
                Structure generates in <b>Snowy Badlands</b>.
              </li>
              <li>
                Player needs <b>Ice Ore</b> (found in Frozen Peaks, Frozen
                Ocean, Ice Spikes) to turn into <b>Cryo Relic</b> to summon
                Regice.
              </li>
              <li>
                <b>Ice Ore Generation:</b> Y <b>65 to 120</b>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:legendary/regice</code>
            </p>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(217,119,6,0.7)" }}
            >
              Regirock
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
              <li>
                Structure generates in <b>Lush Desert</b>.
              </li>
              <li>
                Player needs <b>Rock Ore</b> (found in Badlands, Wooded
                Badlands, Eroded Badlands) to turn into <b>Pebble Relic</b> to
                summon Regirock.
              </li>
              <li>
                <b>Rock Ore Generation:</b> Y <b>0 to 64</b>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:legendary/regirock</code>
            </p>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(107,114,128,0.7)" }}
            >
              Registeel
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
              <li>
                Structure generates in <b>Alpine Highlands</b>.
              </li>
              <li>
                Player needs <b>Steel Ore</b> (found in Deep Dark) to turn into{" "}
                <b>Metal Relic</b> to summon Registeel.
              </li>
              <li>
                <b>Steel Ore Generation:</b> Y <b>-60 to -1</b>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:legendary/registeel</code>
            </p>

            <OriginalTitansImageSlider />

            <h4
              className="font-bold text-lg bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(239,68,68,0.7)" }}
            >
              Regidrago
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>No series required.</li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
              <li>
                <b>Spawns naturally</b> in <b>all Cave biomes</b>.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(234,179,8,0.7)" }}
            >
              Regieleki
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>No series required.</li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
              <li>
                <b>Spawns naturally</b> in <b>Desert biomes</b>.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(147,51,234,0.7)" }}
            >
              Regigigas
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>No series required.</li>
              <li>
                Spawn Level: <b>Lvl 70–80</b>
              </li>
              <li>
                <b>Spawns naturally</b> in the <b>Snowy Taiga</b> biome.
              </li>
            </ul>
          </div>
        ),
      },
      eon_duo: {
        title: "Eon Duo",
        series: "Hoenn Datapack",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(37,99,235,0.7)" }}
            >
              Latios
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Structure generates in <b>Deep Lukewarm Ocean</b> biome (around
                y 200).
              </li>
              <li>
                Player needs <b>Sapphire Dew</b> to summon Latios.
              </li>
              <li>
                <b>Sapphire Dew</b> is dropped by beating the{" "}
                <b>Hoenn Champion Rocco</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 55</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(236,72,153,0.7)" }}
            >
              Latias
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Structure generates in <b>Deep Lukewarm Ocean</b> biome (around
                y 200).
              </li>
              <li>
                Player needs <b>Ruby Dew</b> to summon Latias.
              </li>
              <li>
                <b>Ruby Dew</b> is dropped by beating the{" "}
                <b>Hoenn Champion Rocco</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 55</b>
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:secret_garden</code>
            </p>

            <EonDuoImageSlider />
          </div>
        ),
      },
      jirachi: {
        title: "Jirachi",
        series: "Hoenn Datapack",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(251,191,36,0.7)" }}
            >
              Jirachi
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Spawn Level: <b>Lvl 75</b>
              </li>
              <li>
                Needs to have <b>Hoenn Datapack</b> enabled.
              </li>
              <li>
                Structure generates in <b>Blooming Plateau</b>.
              </li>
              <li>
                To summon Jirachi, you need to find the <b>Melodic Tape</b>.
              </li>
              <li>
                The <b>Melodic Tape</b> is found inside a barrel at the top of
                the structure.
              </li>
            </ul>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:mythical/jirachi</code>
            </p>

            <JirachiImageSlider />
          </div>
        ),
      },
      lunar_duo: {
        title: "Lunar Duo",
        series: "Legendary/Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(167,139,250,0.7)" }}
            >
              Cresselia
            </h4>

            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Cresselia</b> spawns in <b>Cherry Groves</b> during{" "}
                <b>nighttime</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 40–65</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-gray-200 to-purple-700 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(126,34,206,0.7)" }}
            >
              Darkrai
            </h4>

            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Darkrai</b> spawns in <b>Dark Forests</b> during{" "}
                <b>nighttime</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 40–65</b>
              </li>
            </ul>

            <LunarDuoImageSlider />
          </div>
        ),
      },
      sea_guardians: {
        title: "Sea Guardians",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Manaphy</b> and <b>Phione</b> spawn in{" "}
                <b>any Ocean biomes</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50</b>
              </li>
            </ul>

            <SeaGuardiansImage />
          </div>
        ),
      },
      heatran: {
        title: "Heatran",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Heatran</b> spawns in <b>Nether Wastes</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–65</b>
              </li>
            </ul>

            <HeatranImage />
          </div>
        ),
      },
      shaymin: {
        title: "Shaymin",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Shaymin</b> spawns in <b>Floral biomes</b> during{" "}
                <b>daytime</b> with <b>clear weather</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–55</b>
              </li>
              <li>
                <span className="text-red-300">Note:</span>{" "}
                <b>Gracidea Flower</b> (Sky Form change) is unobtainable as of
                writing.
              </li>
            </ul>

            <ShayminImage />
          </div>
        ),
      },
      arceus: {
        title: "Arceus",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Arceus</b> can be found in the <b>End dimension</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                <b>Arceus Plates</b> can only be obtained through{" "}
                <b>Ominous Trial Vaults</b> in <b>Trial Chambers</b>.
              </li>
              <li>
                Arceus Plates drop rates: <b>0.45%</b> in Vaults.
              </li>
              <li>
                <b>Ominous Keys</b> can be found in <b>Rocket Tower</b> or as a{" "}
                <b>5%</b> drop by a <b>Klefki</b>.
              </li>
              <li>
                You can also change <b>Arceus' type</b> using <b>Z-Crystals</b>,
                but this does <u>not</u> change the damage type of Arceus'
                signature move <b>Judgment</b>. Only <b>Arceus Plates</b> alter
                the damage type of Judgment.
              </li>
            </ul>

            <ArceusImageSlider />
          </div>
        ),
      },
      victini: {
        title: "Victini",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Victini</b> spawns in{" "}
                <b>
                  Mushroom Fields, Alpha Islands, Alpha Islands Winter, Mirage
                  Isles, Warped Mesa
                </b>{" "}
                biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50</b>
              </li>
              <li>
                It has a <b>3x spawn multiplier</b> in the{" "}
                <span className="text-yellow-300">morning</span>.
              </li>
              <li>
                If you <b>Shoulder Mount Victini</b>, it grants you{" "}
                <span className="text-green-300">Luck V</span> buff.
              </li>
              <li>
                One of the <b>best Pokémon</b> to put in a <b>Pasture Block</b>{" "}
                to farm valuable drops:
                <ul className="list-disc list-inside ml-6">
                  <li>Nether Stars</li>
                  <li>Rare Candies</li>
                  <li>Fire Gems</li>
                  <li>Ability Capsules</li>
                  <li>Ability Patch</li>
                </ul>
              </li>
            </ul>

            <VictiniImage />
          </div>
        ),
      },
      swords_of_justice: {
        title: "Swords of Justice",
        series: "Legendary/Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-blue-400 to-gray-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(59,130,246,0.7)" }}
            >
              Cobalion
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Cobalion</b> spawns in <b>Windswept Forest</b> biome.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(249,115,22,0.7)" }}
            >
              Terrakion
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Terrakion</b> spawns in <b>Savanna</b> biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,197,94,0.7)" }}
            >
              Virizion
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Virizion</b> spawns in <b>all Forest</b> biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(244,114,182,0.7)" }}
            >
              Keldeo
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Keldeo</b> spawns in <b>Sakura Grove</b> and{" "}
                <b>Sakura Valley</b>.
              </li>
              <li>
                Keldeo Ordinary Form: <b>Lvl 60</b>; Resolute Form:{" "}
                <b>Lvl 80</b>
              </li>
            </ul>

            <SwordsOfJusticeImageSlider />
          </div>
        ),
      },
      forces_of_nature: {
        title: "Forces of Nature",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,211,238,0.7)" }}
            >
              Tornadus
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Tornadus</b> spawns in <b>All Ocean Biomes</b>. <b>3x</b>{" "}
                when <b>Raining</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(250,204,21,0.7)" }}
            >
              Thundurus
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Thundurus</b> spawns in <b>Mountain</b> biomes. <b>3x</b>{" "}
                when <b>Thundering</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(34,197,94,0.7)" }}
            >
              Landorus
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Landorus</b> spawns in <b>Badlands</b> biomes.{" "}
                <b>Clear weather</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–60</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(236,72,153,0.7)" }}
            >
              Enamorus
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Enamorus</b> spawns in <b>Mountain</b> biomes. <b>4x</b> when{" "}
                <b>Thundering</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50</b>
              </li>
            </ul>

            <h4 className="font-medium text-lg">Therian Formes</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                You can reveal their <b>Therian Formes</b> by using a{" "}
                <b>Reveal Glass</b>.
              </li>
              <li>
                <b>Reveal Glass</b> is obtainable by brushing suspicious sands
                in <b>Desert Pyramids</b> with a <b>7.69%</b> drop rate.
              </li>
            </ul>

            <ForcesOfNatureImageSlider />
          </div>
        ),
      },
      meloetta: {
        title: "Meloetta",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Meloetta</b> spawns in <b>Sunflower Plains</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–55</b>
              </li>
            </ul>

            <h4 className="font-medium">Form Change</h4>
            <p>
              To change Meloetta's form, use the move <b>Relic Song</b> during a
              battle. After using this move, Meloetta switches from{" "}
              <b>Aria Forme</b> to <b>Pirouette Forme</b>. It reverts back to{" "}
              <b>Aria Forme</b> when the battle ends or if it is switched out.
            </p>

            <MeloettaImage />
          </div>
        ),
      },
      genesect: {
        title: "Genesect",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Genesect</b> spawns in <b>Dripstone Caves</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 48–68</b>
              </li>
            </ul>

            <h4 className="font-medium">Genesect Drives</h4>
            <p>
              Genesect Drives change the type of <b>Techno Blast</b> used by
              Genesect. There are four Drives: <b>Burn</b> (Fire), <b>Chill</b>
              (Ice), <b>Douse</b> (Water), and <b>Shock</b> (Electric).
            </p>
            <p>
              To change Genesect's Techno Blast type, craft its Drives or obtain
              them from <b>Ominous Trial Vaults</b> with a <b>5.26%</b> drop
              chance.
            </p>

            <GenesectImage />
          </div>
        ),
      },
      type_null_silvally: {
        title: "Type: Null & Silvally",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(209,213,219,0.6)" }}
            >
              Type: Null
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                To get <b>Type: Null</b>, you need a <b>Fossilized Helmet</b>.
              </li>
              <li>
                Obtain the <b>Fossilized Helmet</b> by defeating a{" "}
                <b>Team Rocket Scientist</b> in the <b>Team Rocket Tower</b>{" "}
                located in the <b>Badlands</b> biome.
              </li>
              <li>
                Put the <b>Fossilized Helmet</b> into a{" "}
                <b>Fossil Resurrection Machine</b> to obtain <b>Type: Null</b>.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-slate-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(148,163,184,0.6)" }}
            >
              Silvally
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Type: Null</b> evolves into <b>Silvally</b> with{" "}
                <b>160 Friendship</b>.
              </li>
              <li>
                <b>Silvally Memory Discs</b> can be found in{" "}
                <b>Ominous Trial Vaults</b> with a <b>0.99%</b> drop chance.
              </li>
            </ul>

            <TypeNullSilvallyImageSlider />
          </div>
        ),
      },
      diancie: {
        title: "Diancie",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Diancie</b> spawns in <b>Lush Caves</b> with{" "}
                <b>light level 0–7</b>.
              </li>
            </ul>

            <DiancieImage />
          </div>
        ),
      },
      hoopa: {
        title: "Hoopa",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Hoopa</b> spawns in the <b>End dimension</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 65–75</b>
              </li>
            </ul>

            <h4 className="font-medium">Unbound Form</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                To reveal Hoopa's <b>Unbound</b> Form, <b>interact</b> (not
                hold) with the <b>Prison Bottle</b>.
              </li>
              <li>
                <b>Prison Bottle</b> can be found by brushing suspicious sands
                in
                <b> Desert Pyramids</b> with a <b>7.6%</b> drop chance, and in
                <b> Ancient City</b> chests with a <b>4.55%</b> drop chance.
              </li>
            </ul>

            <HoopaImageSlider />
          </div>
        ),
      },
      volcanion: {
        title: "Volcanion",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Volcanion</b> spawns in <b>Meadow</b>, <b>Grove</b>,
                <b> Snowy Slopes</b>, <b> Jagged Peaks</b>, <b> Frozen Peaks</b>
                , and <b> Stony Peaks</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
            </ul>

            <VolcanionImage />
          </div>
        ),
      },
      guardian_deities: {
        title: "Guardian Deities",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(245,158,11,0.7)" }}
            >
              Tapu Koko
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Tapu Koko</b> spawns in <b>Savanna</b> and <b>Jungle</b>{" "}
                biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-400 to-fuchsia-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(217,70,239,0.7)" }}
            >
              Tapu Lele
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Tapu Lele</b> spawns in <b>Floral</b> and <b>Beach</b>{" "}
                biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(16,185,129,0.7)" }}
            >
              Tapu Bulu
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Tapu Bulu</b> spawns in <b>Rivers</b> and <b>Jungle</b>{" "}
                biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(59,130,246,0.7)" }}
            >
              Tapu Fini
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Tapu Fini</b> spawns in <b>Rivers</b> and <b>Beach</b>{" "}
                biomes.
              </li>
              <li>
                Spawn Level: <b>Lvl 50–70</b>
              </li>
            </ul>

            <GuardianDeitiesImageSlider />
          </div>
        ),
      },
      light_trio: {
        title: "Light Trio",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Cosmog</b> and <b>Cosmoem</b> spawn in the{" "}
                <b>End dimension</b>.
              </li>
              <li>
                Spawn Levels — Cosmog: <b>Lvl 28–42</b>, Cosmoem:{" "}
                <b>Lvl 44–52</b>
              </li>
              <li>
                <b>Cosmoem</b> evolves at <b>level 53</b>:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Daytime</b> → evolves into <b>Solgaleo</b>.
                  </li>
                  <li>
                    <b>Nighttime</b> → evolves into <b>Lunala</b>.
                  </li>
                </ul>
              </li>
              <li>
                <b>Solgaleo</b> spawns in <b>Savanna</b> biomes and in the{" "}
                <b>End</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                <b>Lunala</b> spawns in <b>Dark Forests</b> and in the{" "}
                <b>End</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 70</b>
              </li>
              <li>
                <b>Necrozma</b> spawns in the <b>End</b>.
              </li>
              <li>
                Spawn Level: <b>Lvl 70–75</b>
              </li>
            </ul>

            <h4 className="font-medium">Fusion</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Fuse <b>Lunala/Solgaleo</b> with <b>Necrozma</b> by using or
                interacting a<b> N-Solarizer</b>/<b> Lunarizer</b> on{" "}
                <b>Solgaleo/Lunala</b> and on <b>Necrozma</b>.
              </li>
              <li>
                Fused Necrozma in towers: <b>Lvl 80</b>
              </li>
              <li>You can unfuse them using the same item.</li>
              <li>
                You can also find an already fused Necrozma in <b>Dusk</b> and{" "}
                <b>Dawn Towers</b> in the <b>End</b>, but you can't unfuse
                those.
              </li>
            </ul>

            <h4 className="font-medium">Ultra Necrozma</h4>
            <p>
              To get <b>Ultra Necrozma</b>, use <b>Ultranecrozium Z</b> to
              trigger Ultra Burst. This upgrades <b>Photon Geyser</b> into the
              Z-Move <i>Light That Burns the Sky</i>. While holding
              Ultranecrozium Z, Necrozma cannot use other Z-Moves.
            </p>
            <p className="text-xs opacity-50 italic">
              Use <code>/locate structure cobbleverse:dusk_tower</code> or{" "}
              <code>/locate structure cobbleverse:dawn_tower</code>
            </p>

            <LightTrioImageSlider />
          </div>
        ),
      },
      ultra_beasts: {
        title: "Ultra Beasts",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Nihilego</b> spawns in the <b>End Dimension</b>.
              </li>
              <li>
                <b>Poipole</b> spawns around Necrozma's <b>Dawn/Dusk Tower</b>{" "}
                in the <b>End</b>.
              </li>
              <li>
                <b>Naganadel</b> spawns in the <b>End Dimension</b> near{" "}
                <b>Purpur Blocks</b>.
              </li>
              <li>
                <b>Pheromosa</b> spawns in the <b>End Dimension</b> and also in{" "}
                <b>Blooming Valley</b>, <b>Steppe</b>, <b>White Cliffs</b>{" "}
                (Terralith biomes).
              </li>
              <li>
                <b>Guzzlord</b> spawns in <b>End Barrens</b> and{" "}
                <b>Deep Dark</b>.
              </li>
              <li>
                <b>Stakataka</b> spawns in <b>Deep Dark</b>.
              </li>
              <li>
                <b>Buzzwole</b> spawns in <b>Swamp Biomes</b>.
              </li>
              <li>
                <b>Xurkitree</b> spawns in <b>Mangrove Swamps</b>.
              </li>
              <li>
                <b>Celesteela</b> spawns in <b>Desert biomes</b>.
              </li>
              <li>
                <b>Kartana</b> spawns in <b>Bamboo Jungles</b>.
              </li>
              <li>
                <b>Blacephalon</b> spawns in <b>Dark Forests</b>.
              </li>
            </ul>

            <UltraBeastsImageSlider />
          </div>
        ),
      },
      gen7_mythicals: {
        title: "Gen 7 Mythicals",
        series: "Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <h4
              className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(250,204,21,0.7)" }}
            >
              Zeraora
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Zeraora</b> spawns in <b>Badlands</b> and <b>all Forest</b>{" "}
                biomes.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(244,114,182,0.7)" }}
            >
              Magearna
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Magearna</b> spawns in <b>all Taiga</b> biomes.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(147,51,234,0.7)" }}
            >
              Marshadow
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Marshadow</b> spawns in <b>Deep Dark</b>.
              </li>
            </ul>

            <h4
              className="font-bold text-lg bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 6px rgba(107,114,128,0.7)" }}
            >
              Meltan
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Meltan</b> spawns in <b>All Overworld</b> biomes near{" "}
                <b>Iron Blocks</b> or in <b>Beach</b> biome.
              </li>
              <li>
                <b>Meltan</b> evolves into <b>Melmetal</b> at <b>level 70</b>{" "}
                while holding an <b>Anvil</b>.
              </li>
            </ul>

            <Gen7MythicalsImageSlider />
          </div>
        ),
      },
      paradox_ancient: {
        title: "Paradox: Ancient",
        series: "Paradox",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Great Tusk</b>: Savanna, Savanna Plateau, Badlands, Desert.
              </li>
              <li>
                <b>Scream Tail</b>: Cherry Grove, Flower Forest, Meadow,
                Sunflower Plains, Floral biomes while raining.
              </li>
              <li>
                <b>Brute Bonnet</b>: Jungle biomes.
              </li>
              <li>
                <b>Flutter Mane</b>: Dark Forests and Deep Dark.
              </li>
              <li>
                <b>Slither Wing</b>: Nether Crimson Forests (Rare) or Jungles
                (Ultra-Rare).
              </li>
              <li>
                <b>Sandy Shocks</b>: Desert, Badlands, Savanna.
              </li>
              <li>
                <b>Roaring Moon</b>: Meadow, Grove, Snowy Slopes, Jagged Peaks,
                Frozen Peaks, Stony Peaks (night).
              </li>
              <li>
                <b>Koraidon</b>: Beach biome.
              </li>
              <li>
                <b>Walking Wake</b>: Meadow, Grove, Snowy Slopes, Jagged Peaks,
                Frozen Peaks, Stony Peaks (raining).
              </li>
              <li>
                <b>Gouging Fire</b>: Basalt Deltas.
              </li>
              <li>
                <b>Raging Bolt</b>: Savanna, Savanna Plateau, Badlands, Desert.
                1.5x when raining. 3x when Thundering.
              </li>
            </ul>

            <ParadoxAncientImageSlider />
          </div>
        ),
      },
      paradox_future: {
        title: "Paradox: Future",
        series: "Paradox",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Iron Treads</b>: Badlands, Desert, Savanna, Meadow, Grove,
                Snowy Slopes, Jagged Peaks, Frozen Peaks, Stony Peaks.
              </li>
              <li>
                <b>Iron Bundle</b>: Frozen Peaks, Ice Spikes, Snowy Plains,
                Frozen River, Jagged Peaks, Snowy Beach, Snowy Slopes.
              </li>
              <li>
                <b>Iron Hands</b>: Desert (night).
              </li>
              <li>
                <b>Iron Jugulis</b>: Meadow, Grove, Snowy Slopes, Jagged Peaks,
                Frozen Peaks, Stony Peaks (night).
              </li>
              <li>
                <b>Iron Moth</b>: All Hills biomes (daytime).
              </li>
              <li>
                <b>Iron Thorns</b>: Meadow, Grove, Snowy Slopes, Jagged Peaks,
                Frozen Peaks, Stony Peaks.
              </li>
              <li>
                <b>Iron Valiant</b>: All Plains biomes near a lightning rod.
              </li>
              <li>
                <b>Miraidon</b>: Beach biome.
              </li>
              <li>
                <b>Iron Leaves</b>: All Forest biomes (night).
              </li>
              <li>
                <b>Iron Boulder</b>: Dark Forests (night).
              </li>
              <li>
                <b>Iron Crown</b>: Lush Caves and Underground Jungle (night).
              </li>
            </ul>

            <ParadoxFutureImageSlider />
          </div>
        ),
      },
      treasures_of_ruin: {
        title: "Treasures of Ruin",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Wo-Chien</b>: Mangrove Swamps.
              </li>
              <li>
                <b>Chien-Pao</b>: Frozen River, Jagged Peaks, Snowy Beach, Snowy
                Plains.
              </li>
              <li>
                <b>Ting-Lu</b>: Dark Forests.
              </li>
              <li>
                <b>Chi-Yu</b>: Basalt Deltas.
              </li>
            </ul>

            <TreasuresOfRuinImageSlider />
          </div>
        ),
      },
      ogerpon: {
        title: "Ogerpon",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Ogerpon</b> spawns in <b>Lush Caves</b> and
                <b> Underground Jungle</b>.
              </li>
            </ul>

            <h4 className="font-medium">Ogerpon Masks</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Masks can be obtained by brushing suspicious sands/gravels.
              </li>
              <li>
                <b>Wellspring Mask</b>: Frozen Gimmighoul Tower — <b>16.67%</b>.
              </li>
              <p className="text-xs opacity-50 italic">
                Use{" "}
                <code>
                  /locate structure cobblemon:ruins/frozen_gimmi_tower
                </code>
              </p>
              <li>
                <b>Cornerstone Mask</b>: Lush Gimmighoul Tower — <b>16.67%</b>.
              </li>
              <p className="text-xs opacity-50 italic">
                Use{" "}
                <code>/locate structure cobblemon:ruins/lush_gimmi_tower</code>
              </p>
              <li>
                <b>Hearthflame Mask</b>: Deserted Gimmighoul Tower —
                <b> 14.29%</b>.
              </li>
              <p className="text-xs opacity-50 italic">
                Use{" "}
                <code>
                  /locate structure cobblemon:ruins/deserted_gimmi_tower
                </code>
              </p>
            </ul>

            <OgerponImageSlider />
          </div>
        ),
      },
      loyal_three: {
        title: "Loyal Three",
        series: "Legendary/Mythical",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Okidogi</b>: Savanna biomes.
              </li>
              <li>
                <b>Munkidori</b>: Jungle biomes.
              </li>
              <li>
                <b>Fezandipiti</b>: Frozen Peaks, Jagged Peaks, Snowy Slopes.
              </li>
              <li>
                Leader <b>Pecharunt</b>: Dark Forests.
              </li>
            </ul>

            <LoyalThreeImageSlider />
          </div>
        ),
      },
      terapagos: {
        title: "Terapagos",
        series: "Legendary",
        levelCap: "Any",
        content: (
          <div className="space-y-6">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <b>Terapagos</b> can spawn in <b>Lush Caves</b> and
                <b> Underground Jungles</b> near <b>Large Amethyst Bud</b>,{" "}
                <b>Medium Amethyst Bud</b>, and <b>Small Amethyst Bud</b>. Y
                level must be ≤ 0.
              </li>
              <li>
                Another way: equip <b>Liko's Pendant</b> and wait 1 hour. The
                pendant is unobtainable in survival, use command:
                <code> /give @s mega_showdown:likos_pendant</code>
              </li>
            </ul>

            <TerapagosImage />
          </div>
        ),
      },
    }),
    []
  ); // Empty deps - pokemonData never changes

  // Optimized tab setter using transition
  const handleTabChange = useCallback((newTab) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  }, []);

  // Debounce search query to reduce expensive computations
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150); // 150ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize search results to avoid expensive recomputation
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery) return [];
    const query = debouncedSearchQuery.toLowerCase();

    return Object.entries(pokemonData)
      .filter(([key, data]) => {
        // Enhanced fuzzy search function
        const fuzzyMatch = (text, search) => {
          const textLower = text.toLowerCase();
          const searchLower = search.toLowerCase();

          // Exact match gets highest priority
          if (textLower.includes(searchLower)) return 3;

          // Fuzzy matching - check if all characters exist in order
          let searchIndex = 0;
          for (
            let i = 0;
            i < textLower.length && searchIndex < searchLower.length;
            i++
          ) {
            if (textLower[i] === searchLower[searchIndex]) {
              searchIndex++;
            }
          }

          // If all search characters found in order
          if (searchIndex === searchLower.length) return 2;

          // Check for common abbreviations (e.g., "mew2" -> "mewtwo")
          const abbreviations = {
            mew2: "mewtwo",
            ash: "ash",
            hooh: "ho-oh",
            "ho-oh": "hooh",
          };

          if (
            abbreviations[searchLower] &&
            textLower.includes(abbreviations[searchLower])
          ) {
            return 2;
          }

          return 0;
        };

        // Search in title and series
        const titleScore = fuzzyMatch(data.title, query);
        const seriesScore = fuzzyMatch(data.series, query);

        if (titleScore > 0 || seriesScore > 0) return true;

        // Map specific Pokémon names to their entries with fuzzy matching
        const pokemonMappings = {
          "rusted sword": "combat_trio",
          "rusted shield": "combat_trio",
          "prison bottle": "hoopa",
          "dyna tree": "legendary_birds_trio",
          meteorite: "deoxys",
          "mega meteorite": "deoxys",
          "arceus plates": "arceus",
          plates: "arceus",
          "mew's altar": "mew_duo",
          "origin fossil": "mew_duo",
          "ancient origin ball": "mew_duo",
          "ancient dna": "mew_duo",
          "cloning catalyst": "mew_duo",
          "dna splicer": "tao_trio",
          "adamant crystal": "creation_trio",
          "lustrous globe": "creation_trio",
          "griseous core": "creation_trio",
          "secret garden": "eon_duo",
          "ruby dew": "eon_duo",
          "sapphire dew": "eon_duo",
          "celebi shrine": "celebi",
          "dawn tower": "light_trio",
          "dusk tower": "light_trio",
          gracidea: "shaymin",
          "reins of unity": "calyrex",
          "ice carrot": "calyrex",
          "shadow carrot": "calyrex",
          cresselia: "lunar_duo",
          darkrai: "lunar_duo",
          manaphy: "sea_guardians",
          phione: "sea_guardians",
          heatran: "heatran",
          shaymin: "shaymin",
          arceus: "arceus",
          cobalion: "swords_of_justice",
          terrakion: "swords_of_justice",
          virizion: "swords_of_justice",
          keldeo: "swords_of_justice",
          tornadus: "forces_of_nature",
          thundurus: "forces_of_nature",
          landorus: "forces_of_nature",
          enamorus: "forces_of_nature",
          "reveal glass": "forces_of_nature",
          meloetta: "meloetta",
          genesect: "genesect",
          diancie: "diancie",
          hoopa: "hoopa",
          volcanion: "volcanion",
          tapu: "guardian_deities",
          "tapu koko": "guardian_deities",
          "tapu lele": "guardian_deities",
          "tapu bulu": "guardian_deities",
          "tapu fini": "guardian_deities",
          cosmog: "light_trio",
          cosmoem: "light_trio",
          solgaleo: "light_trio",
          lunala: "light_trio",
          necrozma: "light_trio",
          "ultra necrozma": "light_trio",
          nihilego: "ultra_beasts",
          poipole: "ultra_beasts",
          naganadel: "ultra_beasts",
          pheromosa: "ultra_beasts",
          guzzlord: "ultra_beasts",
          stakataka: "ultra_beasts",
          buzzwole: "ultra_beasts",
          xurkitree: "ultra_beasts",
          celesteela: "ultra_beasts",
          kartana: "ultra_beasts",
          blacephalon: "ultra_beasts",
          zeraora: "gen7_mythicals",
          magearna: "gen7_mythicals",
          marshadow: "gen7_mythicals",
          meltan: "gen7_mythicals",
          melmetal: "gen7_mythicals",
          "great tusk": "paradox_ancient",
          "scream tail": "paradox_ancient",
          "brute bonnet": "paradox_ancient",
          "flutter mane": "paradox_ancient",
          "slither wing": "paradox_ancient",
          "sandy shocks": "paradox_ancient",
          "roaring moon": "paradox_ancient",
          koraidon: "paradox_ancient",
          "walking wake": "paradox_ancient",
          "gouging fire": "paradox_ancient",
          "raging bolt": "paradox_ancient",
          "iron treads": "paradox_future",
          "iron bundle": "paradox_future",
          "iron hands": "paradox_future",
          "iron jugulis": "paradox_future",
          "iron moth": "paradox_future",
          "iron thorns": "paradox_future",
          "iron valiant": "paradox_future",
          miraidon: "paradox_future",
          "iron leaves": "paradox_future",
          "iron boulder": "paradox_future",
          "iron crown": "paradox_future",
          "wo-chien": "treasures_of_ruin",
          "chien-pao": "treasures_of_ruin",
          "ting-lu": "treasures_of_ruin",
          "chi-yu": "treasures_of_ruin",
          ogerpon: "ogerpon",
          okidogi: "loyal_three",
          munkidori: "loyal_three",
          fezandipiti: "loyal_three",
          pecharunt: "loyal_three",
          terapagos: "terapagos",
          palkia: "creation_trio",
          dialga: "creation_trio",
          giratina: "creation_trio",
          kyurem: "tao_trio",
          reshiram: "tao_trio",
          zekrom: "tao_trio",
          azelf: "river_guardians",
          mesprit: "river_guardians",
          uxie: "river_guardians",
          articuno: "legendary_birds_trio",
          zapdos: "legendary_birds_trio",
          moltres: "legendary_birds_trio",
          greninja: "ash_pokemons",
          pikachu: "ash_pokemons",
          xerneas: "aura_trio",
          yveltal: "aura_trio",
          zygarde: "aura_trio",
          kubfu: "kubfu",
          urshifu: "kubfu",
          zacian: "combat_trio",
          zamazenta: "combat_trio",
          eternatus: "combat_trio",
          mew: "mew_duo",
          mewtwo: "mew_duo",
          kyogre: "weather_trio",
          groudon: "weather_trio",
          rayquaza: "weather_trio",
          regice: "legendary_titans",
          regirock: "legendary_titans",
          registeel: "legendary_titans",
          regidrago: "legendary_titans",
          regieleki: "legendary_titans",
          regigigas: "legendary_titans",
          latios: "eon_duo",
          latias: "eon_duo",
          jirachi: "jirachi",
          calyrex: "calyrex",
          spectrier: "calyrex",
          glastrier: "calyrex",
          celebi: "celebi",
          victini: "victini",
          typenull: "typenull_silvally",
          silvally: "typenull_silvally",
          entei: "hooh",
          suicune: "hooh",
          raikou: "hooh",
          "legendary beasts": "hooh",
        };

        // Check if the search query matches a mapped Pokémon with fuzzy matching
        for (const [pokemonName, entryKey] of Object.entries(pokemonMappings)) {
          if (fuzzyMatch(pokemonName, query) > 0 && key === entryKey) {
            return true;
          }
        }

        return false;
      })
      .sort(([keyA, dataA], [keyB, dataB]) => {
        // Sort by relevance (exact matches first, then fuzzy matches)
        const getScore = (data) => {
          const titleScore = data.title.toLowerCase().includes(query)
            ? 3
            : data.title.toLowerCase().indexOf(query) > -1
            ? 2
            : 0;
          const seriesScore = data.series.toLowerCase().includes(query) ? 1 : 0;
          return titleScore + seriesScore;
        };

        return getScore(dataB) - getScore(dataA);
      })
      .slice(0, 8);
  }, [debouncedSearchQuery, pokemonData]);

  React.useEffect(() => {
    if (initializedFromUrlRef.current) return;
    initializedFromUrlRef.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("p");
      if (p && Object.prototype.hasOwnProperty.call(pokemonData, p)) {
        handleTabChange(p);
      }
    } catch {}
  }, [pokemonData]);

  // Defer URL updates to avoid blocking rendering
  React.useEffect(() => {
    startTransition(() => {
      try {
        const url = new URL(window.location.href);
        if (activeTab) {
          url.searchParams.set("p", activeTab);
        } else {
          url.searchParams.delete("p");
        }
        window.history.replaceState(null, "", url.toString());
      } catch {}
    });
  }, [activeTab]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-3 overflow-x-hidden">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          How to Get Specific Pokémon
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          This list only shows the most commonly asked in the LUMYVERSE Discord
          server. Visit the{" "}
          <a
            href="https://www.lumyverse.com/cobbleverse/exclusive-structures-in-cobbleverse/"
            className="text-blue-400 underline hover:text-blue-300 transition-colors"
          >
            COBBLEVERSE Wiki
          </a>{" "}
          for more information.
        </p>
      </div>

      {/* 🔍 Search with Autocomplete */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Pokémon... (e.g., Mew, Mewtwo, Lugia, Giratina)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const query = searchQuery.toLowerCase();
                const pokemonMappings = {
                  "rusted sword": "combat_trio",
                  "rusted shield": "combat_trio",
                  "prison bottle": "hoopa",
                  "dyna tree": "legendary_birds_trio",
                  meteorite: "deoxys",
                  "mega meteorite": "deoxys",
                  "arceus plates": "arceus",
                  plates: "arceus",
                  "mew's altar": "mew_duo",
                  "origin fossil": "mew_duo",
                  "ancient origin ball": "mew_duo",
                  "ancient dna": "mew_duo",
                  "cloning catalyst": "mew_duo",
                  "dna splicer": "tao_trio",
                  "adamant crystal": "creation_trio",
                  "lustrous globe": "creation_trio",
                  "griseous core": "creation_trio",
                  "secret garden": "eon_duo",
                  "ruby dew": "eon_duo",
                  "sapphire dew": "eon_duo",
                  "celebi shrine": "celebi",
                  "dawn tower": "light_trio",
                  "dusk tower": "light_trio",
                  gracidea: "shaymin",
                  "reins of unity": "calyrex",
                  "ice carrot": "calyrex",
                  "shadow carrot": "calyrex",
                  cresselia: "lunar_duo",
                  darkrai: "lunar_duo",
                  manaphy: "sea_guardians",
                  phione: "sea_guardians",
                  heatran: "heatran",
                  shaymin: "shaymin",
                  arceus: "arceus",
                  cobalion: "swords_of_justice",
                  terrakion: "swords_of_justice",
                  virizion: "swords_of_justice",
                  keldeo: "swords_of_justice",
                  tornadus: "forces_of_nature",
                  thundurus: "forces_of_nature",
                  landorus: "forces_of_nature",
                  enamorus: "forces_of_nature",
                  "reveal glass": "forces_of_nature",
                  meloetta: "meloetta",
                  genesect: "genesect",
                  diancie: "diancie",
                  hoopa: "hoopa",
                  volcanion: "volcanion",
                  tapu: "guardian_deities",
                  "tapu koko": "guardian_deities",
                  "tapu lele": "guardian_deities",
                  "tapu bulu": "guardian_deities",
                  "tapu fini": "guardian_deities",
                  cosmog: "light_trio",
                  cosmoem: "light_trio",
                  solgaleo: "light_trio",
                  lunala: "light_trio",
                  necrozma: "light_trio",
                  "ultra necrozma": "light_trio",
                  nihilego: "ultra_beasts",
                  poipole: "ultra_beasts",
                  naganadel: "ultra_beasts",
                  pheromosa: "ultra_beasts",
                  guzzlord: "ultra_beasts",
                  stakataka: "ultra_beasts",
                  buzzwole: "ultra_beasts",
                  xurkitree: "ultra_beasts",
                  celesteela: "ultra_beasts",
                  kartana: "ultra_beasts",
                  blacephalon: "ultra_beasts",
                  zeraora: "gen7_mythicals",
                  magearna: "gen7_mythicals",
                  marshadow: "gen7_mythicals",
                  meltan: "gen7_mythicals",
                  melmetal: "gen7_mythicals",
                  "great tusk": "paradox_ancient",
                  "scream tail": "paradox_ancient",
                  "brute bonnet": "paradox_ancient",
                  "flutter mane": "paradox_ancient",
                  "slither wing": "paradox_ancient",
                  "sandy shocks": "paradox_ancient",
                  "roaring moon": "paradox_ancient",
                  koraidon: "paradox_ancient",
                  "walking wake": "paradox_ancient",
                  "gouging fire": "paradox_ancient",
                  "raging bolt": "paradox_ancient",
                  "iron treads": "paradox_future",
                  "iron bundle": "paradox_future",
                  "iron hands": "paradox_future",
                  "iron jugulis": "paradox_future",
                  "iron moth": "paradox_future",
                  "iron thorns": "paradox_future",
                  "iron valiant": "paradox_future",
                  miraidon: "paradox_future",
                  "iron leaves": "paradox_future",
                  "iron boulder": "paradox_future",
                  "iron crown": "paradox_future",
                  "wo-chien": "treasures_of_ruin",
                  "chien-pao": "treasures_of_ruin",
                  "ting-lu": "treasures_of_ruin",
                  "chi-yu": "treasures_of_ruin",
                  ogerpon: "ogerpon",
                  okidogi: "loyal_three",
                  munkidori: "loyal_three",
                  fezandipiti: "loyal_three",
                  pecharunt: "loyal_three",
                  terapagos: "terapagos",
                  palkia: "creation_trio",
                  dialga: "creation_trio",
                  giratina: "creation_trio",
                  kyurem: "tao_trio",
                  reshiram: "tao_trio",
                  zekrom: "tao_trio",
                  azelf: "river_guardians",
                  mesprit: "river_guardians",
                  uxie: "river_guardians",
                  articuno: "legendary_birds_trio",
                  zapdos: "legendary_birds_trio",
                  moltres: "legendary_birds_trio",
                  greninja: "ash_pokemons",
                  pikachu: "ash_pokemons",
                  xerneas: "aura_trio",
                  yveltal: "aura_trio",
                  zygarde: "aura_trio",
                  kubfu: "kubfu",
                  urshifu: "kubfu",
                  zacian: "combat_trio",
                  zamazenta: "combat_trio",
                  eternatus: "combat_trio",
                  mew: "mew_duo",
                  mewtwo: "mew_duo",
                  kyogre: "weather_trio",
                  groudon: "weather_trio",
                  rayquaza: "weather_trio",
                  regice: "legendary_titans",
                  regirock: "legendary_titans",
                  registeel: "legendary_titans",
                  regidrago: "legendary_titans",
                  regieleki: "legendary_titans",
                  regigigas: "legendary_titans",
                  latios: "eon_duo",
                  latias: "eon_duo",
                  jirachi: "jirachi",
                  calyrex: "calyrex",
                  spectrier: "calyrex",
                  glastrier: "calyrex",
                  celebi: "celebi",
                  victini: "victini",
                  typenull: "typenull_silvally",
                  silvally: "typenull_silvally",
                  entei: "hooh",
                  suicune: "hooh",
                  raikou: "hooh",
                  "legendary beasts": "hooh",
                };

                // Find matching entry
                for (const [pokemonName, entryKey] of Object.entries(
                  pokemonMappings
                )) {
                  if (pokemonName.includes(query)) {
                    handleTabChange(entryKey);
                    setSearchQuery("");
                    return;
                  }
                }

                // Fallback to title/series search
                const matchingEntry = Object.entries(pokemonData).find(
                  ([key, data]) =>
                    data.title.toLowerCase().includes(query) ||
                    data.series.toLowerCase().includes(query)
                );

                if (matchingEntry) {
                  handleTabChange(matchingEntry[0]);
                  setSearchQuery("");
                }
              }
            }}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
          />

          {/* Autocomplete Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
              {searchResults.map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleTabChange(key);
                    setSearchQuery(""); // Clear search bar
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-white">{data.title}</div>
                  <div className="text-sm text-gray-400">{data.series}</div>
                </button>
              ))}

              {/* No results message */}
              {(() => {
                const query = searchQuery.toLowerCase();

                // Enhanced fuzzy search function (same as above)
                const fuzzyMatch = (text, search) => {
                  const textLower = text.toLowerCase();
                  const searchLower = search.toLowerCase();

                  // Exact match gets highest priority
                  if (textLower.includes(searchLower)) return 3;

                  // Fuzzy matching - check if all characters exist in order
                  let searchIndex = 0;
                  for (
                    let i = 0;
                    i < textLower.length && searchIndex < searchLower.length;
                    i++
                  ) {
                    if (textLower[i] === searchLower[searchIndex]) {
                      searchIndex++;
                    }
                  }

                  // If all search characters found in order
                  if (searchIndex === searchLower.length) return 2;

                  // Check for common abbreviations
                  const abbreviations = {
                    mew2: "mewtwo",
                    ash: "ash",
                    hooh: "ho-oh",
                    "ho-oh": "hooh",
                  };

                  if (
                    abbreviations[searchLower] &&
                    textLower.includes(abbreviations[searchLower])
                  ) {
                    return 2;
                  }

                  return 0;
                };

                // Check if there are any results using the same logic as the filter
                const hasResults = Object.entries(pokemonData).some(
                  ([key, data]) => {
                    // Search in title and series
                    const titleScore = fuzzyMatch(data.title, query);
                    const seriesScore = fuzzyMatch(data.series, query);

                    if (titleScore > 0 || seriesScore > 0) return true;

                    // Map specific Pokémon names to their entries with fuzzy matching
                    const pokemonMappings = {
                      "rusted sword": "combat_trio",
                      "rusted shield": "combat_trio",
                      "prison bottle": "hoopa",
                      "dyna tree": "legendary_birds_trio",
                      meteorite: "deoxys",
                      "mega meteorite": "deoxys",
                      "arceus plates": "arceus",
                      plates: "arceus",
                      "mew's altar": "mew_duo",
                      "origin fossil": "mew_duo",
                      "ancient origin ball": "mew_duo",
                      "ancient dna": "mew_duo",
                      "cloning catalyst": "mew_duo",
                      "dna splicer": "tao_trio",
                      "adamant crystal": "creation_trio",
                      "lustrous globe": "creation_trio",
                      "griseous core": "creation_trio",
                      "secret garden": "eon_duo",
                      "ruby dew": "eon_duo",
                      "sapphire dew": "eon_duo",
                      "celebi shrine": "celebi",
                      "dawn tower": "light_trio",
                      "dusk tower": "light_trio",
                      gracidea: "shaymin",
                      "reins of unity": "calyrex",
                      "ice carrot": "calyrex",
                      "shadow carrot": "calyrex",
                      cresselia: "lunar_duo",
                      darkrai: "lunar_duo",
                      manaphy: "sea_guardians",
                      phione: "sea_guardians",
                      heatran: "heatran",
                      shaymin: "shaymin",
                      arceus: "arceus",
                      cobalion: "swords_of_justice",
                      terrakion: "swords_of_justice",
                      virizion: "swords_of_justice",
                      keldeo: "swords_of_justice",
                      tornadus: "forces_of_nature",
                      thundurus: "forces_of_nature",
                      landorus: "forces_of_nature",
                      enamorus: "forces_of_nature",
                      "reveal glass": "forces_of_nature",
                      meloetta: "meloetta",
                      genesect: "genesect",
                      diancie: "diancie",
                      hoopa: "hoopa",
                      volcanion: "volcanion",
                      tapu: "guardian_deities",
                      "tapu koko": "guardian_deities",
                      "tapu lele": "guardian_deities",
                      "tapu bulu": "guardian_deities",
                      "tapu fini": "guardian_deities",
                      cosmog: "light_trio",
                      cosmoem: "light_trio",
                      solgaleo: "light_trio",
                      lunala: "light_trio",
                      necrozma: "light_trio",
                      "ultra necrozma": "light_trio",
                      nihilego: "ultra_beasts",
                      poipole: "ultra_beasts",
                      naganadel: "ultra_beasts",
                      pheromosa: "ultra_beasts",
                      guzzlord: "ultra_beasts",
                      stakataka: "ultra_beasts",
                      buzzwole: "ultra_beasts",
                      xurkitree: "ultra_beasts",
                      celesteela: "ultra_beasts",
                      kartana: "ultra_beasts",
                      blacephalon: "ultra_beasts",
                      zeraora: "gen7_mythicals",
                      magearna: "gen7_mythicals",
                      marshadow: "gen7_mythicals",
                      meltan: "gen7_mythicals",
                      melmetal: "gen7_mythicals",
                      "great tusk": "paradox_ancient",
                      "scream tail": "paradox_ancient",
                      "brute bonnet": "paradox_ancient",
                      "flutter mane": "paradox_ancient",
                      "slither wing": "paradox_ancient",
                      "sandy shocks": "paradox_ancient",
                      "roaring moon": "paradox_ancient",
                      koraidon: "paradox_ancient",
                      "walking wake": "paradox_ancient",
                      "gouging fire": "paradox_ancient",
                      "raging bolt": "paradox_ancient",
                      "iron treads": "paradox_future",
                      "iron bundle": "paradox_future",
                      "iron hands": "paradox_future",
                      "iron jugulis": "paradox_future",
                      "iron moth": "paradox_future",
                      "iron thorns": "paradox_future",
                      "iron valiant": "paradox_future",
                      miraidon: "paradox_future",
                      "iron leaves": "paradox_future",
                      "iron boulder": "paradox_future",
                      "iron crown": "paradox_future",
                      "wo-chien": "treasures_of_ruin",
                      "chien-pao": "treasures_of_ruin",
                      "ting-lu": "treasures_of_ruin",
                      "chi-yu": "treasures_of_ruin",
                      ogerpon: "ogerpon",
                      okidogi: "loyal_three",
                      munkidori: "loyal_three",
                      fezandipiti: "loyal_three",
                      pecharunt: "loyal_three",
                      terapagos: "terapagos",
                      palkia: "creation_trio",
                      dialga: "creation_trio",
                      giratina: "creation_trio",
                      kyurem: "tao_trio",
                      reshiram: "tao_trio",
                      zekrom: "tao_trio",
                      azelf: "river_guardians",
                      mesprit: "river_guardians",
                      uxie: "river_guardians",
                      articuno: "legendary_birds_trio",
                      zapdos: "legendary_birds_trio",
                      moltres: "legendary_birds_trio",
                      greninja: "ash_pokemons",
                      pikachu: "ash_pokemons",
                      xerneas: "aura_trio",
                      yveltal: "aura_trio",
                      zygarde: "aura_trio",
                      kubfu: "kubfu",
                      urshifu: "kubfu",
                      zacian: "combat_trio",
                      zamazenta: "combat_trio",
                      eternatus: "combat_trio",
                      mew: "mew_duo",
                      mewtwo: "mew_duo",
                      kyogre: "weather_trio",
                      groudon: "weather_trio",
                      rayquaza: "weather_trio",
                      regice: "legendary_titans",
                      regirock: "legendary_titans",
                      registeel: "legendary_titans",
                      regidrago: "legendary_titans",
                      regieleki: "legendary_titans",
                      regigigas: "legendary_titans",
                      latios: "eon_duo",
                      latias: "eon_duo",
                      jirachi: "jirachi",
                      calyrex: "calyrex",
                      spectrier: "calyrex",
                      glastrier: "calyrex",
                      celebi: "celebi",
                      victini: "victini",
                      typenull: "typenull_silvally",
                      silvally: "typenull_silvally",
                      entei: "hooh",
                      suicune: "hooh",
                      raikou: "hooh",
                      "legendary beasts": "hooh",
                    };

                    // Check if the search query matches a mapped Pokémon with fuzzy matching
                    for (const [pokemonName, entryKey] of Object.entries(
                      pokemonMappings
                    )) {
                      if (
                        fuzzyMatch(pokemonName, query) > 0 &&
                        key === entryKey
                      ) {
                        return true;
                      }
                    }

                    return false;
                  }
                );

                return (
                  !hasResults && (
                    <div className="px-4 py-3 text-gray-400 text-center">
                      No Pokémon found matching "{searchQuery}"
                    </div>
                  )
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 🎯 Tabs Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-200">
            Available Pokémon
          </h2>
          <div className="text-sm text-gray-400">
            {Object.keys(pokemonData).indexOf(activeTab) + 1} of{" "}
            {Object.keys(pokemonData).length}
          </div>
        </div>

        <TabsCarousel
          pokemonData={pokemonData}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
      </div>

      {/* 📖 Content Card */}
      {activeTab && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl mx-auto max-w-3xl w-full">
          <div className="p-4 sm:p-5 md:p-6">
            {pokemonData[activeTab].content}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {activeTab && (
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <button
            onClick={() => {
              const pokemonKeys = Object.keys(pokemonData);
              const currentIndex = pokemonKeys.indexOf(activeTab);
              const prevIndex =
                currentIndex > 0 ? currentIndex - 1 : pokemonKeys.length - 1;
              handleTabChange(pokemonKeys[prevIndex]);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <div className="text-left">
              <div className="text-sm text-gray-400">Previous</div>
              <div className="font-medium">
                {(() => {
                  const pokemonKeys = Object.keys(pokemonData);
                  const currentIndex = pokemonKeys.indexOf(activeTab);
                  const prevIndex =
                    currentIndex > 0
                      ? currentIndex - 1
                      : pokemonKeys.length - 1;
                  return pokemonData[pokemonKeys[prevIndex]].title;
                })()}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{Object.keys(pokemonData).indexOf(activeTab) + 1}</span>
            <span>/</span>
            <span>{Object.keys(pokemonData).length}</span>
          </div>

          <button
            onClick={() => {
              const pokemonKeys = Object.keys(pokemonData);
              const currentIndex = pokemonKeys.indexOf(activeTab);
              const nextIndex =
                currentIndex < pokemonKeys.length - 1 ? currentIndex + 1 : 0;
              handleTabChange(pokemonKeys[nextIndex]);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-right">
              <div className="text-sm text-gray-400">Next</div>
              <div className="font-medium">
                {(() => {
                  const pokemonKeys = Object.keys(pokemonData);
                  const currentIndex = pokemonKeys.indexOf(activeTab);
                  const nextIndex =
                    currentIndex < pokemonKeys.length - 1
                      ? currentIndex + 1
                      : 0;
                  return pokemonData[pokemonKeys[nextIndex]].title;
                })()}
              </div>
            </div>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Remove the entire "Available Pokémon Quick Access" section (lines 1129-1178) */}
    </div>
  );
}

export default function HowToGetPokemonPage() {
  return (
    <React.Suspense fallback={null}>
      <HowToGetPokemonPageInner />
    </React.Suspense>
  );
}

/* === IMAGE SLIDERS WITH FULLSCREEN === */
function ImageCarousel({ images }) {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [fullscreen, setFullscreen] = useState(null);

  // Scoped Escape handler: active only when fullscreen is open
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreen(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  // Prevent background scroll while fullscreen
  React.useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  // Fullscreen modal component
  const FullscreenModal = () => {
    if (!fullscreen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
        onClick={() => setFullscreen(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <div
          className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            aria-label="Close fullscreen"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-md bg-black/70 hover:bg-black/80 text-white p-3 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={fullscreen.src}
              alt={fullscreen.alt}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ maxHeight: "100vh", maxWidth: "100vw" }}
              quality={100}
              priority={true}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur px-4 py-2 rounded-lg text-gray-100 text-sm shadow-lg">
            <span className="font-medium">Credit:</span> {fullscreen.credit}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none"
        ref={emblaRef}
        aria-label="Image carousel. Swipe or scroll to navigate."
      >
        <div className="flex">
          {images.map((img, idx) => (
            <div className="flex-[0_0_100%] h-52 sm:h-64 md:h-80" key={idx}>
              <button
                className="relative w-full h-full overflow-hidden rounded-2xl"
                onClick={() => setFullscreen(img)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  quality={100}
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
                  <span className="font-medium">Credit:</span> {img.credit}
                </div>
              </button>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <span className="opacity-80">Swipe</span>
          <span aria-hidden>↔</span>
        </div>
      </div>

      {/* Render fullscreen modal using portal */}
      {typeof window !== "undefined" &&
        fullscreen &&
        createPortal(<FullscreenModal />, document.body)}
    </div>
  );
}

/* === INDIVIDUAL SLIDERS === */
function MewImageSlider() {
  const images = [
    {
      src: "/guides/origin-fossil.jpg",
      alt: "Origin Fossil crafting recipe",
      credit: "COBBLEVERSE",
    },
    {
      src: "/guides/mew-temple.webp",
      alt: "Mew's Temple in Jungle biome",
      credit: "COBBLEVERSE",
    },
  ];
  return <ImageCarousel images={images} />;
}

function MewTwoImageSlider() {
  const images = [
    {
      src: "/guides/atena.png",
      alt: "Team Rocket Admin Atena",
      credit: "doctor",
    },
    {
      src: "/guides/synthetic-matrix.png",
      alt: "Synthetic Matrix",
      credit: "doctor, Soggy&Wet",
    },
    {
      src: "/guides/ressurection-mewtwo.png",
      alt: "Fossil Resurrection Machine with Ancient DNA and Cloning Catalyst",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function TypeNullSilvallyImageSlider() {
  const images = [
    {
      src: "/guides/fossilized-helmet.png",
      alt: "Fossilized Helmet",
      credit: "maru",
    },
    {
      src: "/guides/typenull.png",
      alt: "Type Null + Silvally",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function KyogreImageSlider() {
  const images = [
    {
      src: "/guides/blue-orb.png",
      alt: "Blue Orb",
      credit: "maru",
    },
    {
      src: "/guides/water-spout-tm.png",
      alt: "Water Spout Barrel",
      credit: "skeleton",
    },
  ];
  return <ImageCarousel images={images} />;
}

function GroudonImageSlider() {
  const images = [
    {
      src: "/guides/red-orb.png",
      alt: "Red Orb",
      credit: "maru",
    },
    {
      src: "/guides/groudon-secret-1.png",
      alt: "Groudon Secret",
      credit: "skeleton",
    },
    {
      src: "/guides/groudon-secret-2.png",
      alt: "Groudon Secret",
      credit: "skeleton",
    },
  ];
  return <ImageCarousel images={images} />;
}

function RayquazaImageSlider() {
  const images = [
    {
      src: "/guides/emerald-emblem.png",
      alt: "Emerald Emblem",
      credit: "skeleton",
    },
    {
      src: "/guides/kyogre-plush.png",
      alt: "Kyogre Chamber secret room",
      credit: "skeleton",
    },
    {
      src: "/guides/skypillar-1.png",
      alt: "Secret chest",
      credit: "skeleton",
    },
    {
      src: "/guides/skypillar-2.png",
      alt: "Secret chest",
      credit: "skeleton",
    },
    {
      src: "/guides/skypillar-3.png",
      alt: "Secret chest",
      credit: "skeleton",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LugiaImageSlider() {
  const images = [
    {
      src: "/guides/corrupted-shard-1.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-2.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-3.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-4.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-4a.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru, Soggy&Wet",
    },
    {
      src: "/guides/corrupted-shard-5.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-6.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-7.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/corrupted-shard-8.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor, maru",
    },
    {
      src: "/guides/whirl-island.png",
      alt: "Whirl Island where Lugia spawns",
      credit: "doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function HoohImageSlider() {
  const images = [
    {
      src: "/guides/burned-tower.png",
      alt: "Burned Tower",
      credit: "COBBLEVERSE",
    },
    {
      src: "/guides/bell-tower.png",
      alt: "Bell Tower",
      credit: "COBBLEVERSE",
    },
    {
      src: "/guides/legendary-beasts.png",
      alt: "Legendary Beasts",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function CosplayPikachuImageSlider() {
  const images = [
    {
      src: "/guides/cosplay-rockstar.png",
      alt: "Rockstar Pikachu",
      credit: "maru",
    },
    {
      src: "/guides/cosplay-phd.png",
      alt: "PhD Pikachu",
      credit: "maru",
    },
    {
      src: "/guides/cosplay-libre.png",
      alt: "Libre Pikachu",
      credit: "maru",
    },
    {
      src: "/guides/cosplay-belle.png",
      alt: "Belle Pikachu",
      credit: "maru",
    },
    {
      src: "/guides/cosplay-popstar.png",
      alt: "Popstar Cosplay Pikachu",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function CalyrexImageSlider() {
  const images = [
    {
      src: "/guides/glastrier.png",
      alt: "Glastrier",
      credit: "skeleton",
    },
    {
      src: "/guides/glastrier-1.png",
      alt: "Glastrier",
      credit: "doctor",
    },
    {
      src: "/guides/glastrier-2.png",
      alt: "Glastrier",
      credit: "doctor",
    },
    {
      src: "/guides/glastrier-3.png",
      alt: "Glastrier",
      credit: "doctor",
    },
    {
      src: "/guides/glastrier-4.png",
      alt: "Glastrier",
      credit: "doctor",
    },
    {
      src: "/guides/spectrier.png",
      alt: "Spectrier",
      credit: "skeleton",
    },
    {
      src: "/guides/spectrier-1.png",
      alt: "Spectrier",
      credit: "doctor",
    },
    {
      src: "/guides/spectrier-2.png",
      alt: "Spectrier",
      credit: "doctor",
    },
    {
      src: "/guides/spectrier-3.png",
      alt: "Spectrier",
      credit: "doctor",
    },
    {
      src: "/guides/spectrier-4.png",
      alt: "Spectrier",
      credit: "doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function DeoxysImageSlider() {
  const images = [
    {
      src: "/guides/deoxys-island.png",
      alt: "End island with scattered meteorites",
      credit: "skeleton, doctor",
    },
    {
      src: "/guides/deoxys-meteorite.png",
      alt: "Mega Meteorite in the End",
      credit: "skeleton, doctor",
    },
    {
      src: "/guides/deoxys-item.png",
      alt: "Hidden altar inside the meteorite",
      credit: "skeleton, doctor",
    },
    {
      src: "/guides/deoxys-form-meteorite.png",
      alt: "Form-changing meteorite block",
      credit: "skeleton, doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function AshGreninjaImageSlider() {
  const images = [
    {
      src: "/guides/ash-greninja.png",
      alt: "Ash Greninja",
      credit: "Mega Showdown",
    },
    {
      src: "/guides/ash-house-1.png",
      alt: "Ash House",
      credit: "doctor",
    },
    {
      src: "/guides/ash.png",
      alt: "Ash",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-1.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-2.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-3.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function AshPikachuImageSlider() {
  const images = [
    {
      src: "/guides/ash-pikachu.png",
      alt: "Ash Pikachu",
      credit: "doctor",
    },
    {
      src: "/guides/ash-pikachu-1.png",
      alt: "Ash House",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-1.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-2.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
    {
      src: "/guides/ash-mom-3.png",
      alt: "Ash Mom",
      credit: "doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function TaoTrioImageSlider() {
  const images = [
    {
      src: "/guides/tao-1.png",
      alt: "Kyurem in Ice Spikes (raining)",
      credit: "maru",
    },
    {
      src: "/guides/tao-2.png",
      alt: "Reshiram in mountains (clear)",
      credit: "maru",
    },
    {
      src: "/guides/tao-3.png",
      alt: "Zekrom in mountains (thundering)",
      credit: "maru",
    },
    { src: "/guides/tao-4.png", alt: "DNA Splicer item", credit: "maru" },
    {
      src: "/guides/tao-5.png",
      alt: "Kyurem fusion showcase",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LegendaryBirdsImageSlider() {
  const images = [
    {
      src: "/guides/galar-articuno.png",
      alt: "Galarian Articuno (night)",
      credit: "maru",
    },
    {
      src: "/guides/galar-zapdos.png",
      alt: "Galarian Zapdos (thundering)",
      credit: "maru",
    },
    {
      src: "/guides/galar-moltres.png",
      alt: "Galarian Moltres (day)",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function CreationTrioImageSlider() {
  const images = [
    { src: "/guides/dialga.png", alt: "Dialga spawn", credit: "maru" },
    { src: "/guides/palkia.png", alt: "Palkia spawn", credit: "maru" },
    {
      src: "/guides/giratina.png",
      alt: "Giratina in Ancient City",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function RiverGuardiansImageSlider() {
  const images = [
    {
      src: "/guides/river-guardians.png",
      alt: "Azelf, Mesprit, Uxie at Beaches",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LunarDuoImageSlider() {
  const images = [
    {
      src: "/guides/cresselia.png",
      alt: "Cresselia in Cherry Groves (night)",
      credit: "maru",
    },
    {
      src: "/guides/darkrai.png",
      alt: "Darkrai in Dark Forests (night)",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function XerneasImage() {
  return (
    <SingleImage
      src="/guides/xerneas.png"
      alt="Xerneas in Floral Biomes"
      credit="maru"
    />
  );
}

function YveltalImage() {
  return (
    <SingleImage
      src="/guides/yveltal.png"
      alt="Yveltal in Dark Forests"
      credit="maru"
    />
  );
}

function ZygardeImageSlider() {
  const images = [
    {
      src: "/guides/mossy-oubliette-ruins.png",
      alt: "Ruins",
      credit: "Cobblemon",
    },
    {
      src: "/guides/crumbling-arch-ruins.png",
      alt: "Ruins",
      credit: "Cobblemon",
    },
    {
      src: "/guides/archaeological-site.png",
      alt: "Dig Site",
      credit: "Mega Showdown",
    },
    {
      src: "/guides/observatory.png",
      alt: "Observatory",
      credit: "Mega Showdown",
    },
    {
      src: "/guides/wishing-weald.png",
      alt: "Wishing Weald",
      credit: "Mega Showdown",
    },
    {
      src: "/guides/reassembly-unit.png",
      alt: "Reassembly Unit",
      credit: "Mega Showdown",
    },
  ];
  return <ImageCarousel images={images} />;
}

function KubfuImageSlider() {
  const images = [
    {
      src: "/guides/kubfu.png",
      alt: "Kubfu in Cherry Groves",
      credit: "maru",
    },
    {
      src: "/guides/urshifu-single-strike.png",
      alt: "Urshifu Single Strike Form",
      credit: "maru",
    },
    {
      src: "/guides/urshifu-rapid-strike.png",
      alt: "Urshifu Rapid Strike Form",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function CombatTrioImageSlider() {
  const images = [
    {
      src: "/guides/rusted-shield.png",
      alt: "Rusted Shield from Sol Henge Ruins or Archaeological Sites",
      credit: "maru",
    },
    {
      src: "/guides/rusted-sword.png",
      alt: "Rusted Sword from Luna Henge Ruins or Archaeological Sites",
      credit: "maru",
    },
    {
      src: "/guides/star-core.png",
      alt: "Star Core for Eternamax Eternatus",
      credit: "maru",
    },
    {
      src: "/guides/crowned-dogs.png",
      alt: "Crowned Dogs",
      credit: "maru",
    },
    {
      src: "/guides/eternamax-eternatus.png",
      alt: "Eternamax Eternatus",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function SeaGuardiansImage() {
  return (
    <SingleImage
      src="/guides/sea-guardians.png"
      alt="Sea Guardians"
      credit="maru"
    />
  );
}

/* === TABS CAROUSEL COMPONENT === */
const TabsCarousel = React.memo(function TabsCarousel({
  pokemonData,
  activeTab,
  setActiveTab,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const pokemonEntries = Object.entries(pokemonData);

  // Auto-scroll to active tab when it changes
  React.useEffect(() => {
    if (emblaApi) {
      const activeIndex = pokemonEntries.findIndex(
        ([key]) => key === activeTab
      );
      if (activeIndex !== -1) {
        emblaApi.scrollTo(activeIndex);
      }
    }
  }, [activeTab, emblaApi, pokemonEntries]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {pokemonEntries.map(([key, data]) => (
          <div key={key} className="flex-[0_0_33.333%] min-w-0 px-1">
            <button
              onClick={() => setActiveTab(key)}
              className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === key
                  ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-purple-500/25"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white"
              }`}
            >
              <div className="text-center">
                <div className="font-semibold truncate">{data.title}</div>
                <div className="text-xs opacity-75 truncate">{data.series}</div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

/* === INDIVIDUAL IMAGE COMPONENTS === */
function SingleImage({ src, alt, credit }) {
  const [fullscreen, setFullscreen] = useState(null);

  // Scoped Escape handler: active only when fullscreen is open
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreen(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  // Prevent background scroll while fullscreen
  React.useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  // Fullscreen modal component
  const FullscreenModal = () => {
    if (!fullscreen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
        onClick={() => setFullscreen(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <div
          className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            aria-label="Close fullscreen"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-md bg-black/70 hover:bg-black/80 text-white p-3 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={fullscreen.src}
              alt={fullscreen.alt}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ maxHeight: "100vh", maxWidth: "100vw" }}
              quality={100}
              priority={true}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur px-4 py-2 rounded-lg text-gray-100 text-sm shadow-lg">
            <span className="font-medium">Credit:</span> {fullscreen.credit}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-2xl shadow-lg">
        <button
          className="relative w-full h-full overflow-hidden rounded-2xl"
          onClick={() => setFullscreen({ src, alt, credit })}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            quality={100}
            priority={true}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
            <span className="font-medium">Credit:</span> {credit}
          </div>
        </button>
      </div>

      {/* Render fullscreen modal using portal */}
      {typeof window !== "undefined" &&
        fullscreen &&
        createPortal(<FullscreenModal />, document.body)}
    </div>
  );
}

function OriginalTitansImageSlider() {
  const images = [
    {
      src: "/guides/regice.png",
      alt: "Regice Structure in Snowy Badlands",
      credit: "maru",
    },
    {
      src: "/guides/regirock.png",
      alt: "Regirock Structure in Lush Dsert",
      credit: "maru",
    },
    {
      src: "/guides/registeel.png",
      alt: "Registeel Structure in Alpine Highlands",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function EonDuoImageSlider() {
  const images = [
    {
      src: "/guides/secret-garden.png",
      alt: "Secret Garden Structure in Deep Lukewarm Ocean",
      credit: "maru",
    },
    {
      src: "/guides/latias-shrine.png",
      alt: "Latias summoning with Ruby Dew",
      credit: "maru",
    },
    {
      src: "/guides/latios-shrine.png",
      alt: "Latios summoning with Sapphire Dew",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function JirachiImageSlider() {
  const images = [
    {
      src: "/guides/jirachi.png",
      alt: "Jirachi Structure in Blooming Plateau",
      credit: "maru",
    },
    {
      src: "/guides/melodic-tape.png",
      alt: "Melodic Tape in barrel at top of structure",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function CelebiImageSlider() {
  const images = [
    {
      src: "/guides/celebi-shrine.png",
      alt: "Celebi Shrine in Taiga biome",
      credit: "maru",
    },
    {
      src: "/guides/rival-red.png",
      alt: "Rival Red at Celebi Shrine",
      credit: "maru",
    },
    {
      src: "/guides/celebi-summon.png",
      alt: "Celebi being summoned at Celebi Shrine",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function HeatranImage() {
  return (
    <SingleImage
      src="/guides/heatran.png"
      alt="Heatran spawns in Nether Wastes"
      credit="maru"
    />
  );
}

function ShayminImage() {
  return (
    <SingleImage
      src="/guides/shaymin.png"
      alt="Shaymin in Floral biomes (day, clear)"
      credit="maru"
    />
  );
}

function ArceusImageSlider() {
  const images = [
    {
      src: "/guides/arceus.png",
      alt: "Arceus in The End",
      credit: "maru",
    },
    {
      src: "/guides/ominous-vault.png",
      alt: "Ominous Trial Vaults",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function VictiniImage() {
  return (
    <SingleImage
      src="/guides/victini.png"
      alt="Victini in Mushroom Island"
      credit="maru"
    />
  );
}

function SwordsOfJusticeImageSlider() {
  const images = [
    {
      src: "/guides/cobalion.png",
      alt: "Cobalion in Windswept Forest",
      credit: "maru",
    },
    {
      src: "/guides/terrakion.png",
      alt: "Terrakion in Savanna biomes",
      credit: "maru",
    },
    {
      src: "/guides/virizion.png",
      alt: "Virizion in Forest biomes",
      credit: "maru",
    },
    {
      src: "/guides/keldeo.png",
      alt: "Keldeo in Sakura Grove/Valley",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function ForcesOfNatureImageSlider() {
  const images = [
    {
      src: "/guides/tornadus.png",
      alt: "Tornadus in Ocean biomes (3x when raining)",
      credit: "maru",
    },
    {
      src: "/guides/thundurus-enamorus.png",
      alt: "Thundurus in Mountain biomes (3x when thundering)",
      credit: "maru",
    },
    {
      src: "/guides/landorus.png",
      alt: "Landorus in Badlands biomes (clear weather)",
      credit: "maru",
    },
    {
      src: "/guides/reveal-glass.png",
      alt: "Reveal Glass from Desert Pyramids (7.69% drop rate)",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function MeloettaImage() {
  return (
    <SingleImage
      src="/guides/meloetta.png"
      alt="Meloetta in Sunflower Plains"
      credit="maru"
    />
  );
}

function GenesectImage() {
  return (
    <SingleImage
      src="/guides/genesect.png"
      alt="Genesect in Dripstone Caves"
      credit="maru"
    />
  );
}

function DiancieImage() {
  return (
    <SingleImage
      src="/guides/diancie.png"
      alt="Diancie near Diamond Ore and Amethyst Blocks in Lush Caves"
      credit="maru"
    />
  );
}

function HoopaImageSlider() {
  const images = [
    {
      src: "/guides/hoopa.png",
      alt: "Hoopa in The End",
      credit: "maru",
    },
    {
      src: "/guides/hoopa-unbound.png",
      alt: "Hoopa in The End",
      credit: "maru",
    },
    {
      src: "/guides/prison-bottle.png",
      alt: "Prison Bottle: Desert Pyramids 7.6% (brush), Ancient City 4.55% (chest)",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function VolcanionImage() {
  return (
    <SingleImage
      src="/guides/volcanion.png"
      alt="Volcanion biomes: Meadow, Grove, Snowy Slopes, Jagged/Frozen/Stony Peaks"
      credit="maru"
    />
  );
}

function GuardianDeitiesImageSlider() {
  const images = [
    {
      src: "/guides/tapu-koko.png",
      alt: "Tapu Koko in Savanna/Jungle",
      credit: "maru",
    },
    {
      src: "/guides/tapu-lele.png",
      alt: "Tapu Lele in Floral/Beach",
      credit: "maru",
    },
    {
      src: "/guides/tapu-bulu.png",
      alt: "Tapu Bulu in Rivers/Jungle",
      credit: "maru",
    },
    {
      src: "/guides/tapu-fini.png",
      alt: "Tapu Fini in Rivers/Beach",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LightTrioImageSlider() {
  const images = [
    { src: "/guides/cosmog.png", alt: "Cosmog in End", credit: "maru" },
    {
      src: "/guides/solgaleo.png",
      alt: "Solgaleo in Savanna/End",
      credit: "maru",
    },
    {
      src: "/guides/lunala.png",
      alt: "Lunala in Dark Forest/End",
      credit: "maru",
    },
    {
      src: "/guides/dusk-tower.png",
      alt: "Dusk/Dawn Towers in End",
      credit: "maru",
    },
    {
      src: "/guides/dawn-tower.png",
      alt: "Dusk/Dawn Towers in End",
      credit: "maru",
    },
    { src: "/guides/necrozma.png", alt: "Necrozma in End", credit: "maru" },
    {
      src: "/guides/fused-necrozma.png",
      alt: "Necrozma in End",
      credit: "maru",
    },
    {
      src: "/guides/ultra-necrozma.png",
      alt: "Necrozma in End",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function UltraBeastsImageSlider() {
  const images = [
    {
      src: "/guides/nihilego.png",
      alt: "Nihilego in End Dimension",
      credit: "maru",
    },
    {
      src: "/guides/poipole.png",
      alt: "Poipole around Dawn/Dusk Tower",
      credit: "maru",
    },
    {
      src: "/guides/naganadel.png",
      alt: "Naganadel near Purpur Blocks",
      credit: "maru",
    },
    {
      src: "/guides/pheromosa.png",
      alt: "Pheromosa in End/Terralith biomes",
      credit: "maru",
    },
    {
      src: "/guides/guzzlord.png",
      alt: "Guzzlord in End Barrens/Deep Dark",
      credit: "maru",
    },
    {
      src: "/guides/stakataka.png",
      alt: "Stakataka in Deep Dark",
      credit: "maru",
    },
    {
      src: "/guides/buzzwole.png",
      alt: "Buzzwole in Swamp Biomes",
      credit: "maru",
    },
    {
      src: "/guides/xurkitree.png",
      alt: "Xurkitree in Mangrove Swamps",
      credit: "maru",
    },
    {
      src: "/guides/celesteela.png",
      alt: "Celesteela in Desert biomes",
      credit: "maru",
    },
    {
      src: "/guides/kartana.png",
      alt: "Kartana in Bamboo Jungles",
      credit: "maru",
    },
    {
      src: "/guides/blacephalon.png",
      alt: "Blacephalon in Dark Forests",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function Gen7MythicalsImageSlider() {
  const images = [
    {
      src: "/guides/zeraora.png",
      alt: "Zeraora in Badlands/Forest biomes",
      credit: "maru",
    },
    {
      src: "/guides/magearna.png",
      alt: "Magearna in Taiga biomes",
      credit: "maru",
    },
    {
      src: "/guides/marshadow.png",
      alt: "Marshadow in Deep Dark",
      credit: "maru",
    },
    {
      src: "/guides/meltan.png",
      alt: "Meltan near Iron Blocks/Beach",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function TreasuresOfRuinImageSlider() {
  const images = [
    {
      src: "/guides/wo-chien.png",
      alt: "Wo-Chien in Mangrove Swamps",
      credit: "maru",
    },
    {
      src: "/guides/chien-pao.png",
      alt: "Chien-Pao snowy biomes",
      credit: "maru",
    },
    {
      src: "/guides/ting-lu.png",
      alt: "Ting-Lu in Dark Forests",
      credit: "maru",
    },
    {
      src: "/guides/chi-yu.png",
      alt: "Chi-Yu in Basalt Deltas",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function OgerponImageSlider() {
  const images = [
    {
      src: "/guides/ogerpon.png",
      alt: "Ogerpon in Lush Caves/Underground Jungle",
      credit: "maru",
    },
    {
      src: "/guides/frozen-gimmi.png",
      alt: "Ogerpon Masks & towers",
      credit: "maru",
    },
    {
      src: "/guides/lush-gimmi.png",
      alt: "Ogerpon Masks & towers",
      credit: "maru",
    },
    {
      src: "/guides/deserted-gimmi.png",
      alt: "Ogerpon Masks & towers",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LoyalThreeImageSlider() {
  const images = [
    { src: "/guides/okidogi.png", alt: "Okidogi in Savanna", credit: "maru" },
    {
      src: "/guides/munkidori.png",
      alt: "Munkidori in Jungle",
      credit: "maru",
    },
    {
      src: "/guides/fezandipiti.png",
      alt: "Fezandipiti in snowy biomes",
      credit: "maru",
    },
    {
      src: "/guides/pecharunt.png",
      alt: "Pecharunt in Dark Forests",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function TerapagosImage() {
  return (
    <SingleImage
      src="/guides/terapagos.png"
      alt="Terapagos spawn info"
      credit="maru"
    />
  );
}

function ParadoxAncientImageSlider() {
  const images = [
    { src: "/guides/great-tusk.png", alt: "Great Tusk biomes", credit: "maru" },
    {
      src: "/guides/scream-tail.png",
      alt: "Scream Tail biomes",
      credit: "maru",
    },
    {
      src: "/guides/brute-bonnet.png",
      alt: "Brute Bonnet in Jungles",
      credit: "maru",
    },
    {
      src: "/guides/flutter-mane.png",
      alt: "Flutter Mane in Deep Dark/Dark Forests",
      credit: "maru",
    },
    {
      src: "/guides/slither-wing.png",
      alt: "Slither Wing spawn",
      credit: "maru",
    },
    {
      src: "/guides/sandy-shocks.png",
      alt: "Sandy Shocks biomes",
      credit: "maru",
    },
    {
      src: "/guides/roaring-moon.png",
      alt: "Roaring Moon (night) biomes",
      credit: "maru",
    },
    {
      src: "/guides/paradox-duo.png",
      alt: "Koraidon in Beach",
      credit: "maru",
    },
    {
      src: "/guides/walking-wake.png",
      alt: "Walking Wake (raining) biomes",
      credit: "maru",
    },
    {
      src: "/guides/gouging-fire.png",
      alt: "Gouging Fire in Basalt Deltas",
      credit: "maru",
    },
    {
      src: "/guides/raging-bolt.png",
      alt: "Raging Bolt biomes",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function ParadoxFutureImageSlider() {
  const images = [
    {
      src: "/guides/iron-treads.png",
      alt: "Iron Treads biomes",
      credit: "maru",
    },
    {
      src: "/guides/iron-bundle.png",
      alt: "Iron Bundle snowy biomes",
      credit: "maru",
    },
    {
      src: "/guides/iron-hands.png",
      alt: "Iron Hands in Desert (night)",
      credit: "maru",
    },
    {
      src: "/guides/iron-jugulis.png",
      alt: "Iron Jugulis (night) biomes",
      credit: "maru",
    },
    {
      src: "/guides/iron-moth.png",
      alt: "Iron Moth in Hills (daytime)",
      credit: "maru",
    },
    {
      src: "/guides/iron-thorns.png",
      alt: "Iron Thorns biomes",
      credit: "maru",
    },
    {
      src: "/guides/iron-valiant.png",
      alt: "Iron Valiant near lightning rod",
      credit: "maru",
    },
    {
      src: "/guides/paradox-duo.png",
      alt: "Miraidon in Beach",
      credit: "maru",
    },
    {
      src: "/guides/iron-leaves.png",
      alt: "Iron Leaves in Forests (night)",
      credit: "maru",
    },
    {
      src: "/guides/iron-boulder.png",
      alt: "Iron Boulder in Dark Forests (night)",
      credit: "maru",
    },
    {
      src: "/guides/iron-crown.png",
      alt: "Iron Crown in Lush Caves/Underground Jungle (night)",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}
