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
        </ul>
        {/* Department Store carousel */}
        <div className="mt-4">
          <DepartmentStoreSlider />
        </div>
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

      <section className="space-y-3">
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
