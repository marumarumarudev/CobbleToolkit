"use client";

import Image from "next/image";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect } from "react";

export default function SpawnRateGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Increase Cobblemon Spawn Rate</h1>
      <p className="text-gray-300">
        There are multiple ways to increase Pokémon spawn rates in Cobbleverse,
        from food buffs to manual datapack edits.
      </p>

      {/* CobbleCuisine Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">Boost with CobbleCuisine</h2>
        <p className="text-gray-300">
          Open your inventory and type{" "}
          <code className="bg-gray-800 px-1 rounded">@cobblecuisine</code> in
          the searchbar below. This mod adds different food you can craft that
          grant buffs such as <strong>type spawn boosts</strong>,{" "}
          <strong>egg group boosts</strong>, <strong>EV yield buffs</strong>,
          and even <strong>shiny rate boosts</strong>.
        </p>
        <a
          href="https://modrinth.com/mod/cobblecuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          CobbleCuisine on Modrinth
        </a>

        {/* Carousel for CobbleCuisine images */}
        <div className="mt-4">
          <CobbleCuisineSlider />
        </div>
      </section>

      {/* Datapack Editing Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">Manual Spawn Rate Editing</h2>
        <p className="text-gray-300">
          You can manually change spawn rates by editing datapacks or configs.
          There are also community addons that improve spawns directly.
        </p>

        <h3 className="font-semibold text-lg">Editing Datapack</h3>
        <p className="text-gray-300">
          Navigate to:{" "}
          <code className="bg-gray-800 px-1 rounded">
            installation_folder &gt; datapacks &gt; COBBLEVERSE-DP
          </code>
          . Use <strong>WinRAR</strong>, <strong>7zip</strong>, or another tool
          to open it. Game must be closed for changes to apply.
        </p>
        <p className="text-gray-300">
          Inside:{" "}
          <code className="bg-gray-800 px-1 rounded">
            data\cobblemon\spawn_pool_world
          </code>{" "}
          look for the Pokémon you want to modify (ex:{" "}
          <strong>Marshadow</strong>).
        </p>
        <p className="text-gray-300">
          You can increase spawn chance by raising its{" "}
          <code className="bg-gray-800 px-1 rounded">weight</code> or adjusting
          the rarity bucket. Use any text editor (e.g. Notepad, VSCode), but in
          this guide, I am using Notepad++.
        </p>

        <DatapackNavigationSlider />

        <h3 className="font-semibold text-lg">Editing Spawn Buckets</h3>
        <p className="text-gray-300">
          Navigate to:{" "}
          <code className="bg-gray-800 px-1 rounded">
            installation_folder &gt; config &gt; cobblemon &gt; main.json
          </code>{" "}
          and set <code>&quot;exportSpawnConfig&quot;: true</code>.
        </p>
        <p className="text-gray-300">
          Relaunch the game once, then exit. A new folder{" "}
          <code className="bg-gray-800 px-1 rounded">spawning</code> will appear
          inside <code>config/cobblemon</code>. Open{" "}
          <code className="bg-gray-800 px-1 rounded">
            best-spawner-config.json
          </code>
          .
        </p>
        <p className="text-gray-300">
          Change bucket weights as you like (must add up to 100).
        </p>

        <ExportSpawnConfig />
      </section>

      {/* Spawn Influence Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">Spawn Influence: Nearby Blocks</h2>
        <p className="text-gray-300">
          Certain Pokémon only spawn if <strong>specific blocks</strong> are
          nearby (e.g., flowers, stone variants, water). This mechanic is often
          overlooked but makes a huge difference when trying to target specific
          spawns.
        </p>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/guides/spawn-influence.png"
            alt="Cobblemon spawn influence conditions"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
          <p className="text-xs opacity-50 italic px-2 py-1">Credit: doctor</p>
        </div>
      </section>

      {/* External Resources Section */}
      <section className="space-y-3">
        <h2 className="font-semibold">Additional Spawn Resources</h2>
        <p className="text-gray-300">
          If you want to explore spawn data in more detail, here are two useful
          resources:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>
            📊{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/16JrrEp919HVn8YE0AtmeAu6_tPkMkKqEmRzMlKW442A/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Official Cobblemon Spawn Spreadsheet
            </a>{" "}
            — shows spawns for the <strong>base Cobblemon mod</strong>.
          </li>
          <li>
            📖{" "}
            <a
              href="https://www.lumyverse.com/cobbleverse/all-pokemon-in-cobbleverse/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Official COBBLEVERSE Wiki
            </a>{" "}
            — shows all spawns for the <strong>COBBLEVERSE modpack</strong>.
          </li>
          <li>
            🔍{" "}
            <a
              href="https://cobble-toolkit.vercel.app/spawn-scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Cobble Toolkit Spawn Scanner
            </a>{" "}
            — scans Pokémon spawns directly from{" "}
            <strong>datapacks like Cobbleverse</strong>, so you can see the
            custom spawns added in this modpack in detail.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <div className="p-4 text-gray-300 border-t border-gray-700 space-y-2">
        <p>
          💬 Still stuck? Join the{" "}
          <a
            href="https://discord.lumy.fun/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            LUMYVERSE Discord server
          </a>{" "}
          to ask questions and share discoveries.
        </p>
        <p>
          📖 Check the{" "}
          <a
            href="https://www.lumyverse.com/cobbleverse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Cobbleverse Wiki
          </a>{" "}
          for official documentation and updates.
        </p>
      </div>
    </div>
  );
}

/* === REUSABLE COMPONENTS === */
function ImageCarousel({ images }) {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [fullscreen, setFullscreen] = useState(null);

  useEffect(() => {
    if (!fullscreen) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setFullscreen(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  useEffect(() => {
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
        className="relative overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none w-full h-64 sm:h-80 md:h-96"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div className="flex-[0_0_100%] h-full" key={idx}>
              <button
                className="relative h-full w-full overflow-hidden rounded-2xl"
                onClick={() => setFullscreen(img)}
                aria-label="Open image in fullscreen"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
                  <span className="font-medium">Credit:</span> {img.credit}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

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

function CobbleCuisineSlider() {
  const images = [
    {
      src: "/guides/cobblecuisine-1.png",
      alt: "CobbleCuisine food buffs",
      credit: "CobbleCuisine, maru",
    },
    {
      src: "/guides/cobblecuisine-2.png",
      alt: "CobbleCuisine",
      credit: "CobbleCuisine, maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function DatapackNavigationSlider() {
  const images = [
    {
      src: "/guides/spawnrate-1.png",
      alt: "Spawnrate",
      credit: "maru",
    },
    {
      src: "/guides/spawnrate-2.png",
      alt: "Spawnrate",
      credit: "maru",
    },
    {
      src: "/guides/spawnrate-3.png",
      alt: "Spawnrate",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}

function ExportSpawnConfig() {
  const images = [
    {
      src: "/guides/spawnrate-4.png",
      alt: "Spawnrate",
      credit: "maru",
    },
    {
      src: "/guides/spawnrate-5.png",
      alt: "Spawnrate",
      credit: "maru",
    },
  ];
  return <ImageCarousel images={images} />;
}
