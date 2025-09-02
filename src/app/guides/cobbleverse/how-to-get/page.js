"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";
import React from "react";

export default function HowToGetPokemonPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">How to Get Specific Pokémon</h1>
      <p className="text-gray-300">
        This list only shows the most commonly asked in the LUMYVERSE Discord
        server. Visit the{" "}
        <a
          href="https://www.lumyverse.com/cobbleverse/exclusive-structures-in-cobbleverse/"
          className="text-blue-400 underline"
        >
          COBBLEVERSE Wiki
        </a>{" "}
        for more information.
      </p>

      {/* Mewtwo */}
      <details>
        <summary>Kanto Series: Mewtwo</summary>
        <div className="p-4 text-gray-300 space-y-6">
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
              <b>Radiant Cloning Catalyst</b> (guaranteed Mewtwo).
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
      </details>

      {/* Lugia */}
      <details>
        <summary>Johto Series: Lugia</summary>
        <div className="p-4 text-gray-300 space-y-6">
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
                  Hidden <b>Corrupted Shards</b>.
                </li>
                <li>
                  <b>Synthetic Matrix</b> behind a lectern.
                </li>
              </ul>
            </li>
            <li>
              Defeat <b>Admin Apollo</b> to obtain <b>Shadow Heart</b> and a{" "}
              <b>recipe</b> for crafting <b>Shadow Soul Stone</b> (used to turn
              Lugia into Shadow Form).
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:rocket_radio_tower</code> or{" "}
            <code>/locate structure cobbleverse:whirl_island</code>
          </p>
          <LugiaImageSlider />
        </div>
      </details>

      {/* Ho-oh */}
      <details>
        <summary>Johto Series: Ho-oh</summary>
        <div className="p-4 text-gray-300 space-y-6">
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
      </details>

      {/* Kyogre */}
      <details>
        <summary>Hoenn Series: Kyogre</summary>
        <div className="p-4 text-gray-300 space-y-6">
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

          {/* Image Slider */}
          <KyogreImageSlider />
        </div>
      </details>

      {/* Groudon */}
      <details>
        <summary>Hoenn Series: Groudon</summary>
        <div className="p-4 text-gray-300 space-y-6">
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
              </ul>
            </li>
          </ul>
          <p className="text-xs opacity-50 italic">
            Use <code>/locate structure cobbleverse:legendary/groudon</code>
          </p>

          {/* Image Slider */}
          <GroudonImageSlider />
        </div>
      </details>
    </div>
  );
}

/* === IMAGE SLIDERS WITH FULLSCREEN === */
function ImageCarousel({ images }) {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [fullscreen, setFullscreen] = useState(null);

  // Add Escape key handler to close fullscreen
  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreen(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none"
        ref={emblaRef}
        aria-label="Image carousel. Swipe or scroll to navigate."
      >
        <div className="flex">
          {images.map((img, idx) => (
            <div className="flex-[0_0_100%]" key={idx}>
              <button
                className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl"
                onClick={() => setFullscreen(img)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
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
          <span className="opacity-80">Swipe or scroll</span>
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
        >
          <div
            className="relative w-full max-w-6xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fullscreen.src}
              alt={fullscreen.alt}
              fill
              sizes="100vw"
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
