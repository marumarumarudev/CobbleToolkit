import React from "react";
import ImageWithFullscreen from "./ClientPage";
import Spoiler from "../../../../components/Spoiler";

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
            <li>
              <a
                href="https://www.lumyverse.com/cobbleverse/sinnoh-gyms-leaders/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Sinnoh Gym Leaders
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

      {/* Pokemon Teams Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-white">Pokemon Teams</h2>
        <p className="text-gray-300 mb-6">
          Click on any region below to reveal its trainers, then click on
          individual trainers to see their Pokemon teams.
        </p>

        {/* Kanto Region */}
        <div className="mb-6">
          <Spoiler title="Kanto Region">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-lg p-4 border border-red-500/30">
                <p className="text-gray-300 text-sm">
                  The first region featuring 8 Gym Leaders, Elite 4, and
                  Champion
                </p>
              </div>

              {/* Kanto Gym Leaders */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">
                  Kanto Gym Leaders
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Brock - Rock Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Rock Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Geodude", "Bonsly", "Onix", "Cranidos"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-gray-700 rounded-lg p-3 text-center"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Misty - Water Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Water Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Horsea", "Starmie", "Psyduck", "Goldeen"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-blue-600/20 rounded-lg p-3 text-center border border-blue-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Lt. Surge - Electric Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Electric Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Raichu", "Magnezone", "Electabuzz", "Boltund"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-yellow-600/20 rounded-lg p-3 text-center border border-yellow-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Erika - Grass Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Grass Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          "Roserade",
                          "Bellossom",
                          "Victreebel",
                          "Vileplume",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-green-600/20 rounded-lg p-3 text-center border border-green-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Koga - Poison Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Poison Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Crobat",
                          "Weezing",
                          "Venomoth",
                          "Drapion",
                          "Toxtricity",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-purple-600/20 rounded-lg p-3 text-center border border-purple-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Sabrina - Psychic Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Psychic Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Hatterene", "Mr. Mime", "Alakazam", "Rapidash"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-pink-600/20 rounded-lg p-3 text-center border border-pink-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Blaine - Fire Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fire Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Torkoal",
                          "Arcanine",
                          "Magmortar",
                          "Typhlosion",
                          "Magcargo",
                          "Charizard",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-red-600/20 rounded-lg p-3 text-center border border-red-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Giovanni - Ground Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ground Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Rhyperior",
                          "Tyranitar",
                          "Persian",
                          "Nidoking",
                          "Nidoqueen",
                          "Mewtwo",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-amber-600/20 rounded-lg p-3 text-center border border-amber-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Kanto Elite 4 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">
                  Kanto Elite 4
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Lorelei - Ice Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ice Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Glastrier",
                          "Froslass",
                          "Jynx",
                          "Mamoswine",
                          "Lapras",
                          "Weavile",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-cyan-600/20 rounded-lg p-3 text-center border border-cyan-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Bruno - Fighting Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fighting Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Hariyama",
                          "Machamp",
                          "Hitmontop",
                          "Hitmonchan",
                          "Hitmonlee",
                          "Lucario",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-orange-600/20 rounded-lg p-3 text-center border border-orange-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Agatha - Ghost Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ghost Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Banette",
                          "Spiritomb",
                          "Dusknoir",
                          "Flutter Mane",
                          "Houndstone",
                          "Gengar",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-indigo-600/20 rounded-lg p-3 text-center border border-indigo-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Lance - Dragon Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Dragon Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Aerodactyl",
                          "Gyarados",
                          "Baxcalibur",
                          "Salamence",
                          "Dragonite",
                          "Tyrantrum",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-violet-600/20 rounded-lg p-3 text-center border border-violet-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Kanto Champion */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Kanto Champion
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Blue - Kanto Champion">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">Champion Team</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Zapdos",
                          "Articuno",
                          "Moltres",
                          "Mew",
                          "Venusaur",
                          "Ditto",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-3 text-center border border-yellow-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>
            </div>
          </Spoiler>
        </div>

        {/* Johto Region */}
        <div className="mb-6">
          <Spoiler title="Johto Region">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-gray-300 text-sm">
                  The second region featuring 8 Gym Leaders, Elite 4, and
                  Champion. Gym Leader names are in Italian due to copyright
                  requirements.
                </p>
              </div>

              {/* Johto Gym Leaders */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">
                  Johto Gym Leaders
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Valerio - Flying Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Flying Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Hoothoot", "Pidgeotto", "Corvisquire", "Gligar"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-blue-400/20 rounded-lg p-3 text-center border border-blue-300/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Raffaello - Bug Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Bug Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Butterfree", "Beedrill", "Heracross", "Scyther"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-green-600/20 rounded-lg p-3 text-center border border-green-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Chiara - Normal Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Normal Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Miltank", "Clefairy", "Lopunny", "Lickitung"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-gray-400/20 rounded-lg p-3 text-center border border-gray-300/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Angelo - Ghost Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ghost Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Dusknoir",
                          "Sableye",
                          "Gengar",
                          "Mismagius",
                          "Golurk",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-indigo-600/20 rounded-lg p-3 text-center border border-indigo-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Furio - Fighting Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fighting Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Sawk",
                          "Throh",
                          "Hariyama",
                          "Primeape",
                          "Poliwrath",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-orange-600/20 rounded-lg p-3 text-center border border-orange-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Jasmine - Steel Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Steel Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Bronzong",
                          "Steelix",
                          "Metagross",
                          "Skarmory",
                          "Magnezone",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gray-700/20 rounded-lg p-3 text-center border border-gray-600/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Alfredo - Ice Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ice Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Mamoswine",
                          "Vanilluxe",
                          "Avalugg",
                          "Dewgong",
                          "Jynx",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-cyan-600/20 rounded-lg p-3 text-center border border-cyan-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Sandra - Dragon Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Dragon Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Gyarados",
                          "Kingdra",
                          "Dragonite",
                          "Altaria",
                          "Garchomp",
                          "Salamence",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-violet-600/20 rounded-lg p-3 text-center border border-violet-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Johto Elite 4 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">
                  Johto Elite 4
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Pino - Psychic Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Psychic Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Xatu",
                          "Gardevoir",
                          "Grumpig",
                          "Slowking",
                          "Exeggutor",
                          "Indeedee",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-pink-600/20 rounded-lg p-3 text-center border border-pink-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Koga - Poison Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Poison Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Naganadel",
                          "Beedrill",
                          "Crobat",
                          "Skuntank",
                          "Venomoth",
                          "Toxicroak",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-purple-600/20 rounded-lg p-3 text-center border border-purple-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Bruno - Fighting Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fighting Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Pangoro",
                          "Machamp",
                          "Hitmontop",
                          "Hitmonchan",
                          "Hitmonlee",
                          "Lucario",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-orange-600/20 rounded-lg p-3 text-center border border-orange-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Karen - Dark Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Dark Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Absol",
                          "Houndoom",
                          "Spiritomb",
                          "Umbreon",
                          "Weavile",
                          "Honchkrow",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gray-800/20 rounded-lg p-3 text-center border border-gray-700/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Johto Champion */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Johto Champion
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Lance - Johto Champion">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">Champion Team</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Aerodactyl",
                          "Gyarados",
                          "Baxcalibur",
                          "Salamence",
                          "Dragonite",
                          "Lugia",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-3 text-center border border-yellow-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>
            </div>
          </Spoiler>
        </div>

        {/* Hoenn Region */}

        <div className="mb-6">
          <Spoiler title="Hoenn Region">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-lg p-4 border border-green-500/30">
                <p className="text-gray-300 text-sm">
                  The third region featuring 8 Gym Leaders, Elite 4, and
                  Champion. Gym Leader names are in Italian due to copyright
                  requirements.
                </p>
              </div>

              {/* Hoenn Gym Leaders */}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">
                  Hoenn Gym Leaders
                </h3>

                <div className="grid gap-3">
                  <Spoiler title="Petra - Rock Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Rock Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Geodude", "Onix", "Omanyte", "Nosepass"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-gray-600/20 rounded-lg p-3 text-center border border-gray-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Rudi - Fighting Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fighting Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Conkeldurr", "Hariyama", "Heracross", "Machamp"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-orange-600/20 rounded-lg p-3 text-center border border-orange-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Walter - Electric Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Electric Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          "Toxtricity",
                          "Zebstrika",
                          "Manectric",
                          "Ampharos",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-yellow-500/20 rounded-lg p-3 text-center border border-yellow-400/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Fiammetta - Fire Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fire Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Magcargo", "Houndoom", "Camerupt", "Rapidash"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-red-600/20 rounded-lg p-3 text-center border border-red-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Norman - Normal Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Normal Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Spinda",
                          "Slaking",
                          "Kangaskhan",
                          "Blissey",
                          "Linoone",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gray-400/20 rounded-lg p-3 text-center border border-gray-300/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Alice - Flying Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Flying Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Altaria",
                          "Tropius",
                          "Skarmory",
                          "Pelipper",
                          "Noctowl",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-blue-400/20 rounded-lg p-3 text-center border border-blue-300/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Tell & Pat - Psychic Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Psychic Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Solrock",
                          "Lunatone",
                          "Gallade",
                          "Gardevoir",
                          "Claydol",
                          "Gothitelle",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-pink-600/20 rounded-lg p-3 text-center border border-pink-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Adriano - Water Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Water Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Gyarados",
                          "Tentacruel",
                          "Milotic",
                          "Swampert",
                          "Ludicolo",
                          "Wailord",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-blue-600/20 rounded-lg p-3 text-center border border-blue-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Hoenn Elite 4 */}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">
                  Hoenn Elite 4
                </h3>

                <div className="grid gap-3">
                  <Spoiler title="Fosco - Dark Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Dark Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Mightyena",
                          "Shiftry",
                          "Zoroark",
                          "Crawdaunt",
                          "Zangoose",
                          "Absol",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gray-800/20 rounded-lg p-3 text-center border border-gray-700/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Ester - Ghost Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ghost Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Dusknoir",
                          "Chandelure",
                          "Banette",
                          "Drifblim",
                          "Gengar",
                          "Trevenant",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-indigo-600/20 rounded-lg p-3 text-center border border-indigo-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Frida - Ice Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ice Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Glalie",
                          "Froslass",
                          "Beartic",
                          "Abomasnow",
                          "Aurorus",
                          "Baxcalibur",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-cyan-600/20 rounded-lg p-3 text-center border border-cyan-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Drake - Dragon Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Dragon Type Specialist
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Flygon",
                          "Dragalge",
                          "Goodra",
                          "Drampa",
                          "Salamence",
                          "Hydreigon",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-violet-600/20 rounded-lg p-3 text-center border border-violet-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Hoenn Champion */}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Hoenn Champion
                </h3>

                <div className="grid gap-3">
                  <Spoiler title="Rocco - Hoenn Champion">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">Champion Team</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Kyogre",
                          "Groudon",
                          "Latias",
                          "Latios",
                          "Deoxys",
                          "Metagross",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-3 text-center border border-yellow-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>
            </div>
          </Spoiler>
        </div>

        {/* Sinnoh Region */}
        <div className="mb-6">
          <Spoiler title="Sinnoh Region">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                <p className="text-gray-300 text-sm">
                  The fourth region featuring 8 Gym Leaders, Elite 4, and
                  Champion. Gym Leader names are in Italian due to copyright
                  requirements.
                </p>
              </div>

              {/* Sinnoh Gym Leaders */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">
                  Sinnoh Gym Leaders
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Pedro - Rock Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Rock Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Onix", "Probopass", "Relicanth", "Rampardos"].map(
                          (pokemon) => (
                            <div
                              key={pokemon}
                              className="bg-gray-600/20 rounded-lg p-3 text-center border border-gray-500/30"
                            >
                              <span className="text-white font-medium">
                                {pokemon}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Gardenia - Grass Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Grass Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Sunflora",
                          "Cherrim",
                          "Breloom",
                          "Torterra",
                          "Roserade",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-green-600/20 rounded-lg p-3 text-center border border-green-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Marzia - Fighting Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fighting Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Hitmontop",
                          "Heracross",
                          "Infernape",
                          "Medicham",
                          "Lucario",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-orange-600/20 rounded-lg p-3 text-center border border-orange-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Omar - Water Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Water Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Politoed",
                          "Kingdra",
                          "Ludicolo",
                          "Huntail",
                          "Gyarados",
                          "Floatzel",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-blue-600/20 rounded-lg p-3 text-center border border-blue-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Fannie - Ghost Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ghost Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Drifblim",
                          "Banette",
                          "Dusknoir",
                          "Mismagius",
                          "Froslass",
                          "Gengar",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-indigo-600/20 rounded-lg p-3 text-center border border-indigo-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Ferruccio - Steel Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Steel Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Skarmory",
                          "Steelix",
                          "Magnezone",
                          "Empoleon",
                          "Aggron",
                          "Bastiodon",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gray-700/20 rounded-lg p-3 text-center border border-gray-600/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Bianca - Ice Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ice Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Abomasnow",
                          "Jynx",
                          "Mamoswine",
                          "Froslass",
                          "Glaceon",
                          "Weavile",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-cyan-600/20 rounded-lg p-3 text-center border border-cyan-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Corrado - Electric Type Gym Leader">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Electric Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {[
                          "Pelipper",
                          "Raichu",
                          "Luxray",
                          "Lanturn",
                          "Jolteon",
                          "Electivire",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-yellow-600/20 rounded-lg p-3 text-center border border-yellow-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Sinnoh Elite 4 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">
                  Sinnoh Elite 4
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Aaron - Bug Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Bug Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Dustox",
                          "Beautifly",
                          "Vespiquen",
                          "Heracross",
                          "Drapion",
                          "Yanmega",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-green-600/20 rounded-lg p-3 text-center border border-green-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Terrie - Ground Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Ground Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Quagsire",
                          "Sudowoodo",
                          "Golem",
                          "Whiscash",
                          "Hippowdon",
                          "Gastrodon",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-amber-600/20 rounded-lg p-3 text-center border border-amber-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Vulcano - Fire Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Fire Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Rapidash",
                          "Steelix",
                          "Drifblim",
                          "Lopunny",
                          "Infernape",
                          "Magmortar",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-red-600/20 rounded-lg p-3 text-center border border-red-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>

                  <Spoiler title="Luciano - Psychic Type Elite 4">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Psychic Type Specialist
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Mr. Mime",
                          "Girafarig",
                          "Bronzong",
                          "Alakazam",
                          "Medicham",
                          "Gallade",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-pink-600/20 rounded-lg p-3 text-center border border-pink-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>

              {/* Sinnoh Champion */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                  Sinnoh Champion
                </h3>
                <div className="grid gap-3">
                  <Spoiler title="Camilla - Sinnoh Champion">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">Champion Team</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Spiritomb",
                          "Porygon-Z",
                          "Togekiss",
                          "Lucario",
                          "Milotic",
                          "Garchomp",
                        ].map((pokemon) => (
                          <div
                            key={pokemon}
                            className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg p-3 text-center border border-yellow-500/30"
                          >
                            <span className="text-white font-medium">
                              {pokemon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Spoiler>
                </div>
              </div>
            </div>
          </Spoiler>
        </div>
      </section>
    </div>
  );
}
