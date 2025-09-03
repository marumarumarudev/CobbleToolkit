"use client";

import Image from "next/image";
import React from "react";

function ImageWithFullscreen({ src, alt, credit }) {
  const [fullscreen, setFullscreen] = React.useState(false);

  React.useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  React.useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  return (
    <div className="mt-3 space-y-2">
      <button
        className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-lg cursor-pointer select-none"
        onClick={() => setFullscreen(true)}
        aria-label="Open image fullscreen"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur px-3 py-2 text-sm text-gray-100">
          <span className="font-medium">Credit:</span> {credit}
        </div>
      </button>

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreen(false)}
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
              onClick={() => setFullscreen(false)}
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
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 80vw, 100vw"
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

export default function GymLeadersGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Locating Gym Leaders</h1>
      <p className="text-gray-300">
        Here’s how to find gym leaders in{" "}
        <span className="font-semibold">Cobbleverse</span>. You can also check
        the official guide at{" "}
        <a
          href="https://www.lumyverse.com/cobbleverse/how-to-find-gyms/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          LUMYVERSE
        </a>
        .
      </p>

      {/* Step 1 */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Step 1 — Place down your Cartography Table
        </h2>
        <div className="p-4 text-gray-300">
          <p>
            Use the{" "}
            <span className="font-medium">
              Kanto / Johto / Hoenn Cartography Table
            </span>{" "}
            depending on the region you’re in.
          </p>
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Step 2 — Find the Item to Spawn for each Gym
        </h2>
        <div className="p-4 text-gray-300 space-y-2">
          <p>Visit the official gym leader lists for the item references:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <a
                href="https://www.lumyverse.com/cobbleverse/kanto-gym-leaders/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Kanto Gym Leaders
              </a>
            </li>
            <li>
              <a
                href="https://www.lumyverse.com/cobbleverse/johto-gym-leaders/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Johto Gym Leaders
              </a>
            </li>
            <li>
              <a
                href="https://www.lumyverse.com/cobbleverse/hoenn-gyms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Hoenn Gym Leaders
              </a>
            </li>
          </ul>
          <ImageWithFullscreen
            src="/guides/item-to-spawn.png"
            alt="Example of Item to Spawn in cartography table"
            credit="COBBLEVERSE"
          />
        </div>
      </section>

      {/* Step 3 */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Step 3 — Use the Item in the Cartography Table
        </h2>
        <div className="p-4 text-gray-300">
          <p>
            Place the item in the cartography table. It works like a furnace —
            after a while, you’ll get a{" "}
            <span className="font-medium">map to the gym</span>.
          </p>
          <ImageWithFullscreen
            src="/guides/map-crafting.jpg"
            alt="Cartography table generating a gym map"
            credit="COBBLEVERSE"
          />
        </div>
      </section>

      {/* Step 4 */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Step 4 — Using Cartography Tables in Other Dimensions
        </h2>
        <div className="p-4 text-gray-300">
          <p>
            If a gym leader is in another dimension (e.g., Nether), place the
            cartography table{" "}
            <span className="font-medium">inside that dimension</span> before
            using the item.
          </p>
        </div>
      </section>

      {/* Step 5 */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Step 5 — Locating the League Tower
        </h2>
        <div className="p-4 text-gray-300">
          <p>
            To find the Elite 4 / League Tower, use the{" "}
            <span className="font-medium">Champion’s Item to Spawn</span> in a
            cartography table. This will generate a{" "}
            <span className="font-medium">map to the League Tower</span>.
          </p>
          <p className="text-xs opacity-50 italic">
            Use <code>Life Orb</code> for Kanto League because Wiki doesn’t tell
            you what it is for some reason.
          </p>
          <ImageWithFullscreen
            src="/guides/champion-item.png"
            alt="Champion's Item"
            credit="COBBLEVERSE"
          />
        </div>
        <p className="text-xs opacity-50 italic">
          If you’d prefer to use commands to locate them, just type:
          <br />
          <br />
          <code>/locate structure cobbleverse:gym leader name</code>
          <br />
          or
          <br />
          <code>/locate structure cobbleverse:kanto_league</code>
          <br />
          <br />
          Remember to have cheats enabled in your world or to be an operator on
          a server.
          <br />
          <br />
          The Gym Leaders names are in Italian, due to the modpack’s copyright
          requirements.
        </p>
      </section>
    </div>
  );
}
