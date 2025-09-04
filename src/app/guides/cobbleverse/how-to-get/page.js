"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";
import React from "react";

export default function HowToGetPokemonPage() {
  const [activeTab, setActiveTab] = useState("mew");

  const pokemonData = {
    mew: {
      title: "Mythical: Mew",
      series: "Mythical",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
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
                  <b>Mew’s Temple</b> (Jungle biome).
                </li>
                <li>
                  <b>5 Fossils</b> — any kind of fossil works.
                </li>
              </ul>
            </li>
            <li>
              Combine these items to craft the <b>Origin Fossil</b> and place it{" "}
              in <b>Mew’s Altar</b> to summon Mew.
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:mythical/mew</code>
          </p>
          <MewImageSlider />
        </div>
      ),
    },
    mewtwo: {
      title: "Kanto Series: Mewtwo",
      series: "Kanto Series",
      levelCap: "90+",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Kanto Series</b> with level cap 90+ (check trainer
              card).
            </li>
            <li>
              Obtain <b>Ancient DNA</b>:
              <ul className="list-disc list-inside ml-6">
                <li>Defeat Gym Leader Giovanni (drops once), OR</li>
                <li>Find Mew’s Temple in Jungle biome.</li>
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
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:team_rocket_tower</code>
          </p>
          <MewtwoImageSlider />
        </div>
      ),
    },
    lugia: {
      title: "Johto Series: Lugia",
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
                <li>
                  <b>Synthetic Matrix</b> behind a lectern for Armored Mewtwo.
                </li>
              </ul>
            </li>
            <li>
              Defeat <b>Admin Apollo</b> to obtain <b>Shadow Heart</b> and a{" "}
              <b>recipe</b> for crafting <b>Shadow Soul Stone</b>. (used to turn
              Lugia into Shadow Form)
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:rocket_radio_tower</code> or{" "}
            <code>/locate structure cobbleverse:whirl_island</code>
          </p>
          <LugiaImageSlider />
        </div>
      ),
    },
    hooh: {
      title: "Johto Series: Ho-oh",
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
    kyogre: {
      title: "Hoenn Series: Kyogre",
      series: "Hoenn Series",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
            </li>
            <li>
              Locate Kyogre’s structure in <b>Deep Cold Ocean</b> biomes.
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

          <KyogreImageSlider />
        </div>
      ),
    },
    groudon: {
      title: "Hoenn Series: Groudon",
      series: "Hoenn Series",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
            </li>
            <li>
              Locate Groudon’s structure in <b>Deep Warm Ocean</b> (Terralith
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
                  you’ll find a <b>Precipice Blades TM</b> and a{" "}
                  <b>Nether Star</b>.
                </li>
                <li>Groudon’s also has a raw megastone. (thanks azera)</li>
              </ul>
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:legendary/groudon</code>
          </p>

          <GroudonImageSlider />
        </div>
      ),
    },
    rayquaza: {
      title: "Hoenn Series: Rayquaza",
      series: "Hoenn Series",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Must be in <b>Hoenn Series</b>.
            </li>
            <li>
              Head to the <b>Sky Pillar</b>. (Deep Ocean Biome)
            </li>
            <li>
              The <b>Emerald Emblem</b> to craft Rayquaza’s spawn item is
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
              <b>Dragon Chamber Statue</b>: A chest with <b>Dragon’s Breath</b>{" "}
              hidden in the dragon statue’s mouth.
            </li>
            <li>
              <b>Sky Pillar Lantern</b> (left side as you walk in): Hidden chest
              containing <b>Draonium-Z</b>. (thanks @₮ØⱤ₦₳ĐØ)
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:sky_pillar</code>
          </p>

          <RayquazaImageSlider />
        </div>
      ),
    },
    deoxys: {
      title: "Hoenn Series: Deoxys",
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
              Dig within the <b>Mega Meteorite blocks</b> to uncover Deoxys’
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
    zygarde: {
      title: "Legendary: Zygarde",
      series: "Legendary",
      levelCap: "Any",
      content: (
        <div className="space-y-6">
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
          <ZygardeImageSlider />

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
        </div>
      ),
    },
    calyrex: {
      title: "Legendary: Calyrex",
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
              You’ll receive <b>Calyrex</b> for each structure, allowing you to
              create both Rider forms.
            </li>
            <li>
              Locate <b>Calyrex’s Crown</b> in a barrel:
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
              Place the <b>Calyrex’s Crown</b> atop the <b>Calyrex statue</b> to
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
      title: "Special: Cosplay Pikachu",
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
  };

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

      <div className="relative overflow-hidden mx-auto max-w-3xl w-full">
        <TabsCarousel
          items={pokemonData}
          activeKey={activeTab}
          onSelect={setActiveTab}
        />

        {/* Scroll Indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
      </div>

      {/* Tab Content with Modern Card Design */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl mx-auto max-w-3xl w-full">
        <div className="p-4 sm:p-5 md:p-6">
          {pokemonData[activeTab].content}
        </div>
      </div>
    </div>
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

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreen(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="relative w-full max-w-6xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreen(null)}
              aria-label="Close fullscreen"
              className="absolute top-2 right-2 z-10 inline-flex items-center justify-center rounded-md bg-black/60 hover:bg-black/70 text-white p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Image
              src={fullscreen.src}
              alt={fullscreen.alt}
              fill
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-contain rounded-lg"
            />
            <p className="absolute inset-x-0 bottom-2 mx-auto w-fit bg-black/50 backdrop-blur px-3 py-1 rounded text-gray-100 text-sm">
              <span className="font-medium">Credit:</span> {fullscreen.credit}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* === TABS CAROUSEL (5 per view) === */
function TabsCarousel({ items, activeKey, onSelect }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const canPrev = emblaApi ? emblaApi.canScrollPrev() : false;
  const canNext = emblaApi ? emblaApi.canScrollNext() : false;

  // Re-render on select to update button disabled states
  React.useEffect(() => {
    if (!emblaApi) return;
    const rerender = () => {
      // no-op, just trigger React state update via setState pattern
      // by using a dummy state if needed in the future
    };
    emblaApi.on("select", rerender);
    emblaApi.on("reInit", rerender);
    return () => {
      emblaApi.off("select", rerender);
      emblaApi.off("reInit", rerender);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canPrev}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 text-white px-2 py-1 backdrop-blur disabled:opacity-40"
        aria-label="Previous tabs"
      >
        ‹
      </button>
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {Object.entries(items).map(([key, data]) => (
            <div
              className="flex-[0_0_60%] sm:flex-[0_0_40%] md:flex-[0_0_33.3333%] lg:flex-[0_0_33.3333%] pr-2"
              key={key}
            >
              <button
                onClick={() => onSelect(key)}
                className={`w-full h-14 sm:h-16 px-3 sm:px-4 md:px-5 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  activeKey === key
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white backdrop-blur-sm"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-1 leading-none">
                  <span className="text-xs sm:text-sm font-medium truncate max-w-[8.5rem] sm:max-w-[9.5rem]">
                    {data.title.split(": ")[1]}
                  </span>
                  <span className="text-[10px] sm:text-xs opacity-70 truncate max-w-[8.5rem] sm:max-w-[9.5rem]">
                    {data.series}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canNext}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 text-white px-2 py-1 backdrop-blur disabled:opacity-40"
        aria-label="Next tabs"
      >
        ›
      </button>
    </div>
  );
}

/* === INDIVIDUAL SLIDERS === */
function MewtwoImageSlider() {
  const images = [
    {
      src: "/guides/atena.png",
      alt: "Team Rocket Admin Atena",
      credit: "doctor",
    },
    {
      src: "/guides/ressurection-mewtwo.png",
      alt: "Fossil Resurrection Machine with Ancient DNA and Cloning Catalyst",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function LugiaImageSlider() {
  const images = [
    {
      src: "/guides/corrupted-shard-1.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "maru",
    },
    {
      src: "/guides/corrupted-shard-2.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/corrupted-shard-3.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/corrupted-shard-4.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/corrupted-shard-5.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/corrupted-shard-6.png",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/corrupted-shard-7.jpg",
      alt: "Corrupted Shards hidden in Radio Tower",
      credit: "doctor",
    },
    {
      src: "/guides/synthetic-matrix.png",
      alt: "Synthetic Matrix",
      credit: "doctor, Soggy&Wet",
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

function MewImageSlider() {
  const images = [
    {
      src: "/guides/origin-fossil.jpg",
      alt: "Origin Fossil crafting recipe",
      credit: "COBBLEVERSE",
    },
    {
      src: "/guides/mew-temple.webp",
      alt: "Mew’s Temple in Jungle biome",
      credit: "COBBLEVERSE",
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
