"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";
import React from "react";

export default function ItemsGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Where to Get Items?</h1>
      <p className="text-gray-300">
        In Cobbleverse, mobs are disabled by default. Here’s how you can obtain
        items that are usually mob drops, as well as where to find special or
        gimmick items.
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold">Mob Drops</h2>
        <p className="text-gray-300">
          You may notice there are no mobs spawning in the modpack. This is
          because the <code>MobsBeGone</code> mod removes them.
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            <strong>Option A:</strong> Remove the <code>MobsBeGone</code> mod
            from your modlist to re-enable mobs.
          </li>
          <li>
            <strong>Option B:</strong> Visit <strong>Department Stores</strong>{" "}
            in large villages. These often sell mob drop items directly.
          </li>
          <li>
            <strong>Option C:</strong> Visit{" "}
            <a
              href="https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Drops"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Cobblemon Pokémon Drops
            </a>
            . This covers drops from the base Cobblemon mod only and does not
            include datapacks.
          </li>
          <li>
            <strong>Option D:</strong> Visit my{" "}
            <a href="/loot-scanner" className="underline">
              loot scanner tool
            </a>{" "}
            and drag & drop your datapacks to see their loot tables.
          </li>
        </ul>
        {/* Department Store carousel */}
        <div className="mt-4">
          <DepartmentStoreSlider />
        </div>
        <p className="text-xs text-center opacity-50 italic">
          Use <code>/locate structure bca:village/large</code>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Special Items</h2>
        <p className="text-gray-300">
          Many unique Cobbleverse items can be found in department stores,
          structures, or through crafting. Use the links below for full lists:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-blue-400">
          <li>
            <a
              href="https://www.lumyverse.com/cobbleverse/special-items-where-find-them/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Special Items – Where to Find Them
            </a>
          </li>
          <li>
            <a
              href="https://www.lumyverse.com/cobbleverse/craft-cobbleverse-items/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Crafting Cobbleverse Items
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="font-semibold">Gimmick Items</h2>
        <p className="text-gray-300">
          Items like <strong>Mega Stones</strong>, <strong>Keystones</strong>,
          and <strong>Wishing Stars</strong> are available in Cobbleverse.
        </p>
        <p className="text-gray-300">
          A detailed community-maintained resource can be found here:
        </p>
        <a
          href="https://megashowdown.miraheze.org/wiki/Main_Page"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Mega Showdown Wiki
        </a>

        {/* Keystone & Blank Megastone */}
        <div className="space-y-2 mt-5">
          <h3 className="font-medium">
            Keystone & Blank Megastone (Mega Evolution)
          </h3>
          <FullscreenImage
            src="/guides/megaroid.png"
            alt="Keystone & Blank Megastone location"
            credit="doctor"
          />
        </div>

        {/* Sparkling Stone */}
        <div className="space-y-2">
          <h3 className="font-medium">Sparkling Stone → Z-Ring</h3>
          <p className="text-gray-300">
            Found in <strong>archaeological sites</strong> in deserts. Brush
            suspicious sands.
          </p>
          <ImageCarousel
            images={[
              {
                src: "/guides/sparkling-stone.png",
                alt: "Suspicious sand site",
                credit: "maru",
              },
              {
                src: "/guides/archaeological-site.png",
                alt: "Sparkling Stone in desert",
                credit: "Mega Showdown",
              },
            ]}
          />
        </div>

        {/* Blank Z-Crystal */}
        <div className="space-y-2">
          <h3 className="font-medium">Blank Z-Crystal</h3>
          <p className="text-gray-300">
            The <strong>Blank Z</strong> can be imbued with any type. It is the
            key ingredient for crafting <strong>Type Z Crystals</strong>. Found
            in <strong>Abandoned Observatories</strong>.
          </p>
          <FullscreenImage
            src="/guides/observatory.png"
            alt="Blank Z-Crystal in observatory"
            credit="Mega Showdown"
          />
        </div>

        {/* Wishing Star */}
        <div className="space-y-2">
          <h3 className="font-medium">Wishing Star</h3>
          <p className="text-gray-300">
            Obtain by mining a <strong>Wishing Star Crystal</strong> with a
            diamond pickaxe in a<strong> Wishing Weald</strong>.
          </p>
          <FullscreenImage
            src="/guides/wishing-weald.png"
            alt="Wishing Star crystal node"
            credit="Mega Showdown"
          />
        </div>

        {/* Tera Orb & Omni Ring */}
        <div className="space-y-2">
          <h3 className="font-medium">Tera Orb & Omni Ring</h3>
          <p className="text-gray-300">
            The <strong>Tera Orb</strong> is craftable. The{" "}
            <strong>Omni Ring</strong> is basically all gimmick recipes rolled
            into one item/equipment.
          </p>
          <ImageCarousel
            images={[
              {
                src: "/guides/tera-orb.png",
                alt: "Tera Orb",
                credit: "doctor",
              },
              {
                src: "/guides/omniring.png",
                alt: "Omni Ring",
                credit: "doctor",
              },
            ]}
          />
        </div>
      </section>

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
        className="relative overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none w-full h-64 sm:h-80 md:h-96"
        ref={emblaRef}
        aria-label="Image carousel. Swipe or scroll to navigate."
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  className="object-cover"
                  priority={idx === 0}
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

function DepartmentStoreSlider() {
  const images = [
    {
      src: "/guides/department-store-1.png",
      alt: "Department Store",
      credit: "doctor",
    },
    {
      src: "/guides/department-store-2.png",
      alt: "Department Store",
      credit: "doctor",
    },
    {
      src: "/guides/department-store-3.png",
      alt: "Department Store",
      credit: "doctor",
    },
  ];
  return <ImageCarousel images={images} />;
}

function FullscreenImage({ src, alt, credit }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg"
        onClick={() => setFullscreen(true)}
        aria-label="Open image fullscreen"
      >
        <Image src={src} alt={alt} fill className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
          <span className="font-medium">Credit:</span> {credit}
        </div>
      </button>

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="relative w-full max-w-6xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen"
              className="absolute top-2 right-2 z-10 rounded-md bg-black/60 hover:bg-black/70 text-white p-2"
            >
              ✕
            </button>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain rounded-lg"
            />
            <p className="absolute inset-x-0 bottom-2 mx-auto w-fit bg-black/50 backdrop-blur px-3 py-1 rounded text-gray-100 text-sm">
              <span className="font-medium">Credit:</span> {credit}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
