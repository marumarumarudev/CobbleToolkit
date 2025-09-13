"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";
import React from "react";
import { createPortal } from "react-dom";

function HowToGetPokemonPageInner() {
  const [activeTab, setActiveTab] = useState("mew_duo");
  const [searchQuery, setSearchQuery] = useState("");
  const initializedFromUrlRef = React.useRef(false);

  const pokemonData = {
    mew_duo: {
      title: "Mew Duo",
      series: "Kanto Series",
      levelCap: "80+",
      content: (
        <div className="space-y-6">
          <h4 className="font-medium text-lg">Mew</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Kanto Series</b>.
            </li>
            <li>
              Craft the <b>Origin Fossil</b> to obtain Mew.
            </li>
            <li>
              To craft it, you need:
              <ul className="list-disc list-inside ml-6">
                <li>
                  <b>Ancient Origin Ball</b> — obtained by defeating{" "}
                  <b>Kanto Champion Blue</b>.
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
              Combine these items to craft the <b>Origin Fossil</b> and place it{" "}
              in <b>Mew's Altar</b> to summon Mew.
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:mythical/mew</code>
          </p>

          <h4 className="font-medium text-lg">Mewtwo</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Kanto Series</b> with level cap 80+ (check trainer
              card).
            </li>
            <li>
              Obtain <b>Ancient DNA</b>:
              <ul className="list-disc list-inside ml-6">
                <li>Defeat Gym Leader Giovanni (drops once), OR</li>
                <li>Find Mew's Temple in Jungle biome.</li>
              </ul>
            </li>
            <li>
              Find <b>Team Rocket Tower</b> in the Badlands biome.
            </li>
            <li>
              Optional: defeat researcher NPC for Fossilized Helmet (revives
              Type: Null).
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
              Hidden inside Radio Tower (Johto Series) is the{" "}
              <b>Synthetic Matrix</b>, used to craft
              <b> Armored Mewtwo</b>.
            </li>
          </ul>

          {/* Shadow Mewtwo Note */}
          <p className="text-sm text-purple-300 italic">
            ⚠️ As of writing this guide, <b>Shadow Mewtwo</b> cannot be obtained
            through gameplay. You can only get it via command:{" "}
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
                  <th className="px-2 py-1 border border-gray-700">Sp. ATK</th>
                  <th className="px-2 py-1 border border-gray-700">Sp. DEF</th>
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
                  <td className="px-2 py-1 border border-gray-700">Armored</td>
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
          <MewDuoImageSlider />
        </div>
      ),
    },
    weather_trio: {
      title: "Weather Trio",
      series: "Hoenn Series",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
          <h4 className="font-medium text-lg">Kyogre</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
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
                  <b>Water Spout TM</b> hidden in a barrel at the base of one of
                  the pillars.
                </li>
              </ul>
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:legendary/kyogre</code>
          </p>

          <h4 className="font-medium text-lg">Groudon</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
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
                  Hidden cave inside the mountain with a <b>lore book</b>, free
                  ores, and the <b>Heatstone</b> (enough for 1 spawn item).
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

          <h4 className="font-medium text-lg">Rayquaza</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
            </li>
            <li>
              Head to the <b>Sky Pillar</b>. (Deep Ocean Biome)
            </li>
            <li>
              The <b>Emerald Emblem</b> to craft Rayquaza's spawn item is
              located in the room with the crafters, hidden behind the chest.
            </li>
          </ul>

          <h4 className="font-medium">Secrets Inside Sky Pillar</h4>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>
              <b>Kyogre Chamber</b>: A hidden room with a{" "}
              <b>Shiny Kyogre plushie</b> and coins in the pond. Access it
              through a trapdoor. <u>Warning:</u> the chest is trapped!
            </li>
            <li>
              <b>Groudon Chamber</b>: A chest with <b>Fire Resistance Potion</b>{" "}
              under one of the blackstones.
            </li>
            <li>
              <b>Dragon Chamber</b>: A chest with a <b>TM</b> in the 1-block
              space under the floor.
            </li>
            <li>
              <b>Dragon Chamber Statue</b>: A chest with <b>Dragon's Breath</b>{" "}
              hidden in the dragon statue's mouth.
            </li>
            <li>
              <b>Sky Pillar Lantern</b> (left side as you walk in): Hidden chest
              containing <b>Dragonium-Z</b>. (thanks @₮ØⱤ₦₳ĐØ)
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:sky_pillar</code>
          </p>

          <WeatherTrioImageSlider />
        </div>
      ),
    },
    ash_pokemons: {
      title: "Ash's Pokemons",
      series: "Kanto Series",
      levelCap: "40+",
      content: (
        <div className="space-y-6">
          <h4 className="font-medium text-lg">Ash's Greninja</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Kanto Series</b> with <b>level cap 40+</b>.
            </li>
            <li>
              Find <b>Ash's House</b> in <b>Plains biomes</b>.
            </li>
            <li>
              Defeat Ash to obtain <b>Ash's Cap</b>.
            </li>
            <li>
              (CurseForge users: Ash's Cap can be found free in a drawer inside
              his room.)
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
              In newer generations, Battle Bond instead gives stat boosts. Mega
              Showdown makes this depend on friendship:
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
            ⚠️ Giving Greninja Battle Bond via commands does not work properly.
          </p>

          <h4 className="font-medium text-lg">Ash's Pikachu</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Kanto Series</b> with <b>level cap 40+</b>.
            </li>
            <li>
              Obtain <b>Ash's Cap</b> from Ash (or his drawer if using
              CurseForge).
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

          <AshPokemonsImageSlider />
          <p className="text-xs opacity-50 italic">
            Big thanks to <strong>Mega Showdown Wiki</strong>
          </p>
        </div>
      ),
    },
    lugia: {
      title: "Lugia",
      series: "Johto Series",
      levelCap: "70+",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Johto Series</b> with level cap 70+ (check trainer
              card).
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
              <b>recipe</b> for crafting <b>Shadow Soul Stone</b>. (used to turn
              Lugia into Shadow Form)
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
                  <th className="px-2 py-1 border border-gray-700">Sp. ATK</th>
                  <th className="px-2 py-1 border border-gray-700">Sp. DEF</th>
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
            Use <code>/locate structure cobbleverse:rocket_radio_tower</code> or{" "}
            <code>/locate structure cobbleverse:whirl_island</code>
          </p>
          <LugiaImageSlider />
        </div>
      ),
    },
    hooh: {
      title: "Ho-oh",
      series: "Johto Series",
      levelCap: "60+",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Johto Series</b> with level cap 60+ (check trainer
              card).
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
              only spawn around the Burned Tower — use Pokénav to track them.
            </li>
            <li>
              Locate the <b>Bell Tower</b> (found in Plains biomes) and use the
              Rainbow Wing there to summon Ho-oh.
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
    deoxys: {
      title: "Deoxys",
      series: "Hoenn Series",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Structure only generates when <b>Hoenn</b> is activated.
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
              No series required — these structures can be found immediately in
              the world.
            </li>
            <li>
              Find their respective <b>carrots</b> and throw it into:
              <ul className="list-disc list-inside ml-6">
                <li>
                  The <b>Coffin</b> for <b>Spectrier</b>.
                </li>
                <li>
                  The <b>Trough</b> for <b>Glastrier</b>.
                </li>
              </ul>
            </li>
            <li>
              You'll receive <b>Calyrex</b> for each structure, allowing you to
              create both Rider forms.
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
              Place the <b>Calyrex's Crown</b> atop the <b>Calyrex statue</b> to
              complete the ritual.
            </li>
            <li>
              Craft <b>Reins of Unity</b> to fuse Calyrex and
              Spectrier/Glastrier.
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:crown_cemetery</code> for
            Spectrier, or <code>/locate structure cobbleverse:crown_spire</code>{" "}
            for Glastrier.
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
              New <b>Cosplay Pikachu</b> forms now spawn naturally in the world.
            </li>
            <li>To obtain one, you must catch a newly spawned wild Pikachu.</li>
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
              <b>Kyurem</b>: Ice Spikes biome, <b>raining</b>.
            </li>
            <li>
              <b>Reshiram</b>: Mountain-tagged biomes, <b>clear</b> weather.
            </li>
            <li>
              <b>Zekrom</b>: Mountain-tagged biomes, <b>thundering</b>.
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
              <b>Dyna Tree</b> spawns when <b>Hoenn</b> is activated. No level
              cap.
            </li>
            <li>
              Spawns <b>Galarian</b> Articuno, Zapdos, Moltres. Not guaranteed;
              this is the only place they can spawn.
            </li>
            <li>
              <b>Galarian Articuno</b>: <b>Nighttime</b>.
            </li>
            <li>
              <b>Galarian Zapdos</b>: <b>Thundering</b>.
            </li>
            <li>
              <b>Galarian Moltres</b>: <b>Daytime</b>.
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
              Slopes — <b>nighttime</b> and <b>clear weather</b>.
            </li>
            <li>
              <b>Palkia</b>: Same locations — <b>daytime</b> and <b>raining</b>.
            </li>
            <li>
              <b>Giratina</b>: <b>Ancient Cities</b> only.
            </li>
          </ul>

          <h4 className="font-medium text-lg">Origin Forms</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <b>Dialga Origin Form</b>: Give Dialga the <b>Adamant Crystal</b>{" "}
              as a held item.
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
                  <b>Griseous Core</b> can be found by brushing suspicious sands
                  in <b>Desert Pyramids</b>.
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
          <h4 className="font-medium text-lg">Xerneas</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <b>Xerneas</b>: Spawns in <b>Floral Biomes</b> during{" "}
              <b>daytime</b>.
            </li>
          </ul>

          <h4 className="font-medium text-lg">Yveltal</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <b>Yveltal</b>: Spawns in <b>Dark Forests</b> during{" "}
              <b>nighttime</b>.
            </li>
          </ul>

          <h4 className="font-medium text-lg">Zygarde</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>
              You can get <b>Zygarde Cells</b> by brushing suspicious sand in{" "}
              <b>Archaeological Sites</b>, looting <b>Chests</b>,{" "}
              <b>Wishing Weald Chests</b>, and barrels in <b>Observatories</b>.
            </li>
            <li>
              <b>Zygarde Cores</b> can be found in <b>Mossy Oubliette Ruins</b>{" "}
              and <b>Crumbling Arch Ruins</b>.
            </li>
            <li>
              To assemble Zygarde parts, you need a <b>Zygarde Cube</b> and a{" "}
              <b>Reassembly Unit</b>.
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
                  <th className="px-2 py-1 border border-gray-700">Ability</th>
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

          <AuraTrioImageSlider />
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
              <b>Kubfu</b> spawns in <b>Cherry Groves</b>.
            </li>
            <li>
              To evolve Kubfu, you need one of these items:
              <ul className="list-disc list-inside ml-6">
                <li>
                  <b>Scroll of Darkness</b> — found by brushing suspicious sands
                  in <b>Desert Pyramids</b>. Evolves Kubfu to{" "}
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
              <b>Zacian</b> and <b>Zamazenta</b> spawn in <b>Forest Biomes</b>.
            </li>
            <li>
              <b>Eternatus</b> spawns in the <b>End dimension</b>.
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
  };

  React.useEffect(() => {
    if (initializedFromUrlRef.current) return;
    initializedFromUrlRef.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("p");
      if (p && Object.prototype.hasOwnProperty.call(pokemonData, p)) {
        setActiveTab(p);
      }
    } catch {}
  }, [pokemonData]);

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeTab) {
        url.searchParams.set("p", activeTab);
      } else {
        url.searchParams.delete("p");
      }
      window.history.replaceState(null, "", url.toString());
    } catch {}
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
                };

                // Find matching entry
                for (const [pokemonName, entryKey] of Object.entries(
                  pokemonMappings
                )) {
                  if (pokemonName.includes(query)) {
                    setActiveTab(entryKey);
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
                  setActiveTab(matchingEntry[0]);
                  setSearchQuery("");
                }
              }
            }}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
          />

          {/* Autocomplete Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
              {Object.entries(pokemonData)
                .filter(([key, data]) => {
                  const query = searchQuery.toLowerCase();

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
                })
                .sort(([keyA, dataA], [keyB, dataB]) => {
                  // Sort by relevance (exact matches first, then fuzzy matches)
                  const query = searchQuery.toLowerCase();

                  const getScore = (data) => {
                    const titleScore = data.title.toLowerCase().includes(query)
                      ? 3
                      : data.title.toLowerCase().indexOf(query) > -1
                      ? 2
                      : 0;
                    const seriesScore = data.series
                      .toLowerCase()
                      .includes(query)
                      ? 1
                      : 0;
                    return titleScore + seriesScore;
                  };

                  return getScore(dataB) - getScore(dataA);
                })
                .slice(0, 8)
                .map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
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
          setActiveTab={setActiveTab}
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
              setActiveTab(pokemonKeys[prevIndex]);
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
              setActiveTab(pokemonKeys[nextIndex]);
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
function MewDuoImageSlider() {
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

function WeatherTrioImageSlider() {
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

function AshPokemonsImageSlider() {
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

function AuraTrioImageSlider() {
  const images = [
    {
      src: "/guides/xerneas.png",
      alt: "Xerneas in Floral Biomes",
      credit: "maru",
    },
    {
      src: "/guides/yveltal.png",
      alt: "Yveltal in Dark Forests",
      credit: "maru",
    },
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

/* === TABS CAROUSEL COMPONENT === */
function TabsCarousel({ pokemonData, activeTab, setActiveTab }) {
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
}
