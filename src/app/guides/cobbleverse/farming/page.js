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

      {/* EXP Farming */}
      <section className="space-y-3">
        <h2 className="font-semibold">Farming Pokémon EXP</h2>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
          <li>
            Battle <strong>wild Pokémon</strong> and{" "}
            <strong>trainer NPCs</strong>. Make sure your{" "}
            <strong>Trainer Card</strong> is in your inventory (not in a
            backpack or chest) so trainers spawn around you.
          </li>
          <li>
            Loot <strong>structures</strong> for <strong>EXP Candies</strong>{" "}
            and <strong>Rare Candies</strong>.
          </li>
          <li>
            You can <strong>buy EXP Candies</strong> in{" "}
            <strong>Department Stores</strong>. See the{" "}
            <a
              href="/guides/cobbleverse/items"
              className="text-blue-400 underline"
            >
              Items Guide
            </a>{" "}
            for where to find them.
          </li>
        </ul>
      </section>

      {/* CobbleDollars */}
      <section className="space-y-3">
        <h2 className="font-semibold">How to Farm CobbleDollars</h2>
        <ul className="list-disc list-inside pl-4 space-y-2 text-gray-300">
          <li>
            <strong>Trainer & Wild Battles:</strong> Battling Pokémon and
            trainer NPCs gives CobbleDollars. Higher-level trainers reward more.
          </li>
          <li>
            <strong>Relic Coin Farming (Pasture Loot):</strong> If you built a{" "}
            <span className="text-yellow-300">Gimmighoul farm</span>, you’ll get{" "}
            <code>relic_coin</code>. Convert these into{" "}
            <code>relic_coin_pouch</code> and then <code>relic_coin_sack</code>{" "}
            for maximum profit.
            <br />
            💰 <em>(Prices: Coin = 50, Pouch = 475, Sack = 4500)</em>
          </li>
          <li>
            <strong>Villager Trading:</strong> Trade renewable resources for
            Emeralds, then convert Emeralds into Blocks for profit (emerald
            block sells high in bank.json).
          </li>
          <li>
            <strong>Infinite String Farms:</strong> If your server allows{" "}
            <span className="text-red-300">string dupers</span>, you can trade
            strings to Fisherman villagers for Emeralds → Blocks →
            CobbleDollars.
          </li>
          <li>
            <strong>Potions & Vitamins:</strong> Sell potions, revives and
            vitamins (hp_up, protein, etc.) — they’re in the default bank.json
            and can be consistent revenue.
          </li>
        </ul>

        <p className="text-gray-300">
          ⚖️ <span className="font-semibold">Recommended priority:</span> Relic
          Coin farms &gt; String duper trades &gt; Villager stick/emerald
          trading &gt; Selling potions/vitamins.
        </p>

        {/* New subsection: Where to find bank.json */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <h3 className="font-semibold">
            Find & edit <code>bank.json</code>
          </h3>
          <p className="text-gray-300">
            Location (your Minecraft/modpack installation folder):
          </p>
          <pre className="bg-gray-900 text-xs text-gray-200 p-3 rounded overflow-auto">
            <code>
              {`<installation_folder> / config / cobbledollars / bank.json`}
            </code>
          </pre>

          <ol className="list-decimal list-inside pl-4 space-y-2 text-gray-300">
            <li>
              <strong>Stop the game / server</strong> before editing (changes
              must be applied on restart).
            </li>
            <li>
              <strong>Backup</strong> the original file (copy `bank.json` to
              `bank.json.bak`).
            </li>
            <li>
              Open <code>bank.json</code> with a text editor (VS Code, Notepad++
              or similar).
            </li>
            <li>
              Edit the <code>bank</code> array — change item entries, add or
              remove items, or change prices. Make sure the JSON stays valid.
            </li>
            <li>
              Save the file and restart your game or server. If on a hosted
              server, restart the server so changes take effect.
            </li>
          </ol>

          <p className="text-gray-300">
            Example: here’s the default `bank` array (drop this into your
            <code> bank.json</code> if you want to restore defaults):
          </p>

          <pre className="bg-gray-900 text-xs text-gray-200 p-3 rounded overflow-auto">
            <code>
              {`{
  "bank": [
    {"item":"minecraft:emerald","price":750},
    {"item":"minecraft:emerald_block","price":7000},
    {"item":"cobblemon:relic_coin","price":50},
    {"item":"cobblemon:relic_coin_pouch","price":475},
    {"item":"cobblemon:relic_coin_sack","price":4500},
    {"item":"cobblemon:potion","price":50},
    {"item":"cobblemon:super_potion","price":175},
    {"item":"cobblemon:hyper_potion","price":375},
    {"item":"cobblemon:max_potion","price":625},
    {"item":"cobblemon:full_restore","price":750},
    {"item":"cobblemon:ether","price":300},
    {"item":"cobblemon:max_ether","price":500},
    {"item":"cobblemon:elixir","price":750},
    {"item":"cobblemon:max_elixir","price":1125},
    {"item":"cobblemon:revive","price":500},
    {"item":"cobblemon:max_revive","price":1000},
    {"item":"cobblemon:hp_up","price":2500},
    {"item":"cobblemon:protein","price":2500},
    {"item":"cobblemon:iron","price":2500},
    {"item":"cobblemon:calcium","price":2500},
    {"item":"cobblemon:zinc","price":2500},
    {"item":"cobblemon:carbos","price":2500},
    {"item":"cobblemon:pp_up","price":2500},
    {"item":"cobblemon:pp_max","price":3500},
    {"item":"lumymon:glacier_feather","price":5000},
    {"item":"lumymon:thunder_feather","price":5000},
    {"item":"lumymon:ember_feather","price":5000},
    {"item":"lumymon:soul_feather","price":30000}
  ]
}`}
            </code>
          </pre>

          <p className="text-xs opacity-70 italic text-gray-300">
            Tip: Keep price units as plain numbers (no commas). If you mess up,
            restore from the `.bak` copy and restart.
          </p>

          {/* Static image */}
          <div className="relative mt-4 h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/guides/bank.png"
              alt="CobbleDollars bank screen"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur text-center px-3 py-2 text-sm text-gray-100">
              CobbleDollars merchant bank UI
            </div>
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
