import React from "react";
import ImageWithFullscreen from "./ClientPage";

export const metadata = {
  title: "Gym Leaders | CobbleToolkit",
  description: "Guide on how to find Gym Leaders in COBBLEVERSE",
};

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
      </section>

      {/* Alternative Method */}
      <section>
        <h2 className="cursor-pointer font-semibold">
          Alternative — Using the Trainer Spawner
        </h2>
        <div className="p-4 text-gray-300">
          <p>
            Alternatively, if you don’t want to explore to look for gym leaders,
            you can craft an item called{" "}
            <span className="font-medium">Trainer Spawner</span>. Place the{" "}
            <span className="font-medium">Item to Spawn</span> inside the
            spawner, and it will summon the gym leader{" "}
            <span className="font-medium">on top of the Trainer Spawner</span>.
          </p>
        </div>
      </section>

      {/* Commands */}
      <section>
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
