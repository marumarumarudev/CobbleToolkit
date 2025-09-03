"use client";

import Image from "next/image";
import React from "react";

export default function FarmingGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cobbleverse Farming Guide</h1>
      <p className="text-gray-300">
        A quick scuffed guide on farming in Cobbleverse.
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold">Community Guide</h2>
        <p className="text-gray-300">
          Shoutout to <span className="font-bold">azera</span> for making a
          helpful video on basic Cobbleverse farms. Watch it here:
        </p>
        <a
          href="https://youtu.be/JY5MJzGRBWY?si=CAabRy9eWZNoqZJg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Cobbleverse Basic Farms (YouTube)
        </a>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Pasture Loot Mod</h2>
        <p className="text-gray-300">
          The{" "}
          <a
            href="https://modrinth.com/mod/cobblemon-pasture-loot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Pasture Loot
          </a>{" "}
          mod allows farming of Pokémon drops. Wild Pokémon you{" "}
          <strong>defeat in battle</strong> will drop their items. Those same
          items are also dropped when you <strong>catch them</strong> and place
          them inside a{" "}
          <span className="font-medium text-yellow-300">Pasture Block</span>.
        </p>
        <p className="text-gray-300">
          Pokémon in the Pasture Block will occasionally drop their natural
          items automatically, letting you farm resources (like{" "}
          <strong>Gimmighoul Coins</strong>) over time.
        </p>
        <p className="text-gray-300">🔗 Use these resources to check drops:</p>
        <ul className="list-disc list-inside pl-4 space-y-1 text-blue-400">
          <li>
            <a
              href="https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Drops"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Cobblemon Drops Wiki
            </a>
          </li>
          <li>
            <a href="/loot-scanner" className="underline">
              My Loot Scanner tool (for datapacks)
            </a>
          </li>
        </ul>

        {/* Static image with credit */}
        <div className="relative mt-4 h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/guides/pasture-loot.webp"
            alt="Pasture Block farming"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur text-center px-3 py-2 text-sm text-gray-100">
            <span className="font-medium">Credit:</span> Pasture Loot
          </div>
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
